"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import {
  X,
  FileText,
  CheckSquare,
  Loader2,
  Save,
  AlertCircle,
  Plus,
  Film,
} from "lucide-react";
import { AdminLessonRequest, AdminCourseLesson } from "../types";
import { getApiErrorMessage, UI_MESSAGES } from "@/lib/constants/messages";
import {
  lessonSchema,
  LessonFormValues,
  LessonFormInput,
} from "../validation";
import LessonYoutubeField from "./lesson-youtube-field";
import LessonSystemVideoField from "./lesson-system-video-field";
import LessonQuizField from "./lesson-quiz-field";
import { useAdminAssessmentsQuery } from "@/features/assessments/hooks";
import LessonMaterialsTab from "./lesson-materials-tab";

type LessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdminLessonRequest) => Promise<void>;
  initialData?: Partial<AdminCourseLesson> | null;
};

export default function LessonModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}: LessonModalProps) {
  const params = useParams();
  const courseId = params?.courseId as string | undefined;

  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"general" | "materials">("general");
  const { data: assessmentsData, refetch: refetchAssessments } = useAdminAssessmentsQuery(
    { page: 1, limit: 100 },
    { enabled: isOpen }
  );

  const assessmentsList = useMemo(() => {
    return (assessmentsData?.items || []).map((item) => ({
      id: item.id,
      title: item.title,
    }));
  }, [assessmentsData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues, unknown, LessonFormInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      type: "video",
      description: "",
      allowPreview: false,
      videoType: "system",
      youtubeUrl: "",
      durationMin: 10,
      durationSec: 0,
      videoMediaId: null,
      assessmentId: "",
    },
  });

  const selectedType = watch("type");
  const selectedVideoType = watch("videoType");
  const watchVideoMediaId = watch("videoMediaId");

  useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      setActiveModalTab("general");

      if (initialData) {
        const totalSec = initialData.durationSec || 0;
        const initVal = {
          title: initialData.title || "",
          type: initialData.type || "video",
          description: initialData.description || "",
          allowPreview: initialData.allowPreview || false,
          videoType: initialData.videoType || "system",
          youtubeUrl: initialData.youtubeUrl || "",
          durationMin: Math.floor(totalSec / 60) || 10,
          durationSec: totalSec % 60 || 0,
          videoMediaId: initialData.videoMediaId || null,
          assessmentId: initialData.assessmentId || "",
        };
        reset(initVal);
        setVideoFileName(
          initialData.videoMedia ? "video_lesson_media.mp4" : null
        );
      } else {
        reset({
          title: "",
          type: "video",
          description: "",
          allowPreview: false,
          videoType: "system",
          youtubeUrl: "",
          durationMin: 10,
          durationSec: 0,
          videoMediaId: null,
          assessmentId: "",
        });
        setVideoFileName(null);
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: LessonFormInput) => {
    setGeneralError(null);
    try {
      const payload: AdminLessonRequest = {
        title: data.title.trim(),
        type: data.type,
        description: data.description?.trim() || null,
        allowPreview: data.allowPreview,
      };

      if (data.type === "video") {
        payload.videoType = data.videoType;
        payload.durationSec = data.durationMin * 60 + data.durationSec;
        if (data.videoType === "system") {
          payload.videoMediaId = data.videoMediaId;
        } else {
          payload.youtubeUrl = data.youtubeUrl?.trim() || null;
        }
      } else if (data.type === "quiz") {
        payload.assessmentId = data.assessmentId;
      }

      await onSave(payload);
      handleClose();
    } catch (err: unknown) {
      setGeneralError(getApiErrorMessage(err, UI_MESSAGES.lessons.saveFailed));
    }
  };

  const handleClose = () => {
    reset();
    setVideoFileName(null);
    setGeneralError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-2xl rounded shadow-2xl border border-admin-border/30 relative flex flex-col my-auto max-h-[90vh] overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors"
          type="button"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <div className="px-6 py-5 border-b border-admin-border/10 bg-admin-surface-low/30">
          <h2 className="text-lg font-bold flex items-center gap-2 text-admin-cream">
            <span className="text-admin-pink flex items-center justify-center">
              {initialData ? (
                <Loader2 size={20} className="animate-pulse" />
              ) : (
                <Plus size={20} />
              )}
            </span>
            {initialData ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
          </h2>
        </div>

        {initialData && initialData.id && (
          <div className="flex border-b border-admin-border/10 bg-admin-surface-low/10 px-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModalTab("general")}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
                activeModalTab === "general"
                  ? "text-admin-pink border-admin-pink bg-admin-surface-low/5"
                  : "text-admin-muted hover:text-admin-cream border-transparent"
              }`}
            >
              Chi tiết bài học
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab("materials")}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
                activeModalTab === "materials"
                  ? "text-admin-pink border-admin-pink bg-admin-surface-low/5"
                  : "text-admin-muted hover:text-admin-cream border-transparent"
              }`}
            >
              Tài liệu học tập
            </button>
          </div>
        )}

        {(!initialData || !initialData.id || activeModalTab === "general") ? (
          <>
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar"
            >
          {generalError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="lesson-title-input"
              className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
            >
              Tiêu đề bài học <span className="text-admin-pink">*</span>
            </label>
            <input
              id="lesson-title-input"
              type="text"
              disabled={isSubmitting}
              {...register("title")}
              placeholder="Nhập tiêu đề bài học..."
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-base"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
              Loại bài học
            </label>
            <div className="flex border border-admin-border/20 rounded p-1 bg-admin-off">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setValue("type", "video", { shouldValidate: true })
                }
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  selectedType === "video"
                    ? "bg-admin-pink text-white shadow-md"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                <Film size={16} /> Video
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setValue("type", "document", { shouldValidate: true })
                }
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  selectedType === "document"
                    ? "bg-admin-pink text-white shadow-md"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                <FileText size={16} /> Tài liệu
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setValue("type", "quiz", { shouldValidate: true })
                }
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  selectedType === "quiz"
                    ? "bg-admin-pink text-white shadow-md"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                <CheckSquare size={16} /> Bài kiểm tra
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lesson-desc-input"
              className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
            >
              Mô tả bài học{" "}
              {selectedType === "document" && (
                <span className="text-admin-pink">*</span>
              )}
            </label>
            <textarea
              id="lesson-desc-input"
              rows={3}
              {...register("description")}
              placeholder={
                selectedType === "document"
                  ? "Nhập nội dung hoặc mô tả hướng dẫn chi tiết tài liệu học tập..."
                  : "Nhập tóm tắt mô tả ngắn gọn về bài học này..."
              }
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-base resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {selectedType === "video" && (
            <div className="space-y-4 pt-2 border-t border-admin-border/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="video-source-select"
                    className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
                  >
                    Nguồn video
                  </label>
                  <select
                    id="video-source-select"
                    {...register("videoType")}
                    className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream transition-all font-medium text-base appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1rem",
                    }}
                  >
                    <option
                      value="system"
                      className="bg-admin-deep text-admin-cream"
                    >
                      Video hệ thống (Tải lên)
                    </option>
                    <option
                      value="youtube"
                      className="bg-admin-deep text-admin-cream"
                    >
                      YouTube URL
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                    Thời lượng video
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        {...register("durationMin")}
                        className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded pl-4 pr-12 py-3 text-admin-cream font-medium text-base"
                      />
                      <span className="absolute right-4 text-xs text-admin-muted font-bold pointer-events-none">
                        phút
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        {...register("durationSec")}
                        className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded pl-4 pr-12 py-3 text-admin-cream font-medium text-base"
                      />
                      <span className="absolute right-4 text-xs text-admin-muted font-bold pointer-events-none">
                        giây
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedVideoType === "system" ? (
                <LessonSystemVideoField
                  value={watchVideoMediaId}
                  onChange={(val) =>
                    setValue("videoMediaId", val, { shouldValidate: true })
                  }
                  initialFileName={videoFileName}
                  error={errors.videoMediaId?.message}
                />
              ) : (
                <LessonYoutubeField register={register} errors={errors} />
              )}
            </div>
          )}

          {selectedType === "quiz" && (
            <LessonQuizField
              register={register}
              errors={errors}
              assessments={assessmentsList}
              courseId={courseId}
              lessonId={initialData?.id}
              onRefresh={() => refetchAssessments()}
            />
          )}

          <div className="flex items-center justify-between py-4 border-t border-admin-border/15">
            <div>
              <p className="text-sm font-bold text-admin-cream">
                Cho phép học thử (Preview)
              </p>
              <p className="text-xs text-admin-muted mt-0.5">
                Học sinh chưa mua khóa học vẫn có thể xem nội dung bài học này.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("allowPreview")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-admin-surface-low border border-admin-border/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-pink peer-checked:after:bg-white peer-checked:border-admin-pink"></div>
            </label>
          </div>

          <input type="hidden" {...register("videoMediaId")} />
        </form>

        <div className="px-6 py-5 border-t border-admin-border/10 bg-admin-surface-low/30 flex justify-end gap-4 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 text-xs font-bold text-admin-muted hover:text-admin-cream transition-colors cursor-pointer uppercase tracking-wider"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-admin-pink text-white font-bold text-xs rounded hover:brightness-110 shadow-lg shadow-admin-pink/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Lưu bài học
          </button>
        </div>
      </>
    ) : (
      <div className="flex-grow overflow-y-auto p-6 custom-scrollbar text-admin-cream">
        <LessonMaterialsTab lessonId={initialData.id} />
      </div>
    )}
      </div>
    </div>
  );
}
