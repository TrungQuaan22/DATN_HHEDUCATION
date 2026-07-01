"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Send, Trash2, Undo2 } from "lucide-react";
import { deleteBlogPost, listAdminBlogPosts, publishBlogPost, unpublishBlogPost } from "@/features/blog/admin-api";
import { toast } from "@/stores/toast-store";

export default function AdminBlogPostsPage() {
  const queryClient = useQueryClient();
  const postsQuery = useQuery({ queryKey: ["admin-blog-posts"], queryFn: () => listAdminBlogPosts({ page: 1, limit: 50 }) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  const statusMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => publish ? publishBlogPost(id) : unpublishBlogPost(id),
    onSuccess: refresh,
    onError: () => toast.error("Không thể thay đổi trạng thái bài viết."),
  });
  const deleteMutation = useMutation({ mutationFn: deleteBlogPost, onSuccess: refresh, onError: () => toast.error("Không thể xóa bài viết.") });

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><h1 className="text-2xl font-bold text-admin-cream">Quản lý bài viết</h1><p className="mt-1 text-sm text-admin-muted">Soạn thảo, phân loại và phát hành nội dung Blog.</p></div>
      <Link href="/admin/blog-posts/new" className="inline-flex items-center justify-center gap-2 rounded bg-admin-pink px-5 py-3 font-bold text-white"><Plus size={17} />Tạo bài viết</Link>
    </div>
    <div className="overflow-x-auto rounded border border-admin-border/30 bg-admin-deep"><table className="w-full min-w-[760px] text-left text-sm">
      <thead className="border-b border-admin-border/30 text-xs uppercase tracking-wide text-admin-muted"><tr><th className="p-4">Bài viết</th><th className="p-4">Category</th><th className="p-4">Trạng thái</th><th className="p-4">Cập nhật</th><th className="p-4 text-right">Thao tác</th></tr></thead>
      <tbody>
        {postsQuery.isLoading && <tr><td colSpan={5} className="p-10 text-center text-admin-muted">Đang tải bài viết...</td></tr>}
        {postsQuery.data?.items.map((post) => <tr key={post.id} className="border-b border-admin-border/20 last:border-0">
          <td className="p-4"><p className="max-w-md font-semibold text-admin-cream">{post.title}</p><p className="mt-1 text-xs text-admin-muted">/{post.slug}</p></td>
          <td className="p-4 text-admin-muted">{post.category?.name ?? "Chưa phân loại"}</td>
          <td className="p-4"><span className={post.status === "published" ? "text-emerald-400" : "text-amber-300"}>{post.status === "published" ? "Đã đăng" : "Bản nháp"}</span></td>
          <td className="p-4 text-admin-muted">{new Date(post.updatedAt).toLocaleDateString("vi-VN")}</td>
          <td className="p-4"><div className="flex justify-end gap-2">
            <Link href={`/admin/blog-posts/${post.id}/edit`} className="rounded p-2 text-admin-muted hover:bg-white/5" aria-label="Chỉnh sửa"><Edit3 size={17} /></Link>
            <button type="button" className="rounded p-2 text-admin-muted hover:bg-white/5" onClick={() => statusMutation.mutate({ id: post.id, publish: post.status !== "published" })}>{post.status === "published" ? <Undo2 size={17} /> : <Send size={17} />}</button>
            <button type="button" className="rounded p-2 text-red-400 hover:bg-red-500/10" onClick={() => { if (window.confirm("Xóa bài viết này?")) deleteMutation.mutate(post.id); }}><Trash2 size={17} /></button>
          </div></td>
        </tr>)}
        {!postsQuery.isLoading && postsQuery.data?.items.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-admin-muted">Chưa có bài viết nào.</td></tr>}
      </tbody>
    </table></div>
  </div>;
}
