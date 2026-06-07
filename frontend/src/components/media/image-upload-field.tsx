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
}

export default function ImageUploadField({
  value,
  onChange,
  initialUrl,
  error,
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
      toast.success("Tải lên ảnh bìa thành công!");
    } catch (err: unknown) {
      console.error("Image upload failed:", err);
      setUploadError("Tải lên ảnh bìa thất bại. Vui lòng thử lại.");
      setUploadProgress(null);
      setUploadedUrl(null);
      onChange(null);
      toast.error("Tải lên ảnh bìa thất bại!");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedUrl(null);
    setUploadError(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {uploadError && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle size={12} /> {uploadError}
        </p>
      )}

      {uploadedUrl ? (
        <div className="relative border border-admin-border/30 rounded overflow-hidden aspect-video bg-admin-surface-low flex items-center justify-center group">
          <img
            src={uploadedUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors cursor-pointer z-10"
            title="Xóa ảnh"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded p-8 flex flex-col items-center justify-center bg-admin-surface-low/30 hover:bg-admin-surface-low/50 transition-all cursor-pointer group ${
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
            <div className="flex flex-col items-center">
              <Loader2
                size={24}
                className="animate-spin text-admin-pink mb-3"
              />
              <p className="text-sm font-semibold text-admin-cream">
                Đang tải lên... {uploadProgress}%
              </p>
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
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

