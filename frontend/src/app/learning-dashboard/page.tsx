"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  Calendar,
  Clock,
  Trophy,
  Play,
  Check,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Award
} from "lucide-react";

type StudyTab = "all" | "lessons" | "practice";
type LeaderboardTab = "week" | "month";
type SubjectKey = "literature" | "math" | "english";

// Mock data for Daily Study Time Chart (Minutes)
const mockDailyStudyData: Record<StudyTab, { date: string; minutes: number }[]> = {
  all: [
    { date: "21", minutes: 18 },
    { date: "22", minutes: 32 },
    { date: "23", minutes: 15 },
    { date: "24", minutes: 45 },
    { date: "25", minutes: 22 },
    { date: "26", minutes: 48 },
    { date: "27", minutes: 10 }
  ],
  lessons: [
    { date: "21", minutes: 10 },
    { date: "22", minutes: 20 },
    { date: "23", minutes: 5 },
    { date: "24", minutes: 30 },
    { date: "25", minutes: 12 },
    { date: "26", minutes: 28 },
    { date: "27", minutes: 4 }
  ],
  practice: [
    { date: "21", minutes: 8 },
    { date: "22", minutes: 12 },
    { date: "23", minutes: 10 },
    { date: "24", minutes: 15 },
    { date: "25", minutes: 10 },
    { date: "26", minutes: 20 },
    { date: "27", minutes: 6 }
  ]
};

// Mock data for Exam Score Progression
const mockScoreData: Record<SubjectKey, { label: string; score: number }[]> = {
  literature: [
    { label: "Lần 1", score: 7.0 },
    { label: "Lần 2", score: 8.5 },
    { label: "Lần 3", score: 9.0 }
  ],
  math: [
    { label: "Lần 1", score: 6.5 },
    { label: "Lần 2", score: 8.0 },
    { label: "Lần 3", score: 8.8 }
  ],
  english: [
    { label: "Lần 1", score: 8.0 },
    { label: "Lần 2", score: 8.2 },
    { label: "Lần 3", score: 9.5 }
  ]
};

// Mock Leaderboard Data
const mockLeaderboard: Record<LeaderboardTab, { rank: number; name: string; lessonsCompleted: number; time: string; isCurrentUser?: boolean }[]> = {
  week: [
    { rank: 1, name: "Thế Anh", lessonsCompleted: 158, time: "62h 10m" },
    { rank: 2, name: "Hồng Nhung", lessonsCompleted: 142, time: "58h 45m" },
    { rank: 3, name: "Minh Khang", lessonsCompleted: 139, time: "54h 20m" }
  ],
  month: [
    { rank: 1, name: "Linh Chi", lessonsCompleted: 642, time: "248h 15m" },
    { rank: 2, name: "Thế Anh", lessonsCompleted: 610, time: "240h 50m" },
    { rank: 3, name: "Hồng Nhung", lessonsCompleted: 580, time: "225h 30m" }
  ]
};

