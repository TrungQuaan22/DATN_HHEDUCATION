"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { AssessmentResultStats } from "@/features/assessments/components/assessment-result-stats";
import { AssessmentResultsTable } from "@/features/assessments/components/assessment-results-table";
import { useAdminAssessmentResultsQuery } from "@/features/assessments/hooks";
import type { AssessmentParticipantStatus } from "@/features/assessments/types";

export default function AdminAssessmentResultsPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AssessmentParticipantStatus | "">("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useAdminAssessmentResultsQuery(assessmentId, {
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
  });

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-admin-muted hover:text-admin-pink"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Danh sách bài kiểm tra
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-admin-cream">
          {query.data?.assessment.title ?? "Kết quả bài kiểm tra"}
        </h1>
        <p className="mt-1 text-sm text-admin-muted">
          Theo dõi học viên chưa nộp, đang làm, chờ chấm và kết quả đã hoàn
          thành.
        </p>
      </div>

      {query.isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-admin-surface-low" />
      ) : query.isError || !query.data ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300">
          Không thể tải kết quả bài kiểm tra.
        </div>
      ) : (
        <>
          <AssessmentResultStats
            stats={query.data.stats}
            maxScore={query.data.assessment.maxScore}
          />
          <div className="flex flex-col gap-3 rounded-xl border border-admin-border/30 bg-admin-surface-low p-4 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Tìm học viên</span>
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
                aria-hidden="true"
              />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full rounded-md border border-admin-border/40 bg-admin-deep py-2.5 pl-9 pr-3 text-sm text-admin-cream outline-none focus:border-admin-pink"
              />
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value as AssessmentParticipantStatus | "",
                );
                setPage(1);
              }}
              aria-label="Lọc theo trạng thái"
              className="rounded-md border border-admin-border/40 bg-admin-deep px-3 py-2.5 text-sm text-admin-cream outline-none focus:border-admin-pink"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="not_started">Chưa nộp</option>
              <option value="doing">Đang làm</option>
              <option value="pending_grading">Chờ chấm</option>
              <option value="completed">Đã hoàn thành</option>
            </select>
          </div>
          <AssessmentResultsTable
            assessmentId={assessmentId}
            items={query.data.items}
            page={query.data.pagination.page}
            totalPages={query.data.pagination.totalPages}
            totalItems={query.data.pagination.totalItems}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
