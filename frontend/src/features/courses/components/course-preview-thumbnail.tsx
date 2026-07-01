"use client";

type CoursePreviewThumbnailProps = {
  thumbnailUrl: string | null;
  title: string;
  previewVideoUrl: string | null;
  previewLessonTitle: string | null;
};

export default function CoursePreviewThumbnail({
  thumbnailUrl,
  title,
  previewVideoUrl,
  previewLessonTitle,
}: CoursePreviewThumbnailProps) {
  const getYoutubeId = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(previewVideoUrl);
  const hasPreview = !!videoId;

  if (hasPreview) {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <iframe
          className="w-full h-full border-0"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
          title={previewLessonTitle || title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden">
      <img
        alt={title}
        className="w-full h-full object-cover"
        src={
          thumbnailUrl ||
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%231D0C14"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23AF9DA6" font-family="sans-serif">Preview Image</text></svg>'
        }
      />
    </div>
  );
}