export default function OverviewPage() {
  const { user } = useAuthStore();
  const [studyTab, setStudyTab] = useState<StudyTab>("all");
  const [scoreSubject, setScoreSubject] = useState<SubjectKey>("literature");
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("week");

  // Format active subject name
  const getSubjectLabel = (key: SubjectKey) => {
    switch (key) {
      case "literature": return "Ngữ Văn";
      case "math": return "Toán học";
      case "english": return "Anh Văn";
    }
  };

  // Find max minutes to set chart scale relative to maximum value
  const activeStudyData = mockDailyStudyData[studyTab];
  const maxMinutes = Math.max(...activeStudyData.map(d => d.minutes), 50);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Welcome Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand-pink/15 via-brand-pink/5 to-transparent border border-border-dark p-6 md:p-8 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl flex flex-col gap-2 md:gap-3">
          <h1 className="text-[24px] md:text-[32px] font-extrabold text-cream leading-tight">
            Chào mừng trở lại, {user?.fullName || "Trung Quân"}! 👋
          </h1>
          <p className="text-[13px] md:text-[15px] text-muted-text font-medium leading-relaxed max-w-lg">
            Cố gắng lên nhé bạn ơi — mình tin bạn sẽ ngày càng tiến bộ!
          </p>
          <div className="mt-2 flex gap-3">
            <button className="bg-brand-pink text-brand-dark font-extrabold text-[12px] py-2.5 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-pink/10 cursor-pointer">
              Tiếp tục học
            </button>
          </div>
        </div>
        <div className="hidden lg:block w-48 h-48 bg-brand-pink/10 rounded-full blur-[40px] absolute right-20 top-6 pointer-events-none"></div>
      </section>

      {/* Stats Row (3 optimized cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Attendance Days */}
        <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] flex items-center gap-4 hover:border-brand-pink/20 hover:bg-[#16161a] transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-muted-text uppercase tracking-wider">Điểm danh tháng này</div>
            <div className="text-[24px] font-extrabold text-cream group-hover:text-brand-pink transition-colors mt-0.5">12 ngày</div>
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] flex items-center gap-4 hover:border-brand-pink/20 hover:bg-[#16161a] transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-muted-text uppercase tracking-wider">Thời gian học</div>
            <div className="text-[24px] font-extrabold text-cream group-hover:text-emerald-400 transition-colors mt-0.5">40h 25m</div>
          </div>
        </div>

        {/* GPA */}
        <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] flex items-center gap-4 hover:border-brand-pink/20 hover:bg-[#16161a] transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy size={22} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-muted-text uppercase tracking-wider">GPA Trung bình</div>
            <div className="text-[24px] font-extrabold text-cream group-hover:text-amber-400 transition-colors mt-0.5">8.7 / 10</div>
          </div>
        </div>
      </section>

      {/* Main Contents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Daily Study Time Chart Widget */}
          <div className="bg-[#121215] rounded-2xl p-6 border border-[#202024] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-extrabold text-cream">Thời gian học mỗi ngày</h3>
                <p className="text-[11px] text-muted-text font-medium mt-0.5">Thống kê hoạt động học tập 7 ngày gần đây</p>
              </div>
              
              {/* Tab Filters */}
              <div className="flex gap-1.5 bg-brand-dark p-1 rounded-xl border border-border-dark w-fit">
                {(["all", "lessons", "practice"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStudyTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      studyTab === tab
                        ? "bg-brand-pink text-brand-dark shadow-sm"
                        : "text-cream hover:text-brand-pink"
                    }`}
                  >
                    {tab === "all" && "Tất cả"}
                    {tab === "lessons" && "Xem bài học"}
                    {tab === "practice" && "Luyện tập"}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom CSS/Tailwind Bar Chart */}
            <div className="h-60 flex items-end justify-between px-2 pt-6 border-b border-border-dark/40 relative">
              {activeStudyData.map((data, idx) => {
                const heightPercent = (data.minutes / maxMinutes) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 w-[10%] group cursor-pointer">
                    <div className="text-[10px] font-bold text-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-brand-dark border border-border-dark px-1.5 py-0.5 rounded -mt-6 absolute">
                      {data.minutes}m
                    </div>
                    <div className="w-full bg-[#1e1e24] rounded-t-lg h-44 flex items-end overflow-hidden relative border border-border-dark/20">
                      <div
                        className="w-full bg-brand-pink rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110 shadow-[0_0_12px_rgba(255,105,180,0.2)]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-text group-hover:text-cream transition-colors">
                      {data.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam Score Progression Chart (Expanded to full row width) */}
          <div className="bg-[#121215] rounded-2xl p-6 border border-[#202024] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-extrabold text-cream">Thăng tiến điểm số</h3>
                <p className="text-[11px] text-muted-text font-medium mt-0.5">Biểu đồ kết quả bài kiểm tra chính thức</p>
              </div>

              {/* Subject Selector Dropdown */}
              <div className="relative">
                <select
                  value={scoreSubject}
                  onChange={(e) => setScoreSubject(e.target.value as SubjectKey)}
                  className="bg-brand-dark text-cream border border-border-dark rounded-xl px-4 py-2 text-[12px] font-bold outline-none cursor-pointer hover:border-brand-pink/50 transition-colors appearance-none pr-8"
                >
                  <option value="literature">Ngữ Văn</option>
                  <option value="math">Toán học</option>
                  <option value="english">Anh Văn</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Custom Bar Score representation */}
            <div className="grid grid-cols-3 gap-6 pt-4 h-48 items-end border-b border-border-dark/40 pb-2">
              {mockScoreData[scoreSubject].map((scoreItem, idx) => {
                const heightPercent = (scoreItem.score / 10) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end group">
                    <div className="w-full bg-[#1e1e24] rounded-xl border border-border-dark/40 overflow-hidden h-36 flex items-end relative">
                      <div
                        className="w-full bg-emerald-500 rounded-t-xl transition-all duration-500 flex items-center justify-center text-[13px] font-extrabold text-brand-dark group-hover:brightness-110 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {scoreItem.score.toFixed(1)}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-cream">{scoreItem.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-emerald-400 text-[12px] font-bold pt-1">
              <TrendingUp size={15} />
              <span>↑ Tăng 12% so với tháng trước ở môn {getSubjectLabel(scoreSubject)}</span>
            </div>
          </div>

          {/* Enrolled Courses Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[18px] font-bold text-cream">Khóa học đang học</h2>
              <Link href="/learning-dashboard/courses" className="text-[12px] font-bold text-brand-pink hover:underline flex items-center gap-0.5">
                Xem tất cả
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Course Card 1 */}
            <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group hover:border-brand-pink/20 transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-pink/20 to-brand-dark border border-border-dark flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-brand-pink uppercase tracking-widest">VĂN</span>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-brand-pink bg-brand-pink/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit block">
                    Ngữ Văn
                  </span>
                  <h3 className="text-[15px] font-bold text-cream group-hover:text-brand-pink transition-colors truncate">
                    Tích chữ thành văn - Module 1
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-text">
                    <span className="text-cream">Tiến độ: 13/20 bài học</span>
                    <span>•</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-dark border border-border-dark rounded-full overflow-hidden max-w-md">
                    <div className="h-full bg-brand-pink rounded-full transition-all duration-500" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>
              <button className="w-full sm:w-auto text-center bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-bold text-[12px] px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer">
                <Play size={12} className="fill-current" />
                Vào học ngay
              </button>
            </div>

            {/* Course Card 2 */}
            <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group hover:border-brand-pink/20 transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-brand-dark border border-border-dark flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">TOÁN</span>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit block">
                    Toán Học
                  </span>
                  <h3 className="text-[15px] font-bold text-cream group-hover:text-brand-pink transition-colors truncate">
                    Giải tích 12 nâng cao
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-text">
                    <span className="text-cream">Tiến độ: 9/30 bài học</span>
                    <span>•</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-dark border border-border-dark rounded-full overflow-hidden max-w-md">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "30%" }}></div>
                  </div>
                </div>
              </div>
              <button className="w-full sm:w-auto text-center border border-border-dark text-cream hover:border-brand-pink hover:text-brand-pink font-bold text-[12px] px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer">
                <Play size={12} className="fill-current" />
                Vào học ngay
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Weekly Active Check-in */}
          <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] space-y-5 text-center flex flex-col items-center">
            <div className="flex justify-between items-center w-full pb-2 border-b border-border-dark/40">
              <h3 className="text-[13px] font-extrabold text-cream">Điểm danh tuần này</h3>
              <span className="text-[10px] font-bold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                🔥 Chuỗi 5 ngày!
              </span>
            </div>
            
            <div className="flex justify-between items-center gap-1 w-full mt-2">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, idx) => {
                const isActive = idx < 3; // Mock active for Mon, Tue, Wed
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-text">{day}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isActive
                          ? "bg-emerald-500 text-brand-dark shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          : "bg-brand-dark border border-border-dark text-muted-text"
                      }`}
                    >
                      {isActive ? <Check size={14} className="stroke-[3]" /> : day}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full pt-1">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[12px] py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                <Check size={14} className="stroke-[3]" />
                Đã điểm danh hôm nay!
              </div>
            </div>
          </div>

          {/* Assessment News/Bulletins */}
          <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] space-y-4">
            <div className="flex items-center justify-between border-b border-border-dark/40 pb-3">
              <h3 className="text-[13px] font-extrabold text-cream flex items-center gap-2">
                <Award size={16} className="text-brand-pink" />
                Tin tức về bài kiểm tra
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Important Exam */}
              <div className="bg-brand-dark/50 border border-amber-500/20 rounded-xl p-3.5 space-y-2 flex items-start gap-3 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold text-brand-dark bg-amber-400 px-1.5 py-0.2 rounded uppercase">
                      Quan trọng
                    </span>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded uppercase">
                      Còn 2 ngày
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-cream mt-1.5 hover:text-brand-pink transition-colors cursor-pointer truncate">
                    Kiểm tra giữa kỳ Ngữ Văn
                  </span>
                  <span className="text-[10px] text-muted-text mt-0.5">Hạn chót: 29/05/2026 08:00</span>
                </div>
              </div>

              {/* Standard Homework Quiz */}
              <div className="bg-brand-dark/30 border border-border-dark rounded-xl p-3.5 space-y-2 flex items-start gap-3 hover:border-border-dark-hover transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted-text/10 flex items-center justify-center text-muted-text shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold text-muted-text bg-[#202024] px-1.5 py-0.2 rounded uppercase">
                      Luyện tập
                    </span>
                    <span className="text-[9px] font-bold text-muted-text bg-[#202024] px-1.5 py-0.2 rounded uppercase">
                      Còn 5 ngày
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-cream mt-1.5 hover:text-brand-pink transition-colors cursor-pointer truncate">
                    Bài tập phân tích thơ
                  </span>
                  <span className="text-[10px] text-muted-text mt-0.5">Hạn chót: 01/06/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard (Bảng xếp hạng) */}
          <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] space-y-5">
            <div className="flex items-center justify-between border-b border-border-dark/40 pb-3">
              <h3 className="text-[13px] font-extrabold text-cream flex items-center gap-2">
                <Trophy size={16} className="text-brand-pink" />
                Bảng xếp hạng
              </h3>
              
              {/* Leaderboard Tabs */}
              <div className="flex gap-0.5 bg-brand-dark p-0.5 rounded-lg border border-border-dark">
                {(["week", "month"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeaderboardTab(tab)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      leaderboardTab === tab
                        ? "bg-brand-pink text-brand-dark"
                        : "text-cream hover:text-brand-pink"
                    }`}
                  >
                    {tab === "week" ? "Tuần" : "Tháng"}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 3 ranks */}
            <div className="space-y-3.5">
              {mockLeaderboard[leaderboardTab].map((student, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-brand-dark/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] font-extrabold w-5 text-center ${
                      student.rank === 1 ? "text-amber-400 text-[14px]" :
                      student.rank === 2 ? "text-slate-300" :
                      "text-amber-700"
                    }`}>
                      #{student.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-border-dark overflow-hidden bg-brand-dark shrink-0">
                      <img
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${student.name}`}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-cream truncate">{student.name}</span>
                      <span className="text-[10px] text-muted-text">{student.lessonsCompleted} bài học completed</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-emerald-400">{student.time}</span>
                </div>
              ))}
            </div>

            {/* Current user pinned row */}
            <div className="border-t border-border-dark/40 pt-4 mt-2">
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-brand-pink/5 border border-brand-pink/20">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-brand-pink w-6 text-center">
                    #8257
                  </span>
                  <div className="w-8 h-8 rounded-full border border-brand-pink/30 overflow-hidden bg-brand-dark shrink-0">
                    <img
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=TrungQuan"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-extrabold text-cream truncate">Bạn (Trung Quân)</span>
                    <span className="text-[10px] text-muted-text">92 bài học completed</span>
                  </div>
                </div>
                <span className="text-[12px] font-extrabold text-brand-pink">40h 25m</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
