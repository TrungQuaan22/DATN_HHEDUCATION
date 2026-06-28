"use client";

import { FormEvent, useEffect, useState } from "react";
import { BadgeCheck, Loader2, Mail, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import ImageUploadField from "@/components/media/image-upload-field";
import { useMeQuery, useUpdateMeMutation } from "@/features/auth/hooks";

const ROLE_LABELS = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Học sinh",
};

export default function ProfileSettings() {
  const profileQuery = useMeQuery();
  const updateMutation = useUpdateMeMutation();
  const [fullName, setFullName] = useState("");
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(null);

  useEffect(() => {
    if (profileQuery.data) {
      setFullName(profileQuery.data.fullName);
      setAvatarMediaId(profileQuery.data.avatarMediaId);
    }
  }, [profileQuery.data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = fullName.trim();
    if (normalizedName.length < 2 || normalizedName.length > 100) {
      toast.error("Tên hiển thị phải có từ 2 đến 100 ký tự.");
      return;
    }
    if (!profileQuery.data) return;

    const payload: { fullName?: string; avatarMediaId?: string | null } = {};
    if (normalizedName !== profileQuery.data.fullName)
      payload.fullName = normalizedName;
    if (avatarMediaId !== profileQuery.data.avatarMediaId)
      payload.avatarMediaId = avatarMediaId;

    if (Object.keys(payload).length === 0) {
      toast.info("Thông tin cá nhân chưa có thay đổi.");
      return;
    }

    try {
      await updateMutation.mutateAsync(payload);
      toast.success("Đã cập nhật thông tin cá nhân.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.",
      );
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="h-80 animate-pulse rounded-xl bg-admin-surface-low" />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-5 text-sm text-red-200">
        Không thể tải thông tin tài khoản. Vui lòng đăng nhập lại hoặc thử lại
        sau.
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-admin-cream">
          Thông tin cá nhân
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-admin-muted">
          Cập nhật ảnh đại diện và tên hiển thị được sử dụng trong lớp học, bài
          làm và các khu vực quản lý.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low"
      >
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          <section className="border-b border-admin-border/25 bg-admin-deep/45 px-6 py-7 md:border-b-0 md:border-r">
            <h2 className="text-sm font-semibold text-admin-cream">
              Ảnh đại diện
            </h2>
            <p className="mt-1 text-xs leading-5 text-admin-muted">
              Ảnh vuông, tối đa 5 MB.
            </p>
            <div className="mt-5">
              <ImageUploadField
                value={avatarMediaId}
                initialUrl={profile.avatarUrl}
                onChange={setAvatarMediaId}
                aspectRatio="square"
              />
            </div>
          </section>

          <section className="space-y-5 px-6 py-7">
            <div>
              <label
                htmlFor="profile-full-name"
                className="flex items-center gap-2 text-sm font-semibold text-admin-cream"
              >
                <UserRound
                  size={15}
                  className="text-admin-pink"
                  aria-hidden="true"
                />{" "}
                Tên hiển thị
              </label>
              <input
                id="profile-full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                className="mt-2 w-full rounded-md border border-admin-border/40 bg-admin-deep px-3.5 py-2.5 text-sm text-admin-cream outline-none placeholder:text-admin-muted focus:border-admin-pink focus:ring-1 focus:ring-admin-pink/30"
              />
              <p className="mt-1.5 text-xs text-admin-muted">
                Đây là username hiển thị; email đăng nhập không thay đổi.
              </p>
            </div>

            <ReadOnlyField
              icon={Mail}
              label="Email đăng nhập"
              value={profile.email}
            />
            <ReadOnlyField
              icon={BadgeCheck}
              label="Vai trò"
              value={ROLE_LABELS[profile.role]}
            />
          </section>
        </div>

        <footer className="flex justify-end border-t border-admin-border/25 px-6 py-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-admin-pink px-4 py-2.5 text-sm font-bold text-admin-deep-black transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-admin-cream">
        <Icon size={15} className="text-admin-pink" aria-hidden="true" />{" "}
        {label}
      </div>
      <div className="mt-2 rounded-md border border-admin-border/25 bg-admin-deep/60 px-3.5 py-2.5 text-sm text-admin-muted">
        {value}
      </div>
    </div>
  );
}
