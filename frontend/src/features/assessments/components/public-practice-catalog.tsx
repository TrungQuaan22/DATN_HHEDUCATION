"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  ChevronRight,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { Subject } from "@/types/common";
import { usePublicAssessmentsQuery } from "../hooks";
import { type AssessmentPlacementSummary } from "../types";

const subjects: Array<{ value: Subject | "all"; label: string }> = [
  { value: "all", label: "Tất cả môn" },
  { value: "math", label: "Toán học" },
  { value: "physics", label: "Vật lý" },
  { value: "chemistry", label: "Hóa học" },
  { value: "literature", label: "Ngữ văn" },
  { value: "english", label: "Tiếng Anh" },
  { value: "biology", label: "Sinh học" },
  { value: "history", label: "Lịch sử" },
  { value: "geography", label: "Địa lý" },
];

const subjectLabel = subjects.reduce<Record<string, string>>((acc, subject) => {
  acc[subject.value] = subject.label;
  return acc;
}, {});

export function PublicPracticeCatalog() {
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [grade, setGrade] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePublicAssessmentsQuery({
    subject: subject === "all" ? undefined : subject,
    grade: grade === "all" ? undefined : grade,
    page: 1,
    limit: 60,
  });

  const items = useMemo(() => data?.items || [], [data?.items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => item.assessment.title.toLowerCase().includes(query));
  }, [items, search]);

  const featuredItems = filteredItems.filter((item) => item.isFeatured);
  const regularItems = filteredItems.filter((item) => !item.isFeatured);

  return (
    <div className="pt-28 text-cream">
      <section className="border-b border-border-dark bg-deep-black">
        <div className="mx-auto max-w-[1200px] px-6 py-10">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-brand-pink">
            <Sparkles size={15} />
            Luyện tập miễn phí
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl font-black leading-tight text-cream">
                Luyện đề miễn phí
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-text">
                Xem đề công khai không cần mua khóa học. Khi bắt đầu làm bài, hệ thống sẽ yêu cầu đăng
                nhập để lưu lượt làm, điểm số và lịch sử luyện tập.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
              <label className="relative block">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm đề luyện..."
                  className="h-11 w-full rounded border border-border-dark bg-brand-dark pl-9 pr-3 text-sm text-cream outline-none transition focus:border-brand-pink"
                />
              </label>
              <select
                value={grade}
                onChange={(event) =>
                  setGrade(event.target.value === "all" ? "all" : Number(event.target.value))
                }
                className="h-11 rounded border border-border-dark bg-brand-dark px-3 text-sm font-bold text-cream outline-none transition focus:border-brand-pink"
              >
                <option value="all">Tất cả lớp</option>
                {[9, 10, 11, 12].map((value) => (
                  <option key={value} value={value}>
                    Lớp {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] space-y-6 px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-cream">
            <Filter size={16} className="text-brand-pink" />
            Ngân hàng đề công khai
          </div>
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value as Subject | "all")}
            className="h-10 rounded border border-border-dark bg-deep-black px-3 text-sm font-bold text-cream outline-none transition focus:border-brand-pink"
          >
            {subjects.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded border border-border-dark bg-deep-black">
            <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded border border-border-dark bg-deep-black p-10 text-center">
            <FileText className="mx-auto mb-3 text-muted-text" size={42} />
            <h3 className="text-base font-black text-cream">Chưa có đề thi công khai</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-text">
              Đề thi công khai sẽ xuất hiện tại đây sau khi giáo viên/admin tạo và xuất bản đề thi tự do.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...featuredItems, ...regularItems].map((item) => (
              <Link
                key={item.id}
                href={`/practice/${item.slug || item.id}`}
                className="group rounded border border-border-dark bg-deep-black p-5 transition hover:border-brand-pink/70 hover:bg-off-black"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded bg-brand-pink/10 px-2 py-1 text-xs font-black uppercase text-brand-pink">
                      {subjectLabel[item.assessment.subject] ?? item.assessment.subject}
                    </span>
                    <span className="rounded bg-off-black px-2 py-1 text-xs font-black uppercase text-muted-text">
                      Lớp {item.assessment.grade}
                    </span>
                    {item.isFeatured && (
                      <span className="rounded bg-amber-500/10 px-2 py-1 text-xs font-black uppercase text-amber-300">
                        Nổi bật
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-muted-text transition group-hover:translate-x-1 group-hover:text-brand-pink"
                  />
                </div>

                <h3 className="line-clamp-2 min-h-12 text-base font-black text-cream">
                  {item.assessment.title}
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded border border-border-dark bg-off-black p-3">
                    <div className="mb-1 flex items-center gap-1 text-muted-text">
                      <BookOpenCheck size={13} />
                      Phân loại
                    </div>
                    <div className="font-black uppercase text-cream">
                      {item.assessment.type === "exam" ? "Đề thi PDF" : "Quiz trắc nghiệm"}
                    </div>
                  </div>
                  <div className="rounded border border-border-dark bg-off-black p-3">
                    <div className="mb-1 flex items-center gap-1 text-muted-text">
                      <GraduationCap size={13} />
                      Chấm điểm
                    </div>
                    <div className="font-black uppercase text-cream">
                      {item.assessment.gradingType === "auto" ? "Tự động" : item.assessment.gradingType === "manual" ? "Thủ công" : "Hỗn hợp"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
