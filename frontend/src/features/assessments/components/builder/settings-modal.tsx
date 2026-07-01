"use client";

import React from "react";
import { Settings, X } from "lucide-react";
import { PlacementType } from "./types";
import { Subject } from "@/types/common";
import { AdminCourseSummary } from "@/features/courses/types";

// Note: Simple shape matching CourseLessonSummary from types/common or builder page
interface QuizLesson {
  id: string;
  title: string;
}

interface SettingsModalProps {
  title: string;
  setTitle: (title: string) => void;
  placementType: PlacementType;
  setPlacementType: (type: PlacementType) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  courses: AdminCourseSummary[];
  quizLessons: QuizLesson[];
  subject: Subject;
  setSubject: (subject: Subject) => void;
  grade: number;
  setGrade: (grade: number) => void;
  timeLimit: number;
  setTimeLimit: (timeLimit: number) => void;
  maxAttempts: number;
  setMaxAttempts: (maxAttempts: number) => void;
  openTime: string;
  setOpenTime: (openTime: string) => void;
  closeTime: string;
  setOpenCloseTime: (closeTime: string) => void;
  subjectLabels: Record<string, string>;
  onClose: () => void;
}

export function SettingsModal({
  title,
  setTitle,
  placementType,
  setPlacementType,
  selectedCourseId,
  setSelectedCourseId,
  selectedLessonId,
  setSelectedLessonId,
  courses,
  quizLessons,
  subject,
  setSubject,
  grade,
  setGrade,
  timeLimit,
  setTimeLimit,
  maxAttempts,
  setMaxAttempts,
  openTime,
  setOpenTime,
  closeTime,
  setOpenCloseTime,
  subjectLabels,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-admin-border bg-admin-surface-low p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-admin-border/60 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-admin-pink flex items-center gap-1.5">
            <Settings size={14} /> Cáº¥u hĂ¬nh cĂ i Ä‘áº·t bĂ i thi
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-admin-muted hover:text-admin-cream transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 py-2">

          {/* Title input field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-admin-muted block">
              TiĂªu Ä‘á» bĂ i kiá»ƒm tra
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold"
              placeholder="Nháº­p tĂªn Ä‘á» thi..."
            />
          </div>

          {/* Placement type tabs */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-admin-muted block">
              Pháº¡m vi phĂ¢n bá»•
            </label>
            <div className="grid grid-cols-4 rounded-lg bg-admin-bg p-1 border border-admin-border/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPlacementType("unplaced")}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  placementType === "unplaced"
                    ? "bg-admin-pink text-admin-bg"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                ChÆ°a phĂ¢n bá»•
              </button>
              <button
                type="button"
                onClick={() => setPlacementType("public_practice")}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  placementType === "public_practice"
                    ? "bg-admin-pink text-admin-bg"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                Tá»± do (Luyá»‡n táº­p)
              </button>
              <button
                type="button"
                onClick={() => setPlacementType("course")}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  placementType === "course"
                    ? "bg-admin-pink text-admin-bg"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                Lá»™ trĂ¬nh (KhĂ³a há»c)
              </button>
              <button
                type="button"
                onClick={() => setPlacementType("lesson")}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  placementType === "lesson"
                    ? "bg-admin-pink text-admin-bg"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                BĂ i há»c (Quiz bĂ i)
              </button>
            </div>
          </div>

          {/* Course placement details */}
          {placementType === "course" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted block">
                KhĂ³a há»c Ă¡p dá»¥ng
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold disabled:opacity-65 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.grade} - {subjectLabels[c.subject as Subject] || c.subject}] {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lesson placement details */}
          {placementType === "lesson" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted block">KhĂ³a há»c</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold disabled:opacity-65 cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.grade} - {subjectLabels[c.subject as Subject] || c.subject}] {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted block">
                  BĂ i há»c (Dáº¡ng Quiz)
                </label>
                {quizLessons.length === 0 ? (
                  <div className="text-xs text-amber-500 font-bold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    KhĂ³a há»c nĂ y chÆ°a cĂ³ bĂ i há»c dáº¡ng Quiz. Vui lĂ²ng thĂªm bĂ i há»c tráº¯c nghiá»‡m trong
                    pháº§n quáº£n lĂ½ bĂ i há»c trÆ°á»›c.
                  </div>
                ) : (
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold disabled:opacity-65 cursor-pointer"
                  >
                    {quizLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Subject & Grade selection */}
          <div className="grid grid-cols-2 gap-3 border-t border-admin-border/40 pt-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                MĂ´n há»c
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
              >
                {Object.entries(subjectLabels).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                Khá»‘i lá»›p
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
              />
            </div>
          </div>

          {/* Time limit & Attempts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                Thá»i gian lĂ m bĂ i (phĂºt)
              </label>
              <input
                type="number"
                min={5}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                Sá»‘ lÆ°á»£t lĂ m bĂ i tá»‘i Ä‘a
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
              />
            </div>
          </div>

          {/* Open & Close times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                Thá»i gian má»Ÿ Ä‘á»
              </label>
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                Thá»i gian Ä‘Ă³ng Ä‘á»
              </label>
              <input
                type="datetime-local"
                value={closeTime}
                onChange={(e) => setOpenCloseTime(e.target.value)}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-admin-border/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-xs font-bold text-admin-cream hover:border-admin-pink/60 transition cursor-pointer"
          >
            Há»§y
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg hover:brightness-110 transition cursor-pointer"
          >
            XĂ¡c nháº­n
          </button>
        </div>
      </div>
    </div>
  );
}
