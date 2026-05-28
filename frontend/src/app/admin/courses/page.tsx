'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Archive, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  Clock
} from 'lucide-react';

import { Subject, Grade, SUBJECT_LABELS, GRADE_LABELS } from '@/types/common';
import { 
  getAdminCourses, 
  publishAdminCourse, 
  archiveAdminCourse, 
  CourseStatus, 
  AdminCourseResponseData 
} from '@/features/admin/api/courses';
import { mockAdminCourses } from '@/features/admin/data/mockCourses';
import CourseCreateModal from '@/features/admin/components/course-create-modal';

const ITEMS_PER_PAGE = 5;

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CourseStatus | 'all'>('all');
  const [subject, setSubject] = useState<Subject | 'all'>('all');
  const [grade, setGrade] = useState<Grade | 'all'>('all');
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // API query
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    status: status === 'all' ? undefined : status,
    subject: subject === 'all' ? undefined : subject,
    grade: grade === 'all' ? undefined : grade,
    isFeatured: isFeaturedOnly ? true : undefined,
    search: search.trim() || undefined,
  }), [currentPage, status, subject, grade, isFeaturedOnly, search]);

  const coursesQuery = useQuery({
    queryKey: ['admin-courses', queryParams],
    queryFn: () => getAdminCourses(queryParams),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  // Fallback filtering on mock data if API fails or returns no data
  const fallbackFilteredCourses = useMemo(() => {
    let result = [...mockAdminCourses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (status !== 'all') {
      result = result.filter(c => c.status === status);
    }

    if (subject !== 'all') {
      result = result.filter(c => c.subject === subject);
    }

    if (grade !== 'all') {
      result = result.filter(c => c.grade === grade);
    }

    if (isFeaturedOnly) {
      result = result.filter(c => c.isFeatured);
    }

    return result;
  }, [search, status, subject, grade, isFeaturedOnly]);

  const paginatedFallbackCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return fallbackFilteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [fallbackFilteredCourses, currentPage]);

  // Determine which data to use
  const hasApiData = !!(coursesQuery.data && coursesQuery.data.items);
  const coursesList = hasApiData ? coursesQuery.data!.items : paginatedFallbackCourses;
  
  const totalItems = hasApiData 
    ? (coursesQuery.data!.pagination.totalItems ?? coursesList.length) 
    : fallbackFilteredCourses.length;
    
  const totalPages = hasApiData 
    ? (coursesQuery.data!.pagination.totalPages ?? 1) 
    : Math.ceil(fallbackFilteredCourses.length / ITEMS_PER_PAGE) || 1;

  // Mutations (Mock fallback included)
  const publishMutation = useMutation({
    mutationFn: publishAdminCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err) => {
      // Local fallback edit
      console.log('Publish error, running local fallback', err);
    }
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });

  const handlePublish = async (courseId: string) => {
    try {
      await publishMutation.mutateAsync(courseId);
    } catch {
      // Fallback: update local mock data
      const idx = mockAdminCourses.findIndex(c => c.id === courseId);
      if (idx !== -1) {
        mockAdminCourses[idx].status = 'published';
        queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      }
    }
  };

  const handleArchive = async (courseId: string) => {
    try {
      await archiveMutation.mutateAsync(courseId);
    } catch {
      // Fallback: update local mock data
      const idx = mockAdminCourses.findIndex(c => c.id === courseId);
      if (idx !== -1) {
        mockAdminCourses[idx].status = 'archived';
        queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      }
    }
  };

  const handleRefreshList = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const sourceList = mockAdminCourses;
    const activeCount = sourceList.filter(c => c.status === 'published').length;
    const draftCount = sourceList.filter(c => c.status === 'draft').length;
    return {
      active: activeCount,
      draft: draftCount,
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-admin-cream">Quản Lý Khóa Học</h2>
          <p className="text-sm text-admin-muted mt-1">
            Quản lý thông tin khóa học, trạng thái phát hành và xây dựng nội dung học tập.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-admin-pink text-white px-6 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 hover:shadow-lg hover:shadow-admin-pink/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <Plus size={16} />
          Tạo khóa học mới
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-admin-surface-low p-6 rounded-xl border border-admin-border/30 flex flex-wrap items-center gap-4 shadow-sm text-admin-cream">
        
        {/* Search input */}
        <div className="flex-grow min-w-[200px]">
          <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tên khóa học, slug..."
              className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl pl-9 pr-4 py-2 text-[14px] text-admin-cream placeholder:text-admin-muted/40"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-40">
          <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CourseStatus | 'all');
              setCurrentPage(1);
            }}
            className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-xl text-[14px] text-admin-cream appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '0.85rem'
            }}
          >
            <option value="all">Tất cả</option>
            <option value="draft">Bản nháp (Draft)</option>
            <option value="published">Đã phát hành (Published)</option>
            <option value="archived">Đã lưu trữ (Archived)</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div className="w-40">
          <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">Môn học</label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value as Subject | 'all');
              setCurrentPage(1);
            }}
            className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-xl text-[14px] text-admin-cream appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '0.85rem'
            }}
          >
            <option value="all">Tất cả môn</option>
            {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div className="w-32">
          <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">Khối lớp</label>
          <select
            value={grade}
            onChange={(e) => {
              setGrade(e.target.value === 'all' ? 'all' : Number(e.target.value) as Grade);
              setCurrentPage(1);
            }}
            className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-xl text-[14px] text-admin-cream appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '0.85rem'
            }}
          >
            <option value="all">Tất cả khối</option>
            {[9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>Lớp {g}</option>
            ))}
          </select>
        </div>

        {/* Featured Filter */}
        <div className="flex items-center gap-2 pt-6">
          <input
            id="featured-filter"
            type="checkbox"
            checked={isFeaturedOnly}
            onChange={(e) => {
              setIsFeaturedOnly(e.target.checked);
              setCurrentPage(1);
            }}
            className="w-4 h-4 bg-admin-deep border-admin-border/30 rounded text-admin-pink focus:ring-admin-pink focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="featured-filter" className="text-sm font-bold text-admin-cream cursor-pointer select-none">
            Nổi bật
          </label>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-admin-deep border border-admin-border/30 rounded-xl shadow-sm overflow-hidden text-admin-cream">
        
        {coursesQuery.isLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-admin-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-admin-muted text-sm font-medium">Đang tải danh sách khóa học...</p>
          </div>
        ) : coursesList.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <SlidersHorizontal size={40} className="text-admin-muted mb-4" />
            <h3 className="text-lg font-bold text-admin-cream">Không tìm thấy khóa học nào</h3>
            <p className="text-admin-muted text-sm mt-1 max-w-sm">
              Không có khóa học nào khớp với bộ lọc tìm kiếm hiện tại của bạn.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead className="bg-admin-surface-low/50 border-b border-admin-border/30">
                <tr className="text-admin-muted text-[12px] font-bold uppercase tracking-wider">
                  <th className="pl-6 py-4 w-[340px]">Khóa học</th>
                  <th className="py-4">Giảng viên</th>
                  <th className="py-4">Môn học</th>
                  <th className="py-4">Khối lớp</th>
                  <th className="py-4">Trạng thái</th>
                  <th className="py-4">Giá cả</th>
                  <th className="py-4">Cập nhật</th>
                  <th className="pr-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/10">
                {coursesList.map((course) => {
                  const hasDiscount = course.salePrice !== null;
                  
                  return (
                    <tr key={course.id} className="hover:bg-admin-surface-low/20 transition-colors text-[14px]">
                      
                      {/* Thumbnail & Title & Slug */}
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border border-admin-border/20 flex-shrink-0 overflow-hidden bg-admin-surface-low">
                            <img
                              alt={course.title}
                              src={course.thumbnailUrl || 'https://via.placeholder.com/150'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%232E1F26"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23EB4799" font-family="sans-serif" font-weight="bold">HH</text></svg>';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-admin-cream leading-tight truncate flex items-center gap-1.5">
                              {course.title}
                              {course.isFeatured && (
                                <span className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                                  HOT
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-admin-muted truncate mt-0.5">{course.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="py-4 font-semibold text-admin-cream">
                        <div>
                          <p>{course.teacher.fullName}</p>
                          <p className="text-[10px] text-admin-muted font-normal leading-none mt-0.5">
                            {course.teacher.email}
                          </p>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 text-admin-muted">
                        {SUBJECT_LABELS[course.subject] || course.subject}
                      </td>

                      {/* Grade */}
                      <td className="py-4 text-admin-muted font-semibold">
                        Lớp {course.grade}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        {course.status === 'published' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            PUBLISHED
                          </span>
                        )}
                        {course.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded bg-admin-pink/10 text-admin-pink text-[10px] font-bold uppercase tracking-wider border border-admin-pink/20">
                            DRAFT
                          </span>
                        )}
                        {course.status === 'archived' && (
                          <span className="px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider border border-zinc-500/20">
                            ARCHIVED
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 font-semibold">
                        {hasDiscount ? (
                          <div>
                            <p className="text-admin-cream">{formatPrice(course.salePrice!)}</p>
                            <p className="text-[11px] text-admin-muted line-through leading-none mt-0.5 font-normal">
                              {formatPrice(course.price)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-admin-cream">{formatPrice(course.price)}</span>
                        )}
                      </td>

                      {/* Updated date */}
                      <td className="py-4 text-admin-muted text-xs">
                        {formatDate(course.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/courses/${course.id}/builder`}
                            className="bg-admin-surface-low hover:border-admin-pink border border-admin-border/30 text-admin-cream px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Manage Content
                          </Link>
                          
                          {/* Publish/Archive quickly */}
                          {course.status === 'draft' ? (
                            <button
                              onClick={() => handlePublish(course.id)}
                              className="p-1.5 text-admin-muted hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Phát hành khóa học"
                            >
                              <CheckCircle size={16} />
                            </button>
                          ) : course.status === 'published' ? (
                            <button
                              onClick={() => handleArchive(course.id)}
                              className="p-1.5 text-admin-muted hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                              title="Lưu trữ khóa học"
                            >
                              <Archive size={16} />
                            </button>
                          ) : null}

                          <button
                            className="p-1.5 text-admin-muted hover:text-admin-cream rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-admin-border/30 bg-admin-surface-low/30">
            <p className="text-xs text-admin-muted">
              Hiển thị <span className="font-bold text-admin-cream">{coursesList.length}</span> trên <span className="font-bold text-admin-cream">{totalItems}</span> khóa học
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 border border-admin-border/30 rounded-lg text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[12px] transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-admin-pink text-white shadow-sm'
                      : 'border border-admin-border/30 text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border border-admin-border/30 rounded-lg text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        
        <div className="bg-admin-deep p-6 rounded-xl border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-emerald-400">+12% ↑</span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-admin-muted uppercase tracking-wider">Khóa học hoạt động</p>
            <p className="text-3xl font-bold text-admin-cream mt-1">{kpis.active}</p>
          </div>
        </div>

        <div className="bg-admin-deep p-6 rounded-xl border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-admin-pink/10 text-admin-pink rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-admin-pink">+2 hôm nay</span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-admin-muted uppercase tracking-wider">Bản nháp (Draft)</p>
            <p className="text-3xl font-bold text-admin-cream mt-1">{kpis.draft}</p>
          </div>
        </div>

        <div className="bg-admin-deep p-6 rounded-xl border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-admin-muted">Tổng số</span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-admin-muted uppercase tracking-wider">Giảng viên phụ trách</p>
            <p className="text-3xl font-bold text-admin-cream mt-1">4</p>
          </div>
        </div>

        <div className="bg-admin-deep p-6 rounded-xl border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold text-emerald-400">+8.2% ↑</span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-admin-muted uppercase tracking-wider">Doanh thu tháng (ước tính)</p>
            <p className="text-3xl font-bold text-admin-cream mt-1">1.2B đ</p>
          </div>
        </div>

      </div>

      {/* Create Course Modal */}
      <CourseCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefreshList}
      />

    </div>
  );
}
