"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WarningIcon } from "@phosphor-icons/react";

interface NavigationWarningModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function NavigationWarningModal({
  isOpen,
  onCancel,
  onConfirm,
}: NavigationWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-gradient-to-br from-red-900 to-orange-900 text-white border-red-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <WarningIcon size={24} className="text-yellow-400" />
            Leave Quiz?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-center text-gray-200">
            Leaving this page will end your current quiz session. Your progress
            will be lost.
          </p>
          <p className="text-center text-sm text-yellow-200">
            Are you sure you want to continue?
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-400 text-gray-200 hover:bg-gray-800"
            >
              Stay in Quiz
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Leave Quiz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

