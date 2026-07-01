"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Mark, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  UnderlineIcon,
  Unlink,
} from "lucide-react";
import { completeUpload, createPresignedUpload, uploadFileDirectly } from "@/features/media/api";
import type { RichContent, RichNode } from "@/types/common";
import { createSlugFromText } from "@/lib/utils/slug";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

type BlogEditorProps = {
  value: RichContent;
  onChange: (value: RichContent) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

const BlogHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) => (attributes.id ? { id: attributes.id } : {}),
      },
    };
  },
}).configure({ levels: [2, 3] });

const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: { default: null },
      caption: { default: null },
    };
  },
});

const FontSize = Mark.create({
  name: "textStyle",

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          const hasFontSize = (element as HTMLElement).style.fontSize;
          return hasFontSize ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark(this.name, { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .unsetMark(this.name)
          .run();
      },
    };
  },
});

function normalizeHeadingIds(content: RichContent): RichContent {
  const usedIds = new Map<string, number>();
  const nodes = content.content.map((node): RichNode => {
    if (node.type !== "heading") return node;
    const text = node.content?.map((child) => child.type === "text" ? child.text : "").join("") ?? "";
    const baseSlug = createSlugFromText(text);
    const baseId = baseSlug === "item" ? "muc" : baseSlug;
    const count = (usedIds.get(baseId) ?? 0) + 1;
    usedIds.set(baseId, count);
    return {
      ...node,
      attrs: { ...node.attrs, id: count === 1 ? baseId : `${baseId}-${count}` },
    };
  });
  return { type: "doc", content: nodes };
}

