export interface AssessmentItem {
  id: string;
  title: string;
  courseTitle: string;
  subject:
    | "math"
    | "physics"
    | "chemistry"
    | "literature"
    | "english"
    | "biology"
    | "history"
    | "geography";
  type: "exam" | "homework"; // exam: "Quan trọng", homework: "Luyện tập"
  status: "upcoming" | "not_done" | "completed" | "expired";
  durationMinutes: number;
  openTime: string;
  closeTime: string;
  remainingTimeText: string;
  score?: number;
  totalScore?: number;
  completedAt?: string;
}

export const mockAssessments: AssessmentItem[] = [
  {
    id: "assess-1",
    title: "Kiểm tra giữa kỳ môn Ngữ Văn",
    courseTitle: "Tích chữ thành văn - Module 1",
    subject: "literature",
    type: "exam",
    status: "not_done",
    durationMinutes: 45,
    openTime: "2026-05-27T08:00:00Z",
    closeTime: "2026-05-29T23:59:59Z",
    remainingTimeText: "Còn 2 ngày",
  },
  {
    id: "assess-2",
    title: "Bài tập phân tích thơ hiện đại",
    courseTitle: "Tích chữ thành văn - Module 1",
    subject: "literature",
    type: "homework",
    status: "upcoming",
    durationMinutes: 30,
    openTime: "2026-06-01T08:00:00Z",
    closeTime: "2026-06-05T23:59:59Z",
    remainingTimeText: "Mở sau 5 ngày",
  },
  {
    id: "assess-3",
    title: "Trắc nghiệm: Phép liên kết văn bản",
    courseTitle: "Tích chữ thành văn - Module 1",
    subject: "literature",
    type: "homework",
    status: "completed",
    durationMinutes: 15,
    openTime: "2026-05-20T08:00:00Z",
    closeTime: "2026-05-24T23:59:59Z",
    remainingTimeText: "Đã nộp",
    score: 9.5,
    totalScore: 10,
    completedAt: "2026-05-22T10:30:00Z",
  },
  {
    id: "assess-4",
    title: "Kiểm tra Học kỳ I môn Toán học",
    courseTitle: "Giải tích 12 nâng cao",
    subject: "math",
    type: "exam",
    status: "completed",
    durationMinutes: 90,
    openTime: "2026-05-15T08:00:00Z",
    closeTime: "2026-05-20T23:59:59Z",
    remainingTimeText: "Đã nộp",
    score: 8.0,
    totalScore: 10,
    completedAt: "2026-05-18T14:20:00Z",
  },
  {
    id: "assess-5",
    title: "Bài tập Trắc nghiệm: Thì hiện tại hoàn thành",
    courseTitle: "Tiếng Anh THPT - Căn bản 11",
    subject: "english",
    type: "homework",
    status: "expired",
    durationMinutes: 20,
    openTime: "2026-05-10T08:00:00Z",
    closeTime: "2026-05-24T23:59:59Z",
    remainingTimeText: "Trễ hạn",
  },
  {
    id: "assess-6",
    title: "Đề khảo sát năng lực Tiếng Anh đầu năm lớp 11",
    courseTitle: "Tiếng Anh THPT - Căn bản 11",
    subject: "english",
    type: "exam",
    status: "completed",
    durationMinutes: 60,
    openTime: "2026-05-05T08:00:00Z",
    closeTime: "2026-05-10T23:59:59Z",
    remainingTimeText: "Đã nộp",
    score: 8.8,
    totalScore: 10,
    completedAt: "2026-05-08T09:15:00Z",
  },
];

export const SUBJECT_LABELS: Record<string, string> = {
  math: "Toán Học",
  physics: "Vật Lý",
  chemistry: "Hóa Học",
  literature: "Ngữ Văn",
  english: "Anh Văn",
  biology: "Sinh Học",
  history: "Lịch Sử",
  geography: "Địa Lý",
};
