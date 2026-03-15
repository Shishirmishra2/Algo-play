export interface UserJourney {
  subjects: string[];
  difficulty: string | null;
}

export const SUBJECT_LABELS = {
  dsa: "Data Structure & Algorithms",
  os: "Operating System",
  ai: "Artificial Intelligence",
  dbms: "Database Management System",
};

export const SUBJECT_ABBR = {
  dsa: "DSA",
  os: "OS",
  ai: "AI",
  dbms: "DBMS",
};

export const saveUserJourney = (journey: UserJourney) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userJourney", JSON.stringify(journey));
  }
};

export const getUserJourney = (): UserJourney => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("userJourney");
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return { subjects: [], difficulty: null };
};

export const getSubjectDisplayText = (subjects: string[]): string => {
  if (subjects.length === 0) return "No subjects selected";
  if (subjects.length === 1)
    return SUBJECT_LABELS[subjects[0] as keyof typeof SUBJECT_LABELS];
  if (subjects.length <= 3) {
    return subjects
      .map((s) => SUBJECT_ABBR[s as keyof typeof SUBJECT_ABBR])
      .join(", ");
  }
  return `${subjects
    .slice(0, 2)
    .map((s) => SUBJECT_ABBR[s as keyof typeof SUBJECT_ABBR])
    .join(", ")} +${subjects.length - 2}`;
};
