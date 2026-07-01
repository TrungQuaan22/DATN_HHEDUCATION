import { Subject, Grade, PaginatedResponseShape } from "@/types/common";

export type AssessmentItemType = "mcq" | "true_false" | "numeric" | "essay";

export type AssessmentCreatePayload = {
  title: string;
  subject: Subject;
  grade: number;
  type: "exam" | "quiz";
  gradingType: "auto" | "manual" | "mixed";
  timeLimitMinutes?: number | null;
  sourceMediaId?: string | null;
};

export type AssessmentPlacementCreatePayload = {
  assessmentId: string;
  type: "public_practice" | "course" | "lesson";
  courseId?: string | null;
  lessonId?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  maxAttempts?: number | null;
  slug?: string | null;
  isFeatured?: boolean;
  orderIndex?: number | null;
};

export type AssessmentPlacementUpsertPayload = Omit<
  AssessmentPlacementCreatePayload,
  "assessmentId"
>;

export type AdminAssessmentScope = "all" | "public" | "course" | "unplaced";

export type ListAdminAssessmentsParams = {
  page?: number;
  limit?: number;
  scope?: AdminAssessmentScope;
  courseId?: string;
  visibility?: "draft" | "published" | "hidden";
  subject?: string;
  grade?: number;
  gradingType?: string;
};

export type AssessmentSection = {
  id: string;
  title: string;
  description: string | null;
  itemType: AssessmentItemType;
  orderIndex: number;
};

export type RuntimeAssessmentItem = {
  id: string;
  orderIndex: number;
  questionNumber: number;
  itemType: AssessmentItemType;
  maxScore: string;
  answerMode: "single" | "multiple" | null;
  question: {
    id: string;
    type: string;
    content: unknown;
    options: Array<{
      id: string;
      content: unknown;
      orderIndex: number;
    }>;
  } | null;
};

export type RuntimeAssessmentSection = AssessmentSection & {
  items: RuntimeAssessmentItem[];
};

export type RuntimeAssessment = {
  id: string;
  type: "public_practice" | "course" | "lesson";
  slug: string | null;
  isFeatured: boolean;
  openTime: string | null;
  closeTime: string | null;
  maxAttempts: number | null;
  timeLimitMinutes: number | null;
  sourceMediaId: string | null;
  sourceMediaUrl: string | null;
  assessment: {
    id: string;
    title: string;
    subject: Subject;
    grade: number;
    type: "exam" | "quiz";
    gradingType: "auto" | "manual" | "mixed";
    visibility: string;
  };
  sections: RuntimeAssessmentSection[];
  submissions?: AssessmentSubmission[];
};

export type AssessmentPlacementSummary = {
  id: string;
  type: "public_practice" | "course" | "lesson";
  slug: string | null;
  isFeatured: boolean;
  assessment: RuntimeAssessment["assessment"];
};

export type AdminAssessmentSummary = {
  id: string;
  title: string;
  subject: Subject;
  grade: number;
  type: "exam" | "quiz";
  gradingType: "auto" | "manual" | "mixed";
  visibility: string;
  timeLimitMinutes: number | null;
  createdById?: string | null;
  itemCount: number;
  submissionCount: number;
  placements: Array<{
    id: string;
    type: "public_practice" | "course" | "lesson";
    slug: string | null;
    courseId: string | null;
    lessonId: string | null;
    isFeatured: boolean;
  }>;
  createdAt: string;
};

export type AdminGradingSubmissionSummary = {
  id: string;
  assessmentId: string;
  placementId: string | null;
  attemptNumber: number;
  status: "doing" | "submitted" | "auto_submitted" | "completed";
  startTime?: string;
  violationCount?: number;
  submitTime: string | null;
  autoScore: string | null;
  finalScore: string | null;
  assessment: {
    id: string;
    title: string;
    gradingType: "manual" | "mixed";
    subject: Subject;
    grade: number;
  };
  student: {
    id: string;
    fullName: string;
    email: string;
  };
  essayCount: number;
  gradedEssayCount: number;
};

