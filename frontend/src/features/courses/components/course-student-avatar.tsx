import { getInitials } from "../utils/course-student-presenter";

type CourseStudentAvatarProps = {
  fullName: string;
  avatarUrl: string | null;
  size?: "sm" | "md";
};

export default function CourseStudentAvatar({
  fullName,
  avatarUrl,
  size = "sm",
}: CourseStudentAvatarProps) {
  const sizeClass = size === "md" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={`Ảnh đại diện của ${fullName}`}
        className={`${sizeClass} shrink-0 rounded-full border border-admin-border/30 object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-admin-pink/25 bg-admin-pink/10 font-bold text-admin-pink`}
    >
      {getInitials(fullName)}
    </div>
  );
}
