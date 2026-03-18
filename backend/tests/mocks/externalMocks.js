import { jest } from "@jest/globals";

class InMemoryRedis {
  constructor() {
    this.kv = new Map();
    this.hashes = new Map();
    this.expiry = new Map();
  }

  reset() {
    this.kv.clear();
    this.hashes.clear();
    this.expiry.clear();
  }

  _isExpired(key) {
    const expiresAt = this.expiry.get(key);
    if (!expiresAt) return false;
    if (Date.now() <= expiresAt) return false;
    this.kv.delete(key);
    this.hashes.delete(key);
    this.expiry.delete(key);
    return true;
  }

  _setExpirySeconds(key, seconds) {
    if (!seconds || Number(seconds) <= 0) return;
    this.expiry.set(key, Date.now() + Number(seconds) * 1000);
  }

  _ttlSeconds(key) {
    this._isExpired(key);
    const expiresAt = this.expiry.get(key);
    if (!expiresAt) return -1;
    const left = Math.ceil((expiresAt - Date.now()) / 1000);
    return left > 0 ? left : -2;
  }

  async get(key) {
    this._isExpired(key);
    return this.kv.has(key) ? this.kv.get(key) : null;
  }

  async set(key, value, options = {}) {
    this._isExpired(key);

    if (options.NX && this.kv.has(key)) {
      return null;
    }

    this.kv.set(key, String(value));
    if (options.EX) {
      this._setExpirySeconds(key, options.EX);
    }
    return "OK";
  }

  async del(...keysOrArray) {
    const keys = Array.isArray(keysOrArray[0]) ? keysOrArray[0] : keysOrArray;
    let removed = 0;

    for (const key of keys) {
      if (this.kv.delete(key) || this.hashes.delete(key) || this.expiry.delete(key)) {
        removed += 1;
      }
    }

    return removed;
  }

  async incr(key) {
    this._isExpired(key);
    const current = Number(this.kv.get(key) || 0);
    const next = current + 1;
    this.kv.set(key, String(next));
    return next;
  }

  async expire(key, seconds) {
    this._isExpired(key);
    if (!this.kv.has(key) && !this.hashes.has(key)) return 0;
    this._setExpirySeconds(key, seconds);
    return 1;
  }

  async ttl(key) {
    if (!this.kv.has(key) && !this.hashes.has(key)) return -2;
    return this._ttlSeconds(key);
  }

  async hGetAll(key) {
    this._isExpired(key);
    return { ...(this.hashes.get(key) || {}) };
  }

  async hIncrBy(key, field, increment) {
    this._isExpired(key);
    const source = this.hashes.get(key) || {};
    const current = Number(source[field] || 0);
    const next = current + Number(increment || 0);
    source[field] = String(next);
    this.hashes.set(key, source);
    return next;
  }

  async hIncrByFloat(key, field, increment) {
    this._isExpired(key);
    const source = this.hashes.get(key) || {};
    const current = Number(source[field] || 0);
    const next = current + Number(increment || 0);
    source[field] = String(next);
    this.hashes.set(key, source);
    return next;
  }

  async info() {
    return "used_memory:1024\nused_memory_human:1K\nused_memory_peak_human:1K\n";
  }

  async scan(cursor, { MATCH = "*", COUNT = 100 } = {}) {
    const all = [...new Set([...this.kv.keys(), ...this.hashes.keys()])].filter((key) => {
      this._isExpired(key);
      if (MATCH === "*") return true;
      if (MATCH.endsWith("*")) {
        return key.startsWith(MATCH.slice(0, -1));
      }
      return key === MATCH;
    });

    const start = Number(cursor || 0);
    const end = Math.min(start + Number(COUNT || 100), all.length);
    const nextCursor = end >= all.length ? 0 : end;

    return {
      cursor: nextCursor,
      keys: all.slice(start, end),
    };
  }

  multi() {
    const operations = [];

    return {
      hIncrBy: (key, field, increment) => {
        operations.push(() => this.hIncrBy(key, field, increment));
        return this;
      },
      hIncrByFloat: (key, field, increment) => {
        operations.push(() => this.hIncrByFloat(key, field, increment));
        return this;
      },
      expire: (key, seconds) => {
        operations.push(() => this.expire(key, seconds));
        return this;
      },
      exec: async () => {
        for (const operation of operations) {
          await operation();
        }
        return [];
      },
    };
  }
}

export const mockRedis = new InMemoryRedis();

export const resetMockRedis = () => {
  mockRedis.reset();
};

export const getRedisOtpByEmail = async (email) => {
  const key = `auth:otp:register:${String(email || "").trim().toLowerCase()}`;
  const raw = await mockRedis.get(key);
  return raw ? JSON.parse(raw) : null;
};

export const mockEmailService = {
  sendOtpEmail: jest.fn().mockResolvedValue({ queued: true }),
};

export const mockAiQueue = {
  enqueueAiJob: jest.fn().mockResolvedValue({ id: "job_mock_1" }),
  getAiJobStatus: jest.fn().mockResolvedValue({
    id: "job_mock_1",
    state: "completed",
    returnvalue: { questions: [] },
  }),
};

export const mockInterviewAiService = {
  generateInterviewQuestions: jest.fn().mockResolvedValue([
    {
      question: "What is closure in JavaScript?",
      options: ["A", "B", "C", "D"],
      correctAnswerIndex: 0,
      difficulty: "medium",
      topic: "javascript",
    },
  ]),
};