export type AdminGradingSubmissionDetail = AdminGradingSubmissionSummary & {
  sections: Array<
    AssessmentSection & {
      items: Array<{
        id: string;
        itemType: AssessmentItemType;
        orderIndex: number;
        questionNumber: number;
        maxScore: string;
        scoringConfig: unknown;
        correctAnswer: unknown;
        explanation: unknown;
        question: {
          id: string;
          content: unknown;
          explanation: unknown;
          options: Array<{
            id: string;
            content: unknown;
            orderIndex: number;
            isCorrect: boolean;
          }>;
        } | null;
      }>;
    }
  >;
  essayAnswers: Array<{
    id: string;
    itemId: string;
    answer: string;
    teacherScore: string | null;
    teacherNote: string | null;
    gradedAt: string | null;
  }>;
  answers: {
    mcq: Array<{
      itemId: string;
      selectedOptionIds: string[];
      isCorrect: boolean | null;
      pointEarned: string;
    }>;
    trueFalse: Array<{
      itemId: string;
      optionId: string;
      selectedValue: boolean;
      isCorrect: boolean | null;
      pointEarned: string;
    }>;
    numeric: Array<{
      itemId: string;
      answerValue: string;
      isCorrect: boolean | null;
      pointEarned: string;
    }>;
  };
};

