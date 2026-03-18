
import fs from "fs";
import path from "path";
import axios from "axios";
import util from "util";
import { fileURLToPath } from "url";
import CodeSubmission from "../models/CodeSubmission.js";
import CodingAttempt from "../models/CodingAttempt.js";
import vm from "vm";
import { sendError, sendSuccess } from "../utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionBankPath = path.join(__dirname, "..", "..", "data", "codeQuestions.json");

function loadCodeQuestions() {
  const raw = fs.readFileSync(questionBankPath, "utf-8");
  const normalized = raw.replace(/^\uFEFF/, "").trim();
  const parsed = JSON.parse(normalized);
  return Array.isArray(parsed) ? parsed : [];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeOutput(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function extractFunctionName(sourceCode) {
  const functionMatch = sourceCode.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);
  if (functionMatch?.[1]) return functionMatch[1];

  const constArrowMatch = sourceCode.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
  if (constArrowMatch?.[1]) return constArrowMatch[1];

  return null;
}

function splitTopLevel(input) {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = null;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const prevChar = input[index - 1];

    if (quote) {
      current += char;
      if (char === quote && prevChar !== "\\") quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[" || char === "{" || char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === "]" || char === "}" || char === ")") {
      depth = Math.max(0, depth - 1);
      current += char;
      continue;
    }

    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseToken(rawToken) {
  const token = String(rawToken ?? "").trim();
  if (!token) return "";

  if (token === "true") return true;
  if (token === "false") return false;
  if (token === "null") return null;

  if (/^-?\d+(?:\.\d+)?$/.test(token)) {
    const parsedNumber = Number(token);
    if (!Number.isNaN(parsedNumber)) return parsedNumber;
  }

  try {
    return vm.runInNewContext(`(${token})`);
  } catch {
    return token;
  }
}

function parseInputArgs(rawInput) {
  const input = String(rawInput ?? "").trim();
  if (!input) return [];

  try {
    const parsed = vm.runInNewContext(`[${input}]`);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return splitTopLevel(input).map(parseToken);
  }
}

function parseExpectedValue(rawExpected) {
  return parseToken(rawExpected);
}

function stableSerialize(value) {
  if (typeof value === "string") return value;
  return util.inspect(value, { depth: 6, compact: true, breakLength: Infinity });
}

function deepEqual(left, right) {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (!deepEqual(left[index], right[index])) return false;
    }
    return true;
  }

  if (left && right && typeof left === "object" && typeof right === "object") {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    for (const key of leftKeys) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) return false;
      if (!deepEqual(left[key], right[key])) return false;
    }
    return true;
  }

  return false;
}

async function judgeJavaScriptSubmission({ code, testCases, functionNameHint }) {
  const logs = [];
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(stableSerialize).join(" ")),
      error: (...args) => logs.push(args.map(stableSerialize).join(" ")),
      warn: (...args) => logs.push(args.map(stableSerialize).join(" ")),
    },
    Buffer,
  };

  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);
  const script = new vm.Script(code, { displayErrors: true });
  script.runInContext(context, { timeout: 2000 });

  const functionName = functionNameHint || extractFunctionName(code);
  if (!functionName || typeof context[functionName] !== "function") {
    throw new Error("Submitted code must define a callable function");
  }

  const results = [];

  for (const testCase of testCases) {
    const args = parseInputArgs(testCase.input);
    const expectedValue = parseExpectedValue(testCase.output);

    let actualValue;
    try {
      const returnValue = context[functionName](...args);
      actualValue = returnValue instanceof Promise ? await returnValue : returnValue;
    } catch (error) {
      actualValue = `RuntimeError: ${error.message}`;
    }

    const passed = deepEqual(actualValue, expectedValue);

    results.push({
      input: String(testCase.input ?? ""),
      expected: stableSerialize(expectedValue),
      output: stableSerialize(actualValue),
      passed,
    });
  }

  return {
    results,
    logs,
  };
}

function getRuntimeMs(responseData) {
  const runTime = Number(responseData?.run?.time ?? 0);
  const compileTime = Number(responseData?.compile?.time ?? 0);
  const totalSeconds = runTime + compileTime;
  return Math.max(0, Math.round(totalSeconds * 1000));
}

function getExecutorConfig(language) {
  const config = {
    javascript: { runtime: "javascript", version: "18.15.0", fileName: "main.js" },
    python: { runtime: "python", version: "3.10.0", fileName: "main.py" },
    java: { runtime: "java", version: "15.0.2", fileName: "Main.java" },
    cpp: { runtime: "cpp", version: "10.2.0", fileName: "main.cpp" },
  };
  return config[language];
}


