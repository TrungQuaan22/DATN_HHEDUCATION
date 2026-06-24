"use client";

import React, { useState, useEffect } from "react";
import { CloudUpload, X, AlertCircle, Loader2, Film } from "lucide-react";
import {
  createPresignedUpload,
  uploadFileDirectly,
  completeUpload,
} from "@/features/media/api";
import { toast } from "@/stores/toast-store";

interface VideoUploadFieldProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  initialFileName?: string | null;
  error?: string;
}

export default function VideoUploadField({
  value,
  onChange,
  initialFileName,
  error,
}: VideoUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(
    initialFileName || null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync initial file name if value is present and file name changes
  useEffect(() => {
    if (value && initialFileName) {
      setVideoFileName(initialFileName);
    }
  }, [value, initialFileName]);

  // If value is cleared from outside, reset preview
  useEffect(() => {
    if (!value) {
      setVideoFileName(null);
    }
  }, [value]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation inside React client matching backend
    const allowedVideoTypes = ["video/mp4"];
    if (!allowedVideoTypes.includes(file.type) && !file.name.endsWith(".mp4")) {
      setUploadError(
        "Định dạng video không hỗ trợ. Hệ thống chỉ hỗ trợ video MP4 (video/mp4).",
      );
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError("Dung lượng video vượt quá giới hạn 500MB.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setVideoFileName(file.name);

    try {
      // 1. Request presigned URL
      const presignData = await createPresignedUpload({
        resourceType: "video",
        fileName: file.name,
        contentType: file.type || "video/mp4",
        fileSize: file.size,
      });

      // 2. Upload file directly to S3/R2 presigned URL
      await uploadFileDirectly(presignData.uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      // 3. Complete upload registration
      await completeUpload({ mediaId: presignData.mediaId });

      // 4. Update form state
      onChange(presignData.mediaId);
      setUploadProgress(null);
      toast.success("Tải lên video thành công!");
    } catch (err: unknown) {
      console.error("Video upload failed:", err);
      setUploadError("Tải lên video thất bại. Vui lòng thử lại.");
      setUploadProgress(null);
      setVideoFileName(null);
      onChange(null);
      toast.error("Tải lên video thất bại!");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoFileName(null);
    setUploadProgress(null);
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

      {videoFileName ? (
        <div className="flex items-center gap-4 bg-admin-surface-low border border-admin-border/20 px-5 py-4 rounded w-full">
          <div className="w-8 h-8 rounded bg-admin-pink/10 text-admin-pink flex items-center justify-center flex-shrink-0">
            <Film size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-admin-cream truncate">
              {videoFileName}
            </p>
            <p className="text-xs text-admin-muted">
              {uploadProgress !== null
                ? `Đang tải lên: ${uploadProgress}%`
                : "Tệp video đã sẵn sàng"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-admin-pink text-xs font-bold hover:underline cursor-pointer disabled:opacity-50"
            disabled={uploadProgress !== null}
          >
            THAY ĐỔI
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
            accept="video/*"
            onChange={handleVideoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={uploadProgress !== null}
          />
          <CloudUpload
            size={28}
            className="text-admin-muted group-hover:text-admin-pink transition-colors mb-2"
          />
          <p className="text-xs font-bold text-admin-cream">
            Kéo thả file video vào đây hoặc{" "}
            <span className="text-admin-pink">chọn từ máy tính</span>
          </p>
          <p className="text-xs text-admin-muted mt-1">
            Hỗ trợ định dạng video MP4 (Tối đa 500MB)
          </p>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

