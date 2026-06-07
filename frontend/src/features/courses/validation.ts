import * as z from "zod";
import { UI_MESSAGES } from "@/lib/constants/messages";

export const lessonSchema = z
  .object({
    title: z.string().trim().min(1, UI_MESSAGES.lessons.titleRequired),
    type: z.enum(["video", "quiz", "document"]),
    description: z.string().trim().optional().nullable(),
    allowPreview: z.boolean().default(false),
    videoType: z.enum(["system", "youtube"]).optional().nullable(),
    youtubeUrl: z.string().trim().optional().nullable(),
    durationMin: z.coerce.number().min(0).default(10),
    durationSec: z.coerce.number().min(0).max(59).default(0),
    videoMediaId: z.string().optional().nullable(),
    assessmentId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "document" &&
      (!data.description || !data.description.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: UI_MESSAGES.lessons.documentContentRequired,
        path: ["description"],
      });
    }
    if (data.type === "quiz" && !data.assessmentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: UI_MESSAGES.lessons.assessmentRequired,
        path: ["assessmentId"],
      });
    }
    if (data.type === "video") {
      if (
        data.videoType === "youtube" &&
        (!data.youtubeUrl || !data.youtubeUrl.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: UI_MESSAGES.lessons.youtubeUrlRequired,
          path: ["youtubeUrl"],
        });
      }
      if (data.videoType === "system" && !data.videoMediaId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: UI_MESSAGES.lessons.videoFileRequired,
          path: ["videoMediaId"],
        });
      }
    }
  });

export const courseCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, UI_MESSAGES.courses.validation.titleRequired),
    subject: z.string().min(1, UI_MESSAGES.courses.validation.subjectRequired),
    grade: z.coerce
      .number()
      .min(1, UI_MESSAGES.courses.validation.gradeInvalid)
      .max(12, UI_MESSAGES.courses.validation.gradeInvalid),
    teacherId: z
      .string()
      .min(1, UI_MESSAGES.courses.validation.teacherRequired),
    price: z.coerce
      .number()
      .min(0, UI_MESSAGES.courses.validation.priceInvalid),
    salePrice: z.coerce.number().nullable().optional(),
    description: z.string().trim().optional(),
    isFeatured: z.boolean().default(false),
    thumbnailMediaId: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.price === 0) {
        return data.salePrice === null || data.salePrice === undefined || data.salePrice === 0;
      }
      if (
        data.salePrice !== null &&
        data.salePrice !== undefined &&
        data.salePrice >= data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: UI_MESSAGES.courses.validation.salePriceInvalid,
      path: ["salePrice"],
    },
  );

export type LessonFormValues = z.input<typeof lessonSchema>;
export type LessonFormInput = z.output<typeof lessonSchema>;

export type CourseCreateFormInput = z.input<typeof courseCreateSchema>;
export type CourseCreateInput = z.output<typeof courseCreateSchema>;
