import { GoogleGenerativeAI } from "@google/generative-ai";
import { SUBJECT_LABELS } from "./userPreferences";

export interface GeminiQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  difficulty: string;
  explanation?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export const generateQuizQuestions = async (
  subjects: string[],
  difficulty: string = "intermediate",
  count: number = 10
): Promise<GeminiQuestion[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const subjectNames = subjects
      .map((s) => SUBJECT_LABELS[s as keyof typeof SUBJECT_LABELS])
      .join(", ");

    const subjectQuestionsPerSubject = Math.ceil(count / subjects.length);

    const prompt = `Generate exactly ${count} multiple choice questions for a computer science quiz.

Subject areas: ${subjectNames}
Difficulty level: ${difficulty}
Questions per subject: Distribute evenly across all subjects (${subjectQuestionsPerSubject} questions per subject approximately)

Requirements:
- Each question should have exactly 4 options
- Only one correct answer per question
- Questions should be ${difficulty} level appropriate
- Cover practical and theoretical aspects
- Include algorithms, concepts, and problem-solving
- Add brief explanation for the correct answer

CRITICAL: You must generate EXACTLY ${count} questions. No more, no less.

Format your response as a valid JSON array with this exact structure:
[
  {
    "question": "What is the time complexity of binary search?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    "correctAnswer": "O(log n)",
    "subject": "Data Structure & Algorithms",
    "difficulty": "${difficulty}",
    "explanation": "Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity."
  }
]

Generate EXACTLY ${count} questions. Return only valid JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (questions.length !== count) {
      if (questions.length < count) {
        const fallbackQuestions = generateFallbackQuestions(
          subjects,
          difficulty,
          count - questions.length
        );
        questions.push(...fallbackQuestions);
      }
      questions.splice(count);
    }

    return questions.map((q: any, index: number) => ({
      id: `gemini_${Date.now()}_${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      subject: q.subject,
      difficulty: q.difficulty,
      explanation: q.explanation || "No explanation provided.",
    }));
  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    return generateFallbackQuestions(subjects, difficulty, count);
  }
};

const generateFallbackQuestions = (
  subjects: string[],
  difficulty: string,
  count: number
): GeminiQuestion[] => {
  const fallbackQuestions: GeminiQuestion[] = [
    {
      id: "fallback_1",
      question: "What is the time complexity of searching in a balanced binary search tree?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctAnswer: "O(log n)",
      subject: "Data Structure & Algorithms",
      difficulty: difficulty,
      explanation:
        "In a balanced BST, the height is O(log n), so searching takes O(log n) time.",
    },
    {
      id: "fallback_2",
      question:
        "Which data structure follows Last In First Out (LIFO) principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: "Stack",
      subject: "Data Structure & Algorithms",
      difficulty: difficulty,
      explanation: "Stack follows Last In First Out (LIFO) principle.",
    },
    {
      id: "fallback_3",
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      correctAnswer: "O(n²)",
      subject: "Data Structure & Algorithms",
      difficulty: difficulty,
      explanation:
        "QuickSort has O(n²) worst-case when the pivot is always the smallest or largest element.",
    },
    {
      id: "fallback_4",
      question: "Which scheduling algorithm gives shortest average waiting time?",
      options: ["FCFS", "SJF", "Round Robin", "Priority"],
      correctAnswer: "SJF",
      subject: "Operating System",
      difficulty: difficulty,
      explanation:
        "Shortest Job First (SJF) minimizes average waiting time by executing shorter jobs first.",
    },
    {
      id: "fallback_5",
      question: "What does ACID stand for in database transactions?",
      options: [
        "Atomic, Consistent, Isolated, Durable",
        "Advanced, Complete, Independent, Direct",
        "Automatic, Controlled, Internal, Dynamic",
        "Applied, Centralized, Integrated, Distributed",
      ],
      correctAnswer: "Atomic, Consistent, Isolated, Durable",
      subject: "Database Management System",
      difficulty: difficulty,
      explanation: "ACID properties ensure database transaction reliability.",
    },
    {
      id: "fallback_6",
      question: "What is the main goal of machine learning?",
      options: [
        "Data storage",
        "Pattern recognition",
        "File compression",
        "Network security",
      ],
      correctAnswer: "Pattern recognition",
      subject: "Artificial Intelligence",
      difficulty: difficulty,
      explanation:
        "Machine learning aims to identify patterns in data to make predictions.",
    },
    {
      id: "fallback_7",
      question: "Which data structure is best for implementing BFS?",
      options: ["Stack", "Queue", "Array", "Tree"],
      correctAnswer: "Queue",
      subject: "Data Structure & Algorithms",
      difficulty: difficulty,
      explanation:
        "BFS uses FIFO principle, making Queue the ideal data structure.",
    },
    {
      id: "fallback_8",
      question: "What is a deadlock in operating systems?",
      options: [
        "Process termination",
        "Resource allocation problem",
        "Memory leak",
        "CPU scheduling issue",
      ],
      correctAnswer: "Resource allocation problem",
      subject: "Operating System",
      difficulty: difficulty,
      explanation:
        "Deadlock occurs when processes are blocked waiting for resources held by other blocked processes.",
    },
    {
      id: "fallback_9",
      question: "Which normal form eliminates transitive dependencies?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      correctAnswer: "3NF",
      subject: "Database Management System",
      difficulty: difficulty,
      explanation:
        "Third Normal Form (3NF) eliminates transitive dependencies between non-key attributes.",
    },
    {
      id: "fallback_10",
      question: "What does backpropagation do in neural networks?",
      options: [
        "Forward pass",
        "Weight initialization",
        "Error propagation",
        "Data preprocessing",
      ],
      correctAnswer: "Error propagation",
      subject: "Artificial Intelligence",
      difficulty: difficulty,
      explanation:
        "Backpropagation propagates error backwards through the network to update weights.",
    },
  ];

  return fallbackQuestions.slice(0, count);
};

