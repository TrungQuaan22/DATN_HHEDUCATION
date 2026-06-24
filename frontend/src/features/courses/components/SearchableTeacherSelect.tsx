"use client";

import { useState, useEffect, useRef } from "react";
import { useTeacherOptionsQuery } from "../hooks";
import { Search, ChevronDown, Check, Loader2 } from "lucide-react";

interface SearchableTeacherSelectProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isTeacher?: boolean;
  currentUser?: any;
  error?: boolean;
}

export function SearchableTeacherSelect({
  value,
  onChange,
  disabled = false,
  isTeacher = false,
  currentUser,
  error = false,
}: SearchableTeacherSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search term by 300ms
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const { data: teacherOptions = [], isLoading } = useTeacherOptionsQuery({
    search: debouncedSearch || undefined,
  });

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

  // Find selected teacher details
  const selectedTeacher = isTeacher
    ? currentUser
    : teacherOptions.find((t) => t.id === value) || {
        id: value,
        fullName: value ? "Đang chọn..." : "Chọn giảng viên...",
        email: "",
      };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream transition-all font-medium text-sm text-left flex items-center justify-between disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
            : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
        }`}
      >
        <span className="truncate">
          {selectedTeacher
            ? `${selectedTeacher.fullName}${selectedTeacher.email ? ` (${selectedTeacher.email})` : ""}`
            : "Chọn giảng viên..."}
        </span>
        <ChevronDown
          size={16}
          className={`text-admin-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Options Box */}
      {isOpen && !isTeacher && (
        <div className="absolute z-50 w-full mt-2 bg-admin-deep border border-admin-border/30 rounded shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Box inside dropdown */}
          <div className="p-2 border-b border-admin-border/10 bg-admin-surface-low/30 flex items-center gap-2">
            <Search size={14} className="text-admin-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full bg-transparent border-none focus:outline-none text-sm text-admin-cream placeholder:text-admin-muted/40 py-1"
              autoFocus
            />
            {isLoading && (
              <Loader2 size={12} className="animate-spin text-admin-pink" />
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
            {teacherOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-admin-muted italic">
                Không tìm thấy giảng viên nào
              </div>
            ) : (
              teacherOptions.map((t) => {
                const isSelected = t.id === value;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelect(t.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-admin-pink text-white font-bold"
                        : "text-admin-cream hover:bg-admin-surface-low/50"
                    }`}
                  >
                    <span className="truncate">
                      {t.fullName}{" "}
                      <span
                        className={`text-xs font-normal ${isSelected ? "text-white/80" : "text-admin-muted"}`}
                      >
                        ({t.email})
                      </span>
                    </span>
                    {isSelected && <Check size={14} />}
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

