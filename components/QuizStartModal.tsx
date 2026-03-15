"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, PlayIcon } from "@phosphor-icons/react";

interface QuizStartModalProps {
  isOpen: boolean;
  onStart: () => void;
  subjectDisplay: string;
  questionCount: number;
  timeLimit: number;
}

export default function QuizStartModal({
  isOpen,
  onStart,
  subjectDisplay,
  questionCount,
  timeLimit,
}: QuizStartModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Ready to Start Quiz?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {subjectDisplay}
            </Badge>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>{questionCount} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon size={16} />
                <span>{timeLimit} Minutes</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-800/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-purple-200">Quiz Rules:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Timer starts immediately when you click "Start Quiz"</li>
              <li>• Leaving the page will end the quiz automatically</li>
              <li>• You cannot pause once started</li>
              <li>• Submit before time runs out</li>
            </ul>
          </div>
          <Button
            onClick={onStart}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl text-lg"
          >
            <PlayIcon size={20} className="mr-2" />
            Start Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

