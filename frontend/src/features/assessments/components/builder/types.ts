import { Subject } from "@/types/common";

export type PlacementType = "unplaced" | "public_practice" | "course" | "lesson";
export type AssessmentType = "quiz" | "exam";
export type ItemType = "mcq" | "true_false" | "numeric" | "essay";
export type McqMode = "single" | "multiple";
export type Difficulty = "recognition" | "understanding" | "application" | "advanced";
export type McqOption = { content: string; isCorrect: boolean };

export interface BuilderItem {
  id: string; // client-side temp id
  sectionId: string;
  questionNumber: number;
  itemType: ItemType;
  topicId?: string | null;
  topicName?: string | null;
  difficulty: Difficulty;
  maxScore: number;
  // MCQ
  mode?: McqMode;
  options?: McqOption[];
  optionCount?: number;
  correctOptions?: string[];
  // True/False
  statements?: Array<{ label: string; correctValue: boolean }>;
  // Numeric
  correctAnswer?: number;
  // Essay
  rubric?: string;
  explanation?: string | null;
  // Rich text question body
  contentLabel: string;
}

export interface BuilderSection {
  id: string;
  title: string;
  description?: string | null;
  itemType: ItemType;
  orderIndex: number;
}
export const defaultMaxScoreByItemType: Record<ItemType, number> = {
  mcq: 0.25,
  true_false: 1,
  numeric: 0.5,
  essay: 1,
};

export const itemTypeLabels: Record<ItemType, string> = {
  mcq: "Trắc nghiệm",
  true_false: "Đúng / Sai",
  numeric: "Điền số",
  essay: "Tự luận",
};

export const defaultTrueFalseStatements = () => [
  { label: "Mệnh đề phát biểu số 1", correctValue: true },
  { label: "Mệnh đề phát biểu số 2", correctValue: false },
  { label: "Mệnh đề phát biểu số 3", correctValue: true },
  { label: "Mệnh đề phát biểu số 4", correctValue: false },
];

export const createBuilderItem = (
  type: ItemType,
  questionNumber: number,
  maxScore = defaultMaxScoreByItemType[type],
  id = String(Date.now()),
  assessmentType: AssessmentType = "quiz",
  sectionId = "section_default"
): BuilderItem => {
  const base: BuilderItem = {
    id,
    sectionId,
    questionNumber,
    itemType: type,
    topicId: null,
    topicName: null,
    difficulty: "understanding",
    maxScore,
    contentLabel: assessmentType === "quiz" ? `Nội dung câu hỏi tự soạn số ${questionNumber}` : "",
  };

  if (type === "mcq") {
    base.mode = "single";
    base.options =
      assessmentType === "quiz"
        ? [
            { content: "Lựa chọn A", isCorrect: true },
            { content: "Lựa chọn B", isCorrect: false },
            { content: "Lựa chọn C", isCorrect: false },
            { content: "Lựa chọn D", isCorrect: false },
          ]
        : [];
    base.optionCount = 4;
    base.correctOptions = ["A"];
  } else if (type === "true_false") {
    base.statements = defaultTrueFalseStatements();
  } else if (type === "numeric") {
    base.correctAnswer = 0;
  } else if (type === "essay") {
    base.rubric = "Hướng dẫn chấm tự luận...";
  }

  return base;
};
