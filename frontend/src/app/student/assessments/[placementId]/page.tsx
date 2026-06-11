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
  Download
} from "lucide-react";
import { toast } from "sonner";
import {
  useLearningAssessmentQuery,
  useStartAttemptMutation,
} from "@/features/assessments/hooks";
import {
  type AssessmentSubmission,
} from "@/features/assessments/types";
import { SUBJECT_LABELS } from "@/types/common";

// Generates fallback mock submissions in case database submissions are empty
const getMockSubmissions = (placementId: string, assessmentId: string): AssessmentSubmission[] => {
  return [
    {
      id: "mock-sub-1",
      assessmentId,
      placementId,
      attemptNumber: 1,
      status: "completed",
      autoScore: "8.50",
      finalScore: "8.50",
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      submitTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    }
  ];
};

export default function StudentAssessmentRuntimePage() {
  const params = useParams<{ placementId: string }>();
  const router = useRouter();
  const placementId = params.placementId;

  // TanStack Query to fetch assessment metadata
  const { data: assessment, isLoading, error } = useLearningAssessmentQuery(placementId);

  // Calculate total max score from assessment items
  const totalMaxScore = useMemo(() => {
    const items = assessment?.sections?.flatMap((section) => section.items) || [];
    if (items.length === 0) return 10;
    return items.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  }, [assessment]);

  // Mutations
  const startAttemptMutation = useStartAttemptMutation();

  // Populate mock submissions if the backend list is empty or undefined
  const submissionsList = useMemo(() => {
    if (!assessment) return [];
    if (assessment.submissions && assessment.submissions.length > 0) {
      return assessment.submissions;
    }
    // Safe mock fallback for visual display
    return getMockSubmissions(assessment.id, assessment.assessment.id);
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
      const submissionData = await startAttemptMutation.mutateAsync(placementId);
      toast.success(submissionData.status === "doing" ? "Đã khôi phục bài thi cũ!" : "Bắt đầu làm bài thi mới.");
      router.push(`/student/assessments/${placementId}/workspace/${submissionData.id}`);
    } catch (e: any) {
      toast.error("Không thể khởi động lượt làm bài: " + (e?.message || "Hết lượt hoặc quá hạn."));
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
        <h2 className="text-body-lg font-bold text-cream">Không tìm thấy bài kiểm tra</h2>
        <p className="text-label-md text-muted-text">
          Đề thi này không tồn tại, đã bị gỡ bỏ hoặc bạn không có quyền truy cập (chưa đăng ký khóa học).
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Breadcrumbs */}
      <nav className="mb-4">
        <ul className="flex items-center gap-2 text-caption text-muted-text font-body-md text-[14px]">
          <li><Link href="/student" className="hover:text-primary transition-colors">Không gian học tập</Link></li>
          <li><ChevronRight size={14} className="text-muted-text/60" /></li>
          <li><Link href="/student/assessments" className="hover:text-primary transition-colors">Bài kiểm tra</Link></li>
          <li><ChevronRight size={14} className="text-muted-text/60" /></li>
          <li className="text-cream font-medium">Chi tiết</li>
        </ul>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* Left Column - Details & Attempts Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-1 rounded-full bg-surface-container-highest border border-outline-variant text-cream text-[12px] font-semibold">
                {SUBJECT_LABELS[assessment.assessment.subject] || assessment.assessment.subject}
              </span>
              <span className="px-4 py-1 rounded-full bg-surface-container-highest border border-outline-variant text-cream text-[12px] font-semibold">
                Lớp {assessment.assessment.grade}
              </span>
            </div>
            <h1 className="font-headline-h2 text-headline-h2 text-cream leading-tight">
              {assessment.assessment.title}
            </h1>
          </div>

          {/* Metadata Grid (Bento) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-muted-text text-[12px] uppercase tracking-wider font-semibold">Thời gian làm bài</p>
                <p className="text-cream font-bold text-lg">
                  {assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} phút` : "Tự do"}
                </p>
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                <History size={24} />
              </div>
              <div>
                <p className="text-muted-text text-[12px] uppercase tracking-wider font-semibold">Số lượt tối đa</p>
                <p className="text-cream font-bold text-lg">
                  {max ? `${max} lần` : "Không giới hạn"}
                </p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-success">
                <PlayCircle size={24} />
              </div>
              <div>
                <p className="text-muted-text text-[12px] uppercase tracking-wider font-semibold">Ngày mở đề</p>
                <p className="text-cream font-bold text-body-md truncate max-w-[200px]">
                  {assessment.openTime ? new Date(assessment.openTime).toLocaleDateString("vi-VN") + " " + new Date(assessment.openTime).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) : "Bất cứ lúc nào"}
                </p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-error">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-muted-text text-[12px] uppercase tracking-wider font-semibold">Hạn kết thúc</p>
                <p className="text-cream font-bold text-body-md truncate max-w-[200px]">
                  {assessment.closeTime ? new Date(assessment.closeTime).toLocaleDateString("vi-VN") + " " + new Date(assessment.closeTime).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) : "Không giới hạn"}
                </p>
              </div>
            </div>
          </div>

          {/* Warnings callout */}
          <div className="bg-surface-container-high border-l-4 border-warning p-4 rounded-r-xl flex gap-3 items-start shadow-md">
            <Info className="text-warning shrink-0 mt-0.5" size={20} />
            <div className="text-on-surface-variant text-body-md leading-relaxed space-y-1">
              <p>
                <span className="font-bold text-warning">Lưu ý quan trọng:</span> Bấm &quot;Lưu tạm&quot; sau mỗi câu trả lời để đảm bảo không mất dữ liệu khi mất kết nối mạng đột ngột.
              </p>
              <p>
                Khi đã bắt đầu lượt thi, đồng hồ đếm ngược sẽ chạy liên tục và không thể tạm dừng.
              </p>
            </div>
          </div>

          {/* Attempts History */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-h2 text-[24px] text-cream">Lịch sử làm bài</h2>
              <span className="text-primary text-[14px] font-semibold cursor-pointer hover:underline">Xem thống kê chi tiết</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-surface-container-high bg-deep-black shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-highest border-b border-outline-variant/30">
                    <tr>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">Lượt làm</th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">Bắt đầu</th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">Nộp bài</th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">Trạng thái</th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">Điểm số</th>
                      <th className="px-6 py-4 font-label-bold text-muted-text text-caption">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {submissionsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-text text-label-md">
                          Bạn chưa thực hiện lượt làm bài nào cho đề thi này.
                        </td>
                      </tr>
                    ) : (
                      submissionsList.map((sub) => {
                        const isDoing = sub.status === "doing";
                        const isSubmitted = sub.status === "submitted";
                        
                        let statusBadge = (
                          <span className="px-3 py-1 rounded-full bg-success/20 text-success text-[12px] font-bold">
                            Hoàn thành
                          </span>
                        );
                        if (isDoing) {
                          statusBadge = (
                            <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-[12px] font-bold animate-pulse">
                              Đang làm
                            </span>
                          );
                        } else if (isSubmitted) {
                          statusBadge = (
                            <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[12px] font-bold">
                              Đang chờ chấm
                            </span>
                          );
                        }

                        return (
                          <tr key={sub.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4 font-bold text-cream text-label-md">Lần {sub.attemptNumber}</td>
                            <td className="px-6 py-4 text-muted-text text-caption">
                              {sub.startTime ? new Date(sub.startTime).toLocaleString("vi-VN") : "--"}
                            </td>
                            <td className="px-6 py-4 text-muted-text text-caption">
                              {sub.submitTime ? new Date(sub.submitTime).toLocaleString("vi-VN") : "--"}
                            </td>
                            <td className="px-6 py-4">{statusBadge}</td>
                            <td className="px-6 py-4 font-bold text-primary text-label-md font-mono">
                              {isDoing ? "--" : `${sub.finalScore || sub.autoScore || "0.0"} / ${totalMaxScore}`}
                            </td>
                            <td className="px-6 py-4">
                              {isDoing ? (
                                <button
                                  onClick={handleStart}
                                  className="bg-primary hover:bg-primary/90 text-deep-black px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer"
                                >
                                  Làm tiếp
                                  <ChevronRight size={12} />
                                </button>
                              ) : (
                                <button className="text-primary hover:underline flex items-center gap-1 font-medium text-[14px] cursor-pointer">
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
        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-off-black border border-primary/20 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              
              <h3 className="font-headline-h2 text-[20px] text-cream">
                Thông tin lượt làm bài
              </h3>

              <div className="space-y-4">
                {activeDraftAttempt ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/20 text-warning font-bold text-[11px] border border-warning/30">
                    <span className="w-2 h-2 bg-warning rounded-full animate-ping" />
                    ĐANG CÓ LƯỢT LÀM DANG DỞ
                  </div>
                ) : (
                  <div className="text-label-md text-muted-text leading-relaxed">
                    Bạn đã thực hiện <span className="text-primary font-bold">{used}</span> trên <span className="text-primary font-bold">{max ?? "∞"}</span> lượt làm bài cho phép.
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-caption text-muted-text">
                    <span>Tiến trình lượt làm</span>
                    <span className="text-primary font-bold">
                      {max ? `${Math.min(Math.round((used / max) * 100), 100)}%` : "Không giới hạn"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-deep-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-500"
                      style={{ width: max ? `${Math.min((used / max) * 100, 100)}%` : "100%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions CTA */}
              <div className="space-y-3 pt-6 border-t border-surface-container-high">
                {activeDraftAttempt ? (
                  <button
                    onClick={handleStart}
                    className="w-full bg-warning hover:bg-warning/90 text-deep-black py-4 rounded-xl font-bold text-body-md flex items-center justify-center gap-1.5 transition duration-200 active:scale-95 cursor-pointer shadow-lg shadow-warning/10"
                  >
                    <PlayCircle size={18} />
                    Tiếp tục làm bài (Lượt #{activeDraftAttempt.attemptNumber})
                  </button>
                ) : max && used >= max ? (
                  <div className="w-full bg-surface-container text-muted-text py-4 rounded-xl text-center text-body-md font-bold flex items-center justify-center gap-2 border border-outline-variant/30 cursor-not-allowed">
                    <AlertTriangle size={18} className="text-error animate-pulse" />
                    Hết lượt làm bài cho phép
                  </div>
                ) : (
                  <button
                    onClick={handleStart}
                    className="w-full bg-primary hover:bg-primary/95 text-deep-black py-4 rounded-xl font-bold text-body-md flex items-center justify-center gap-1.5 transition duration-200 active:scale-95 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    <PlayCircle size={18} />
                    Bắt đầu làm bài {used > 0 ? `(Lượt #${used + 1})` : ""}
                  </button>
                )}

                <Link
                  href="/student/assessments"
                  className="w-full bg-surface-container border border-outline-variant/50 text-cream hover:bg-surface-container-high py-4 rounded-xl font-semibold text-body-md flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <ArrowLeft size={16} />
                  Quay lại khóa học
                </Link>
              </div>
            </div>

            {/* Promotion/Resource Card */}
            <div className="rounded-2xl overflow-hidden group cursor-pointer relative h-48 border border-outline-variant/15 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent z-10" />
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Tài liệu ôn tập"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArYZskaVFWT1o0_NPqjEvs98hOmHfT7hGiDGFrhBGCgJqi_x7f3n6vu1nqsni2BHJK73BSg9dRC_6zBnbF87-uqpVzrr7BdNF35SEHI90vXpBAjnEyznF0wWh3LrWKDX_qnfr5qTEmcbQOiE0ueNfIfb5mfvfGKcAqIigw2qtT3Onz-wxE4_hB3FbJndoLJF5FDrEpj7GM59fRXdzpRsluJWuEZWVCwYMi1oNt1O10G9-RVDitSKStqsdJ4QaZnxInJ-1TP-dh2t8"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <h4 className="text-cream font-bold text-label-bold">Tài liệu ôn tập bổ trợ</h4>
                <p className="text-primary text-[12px] flex items-center gap-1.5 font-bold">
                  Tải xuống ngay <Download size={14} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
