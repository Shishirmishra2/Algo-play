"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getUserJourney, getSubjectDisplayText } from "@/lib/userPreferences";
import { GeminiQuestion } from "@/lib/geminiQuiz";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import NavigationWarningModal from "@/components/NavigationWarningModal";
import QuizNavbar from "@/components/QuizNavbar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BrainIcon,
  ClockIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr";

type QuizState = "idle" | "loading" | "active" | "finished";

export default function Quiz() {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<GeminiQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [subjectDisplay, setSubjectDisplay] = useState("");
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  const router = useRouter();
  const { timeLeft, isFinished, startTimer, resetTimer, formatTime } =
    useQuizTimer(10);

  useEffect(() => {
    const journey = getUserJourney();
    setSubjectDisplay(
      journey.subjects.length > 0
        ? getSubjectDisplayText(journey.subjects)
        : "Data Structure & Algorithms"
    );
  }, []);

  useEffect(() => {
    if (isFinished && quizState === "active") {
      handleSubmitQuiz();
      toast.error("Time's up! Quiz submitted automatically.");
    }
  }, [isFinished, quizState]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizState === "active") {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        quizState === "active" &&
        !window.location.pathname.includes("/quiz/results")
      ) {
        handleEndQuiz();
        toast.error("Quiz ended due to tab switch/page leave");
      }
    };
    if (quizState === "active") {
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [quizState]);

  const generateNewQuiz = async () => {
    setQuizState("loading");
    try {
      const journey = getUserJourney();
      const subjects = journey.subjects.length > 0 ? journey.subjects : ["dsa"];
      const difficulty = journey.difficulty || "intermediate";
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects, difficulty, count: 10 }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
      setQuizState("active");
      startTimer();
      toast.success("Quiz started! Good luck!");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
      setQuizState("idle");
    }
  };

  const handleEndQuiz = () => {
    setQuizState("idle");
    resetTimer();
    setQuestions([]);
    setAnswers([]);
  };

  const handleSubmitQuiz = () => {
    const results = questions.map((question, index) => ({
      question,
      userAnswer: answers[index],
      isCorrect: answers[index] === question.correctAnswer,
    }));
    localStorage.setItem("quizResults", JSON.stringify(results));
    const correct = results.filter((r) => r.isCorrect).length;
    setQuizState("idle");
    resetTimer();
    toast.success(`Quiz completed! Score: ${correct}/${questions.length}`);
    router.push("/quiz/results");
  };

  const handleNavigation = (href: string) => {
    if (href === "/quiz/results" || quizState !== "active") {
      router.push(href);
    } else {
      setPendingNavigation(href);
      setShowNavigationWarning(true);
    }
  };

  const confirmNavigation = () => {
    handleEndQuiz();
    if (pendingNavigation) router.push(pendingNavigation);
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  if (quizState === "loading") {
    return (
      <div className="min-h-screen text-white p-8 flex items-center justify-center pb-24">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-retro">
            Crafting Your Quiz
          </h2>
        </div>
        <QuizNavbar onNavigationAttempt={handleNavigation} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-8 pb-24">
      <div className="max-w-[100vh] mx-auto">
        {quizState === "idle" ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center space-y-8 max-w-2xl mx-auto">
              <h1 className="text-7xl font-retro bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Quiz Challenge
              </h1>
              <p className="text-2xl text-gray-300 font-medium">
                {subjectDisplay}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <BrainIcon size={32} weight="duotone" color="#fff" />
                      <h3 className="text-xl font-bold text-purple-200">
                        Dynamically Generated
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      10 fresh questions generated dynamically - no repeats,
                      always unique!
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <ClockIcon size={32} weight="duotone" color="#fff" />
                      <h3 className="text-xl font-bold text-blue-200">
                        Time Challenge
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      10 minutes to showcase your skills. Every second counts!
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/30 max-w-lg mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <WarningIcon size={32} weight="duotone" color="#fff" />
                    <h3 className="text-lg font-bold text-orange-200">
                      Important Rules
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Timer starts immediately when you begin</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Switching tabs or leaving will end the quiz</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>No going back once you start</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={generateNewQuiz}
                variant={"secondary"}
                size={"lg"}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg"
              >
                Start Your Challenge
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify_between items-center mb-8">
              <div>
                <h1 className="text-6xl font-retro">Quiz</h1>
                <p className="text-xl">{subjectDisplay}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-2xl px-4 py-2 rounded-full ${
                  timeLeft <= 60
                    ? "bg-red-600 text-white animate-pulse"
                    : ""
                }`}
              >
                {formatTime()}
              </Badge>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {questions.map((question, i) => (
                <Card
                  key={question.id}
                  className="mb-6 bg-purple-800/50 border-none rounded-xl p-4 text-white"
                >
                  <CardHeader className="p-0 mb-4">
                    <CardTitle>
                      {i + 1}. {question.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <RadioGroup
                      value={answers[i]}
                      onValueChange={(v) => handleAnswerChange(i, v)}
                    >
                      {question.options.map((option, j) => (
                        <div
                          key={j}
                          className="flex items-center space-x-2 mb-2"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`q${i}-opt${j}`}
                          />
                          <Label htmlFor={`q${i}-opt${j}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <Button
                onClick={handleSubmitQuiz}
                className="h-12 w-60 bg-gradient_to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                disabled={quizState !== "active"}
              >
                Submit Quiz
              </Button>
            </div>
          </>
        )}
      </div>
      <QuizNavbar onNavigationAttempt={handleNavigation} />
      <NavigationWarningModal
        isOpen={showNavigationWarning}
        onCancel={() => {
          setShowNavigationWarning(false);
          setPendingNavigation(null);
        }}
        onConfirm={confirmNavigation}
      />
    </div>
  );
}

