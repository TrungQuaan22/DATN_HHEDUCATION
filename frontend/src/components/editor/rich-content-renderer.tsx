'use client';

import { RichContent, RichNode } from '@/types/common';

type RichContentRendererProps = {
  content: RichContent;
};

export default function RichContentRenderer({ content }: RichContentRendererProps) {
  if (!content || !content.content) return null;

  return (
    <div className="prose prose-invert max-w-none text-muted-taupe leading-relaxed space-y-6">
      {content.content.map((node, idx) => renderNode(node, idx))}
    </div>
  );
}

function renderNode(node: RichNode, index: number): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-[15px] md:text-[16px] text-cream/90 leading-relaxed">
          {node.content ? node.content.map((child, cIdx) => renderNode(child, cIdx)) : null}
        </p>
      );

    case 'heading': {
      const level = node.attrs?.level || 2;
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const text = node.content ? node.content.map(c => (c.type === 'text' ? c.text : '')).join('') : '';
      const id = text.toLowerCase()
        .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const sizeClasses = {
        1: 'text-[28px] md:text-[36px] font-extrabold text-cream mb-4 mt-8',
        2: 'text-[22px] md:text-[28px] font-bold text-brand-pink mb-4 mt-8',
        3: 'text-[18px] md:text-[22px] font-bold text-cream mb-2 mt-6',
      };

      const classes = sizeClasses[level as 1 | 2 | 3] || sizeClasses[2];

      return (
        <HeadingTag key={index} id={id} className={classes}>
          {node.content ? node.content.map((child, cIdx) => renderNode(child, cIdx)) : null}
        </HeadingTag>
      );
    }

    case 'text': {
      let element: React.ReactNode = <span key={index}>{node.text}</span>;
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type === 'bold') {
            element = <strong key={index} className="font-bold text-cream">{element}</strong>;
          }
          if (mark.type === 'italic') {
            element = <em key={index} className="italic">{element}</em>;
          }
          if (mark.type === 'underline') {
            element = <u key={index} className="underline">{element}</u>;
          }
          if (mark.type === 'code') {
            element = <code key={index} className="bg-deep-black text-brand-pink px-1.5 py-0.5 rounded font-mono text-[13px]">{element}</code>;
          }
        });
      }
      return element;
    }

    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-brand-pink bg-deep-black px-6 py-4 my-8 rounded-r-xl italic text-cream text-[16px] md:text-[18px] leading-relaxed">
          {node.content ? node.content.map((child, cIdx) => renderNode(child, cIdx)) : null}
        </blockquote>
      );

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside space-y-2 text-[15px] text-muted-taupe ml-4 my-4">
          {node.content ? node.content.map((child, cIdx) => renderNode(child, cIdx)) : null}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 text-[15px] text-muted-taupe ml-4 my-4">
          {node.content ? node.content.map((child, cIdx) => renderNode(child, cIdx)) : null}
        </ol>
      );

    case 'listItem':
      return (
        <li key={index} className="pl-2">
          {node.content ? node.content.map((child, cIdx) => renderNode(child, cIdx)) : null}
        </li>
      );

    case 'image':
      return (
        <div key={index} className="my-8 space-y-2">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-deep-black">
            <img
              alt={node.attrs?.alt || 'Blog Image'}
              src={node.attrs?.src || ''}
              className="w-full h-full object-cover"
            />
          </div>
          {node.attrs?.caption && (
            <p className="text-center text-[12px] text-muted-taupe italic">{node.attrs.caption}</p>
          )}
        </div>
      );

    case 'youtube':
      return (
        <div key={index} className="my-8 aspect-video rounded-xl overflow-hidden bg-deep-black">
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

    default:
      return null;
  }
}
