"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Clock,
  Save,
  Settings,
  Sparkles,
  Upload,
  Plus,
  ListChecks,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getAdminCourses, getAdminCourse } from "@/features/courses/api";
import {
  type AdminCourseSummary,
  type AdminCourseDetail,
} from "@/features/courses/types";
import {
  createPresignedUpload,
  uploadFileDirectly,
  completeUpload,
} from "@/features/media/api";
import {
  createAssessmentSection,
  createAssessmentSectionItems,
  deleteAssessmentItem,
  deleteAssessmentSection,
  updateAssessmentItem,
  updateAssessmentSection,
} from "@/features/assessments/api";
import { SUBJECT_LABELS, Subject } from "@/types/common";
import { useAuthStore } from "@/stores/auth-store";

import {
  useAdminAssessmentDetailQuery,
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useUpsertAssessmentPlacementMutation,
  useDeleteAssessmentPlacementMutation,
  useUpdateAssessmentVisibilityMutation,
} from "@/features/assessments/hooks";

import {
  PlacementType,
  AssessmentType,
  ItemType,
  Difficulty,
  BuilderItem,
  BuilderSection,
  createBuilderItem,
  defaultMaxScoreByItemType,
  itemTypeLabels,
  McqMode,
} from "@/features/assessments/components/builder/types";

import { PdfPreviewPanel } from "@/features/assessments/components/builder/pdf-preview-panel";
import { QuestionSidebar } from "@/features/assessments/components/builder/question-sidebar";
import { AiAssistant } from "@/features/assessments/components/builder/ai-assistant";
import { QuestionEditor } from "@/features/assessments/components/builder/editors";
import { AnswerKeyTable } from "@/features/assessments/components/builder/answer-key-table";

const formatToLocalDatetime = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - tzOffset);
  return localTime.toISOString().slice(0, 16);
};

