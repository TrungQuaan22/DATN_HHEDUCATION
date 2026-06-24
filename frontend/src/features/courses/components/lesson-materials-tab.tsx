"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  getAdminLessonMaterials,
  createAdminLessonMaterial,
  updateAdminLessonMaterial,
  deleteAdminLessonMaterial,
  ingestAdminLessonMaterial,
} from "@/features/courses/api";
import { AdminLessonMaterial, AdminLessonMaterialType } from "../types";
import DocumentUploadField from "@/components/media/document-upload-field";
import { toast } from "@/stores/toast-store";

interface LessonMaterialsTabProps {
  lessonId: string;
}

export default function LessonMaterialsTab({ lessonId }: LessonMaterialsTabProps) {
  const [materials, setMaterials] = useState<AdminLessonMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AdminLessonMaterial | null>(null);

  // Form input fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdminLessonMaterialType>("pdf");
  const [isPublic, setIsPublic] = useState(true);
  const [contentText, setContentText] = useState("");
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [mediaFileName, setMediaFileName] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal confirmation state
  const [deletingMaterial, setDeletingMaterial] = useState<AdminLessonMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminLessonMaterials(lessonId);
      setMaterials(data);
    } catch (err: unknown) {
      console.error("Failed to load materials:", err);
      toast.error("Không thể tải danh sách tài liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchMaterials();
  }, [lessonId, fetchMaterials]);

  const handleRetryIngest = async (materialId: string) => {
    try {
      await ingestAdminLessonMaterial(materialId);
      toast.success("Đã kích hoạt lại quy trình phân tích AI!");
      fetchMaterials();
    } catch (err: any) {
      console.error("Retry ingest error:", err);
      toast.error("Không thể kích hoạt lại quy trình phân tích AI.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("pdf");
    setIsPublic(true);
    setContentText("");
    setMediaId(null);
    setMediaFileName(null);
    setFormError(null);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsAdding(true);
    setEditingMaterial(null);
  };

  const handleOpenEditForm = (material: AdminLessonMaterial) => {
    setFormError(null);
    setEditingMaterial(material);
    setIsAdding(false);

    setTitle(material.title);
    setType(material.type);
    setIsPublic(material.isPublic);
    setContentText(material.contentText || "");
    setMediaId(material.mediaId);
    setMediaFileName(material.media?.originalName || null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingMaterial(null);
    resetForm();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Tiêu đề tài liệu không được để trống.");
      return;
    }

    const isFile = ["pdf", "docx", "pptx"].includes(type);
    if (isFile && !mediaId) {
      setFormError("Vui lòng tải lên tài liệu học tập.");
      return;
    }
    if (!isFile && !contentText.trim()) {
      setFormError("Nội dung tài liệu text/markdown không được để trống.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (editingMaterial) {
        // Edit mode
        const payload: Partial<any> = {
          title: title.trim(),
          isPublic,
        };

        if (isFile) {
          payload.mediaId = mediaId;
        } else {
          payload.contentText = contentText.trim();
        }

        await updateAdminLessonMaterial(editingMaterial.id, payload);
        toast.success("Cập nhật tài liệu thành công!");
      } else {
        // Add mode
        const payload: any = {
          title: title.trim(),
          type,
          isPublic,
        };

        if (isFile) {
          payload.mediaId = mediaId;
        } else {
          payload.contentText = contentText.trim();
        }

        await createAdminLessonMaterial(lessonId, payload);
        toast.success("Thêm tài liệu thành công!");
      }

      handleCancelForm();
      fetchMaterials();
    } catch (err: any) {
      console.error("Save material error:", err);
      const msg = err?.response?.data?.message || "Lưu tài liệu thất bại.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (material: AdminLessonMaterial) => {
    setDeletingMaterial(material);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMaterial) return;
    setIsDeleting(true);
    try {
      await deleteAdminLessonMaterial(deletingMaterial.id);
      toast.success("Xóa tài liệu học tập thành công!");
      setDeletingMaterial(null);
      fetchMaterials();
    } catch (err: unknown) {
      console.error("Delete material error:", err);
      toast.error("Không thể xóa tài liệu. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getFormatBadgeColor = (t: AdminLessonMaterialType) => {
    switch (t) {
      case "pdf":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "docx":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "pptx":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "processing":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse";
      case "failed":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-admin-surface-low border border-admin-border/20 text-admin-muted";
    }
  };

  const formatBytes = (bytes: number | null | undefined) => {
    if (bytes === null || bytes === undefined) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 text-admin-pink animate-spin mx-auto mb-3" />
        <p className="text-admin-muted text-sm font-semibold">
          Đang tải danh sách tài liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Materials Screen */}
      {!isAdding && !editingMaterial ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-admin-muted">
              Tài liệu của bài học ({materials.length})
            </h3>
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-admin-pink text-white font-bold text-xs rounded hover:brightness-110 shadow-lg shadow-admin-pink/20 transition-all cursor-pointer uppercase tracking-wider active:scale-95"
            >
              <Plus size={14} /> Thêm tài liệu
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="border border-admin-border/20 bg-admin-surface-low/20 rounded-lg p-10 text-center">
              <FileText className="w-10 h-10 text-admin-muted/40 mx-auto mb-3" />
              <p className="text-sm font-bold text-admin-cream">
                Chưa có tài liệu học tập
              </p>
              <p className="text-xs text-admin-muted mt-1 max-w-xs mx-auto">
                Tải lên file PDF, DOCX, PPTX hoặc viết tài liệu văn bản trực tiếp để hỗ trợ học sinh học tập tốt hơn.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-admin-surface-low/40 border border-admin-border/10 rounded-lg p-4 flex items-center justify-between hover:border-admin-pink/30 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-admin-deep border border-admin-border/20 flex items-center justify-center text-admin-pink flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-admin-cream truncate">
                          {material.title}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${getFormatBadgeColor(
                            material.type,
                          )}`}
                        >
                          {material.type}
                        </span>
                        {material.isPublic ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Eye size={10} /> Public
                          </span>
                        ) : (
                          <span className="bg-admin-surface-low border border-admin-border/20 text-admin-muted text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <EyeOff size={10} /> Internal
                          </span>
                        )}
                      </div>

                      {/* Display original filename or processing state */}
                      <p className="text-xs text-admin-muted mt-1 truncate max-w-md">
                        {["pdf", "docx", "pptx"].includes(material.type) ? (
                          <>
                            File: {material.media?.originalName || "Chưa có tệp"}
                            {material.media?.sizeBytes && (
                              <span className="ml-1 text-[11px] font-semibold text-admin-muted/60">
                                ({formatBytes(material.media.sizeBytes)})
                              </span>
                            )}
                          </>
                        ) : (
                          "Tài liệu văn bản trực tiếp"
                        )}
                      </p>

                      {/* Show processing status */}
                      {(material.processingStatus || (["pdf", "docx", "pptx"].includes(material.type) && material.media?.status)) && (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-admin-muted">
                            Xử lý AI:
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1 rounded ${getStatusBadgeColor(
                              material.processingStatus || material.media?.status || 'pending'
                            )}`}
                          >
                            {material.processingStatus || material.media?.status || 'pending'}
                          </span>
                          {material.processingStatus === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleRetryIngest(material.id)}
                              className="text-[9px] font-bold text-admin-pink hover:underline flex items-center gap-0.5 cursor-pointer ml-1.5"
                            >
                              Thử lại
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-4">
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(material)}
                      className="p-2 text-admin-muted hover:text-admin-cream rounded hover:bg-admin-surface-low transition-colors cursor-pointer"
                      title="Chỉnh sửa tài liệu"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(material)}
                      className="p-2 text-admin-muted hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Xóa tài liệu"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Add/Edit Form Screen */
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-admin-border/10">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-admin-muted">
              {editingMaterial ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-admin-muted hover:text-admin-cream transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
              Tiêu đề tài liệu <span className="text-admin-pink">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu học tập..."
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm"
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                Định dạng tài liệu
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdminLessonMaterialType)}
                className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream transition-all font-medium text-sm appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1rem",
                }}
                disabled={!!editingMaterial || isSaving} // Disable changing type on edit mode
              >
                <option value="pdf" className="bg-admin-deep text-admin-cream">PDF File (.pdf)</option>
                <option value="docx" className="bg-admin-deep text-admin-cream">Word Document (.docx)</option>
                <option value="pptx" className="bg-admin-deep text-admin-cream">PowerPoint (.pptx)</option>
                <option value="text" className="bg-admin-deep text-admin-cream">Văn bản thuần (Text)</option>
                <option value="markdown" className="bg-admin-deep text-admin-cream">Markdown (.md)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-admin-surface-low/30 border border-admin-border/20 rounded-lg">
              <div>
                <p className="text-xs font-bold text-admin-cream">Hiển thị công khai (Public)</p>
                <p className="text-[11px] text-admin-muted mt-0.5">
                  Học sinh có thể xem và tải về tài liệu này.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                  disabled={isSaving}
                />
                <div className="w-11 h-6 bg-admin-surface-low border border-admin-border/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-pink peer-checked:after:bg-white peer-checked:border-admin-pink"></div>
              </label>
            </div>
          </div>

          {/* Conditional inputs */}
          {["pdf", "docx", "pptx"].includes(type) ? (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                Tệp tài liệu đính kèm <span className="text-admin-pink">*</span>
              </label>
              <DocumentUploadField
                value={mediaId}
                onChange={setMediaId}
                initialFileName={mediaFileName}
                error={mediaId ? undefined : undefined}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
                Nội dung văn bản <span className="text-admin-pink">*</span>
              </label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={8}
                placeholder={
                  type === "markdown"
                    ? "# Tiêu đề\nNội dung viết dưới dạng cú pháp Markdown..."
                    : "Nhập nội dung văn bản thuần..."
                }
                className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm resize-none custom-scrollbar"
                disabled={isSaving}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-admin-border/10">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-5 py-2 text-xs font-bold text-admin-muted hover:text-admin-cream transition-colors uppercase tracking-wider cursor-pointer"
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-admin-pink text-white font-bold text-xs rounded hover:brightness-110 shadow-lg shadow-admin-pink/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {isSaving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Lưu tài liệu
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMaterial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-admin-deep border border-admin-border/30 w-full max-w-md rounded-lg shadow-2xl p-6 text-admin-cream animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-base text-admin-cream">
                  Xóa tài liệu học tập?
                </h4>
                <p className="text-xs text-admin-muted mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa tài liệu <span className="font-semibold text-admin-cream">&quot;{deletingMaterial.title}&quot;</span>? Hành động này sẽ gỡ tài liệu khỏi chương trình học của học sinh và không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingMaterial(null)}
                className="px-4 py-2 text-xs font-bold text-admin-muted hover:text-admin-cream transition-colors uppercase tracking-wider cursor-pointer"
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-500 text-white font-bold text-xs rounded hover:bg-red-600 transition-all flex items-center gap-1 active:scale-95 cursor-pointer uppercase tracking-wider"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                Xóa tài liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
