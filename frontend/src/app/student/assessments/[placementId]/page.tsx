"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Loader2,
  ChevronRight,
  PlayCircle,
  History,
  Info,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLearningAssessmentQuery,
  useStartAttemptMutation,
} from "@/features/assessments/hooks";
import {
  AssessmentHeaderBadges,
  AssessmentMetadataGrid,
  AssessmentRulesInstructions,
} from "@/features/assessments/components/assessment-details-shared";
import { type AssessmentSubmission } from "@/features/assessments/types";

export default function StudentAssessmentRuntimePage() {
  const params = useParams<{ placementId: string }>();
  const router = useRouter();
  const placementId = params.placementId;

  // TanStack Query to fetch assessment metadata
  const {
    data: assessment,
    isLoading,
    error,
  } = useLearningAssessmentQuery(placementId);

  // Calculate total max score from assessment items
  const totalMaxScore = useMemo(() => {
    const items =
      assessment?.sections?.flatMap((section) => section.items) || [];
    if (items.length === 0) return 10;
    return items.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  }, [assessment]);

  // Mutations
  const startAttemptMutation = useStartAttemptMutation();

  // Retrieve submissions list from database
  const submissionsList = useMemo(() => {
    return assessment?.submissions || [];
  }, [assessment]);

  // Check if there is an active draft/doing attempt in history
  const activeDraftAttempt = useMemo(() => {
    return submissionsList.find((sub) => sub.status === "doing");
  }, [submissionsList]);

  // Set active document title
  useEffect(() => {
    if (assessment?.assessment?.title) {
      document.title = `${assessment.assessment.title} | HH Education`;
    }
  }, [assessment]);

  // Start or resume an attempt
  const handleStart = async () => {
    try {
      // Call start attempt endpoint
      const submissionData =
        await startAttemptMutation.mutateAsync(placementId);
      toast.success(
        submissionData.status === "doing"
          ? "Đã khôi phục bài thi cũ!"
          : "Bắt đầu làm bài thi mới.",
      );
      router.push(
        `/student/assessments/${placementId}/workspace/${submissionData.id}`,
      );
    } catch (e: any) {
      toast.error(
        "Không thể khởi động lượt làm bài: " +
          (e?.message || "Hết lượt hoặc quá hạn."),
      );
    }
  };

  const max = assessment?.maxAttempts ?? null;
  const used = submissionsList.length;

  if (isLoading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/20 max-w-xl mx-auto space-y-4">
        <AlertTriangle className="mx-auto text-error" size={48} />
        <h2 className="text-body-lg font-bold text-cream">
          Không tìm thấy bài kiểm tra
        </h2>
        <p className="text-label-md text-muted-text">
          Đề thi này không tồn tại, đã bị gỡ bỏ hoặc bạn không có quyền truy cập
          (chưa đăng ký khóa học).
        </p>
        <button
          onClick={() => router.push("/student/assessments")}
          className="bg-primary hover:brightness-110 text-deep-black px-6 py-2.5 rounded-xl font-bold text-label-md transition active:scale-95 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const now = new Date();
  const isOpen = assessment.openTime
    ? new Date(assessment.openTime) <= now
    : true;
  const isClosed = assessment.closeTime
    ? new Date(assessment.closeTime) < now
    : false;

  return (
    <div className="space-y-8 animate-fadeIn pb-24 xl:pb-8">
      {/* Breadcrumbs */}
      <nav className="mb-4">
        <ul className="flex items-center gap-2 text-caption text-muted-text font-body-md text-sm">
          <li>
            <Link
              href="/student"
              className="hover:text-primary transition-colors"
            >
              Không gian học tập
            </Link>
          </li>
          <li>
            <ChevronRight size={14} className="text-muted-text/60" />
          </li>
          <li>
            <Link
              href="/student/assessments"
              className="hover:text-primary transition-colors"
            >
              Bài kiểm tra
            </Link>
          </li>
          <li>
            <ChevronRight size={14} className="text-muted-text/60" />
          </li>
          <li className="text-cream font-medium">Chi tiết</li>
        </ul>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 items-start">
        {/* Left Column - Details & Attempts Table */}
        <div className="xl:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-4">
            <AssessmentHeaderBadges assessment={assessment} />
            <h1 className="font-headline-h2 text-headline-h2 text-cream leading-tight">
              {assessment.assessment.title}
            </h1>
          </div>

          {/* Metadata Grid (Bento) */}
          <AssessmentMetadataGrid assessment={assessment} />

          {/* Warnings callout */}
          <AssessmentRulesInstructions />

          {/* Attempts History */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-h2 text-2xl text-cream">
                Lịch sử làm bài
              </h2>
              <span className="text-primary text-sm font-semibold cursor-pointer hover:underline">
                Xem thống kê chi tiết
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-surface-container-high bg-deep-black shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-highest border-b border-outline-variant/30">
                    <tr>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">
                        #
                      </th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">
                        Bắt đầu
                      </th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">
                        Nộp bài
                      </th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">
                        Điểm
                      </th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">
                        Chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {submissionsList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-muted-text text-label-md"
                        >
                          Bạn chưa thực hiện lượt làm bài nào cho đề thi này.
                        </td>
                      </tr>
                    ) : (
                      submissionsList.map((sub) => {
                        const isDoing = sub.status === "doing";
                        const isSubmitted = sub.status === "submitted";

                        let statusBadge = (
                          <span className="px-2.5 py-0.5 rounded bg-success/20 text-success text-xs font-bold whitespace-nowrap">
                            Hoàn thành
                          </span>
                        );
                        if (isDoing) {
                          statusBadge = (
                            <span className="px-2.5 py-0.5 rounded bg-warning/20 text-warning text-xs font-bold whitespace-nowrap animate-pulse">
                              Đang làm
                            </span>
                          );
                        } else if (isSubmitted) {
                          statusBadge = (
                            <span className="px-2.5 py-0.5 rounded bg-secondary/20 text-secondary text-xs font-bold whitespace-nowrap">
                              Đang chờ chấm
                            </span>
                          );
                        }

                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-surface-container-low transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-cream text-label-md">
                              #{sub.attemptNumber}
                            </td>
                            <td className="px-6 py-4 text-muted-text text-caption">
                              {sub.startTime
                                ? new Date(sub.startTime).toLocaleString(
                                    "vi-VN",
                                  )
                                : "--"}
                            </td>
                            <td className="px-6 py-4 text-muted-text text-caption">
                              {sub.submitTime
                                ? new Date(sub.submitTime).toLocaleString(
                                    "vi-VN",
                                  )
                                : "--"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {statusBadge}
                            </td>
                            <td className="px-6 py-4 font-bold text-primary text-label-md font-mono whitespace-nowrap">
                              {isDoing
                                ? "--"
                                : `${sub.finalScore || sub.autoScore || "0.0"} / ${totalMaxScore}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isDoing ? (
                                <button
                                  onClick={handleStart}
                                  className="bg-primary hover:bg-primary/90 text-deep-black px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
                                >
                                  Làm tiếp
                                  <ChevronRight size={12} />
                                </button>
                              ) : (
                                <button className="text-primary hover:underline flex items-center gap-1 font-medium text-sm cursor-pointer whitespace-nowrap">
                                  <Info size={16} /> Xem chi tiết
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Status Panel & Resource Cards */}
        <div className="xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-off-black border border-primary/20 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />

              <h3 className="font-headline-h2 text-xl text-cream">
                Thông tin lượt làm bài
              </h3>

              <div className="space-y-4">
                {activeDraftAttempt ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/20 text-warning font-bold text-xs border border-warning/30">
                    <span className="w-2 h-2 bg-warning rounded-full animate-ping" />
                    ĐANG CÓ LƯỢT LÀM DANG DỞ
                  </div>
                ) : (
                  <div className="text-label-md text-muted-text leading-relaxed">
                    Bạn đã thực hiện{" "}
                    <span className="text-primary font-bold">{used}</span> trên{" "}
                    <span className="text-primary font-bold">{max ?? "∞"}</span>{" "}
                    lượt làm bài cho phép.
                  </div>
                )}
              </div>

              {/* Actions CTA */}
              <div className="fixed bottom-0 left-0 right-0 z-40  backdrop-blur-sm p-4 border-t border-outline-variant/20 flex flex-row-reverse gap-3 space-y-0 shadow-2xl xl:relative xl:bottom-auto xl:left-auto xl:right-auto xl:z-auto xl:bg-transparent xl:p-0 xl:border-t xl:border-surface-container-high xl:flex-col xl:space-y-3 xl:pt-6 xl:shadow-none">
                {isClosed ? (
                  <div className="w-full flex-1 xl:flex-none bg-surface-container text-muted-text py-4 rounded-xl text-center text-body-md font-bold flex items-center justify-center gap-2 border border-outline-variant/30 cursor-not-allowed">
                    <AlertTriangle size={18} className="text-error" />
                    Đã hết hạn làm bài thi
                  </div>
                ) : !isOpen ? (
                  <div className="w-full flex-1 xl:flex-none bg-surface-container text-muted-text py-4 rounded-xl text-center text-body-md font-bold flex flex-col items-center justify-center gap-1 border border-outline-variant/30 cursor-not-allowed">
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={18}
                        className="text-warning animate-pulse"
                      />
                      Chưa mở
                    </div>
                    <span className="text-xs text-muted-text/80 font-normal">
                      Mở:{" "}
                      {new Date(assessment.openTime!).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                ) : activeDraftAttempt ? (
                  <button
                    onClick={handleStart}
                    className="w-full flex-1 xl:flex-none bg-warning hover:bg-warning/95 text-deep-black py-4 rounded-xl font-bold text-body-md flex items-center justify-center gap-1.5 transition duration-200 active:scale-95 cursor-pointer shadow-lg shadow-warning/10"
                  >
                    <PlayCircle size={18} />
                    Tiếp tục (Lượt #{activeDraftAttempt.attemptNumber})
                  </button>
                ) : max && used >= max ? (
                  <div className="w-full flex-1 xl:flex-none bg-surface-container text-muted-text py-4 rounded-xl text-center text-body-md font-bold flex items-center justify-center gap-2 border border-outline-variant/30 cursor-not-allowed">
                    <AlertTriangle
                      size={18}
                      className="text-error animate-pulse"
                    />
                    Hết lượt
                  </div>
                ) : (
                  <button
                    onClick={handleStart}
                    className="w-full flex-1 xl:flex-none bg-primary hover:bg-primary/95 text-deep-black py-4 rounded-xl font-bold text-body-md flex items-center justify-center gap-1.5 transition duration-200 active:scale-95 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    <PlayCircle size={18} />
                    Bắt đầu
                  </button>
                )}

                <Link
                  href="/student/assessments"
                  className="w-full flex-1 xl:flex-none bg-surface-container border border-outline-variant/50 text-cream hover:bg-surface-container-high py-4 rounded-xl font-semibold text-body-md flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <ArrowLeft size={16} />
                  Quay lại
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