const toastApiError = (err: any, defaultMsg: string = "Thao tác thất bại.") => {
  console.error("API Error details:", err);
  if (err && typeof err === "object") {
    if (Array.isArray(err.details) && err.details.length > 0) {
      const detailsText = err.details
        .map((d: any) => `${d.field ? `Trường ${d.field}: ` : ""}${d.message}`)
        .join(", ");
      toast.error(`${err.message || defaultMsg} (${detailsText})`);
      return;
    }
    const nestedError = err.response?.data?.error;
    if (nestedError) {
      if (Array.isArray(nestedError.details) && nestedError.details.length > 0) {
        const detailsText = nestedError.details
          .map((d: any) => `${d.field ? `Trường ${d.field}: ` : ""}${d.message}`)
          .join(", ");
        toast.error(`${nestedError.message || defaultMsg} (${detailsText})`);
        return;
      }
      toast.error(nestedError.message || defaultMsg);
      return;
    }
    if (err.message) {
      toast.error(err.message);
      return;
    }
  }
  toast.error(defaultMsg);
};

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role } = useAuthStore();
  const assessmentId = searchParams.get("id");
  const initPlacementType = searchParams.get(
    "placementType",
  ) as PlacementType | null;
  const initCourseId = searchParams.get("courseId");
  const initLessonId = searchParams.get("lessonId");

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  // Metadata States
  const [title, setTitle] = useState("Đề thi luyện tập mới");
  const [subject, setSubject] = useState<Subject>("math");
  const [grade, setGrade] = useState(12);
  const [timeLimit, setTimeLimit] = useState(90);
  const [visibility, setVisibility] = useState<
    "draft" | "published" | "hidden"
  >("draft");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("quiz");

  // Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsSubject, setSettingsSubject] = useState<Subject>("math");
  const [settingsGrade, setSettingsGrade] = useState(12);
  const [settingsTimeLimit, setSettingsTimeLimit] = useState(90);
  const [settingsGradingType, setSettingsGradingType] = useState<"auto" | "manual" | "mixed">("auto");
  const [settingsMediaId, setSettingsMediaId] = useState<string | null>(null);
  const [settingsPdfFileName, setSettingsPdfFileName] = useState<string | null>(null);
  const [settingsPdfUrl, setSettingsPdfUrl] = useState<string | null>(null);
  const [settingsUploadProgress, setSettingsUploadProgress] = useState<number | null>(null);

  // Redirect if assessmentId is missing
  useEffect(() => {
    if (!assessmentId) {
      toast.error("Không tìm thấy ID bài kiểm tra. Vui lòng tạo đề thi trước.");
      router.push("/admin/assessments");
    }
  }, [assessmentId, router]);

  const defaultSectionId = "section_default";
  const [sections, setSections] = useState<BuilderSection[]>([
    {
      id: defaultSectionId,
      title: "Trắc nghiệm",
      description: null,
      itemType: "mcq",
      orderIndex: 1000,
    },
  ]);
  const [selectedSectionId, setSelectedSectionId] = useState(defaultSectionId);

  // Items State
  const [items, setItems] = useState<BuilderItem[]>([
    {
      id: "1",
      sectionId: defaultSectionId,
      questionNumber: 1,
      itemType: "mcq",
      topicId: null,
      difficulty: "understanding",
      maxScore: defaultMaxScoreByItemType.mcq,
      mode: "single",
      options: [
        { content: "Đáp án A", isCorrect: true },
        { content: "Đáp án B", isCorrect: false },
        { content: "Đáp án C", isCorrect: false },
        { content: "Đáp án D", isCorrect: false },
      ],
      optionCount: 4,
      correctOptions: ["A"],
      contentLabel: "Câu hỏi trắc nghiệm số 1: nội dung đề bài là gì?",
    },
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string>("1");

  // Placement States
  const [placementType, setPlacementType] = useState<PlacementType>(
    initPlacementType || "unplaced",
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initCourseId || "",
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initLessonId || "",
  );
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [openTime, setOpenTime] = useState<string>("");
  const [closeTime, setOpenCloseTime] = useState<string>("");

  // Bulk Add States
  const [bulkItemType, setBulkItemType] = useState<ItemType>("mcq");
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [bulkMaxScore, setBulkMaxScore] = useState<number>(
    defaultMaxScoreByItemType.mcq,
  );
  const [bulkTopicName, setBulkTopicName] = useState<string>("");

  // Media PDF Upload States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // TanStack Query: Mutations
  const createAssessmentMutation = useCreateAssessmentMutation();
  const updateAssessmentMutation = useUpdateAssessmentMutation();
  const upsertPlacementMutation = useUpsertAssessmentPlacementMutation();
  const deletePlacementMutation = useDeleteAssessmentPlacementMutation();
  const updateVisibilityMutation = useUpdateAssessmentVisibilityMutation();

  // TanStack Query: Fetch courses list
  const coursesQuery = useQuery({
    queryKey: ["admin-courses-options"],
    queryFn: () => getAdminCourses({ limit: 100 }),
  });
  const courses = useMemo(
    () => coursesQuery.data?.items || [],
    [coursesQuery.data?.items],
  );

  // Auto-select first course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // TanStack Query: Fetch Course details to list Quiz lessons
  const courseDetailQuery = useQuery({
    queryKey: ["admin-course-detail", selectedCourseId],
    queryFn: () => getAdminCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  });
  const courseDetail = useMemo(
    () => courseDetailQuery.data || null,
    [courseDetailQuery.data],
  );

  // Auto select first quiz lesson if none is set
  useEffect(() => {
    if (courseDetail) {
      const quizLessons = courseDetail.chapters.flatMap((ch) =>
        ch.lessons.filter((l) => l.type === "quiz"),
      );
      if (quizLessons.length > 0 && !selectedLessonId) {
        setSelectedLessonId(quizLessons[0].id);
      }
    }
  }, [courseDetail, selectedLessonId]);

  // TanStack Query: Load Existing Assessment if in Edit Mode
  const { data: assessmentDetail, isLoading: isDetailLoading, refetch: refetchAssessmentDetail } =
    useAdminAssessmentDetailQuery(assessmentId || null);

  // Sync loaded assessment details to state
  useEffect(() => {
    if (!assessmentDetail) return;
    setIsEditMode(true);
    setTitle(assessmentDetail.title);
    setSubject(assessmentDetail.subject as Subject);
    setGrade(assessmentDetail.grade);
    setTimeLimit(assessmentDetail.timeLimitMinutes || 90);
    setVisibility(assessmentDetail.visibility as any);
    setAssessmentType(assessmentDetail.type);
    setSubmissionCount(assessmentDetail.submissionCount || 0);

    // Map Placements
    if (assessmentDetail.placements.length > 0) {
      const mainPlacement = assessmentDetail.placements[0];
      setPlacementType(mainPlacement.type);
      if (mainPlacement.courseId) setSelectedCourseId(mainPlacement.courseId);
      if (mainPlacement.lessonId) setSelectedLessonId(mainPlacement.lessonId);
      if (mainPlacement.maxAttempts) setMaxAttempts(mainPlacement.maxAttempts);
      if (mainPlacement.openTime) {
        setOpenTime(formatToLocalDatetime(mainPlacement.openTime));
      }
      if (mainPlacement.closeTime) {
        setOpenCloseTime(formatToLocalDatetime(mainPlacement.closeTime));
      }
    } else {
      setPlacementType("unplaced");
    }

    if (assessmentDetail.sourceMediaId) {
      setMediaId(assessmentDetail.sourceMediaId);
      setPdfFileName(
        assessmentDetail.sourceMedia?.originalName || "Tài liệu đính kèm",
      );
      const url =
        assessmentDetail.sourceMedia?.publicUrl ||
        (assessmentDetail.sourceMedia?.objectKey
          ? `https://pub-77edff2c782245799db963fbbfae0e94.r2.dev/${assessmentDetail.sourceMedia.objectKey}`
          : null);
      setPdfUrl(url);

      // Sync settings media state too
      setSettingsMediaId(assessmentDetail.sourceMediaId);
      setSettingsPdfFileName(assessmentDetail.sourceMedia?.originalName || "Tài liệu đính kèm");
      setSettingsPdfUrl(url);
    } else {
      setSettingsMediaId(null);
      setSettingsPdfFileName(null);
      setSettingsPdfUrl(null);
    }

    // Map items
    if (assessmentDetail.sections.length > 0) {
      setSections(
        assessmentDetail.sections.map((section) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          itemType: section.itemType,
          orderIndex: section.orderIndex,
        })),
      );
      setSelectedSectionId((currentId) => {
        const stillExists = assessmentDetail.sections.some((sec) => sec.id === currentId);
        if (currentId && stillExists) {
          return currentId;
        }
        return assessmentDetail.sections[0].id;
      });
    }

    const detailItems = assessmentDetail.sections?.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionItemType: section.itemType,
      })),
    ) || [];

    const mapped = detailItems.map((item) => {
      const itemBase: BuilderItem = {
        id: item.id,
        sectionId: item.sectionId,
        questionNumber: item.questionNumber,
        itemType: item.itemType,
        topicId: item.topicId ?? null,
        topicName: item.topicName ?? null,
        difficulty: (item.difficulty as Difficulty) || "understanding",
        maxScore: Number(item.maxScore),
        explanation:
          typeof item.explanation === "string"
            ? item.explanation
            : typeof item.question?.explanation === "string"
              ? item.question.explanation
              : null,
        contentLabel: "",
      };

      if (item.question?.content) {
        if (typeof item.question.content === "string") {
          itemBase.contentLabel = item.question.content;
        } else if (typeof item.question.content === "object" && item.question.content !== null) {
          const contentObj = item.question.content as any;
          itemBase.contentLabel = contentObj.text || contentObj.label || "";
        }
      }

      if (item.itemType === "mcq") {
        itemBase.mode = item.scoringConfig?.mode || "single";
        itemBase.optionCount = item.question?.options.length || 4;
        itemBase.options =
          item.question?.options.map((opt) => {
            let label = "";
            if (opt.content) {
              if (typeof opt.content === "string") {
                label = opt.content;
              } else if (typeof opt.content === "object" && opt.content !== null) {
                const optObj = opt.content as any;
                label = optObj.text || optObj.label || "";
              }
            }
            return {
              content: label,
              isCorrect: opt.isCorrect,
            };
          }) || [];
        itemBase.correctOptions =
          item.correctAnswer?.correctOptions ||
          item.question?.options
            .filter((opt) => opt.isCorrect)
            .map((opt) => String.fromCharCode(65 + opt.orderIndex)) || [];
      } else if (item.itemType === "true_false") {
        itemBase.statements =
          item.question?.options.map((opt) => {
            let label = "";
            if (opt.content) {
              if (typeof opt.content === "string") {
                label = opt.content;
              } else if (typeof opt.content === "object" && opt.content !== null) {
                const optObj = opt.content as any;
                label = optObj.text || optObj.label || "";
              }
            }
            return {
              label,
              correctValue: opt.isCorrect,
            };
          }) || [];
      } else if (item.itemType === "numeric") {
        itemBase.correctAnswer = item.correctAnswer?.value || 0;
      } else if (item.itemType === "essay") {
        itemBase.rubric = item.scoringConfig?.rubric || "";
      }

      return itemBase;
    });

    if (mapped.length > 0) {
      setItems(mapped);
      setSelectedItemId((currentId) => {
        const stillExists = mapped.some((item) => item.id === currentId);
        if (currentId && stillExists) {
          return currentId;
        }
        return mapped[0].id;
      });
    }
  }, [assessmentDetail]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) || items[0] || null;
  }, [items, selectedItemId]);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) || sections[0] || null,
    [sections, selectedSectionId],
  );

  const sectionItems = useMemo(
    () => items.filter((item) => item.sectionId === selectedSection?.id),
    [items, selectedSection?.id],
  );

  const stats = useMemo(() => {
    const totalScore = items.reduce((sum, item) => sum + item.maxScore, 0);
    return {
      count: items.length,
      score: totalScore.toFixed(2),
    };
  }, [items]);

  const canManageAssessmentMetadata =
    !isEditMode ||
    role === "admin" ||
    assessmentDetail?.createdById === user?.id;
  const canEditContent = submissionCount === 0 && canManageAssessmentMetadata;
  const isContentLocked = !canEditContent;

  // Handle PDF Upload
  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isContentLocked) {
      toast.error("Bài kiểm tra đã có lượt nộp. Không thể thay đổi PDF.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Vui lòng tải tệp tin dạng PDF.");
      return;
    }

    setPdfFile(file);
    setUploadProgress(0);

    try {
      const presign = await createPresignedUpload({
        resourceType: "document",
        fileName: file.name,
        contentType: file.type || "application/pdf",
        fileSize: file.size,
      });

      await uploadFileDirectly(presign.uploadUrl, file, setUploadProgress);
      const completeRes = await completeUpload({ mediaId: presign.mediaId });

      setMediaId(presign.mediaId);
      setPdfFileName(file.name);
      setPdfUrl(completeRes.publicUrl);
      toast.success("Tải tài liệu đính kèm thành công.");
    } catch (err) {
      toast.error("Không thể tải tài liệu đính kèm.");
    } finally {
      setUploadProgress(null);
    }
  };

  // Handle PDF Upload in Settings Modal
  const handleSettingsPdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Vui lòng tải tệp tin dạng PDF.");
      return;
    }

    setSettingsPdfFileName(file.name);
    setSettingsUploadProgress(0);

    try {
      const presign = await createPresignedUpload({
        resourceType: "document",
        fileName: file.name,
        contentType: file.type || "application/pdf",
        fileSize: file.size,
      });

      await uploadFileDirectly(presign.uploadUrl, file, setSettingsUploadProgress);
      const completeRes = await completeUpload({ mediaId: presign.mediaId });

      setSettingsMediaId(presign.mediaId);
      setSettingsPdfUrl(completeRes.publicUrl);
      toast.success("Tải tài liệu đính kèm thành công.");
    } catch (err) {
      toast.error("Không thể tải tài liệu đính kèm.");
      setSettingsPdfFileName(null);
    } finally {
      setSettingsUploadProgress(null);
    }
  };

  // Save Settings from Settings Modal
  const handleSaveSettings = async () => {
    if (!settingsTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài kiểm tra.");
      return;
    }

    if (assessmentType === "exam" && !settingsMediaId) {
      toast.error("Đề thi dạng Exam PDF yêu cầu phải tải lên tệp tin PDF.");
      return;
    }

    if (!assessmentId) return;

    setIsSaving(true);
    try {
      await updateAssessmentMutation.mutateAsync({
        assessmentId,
        payload: {
          title: settingsTitle.trim(),
          subject: settingsSubject,
          grade: settingsGrade,
          gradingType: settingsGradingType,
          timeLimitMinutes: settingsTimeLimit,
          sourceMediaId: assessmentType === "exam" ? settingsMediaId : null,
        },
      });

      setTitle(settingsTitle.trim());
      setSubject(settingsSubject);
      setGrade(settingsGrade);
      setTimeLimit(settingsTimeLimit);
      setMediaId(settingsMediaId);
      setPdfFileName(settingsPdfFileName);
      setPdfUrl(settingsPdfUrl);

      toast.success("Cập nhật cài đặt đề thi thành công!");
      setIsSettingsOpen(false);
      await refetchAssessmentDetail();
    } catch (err) {
      toastApiError(err, "Cập nhật cài đặt thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Import questions from Excel template
  const handleExcelImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!selectedSection) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      const parsed: BuilderItem[] = rows.map((row: any, idx: number) => {
        const itemType = String(row.itemType || "mcq").trim() as ItemType;
        if (itemType !== selectedSection.itemType) {
          throw new Error("Excel item type must match selected section type");
        }
        const base: BuilderItem = {
          id: String(Date.now() + idx),
          sectionId: selectedSection.id,
          questionNumber: sectionItems.length + idx + 1,
          itemType,
          topicId: row.topicId || null,
          difficulty: (row.difficulty || "understanding") as Difficulty,
          maxScore: Number(row.maxScore || 1),
          explanation: row.explanation ? String(row.explanation) : null,
          contentLabel:
            row.questionContent ||
            `Câu hỏi số ${sectionItems.length + idx + 1}`,
        };

        if (itemType === "mcq") {
          base.mode = (row.mode || "single") as McqMode;
          const optionValues = String(row.options || "")
            .split(/[|;]/)
            .map((o) => o.trim())
            .filter(Boolean);
          const correctValues = String(row.correctOptions || row.answer || "")
            .split(/[|;]/)
            .map((o) => o.trim())
            .filter(Boolean);
          base.optionCount = Number(
            row.optionCount || optionValues.length || 4,
          );
          base.correctOptions =
            correctValues.length > 0 ? correctValues : ["A"];
          base.options = optionValues.map((content, optionIndex) => ({
            content,
            isCorrect:
              correctValues.includes(content) ||
              correctValues.includes(String.fromCharCode(65 + optionIndex)),
          }));
        } else if (itemType === "true_false") {
          const stmLabels = String(row.statements || "").split(/[|;]/);
          const stmAns = String(row.answer || "").split(/[|;]/);
          base.statements = stmLabels.map((label, i) => ({
            label: label.trim(),
            correctValue:
              String(stmAns[i]).toLowerCase() === "true" ||
              String(stmAns[i]).toLowerCase() === "t" ||
              String(stmAns[i]) === "1",
          }));
        } else if (itemType === "numeric") {
          base.correctAnswer = Number(row.correctAnswer);
        } else if (itemType === "essay") {
          base.rubric = row.rubric || "";
        }

        return base;
      });

      if (parsed.length > 0) {
        setItems((current) => [...current, ...parsed]);
        setSelectedItemId(parsed[0].id);
        toast.success(`Đã nhập ${parsed.length} câu hỏi thành công!`);
      }
    } catch (err) {
      toast.error("Nhập Excel thất bại. Vui lòng kiểm tra lại định dạng tệp.");
    }
  };

  // Generate Questions via AI Assistant
  const handleAiGeneration = () => {
    if (!aiPrompt.trim()) {
      toast.error("Vui lòng nhập chủ đề / prompt đề thi.");
      return;
    }

    setIsGeneratingAi(true);
    toast.loading("AI đang phân tích kiến thức và sinh đề thi...");

    setTimeout(() => {
      let generatedItems: BuilderItem[] = [];
      const timestamp = Date.now();

      if (
        aiPrompt.toLowerCase().includes("toĂ¡n") ||
        aiPrompt.toLowerCase().includes("math")
      ) {
        generatedItems = [
          {
            id: `ai_${timestamp}_1`,
            sectionId: selectedSection?.id || sections[0].id,
            questionNumber: items.length + 1,
            itemType: "mcq",
            topicId: null,
            difficulty: "understanding",
            maxScore: defaultMaxScoreByItemType.mcq,
            mode: "single",
            contentLabel:
              "Tính đạo hàm của hàm số y = x^3 - 3x^2 + 2x tại x = 1.",
            options: [
              { content: "y'(1) = -1", isCorrect: true },
              { content: "y'(1) = 2", isCorrect: false },
              { content: "y'(1) = 0", isCorrect: false },
              { content: "y'(1) = -2", isCorrect: false },
            ],
            optionCount: 4,
            correctOptions: ["A"],
          },
          {
            id: `ai_${timestamp}_2`,
            sectionId: selectedSection?.id || sections[0].id,
            questionNumber: items.length + 2,
            itemType: "true_false",
            topicId: null,
            difficulty: "application",
            maxScore: defaultMaxScoreByItemType.true_false,
            contentLabel:
              "Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với mặt đáy. Các mệnh đề sau đúng hay sai?",
            statements: [
              {
                label: "BC vuông góc với mặt phẳng (SAB)",
                correctValue: true,
              },
              {
                label: "BD vuông góc với mặt phẳng (SAC)",
                correctValue: true,
              },
              {
                label: "Góc giữa SC và mặt phẳng đáy là góc SCA",
                correctValue: true,
              },
              {
                label: "Mặt phẳng (SBD) vuông góc với mặt phẳng (SAD)",
                correctValue: false,
              },
            ],
          },
          {
            id: `ai_${timestamp}_3`,
            sectionId: selectedSection?.id || sections[0].id,
            questionNumber: items.length + 3,
            itemType: "numeric",
            topicId: null,
            difficulty: "application",
            maxScore: defaultMaxScoreByItemType.numeric,
            contentLabel: "Tính giá trị cực đại của hàm số y = -x^2 + 4x + 1.",
            correctAnswer: 5,
          },
        ];
      } else {
        generatedItems = [
          {
            id: `ai_${timestamp}_1`,
            sectionId: selectedSection?.id || sections[0].id,
            questionNumber: items.length + 1,
            itemType: "mcq",
            topicId: null,
            difficulty: "recognition",
            maxScore: defaultMaxScoreByItemType.mcq,
            mode: "single",
            contentLabel:
              "Chất nào sau đây phản ứng được với axit clohiđric giải phóng khí H2?",
            options: [
              { content: "Đồng (Cu)", isCorrect: false },
              { content: "Sắt (Fe)", isCorrect: true },
              { content: "Bạc (Ag)", isCorrect: false },
              { content: "Vàng (Au)", isCorrect: false },
            ],
            optionCount: 4,
            correctOptions: ["B"],
          },
          {
            id: `ai_${timestamp}_2`,
            sectionId: selectedSection?.id || sections[0].id,
            questionNumber: items.length + 2,
            itemType: "essay",
            topicId: null,
            difficulty: "advanced",
            maxScore: 5.0,
            contentLabel:
              "Phân tích tác động của cách mạng khoa học kỹ thuật lần thứ tư (4.0) đối với thị trường lao động Việt Nam hiện nay.",
            rubric:
              "Yêu cầu: Nêu khái niệm, phân tích 3 tác động tích cực, 3 tác động tiêu cực, đưa ra giải pháp thực tế.",
          },
        ];
      }

      const sectionId = selectedSection?.id || sections[0].id;
      const matchingGeneratedItems = generatedItems.filter(
        (item) => item.itemType === (selectedSection?.itemType || item.itemType),
      );
      if (matchingGeneratedItems.length === 0) {
        setIsGeneratingAi(false);
        toast.dismiss();
        toast.error("AI chưa tạo được câu phù hợp với loại của phần đang chọn.");
        return;
      }
      const normalizedGeneratedItems = matchingGeneratedItems.map((item, index) => ({
        ...item,
        sectionId,
        questionNumber: sectionItems.length + index + 1,
      }));
      setItems((prev) => [...prev, ...normalizedGeneratedItems]);
      setSelectedItemId(normalizedGeneratedItems[0].id);
      setIsGeneratingAi(false);
      toast.dismiss();
      toast.success(
        `AI đã tạo thành công ${generatedItems.length} câu hỏi phù hợp với prompt!`,
      );
    }, 2000);
  };

  const handleAddItem = (type: ItemType) => {
    if (!selectedSection) return;
    const sectionType = selectedSection.itemType;
    const base = createBuilderItem(
      sectionType,
      sectionItems.length + 1,
      defaultMaxScoreByItemType[sectionType],
      String(Date.now()),
      assessmentType,
      selectedSection.id,
    );
    setItems((prev) => [...prev, base]);
    setSelectedItemId(base.id);
  };

  const handleBulkAddItems = () => {
    if (!selectedSection) return;
    const normalizedCount = Math.floor(Number(bulkCount));
    const normalizedScore = Number(bulkMaxScore);

    if (
      !Number.isFinite(normalizedCount) ||
      normalizedCount < 1 ||
      normalizedCount > 100
    ) {
      toast.error("Số câu cần thêm phải từ 1 đến 100.");
      return;
    }

    if (!Number.isFinite(normalizedScore) || normalizedScore <= 0) {
      toast.error("Điểm mỗi câu phải lớn hơn 0.");
      return;
    }

    const timestamp = Date.now();
    const createdItems = Array.from({ length: normalizedCount }, (_, index) =>
      createBuilderItem(
        selectedSection.itemType,
        sectionItems.length + index + 1,
        normalizedScore,
        `bulk_${timestamp}_${index}`,
        assessmentType,
        selectedSection.id,
      ),
    ).map((item) => ({
      ...item,
      topicName: bulkTopicName.trim() || null,
    }));

    setItems((prev) => [...prev, ...createdItems]);
    setSelectedItemId(createdItems[0].id);
    toast.success(
      `Đã thêm ${normalizedCount} câu ${itemTypeLabels[selectedSection.itemType].toLowerCase()}, mỗi câu ${normalizedScore} điểm.`,
    );
  };

  const handleDeleteItem = (id: string) => {
    const filtered = items.filter((item) => item.id !== id);
    const counters = new Map<string, number>();
    const renumbered = filtered.map((item) => {
      const next = (counters.get(item.sectionId) || 0) + 1;
      counters.set(item.sectionId, next);
      return { ...item, questionNumber: next };
    });
    setItems(renumbered);
    if (selectedItemId === id) {
      const nextItem = renumbered.find((item) => item.sectionId === selectedSectionId) || renumbered[0];
      setSelectedItemId(nextItem?.id || "");
    }
    toast.success("Đã xóa câu hỏi.");
  };

  const handleItemFieldChange = (id: string, updates: Partial<BuilderItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const handleAddSection = (itemType: ItemType) => {
    const id = `section_${Date.now()}`;
    const section: BuilderSection = {
      id,
      title: `Phần ${sections.length + 1}. ${itemTypeLabels[itemType]}`,
      description: null,
      itemType,
      orderIndex: (sections.at(-1)?.orderIndex || 0) + 1000,
    };
    setSections((current) => [...current, section]);
    setSelectedSectionId(id);
    setBulkItemType(itemType);
    setBulkMaxScore(defaultMaxScoreByItemType[itemType]);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<BuilderSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    if (items.some((item) => item.sectionId === sectionId)) {
      toast.error("Chỉ có thể xóa phần chưa có câu hỏi.");
      return;
    }
    if (sections.length <= 1) {
      toast.error("Đề thi phải có ít nhất một phần.");
      return;
    }
    const nextSections = sections.filter((section) => section.id !== sectionId);
    setSections(nextSections);
    setSelectedSectionId(nextSections[0].id);
  };

  useEffect(() => {
    if (!selectedSection) return;
    setSelectedItemId((currentId) => {
      const currentItem = items.find((item) => item.id === currentId);
      if (currentItem && currentItem.sectionId === selectedSection.id) {
        return currentId;
      }
      const firstItem = items.find((item) => item.sectionId === selectedSection.id);
      return firstItem ? firstItem.id : currentId;
    });
    setBulkItemType(selectedSection.itemType);
    setBulkMaxScore(defaultMaxScoreByItemType[selectedSection.itemType]);
  }, [items, selectedSection, selectedSectionId]);

  const handleAssessmentTypeChange = (nextType: AssessmentType) => {
    if (nextType === assessmentType) return;
    if (isEditMode) {
      toast.error("Loại đề không thể thay đổi sau khi assessment đã được tạo.");
      return;
    }

    const confirmChange = window.confirm(
      "Chuyển đổi loại đề thi (Quiz <-> Exam PDF) sẽ thay đổi cấu trúc câu hỏi và đáp án hiện tại. Bạn có chắc chắn muốn chuyển đổi?"
    );
    if (!confirmChange) return;

    setAssessmentType(nextType);
    setItems((prev) =>
      prev.map((item) => {
        const template = createBuilderItem(
          item.itemType,
          item.questionNumber,
          item.maxScore,
          item.id,
          nextType,
          item.sectionId,
        );

        const correctLabelsFromOptions =
          item.options
            ?.map((option, index) =>
              option.isCorrect ? String.fromCharCode(65 + index) : null,
            )
            .filter((label): label is string => Boolean(label)) ?? [];

        return {
          ...template,
          ...item,
          contentLabel:
            nextType === "quiz"
              ? item.contentLabel || template.contentLabel
              : "",
          explanation: item.explanation ?? null,
          options:
            nextType === "quiz"
              ? item.options?.length
                ? item.options
                : template.options
              : [],
          optionCount:
            nextType === "exam"
              ? item.optionCount ||
                item.options?.length ||
                template.optionCount ||
                4
              : item.options?.length || template.optionCount,
          correctOptions:
            nextType === "exam"
              ? correctLabelsFromOptions.length > 0
                ? correctLabelsFromOptions
                : item.correctOptions?.length
                  ? item.correctOptions
                  : ["A"]
              : item.correctOptions,
          statements:
            item.itemType === "true_false"
              ? item.statements?.length
                ? item.statements
                : template.statements
              : item.statements,
        };
      }),
    );
  };

  // Step 1: Save Content & Questions
  const handleSaveContent = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài kiểm tra.");
      return;
    }

    if (
      isContentLocked &&
      canManageAssessmentMetadata &&
      isEditMode &&
      assessmentId
    ) {
      setIsSaving(true);
      try {
        await updateAssessmentMutation.mutateAsync({
          assessmentId,
          payload: {
            title,
            timeLimitMinutes: timeLimit,
          },
        });
        toast.success("Đã lưu metadata bài kiểm tra.");
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Lưu metadata bài kiểm tra thất bại.";
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (isContentLocked) {
      toast.error(
        submissionCount > 0
          ? "Bài kiểm tra đã có lượt làm bài nên nội dung đã bị khóa."
          : "Bạn chỉ có thể sửa nội dung assessment do mình tạo.",
      );
      return;
    }

    if (assessmentType === "exam" && !mediaId) {
      toast.error("Đề thi dạng Exam PDF yêu cầu phải tải lên tệp tin PDF trước khi lưu.");
      return;
    }

    setIsSaving(true);
    try {
      const hasEssaySection = sections.some((section) => section.itemType === "essay");
      const hasObjectiveSection = sections.some((section) => section.itemType !== "essay");
      const inferredGrading: "auto" | "manual" | "mixed" =
        hasEssaySection && hasObjectiveSection
          ? "mixed"
          : hasEssaySection
            ? "manual"
            : "auto";
      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId,
      );
      const effectiveSubject =
        (placementType === "course" || placementType === "lesson") &&
        selectedCourse
          ? (selectedCourse.subject as Subject)
          : subject;
      const effectiveGrade =
        (placementType === "course" || placementType === "lesson") &&
        selectedCourse
          ? selectedCourse.grade
          : grade;
      const topicCourseId =
        placementType === "course" || placementType === "lesson"
          ? selectedCourseId || null
          : null;

      if (
        topicCourseId &&
        items.some((item) => !item.topicId && !item.topicName?.trim())
      ) {
        toast.error(
          "Bài kiểm tra thuộc khóa học cần gắn chuyên đề cho từng câu.",
        );
        return;
      }

      let assessmentObjId = assessmentId;

      // 1. Save metadata
      if (isEditMode && assessmentId) {
        await updateAssessmentMutation.mutateAsync({
          assessmentId,
          payload: {
            title,
            subject: effectiveSubject,
            grade: effectiveGrade,
            gradingType: inferredGrading,
            timeLimitMinutes: timeLimit,
            sourceMediaId: assessmentType === "exam" ? mediaId : null,
          },
        });
      } else {
        const created = await createAssessmentMutation.mutateAsync({
          title,
          subject: effectiveSubject,
          grade: effectiveGrade,
          type: assessmentType,
          gradingType: inferredGrading,
          timeLimitMinutes: timeLimit,
          sourceMediaId: assessmentType === "exam" ? mediaId : null,
        });
        assessmentObjId = created.id;
        setIsEditMode(true);
        router.replace(`/admin/assessments/builder?id=${created.id}`);
      }

      const buildItemPayload = (item: BuilderItem) => {
        const base: any = {
          topicId: item.topicId || null,
          topicName: item.topicName?.trim() || null,
          difficulty: item.difficulty,
          maxScore: item.maxScore,
          explanation: item.explanation?.trim() || null,
        };

        if (assessmentType === "quiz") {
          base.contentLabel = item.contentLabel;
        }

        if (item.itemType === "mcq") {
          if (assessmentType === "quiz") {
            base.mode = item.mode || "single";
            base.options = item.options || [];
          } else {
            base.optionCount = item.optionCount || 4;
            base.correctOptions = item.correctOptions || ["A"];
          }
        } else if (item.itemType === "true_false") {
          base.statements =
            assessmentType === "quiz"
              ? item.statements || []
              : (item.statements || []).map((statement) => ({
                  correctValue: statement.correctValue,
                }));
        } else if (item.itemType === "numeric") {
          base.correctAnswer = item.correctAnswer || 0;
        } else if (item.itemType === "essay") {
          base.rubric = item.rubric || "";
        }
        return base;
      };

      const persistedSectionIds = new Set(
        assessmentDetail?.sections.map((section) => section.id) || [],
      );
      const persistedItems = assessmentDetail?.sections.flatMap((section) => section.items) || [];
      const persistedItemIds = new Set(persistedItems.map((item) => item.id));
      const currentItemIds = new Set(items.map((item) => item.id));
      const sectionIdMap = new Map<string, string>();

      for (const section of sections) {
        if (persistedSectionIds.has(section.id)) {
          await updateAssessmentSection(assessmentObjId!, section.id, {
            title: section.title,
            description: section.description || null,
          });
          sectionIdMap.set(section.id, section.id);
        } else {
          const createdSection = (await createAssessmentSection(assessmentObjId!, {
            title: section.title,
            description: section.description || null,
            itemType: section.itemType,
          })) as { id: string };
          sectionIdMap.set(section.id, createdSection.id);
        }
      }

      for (const persistedItem of persistedItems) {
        if (!currentItemIds.has(persistedItem.id)) {
          await deleteAssessmentItem(assessmentObjId!, persistedItem.id);
        }
      }

      for (const section of sections) {
        const persistedSectionId = sectionIdMap.get(section.id)!;
        const itemsInSection = items.filter((item) => item.sectionId === section.id);
        const newItems: unknown[] = [];

        for (const item of itemsInSection) {
          const payload = buildItemPayload(item);
          if (persistedItemIds.has(item.id)) {
            await updateAssessmentItem(assessmentObjId!, item.id, payload);
          } else {
            newItems.push(payload);
          }
        }

        if (newItems.length > 0) {
          await createAssessmentSectionItems(assessmentObjId!, persistedSectionId, {
            courseId: topicCourseId,
            items: newItems,
          });
        }
      }

      const currentSectionIds = new Set(sections.map((section) => section.id));
      for (const persistedSectionId of persistedSectionIds) {
        if (!currentSectionIds.has(persistedSectionId)) {
          await deleteAssessmentSection(assessmentObjId!, persistedSectionId);
        }
      }

      if (assessmentId) {
        await refetchAssessmentDetail();
      }

      toast.success("Lưu nội dung bài kiểm tra thành công!");
      setStep(2); // Auto proceed to step 2
    } catch (err) {
      toastApiError(err, "Lưu bài kiểm tra thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: Save Placement Configuration
  const handleSavePlacement = async () => {
    if (!assessmentId) {
      toast.error(
        "Không tìm thấy ID bài kiểm tra. Vui lòng thiết lập nội dung ở Bước 1 trước.",
      );
      return;
    }

    if (placementType === "lesson" && !selectedLessonId) {
      toast.error("Vui lòng chọn bài học dạng Quiz để gán bài kiểm tra.");
      return;
    }

    if (placementType === "course" && !selectedCourseId) {
      toast.error("Vui lòng chọn khóa học để gán bài kiểm tra.");
      return;
    }

    setIsSaving(true);
    try {
      if (placementType === "unplaced") {
        await deletePlacementMutation.mutateAsync(assessmentId);
      } else {
        const isPublicPractice = placementType === "public_practice";
        await upsertPlacementMutation.mutateAsync({
          assessmentId,
          payload: {
            type: placementType,
            courseId:
              placementType === "course" ? selectedCourseId || null : null,
            lessonId:
              placementType === "lesson" ? selectedLessonId || null : null,
            openTime: isPublicPractice ? null : (openTime ? new Date(openTime).toISOString() : null),
            closeTime: isPublicPractice ? null : (closeTime ? new Date(closeTime).toISOString() : null),
            maxAttempts: maxAttempts,
            isFeatured: placementType === "public_practice",
          },
        });
      }
      toast.success("Đã lưu cài đặt phân phối đề thi!");
      setStep(3); // Proceed to step 3
    } catch (err) {
      toastApiError(err, "Cài đặt phân phối đề thi thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3: Publish / Hide Lifecycle Management
  const handlePublish = async (
    nextVisibility: "published" | "hidden" | "draft",
  ) => {
    if (!assessmentId) {
      toast.error("Không tìm thấy ID bài kiểm tra.");
      return;
    }

    setIsSaving(true);
    try {
      await updateVisibilityMutation.mutateAsync({
        assessmentId,
        visibility: nextVisibility,
      });

      toast.success(
        nextVisibility === "published"
          ? "Đã xuất bản đề thi thành công!"
          : nextVisibility === "hidden"
            ? "Đã ẩn đề thi thành công!"
            : "Đã đưa đề thi về trạng thái nháp!",
      );
      router.push("/admin/assessments");
    } catch (err) {
      toastApiError(err, "Cập nhật trạng thái xuất bản thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloneItem = (item: BuilderItem) => {
    if (isContentLocked) {
      toast.error("Bài kiểm tra đã có lượt nộp. Không thể nhân bản câu hỏi.");
      return;
    }

    const newId = String(Date.now());
    const itemCountInSection = items.filter((entry) => entry.sectionId === item.sectionId).length;
    const cloned: BuilderItem = {
      ...item,
      id: newId,
      questionNumber: itemCountInSection + 1,
    };
    setItems((prev) => [...prev, cloned]);
    setSelectedItemId(newId);
    toast.success("Đã nhân bản câu hỏi.");
  };

  const quizLessons = useMemo(() => {
    if (!courseDetail) return [];
    return courseDetail.chapters.flatMap((ch) =>
      ch.lessons.filter((l) => l.type === "quiz"),
    );
  }, [courseDetail]);

  const topicOptions = useMemo(
    () => courseDetail?.topics ?? [],
    [courseDetail],
  );

  // Validation Checklist for Step 3
  const isPublishReady = useMemo(() => {
    const isTitleValid = title.trim().length >= 2;
    const isItemsCountValid = items.length > 0;
    const isScoreValid = Number(stats.score) > 0;
    const isPdfValid = assessmentType === "quiz" || Boolean(mediaId);
    const isPlaced = placementType !== "unplaced";

    return (
      isTitleValid &&
      isItemsCountValid &&
      isScoreValid &&
      isPdfValid &&
      isPlaced
    );
  }, [title, items, stats.score, assessmentType, mediaId, placementType]);

  if (assessmentId && isDetailLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center text-admin-cream">
        <p className="animate-pulse">Đang tải cấu hình bài kiểm tra...</p>
      </div>
    );
  }

  const isPendingState =
    isSaving ||
    createAssessmentMutation.isPending ||
    updateAssessmentMutation.isPending ||
    upsertPlacementMutation.isPending ||
    deletePlacementMutation.isPending ||
    updateVisibilityMutation.isPending;

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-admin-border/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/assessments")}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-admin-border bg-admin-bg text-admin-cream hover:border-admin-pink/60 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-xs font-bold text-admin-pink uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={11} /> Workspace thiết kế đề thi
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-bold text-admin-cream tracking-tight max-w-md truncate">
                {title}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettingsTitle(title);
                  setSettingsSubject(subject);
                  setSettingsGrade(grade);
                  setSettingsTimeLimit(timeLimit);
                  setSettingsGradingType(settingsGradingType || "auto");
                  setSettingsMediaId(mediaId);
                  setSettingsPdfFileName(pdfFileName);
                  setSettingsPdfUrl(pdfUrl);
                  setIsSettingsOpen(true);
                }}
                className="p-1.5 rounded-lg border border-admin-border bg-admin-surface-low text-admin-cream hover:border-admin-pink/60 transition cursor-pointer flex items-center justify-center hover:text-admin-pink"
                title="Cài đặt thông tin đề thi"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Action button header dispatcher */}
        <div className="flex items-center gap-2.5">
          {step === 1 && (
            <>
              <label
                className={`inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface-low px-3.5 py-2 text-xs font-bold text-admin-cream transition ${
                  isContentLocked
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-admin-pink"
                }`}
              >
                <Upload size={13} />
                Excel
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  disabled={isContentLocked}
                  onChange={handleExcelImport}
                />
              </label>
              <button
                type="button"
                onClick={handleSaveContent}
                disabled={isPendingState}
                className="inline-flex items-center gap-2 rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg hover:brightness-110 transition active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
              >
                <Save size={13} />
                {isPendingState ? "Đang lưu..." : "Lưu & Tiếp tục"}
              </button>
            </>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleSavePlacement}
              disabled={isPendingState}
              className="inline-flex items-center gap-2 rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg hover:brightness-110 transition active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              <Save size={13} />
              {isPendingState ? "Đang lưu..." : "Lưu & Tiếp tục"}
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              disabled={!isPublishReady || isPendingState}
              onClick={() => setIsPublishConfirmOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg hover:brightness-110 transition active:scale-95 disabled:opacity-30 cursor-pointer animate-fade-in"
            >
              <Sparkles size={13} />
              {isPendingState ? "Đang xuất bản..." : "Xuất bản"}
            </button>
          )}
        </div>
      </div>

      {/* Wizard Steps Navigation Bar */}
      <div className="flex items-center justify-center border-b border-admin-border/40 pb-4 mb-4">
        <div className="flex items-center gap-8 md:gap-16 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              step === 1
                ? "border-admin-pink text-admin-pink"
                : "border-transparent text-admin-muted hover:text-admin-cream"
            }`}
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs">
              1
            </span>
            Nội dung bài thi
          </button>
          <button
            type="button"
            onClick={() => {
              if (isEditMode) setStep(2);
              else toast.error("Vui lòng lưu nội dung bài thi ở bước 1 trước.");
            }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              step === 2
                ? "border-admin-pink text-admin-pink"
                : "border-transparent text-admin-muted hover:text-admin-cream"
            }`}
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs">
              2
            </span>
            Cấu hình phân phối
          </button>
          <button
            type="button"
            onClick={() => {
              if (isEditMode) setStep(3);
              else toast.error("Vui lòng lưu nội dung bài thi ở bước 1 trước.");
            }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              step === 3
                ? "border-admin-pink text-admin-pink"
                : "border-transparent text-admin-muted hover:text-admin-cream"
            }`}
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs">
              3
            </span>
            Kiểm tra & Xuất bản
          </button>
        </div>
      </div>

      {isContentLocked && step === 1 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300">
          Bài kiểm tra đã có {submissionCount} lượt nộp. Để giữ ổn định dữ liệu
          điểm số, nội dung câu hỏi/đáp án đã được khóa; bạn vẫn có thể chỉnh
          sửa cấu hình phân phối ở Phase 2.
        </div>
      )}

      {/* STEP 1: Content Workspace */}
      {step === 1 && (
        <>
          {/* Type selection tabs */}
          <div className="flex border-b border-admin-border/60 mb-5">
            <button
              type="button"
              onClick={() => handleAssessmentTypeChange("quiz")}
              disabled={isContentLocked || isEditMode}
              className={`px-6 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                assessmentType === "quiz"
                  ? "border-admin-pink text-admin-pink bg-admin-pink/5"
                  : "border-transparent text-admin-muted hover:text-admin-cream"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Quiz (Ngân hàng câu hỏi)
            </button>
            <button
              type="button"
              onClick={() => handleAssessmentTypeChange("exam")}
              disabled={isContentLocked || isEditMode}
              className={`px-6 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                assessmentType === "exam"
                  ? "border-admin-pink text-admin-pink bg-admin-pink/5"
                  : "border-transparent text-admin-muted hover:text-admin-cream"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Exam PDF (Đề thi PDF)
            </button>
          </div>

          <div className="border-b border-admin-border/60 pb-4 mb-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`rounded border px-3 py-1.5 text-xs font-bold transition ${
                    selectedSectionId === section.id
                      ? "border-admin-pink bg-admin-pink/10 text-admin-pink"
                      : "border-admin-border bg-admin-deep text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  {section.title}
                </button>
              ))}
              <div className="ml-auto flex flex-wrap gap-1.5">
                {(["mcq", "true_false", "numeric", "essay"] as ItemType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={isContentLocked}
                    onClick={() => handleAddSection(type)}
                    className="rounded border border-admin-border bg-admin-deep px-2 py-1 text-xs font-bold text-admin-cream hover:border-admin-pink disabled:opacity-50"
                  >
                    + {itemTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {selectedSection && (
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={selectedSection.title}
                  onChange={(event) => handleUpdateSection(selectedSection.id, { title: event.target.value })}
                  disabled={isContentLocked}
                  className="rounded border border-admin-border bg-admin-bg px-3 py-2 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink"
                />
                <input
                  value={selectedSection.description || ""}
                  onChange={(event) => handleUpdateSection(selectedSection.id, { description: event.target.value || null })}
                  disabled={isContentLocked}
                  placeholder="Mô tả phần (không bắt buộc)"
                  className="rounded border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink"
                />
                <button
                  type="button"
                  disabled={isContentLocked || sections.length <= 1}
                  onClick={() => handleDeleteSection(selectedSection.id)}
                  className="rounded border border-red-400/40 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-40"
                >
                  Xóa phần
                </button>
              </div>
            )}
          </div>

          {/* List overview summary */}
          <div className="flex items-center justify-between bg-admin-surface-low border border-admin-border rounded-xl px-5 py-3 text-xs font-bold text-admin-muted">
            <div className="flex items-center gap-4">
              <span>
                Số câu hỏi:{" "}
                <span className="text-admin-cream">{stats.count}</span>
              </span>
              <span>
                Tổng điểm:{" "}
                <span className="text-admin-cream">{stats.score} điểm</span>
              </span>
              <span>
                Thời gian làm bài:{" "}
                <span className="text-admin-cream">{timeLimit} phút</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Clock size={12} className="text-admin-pink" />
              <span>
                Loại:{" "}
                {assessmentType === "exam"
                  ? "Exam PDF"
                  : "Quiz ngân hàng câu hỏi"}
              </span>
            </div>
          </div>

          {/* Workspace dispatcher */}
          {assessmentType === "quiz" ? (
            <div className="grid gap-6 xl:grid-cols-[240px_1fr_320px] lg:grid-cols-[200px_1fr] md:grid-cols-1">
              <QuestionSidebar
                items={sectionItems}
                selectedItemId={selectedItemId}
                onSelectItemId={setSelectedItemId}
                bulkItemType={bulkItemType}
                setBulkItemType={setBulkItemType}
                bulkCount={bulkCount}
                setBulkCount={setBulkCount}
                bulkMaxScore={bulkMaxScore}
                setBulkMaxScore={setBulkMaxScore}
                bulkTopicName={bulkTopicName}
                setBulkTopicName={setBulkTopicName}
                onBulkAddItems={handleBulkAddItems}
                onAddItem={handleAddItem}
                topicOptions={topicOptions}
                heightClass="h-[600px]"
              />

              <QuestionEditor
                item={selectedItem}
                assessmentType={assessmentType}
                topicOptions={topicOptions}
                onUpdateItem={handleItemFieldChange}
                onDeleteItem={handleDeleteItem}
                onCloneItem={handleCloneItem}
                heightClass="h-[600px]"
              />

              <AiAssistant
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                onAiGeneration={handleAiGeneration}
                isGeneratingAi={isGeneratingAi}
              />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[40%_60%] md:grid-cols-1">
              <PdfPreviewPanel
                mediaId={mediaId}
                pdfFileName={pdfFileName}
                pdfUrl={pdfUrl}
                uploadProgress={uploadProgress}
                onPdfUpload={handlePdfUpload}
              />

              <div className="rounded-xl border border-admin-border bg-admin-surface-low p-5 flex flex-col h-[700px]">
                <div className="flex items-center justify-between border-b border-admin-border/60 pb-3 mb-4 shrink-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-admin-pink flex items-center gap-1.5">
                    <ListChecks size={16} /> Phiếu đáp án (Answer Key)
                  </h3>
                  <span className="text-xs font-bold bg-admin-pink/10 text-admin-pink px-2.5 py-1 rounded-lg border border-admin-pink/20 animate-pulse">
                    Tổng: {stats.score} điểm
                  </span>
                </div>

                <div className="bg-admin-bg border border-admin-border/60 rounded-lg p-3 space-y-2 mb-4 shrink-0">
                  <div className="text-xs font-bold uppercase text-admin-pink flex items-center gap-1">
                    <Plus size={11} /> Thêm nhanh nhiều câu hỏi
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-admin-muted block">
                        Dạng
                      </label>
                      <select
                        value={bulkItemType}
                        disabled
                        onChange={(e) => {
                          const nextType = e.target.value as ItemType;
                          setBulkItemType(nextType);
                          setBulkMaxScore(defaultMaxScoreByItemType[nextType]);
                        }}
                        className="rounded border border-admin-border bg-admin-deep px-2 py-1 text-xs text-admin-cream outline-none font-bold disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <option value="mcq">MCQ</option>
                        <option value="true_false">Đúng/Sai</option>
                        <option value="numeric">Điền số</option>
                        <option value="essay">Tự luận</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-admin-muted block">
                        Số câu
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={bulkCount}
                        onChange={(e) => setBulkCount(Number(e.target.value))}
                        className="w-14 rounded border border-admin-border bg-admin-deep px-2 py-1 text-xs text-admin-cream outline-none focus:border-admin-pink text-center font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-admin-muted block">
                        Điểm/Câu
                      </label>
                      <input
                        type="number"
                        step={0.25}
                        min={0.01}
                        value={bulkMaxScore}
                        onChange={(e) =>
                          setBulkMaxScore(Number(e.target.value))
                        }
                        className="w-16 rounded border border-admin-border bg-admin-deep px-2 py-1 text-xs text-admin-cream outline-none focus:border-admin-pink text-center font-bold"
                      />
                    </div>

                    <div className="space-y-1 w-48">
                      <label className="text-xs font-bold uppercase text-admin-muted block">
                        Chuyên đề (Optional)
                      </label>
                      <input
                        type="text"
                        list="assessment-builder-topic-options"
                        value={bulkTopicName}
                        onChange={(e) => setBulkTopicName(e.target.value)}
                        placeholder="Ví dụ: Hàm số"
                        className="w-full rounded border border-admin-border bg-admin-deep px-2.5 py-1 text-xs text-admin-cream outline-none focus:border-admin-pink"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleBulkAddItems}
                      className="rounded bg-admin-pink px-4 py-1 text-xs font-bold text-admin-bg hover:brightness-110 active:scale-95 transition h-[26px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Thêm
                    </button>
                  </div>
                </div>

                <AnswerKeyTable
                  items={sectionItems}
                  selectedItemId={selectedItemId}
                  onSelectItemId={setSelectedItemId}
                  onUpdateItem={handleItemFieldChange}
                  onDeleteItem={handleDeleteItem}
                  topicOptions={topicOptions}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 2: Placement Settings */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto rounded-xl border border-admin-border bg-admin-surface-low p-6 space-y-5 animate-fade-in">
          <h3 className="text-sm font-bold uppercase tracking-wider text-admin-pink flex items-center gap-1.5 border-b border-admin-border/60 pb-3">
            <Settings size={14} /> Cấu hình cài đặt & Phân phối đề thi
          </h3>

          <div className="space-y-4 py-2">
            {/* Scope / Placement type tabs */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Phạm vi phân phối
              </label>
              <div className="grid grid-cols-4 rounded-lg bg-admin-bg p-1 border border-admin-border/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPlacementType("unplaced")}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    placementType === "unplaced"
                      ? "bg-admin-pink text-admin-bg"
                      : "text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  Chưa gắn
                </button>
                <button
                  type="button"
                  onClick={() => setPlacementType("public_practice")}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    placementType === "public_practice"
                      ? "bg-admin-pink text-admin-bg"
                      : "text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  Tự do (Luyện tập)
                </button>
                <button
                  type="button"
                  onClick={() => setPlacementType("course")}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    placementType === "course"
                      ? "bg-admin-pink text-admin-bg"
                      : "text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  Lộ trình (Khóa học)
                </button>
                <button
                  type="button"
                  onClick={() => setPlacementType("lesson")}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    placementType === "lesson"
                      ? "bg-admin-pink text-admin-bg"
                      : "text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  Bài học (Quiz bài)
                </button>
              </div>
            </div>

            {/* Course placement details */}
            {placementType === "course" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-admin-muted block">
                  Khóa học áp dụng
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.grade} -{" "}
                      {SUBJECT_LABELS[c.subject as Subject] || c.subject}]{" "}
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lesson placement details */}
            {placementType === "lesson" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-admin-muted block">
                    Khóa học
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.grade} -{" "}
                        {SUBJECT_LABELS[c.subject as Subject] || c.subject}]{" "}
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-admin-muted block">
                    Bài học (Dạng Quiz)
                  </label>
                  {quizLessons.length === 0 ? (
                    <div className="text-xs text-amber-500 font-bold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      Khóa học này chưa có bài học dạng Quiz. Vui lòng thêm bài
                      học trắc nghiệm trong phần quản lý bài học trước.
                    </div>
                  ) : (
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
                    >
                      {quizLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Attempts limit */}
            <div className="space-y-1 border-t border-admin-border/40 pt-3">
              <label className="text-xs font-bold text-admin-muted uppercase block">
                Số lượt làm bài tối đa
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold"
              />
            </div>

            {/* Open & Close times */}
            {placementType !== "unplaced" && placementType !== "public_practice" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-admin-muted uppercase block">
                    Thời gian mở đề
                  </label>
                  <input
                    type="datetime-local"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-admin-muted uppercase block">
                    Thời gian đóng đề
                  </label>
                  <input
                    type="datetime-local"
                    value={closeTime}
                    onChange={(e) => setOpenCloseTime(e.target.value)}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-3 border-t border-admin-border/60">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-xs font-bold text-admin-cream hover:border-admin-pink/60 transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft size={14} /> Quay lại Bước 1
            </button>
            <button
              type="button"
              disabled={isPendingState}
              onClick={handleSavePlacement}
              className="rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg hover:brightness-110 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              Lưu & Tiếp tục Bước 3 <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Verification & Publish */}
      {step === 3 && (
        <div className="max-w-xl mx-auto rounded-xl border border-admin-border bg-admin-surface-low p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-admin-pink flex items-center gap-1.5 border-b border-admin-border/60 pb-3 mb-4">
              <ListChecks size={16} /> Kiểm tra & Xuất bản đề thi
            </h3>
            <p className="text-xs text-admin-muted">
              Vui lòng kiểm tra kỹ các điều kiện dưới đây để chắc chắn bài kiểm
              tra hoạt động ổn định trên hệ thống học tập.
            </p>
          </div>

          {/* Checklist Block */}
          <div className="space-y-3 bg-admin-bg/40 border border-admin-border/60 rounded-xl p-5 text-xs font-bold">
            <div className="flex items-center justify-between">
              <span className="text-admin-cream">1. Tiêu đề đề thi</span>
              {title.trim().length >= 2 ? (
                <span className="text-emerald-400">Hợp lệ</span>
              ) : (
                <span className="text-admin-pink">Thiếu tiêu đề</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-admin-cream">
                2. Số câu hỏi trong đề (Tối thiểu 1 câu)
              </span>
              {items.length > 0 ? (
                <span className="text-emerald-400">{items.length} câu hỏi</span>
              ) : (
                <span className="text-admin-pink">Chưa có câu hỏi nào</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-admin-cream">
                3. Tổng số điểm đề thi (Lớn hơn 0đ)
              </span>
              {Number(stats.score) > 0 ? (
                <span className="text-emerald-400">{stats.score} điểm</span>
              ) : (
                <span className="text-admin-pink">Tổng điểm bằng 0 điểm</span>
              )}
            </div>
            {assessmentType === "exam" && (
              <div className="flex items-center justify-between">
                <span className="text-admin-cream">
                  4. Đã tải lên tài liệu PDF gốc (Exam mode)
                </span>
                {mediaId ? (
                  <span className="text-emerald-400">Đã tải PDF</span>
                ) : (
                  <span className="text-admin-pink">Chưa tải PDF đề thi</span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-admin-cream">
                5. Đã gán phạm vi phân phối đề thi
              </span>
              {placementType !== "unplaced" ? (
                <span className="text-emerald-400">
                  Phân phối:{" "}
                  {placementType === "public_practice"
                    ? "Công khai"
                    : placementType === "course"
                      ? "Lộ trình"
                      : "Bài học"}
                </span>
              ) : (
                <span className="text-amber-400">
                  Chưa gán (Bản nháp nội bộ)
                </span>
              )}
            </div>
          </div>

          {/* Validation Status Banner */}
          {isPublishReady ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs font-bold text-emerald-400">
              Đề thi đã sẵn sàng xuất bản! Giáo viên/Admin có thể trực tiếp đưa
              đề thi lên lớp học ngay.
            </div>
          ) : (
            <div className="rounded-xl border border-admin-pink/20 bg-admin-pink/5 px-4 py-3 text-xs font-bold text-admin-pink">
              Bài kiểm tra chưa đủ điều kiện xuất bản. Vui lòng hoàn thành các
              mục màu đỏ ở Bước 1 hoặc 2 trước.
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-admin-border/60">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-xs font-bold text-admin-cream hover:border-admin-pink/60 transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft size={14} /> Quay lại Bước 2
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPendingState}
                onClick={() => handlePublish("hidden")}
                className="rounded-lg border border-admin-border bg-admin-surface-low px-4 py-2 text-xs font-bold text-admin-cream hover:border-admin-pink/60 transition cursor-pointer disabled:opacity-50"
              >
                Lưu ẩn (Hidden)
              </button>
              <button
                type="button"
                disabled={!isPublishReady || isPendingState}
                onClick={() => setIsPublishConfirmOpen(true)}
                className="rounded-lg bg-admin-pink px-5 py-2 text-xs font-bold text-admin-bg hover:brightness-110 transition active:scale-95 disabled:opacity-30 cursor-pointer"
              >
                Xuất bản ngay (Publish)
              </button>
            </div>
          </div>
        </div>
      )}

      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface-low p-5 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-admin-pink">
              Xác nhận xuất bản
            </h3>
            <p className="mt-3 text-sm leading-6 text-admin-cream">
              Sau khi xuất bản, học sinh có thể bắt đầu làm bài. Khi đã có lượt
              làm bài, nội dung đề, đáp án và PDF sẽ bị khóa để bảo toàn dữ liệu
              điểm.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPublishConfirmOpen(false)}
                className="rounded-lg border border-admin-border bg-admin-bg px-4 py-2 text-xs font-bold text-admin-cream hover:border-admin-pink/60"
              >
                Huy
              </button>
              <button
                type="button"
                disabled={isPendingState}
                onClick={() => {
                  setIsPublishConfirmOpen(false);
                  handlePublish("published");
                }}
                className="rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg hover:brightness-110 disabled:opacity-50"
              >
                Xac nhan publish
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-admin-border bg-admin-surface-low p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-admin-border bg-admin-bg text-admin-cream hover:border-admin-pink/60 flex items-center justify-center transition cursor-pointer"
            >
              <X size={14} className="text-admin-cream hover:text-admin-pink" />
            </button>

            <h3 className="text-base font-bold uppercase tracking-wider text-admin-pink flex items-center gap-1.5 border-b border-admin-border/60 pb-3">
              <Settings size={18} /> Cài đặt thông tin đề thi (Metadata)
            </h3>

            <div className="space-y-4 py-2">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-admin-muted block">
                  Tiêu đề đề thi
                </label>
                <input
                  type="text"
                  required
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  placeholder="Nhập tiêu đề đề thi"
                  className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-admin-muted block">
                    Môn học
                  </label>
                  <select
                    value={settingsSubject}
                    onChange={(e) => setSettingsSubject(e.target.value as Subject)}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
                  >
                    {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
                      <option key={value} value={value} className="bg-admin-surface-low">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-admin-muted block">
                    Khối lớp
                  </label>
                  <select
                    value={settingsGrade}
                    onChange={(e) => setSettingsGrade(Number(e.target.value))}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g} className="bg-admin-surface-low">
                        Lớp {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Time Limit */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-admin-muted block">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={settingsTimeLimit}
                    onChange={(e) => setSettingsTimeLimit(Number(e.target.value))}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold"
                  />
                </div>

                {/* Grading Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-admin-muted block">
                    Hình thức chấm
                  </label>
                  <select
                    value={settingsGradingType}
                    onChange={(e) => setSettingsGradingType(e.target.value as any)}
                    className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
                  >
                    <option value="auto" className="bg-admin-surface-low">Tự động chấm</option>
                    <option value="manual" className="bg-admin-surface-low">Tự luận chấm tay</option>
                    <option value="mixed" className="bg-admin-surface-low">Hỗn hợp</option>
                  </select>
                </div>
              </div>

              {/* Exam PDF Uploader */}
              {assessmentType === "exam" && (
                <div className="space-y-2 border border-admin-border/40 rounded-xl bg-admin-deep/40 p-4">
                  <label className="text-xs font-bold uppercase text-admin-muted block">
                    Đính kèm đề thi PDF gốc
                  </label>
                  {settingsPdfFileName ? (
                    <div className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs font-bold text-admin-cream">
                      <span className="truncate max-w-[200px]">{settingsPdfFileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsMediaId(null);
                          setSettingsPdfFileName(null);
                          setSettingsPdfUrl(null);
                        }}
                        className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-admin-border hover:border-admin-pink/60 rounded-lg p-5 cursor-pointer transition text-admin-muted hover:text-admin-cream">
                      <Upload size={20} className="mb-2" />
                      <span className="text-xs font-bold">Tải lên tệp PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleSettingsPdfUpload}
                        disabled={settingsUploadProgress !== null}
                      />
                    </label>
                  )}
                  {settingsUploadProgress !== null && (
                    <div className="w-full bg-admin-border rounded-full h-1.5 overflow-hidden mt-2">
                      <div
                        className="bg-admin-pink h-full transition-all duration-300"
                        style={{ width: `${settingsUploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-admin-border/40">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded border border-admin-border text-xs font-bold text-admin-cream hover:bg-admin-deep transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSaving || (assessmentType === "exam" && !settingsMediaId)}
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded bg-admin-pink text-xs font-bold text-admin-bg hover:brightness-110 active:scale-95 disabled:opacity-40 transition cursor-pointer"
              >
                {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAssessmentBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-admin-bg flex items-center justify-center text-admin-cream font-sans">
          <p className="animate-pulse">Đang tải...</p>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
