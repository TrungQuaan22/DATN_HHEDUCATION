'use client';

import { useState, useMemo } from 'react';
import { CourseSummary, Subject, Grade } from '@/types/common';
import CourseCard from '@/features/courses/components/course-card';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Trash2 } from 'lucide-react';

type CourseCatalogProps = {
  initialCourses: CourseSummary[];
};

export default function CourseCatalog({ initialCourses }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'hotest' | 'priceAsc' | 'priceDesc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Available subjects from mock data
  const subjectsList: { key: Subject; label: string }[] = [
    { key: 'math', label: 'Toán' },
    { key: 'physics', label: 'Vật lý' },
    { key: 'chemistry', label: 'Hóa học' },
    { key: 'literature', label: 'Ngữ văn' },
    { key: 'english', label: 'Tiếng Anh' },
  ];

  const gradesList: Grade[] = [9, 10, 11, 12];

  // Filter and sort logic
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...initialCourses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Subject filters
    if (selectedSubjects.length > 0) {
      result = result.filter((c) => selectedSubjects.includes(c.subject));
    }

    // Grade filter
    if (selectedGrade !== null) {
      result = result.filter((c) => c.grade === selectedGrade);
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id)); // mock sort
    } else if (sortBy === 'hotest') {
      result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.id.localeCompare(a.id));
    } else if (sortBy === 'priceAsc') {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.price;
        const pB = b.salePrice ?? b.price;
        return pA - pB;
      });
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.price;
        const pB = b.salePrice ?? b.price;
        return pB - pA;
      });
    }

    return result;
  }, [initialCourses, searchQuery, selectedSubjects, selectedGrade, sortBy]);

  // Handle pagination (mock 6 items per page)
  const itemsPerPage = 6;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCourses.slice(start, start + itemsPerPage);
  }, [filteredAndSortedCourses, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage) || 1;

  const handleSubjectToggle = (subj: Subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
    setCurrentPage(1);
  };

  const handleGradeToggle = (grade: Grade) => {
    setSelectedGrade((prev) => (prev === grade ? null : grade));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubjects([]);
    setSelectedGrade(null);
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen pb-20 pt-24 bg-brand-dark transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-deep-black border-b border-border-dark py-16 transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <h1 className="text-[32px] md:text-[48px] font-extrabold text-cream mb-4 leading-tight">
                Khám Phá Tri Thức,<br />Làm Chủ Tương Lai
              </h1>
              <p className="text-muted-taupe text-[16px] md:text-[18px] max-w-xl leading-relaxed">
                Hệ thống bài giảng chuyên sâu từ các chuyên gia hàng đầu, giúp học sinh từ lớp 9 đến 12 đạt kết quả cao nhất trong các kỳ thi.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-taupe group-focus-within:text-brand-pink transition-colors w-5 h-5" />
                <input
                  className="w-full md:w-[400px] pl-12 pr-4 py-4 rounded-xl border border-border-dark focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all outline-none bg-deep-black text-cream shadow-sm text-[14px]"
                  placeholder="Tìm kiếm khóa học..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Layout */}
      <div className="max-w-[1200px] mx-auto px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-10">
            {/* Subjects filter */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[14px] font-bold text-cream uppercase tracking-widest border-l-4 border-brand-pink pl-3">
                  Môn Học
                </h3>
                {(selectedSubjects.length > 0 || selectedGrade !== null || searchQuery !== '') && (
                  <button 
                    onClick={resetFilters} 
                    className="text-[11px] text-brand-pink hover:underline flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                  >
                    <Trash2 size={12} /> Đặt lại
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    checked={selectedSubjects.length === 0}
                    onChange={() => {
                      setSelectedSubjects([]);
                      setCurrentPage(1);
                    }}
                    className="w-5 h-5 rounded border-border-dark bg-deep-black text-brand-pink focus:ring-brand-pink cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-[14px] font-medium text-cream group-hover:text-brand-pink transition-colors">
                    Tất cả môn học
                  </span>
                </label>
                {subjectsList.map((subj) => (
                  <label key={subj.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={selectedSubjects.includes(subj.key)}
                      onChange={() => handleSubjectToggle(subj.key)}
                      className="w-5 h-5 rounded border-border-dark bg-deep-black text-brand-pink focus:ring-brand-pink cursor-pointer"
                      type="checkbox"
                    />
                    <span className="text-[14px] font-medium text-cream group-hover:text-brand-pink transition-colors">
                      {subj.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grades filter */}
            <div>
              <h3 className="text-[14px] font-bold text-cream uppercase tracking-widest mb-6 border-l-4 border-brand-pink pl-3">
                Khối Lớp
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedGrade(null);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer border ${
                    selectedGrade === null
                      ? 'bg-brand-pink text-white border-brand-pink'
                      : 'border-border-dark text-cream hover:bg-deep-black'
                  }`}
                >
                  Tất cả
                </button>
                {gradesList.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer border ${
                      selectedGrade === grade
                        ? 'bg-brand-pink text-white border-brand-pink'
                        : 'border-border-dark text-cream hover:bg-deep-black'
                    }`}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Offer Box */}
            <div className="bg-deep-black p-6 rounded-2xl text-cream relative overflow-hidden group border border-border-dark transition-colors duration-200">
              <div className="relative z-10">
                <h4 className="text-[18px] font-bold mb-2">Gói Ưu Đãi</h4>
                <p className="text-[13px] text-muted-taupe mb-6 leading-relaxed">
                  Đăng ký combo 3 môn giảm ngay 20% học phí trọn đời.
                </p>
                <button className="w-full bg-brand-pink text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all text-[13px] shadow-sm cursor-pointer">
                  Xem chi tiết
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-cream pointer-events-none">
                <SlidersHorizontal size={120} />
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="flex-grow">
            {filteredAndSortedCourses.length > 0 ? (
              <>
                {/* Header count & sort bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <p className="text-[14px] font-medium text-muted-taupe">
                    Hiển thị <span className="text-cream font-bold">{filteredAndSortedCourses.length}</span> khóa học
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-muted-taupe">Sắp xếp:</span>
                    <select
                      className="bg-deep-black border border-border-dark rounded-lg px-3 py-1.5 focus:ring-brand-pink text-cream text-[13px] cursor-pointer outline-none"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'newest' | 'hotest' | 'priceAsc' | 'priceDesc')
                      }
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="hotest">Nổi bật nhất</option>
                      <option value="priceAsc">Giá thấp đến cao</option>
                      <option value="priceDesc">Giá cao đến thấp</option>
                    </select>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedCourses.map((course) => (
                    <div key={course.id} className="h-full">
                      <CourseCard course={course} aspectRatio="video" />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-[13px] cursor-pointer transition-all ${
                          currentPage === i + 1
                            ? 'bg-brand-pink text-white'
                            : 'border border-border-dark text-cream hover:bg-deep-black'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-deep-black flex items-center justify-center rounded-full mb-6 border border-border-dark text-muted-taupe">
                  <SlidersHorizontal size={40} />
                </div>
                <h3 className="text-[20px] font-bold text-cream mb-2">Không tìm thấy khóa học</h3>
                <p className="text-muted-taupe text-[14px] max-w-sm leading-relaxed mb-8">
                  Chúng tôi không tìm thấy kết quả phù hợp với lựa chọn của bạn. Vui lòng thử lại với các tiêu chí lọc khác.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-brand-pink text-white px-6 py-3 rounded-lg text-[13px] font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
