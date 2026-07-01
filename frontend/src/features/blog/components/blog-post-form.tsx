"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Save, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import ImageUploadField from "@/components/media/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/stores/toast-store";
import type { RichContent } from "@/types/common";
import {
  createBlogCategory,
  createBlogPost,
  getAdminBlogPost,
  listAdminBlogCategories,
  publishBlogPost,
  updateBlogPost,
} from "../admin-api";
import BlogEditor from "./blog-editor";

const EMPTY_CONTENT: RichContent = { type: "doc", content: [{ type: "paragraph" }] };

const draftSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề bài viết là bắt buộc")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  excerpt: z.string().max(500, "Mô tả ngắn tối đa 500 ký tự").optional().default(""),
  categoryId: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  isFeatured: z.boolean().default(false),
  content: z.any().default(EMPTY_CONTENT),
  thumbnailMediaId: z.string().nullable().optional().default(null),
});

const publishSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề bài viết là bắt buộc khi xuất bản")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  excerpt: z
    .string()
    .min(1, "Mô tả ngắn/tóm tắt bài viết là bắt buộc khi xuất bản")
    .max(500, "Mô tả ngắn tối đa 500 ký tự"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục cho bài viết khi xuất bản"),
  tags: z
    .string()
    .refine((val) => val.split(",").map((t) => t.trim()).filter(Boolean).length > 0, {
      message: "Vui lòng nhập ít nhất một thẻ tag khi xuất bản",
    }),
  isFeatured: z.boolean(),
  content: z.any().refine((val) => JSON.stringify(val).includes('"text"'), {
    message: "Nội dung bài viết không được để trống khi xuất bản",
  }),
  thumbnailMediaId: z
    .string()
    .nullable()
    .refine((val) => val !== null && val !== "", {
      message: "Vui lòng tải lên ảnh bìa cho bài viết khi xuất bản",
    }),
});

type BlogPostFormValues = z.infer<typeof draftSchema>;

export default function BlogPostForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [hydratedPostId, setHydratedPostId] = useState<string | null>(null);
  const [submitType, setSubmitType] = useState<"draft" | "publish">("draft");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      categoryId: "",
      tags: "",
      isFeatured: false,
      content: EMPTY_CONTENT,
      thumbnailMediaId: null,
    },
  });

  const formValues = watch();

  const postQuery = useQuery({
    queryKey: ["admin-blog-post", postId],
    queryFn: () => getAdminBlogPost(postId as string),
    enabled: Boolean(postId),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-blog-categories"],
    queryFn: listAdminBlogCategories,
  });

  useEffect(() => {
    const post = postQuery.data;
    if (!post) return;
    reset({
      title: post.title,
      excerpt: post.excerpt ?? "",
      categoryId: post.category?.id ?? "",
      tags: post.tags.join(", "),
      isFeatured: Boolean(post.isFeatured),
      content: post.content || EMPTY_CONTENT,
      thumbnailMediaId: post.thumbnailMediaId ?? null,
    });
    setThumbnailUrl(post.thumbnailUrl);
    setHydratedPostId(post.id);
  }, [postQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const input = {
        title: formValues.title.trim(),
        excerpt: formValues.excerpt.trim() || null,
        categoryId: formValues.categoryId || null,
        tags: formValues.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        content: formValues.content,
        thumbnailMediaId: formValues.thumbnailMediaId,
        isFeatured: formValues.isFeatured,
      };
      const saved = postId
        ? await updateBlogPost(postId, input)
        : await createBlogPost(input);
      return publish ? publishBlogPost(saved.id) : saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Đã lưu bài viết.");
      router.push("/admin/blog-posts");
    },
    onError: () => toast.error("Không thể lưu bài viết. Vui lòng kiểm tra lại dữ liệu."),
  });

  const categoryMutation = useMutation({
    mutationFn: () => createBlogCategory({ name: newCategory.trim() }),
    onSuccess: (category) => {
      setValue("categoryId", category.id);
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-categories"] });
    },
    onError: () => toast.error("Không thể tạo category."),
  });

  const onFormSubmit = async (data: BlogPostFormValues) => {
    const isPublish = submitType === "publish";

    if (isPublish) {
      // Validate published fields using publishSchema
      const result = publishSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof BlogPostFormValues;
          setError(path, { type: "manual", message: issue.message });
          toast.error(issue.message);
        });
        return;
      }
    }

    saveMutation.mutate(isPublish);
  };

  if (postId && (postQuery.isLoading || hydratedPostId !== postId)) {
    return <div className="h-96 animate-pulse rounded bg-admin-surface-low" />;
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-admin-cream">
            {postId ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
          </h1>
          <p className="mt-1 text-sm text-admin-muted">
            Tiêu đề trang là H1; trong nội dung hãy dùng H2 và H3 để tạo mục lục.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="outline"
            onClick={() => setSubmitType("draft")}
            isLoading={saveMutation.isPending && submitType === "draft"}
            disabled={uploading}
          >
            <Save size={16} className="mr-2" />
            Lưu nháp
          </Button>
          <Button
            type="submit"
            onClick={() => setSubmitType("publish")}
            isLoading={saveMutation.isPending && submitType === "publish"}
            disabled={uploading}
          >
            <Send size={16} className="mr-2" />
            Lưu và đăng
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-admin-cream">Tiêu đề</span>
            <Input {...register("title")} maxLength={255} />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-admin-cream">Tóm tắt</span>
            <Textarea {...register("excerpt")} maxLength={500} rows={3} />
            {errors.excerpt && (
              <p className="text-red-400 text-xs mt-1">{errors.excerpt.message}</p>
            )}
          </label>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-admin-cream">Nội dung</span>
            <BlogEditor
              value={formValues.content}
              onChange={(val) => setValue("content", val)}
              onUploadingChange={setUploading}
            />
            {errors.content && (
              <p className="text-red-400 text-xs mt-1">
                {errors.content.message as string}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded border border-admin-border/30 bg-admin-deep p-4">
            <label className="mb-2 block text-sm font-semibold text-admin-cream">Category</label>
            <select
              {...register("categoryId")}
              className="w-full rounded border border-admin-border/40 bg-off-black px-3 py-3 text-admin-cream"
            >
              <option value="">Không có category</option>
              {categoriesQuery.data?.items.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>
            )}
            <div className="mt-3 flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category mới"
              />
              <button
                type="button"
                className="rounded bg-admin-pink px-3 text-white disabled:opacity-50"
                disabled={!newCategory.trim() || categoryMutation.isPending}
                onClick={() => categoryMutation.mutate()}
                aria-label="Tạo category"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-admin-cream">Tags</span>
            <Input {...register("tags")} placeholder="toán học, kinh nghiệm, ôn thi" />
            <span className="block text-xs text-admin-muted">
              Phân tách bằng dấu phẩy. Bài liên quan được chọn theo tags trùng nhau.
            </span>
            {errors.tags && (
              <p className="text-red-400 text-xs mt-1">{errors.tags.message}</p>
            )}
          </label>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-admin-cream">Ảnh bìa</span>
            <ImageUploadField
              value={formValues.thumbnailMediaId}
              onChange={(val) => setValue("thumbnailMediaId", val)}
              initialUrl={thumbnailUrl}
            />
            {errors.thumbnailMediaId && (
              <p className="text-red-400 text-xs mt-1">
                {errors.thumbnailMediaId.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-3 rounded border border-admin-border/30 bg-admin-deep p-4 text-sm text-admin-cream">
            <input type="checkbox" {...register("isFeatured")} />
            Bài viết nổi bật
          </label>
        </aside>
      </div>
    </form>
  );
}
