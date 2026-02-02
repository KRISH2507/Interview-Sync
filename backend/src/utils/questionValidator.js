export function normalizeQuestions(questions) {
  return questions.map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswerIndex,
    difficulty: q.difficulty || "medium",
    topic: q.topic || "general",
  }));
}
