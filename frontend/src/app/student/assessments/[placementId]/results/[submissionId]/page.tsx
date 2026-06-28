"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock3, FileText, Loader2 } from "lucide-react";

import { SubmissionResultQuestion } from "@/features/assessments/components/submission-result-question";
import { SubmissionResultSummary } from "@/features/assessments/components/submission-result-summary";
import { useStudentSubmissionResultQuery } from "@/features/assessments/hooks";

export default function StudentSubmissionResultPage() {
  const { placementId, submissionId } = useParams<{
    placementId: string;
    submissionId: string;
  }>();
  const resultQuery = useStudentSubmissionResultQuery(submissionId);

  if (resultQuery.isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-admin-muted">
          <Loader2 className="animate-spin text-admin-pink" size={20} />
          Đang tải kết quả bài làm...
        </div>
      </div>
    );
  }

  if (resultQuery.isError || !resultQuery.data) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-red-400/25 bg-red-400/10 p-6 text-center">
        <h1 className="font-semibold text-red-200">
          Không thể mở kết quả bài làm
        </h1>
        <p className="mt-2 text-sm text-admin-muted">
          Bài làm không tồn tại, chưa được nộp hoặc không thuộc tài khoản của
          bạn.
        </p>
        <Link
          href={`/student/assessments/${placementId}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-admin-pink hover:underline"
        >
          <ArrowLeft size={15} /> Quay lại bài kiểm tra
        </Link>
      </div>
    );
  }

  const result = resultQuery.data;

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
      <header>
        <Link
          href={`/student/assessments/${placementId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-admin-muted transition-colors hover:text-admin-pink"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Lịch sử làm bài
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-admin-cream">
          {result.assessment.title}
        </h1>
        <p className="mt-1 text-sm text-admin-muted">
          Chi tiết kết quả lượt làm thứ {result.attempt.attemptNumber}
          {result.attempt.submitTime
            ? ` · Nộp lúc ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(result.attempt.submitTime))}`
            : ""}
        </p>
      </header>

      {!result.reviewAvailable ? (
        <section className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-6 py-10 text-center">
          <Clock3
            className="mx-auto text-amber-300"
            size={30}
            aria-hidden="true"
          />
          <h2 className="mt-3 text-lg font-semibold text-admin-cream">
            Bài làm đang chờ giáo viên chấm
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-admin-muted">
            Điểm và đáp án chi tiết sẽ được mở sau khi phần tự luận được chấm và
            kết quả cuối cùng được xác nhận.
          </p>
        </section>
      ) : (
        <>
          <SubmissionResultSummary result={result} />
          <div
            className={
              result.assessment.type === "exam" &&
              result.assessment.sourceMediaUrl
                ? "grid items-start gap-5 xl:grid-cols-[minmax(360px,42%)_1fr]"
                : ""
            }
          >
            {result.assessment.type === "exam" &&
              result.assessment.sourceMediaUrl && (
                <aside className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low xl:sticky xl:top-24">
                  <div className="flex items-center justify-between border-b border-admin-border/25 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-admin-cream">
                      <FileText size={15} className="text-admin-pink" /> Đề thi
                      PDF
                    </span>
                    <a
                      href={result.assessment.sourceMediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-admin-pink hover:underline"
                    >
                      Mở tab mới
                    </a>
                  </div>
                  <iframe
                    src={result.assessment.sourceMediaUrl}
                    title={`Đề thi ${result.assessment.title}`}
                    className="h-[72vh] min-h-[560px] w-full bg-white"
                  />
                </aside>
              )}

            <main className="space-y-5">
              {result.sections.map((section) => (
                <section
                  key={section.id}
                  className="space-y-3"
                  aria-labelledby={`result-section-${section.id}`}
                >
                  <div>
                    <h2
                      id={`result-section-${section.id}`}
                      className="text-lg font-bold text-admin-cream"
                    >
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="mt-1 text-sm text-admin-muted">
                        {section.description}
                      </p>
                    )}
                  </div>
                  {section.items.map((item) => (
                    <SubmissionResultQuestion
                      key={item.id}
                      item={item}
                      isPdfExam={result.assessment.type === "exam"}
                    />
                  ))}
                </section>
              ))}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