export type ListAssessmentPlacementsResponse = {
  items: AssessmentPlacementSummary[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type AssessmentSubmission = {
  id: string;
  assessmentId: string;
  placementId: string | null;
  attemptNumber: number;
  status: "doing" | "submitted" | "auto_submitted" | "completed";
  autoScore?: string | null;
  finalScore?: string | null;
  startTime?: string;
  submitTime?: string | null;
  violationCount?: number;
  answers?: {
    mcq: Array<{ itemId: string; selectedOptionIds: string[] }>;
    trueFalse: Array<{
      itemId: string;
      optionId: string;
      selectedValue: boolean;
    }>;
    numeric: Array<{ itemId: string; answerValue: string }>;
    essay: Array<{ itemId: string; answer: string }>;
  };
};

export type SubmissionViolationResult = {
  violationCount: number;
  autoSubmitted: boolean;
  submission: AssessmentSubmission | null;
};

export type SaveAnswerPayload =
  | {
      itemId: string;
      type: "mcq";
      selectedOptionIds: string[];
    }
  | {
      itemId: string;
      type: "true_false";
      selections: Array<{ optionId: string; selectedValue: boolean }>;
    }
  | {
      itemId: string;
      type: "numeric";
      answerValue: number;
    }
  | {
      itemId: string;
      type: "essay";
      answer: string;
    };

export type AdminAssessmentDetail = {
  id: string;
  title: string;
  subject: Subject;
  grade: number;
  type: "exam" | "quiz";
  gradingType: "auto" | "manual" | "mixed";
  visibility: string;
  timeLimitMinutes: number | null;
  createdById?: string | null;
  submissionCount?: number;
  sourceMediaId: string | null;
  sourceMedia: any;
  placements: Array<{
    id: string;
    type: "public_practice" | "course" | "lesson";
    slug: string | null;
    courseId: string | null;
    lessonId: string | null;
    isFeatured: boolean;
    openTime: string | null;
    closeTime: string | null;
    maxAttempts: number | null;
  }>;
  sections: Array<
    AssessmentSection & {
      items: Array<{
        id: string;
        orderIndex: number;
        questionNumber: number;
        itemType: AssessmentItemType;
        topicId: string | null;
        topicName: string | null;
        difficulty: string;
        maxScore: string;
        scoringConfig: any;
        correctAnswer: any;
        explanation: string | null;
        question: {
          id: string;
          content: any;
          explanation: string | null;
          options: Array<{
            id: string;
            content: any;
            isCorrect: boolean;
            orderIndex: number;
          }>;
        } | null;
      }>;
    }
  >;
};

export type ListAdminAssessmentsResponse = {
  items: AdminAssessmentSummary[];
  pagination: ListAssessmentPlacementsResponse["pagination"];
};

export type ListAdminGradingSubmissionsResponse = {
  items: AdminGradingSubmissionSummary[];
  pagination: ListAssessmentPlacementsResponse["pagination"];
};

export type AssessmentParticipantStatus =
  "not_started" | "doing" | "pending_grading" | "completed";

export type AdminAssessmentResultParticipant = {
  student: {
    id: string;
    fullName: string;
    email: string;
    avatarMediaId: string | null;
    avatarUrl: string | null;
    status: string;
  };
  status: AssessmentParticipantStatus;
  attemptCount: number;
  bestScore: string | null;
  latestScore: string | null;
  latestSubmissionId: string | null;
  latestSubmissionStatus: AssessmentSubmission["status"] | null;
  latestSubmitTime: string | null;
  latestActivityAt: string | null;
};

export type AdminAssessmentResultsResponse = {
  assessment: {
    id: string;
    title: string;
    subject: Subject;
    grade: number;
    type: "exam" | "quiz";
    gradingType: "auto" | "manual" | "mixed";
    timeLimitMinutes: number | null;
    maxScore: string;
    placement: {
      id: string;
      type: "public_practice" | "course" | "lesson";
      openTime: string | null;
      closeTime: string | null;
      maxAttempts: number | null;
      course: { id: string; title: string } | null;
    } | null;
  };
  stats: {
    totalStudents: number;
    notStarted: number;
    doing: number;
    pendingGrading: number;
    completed: number;
    highestScore: string | null;
    lowestScore: string | null;
    averageScore: string | null;
  };
  items: AdminAssessmentResultParticipant[];
  pagination: ListAssessmentPlacementsResponse["pagination"];
};

export type AdminAssessmentStudentAttemptsResponse = {
  assessment: {
    id: string;
    title: string;
    maxScore: string;
    gradingType: "auto" | "manual" | "mixed";
  };
  participant: AdminAssessmentResultParticipant;
  attempts: Array<{
    id: string;
    attemptNumber: number;
    status: AssessmentSubmission["status"];
    startTime: string;
    submitTime: string | null;
    updatedAt: string;
    autoScore: string | null;
    finalScore: string | null;
    violationCount: number;
  }>;
};

export type StudentAssessmentSummary = {
  placementId: string;
  placementType: "course" | "lesson";
  assessmentId: string;
  title: string;
  subject: Subject;
  grade: number;
  assessmentType: "exam" | "quiz";
  gradingType: "auto" | "manual" | "mixed";
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  openTime: string | null;
  closeTime: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  lesson: {
    id: string;
    title: string;
    chapterTitle: string;
  } | null;
  attempt: {
    usedAttempts: number;
    latestSubmission: {
      id: string;
      status: "doing" | "submitted" | "auto_submitted" | "completed";
      finalScore: string | null;
      submitTime: string | null;
    } | null;
  };
};

export type ListStudentAssessmentsResponse = {
  items: StudentAssessmentSummary[];
  pagination: ListAssessmentPlacementsResponse["pagination"];
};

export type AssessmentWorkspaceResponse = Omit<RuntimeAssessment, "type"> & {
  submissionId: string;
  submission: AssessmentSubmission;
  timeRemainingSeconds: number | null;
};

export type SubmissionResultOutcome =
  "correct" | "incorrect" | "partial" | "unanswered";

export type StudentSubmissionResultItem = {
  id: string;
  questionNumber: number;
  itemType: AssessmentItemType;
  maxScore: string;
  pointEarned: string;
  outcome: SubmissionResultOutcome;
  content: unknown;
  explanation: unknown;
  options: Array<{
    id: string;
    content: unknown;
    orderIndex: number;
    isSelected: boolean;
    isCorrect: boolean;
  }>;
  trueFalseStatements: Array<{
    id: string;
    content: unknown;
    orderIndex: number;
    selectedValue: boolean | null;
    correctValue: boolean;
    isCorrect: boolean | null;
  }>;
  numericAnswer: {
    submittedValue: string | null;
    correctValue: string | null;
  } | null;
  essayAnswer: {
    answer: string;
    teacherScore: string | null;
    teacherNote: string | null;
  } | null;
};

export type StudentSubmissionResult = {
  id: string;
  status: AssessmentSubmission["status"];
  reviewAvailable: boolean;
  assessment: {
    id: string;
    title: string;
    subject: Subject;
    grade: number;
    type: "exam" | "quiz";
    gradingType: "auto" | "manual" | "mixed";
    sourceMediaId: string | null;
    sourceMediaUrl: string | null;
    maxScore: string;
  };
  attempt: {
    attemptNumber: number;
    startTime: string;
    submitTime: string | null;
    autoScore: string | null;
    finalScore: string | null;
  };
  summary: {
    totalItems: number;
    correctItems: number;
    partialItems: number;
    incorrectItems: number;
    unansweredItems: number;
  } | null;
  sections: Array<{
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    items: StudentSubmissionResultItem[];
  }>;
};
