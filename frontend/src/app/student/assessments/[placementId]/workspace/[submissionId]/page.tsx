"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  ListChecks,
  Loader2,
  Save,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  useLearningAssessmentQuery,
  useSaveAnswersMutation,
  useSubmitAttemptMutation,
  useAssessmentWorkspaceQuery,
} from "@/features/assessments/hooks";
import {
  type AssessmentSubmission,
  type RuntimeAssessmentItem,
  type SaveAnswerPayload,
} from "@/features/assessments/types";

type AnswerState = Record<
  string,
  | { type: "mcq"; selectedOptionIds: string[] }
  | { type: "true_false"; selections: Record<string, boolean> }
  | { type: "numeric"; answerValue: string }
  | { type: "essay"; answer: string }
>;

// Helpers to extract label content
const getLabel = (content: unknown, fallback: string) => {
  if (content && typeof content === "object") {
    if ("text" in content) {
      const text = (content as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
    if ("label" in content) {
      const label = (content as { label?: unknown }).label;
      if (typeof label === "string") return label;
    }
  }
  if (typeof content === "string") {
    return content;
  }
  return fallback;
};

const getMcqMode = (item: RuntimeAssessmentItem): "single" | "multiple" => {
  return item.answerMode === "multiple" ? "multiple" : "single";
};

// Check if a question is answered
const isAnswered = (item: RuntimeAssessmentItem, answers: AnswerState) => {
  const answer = answers[item.id];
  if (!answer) return false;
  if (answer.type === "mcq") {
    return answer.selectedOptionIds.length > 0;
  }
  if (answer.type === "true_false") {
    return Object.keys(answer.selections).length === (item.question?.options.length ?? 0);
  }
  if (answer.type === "numeric") {
    return answer.answerValue.trim().length > 0;
  }
  return answer.answer.trim().length > 0;
};

// Helper to convert form answers state to API payload format
const buildAnswerPayload = (items: RuntimeAssessmentItem[], answers: AnswerState): SaveAnswerPayload[] => {
  return items
    .map((item) => {
      const answer = answers[item.id];
      if (!answer || !isAnswered(item, answers)) {
        return null;
      }
      if (answer.type === "mcq") {
        return {
          itemId: item.id,
          type: "mcq",
          selectedOptionIds: answer.selectedOptionIds,
        } satisfies SaveAnswerPayload;
      }
      if (answer.type === "true_false") {
        return {
          itemId: item.id,
          type: "true_false",
          selections: Object.entries(answer.selections).map(([optionId, selectedValue]) => ({
            optionId,
            selectedValue,
          })),
        } satisfies SaveAnswerPayload;
      }
      if (answer.type === "numeric") {
        return {
          itemId: item.id,
          type: "numeric",
          answerValue: Number(answer.answerValue),
        } satisfies SaveAnswerPayload;
      }
      return {
        itemId: item.id,
        type: "essay",
        answer: answer.answer,
      } satisfies SaveAnswerPayload;
    })
    .filter(Boolean) as SaveAnswerPayload[];
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

// Build form answers state from a submission's previous answers
const buildAnswerStateFromSubmission = (submission: AssessmentSubmission): AnswerState => {
  const nextAnswers: AnswerState = {};
  submission.answers?.mcq.forEach((answer) => {
    nextAnswers[answer.itemId] = {
      type: "mcq",
      selectedOptionIds: answer.selectedOptionIds,
    };
  });
  submission.answers?.trueFalse.forEach((answer) => {
    const current = nextAnswers[answer.itemId];
    nextAnswers[answer.itemId] = {
      type: "true_false",
      selections: {
        ...(current?.type === "true_false" ? current.selections : {}),
        [answer.optionId]: answer.selectedValue,
      },
    };
  });
  submission.answers?.numeric.forEach((answer) => {
    nextAnswers[answer.itemId] = {
      type: "numeric",
      answerValue: answer.answerValue,
    };
  });
  submission.answers?.essay.forEach((answer) => {
    nextAnswers[answer.itemId] = {
      type: "essay",
      answer: answer.answer,
    };
  });
  return nextAnswers;
};

export default function StudentAssessmentWorkspacePage() {
  const params = useParams<{ placementId: string; submissionId: string }>();
  const router = useRouter();
  const { placementId, submissionId } = params;

  // Fetch assessment metadata
  const { data: assessment, isLoading: isLoadingAssessment } = useLearningAssessmentQuery(placementId);

  // Fetch attempt workspace (questions, PDF link, etc.)
  const { data: workspaceData, isLoading: isLoadingWorkspace } = useAssessmentWorkspaceQuery(
    placementId,
    submissionId,
  );

  const workspaceItems = useMemo(() => {
    return workspaceData?.sections?.flatMap((section) => section.items) || [];
  }, [workspaceData]);

  const sectionByItemId = useMemo(() => {
    const result = new Map<string, { id: string; title: string }>();
    for (const section of workspaceData?.sections || []) {
      for (const item of section.items) {
        result.set(item.id, { id: section.id, title: section.title });
      }
    }
    return result;
  }, [workspaceData]);

  const showSectionHeadings = (workspaceData?.sections?.length || 0) > 1;

  // Answers State
  const [answers, setAnswers] = useState<AnswerState>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const lastLoadedSubmissionId = useRef<string | null>(null);

  // Time remaining (seconds)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Quiz Mode Pagination (3 questions per page)
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 3;

  // Active question in Exam PDF Mode (answer sheet selection)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Mutations
  const saveAnswersMutation = useSaveAnswersMutation();
  const submitAttemptMutation = useSubmitAttemptMutation();

  // Sync remaining time from workspace query
  useEffect(() => {
    if (workspaceData && workspaceData.timeRemainingSeconds !== undefined && workspaceData.timeRemainingSeconds !== null) {
      setTimeLeft(workspaceData.timeRemainingSeconds);
    }
  }, [workspaceData]);

  // Set active document title
  useEffect(() => {
    if (workspaceData?.assessment?.title || assessment?.assessment?.title) {
      document.title = `${workspaceData?.assessment?.title || assessment?.assessment?.title} | HH Education`;
    }
  }, [workspaceData, assessment]);

  // Warn student before closing tab if answers are dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Bạn chưa lưu các thay đổi của bài làm. Bạn có chắc chắn muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Sync answers from workspaceData once when it loads
  useEffect(() => {
    if (workspaceData?.submission) {
      const subId = workspaceData.submission.id;
      if (subId !== lastLoadedSubmissionId.current) {
        setAnswers(buildAnswerStateFromSubmission(workspaceData.submission));
        setIsDirty(false);
        lastLoadedSubmissionId.current = subId;
      }
    }
  }, [workspaceData]);

  // Handle countdown timer ticking
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current === null) return null;
        if (current <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when time is up
  const handleAutoSubmit = async () => {
    toast.warning("Hết giờ làm bài! Hệ thống đang tự động nộp bài làm của bạn.");
    try {
      const payload = buildAnswerPayload(workspaceItems, answers);
      if (payload.length > 0) {
        await saveAnswersMutation.mutateAsync({
          submissionId,
          answers: payload,
        });
      }
      await submitAttemptMutation.mutateAsync(submissionId);
      setIsDirty(false);
      toast.success("Đã tự động nộp bài thành công!");
      router.push(`/student/assessments/${placementId}`);
    } catch (e: any) {
      toast.error("Lỗi tự động nộp bài: " + (e?.message || "Vui lòng thử lại."));
    }
  };

  // Save draft answers
  const handleSave = async (isSilent = false) => {
    const payload = buildAnswerPayload(workspaceItems, answers);
    try {
      await saveAnswersMutation.mutateAsync({
        submissionId,
        answers: payload,
      });
      setIsDirty(false);
      setLastSavedAt(new Date());
      if (!isSilent) {
        toast.success("Đã lưu nháp bài làm thành công.");
      }
    } catch (e: any) {
      if (!isSilent) {
        toast.error("Không thể lưu nháp: " + (e?.message || "Vui lòng kiểm tra kết nối mạng."));
      }
    }
  };

  // Submit assessment manually
  const handleSubmit = async () => {
    // Validation: check count of unanswered questions
    const totalCount = workspaceItems.length;
    const answeredCount = workspaceItems.filter((item) => isAnswered(item, answers)).length;
    const unansweredCount = totalCount - answeredCount;

    const confirmMessage = unansweredCount > 0
      ? `Bạn còn ${unansweredCount} câu hỏi chưa hoàn thành. Bạn có chắc chắn muốn nộp bài làm?`
      : "Bạn có chắc chắn muốn nộp bài thi? Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Save answers one last time
      const payload = buildAnswerPayload(workspaceItems, answers);
      if (payload.length > 0) {
        await saveAnswersMutation.mutateAsync({
          submissionId,
          answers: payload,
        });
      }

      // Submit attempt
      const result = await submitAttemptMutation.mutateAsync(submissionId);
      setIsDirty(false);
      router.push(`/student/assessments/${placementId}`);

      toast.success("Nộp bài thi thành công!");
    } catch (e: any) {
      toast.error("Nộp bài thất bại: " + (e?.message || "Vui lòng thử lại."));
    }
  };

  // Navigate back to overview with dirty check
  const handleLeaveTakingWorkspace = () => {
    if (isDirty) {
      if (!window.confirm("Bạn đang có bài làm chưa lưu. Nhấn OK để rời đi và mất các chỉnh sửa chưa lưu.")) {
        return;
      }
    }
    setIsDirty(false);
    router.push(`/student/assessments/${placementId}`);
  };

  const assessmentType = workspaceData?.assessment?.type ?? assessment?.assessment?.type;
  const isExam = assessmentType === "exam";

  // Active items for current Quiz page (3 questions per page)
  const quizPagesCount = Math.ceil(workspaceItems.length / questionsPerPage);
  
  const paginatedItems = useMemo(() => {
    const start = currentPage * questionsPerPage;
    return workspaceItems.slice(start, start + questionsPerPage);
  }, [workspaceItems, currentPage]);

  const totalMaxScore = useMemo(() => {
    if (workspaceItems.length === 0) return 10;
    return workspaceItems.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  }, [workspaceItems]);

  const totalQuestions = workspaceItems.length;
  
  const answeredCount = useMemo(() => {
    return workspaceItems.filter((item) => isAnswered(item, answers)).length;
  }, [workspaceItems, answers]);

  if (isLoadingAssessment || isLoadingWorkspace) {
    return (
      <div className="flex min-h-screen bg-brand-dark items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment || !workspaceData) {
    return (
      <div className="flex min-h-screen bg-brand-dark items-center justify-center">
        <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/20 max-w-xl mx-auto space-y-4">
          <AlertTriangle className="mx-auto text-error" size={48} />
          <h2 className="text-body-lg font-bold text-cream">Không thể tải phòng thi</h2>
          <p className="text-label-md text-muted-text">
            Không thể khởi chạy phòng thi. Đề thi này không tồn tại hoặc phiên thi đã kết thúc.
          </p>
          <button
            onClick={() => router.push(`/student/assessments/${placementId}`)}
            className="bg-primary hover:brightness-110 text-deep-black px-6 py-2.5 rounded-xl font-bold text-label-md transition active:scale-95 cursor-pointer"
          >
            Quay lại trang chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark flex flex-col overflow-hidden p-2 sm:p-3 animate-fadeIn text-cream font-sans">
      {/* Workspace Top Bar */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-surface-container py-2.5 px-4 rounded-xl border border-outline-variant/30 shrink-0 mb-2 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeaveTakingWorkspace}
            className="py-1 px-2.5 hover:bg-surface-container-high rounded-lg text-cream hover:text-primary transition-all active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft size={14} />
            Thoát phòng
          </button>
          <div className="h-6 w-[1px] bg-outline-variant" />
          <div>
            <h2 className="font-semibold text-sm text-cream leading-none truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {workspaceData?.assessment?.title || assessment?.assessment?.title}
            </h2>
            <span className="text-[9px] text-muted-text font-bold uppercase tracking-wider mt-0.5 block">
              {isExam ? "Phòng thi trực tuyến (PDF)" : `Phòng thi Quiz • Trang ${currentPage + 1}/${quizPagesCount}`}
            </span>
          </div>
        </div>

        {/* Timer, Actions & Progress */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="flex items-center gap-1.5 bg-primary-container/20 border border-primary/20 rounded-lg px-2.5 py-1 text-primary font-bold text-sm">
            <Clock size={14} className="animate-pulse" />
            <span className="font-mono tracking-wider">
              {timeLeft === null ? "Không giới hạn" : formatTime(timeLeft)}
            </span>
          </div>
          
          <button
            onClick={() => handleSave(false)}
            className="border border-outline-variant/60 hover:border-primary text-cream py-1 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer bg-surface-container-high"
          >
            <Save size={14} />
            Lưu tạm
          </button>
          <button
            onClick={handleSubmit}
            className="bg-primary hover:brightness-110 text-deep-black py-1 px-3 rounded-lg font-extrabold text-xs flex items-center gap-1 transition active:scale-95 shadow-md shadow-primary/10 cursor-pointer"
          >
            <Send size={14} />
            Nộp bài
          </button>
        </div>
      </header>

      {/* Question Navigation Panel (Horizontal Row) */}
      <nav className="bg-deep-black/30 border border-outline-variant/20 rounded-xl py-1.5 px-3 mb-2 flex flex-col gap-1 shrink-0">
        <div className="flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-text uppercase tracking-widest font-semibold">Tiến độ làm bài</span>
            <span className="text-muted-text/30">•</span>
            <span className="text-warning font-bold">
              {lastSavedAt ? (
                `Đã lưu nháp lúc: ${lastSavedAt.toLocaleTimeString()}`
              ) : (
                "Lưu ý: Hãy bấm \"Lưu tạm\" sau mỗi câu trả lời"
              )}
            </span>
          </div>
          <span className="text-primary font-bold">{answeredCount}/{totalQuestions} Hoàn thành</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {workspaceItems.map((item, index) => {
            const isCurrentPage = Math.floor(index / questionsPerPage) === currentPage;
            const active = isExam ? index === activeQuestionIndex : isCurrentPage;
            const answered = isAnswered(item, answers);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isExam) {
                    setActiveQuestionIndex(index);
                    // Scroll the active answer input into view on the right sheet
                    setTimeout(() => {
                      const element = document.getElementById(`ans-q-${item.id}`);
                      element?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);
                  } else {
                    setCurrentPage(Math.floor(index / questionsPerPage));
                    setTimeout(() => {
                      const element = document.getElementById(`q-${item.id}`);
                      element?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);
                  }
                }}
                className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs transition-all border ${
                  active && !isExam
                    ? answered
                      ? "bg-primary border-primary text-deep-black font-bold ring-2 ring-primary ring-offset-2 ring-offset-brand-dark shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      : "border-primary bg-primary/20 text-primary font-bold shadow-[0_0_6px_rgba(52,211,153,0.3)]"
                    : active && isExam
                    ? "border-primary bg-primary/20 text-primary font-bold shadow-[0_0_6px_rgba(52,211,153,0.3)]"
                    : answered
                    ? "bg-primary text-deep-black font-bold border-transparent"
                    : "bg-surface-container-high border-outline-variant/30 text-muted-text hover:border-primary/50"
                }`}
              >
                {item.questionNumber}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Workspace Body */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 mb-2">
        {isExam ? (
          /* ==================== PDF EXAM VIEW (Split View) ==================== */
          <>
            {/* Left Side: PDF Viewer (60%) */}
            <section className="w-[60%] bg-surface-container rounded-xl flex flex-col overflow-hidden border border-outline-variant/30 relative">
              <div className="flex items-center justify-between border-b border-outline-variant/20 px-3 py-2 bg-deep-black/60 shrink-0">
                <span className="text-xs font-bold text-cream flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  Đề thi dạng PDF gốc
                </span>
                {workspaceData?.sourceMediaUrl && (
                  <a
                    href={workspaceData.sourceMediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-caption text-primary hover:underline flex items-center gap-1 text-[11px] font-bold"
                  >
                    Mở tab mới
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              {workspaceData?.sourceMediaUrl ? (
                <iframe
                  src={workspaceData.sourceMediaUrl}
                  title="Đề thi PDF"
                  className="flex-1 w-full border-none bg-deep-black"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-deep-black text-muted-text">
                  Không tìm thấy liên kết đề thi PDF.
                </div>
              )}
            </section>

            {/* Right Side: Scrollable Full Answer Key Sheet (40%) */}
            <section className="w-[40%] bg-surface-container rounded-xl flex flex-col border border-outline-variant/30 overflow-hidden relative shadow-lg">
              <div className="py-2.5 px-3.5 border-b border-outline-variant/30 bg-surface-container-high flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ListChecks size={16} />
                  </div>
                  <h2 className="font-semibold text-sm text-cream">Phiếu đáp án (Answer Key)</h2>
                </div>
                <span className="text-[10px] text-muted-text font-bold uppercase">Tổng: {totalQuestions} câu</span>
              </div>

              {/* Progress track bar */}
              <div className="px-3.5 py-2 bg-surface-container border-b border-outline-variant/20 shrink-0">
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="text-muted-text font-semibold">Đã hoàn thành: <span className="text-primary font-bold">{answeredCount}/{totalQuestions}</span></span>
                  <span className="text-muted-text">Còn lại: {totalQuestions - answeredCount}</span>
                </div>
                <div className="w-full h-1 bg-deep-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Full Scrollable Answer Grid */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
                {workspaceItems.map((item, idx) => {
                  const isActive = idx === activeQuestionIndex;
                  const options = item.question?.options || [];
                  const mode = getMcqMode(item);
                  const itemAnswer = answers[item.id];
                  const currentSelected = itemAnswer?.type === "mcq" ? itemAnswer.selectedOptionIds : [];
                  const section = sectionByItemId.get(item.id);
                  const previousSection = idx > 0 ? sectionByItemId.get(workspaceItems[idx - 1].id) : null;
                  const showHeading = showSectionHeadings && section?.id !== previousSection?.id;

                  return (
                    <React.Fragment key={item.id}>
                    {showHeading && (
                      <h3 className="pt-2 text-sm font-bold text-primary">{section?.title}</h3>
                    )}
                    <div
                      id={`ans-q-${item.id}`}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? "bg-primary/5 border-primary shadow-md"
                          : "bg-surface-container-high/40 border-outline-variant/20 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 border-b border-outline-variant/10 pb-1">
                        <span className="font-bold text-xs text-cream">Câu {item.questionNumber}</span>
                        <span className="text-[9px] text-muted-text uppercase font-bold tracking-wider">
                          {item.itemType === "mcq" ? "Trắc nghiệm" : item.itemType === "true_false" ? "Đúng / Sai" : item.itemType === "numeric" ? "Điền số" : "Tự luận"}
                        </span>
                      </div>

                      {/* Input controls by type */}
                      {item.itemType === "mcq" && (
                        <div className="flex flex-wrap gap-2">
                          {options.map((option, oIdx) => {
                            const optionChar = String.fromCharCode(65 + oIdx);
                            const checked = currentSelected.includes(option.id);

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAnswers((prev) => {
                                    const nextSelected = mode === "single"
                                      ? [option.id]
                                      : checked
                                      ? currentSelected.filter((id) => id !== option.id)
                                      : [...currentSelected, option.id];
                                    return { ...prev, [item.id]: { type: "mcq", selectedOptionIds: nextSelected } };
                                  });
                                  setIsDirty(true);
                                  setAnswers((prev) => prev); // trigger state update
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  checked
                                    ? "bg-primary text-deep-black shadow-md font-extrabold"
                                    : "bg-surface-container border border-outline-variant/30 text-muted-text hover:border-primary"
                                }`}
                              >
                                {optionChar}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {item.itemType === "true_false" && (
                        <div className="space-y-1.5">
                          {options.map((option, oIdx) => {
                            const selections = itemAnswer?.type === "true_false" ? itemAnswer.selections : {};
                            const selected = selections[option.id];

                            return (
                              <div key={option.id} className="flex items-center justify-between text-[11px]">
                                <span className="text-on-surface-variant font-medium">
                                  {String.fromCharCode(97 + oIdx)}) Mệnh đề {oIdx + 1}
                                </span>
                                <div className="flex gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant/20">
                                  {[true, false].map((val) => (
                                    <button
                                      key={String(val)}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAnswers((prev) => {
                                          const prevAnswer = prev[item.id];
                                          return {
                                            ...prev,
                                            [item.id]: {
                                              type: "true_false",
                                              selections: {
                                                ...(prevAnswer?.type === "true_false" ? prevAnswer.selections : {}),
                                                [option.id]: val,
                                              },
                                            },
                                          };
                                        });
                                        setIsDirty(true);
                                      }}
                                      className={`px-2.5 py-0.5 text-[9px] font-bold rounded-md transition ${
                                        selected === val
                                          ? "bg-primary text-deep-black font-extrabold"
                                          : "text-muted-text hover:text-cream"
                                      }`}
                                    >
                                      {val ? "ĐÚNG" : "SAI"}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {item.itemType === "numeric" && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            step="any"
                            value={itemAnswer?.type === "numeric" ? itemAnswer.answerValue : ""}
                            onChange={(e) => {
                              setAnswers((prev) => ({
                                ...prev,
                                [item.id]: { type: "numeric", answerValue: e.target.value }
                              }));
                              setIsDirty(true);
                            }}
                            placeholder="Nhập giá trị số..."
                            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-cream outline-none focus:border-primary transition text-xs font-semibold"
                          />
                        </div>
                      )}

                      {item.itemType === "essay" && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <textarea
                            rows={3}
                            value={itemAnswer?.type === "essay" ? itemAnswer.answer : ""}
                            onChange={(e) => {
                              setAnswers((prev) => ({
                                ...prev,
                                [item.id]: { type: "essay", answer: e.target.value }
                              }));
                              setIsDirty(true);
                            }}
                            placeholder="Viết câu trả lời tự luận..."
                            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-cream outline-none focus:border-primary transition text-xs font-sans"
                          />
                        </div>
                      )}
                    </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          /* ==================== QUIZ WORKSPACE VIEW (3 Questions/Page) ==================== */
          <section className="flex-1 overflow-y-auto custom-scrollbar px-2 max-w-4xl mx-auto w-full pb-12">
            <div className="space-y-6">
              {paginatedItems.map((item, pageIndex) => {
                const options = item.question?.options || [];
                const mode = getMcqMode(item);
                const itemAnswer = answers[item.id];
                const currentSelected = itemAnswer?.type === "mcq" ? itemAnswer.selectedOptionIds : [];
                const section = sectionByItemId.get(item.id);
                const previousItem = pageIndex > 0 ? paginatedItems[pageIndex - 1] : null;
                const previousSection = previousItem ? sectionByItemId.get(previousItem.id) : null;
                const showHeading = showSectionHeadings && (pageIndex === 0 || section?.id !== previousSection?.id);

                return (
                  <React.Fragment key={item.id}>
                  {showHeading && (
                    <h2 className="pt-2 text-base font-bold text-primary">{section?.title}</h2>
                  )}
                  <div
                    id={`q-${item.id}`}
                    className="glass-panel p-8 rounded-2xl relative overflow-hidden group transition-all hover:border-primary/30"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-4 border-b border-outline-variant/20 pb-3">
                      <span className="bg-primary-container/20 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                        Câu {item.questionNumber}
                      </span>
                      <span className="text-caption text-muted-text font-bold uppercase tracking-wider text-[11px]">
                        {item.itemType === "mcq" ? "Trắc nghiệm" : item.itemType === "true_false" ? "Đúng / Sai" : item.itemType === "numeric" ? "Điền số" : "Tự luận"} • {item.maxScore} điểm
                      </span>
                    </div>

                    {/* Question content */}
                    {!!item.question?.content && (
                      <div className="text-cream text-lg font-medium leading-relaxed mb-6 font-sans">
                        {getLabel(item.question.content, "Xem nội dung câu hỏi")}
                      </div>
                    )}

                    {/* Input fields depending on type */}
                    {item.itemType === "mcq" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((option, oIdx) => {
                          const optionChar = String.fromCharCode(65 + oIdx);
                          const checked = currentSelected.includes(option.id);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setAnswers((prev) => {
                                  const nextSelected = mode === "single"
                                    ? [option.id]
                                    : checked
                                    ? currentSelected.filter((id) => id !== option.id)
                                    : [...currentSelected, option.id];
                                  return { ...prev, [item.id]: { type: "mcq", selectedOptionIds: nextSelected } };
                                });
                                setIsDirty(true);
                              }}
                              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.99] w-full ${
                                checked
                                  ? "bg-primary/10 border-primary text-primary font-bold"
                                  : "bg-surface-container border-outline-variant/30 text-cream hover:border-primary/50"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                                checked
                                  ? "bg-primary text-deep-black"
                                  : "bg-surface-container-high border border-outline-variant/30 text-muted-text"
                              }`}>
                                {optionChar}
                              </div>
                              <div className="text-sm">
                                {getLabel(option.content, `Lựa chọn ${optionChar}`)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {item.itemType === "true_false" && (
                      <div className="space-y-4">
                        {options.map((option, oIdx) => {
                          const selections = itemAnswer?.type === "true_false" ? itemAnswer.selections : {};
                          const selected = selections[option.id];
                          const optionChar = String.fromCharCode(97 + oIdx);

                          return (
                            <div
                              key={option.id}
                              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/20 bg-surface-container/40"
                            >
                              <div className="flex gap-3 text-sm">
                                <span className="text-primary font-bold">{optionChar})</span>
                                <div>{getLabel(option.content, `Mệnh đề ${oIdx + 1}`)}</div>
                              </div>
                              
                              <div className="flex gap-2 shrink-0">
                                {[true, false].map((val) => (
                                  <button
                                    key={String(val)}
                                    type="button"
                                    onClick={() => {
                                      setAnswers((prev) => {
                                        const prevAnswer = prev[item.id];
                                        return {
                                          ...prev,
                                          [item.id]: {
                                            type: "true_false",
                                            selections: {
                                              ...(prevAnswer?.type === "true_false" ? prevAnswer.selections : {}),
                                              [option.id]: val,
                                            },
                                          },
                                        };
                                      });
                                      setIsDirty(true);
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                      selected === val
                                        ? "bg-primary text-deep-black"
                                        : "bg-surface-container-high border border-outline-variant/30 text-muted-text hover:text-cream"
                                    }`}
                                  >
                                    {val ? "Đúng" : "Sai"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {item.itemType === "numeric" && (
                      <div className="max-w-md">
                        <input
                          type="number"
                          step="any"
                          value={itemAnswer?.type === "numeric" ? itemAnswer.answerValue : ""}
                          onChange={(e) => {
                            setAnswers((prev) => ({
                              ...prev,
                              [item.id]: { type: "numeric", answerValue: e.target.value }
                            }));
                            setIsDirty(true);
                          }}
                          placeholder="Nhập giá trị số..."
                          className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-cream outline-none focus:border-primary transition text-sm font-semibold"
                        />
                      </div>
                    )}

                    {item.itemType === "essay" && (
                      <div>
                        <textarea
                          rows={4}
                          value={itemAnswer?.type === "essay" ? itemAnswer.answer : ""}
                          onChange={(e) => {
                            setAnswers((prev) => ({
                              ...prev,
                              [item.id]: { type: "essay", answer: e.target.value }
                            }));
                            setIsDirty(true);
                          }}
                          placeholder="Viết câu trả lời tự luận ở đây..."
                          className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-cream outline-none focus:border-primary transition text-sm font-sans"
                        />
                      </div>
                    )}
                  </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pagination controls for Quiz */}
            {quizPagesCount > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-highest text-cream disabled:opacity-30 transition cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: quizPagesCount }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCurrentPage(i);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-10 h-10 rounded-full font-bold transition flex items-center justify-center cursor-pointer ${
                        currentPage === i
                          ? "bg-primary text-deep-black"
                          : "border border-outline-variant/30 text-cream hover:bg-surface-container-highest"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={currentPage === quizPagesCount - 1}
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-highest text-cream disabled:opacity-30 transition cursor-pointer"
                >
                  <ChevronRightIcon size={18} />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
