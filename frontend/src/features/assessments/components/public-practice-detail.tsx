"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Lock,
} from "lucide-react";
import { usePublicAssessmentDetailQuery } from "../hooks";
import { useAuthStore } from "@/stores/auth-store";
import {
  AssessmentHeaderBadges,
  AssessmentMetadataGrid,
  AssessmentRulesInstructions,
} from "./assessment-details-shared";

export function PublicPracticeDetail() {
  const router = useRouter();
  const params = useParams<{ placementRef: string }>();
  const placementRef = params.placementRef;

  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { data: assessment, isLoading } = usePublicAssessmentDetailQuery(
    placementRef,
    { enabled: hasHydrated && isAuthenticated }
  );

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (assessment?.assessment?.title) {
      document.title = `${assessment.assessment.title} | HH Education`;
    }
  }, [assessment]);

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          className="mt-5 inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-bold text-deep-black transition hover:brightness-110 active:scale-95"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary/50 px-4 py-3.5 text-sm font-bold text-deep-black cursor-not-allowed"
        >
          <Loader2 className="h-4 w-4 animate-spin text-deep-black" />
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
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-surface-container-high px-4 py-3.5 text-sm font-bold text-muted-text cursor-not-allowed border border-outline-variant/30"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-surface-container px-4 py-3.5 text-sm font-bold text-muted-text cursor-not-allowed border border-outline-variant/30"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3.5 text-sm font-bold text-deep-black transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/10"
        >
          Vào làm bài
        </Link>
      );
    }

    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3.5 text-sm font-bold text-deep-black transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/10"
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
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase text-muted-text transition hover:text-primary"
        >
          <ArrowLeft size={14} />
          Danh sách đề luyện
        </Link>

        <div className="overflow-hidden rounded-lg border border-outline-variant/20 bg-deep-black shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <AssessmentHeaderBadges assessment={assessment} />
              
              <h1 className="font-serif text-3xl font-black leading-tight text-cream sm:text-4xl">
                {assessment.assessment.title}
              </h1>

              <p className="text-sm leading-6 text-muted-text">
                Đây là đề luyện tập công khai. Để thực hiện làm bài, ghi nhận kết quả và lưu lịch sử học tập, 
                vui lòng xác nhận các thông tin chi tiết dưới đây.
              </p>
            </div>

            <AssessmentMetadataGrid assessment={assessment} />

            <div className="pt-4 border-t border-outline-variant/10">
              {renderActionButton()}
            </div>

            <AssessmentRulesInstructions />
          </div>
        </div>
      </div>
    </div>
  );
}
