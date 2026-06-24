import BlogPostForm from "@/features/blog/components/blog-post-form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogPostForm postId={id} />;
}
