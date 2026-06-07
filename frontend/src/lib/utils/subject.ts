import { SUBJECT_LABELS, Subject } from "@/types/common";

/**
 * Returns consistent HSL/Tailwind badge styling classes for academic subjects.
 */
export const getSubjectBadgeStyles = (subject: string): string => {
  switch (subject) {
    case "math":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "literature":
      return "text-brand-pink bg-brand-pink/10 border-brand-pink/20";
    case "english":
      return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    default:
      return "text-muted-text bg-off-black border-border-dark";
  }
};

/**
 * Returns human-readable Vietnamese label for academic subjects, falling back to database common labels.
 */
export const getSubjectLabel = (subject: string): string => {
  switch (subject) {
    case "math":
      return "Toán Học";
    case "literature":
      return "Ngữ Văn";
    case "english":
      return "Anh Văn";
    default:
      return SUBJECT_LABELS[subject as Subject] || subject;
  }
};
