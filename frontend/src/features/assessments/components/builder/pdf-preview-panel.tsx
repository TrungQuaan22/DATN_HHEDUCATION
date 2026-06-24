"use client";

import React from "react";
import { Upload, FileText } from "lucide-react";

interface PdfPreviewPanelProps {
  mediaId: string | null;
  pdfFileName: string | null;
  pdfUrl: string | null;
  uploadProgress: number | null;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PdfPreviewPanel({
  mediaId,
  pdfFileName,
  pdfUrl,
  uploadProgress,
  onPdfUpload,
}: PdfPreviewPanelProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface-low p-4 flex flex-col h-[700px]">
      {!mediaId ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-admin-border/40 rounded-xl bg-admin-bg p-6 text-center space-y-4">
          <div className="p-3 rounded-full bg-admin-pink/10 text-admin-pink">
            <Upload size={32} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-admin-cream">Tải đề PDF lên tại đây</h4>
            <p className="text-xs text-admin-muted max-w-[200px] mx-auto leading-relaxed">
              Chọn tệp đề thi dạng PDF để học sinh vừa xem đề vừa điền đáp án trực tiếp.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-admin-pink px-4 py-1.5 text-xs font-bold text-admin-bg hover:brightness-110 transition active:scale-95">
            <Upload size={12} />
            {uploadProgress !== null ? `Đang tải: ${uploadProgress}%` : "Chọn tệp PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              disabled={uploadProgress !== null}
              onChange={onPdfUpload}
            />
          </label>
        </div>
      ) : (
        <>
          <div className="text-xs font-bold uppercase tracking-wider text-admin-pink border-b border-admin-border/60 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate max-w-[70%]">
              <FileText size={13} className="shrink-0" />
              <span className="truncate">{pdfFileName || "Tài liệu đề thi gốc"}</span>
            </span>
            <label className="text-xs font-bold text-admin-pink hover:underline cursor-pointer flex items-center gap-1 shrink-0">
              <Upload size={12} /> Thay đổi PDF
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploadProgress !== null}
                onChange={onPdfUpload}
              />
            </label>
          </div>
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#zoom=50`}
              title="Đề thi PDF"
              className="flex-1 w-full bg-black rounded-lg mt-3 border border-admin-border/50"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-admin-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-admin-pink border-t-transparent" />
              Đang tải tài liệu PDF...
            </div>
          )}
        </>
      )}
    </div>
  );
}
