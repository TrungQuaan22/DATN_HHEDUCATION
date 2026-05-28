'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Settings,
  Sparkles,
  Info,
  Archive,
  RefreshCw,
  Video,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import {
  getAdminCourse,
  publishAdminCourse,
  archiveAdminCourse,
  createAdminChapter,
  updateAdminChapter,
  deleteAdminChapter,
  reorderAdminChapters,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  reorderAdminLessons,
  AdminCourseDetailResponse,
  AdminChapterResponse,
  AdminLessonResponse,
  AdminLessonRequest
} from '@/features/admin/api/courses';

import ChapterModal from '@/features/admin/components/chapter-modal';
import LessonModal from '@/features/admin/components/lesson-modal';

// Initial mock chapters in case Backend is offline
const initialMockChapters: AdminChapterResponse[] = [
  {
    id: 'chapter-1',
    courseId: 'course-3',
    title: 'Chương 1: Khảo sát Hàm số',
    orderIndex: 1,
    lessons: [
      {
        id: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Lý thuyết khảo sát sự biến thiên của hàm số',
        type: 'document',
        description: 'Tài liệu lý thuyết chi tiết về sự biến thiên và cách vẽ đồ thị hàm số.',
        videoType: null,
        videoMediaId: null,
        youtubeUrl: null,
        durationSec: null,
        allowPreview: true,
        orderIndex: 1,
      },
      {
        id: 'lesson-2',
        chapterId: 'chapter-1',
        title: 'Video hướng dẫn giải bài tập cực trị hàm số',
        type: 'video',
        description: 'Video giải chi tiết các dạng bài tập tìm cực trị của hàm số tự luận và trắc nghiệm.',
        videoType: 'youtube',
        videoMediaId: null,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationSec: 930, // 15:30
        allowPreview: false,
        orderIndex: 2,
      },
      {
        id: 'lesson-3',
        chapterId: 'chapter-1',
        title: 'Bài giảng: Tiệm cận của đồ thị hàm số',
        type: 'video',
        description: 'Bài giảng lý thuyết tiệm cận đứng, tiệm cận ngang và tiệm cận xiên.',
        videoType: 'system',
        videoMediaId: 'mock-video-media-id-ready',
        youtubeUrl: null,
        durationSec: 1455, // 24:15
        allowPreview: true,
        orderIndex: 3,
        videoMedia: { id: 'mock-video-media-id-ready', objectKey: 'video.mp4' }
      }
    ]
  },
  {
    id: 'chapter-2',
    courseId: 'course-3',
    title: 'Chương 2: Hàm số Lũy thừa, Hàm số Mũ và Logarit',
    orderIndex: 2,
    lessons: []
  }
];