async function executeCode({ code, language, input }) {
  if (language === "javascript") {
    const logs = [];
    const appendLog = (...args) => {
      const line = args
        .map((value) =>
          typeof value === "string"
            ? value
            : util.inspect(value, { depth: 4, breakLength: Infinity, compact: true })
        )
        .join(" ");
      logs.push(line);
    };

    const sandbox = {
      console: {
        log: (...args) => appendLog(...args),
        error: (...args) => appendLog(...args),
        warn: (...args) => appendLog(...args),
      },
      input,
      Buffer,
    };

    sandbox.global = sandbox;
    sandbox.globalThis = sandbox;

    try {
      const context = vm.createContext(sandbox);
      const script = new vm.Script(code, { displayErrors: true });
      const result = script.runInContext(context, { timeout: 2000 });

      if (typeof result !== "undefined") {
        appendLog(result);
      }
    } catch (err) {
      throw new Error(err.message || "Execution failed");
    }

    return {
      output: normalizeOutput(logs.join("\n")) || "(no output)",
      runtime: 0,
    };
  }

  const executor = getExecutorConfig(language);
  if (!executor) {
    throw new Error("Unsupported language");
  }

  const endpoint = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston/execute";
  const payload = {
    language: executor.runtime,
    version: executor.version,
    files: [{ name: executor.fileName, content: code }],
    stdin: input || "",
  };

  const { data } = await axios.post(endpoint, payload, {
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  const compileOutput = data?.compile?.output || data?.compile?.stderr || "";
  const runOutput = data?.run?.output || data?.run?.stdout || data?.run?.stderr || "";
  const output = `${compileOutput}${compileOutput && runOutput ? "\n" : ""}${runOutput}`;

  return {
    output: normalizeOutput(output) || "(no output)",
    runtime: getRuntimeMs(data),
  };
}

function toPublicQuestion(question) {
  return {
    id: question.id,
    title: question.title,
    description: question.description,
    difficulty: question.difficulty,
    topic: question.topic,
    examples: question.examples,
    constraints: question.constraints,
    starterCode: question.starterCode,
    testCases: question.testCases || [],
  };
}

export function getPublicRandomCodeQuestion(difficulty) {
  const questions = loadCodeQuestions();

  const filtered = difficulty
    ? questions.filter((q) => q.difficulty === String(difficulty).toLowerCase())
    : questions;

  if (filtered.length === 0) {
    return null;
  }

  return toPublicQuestion(shuffle(filtered)[0]);
}

export const getRandomCodeQuestion = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const randomQuestion = getPublicRandomCodeQuestion(difficulty);

    if (!randomQuestion) {
      return sendError(res, 404, "No coding questions found for selected difficulty");
    }

    return sendSuccess(res, 200, "Coding question fetched", {
      question: randomQuestion,
    });
  } catch (err) {
    console.error("getRandomCodeQuestion error:", err);
    return sendError(res, 500, "Failed to fetch coding question", { error: err.message });
  }
};

export const runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return sendError(res, 400, "code and language are required");
    }

    const result = await executeCode({ code, language, input });

    return sendSuccess(res, 200, "Code executed", {
      output: result.output,
      executionOutput: result.output,
      runtime: result.runtime,
    });
  } catch (err) {
    console.error("runCode error:", err?.response?.data || err);
    return sendError(res, 500, "Execution failed", { details: err.message });
  }
};

export const submitCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return sendError(res, 400, "questionId, code and language are required");
    }

    const questions = loadCodeQuestions();
    const question = questions.find((q) => String(q.id) === String(questionId));

    if (!question) {
      return sendError(res, 404, "Question not found");
    }

    const testCases = Array.isArray(question.testCases) ? question.testCases : [];
    if (testCases.length === 0) {
      return sendError(res, 400, "No test cases configured for this question");
    }

    const startedAt = Date.now();

    let results = [];
    if (language === "javascript") {
      try {
        const functionNameHint = question?.starterCode?.javascript
          ? extractFunctionName(question.starterCode.javascript)
          : null;
        const judged = await judgeJavaScriptSubmission({
          code,
          testCases,
          functionNameHint,
        });
        results = judged.results;
      } catch (judgeError) {
        const details = judgeError?.message || "Execution failed";
        results = testCases.map((testCase) => ({
          input: String(testCase.input ?? ""),
          expected: stableSerialize(parseExpectedValue(testCase.output)),
          output: `RuntimeError: ${details}`,
          passed: false,
        }));
      }
    } else {
      for (let index = 0; index < testCases.length; index += 1) {
        const testCase = testCases[index];
        const runResult = await executeCode({
          code,
          language,
          input: testCase.input,
        });

        const actual = normalizeOutput(runResult.output);
        const expected = normalizeOutput(testCase.output);
        const passed = actual === expected;

        results.push({
          input: String(testCase.input ?? ""),
          expected,
          output: actual,
          passed,
        });
      }
    }

    const passedCount = results.filter((item) => item.passed).length;
    const totalCount = results.length;
    const passedTests = passedCount;
    const failedTests = totalCount - passedCount;
    const totalRuntime = Date.now() - startedAt;
    const executionOutput = results.map((item, index) => ({
      testCase: index + 1,
      passed: item.passed,
      input: item.input,
      expected: item.expected,
      actual: item.output,
    }));

    await CodingAttempt.create({
      userId,
      questionId,
      title: question.title,
      difficulty: question.difficulty,
      language,
      passedCount,
      totalCount,
    });

    await CodeSubmission.create({
      userId,
      questionId,
      title: question.title,
      difficulty: question.difficulty,
      language,
      passedTests,
      totalTests: testCases.length,
      runtime: totalRuntime,
    });

    return sendSuccess(res, 200, "Code submitted", {
      results,
      passedCount,
      totalCount,
      passedTests,
      failedTests,
      totalTests: testCases.length,
      executionOutput,
      runtime: totalRuntime,
    });
  } catch (err) {
    console.error("submitCode error:", err?.response?.data || err);
    return sendError(res, 500, "Failed to submit code", { error: err.message });
  }
};