export default function BlogEditor({ value, onChange, onUploadingChange }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false }),
      BlogHeading,
      BlogImage,
      FontSize,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[420px] px-6 py-5 text-admin-cream focus:outline-none [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-admin-pink [&_blockquote]:pl-4 [&_img]:my-5 [&_img]:max-h-[520px] [&_img]:rounded [&_img]:object-contain",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(normalizeHeadingIds(currentEditor.getJSON() as RichContent));
    },
  });

  const uploadImage = async (file: File) => {
    if (!editor) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      window.alert("Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP có dung lượng tối đa 5MB.");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const presigned = await createPresignedUpload({
        resourceType: "image",
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
      await uploadFileDirectly(presigned.uploadUrl, file, setUploadProgress);
      const completed = await completeUpload({ mediaId: presigned.mediaId });
      if (!completed.publicUrl) throw new Error("Không nhận được URL ảnh từ máy chủ");
      editor.chain().focus().insertContent({
        type: "image",
        attrs: {
          src: completed.publicUrl,
          alt: file.name,
          mediaId: completed.mediaId,
        },
      }).run();
    } finally {
      setUploading(false);
      setUploadProgress(0);
      onUploadingChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return <div className="h-[480px] animate-pulse rounded bg-admin-surface-low" />;

  const toolClass = "rounded px-3 py-2 text-admin-muted hover:bg-white/5 hover:text-admin-cream disabled:opacity-40";
  const setLink = () => {
    if (editor.state.selection.empty && !editor.isActive("link")) {
      window.alert("Hãy bôi đen đoạn chữ cần gắn liên kết trước.");
      return;
    }

    const currentHref = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Nhập URL liên kết", currentHref ?? "https://");
    if (!href) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className="relative overflow-hidden rounded border border-admin-border/40 bg-admin-deep">
      <div className="sticky top-0 z-20 flex min-h-12 flex-wrap items-center gap-1 border-b border-admin-border/30 bg-admin-surface-low px-3 py-2">
        <button type="button" className={toolClass} title="In đậm" onClick={() => editor.chain().focus().toggleBold().run()} aria-label="In đậm"><Bold size={17} /></button>
        <button type="button" className={toolClass} title="In nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="In nghiêng"><Italic size={17} /></button>
        <button type="button" className={toolClass} title="Gạch chân" onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Gạch chân"><UnderlineIcon size={17} /></button>
        <select
          onChange={(e) => {
            const size = e.target.value;
            if (size === "default") {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(`${size}px`).run();
            }
          }}
          className="bg-transparent border border-admin-border/30 text-admin-cream rounded px-1.5 py-1 text-xs outline-none cursor-pointer hover:bg-white/5"
          value={
            editor.getAttributes("textStyle").fontSize?.replace("px", "") || "default"
          }
          title="Kích thước chữ"
        >
          <option value="default" className="bg-admin-deep text-admin-cream">Size</option>
          <option value="12" className="bg-admin-deep text-admin-cream">12px</option>
          <option value="14" className="bg-admin-deep text-admin-cream">14px</option>
          <option value="16" className="bg-admin-deep text-admin-cream">16px</option>
          <option value="18" className="bg-admin-deep text-admin-cream">18px</option>
          <option value="20" className="bg-admin-deep text-admin-cream">20px</option>
          <option value="24" className="bg-admin-deep text-admin-cream">24px</option>
          <option value="28" className="bg-admin-deep text-admin-cream">28px</option>
          <option value="32" className="bg-admin-deep text-admin-cream">32px</option>
          <option value="36" className="bg-admin-deep text-admin-cream">36px</option>
        </select>
        <span className="mx-1 h-6 w-px bg-admin-border/40" aria-hidden="true" />
        <button type="button" className={toolClass} title="Tiêu đề cấp 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Tiêu đề cấp 2"><Heading2 size={17} /></button>
        <button type="button" className={toolClass} title="Tiêu đề cấp 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Tiêu đề cấp 3"><Heading3 size={17} /></button>
        <span className="mx-1 h-6 w-px bg-admin-border/40" aria-hidden="true" />
        <button type="button" className={toolClass} title="Căn trái" onClick={() => editor.chain().focus().setTextAlign("left").run()} aria-label="Căn trái"><AlignLeft size={17} /></button>
        <button type="button" className={toolClass} title="Căn giữa" onClick={() => editor.chain().focus().setTextAlign("center").run()} aria-label="Căn giữa"><AlignCenter size={17} /></button>
        <button type="button" className={toolClass} title="Căn phải" onClick={() => editor.chain().focus().setTextAlign("right").run()} aria-label="Căn phải"><AlignRight size={17} /></button>
        <button type="button" className={toolClass} title="Căn đều hai bên" onClick={() => editor.chain().focus().setTextAlign("justify").run()} aria-label="Căn đều hai bên"><AlignJustify size={17} /></button>
        <span className="mx-1 h-6 w-px bg-admin-border/40" aria-hidden="true" />
        <button type="button" className={toolClass} title="Danh sách dấu đầu dòng" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Danh sách dấu đầu dòng"><List size={17} /></button>
        <button type="button" className={toolClass} title="Danh sách đánh số" onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Danh sách đánh số"><ListOrdered size={17} /></button>
        <button type="button" className={toolClass} title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Trích dẫn"><Quote size={17} /></button>
        <span className="mx-1 h-6 w-px bg-admin-border/40" aria-hidden="true" />
        <button type="button" className={toolClass} title="Gắn liên kết vào đoạn chữ đã chọn" onClick={setLink} aria-label="Thêm liên kết"><Link2 size={17} /></button>
        <button type="button" className={toolClass} title="Gỡ liên kết" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()} aria-label="Gỡ liên kết"><Unlink size={17} /></button>
        <button type="button" className={toolClass} title="Chèn ảnh" disabled={uploading} onClick={() => fileInputRef.current?.click()} aria-label="Tải ảnh"><ImagePlus size={17} /></button>
        {uploading && <span className="self-center px-2 text-xs text-admin-muted">Đang tải ảnh {uploadProgress}%</span>}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadImage(file);
        }} />
      </div>
      <EditorContent editor={editor} className="relative bg-admin-deep max-h-[500px] overflow-y-auto custom-scrollbar" />
    </div>
  );
}
