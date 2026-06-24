'use client';

import { useState, useEffect } from 'react';
import { X, CloudUpload, Film, FileText, CheckSquare, Loader2, Save, AlertCircle, Plus } from 'lucide-react';
import { AdminLessonRequest, AdminLessonResponse } from '../api/courses';

type LessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdminLessonRequest) => Promise<void>;
  initialData?: Partial<AdminLessonResponse> | null;
};

// Mock assessments list for Quiz Picker
const mockAssessments = [
  { id: 'assess-1', title: 'Đề thi thử THPT Quốc gia môn Toán 2026 - Đợt 1' },
  { id: 'assess-2', title: 'Bài tập trắc nghiệm Khảo sát Hàm số (15 câu)' },
  { id: 'assess-3', title: 'Đề kiểm tra 1 tiết Hàm số Mũ và Lũy thừa' },
  { id: 'assess-4', title: 'Đề thi đánh giá năng lực - Phần Tư duy Toán học' },
];

export default function LessonModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}: LessonModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'quiz' | 'document'>('video');
  const [description, setDescription] = useState('');
  const [allowPreview, setAllowPreview] = useState(false);

  // Video Specific States
  const [videoType, setVideoType] = useState<'system' | 'youtube'>('system');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [durationMin, setDurationMin] = useState(10);
  const [durationSec, setDurationSec] = useState(0);
  
  // Media upload simulation
  const [videoMediaId, setVideoMediaId] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Quiz Specific States
  const [assessmentId, setAssessmentId] = useState('');

  // General States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      
      if (initialData) {
        setTitle(initialData.title || '');
        setType(initialData.type || 'video');
        setDescription(initialData.description || '');
        setAllowPreview(initialData.allowPreview || false);
        
        if (initialData.type === 'video') {
          setVideoType(initialData.videoType || 'system');
          setYoutubeUrl(initialData.youtubeUrl || '');
          const totalSec = initialData.durationSec || 0;
          setDurationMin(Math.floor(totalSec / 60));
          setDurationSec(totalSec % 60);
          setVideoMediaId(initialData.videoMediaId || null);
          setVideoFileName(initialData.videoMedia ? 'video_lesson_media.mp4' : null);
        } else {
          setVideoType('system');
          setYoutubeUrl('');
          setDurationMin(10);
          setDurationSec(0);
          setVideoMediaId(null);
          setVideoFileName(null);
        }

        if (initialData.type === 'quiz') {
          const assId = initialData.assessmentId || '';
          setAssessmentId(assId);
        } else {
          setAssessmentId('');
        }
      } else {
        // Reset to default empty state
        setTitle('');
        setType('video');
        setDescription('');
        setAllowPreview(false);
        setVideoType('system');
        setYoutubeUrl('');
        setDurationMin(10);
        setDurationSec(0);
        setVideoMediaId(null);
        setVideoFileName(null);
        setAssessmentId('');
      }
      setUploadProgress(null);
      setUploadError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Vui lòng chỉ tải lên các tệp video (.mp4, .webm).');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Dung lượng video vượt quá giới hạn 100MB.');
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setVideoFileName(file.name);

    // Simulate video uploading
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setVideoMediaId('mock-video-media-id-' + Math.random().toString(36).substr(2, 9));
          setUploadProgress(null);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài học.');
      return;
    }

    if (type === 'document' && !description.trim()) {
      setError('Mô tả/nội dung tài liệu không được để trống.');
      return;
    }

    if (type === 'quiz' && !assessmentId) {
      setError('Vui lòng chọn một bài kiểm tra để liên kết.');
      return;
    }

    if (type === 'video') {
      if (videoType === 'youtube' && !youtubeUrl.trim()) {
        setError('Vui lòng nhập đường dẫn YouTube URL.');
        return;
      }
      if (videoType === 'system' && !videoMediaId) {
        setError('Vui lòng tải lên tệp video bài học.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload: AdminLessonRequest = {
        title: title.trim(),
        type,
        description: description.trim() || null,
        allowPreview,
      };

      if (type === 'video') {
        payload.videoType = videoType;
        payload.durationSec = durationMin * 60 + durationSec;
        if (videoType === 'system') {
          payload.videoMediaId = videoMediaId;
        } else {
          payload.youtubeUrl = youtubeUrl.trim();
        }
      } else if (type === 'quiz') {
        payload.assessmentId = assessmentId;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu bài học.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-2xl rounded-2xl shadow-2xl border border-admin-border/30 relative flex flex-col my-auto max-h-[90vh] overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors"
          type="button"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 py-5 border-b border-admin-border/10 bg-admin-surface-low/30">
          <h2 className="text-lg font-bold flex items-center gap-2 text-admin-cream">
            <span className="text-admin-pink flex items-center justify-center">
              {initialData ? <Loader2 size={20} className="animate-pulse" /> : <Plus size={20} />}
            </span>
            {initialData ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
          </h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-1.5">
            <label htmlFor="lesson-title-input" className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
              Tiêu đề bài học <span className="text-admin-pink">*</span>
            </label>
            <input
              id="lesson-title-input"
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài học..."
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-base"
            />
          </div>

          {/* Lesson Type Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
              Loại bài học
            </label>
            <div className="flex border border-admin-border/20 rounded-xl p-1 bg-admin-off">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setType('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  type === 'video'
                    ? 'bg-admin-pink text-white shadow-md'
                    : 'text-admin-muted hover:text-admin-cream'
                }`}
              >
                <Film size={16} /> Video
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setType('document')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  type === 'document'
                    ? 'bg-admin-pink text-white shadow-md'
                    : 'text-admin-muted hover:text-admin-cream'
                }`}
              >
                <FileText size={16} /> Tài liệu
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setType('quiz')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  type === 'quiz'
                    ? 'bg-admin-pink text-white shadow-md'
                    : 'text-admin-muted hover:text-admin-cream'
                }`}
              >
                <CheckSquare size={16} /> Bài kiểm tra
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="lesson-desc-input" className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
              Mô tả bài học {type === 'document' && <span className="text-admin-pink">*</span>}
            </label>
            <textarea
              id="lesson-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'document'
                  ? 'Nhập nội dung hoặc mô tả hướng dẫn chi tiết tài liệu học tập...'
                  : 'Nhập tóm tắt mô tả ngắn gọn về bài học này...'
              }
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-base resize-none"
            />
          </div>

          {/* Type-Specific Configurations */}
          {type === 'video' && (
            <div className="space-y-4 pt-2 border-t border-admin-border/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Video Source Option */}
                <div className="space-y-1.5">
                  <label htmlFor="video-source-select" className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                    Nguồn video
                  </label>
                  <select
                    id="video-source-select"
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value as 'system' | 'youtube')}
                    className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl px-4 py-3 text-admin-cream transition-all font-medium text-base appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1rem'
                    }}
                  >
                    <option value="system" className="bg-admin-deep text-admin-cream">Video hệ thống (Tải lên)</option>
                    <option value="youtube" className="bg-admin-deep text-admin-cream">YouTube URL</option>
                  </select>
                </div>

                {/* Duration Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                    Thời lượng video
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        value={durationMin}
                        onChange={(e) => setDurationMin(Number(e.target.value))}
                        className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl pl-4 pr-12 py-3 text-admin-cream font-medium text-base"
                      />
                      <span className="absolute right-4 text-xs text-admin-muted font-bold pointer-events-none">phút</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={durationSec}
                        onChange={(e) => setDurationSec(Number(e.target.value))}
                        className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl pl-4 pr-12 py-3 text-admin-cream font-medium text-sm"
                      />
                      <span className="absolute right-4 text-xs text-admin-muted font-bold pointer-events-none">giây</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Upload system video */}
              {videoType === 'system' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                    Tải lên file video
                  </label>
                  
                  {uploadError && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle size={12} /> {uploadError}
                    </p>
                  )}

                  {videoFileName ? (
                    <div className="flex items-center gap-4 bg-admin-surface-low border border-admin-border/20 px-5 py-4 rounded-xl w-full">
                      <div className="w-8 h-8 rounded bg-admin-pink/10 text-admin-pink flex items-center justify-center flex-shrink-0">
                        <Film size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-admin-cream truncate">{videoFileName}</p>
                        <p className="text-xs text-admin-muted">
                          {uploadProgress !== null ? `Đang tải lên: ${uploadProgress}%` : 'Tệp video đã sẵn sàng'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoMediaId(null);
                          setVideoFileName(null);
                          setUploadProgress(null);
                        }}
                        className="text-admin-pink text-xs font-bold hover:underline cursor-pointer"
                      >
                        THAY ĐỔI
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-admin-border/30 rounded-xl p-8 flex flex-col items-center justify-center bg-admin-surface-low/30 hover:bg-admin-surface-low/50 hover:border-admin-pink/50 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <CloudUpload size={28} className="text-admin-muted group-hover:text-admin-pink transition-colors mb-2" />
                      <p className="text-xs font-bold text-admin-cream">Kéo thả file video vào đây hoặc <span className="text-admin-pink">chọn từ máy tính</span></p>
                      <p className="text-xs text-admin-muted mt-1">Hỗ trợ các định dạng video MP4, WebM (Tối đa 100MB)</p>
                    </div>
                  )}
                </div>
              ) : (
                /* YouTube link */
                <div className="space-y-1.5">
                  <label htmlFor="youtube-url-input" className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                    Đường dẫn YouTube URL <span className="text-admin-pink">*</span>
                  </label>
                  <input
                    id="youtube-url-input"
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-base"
                  />
                </div>
              )}
            </div>
          )}

          {type === 'quiz' && (
            <div className="space-y-3 pt-2 border-t border-admin-border/10">
              <label htmlFor="assessment-select" className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                Chọn bài kiểm tra bài học <span className="text-admin-pink">*</span>
              </label>
              <select
                id="assessment-select"
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl px-4 py-3 text-admin-cream transition-all font-medium text-base appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="" className="bg-admin-deep text-admin-cream">-- Chọn bài kiểm tra liên kết --</option>
                {mockAssessments.map((a) => (
                  <option key={a.id} value={a.id} className="bg-admin-deep text-admin-cream">
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview Switch */}
          <div className="flex items-center justify-between py-4 border-t border-admin-border/15">
            <div>
              <p className="text-sm font-bold text-admin-cream">Cho phép học thử (Preview)</p>
              <p className="text-xs text-admin-muted mt-0.5">
                Học sinh chưa mua khóa học vẫn có thể xem nội dung bài học này.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowPreview}
                onChange={(e) => setAllowPreview(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-admin-surface-low border border-admin-border/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-pink peer-checked:after:bg-white peer-checked:border-admin-pink"></div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-admin-border/10 bg-admin-surface-low/30 flex justify-end gap-4 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-admin-muted hover:text-admin-cream transition-colors cursor-pointer uppercase tracking-wider"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (type === 'video' && videoType === 'system' && uploadProgress !== null)}
            className="px-8 py-2.5 bg-admin-pink text-white font-bold text-xs rounded-xl hover:brightness-110 shadow-lg shadow-admin-pink/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Lưu bài học
          </button>
        </div>

      </div>
    </div>
  );
}
