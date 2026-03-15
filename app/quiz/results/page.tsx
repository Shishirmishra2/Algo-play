"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
import { GeminiQuestion } from "@/lib/geminiQuiz";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface QuizResult {
  question: GeminiQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

export default function QuizResults() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const quizResults = localStorage.getItem("quizResults");
      if (quizResults) {
        try {
          const parsedResults: QuizResult[] = JSON.parse(quizResults);
          if (parsedResults.length > 0) {
            setResults(parsedResults);
            setTotalQuestions(parsedResults.length);
            setScore(parsedResults.filter((r) => r.isCorrect).length);
            localStorage.removeItem("quizResults");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing quiz results:", error);
        }
      }
      router.push("/quiz");
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const getScoreColor = () => {
    const pct = (score / totalQuestions) * 100;
    if (pct >= 80) return "text-green-500";
    if (pct >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = () => {
    const pct = (score / totalQuestions) * 100;
    if (pct >= 90) return "Excellent! Outstanding performance! 🎉";
    if (pct >= 80) return "Great job! You're doing very well! 👏";
    if (pct >= 70) return "Good work! Keep it up! 👍";
    if (pct >= 60) return "Not bad! Room for improvement. 📚";
    return "Keep practicing! You'll get better! 💪";
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white p-8 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="min-h-screen text_white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrophyIcon size={48} className="text-yellow-500" />
            <h1 className="text-4xl font-bold">Quiz Results</h1>
          </div>

          <Card className="bg-gradient_to-r from-purple-900/50 to-indigo-900/50 border-purple-500/20 mb-6">
            <CardContent className="p-8">
              <div className="flex gap-6 items-center">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${percentage * 2.83} 283`}
                        className={getScoreColor()}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor()}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300">{getScoreMessage()}</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-white">
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500"
                        />
                        Correct
                      </span>
                      <span className="font-bold text-green-500">
                        {score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-white">
                        <XCircleIcon size={20} className="text-red-500" />
                        Incorrect
                      </span>
                      <span className="font-bold text-red-500">
                        {totalQuestions - score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span>Total Questions</span>
                      <span className="font-bold">{totalQuestions}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push("/quiz")}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <ArrowsClockwiseIcon size={20} className="mr-2" />
                      Retake Quiz
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      variant="secondary"
                      className="w-full"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Question Analysis</h2>
          {results.map((result, index) => (
            <Card
              key={result.question.id}
              className={`border-none ${
                result.isCorrect
                  ? "bg-green-900/20 border-l-4 border-l-green-500"
                  : "bg-red-900/20 border-l-4 border-l-red-500"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <span className="text-gray-400">Q{index + 1}.</span>
                    {result.question.question}
                  </CardTitle>
                  {result.isCorrect ? (
                    <CheckCircleIcon
                      size={24}
                      className="text-green-500 flex-shrink-0 mt-1"
                    />
                  ) : (
                    <XCircleIcon
                      size={24}
                      className="text-red-500 flex-shrink-0 mt-1"
                    />
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {result.question.subject}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {result.question.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.question.options.map((option, optIndex) => {
                    const isCorrect = option === result.question.correctAnswer;
                    const isUserAnswer = option === result.userAnswer;
                    let className = "p-3 rounded-lg border text-sm ";
                    if (isCorrect)
                      className +=
                        "bg-green-900/30 border-green-500 text-green-200";
                    else if (isUserAnswer && !result.isCorrect)
                      className +=
                        "bg-red-900/30 border-red-500 text-red-200";
                    else
                      className +=
                        "bg-gray-800/30 border-gray-600 text-gray-300";
                    return (
                      <div key={optIndex} className={className}>
                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <CheckCircleIcon
                              size={16}
                              className="text-green-500"
                            />
                          )}
                          {isUserAnswer && !result.isCorrect && (
                            <XCircleIcon
                              size={16}
                              className="text-red-500"
                            />
                          )}
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-400">
                      Correct Answer:
                    </span>
                    <span className="text-white">
                      {result.question.correctAnswer}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-400">
                        Your Answer:
                      </span>
                      <span className="text-white">
                        {result.userAnswer || "No answer selected"}
                      </span>
                    </div>
                  )}
                  {result.question.explanation && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <span className="font-semibold text-blue-400">
                        Explanation:
                      </span>
                      <p className="text-gray-300 mt-1">
                        {result.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Navbar />
    </div>
  );
}

