export type Subject =
  | "math"
  | "physics"
  | "chemistry"
  | "literature"
  | "english"
  | "biology"
  | "history"
  | "geography";

export type Grade = 9 | 10 | 11 | 12;

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: "Toán",
  physics: "Vật lý",
  chemistry: "Hóa học",
  literature: "Ngữ văn",
  english: "Tiếng Anh",
  biology: "Sinh học",
  history: "Lịch sử",
  geography: "Địa lý",
};

export const GRADE_LABELS: Record<Grade, string> = {
  9: "Khối 9",
  10: "Khối 10",
  11: "Khối 11",
  12: "Khối 12",
};

export type MediaPreview = {
  mediaId?: string;
  url: string;
  alt?: string;
};

export type TeacherAchievement = {
  id: string;
  year: string;
  title: string;
  description: string;
  side?: "left" | "right";
};

export type TeacherSummary = {
  id: string;
  fullName: string;
  subject: Subject;
  avatarUrl: string;
  title: string;
  bio: string;
  achievements: TeacherAchievement[];
};



export type RichContent = {
  type: "doc";
  content: RichNode[];
};

export type RichNode =
  | { type: "paragraph"; content?: RichNode[] }
  | { type: "heading"; attrs: { level: 1 | 2 | 3 }; content?: RichNode[] }
  | {
      type: "text";
      text: string;
      marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    }
  | {
      type: "image";
      attrs: { mediaId?: string; src?: string; alt?: string; caption?: string };
    }
  | { type: "youtube"; attrs: { url: string } }
  | { type: "mathInline"; attrs: { latex: string } }
  | { type: "mathBlock"; attrs: { latex: string } }
  | { type: "bulletList"; content?: RichNode[] }
  | { type: "orderedList"; content?: RichNode[] }
  | { type: "listItem"; content?: RichNode[] }
  | { type: "blockquote"; content?: RichNode[] }
  | { type: "codeBlock"; attrs?: { language?: string }; content?: RichNode[] }
  | { type: "html"; attrs?: { html?: string } };

export type PaginationResponseFields = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedResponseShape<TItem> = {
  items: TItem[];
  pagination: PaginationResponseFields;
};

