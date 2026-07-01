"use client";

import React, { useState, useEffect } from "react";
import { CloudUpload, X, AlertCircle, Loader2 } from "lucide-react";
import {
  createPresignedUpload,
  uploadFileDirectly,
  completeUpload,
} from "@/features/media/api";
import { toast } from "@/stores/toast-store";

interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  initialUrl?: string | null;
  error?: string;
  aspectRatio?: "video" | "square";
}

export default function ImageUploadField({
  value,
  onChange,
  initialUrl,
  error,
  aspectRatio = "video",
}: ImageUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    initialUrl || null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync initialUrl if it changes
  useEffect(() => {
    if (initialUrl) {
      setUploadedUrl(initialUrl);
    }
  }, [initialUrl]);

  // If value is cleared from outside, reset preview
  useEffect(() => {
    if (!value) {
      setUploadedUrl(null);
    }
  }, [value]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed content types matching backend
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPEG, PNG hoặc WEBP.",
      );
      return;
    }

    // 5MB limit matching backend
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Dung lượng ảnh vượt quá giới hạn 5MB.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);

    try {
      // 1. Request presigned URL
      const presignData = await createPresignedUpload({
        resourceType: "image",
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      // 2. Upload file directly
      await uploadFileDirectly(presignData.uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      // 3. Complete upload registration
      const completeData = await completeUpload({
        mediaId: presignData.mediaId,
      });

      // 4. Update states
      setUploadedUrl(completeData.publicUrl);
      onChange(presignData.mediaId);
      setUploadProgress(null);
      toast.success("Tải lên hình ảnh thành công!");
    } catch (err: unknown) {
      console.error("Image upload failed:", err);
      setUploadError("Tải lên hình ảnh thất bại. Vui lòng thử lại.");
      setUploadProgress(null);
      setUploadedUrl(null);
      onChange(null);
      toast.error("Tải lên hình ảnh thất bại!");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedUrl(null);
    setUploadError(null);
    onChange(null);
  };

  const isSquare = aspectRatio === "square";

  return (
    <div className="space-y-2">
      {uploadError && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle size={12} /> {uploadError}
        </p>
      )}

      {uploadedUrl ? (
        <div
          className={`relative border border-admin-border/30 overflow-hidden bg-admin-surface-low flex items-center justify-center group ${
            isSquare ? "w-28 h-28 rounded-full mx-auto" : "rounded aspect-video"
          }`}
        >
          <img
            src={uploadedUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className={`absolute bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors cursor-pointer z-10 ${
              isSquare ? "top-1 right-1" : "top-3 right-3"
            }`}
            title="Xóa ảnh"
          >
            <X size={isSquare ? 12 : 14} />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed flex flex-col items-center justify-center bg-admin-surface-low/30 hover:bg-admin-surface-low/50 transition-all cursor-pointer group ${
            isSquare ? "w-28 h-28 rounded-full mx-auto p-2" : "rounded p-8"
          } ${
            error
              ? "border-red-500/50 hover:border-red-500/50"
              : "border-admin-border/30 hover:border-admin-pink/50"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={uploadProgress !== null}
          />

          {uploadProgress !== null ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2
                size={isSquare ? 18 : 24}
                className="animate-spin text-admin-pink mb-1"
              />
              <p className={`font-semibold text-admin-cream ${isSquare ? "text-xs" : "text-sm mt-2"}`}>
                {isSquare ? `${uploadProgress}%` : `Đang tải lên... ${uploadProgress}%`}
              </p>
            </div>
          ) : isSquare ? (
            <div className="flex flex-col items-center justify-center text-center">
              <CloudUpload size={18} className="text-admin-muted group-hover:text-admin-pink mb-1 transition-colors" />
              <span className="text-xs font-bold text-admin-muted group-hover:text-admin-cream transition-colors leading-none">
                Tải ảnh
              </span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded bg-admin-pink/10 flex items-center justify-center text-admin-pink mb-3 group-hover:scale-110 transition-transform">
                <CloudUpload size={24} />
              </div>
              <p className="text-sm font-semibold text-admin-cream">
                Tải lên hoặc kéo thả ảnh tại đây
              </p>
              <p className="text-xs text-admin-muted mt-1">
                Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB, Tỷ lệ 16:9)
              </p>
            </>
          )}
        </div>
      )}

      {isSquare && !uploadedUrl && uploadProgress === null && (
        <p className="text-center text-xs text-admin-muted mt-1">
          Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB, Tỷ lệ 1:1)
        </p>
      )}

      {error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
