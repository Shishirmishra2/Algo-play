import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  examples: TestCase[];
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  topic: string;
  difficulty: string;
}

export const generateProblems = async (
  topic: string,
  difficulty: string = "intermediate"
): Promise<CodingProblem[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate exactly 2 coding problems for the topic: "${topic}" at ${difficulty} difficulty level.

Requirements:
- Problems should be algorithmic/programming challenges (like LeetCode style)
- Each problem should be solvable in JavaScript, Python, or Java
- Include 2-3 example test cases per problem
- Include starter code/function signatures for all 3 languages
- Include clear constraints
- Make them practical and educational

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "Only one valid answer exists"
    ],
    "starterCode": {
      "javascript": "/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction solve(nums, target) {\\n    // Your code here\\n}",
      "python": "def solve(nums, target):\\n    # Your code here\\n    pass",
      "java": "class Solution {\\n    public int[] solve(int[] nums, int target) {\\n        // Your code here\\n        return new int[]{};\\n    }\\n}"
    },
    "topic": "${topic}",
    "difficulty": "${difficulty}"
  }
]

Generate exactly 2 unique problems. Return ONLY valid JSON array, no markdown, no extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No valid JSON found in response");

    const problems = JSON.parse(jsonMatch[0]);

    return problems.map((p: any, index: number) => ({
      id: `problem_${Date.now()}_${index}`,
      title: p.title,
      description: p.description,
      examples: p.examples || [],
      constraints: p.constraints || [],
      starterCode: p.starterCode,
      topic: p.topic || topic,
      difficulty: p.difficulty || difficulty,
    }));
  } catch (error) {
    console.error("Error generating problems:", error);
    return getFallbackProblems(topic, difficulty);
  }
};

export const generateHint = async (
  problem: CodingProblem,
  userCode: string,
  language: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful coding mentor. A student is trying to solve this problem:

Problem: ${problem.title}
Description: ${problem.description}

Their current ${language} code:
\`\`\`${language}
${userCode}
\`\`\`

Give a helpful, concise hint (2-4 sentences max) that guides them in the right direction WITHOUT giving away the full solution. 
- Point out what approach or data structure to consider
- Mention if there's a logical issue in their current code
- Be encouraging and specific to their code
- Do NOT write the solution for them

Return only the hint text, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating hint:", error);
    return "Try breaking down the problem into smaller parts. Think about what data structure could help you efficiently solve this, and consider the time complexity of your current approach.";
  }
};

const getFallbackProblems = (topic: string, difficulty: string): CodingProblem[] => [
  {
    id: "fallback_1",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists"],
    starterCode: {
      javascript: "function solve(nums, target) {\n    // Your code here\n}",
      python: "def solve(nums, target):\n    # Your code here\n    pass",
      java: "class Solution {\n    public int[] solve(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}",
    },
    topic,
    difficulty,
  },
  {
    id: "fallback_2",
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    starterCode: {
      javascript: "function solve(s) {\n    // Your code here\n}",
      python: "def solve(s):\n    # Your code here\n    pass",
      java: "class Solution {\n    public boolean solve(String s) {\n        // Your code here\n        return false;\n    }\n}",
    },
    topic,
    difficulty,
  },
];
