"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Loader2, BookOpen } from "lucide-react";
import { AdminCourseSummary } from "@/features/courses/types";

interface SearchableCourseSelectProps {
  value: string;
  onChange: (val: string) => void;
  coursesList: AdminCourseSummary[];
  isLoading?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export function SearchableCourseSelect({
  value,
  onChange,
  coursesList,
  isLoading = false,
  disabled = false,
  error = false,
}: SearchableCourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find selected course details
  const selectedCourse = coursesList.find((c) => c.id === value);

  // Client-side local filter for instantaneous search response
  const filteredCourses = coursesList.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `lớp ${c.grade}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream transition-all font-medium text-sm text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
            : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
        }`}
      >
        <span className="truncate">
          {selectedCourse
            ? `${selectedCourse.title} (Lớp ${selectedCourse.grade}) - ${formatPrice(selectedCourse.price)}`
            : "Chọn khóa học muốn gán..."}
        </span>
        <ChevronDown
          size={16}
          className={`text-admin-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Options Box */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-admin-deep border border-admin-border/30 rounded shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-admin-border/10 bg-admin-surface-low/30 flex items-center gap-2">
            <Search size={14} className="text-admin-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khóa học, lớp, môn..."
              className="w-full bg-transparent border-none focus:outline-none text-sm text-admin-cream placeholder:text-admin-muted/40 py-1"
              autoFocus
            />
            {isLoading && (
              <Loader2 size={12} className="animate-spin text-admin-pink" />
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
            {filteredCourses.length === 0 ? (
              <div className="py-4 text-center text-xs text-admin-muted italic flex items-center justify-center gap-1.5">
                <BookOpen size={14} />
                <span>Không tìm thấy khóa học nào</span>
              </div>
            ) : (
              filteredCourses.map((c) => {
                const isSelected = c.id === value;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-admin-pink text-white font-bold"
                        : "text-admin-cream hover:bg-admin-surface-low/50"
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <p className="font-bold truncate">{c.title}</p>
                      <p
                        className={`text-xs font-medium mt-0.5 ${
                          isSelected ? "text-white/80" : "text-admin-muted"
                        }`}
                      >
                        Lớp {c.grade} • {formatPrice(c.price)}
                      </p>
                    </div>
                    {isSelected && <Check size={14} className="flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
