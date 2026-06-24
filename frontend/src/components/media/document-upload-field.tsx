"use client";

import React, { useState, useEffect } from "react";
import { CloudUpload, X, AlertCircle, Loader2, FileText } from "lucide-react";
import {
  createPresignedUpload,
  uploadFileDirectly,
  completeUpload,
} from "@/features/media/api";
import { toast } from "@/stores/toast-store";

interface DocumentUploadFieldProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  initialFileName?: string | null;
  error?: string;
}

export default function DocumentUploadField({
  value,
  onChange,
  initialFileName,
  error,
}: DocumentUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [docFileName, setDocFileName] = useState<string | null>(
    initialFileName || null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync initial file name if value is present and file name changes
  useEffect(() => {
    if (value && initialFileName) {
      setDocFileName(initialFileName);
    }
  }, [value, initialFileName]);

  // If value is cleared from outside, reset preview
  useEffect(() => {
    if (!value) {
      setDocFileName(null);
    }
  }, [value]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt =
      fileNameLower.endsWith(".pdf") ||
      fileNameLower.endsWith(".docx") ||
      fileNameLower.endsWith(".pptx");

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedMimeTypes.includes(file.type) && !isAllowedExt) {
      setUploadError(
        "Định dạng tài liệu không hỗ trợ. Hệ thống chỉ hỗ trợ PDF, DOCX, PPTX.",
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("Dung lượng tài liệu vượt quá giới hạn 50MB.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setDocFileName(file.name);

    try {
      // Determine Content-Type based on extension if file.type is empty
      let contentType = file.type;
      if (!contentType) {
        if (fileNameLower.endsWith(".pdf")) contentType = "application/pdf";
        else if (fileNameLower.endsWith(".docx")) {
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (fileNameLower.endsWith(".pptx")) {
          contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        } else {
          contentType = "application/octet-stream";
        }
      }

      // 1. Request presigned URL
      const presignData = await createPresignedUpload({
        resourceType: "document",
        fileName: file.name,
        contentType,
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
      toast.success("Tải lên tài liệu thành công!");
    } catch (err: unknown) {
      console.error("Document upload failed:", err);
      setUploadError("Tải lên tài liệu thất bại. Vui lòng thử lại.");
      setUploadProgress(null);
      setDocFileName(null);
      onChange(null);
      toast.error("Tải lên tài liệu thất bại!");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDocFileName(null);
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

      {docFileName ? (
        <div className="flex items-center gap-4 bg-admin-surface-low border border-admin-border/20 px-5 py-4 rounded w-full">
          <div className="w-8 h-8 rounded bg-admin-pink/10 text-admin-pink flex items-center justify-center flex-shrink-0">
            {uploadProgress !== null ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-admin-cream truncate">
              {docFileName}
            </p>
            <p className="text-xs text-admin-muted">
              {uploadProgress !== null
                ? `Đang tải lên: ${uploadProgress}%`
                : "Tài liệu đã sẵn sàng"}
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
          className={`relative border border-dashed rounded p-6 flex flex-col items-center justify-center bg-admin-surface-low/30 hover:bg-admin-surface-low/50 transition-all cursor-pointer group ${
            error
              ? "border-red-500/50 hover:border-red-500/50"
              : "border-admin-border/30 hover:border-admin-pink/50"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleDocumentUpload}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={uploadProgress !== null}
          />
          <CloudUpload
            size={24}
            className="text-admin-muted group-hover:text-admin-pink transition-colors mb-2"
          />
          <p className="text-xs font-bold text-admin-cream text-center">
            Kéo thả tài liệu vào đây hoặc{" "}
            <span className="text-admin-pink">chọn từ máy tính</span>
          </p>
          <p className="text-xs text-admin-muted mt-1 text-center">
            Hỗ trợ định dạng PDF, DOCX, PPTX (Tối đa 50MB)
          </p>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
