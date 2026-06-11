"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleDot,
  Clock,
  FileText,
  Loader2,
  Lock,
  SquarePen,
} from "lucide-react";
import { usePublicAssessmentDetailQuery } from "../hooks";
import { useAuthStore } from "@/stores/auth-store";
import { type Subject } from "@/types/common";

const subjectLabel: Record<Subject, string> = {
  math: "Toán học",
  physics: "Vật lý",
  chemistry: "Hóa học",
  literature: "Ngữ văn",
  english: "Tiếng Anh",
  biology: "Sinh học",
  history: "Lịch sử",
  geography: "Địa lý",
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Không giới hạn";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function PublicPracticeDetail() {
  const params = useParams<{ placementRef: string }>();
  const placementRef = params.placementRef;

  const { data: assessment, isLoading } = usePublicAssessmentDetailQuery(placementRef);
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (assessment?.assessment?.title) {
      document.title = `${assessment.assessment.title} | HH Education`;
    }
  }, [assessment]);

  const totalScore = useMemo(() => {
    if (!assessment) {
      return 0;
    }
    return assessment.sections
      .flatMap((section) => section.items)
      .reduce((sum, item) => sum + Number(item.maxScore), 0);
  }, [assessment]);

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-[900px] px-6 pt-32 text-center text-cream">
        <FileText className="mx-auto mb-3 text-muted-text" size={42} />
        <h1 className="text-2xl font-black">Không tìm thấy đề luyện tập</h1>
        <Link
          href="/practice"
          className="mt-5 inline-flex items-center gap-2 rounded bg-brand-pink px-5 py-2.5 text-sm font-black text-brand-dark"
        >
          <ArrowLeft size={15} />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const callbackUrl = `/student/assessments/${assessment.id}`;

  const renderActionButton = () => {
    if (!hasHydrated) {
      return (
        <button
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-pink/50 px-4 py-3.5 text-sm font-black text-brand-dark cursor-not-allowed"
        >
          <Loader2 className="h-4 w-4 animate-spin text-brand-dark" />
          Đang kiểm tra thông tin...
        </button>
      );
    }

    const now = new Date();
    const openTime = assessment.openTime ? new Date(assessment.openTime) : null;
    const closeTime = assessment.closeTime ? new Date(assessment.closeTime) : null;

    if (openTime && now < openTime) {
      return (
        <button
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-muted-text/30 px-4 py-3.5 text-sm font-black text-muted-text cursor-not-allowed border border-border-dark"
        >
          <Lock size={16} />
          Chưa đến thời gian làm bài
        </button>
      );
    }

    if (closeTime && now > closeTime) {
      return (
        <button
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-muted-text/20 px-4 py-3.5 text-sm font-black text-muted-text cursor-not-allowed border border-border-dark"
        >
          <Lock size={16} />
          Đã kết thúc thời gian làm bài
        </button>
      );
    }

    if (isAuthenticated) {
      return (
        <Link
          href={callbackUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-pink px-4 py-3.5 text-sm font-black text-brand-dark transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-brand-pink/20"
        >
          Vào làm bài
        </Link>
      );
    }

    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-pink px-4 py-3.5 text-sm font-black text-brand-dark transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-brand-pink/20"
      >
        <Lock size={16} />
        Đăng nhập để làm bài
      </Link>
    );
  };

  return (
    <div className="pt-28 text-cream">
      <div className="mx-auto max-w-[800px] px-6 py-8">
        <Link
          href="/practice"
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase text-muted-text transition hover:text-brand-pink"
        >
          <ArrowLeft size={14} />
          Danh sách đề luyện
        </Link>

        <div className="overflow-hidden rounded-lg border border-border-dark bg-deep-black shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-brand-pink to-purple-600" />
          
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded bg-brand-pink/10 px-2.5 py-1 text-[11px] font-black uppercase text-brand-pink">
                {subjectLabel[assessment.assessment.subject] ?? assessment.assessment.subject} Lớp {assessment.assessment.grade}
              </span>
              <span className="rounded bg-off-black px-2.5 py-1 text-[11px] font-black uppercase text-muted-text">
                {assessment.assessment.type === "exam" ? "Đề thi PDF" : "Quiz trắc nghiệm"}
              </span>
              <span className="rounded bg-off-black px-2.5 py-1 text-[11px] font-black uppercase text-muted-text">
                {assessment.sections.flatMap((section) => section.items).length} câu hỏi
              </span>
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-cream sm:text-4xl">
              {assessment.assessment.title}
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-text">
              Đây là đề luyện tập công khai. Để thực hiện làm bài, ghi nhận kết quả và lưu lịch sử học tập, 
              vui lòng xác nhận các thông tin chi tiết dưới đây.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded border border-border-dark bg-off-black p-4 flex items-start gap-3">
                <Clock className="mt-0.5 text-brand-pink shrink-0" size={18} />
                <div>
                  <div className="text-xs font-black uppercase text-muted-text">Thời gian làm bài</div>
                  <div className="mt-1 text-sm font-bold text-cream">
                    {assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} phút` : "Tự do (Không giới hạn)"}
                  </div>
                </div>
              </div>

              <div className="rounded border border-border-dark bg-off-black p-4 flex items-start gap-3">
                <BookOpenCheck className="mt-0.5 text-brand-pink shrink-0" size={18} />
                <div>
                  <div className="text-xs font-black uppercase text-muted-text">Điểm tối đa</div>
                  <div className="mt-1 text-sm font-bold text-cream">
                    {totalScore} điểm
                  </div>
                </div>
              </div>

              <div className="rounded border border-border-dark bg-off-black p-4 flex items-start gap-3">
                <SquarePen className="mt-0.5 text-brand-pink shrink-0" size={18} />
                <div>
                  <div className="text-xs font-black uppercase text-muted-text">Số lượt làm tối đa</div>
                  <div className="mt-1 text-sm font-bold text-cream">
                    {assessment.maxAttempts ? `${assessment.maxAttempts} lượt` : "Không giới hạn"}
                  </div>
                </div>
              </div>

              <div className="rounded border border-border-dark bg-off-black p-4 flex items-start gap-3">
                <CircleDot className="mt-0.5 text-brand-pink shrink-0" size={18} />
                <div>
                  <div className="text-xs font-black uppercase text-muted-text">Hình thức chấm</div>
                  <div className="mt-1 text-sm font-bold text-cream">
                    {assessment.assessment.gradingType === "auto" 
                      ? "Tự động chấm" 
                      : assessment.assessment.gradingType === "manual" 
                      ? "Giáo viên chấm" 
                      : "Tự động & Giáo viên chấm"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded border border-border-dark bg-off-black p-4 flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs font-black uppercase text-muted-text">Thời gian mở đề</div>
                  <div className="mt-1 text-sm font-bold text-cream">
                    {formatDate(assessment.openTime)}
                  </div>
                </div>
              </div>

              <div className="rounded border border-border-dark bg-off-black p-4 flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                <div>
                  <div className="text-xs font-black uppercase text-muted-text">Thời gian đóng đề</div>
                  <div className="mt-1 text-sm font-bold text-cream">
                    {formatDate(assessment.closeTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border-dark pt-6">
              <h3 className="text-sm font-black uppercase text-cream tracking-wider mb-3">Quy tắc và hướng dẫn làm bài</h3>
              <ul className="space-y-2 text-xs leading-5 text-muted-text list-disc list-inside">
                <li>Kết quả bài thi sẽ được lưu tự động trong quá trình làm bài.</li>
                <li>Bạn có thể nộp bài bất kỳ lúc nào hoặc hệ thống tự động nộp khi hết giờ.</li>
                <li>Hãy chắc chắn thiết bị của bạn có kết nối internet ổn định trước khi bắt đầu.</li>
              </ul>
            </div>

            <div className="mt-8">
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
