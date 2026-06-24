"use client";

import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { RichContent, RichNode } from "@/types/common";

type RichContentRendererProps = {
  content: RichContent;
};

export default function RichContentRenderer({
  content,
}: RichContentRendererProps) {
  if (!content || !content.content) return null;

  return (
    <div className="prose prose-invert max-w-none text-muted-taupe leading-relaxed space-y-6">
      {content.content.map((node, idx) => renderNode(node, idx))}
    </div>
  );
}

function renderNode(node: RichNode, index: number): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p
          key={index}
          className="text-base md:text-base text-cream/90 leading-relaxed"
          style={{ textAlign: node.attrs?.textAlign }}
        >
          {node.content
            ? node.content.map((child, cIdx) => renderNode(child, cIdx))
            : null}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 2;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const text = node.content
        ? node.content.map((c) => (c.type === "text" ? c.text : "")).join("")
        : "";
      const fallbackId = text
        .toLowerCase()
        .replace(
          /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g,
          "",
        )
        .trim()
        .replace(/\s+/g, "-");

      const sizeClasses = {
        1: "text-3xl md:text-4xl font-extrabold text-cream mb-4 mt-8",
        2: "text-2xl md:text-3xl font-bold text-brand-pink mb-4 mt-8",
        3: "text-lg md:text-2xl font-bold text-cream mb-2 mt-6",
      };

      const classes = sizeClasses[level as 1 | 2 | 3] || sizeClasses[2];

      return (
        <HeadingTag
          key={index}
          id={node.attrs?.id || fallbackId}
          className={`${classes} scroll-mt-28`}
          style={{ textAlign: node.attrs?.textAlign }}
        >
          {node.content
            ? node.content.map((child, cIdx) => renderNode(child, cIdx))
            : null}
        </HeadingTag>
      );
    }

    case "text": {
      let element: React.ReactNode = <span key={index}>{node.text}</span>;
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type === "bold") {
            element = (
              <strong key={index} className="font-bold text-cream">
                {element}
              </strong>
            );
          }
          if (mark.type === "italic") {
            element = (
              <em key={index} className="italic">
                {element}
              </em>
            );
          }
          if (mark.type === "underline") {
            element = (
              <u key={index} className="underline">
                {element}
              </u>
            );
          }
          if (mark.type === "code") {
            element = (
              <code
                key={index}
                className="bg-deep-black text-brand-pink px-1.5 py-0.5 rounded font-mono text-sm"
              >
                {element}
              </code>
            );
          }
          if (mark.type === "link" && typeof mark.attrs?.href === "string") {
            element = <a key={index} href={mark.attrs.href} className="text-brand-pink underline underline-offset-4">{element}</a>;
          }
          if (mark.type === "textStyle" && typeof mark.attrs?.fontSize === "string") {
            element = (
              <span key={index} style={{ fontSize: mark.attrs.fontSize }}>
                {element}
              </span>
            );
          }
        });
      }
      return element;
    }

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-2 border-brand-pink/50 bg-deep-black px-6 py-4 my-8 italic text-cream text-base md:text-lg leading-relaxed"
        >
          {node.content
            ? node.content.map((child, cIdx) => renderNode(child, cIdx))
            : null}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul
          key={index}
          className="list-disc list-inside space-y-2 text-base text-muted-taupe ml-4 my-4"
        >
          {node.content
            ? node.content.map((child, cIdx) => renderNode(child, cIdx))
            : null}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={index}
          className="list-decimal list-inside space-y-2 text-base text-muted-taupe ml-4 my-4"
        >
          {node.content
            ? node.content.map((child, cIdx) => renderNode(child, cIdx))
            : null}
        </ol>
      );

    case "listItem":
      return (
        <li key={index} className="pl-2">
          {node.content
            ? node.content.map((child, cIdx) => renderNode(child, cIdx))
            : null}
        </li>
      );

    case "image":
      return (
        <div key={index} className="my-8 space-y-2">
          <div className="relative aspect-video rounded overflow-hidden bg-deep-black w-full">
            <Image
              alt={node.attrs?.alt || "Blog Image"}
              src={node.attrs?.src || "https://via.placeholder.com/800x450"}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
          {node.attrs?.caption && (
            <p className="text-center text-xs text-muted-taupe italic">
              {node.attrs.caption}
            </p>
          )}
        </div>
      );

    case "hardBreak":
      return <br key={index} />;

    case "horizontalRule":
      return <hr key={index} className="my-8 border-border-dark" />;

    case "youtube":
      return (
        <div
          key={index}
          className="my-8 aspect-video rounded overflow-hidden bg-deep-black"
        >
          <iframe
            className="w-full h-full"
            src={node.attrs?.url}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );

    case "html":
      // Defensive sanitization of raw HTML nodes from AST content
      return (
        <div
          key={index}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(node.attrs?.html || ""),
          }}
        />
      );

    default:
      return null;
  }
}