export default function AdminCurriculumBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.courseId as string;

  // Local state to manage curriculum when offline / demo mode
  const [chapters, setChapters] = useState<AdminChapterResponse[]>([]);
  const [courseInfo, setCourseInfo] = useState<{ title: string; status: 'draft' | 'published' | 'archived' } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Collapse/Expand state for chapters
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'chapter-1': true
  });

  // Modals state
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<{ id: string; title: string } | null>(null);
  
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetChapterIdForLesson, setTargetChapterIdForLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: AdminLessonResponse; chapterId: string } | null>(null);

  // Toast Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Set mounted state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch Course Detail
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['admin-course-detail', courseId],
    queryFn: () => getAdminCourse(courseId),
    retry: 1,
    meta: {
      onError: (err: any) => {
        console.warn('API connection failed, activating Demo Mode', err);
        setIsDemoMode(true);
      }
    }
  });

  // Sync API data to local state on successful load
  useEffect(() => {
    if (apiData) {
      setChapters(apiData.chapters || []);
      setCourseInfo({
        title: apiData.title,
        status: apiData.status
      });
      setIsDemoMode(false);
    } else if (error) {
      // If API fails, fall back to mock data
      setCourseInfo({
        title: 'Toán học 12 Nâng cao (Demo)',
        status: 'draft'
      });
      setChapters(initialMockChapters);
      setIsDemoMode(true);
    }
  }, [apiData, error]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Chapter Toggle Expand
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // --- API Mutations ---
  
  const publishMutation = useMutation({
    mutationFn: () => publishAdminCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
      showToast('Đã xuất bản khóa học thành công!');
    },
    onError: () => {
      // Mock update
      if (courseInfo) {
        setCourseInfo({ ...courseInfo, status: 'published' });
      }
      showToast('Đã chuyển trạng thái sang Published (Demo)', 'info');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveAdminCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
      showToast('Đã lưu trữ khóa học thành công.');
    },
    onError: () => {
      // Mock update
      if (courseInfo) {
        setCourseInfo({ ...courseInfo, status: 'archived' });
      }
      showToast('Đã chuyển trạng thái sang Archived (Demo)', 'info');
    }
  });

  // --- Chapter Operations ---

  const handleSaveChapter = async (title: string) => {
    if (editingChapter) {
      // Edit mode
      try {
        if (isDemoMode) throw new Error('Demo mode active');
        await updateAdminChapter(editingChapter.id, title);
        queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
        showToast('Đã cập nhật chương thành công.');
      } catch {
        setChapters(chapters.map(c => c.id === editingChapter.id ? { ...c, title } : c));
        showToast('Đã cập nhật chương (Demo Mode)', 'info');
      }
    } else {
      // Add mode
      try {
        if (isDemoMode) throw new Error('Demo mode active');
        await createAdminChapter(courseId, title);
        queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
        showToast('Đã thêm chương mới thành công.');
      } catch {
        const nextOrder = chapters.length + 1;
        const newCh = {
          id: 'chapter-' + Date.now(),
          courseId,
          title,
          orderIndex: nextOrder,
          lessons: []
        };
        setChapters([...chapters, newCh]);
        setExpandedChapters(prev => ({ ...prev, [newCh.id]: true }));
        showToast('Đã thêm chương mới (Demo Mode)', 'info');
      }
    }
    setEditingChapter(null);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này và tất cả bài học bên trong không?')) return;
    
    try {
      if (isDemoMode) throw new Error('Demo mode active');
      await deleteAdminChapter(chapterId);
      queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
      showToast('Đã xóa chương thành công.');
    } catch {
      setChapters(chapters.filter(c => c.id !== chapterId));
      showToast('Đã xóa chương (Demo Mode)', 'info');
    }
  };

  // --- Lesson Operations ---

  const handleSaveLesson = async (data: AdminLessonRequest) => {
    if (editingLesson) {
      // Edit mode
      const { lesson, chapterId } = editingLesson;
      try {
        if (isDemoMode) throw new Error('Demo mode active');
        await updateAdminLesson(lesson.id, data);
        queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
        showToast('Đã cập nhật bài học thành công.');
      } catch {
        setChapters(chapters.map(c => {
          if (c.id === chapterId) {
            return {
              ...c,
              lessons: c.lessons.map(l => l.id === lesson.id ? { 
                ...l, 
                ...data,
                // map relations internally
                lessonAssessments: data.assessmentId ? [{ assessmentId: data.assessmentId }] : l.lessonAssessments,
                videoMedia: data.videoMediaId ? { id: data.videoMediaId, objectKey: 'video_lesson_media.mp4' } : null
              } : l)
            };
          }
          return c;
        }));
        showToast('Đã cập nhật bài học (Demo Mode)', 'info');
      }
    } else if (targetChapterIdForLesson) {
      // Add mode
      try {
        if (isDemoMode) throw new Error('Demo mode active');
        await createAdminLesson(targetChapterIdForLesson, data);
        queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
        showToast('Đã thêm bài học mới thành công.');
      } catch {
        const chapter = chapters.find(c => c.id === targetChapterIdForLesson);
        const order = (chapter?.lessons.length || 0) + 1;
        const newLesson: AdminLessonResponse = {
          id: 'lesson-' + Date.now(),
          chapterId: targetChapterIdForLesson,
          title: data.title,
          type: data.type,
          description: data.description || null,
          videoType: data.videoType || null,
          videoMediaId: data.videoMediaId || null,
          youtubeUrl: data.youtubeUrl || null,
          durationSec: data.durationSec || null,
          allowPreview: data.allowPreview || false,
          orderIndex: order,
          lessonAssessments: data.assessmentId ? [{ assessmentId: data.assessmentId }] : [],
          videoMedia: data.videoMediaId ? { id: data.videoMediaId, objectKey: 'video_lesson_media.mp4' } : null
        };

        setChapters(chapters.map(c => {
          if (c.id === targetChapterIdForLesson) {
            return {
              ...c,
              lessons: [...c.lessons, newLesson]
            };
          }
          return c;
        }));
        showToast('Đã thêm bài học mới (Demo Mode)', 'info');
      }
    }
    
    setEditingLesson(null);
    setTargetChapterIdForLesson(null);
  };

  const handleDeleteLesson = async (lessonId: string, chapterId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này không?')) return;
    
    try {
      if (isDemoMode) throw new Error('Demo mode active');
      await deleteAdminLesson(lessonId);
      queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
      showToast('Đã xóa bài học thành công.');
    } catch {
      setChapters(chapters.map(c => {
        if (c.id === chapterId) {
          return {
            ...c,
            lessons: c.lessons.filter(l => l.id !== lessonId).map((l, i) => ({ ...l, orderIndex: i + 1 }))
          };
        }
        return c;
      }));
      showToast('Đã xóa bài học (Demo Mode)', 'info');
    }
  };

  // --- Drag and Drop Reordering ---

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type: dragType } = result;
    
    // Dropped outside list
    if (!destination) return;
    
    // Dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (dragType === 'CHAPTER') {
      const reordered = [...chapters];
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const finalChapters = reordered.map((c, i) => ({ ...c, orderIndex: i + 1 }));
      setChapters(finalChapters);

      try {
        if (isDemoMode) throw new Error('Demo mode active');
        await reorderAdminChapters(courseId, finalChapters.map(c => c.id));
        queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
        showToast('Sắp xếp chương thành công.');
      } catch {
        showToast('Sắp xếp chương thành công (Demo Mode)', 'info');
      }
    } else if (dragType === 'LESSON') {
      const sourceChapterId = source.droppableId;
      const destChapterId = destination.droppableId;

      // Constraint: dragging lessons across different chapters is disabled
      if (sourceChapterId !== destChapterId) {
        showToast('Không hỗ trợ kéo thả bài học sang chương khác.', 'error');
        return;
      }

      const chapter = chapters.find(c => c.id === sourceChapterId);
      if (!chapter) return;

      const reorderedLessons = [...chapter.lessons];
      const [removed] = reorderedLessons.splice(source.index, 1);
      reorderedLessons.splice(destination.index, 0, removed);

      const finalLessons = reorderedLessons.map((l, i) => ({ ...l, orderIndex: i + 1 }));

      setChapters(chapters.map(c => c.id === sourceChapterId ? { ...c, lessons: finalLessons } : c));

      try {
        if (isDemoMode) throw new Error('Demo mode active');
        await reorderAdminLessons(sourceChapterId, finalLessons.map(l => l.id));
        queryClient.invalidateQueries({ queryKey: ['admin-course-detail', courseId] });
        showToast('Sắp xếp bài học thành công.');
      } catch {
        showToast('Sắp xếp bài học thành công (Demo Mode)', 'info');
      }
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatDuration = (totalSecs: number | null) => {
    if (totalSecs === null) return '';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-admin-muted">
        <Link href="/admin/courses" className="hover:text-admin-pink transition-colors">
          Quản lý khóa học
        </Link>
        <ChevronRight size={12} />
        <span className="truncate max-w-[200px]">{courseInfo?.title || 'Đang tải...'}</span>
        <ChevronRight size={12} />
        <span className="text-admin-cream font-bold">Trình xây dựng chương trình học</span>
      </div>

      {/* Main Top Header */}
      <div className="bg-admin-surface-low border border-admin-border/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-admin-cream">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/courses')}
            className="text-admin-muted hover:text-admin-pink p-2 bg-admin-deep hover:bg-admin-deep/70 border border-admin-border/10 rounded-full transition-all cursor-pointer"
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold font-serif leading-tight">
                {courseInfo ? courseInfo.title : 'Đang tải khóa học...'}
              </h1>
              {courseInfo && (
                <>
                  {courseInfo.status === 'draft' && (
                    <span className="px-2 py-0.5 rounded bg-admin-pink/10 text-admin-pink text-[10px] font-bold uppercase tracking-wider border border-admin-pink/20">
                      DRAFT
                    </span>
                  )}
                  {courseInfo.status === 'published' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      PUBLISHED
                    </span>
                  )}
                  {courseInfo.status === 'archived' && (
                    <span className="px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider border border-zinc-500/20">
                      ARCHIVED
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-admin-muted mt-1">
              {isDemoMode 
                ? 'Chế độ Demo (Offline) • Kéo thả lưu ở Client cache' 
                : 'Đã kết nối API đồng bộ hóa thời gian thực'}
            </p>
          </div>
        </div>

        {/* Quick action buttons on Course */}
        <div className="flex items-center gap-2.5">
          {courseInfo?.status === 'draft' ? (
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="bg-admin-pink text-white px-5 py-2 text-[13px] font-bold rounded-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle size={15} />
              Xuất bản khóa học
            </button>
          ) : courseInfo?.status === 'published' ? (
            <button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="border border-amber-500/30 bg-amber-500/10 text-amber-400 px-5 py-2 text-[13px] font-bold rounded-xl flex items-center gap-1.5 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Archive size={15} />
              Lưu trữ khóa học
            </button>
          ) : (
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="bg-admin-pink text-white px-5 py-2 text-[13px] font-bold rounded-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Mở lại bản nháp
            </button>
          )}
          
          <button
            onClick={() => showToast('Màn hình chỉnh sửa thông tin đang được cập nhật.', 'info')}
            className="p-2 border border-admin-border/30 bg-admin-deep text-admin-cream rounded-xl hover:border-admin-pink transition-all"
            title="Chỉnh sửa thông tin cơ bản"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Alert status box */}
      <div className="bg-admin-surface-low/50 text-admin-cream p-4 rounded-xl flex items-start gap-3 border border-admin-border/20">
        <Info className="text-admin-pink w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[13px] font-semibold">
            {courseInfo?.status === 'draft' 
              ? 'Khóa học đang ở chế độ Nháp (Draft). Bạn có thể kéo thả để thay đổi vị trí các chương, bài học để cấu trúc chương trình học.'
              : 'Khóa học đang được hiển thị cho học sinh. Các thay đổi về cấu trúc bài học sẽ cập nhật trực tiếp vào chương trình học tập của học viên.'}
          </p>
        </div>
      </div>

      {/* Curriculum Builder main Canvas */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-admin-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-admin-muted text-sm font-medium">Đang nạp dữ liệu chương trình học...</p>
        </div>
      ) : !hasMounted ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-admin-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-admin-muted text-sm font-medium">Khởi tạo trình kéo thả...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-admin-border/30 bg-admin-surface-low/20 rounded-2xl flex flex-col items-center justify-center">
              <SlidersHorizontal className="text-admin-muted w-10 h-10 mb-3" />
              <h3 className="font-bold text-admin-cream text-lg">Chưa có chương nào</h3>
              <p className="text-admin-muted text-xs mt-1 max-w-xs">
                Bắt đầu xây dựng chương trình học bằng cách tạo chương đầu tiên của bạn.
              </p>
              <button
                onClick={() => {
                  setEditingChapter(null);
                  setIsChapterModalOpen(true);
                }}
                className="mt-4 bg-admin-pink text-white px-5 py-2 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Thêm chương mới
              </button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="all-chapters" type="CHAPTER">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {/* Chapters List */}
                    {chapters.map((chapter, chIdx) => {
                      const isExpanded = !!expandedChapters[chapter.id];
                      
                      return (
                        <Draggable key={chapter.id} draggableId={chapter.id} index={chIdx}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-admin-deep rounded-2xl border border-admin-border/30 overflow-hidden shadow-md ${
                                snapshot.isDragging ? 'border-admin-pink shadow-2xl bg-admin-surface-low/40' : ''
                              }`}
                            >
                              {/* Chapter Header */}
                              <div 
                                onClick={() => toggleChapter(chapter.id)}
                                className="bg-admin-surface-low p-4 flex items-center justify-between border-b border-admin-border/10 cursor-pointer select-none group"
                              >
                                <div className="flex items-center gap-3 min-w-0" onClick={e => e.stopPropagation()}>
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-admin-muted hover:text-admin-pink p-1 cursor-grab"
                                    title="Kéo thả để sắp xếp chương"
                                  >
                                    <GripVertical size={16} />
                                  </div>

                                  <h2 className="font-bold text-[15px] text-admin-cream truncate">
                                    {chapter.title}
                                  </h2>
                                  
                                  <span className="text-[11px] text-admin-muted bg-admin-deep px-2 py-0.5 rounded-md border border-admin-border/10">
                                    {chapter.lessons.length} bài học
                                  </span>
                                </div>

                                {/* Header Actions */}
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      setTargetChapterIdForLesson(chapter.id);
                                      setEditingLesson(null);
                                      setIsLessonModalOpen(true);
                                    }}
                                    className="text-admin-pink border border-admin-pink/20 hover:bg-admin-pink hover:text-white px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} />
                                    Thêm bài học
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setEditingChapter({ id: chapter.id, title: chapter.title });
                                      setIsChapterModalOpen(true);
                                    }}
                                    className="p-1.5 text-admin-muted hover:text-admin-cream bg-admin-deep/50 hover:bg-admin-deep rounded-lg transition-colors cursor-pointer border border-admin-border/5"
                                    title="Sửa tiêu đề chương"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteChapter(chapter.id)}
                                    className="p-1.5 text-admin-muted hover:text-red-400 bg-admin-deep/50 hover:bg-admin-deep rounded-lg transition-colors cursor-pointer border border-admin-border/5"
                                    title="Xóa chương"
                                  >
                                    <Trash2 size={13} />
                                  </button>

                                  <button 
                                    onClick={() => toggleChapter(chapter.id)}
                                    className="p-1.5 text-admin-muted hover:text-admin-cream cursor-pointer"
                                  >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                              </div>

                              {/* Lessons List Inside Chapter */}
                              {isExpanded && (
                                <Droppable droppableId={chapter.id} type="LESSON">
                                  {(provided) => (
                                    <div 
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      className="p-4 bg-admin-off/40 space-y-2.5"
                                    >
                                      {chapter.lessons.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-admin-muted italic">
                                          Chưa có bài học nào trong chương này. Nhấp "Thêm bài học" để bắt đầu.
                                        </div>
                                      ) : (
                                        chapter.lessons.map((lesson, lesIdx) => (
                                          <Draggable key={lesson.id} draggableId={lesson.id} index={lesIdx}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-admin-surface-low/40 border border-admin-border/10 rounded-xl p-3 flex items-center justify-between hover:border-admin-pink/40 hover:bg-admin-surface-low/80 transition-all group ${
                                                  snapshot.isDragging ? 'border-admin-pink shadow-lg bg-admin-surface-low' : ''
                                                }`}
                                              >
                                                <div className="flex items-center gap-3 min-w-0">
                                                  {/* Drag Handle */}
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="text-admin-muted hover:text-admin-pink p-1 cursor-grab opacity-50 group-hover:opacity-100 transition-opacity"
                                                    title="Kéo thả để sắp xếp bài học"
                                                  >
                                                    <GripVertical size={14} />
                                                  </div>

                                                  {/* Lesson Icon */}
                                                  <div className="w-8 h-8 rounded-lg bg-admin-deep border border-admin-border/20 flex items-center justify-center text-admin-pink flex-shrink-0">
                                                    {lesson.type === 'video' && <PlayCircle size={16} />}
                                                    {lesson.type === 'document' && <FileText size={16} />}
                                                    {lesson.type === 'quiz' && <HelpCircle size={16} />}
                                                  </div>

                                                  {/* Lesson Title & badges */}
                                                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm text-admin-cream truncate">
                                                      {lesson.title}
                                                    </span>

                                                    {/* Preview badge */}
                                                    {lesson.allowPreview && (
                                                      <span className="bg-admin-pink/10 text-admin-pink text-[9px] font-bold px-1.5 py-0.5 rounded border border-admin-pink/20">
                                                        Học thử
                                                      </span>
                                                    )}

                                                    {/* Video metadata */}
                                                    {lesson.type === 'video' && (
                                                      <>
                                                        {lesson.videoType === 'system' ? (
                                                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                            Video Hệ thống
                                                          </span>
                                                        ) : (
                                                          <span className="bg-red-500/10 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                                                            YouTube
                                                          </span>
                                                        )}
                                                        {lesson.durationSec && (
                                                          <span className="text-[11px] text-admin-muted">
                                                            ({formatDuration(lesson.durationSec)})
                                                          </span>
                                                        )}
                                                      </>
                                                    )}

                                                    {/* Quiz badge */}
                                                    {lesson.type === 'quiz' && (
                                                      <span className="bg-blue-500/10 text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-500/20">
                                                        Quiz
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Lesson Actions */}
                                                <div className="flex items-center gap-1 text-admin-muted group-hover:opacity-100 transition-opacity">
                                                  <button
                                                    onClick={() => {
                                                      setEditingLesson({ lesson, chapterId: chapter.id });
                                                      setTargetChapterIdForLesson(null);
                                                      setIsLessonModalOpen(true);
                                                    }}
                                                    className="p-1 hover:text-admin-cream rounded hover:bg-admin-surface-low transition-colors cursor-pointer"
                                                    title="Chỉnh sửa bài học"
                                                  >
                                                    <Edit size={14} />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteLesson(lesson.id, chapter.id)}
                                                    className="p-1 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                                                    title="Xóa bài học"
                                                  >
                                                    <Trash2 size={14} />
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))
                                      )}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Add Chapter Button */}
          <button
            onClick={() => {
              setEditingChapter(null);
              setIsChapterModalOpen(true);
            }}
            className="w-full py-5 border-2 border-dashed border-admin-border/30 hover:border-admin-pink/50 rounded-2xl text-admin-muted hover:text-admin-pink hover:bg-admin-surface-low/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group mt-4"
          >
            <div className="bg-admin-surface-low group-hover:bg-admin-pink/10 text-admin-muted group-hover:text-admin-pink w-9 h-9 rounded-full flex items-center justify-center transition-colors">
              <Plus size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Thêm chương mới</span>
          </button>
        </div>
      )}

      {/* Chapter Modal */}
      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => {
          setIsChapterModalOpen(false);
          setEditingChapter(null);
        }}
        onSave={handleSaveChapter}
        initialTitle={editingChapter?.title || ''}
      />

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setTargetChapterIdForLesson(null);
          setEditingLesson(null);
        }}
        onSave={handleSaveLesson}
        initialData={editingLesson?.lesson || null}
      />

      {/* Float Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-sm font-semibold ${
            notification.type === 'success' 
              ? 'bg-admin-deep border-emerald-500/30 text-emerald-400'
              : notification.type === 'error'
              ? 'bg-admin-deep border-red-500/30 text-red-400'
              : 'bg-admin-deep border-admin-pink/30 text-admin-pink'
          }`}>
            <Sparkles size={16} className={notification.type === 'success' ? 'animate-pulse' : ''} />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
