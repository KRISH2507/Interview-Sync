export const generateMCQs = () => {
  return [
    {
      question: "What does REST stand for?",
      type: "mcq",
      options: [
        "Remote Execution Standard Tool",
        "Representational State Transfer",
        "Relational State Technique",
        "Request Execution Service"
      ],
      correctAnswer: 1
    },
    {
      question: "Which HTTP method updates data?",
      type: "mcq",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: 2
    },
    {
      question: "MongoDB is a ___ database",
      type: "mcq",
      options: ["Relational", "Graph", "NoSQL", "In-memory"],
      correctAnswer: 2
    },
    {
      question: "Which hook is used for state in React?",
      type: "mcq",
      options: ["useRef", "useEffect", "useState", "useMemo"],
      correctAnswer: 2
    },
    {
      question: "Which status code means success?",
      type: "mcq",
      options: ["404", "500", "201", "401"],
      correctAnswer: 2
    }
  ];
};
