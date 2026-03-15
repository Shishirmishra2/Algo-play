"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import logo from "@/public/logo/logo.png";
import { useState, useEffect } from "react";
import { saveUserJourney, getUserJourney } from "@/lib/userPreferences";

interface Step2Props {
  onSelectionChange?: (hasSelection: boolean) => void;
}

export default function Step2({ onSelectionChange }: Step2Props) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    const savedJourney = getUserJourney();
    if (savedJourney.subjects.length > 0) {
      setSelectedSubjects(savedJourney.subjects);
    }
  }, []);

  const subjects = [
    { id: "dsa", label: "Data Structure Algorithm (DSA)" },
    { id: "os", label: "Operating System (OS)" },
    { id: "ai", label: "Artificial Intelligence (AI)" },
    { id: "dbms", label: "Database Management System (DBMS)" },
  ];

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setSelectedSubjects((prev) =>
      checked ? [...prev, subjectId] : prev.filter((id) => id !== subjectId)
    );
  };

  useEffect(() => {
    onSelectionChange?.(selectedSubjects.length > 0);
    const currentJourney = getUserJourney();
    saveUserJourney({
      subjects: selectedSubjects,
      difficulty: currentJourney.difficulty,
    });
  }, [selectedSubjects, onSelectionChange]);

  return (
    <>
      <Image src={logo} alt="logo" className="size-40" />
      <h1 className="-mt-18 text-3xl font-semibold">
        Choose Your <span className="font-bold text-purple-300">Journey</span>
      </h1>
      <div className="mt-10 flex flex-col gap-6">
        {subjects.map((subject) => (
          <Label
            key={subject.id}
            htmlFor={subject.id}
            className="flex items-center gap-3 bg-neutral-50/15 pl-6 pr-8 py-6 rounded-xl border-2 border-neutral-50/10 cursor-pointer transition-all duration-300 hover:bg-neutral-50/25 hover:border-neutral-50/20 hover:scale-[1.02] has-[[aria-checked=true]]:border-purple-600 has-[[aria-checked=true]]:bg-purple-50/20 has-[[aria-checked=true]]:hover:bg-purple-50/30"
          >
            <Checkbox
              className="data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-900 transition-colors duration-200"
              id={subject.id}
              checked={selectedSubjects.includes(subject.id)}
              onCheckedChange={(checked) =>
                handleSubjectChange(subject.id, checked as boolean)
              }
            />
            <h3 className="transition-colors duration-200">
              {subject.label}
            </h3>
          </Label>
        ))}
      </div>
    </>
  );
}

