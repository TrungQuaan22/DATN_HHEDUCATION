import { getBlogPostDetail } from '@/features/blog/api/blogs';
import { getBlogDetail } from '@/data/mock-data';
import RichContentRenderer from '@/components/editor/rich-content-renderer';
import TableOfContents from '@/features/blog/components/table-of-contents';
import Link from 'next/link';
import { Calendar, Clock, Share2, Bookmark, Send, Sparkles, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getBlogPostDetail(slug);
  } catch {
    post = getBlogDetail(slug);
  }
  if (!post) {
    return {
      title: 'Bài viết không tìm thấy | HH Education',
    };
  }

  return {
    title: `${post.title} | HH Education`,
    description: post.excerpt || 'Chi tiết bài viết tại góc chia sẻ tri thức HH Education.',
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getBlogPostDetail(slug);
  } catch {
    post = getBlogDetail(slug);
  }

  if (!post) {
    notFound();
  }

  // Extract headings from rich content for TableOfContents
  const headings = post.content.content
    .filter((node) => node.type === 'heading')
    .map((node) => {
      const text = node.content
        ? node.content.map((c) => (c.type === 'text' ? c.text : '')).join('')
        : '';
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      return { text, id, level: node.attrs?.level || 2 };
    });

  const relatedArticles = post.relatedPosts;

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // SEO BlogPosting JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'image': post.thumbnailUrl,
    'datePublished': post.publishedAt,
    'author': {
      '@type': 'Person',
      'name': post.author.fullName,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'HH Education',
      'logo': {
        '@type': 'ImageObject',
        'url': 'http://localhost:3000/favicon.ico',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen pt-20 pb-20 bg-brand-dark transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-6 pt-12">
          
          {/* Article Header */}
          <div className="mb-12 border-b border-border-dark pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-deep-black text-brand-pink border border-brand-pink/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-[32px] md:text-[48px] font-extrabold text-cream leading-tight mb-6 tracking-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-taupe text-[13px]">
              <div className="flex items-center gap-3">
                <img
                  alt={post.author.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-brand-pink bg-brand-dark"
                  src={post.author.avatarUrl || 'https://lh3.googleusercontent.com/aida/ADBb0uiIek7P62jjJQjU84PIV6GsfsuyN4KmS9fL8kB6kpryaM4TkPT2F2LhGKwuC3hvfNQf_zY87X2K48fs4HvQljJNxRMwZ0xpYwr6hQldNlJiBXSZp2yCTCYv_id9QoLVARzshzEmPSCMWPAx8CKPpdvEPKzvbSJ8ma_FqeGFH5P-fWBGMyad5cxcucjCmlBAFqfbFcgGPrdQvqFI1VOucL5mtyjpHhjgUZVyiTybciyZyXUfQcNa1aVypgY'}
                />
                <div>
                  <p className="text-cream font-bold">{post.author.fullName}</p>
                  <p className="text-[11px] text-muted-taupe">Giảng viên sư phạm</p>
                </div>
              </div>
              
              <div className="w-px h-6 bg-border-dark hidden sm:block"></div>
              
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>{post.readingMinutes} phút đọc</span>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column - Article Body */}
            <article className="w-full lg:col-span-8">
              <RichContentRenderer content={post.content} />
              
              {/* Extra Interactive Formulas Block (Bento-like Formula Box from S English style mockup) */}
              <div className="bg-deep-black p-8 rounded-2xl shadow-lg border border-border-dark my-10 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <span className="text-[11px] font-bold text-muted-taupe uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={14} className="text-brand-pink" /> Công thức điểm 10
                  </span>
                  <div className="text-[20px] md:text-[24px] font-extrabold text-cream leading-normal">
                    <span className="text-brand-pink">Mở bài ấn tượng</span> +{' '}
                    <span className="text-sky-blue">Thân bài mạch lạc</span> +{' '}
                    <span className="text-brand-pink">Kết luận cô đọng</span>
                    <br />
                    <span className="text-cream font-bold text-[28px] mt-2 block">
                      = 100% Chinh phục đề thi
                    </span>
                  </div>
                </div>
              </div>

              {/* Shared Footer (Share / Bookmark / Time updated) */}
              <div className="mt-12 pt-8 border-t border-border-dark flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2">
                  <button className="p-2.5 bg-deep-black rounded-full border border-border-dark hover:text-brand-pink hover:border-brand-pink text-cream transition-all active:scale-90 cursor-pointer">
                    <Share2 size={16} />
                  </button>
                  <button className="p-2.5 bg-deep-black rounded-full border border-border-dark hover:text-brand-pink hover:border-brand-pink text-cream transition-all active:scale-90 cursor-pointer">
                    <Bookmark size={16} />
                  </button>
                </div>
                <div className="text-muted-taupe text-[12px] italic">
                  Cập nhật lần cuối: {formatDate(post.publishedAt)}
                </div>
              </div>
            </article>

            {/* Right Column - Sidebar */}
            <aside className="w-full lg:col-span-4 space-y-8">
              
              {/* Sticky TOC Wrapper */}
              <div className="lg:sticky lg:top-24 space-y-8">
                <TableOfContents headings={headings} />
                
                {/* Related Articles Widget */}
                {relatedArticles.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-[12px] font-bold text-muted-taupe uppercase tracking-widest">
                      Bài viết liên quan
                    </h3>
                    <div className="space-y-4">
                      {relatedArticles.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/blog/${rel.slug}`}
                          className="flex gap-4 items-center p-3 rounded-lg hover:bg-deep-black border border-transparent hover:border-border-dark transition-all group"
                        >
                          <div className="w-20 h-15 rounded-lg overflow-hidden flex-shrink-0 bg-brand-dark/50">
                            <img
                              alt={rel.title}
                              className="w-full h-full object-cover transition-all duration-300"
                              src={rel.thumbnailUrl || ''}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[13px] font-bold text-cream line-clamp-2 leading-snug group-hover:text-brand-pink transition-colors">
                              {rel.title}
                            </h4>
                            <p className="text-muted-taupe text-[11px] mt-1">
                              {formatDate(rel.publishedAt)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter Box */}
                <div className="bg-brand-pink/5 border border-brand-pink/20 p-6 rounded-xl space-y-4 transition-colors duration-200">
                  <p className="text-[14px] font-bold text-brand-pink flex items-center gap-1.5">
                    <BookOpen size={16} /> Nhận bí quyết ôn thi
                  </p>
                  <p className="text-[13px] text-muted-taupe leading-relaxed">
                    Gửi email của bạn để nhận sơ đồ tư duy văn học và tài liệu toán học miễn phí hàng tuần.
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      className="bg-deep-black border border-border-dark rounded-lg text-[13px] focus:ring-1 focus:ring-brand-pink text-cream px-3 py-2.5 outline-none transition-all"
                      placeholder="Email của bạn..."
                      type="email"
                    />
                    <button className="bg-brand-pink text-white py-2.5 rounded-lg font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      Đăng ký ngay <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
            </aside>
            
          </div>
        </div>
      </main>
    </>
  );
}
