export const UI_MESSAGES = {
  common: {
    unknownError: 'Có lỗi xảy ra. Vui lòng thử lại.',
  },
  auth: {
    loginFailed: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
    registerFailed: 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
    registerSuccess: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.',
    registerAutoLogin: 'Đăng ký thành công! Đang đăng nhập tự động...',
    mustAgreeTerms: 'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.',
    confirmPasswordMismatch: 'Xác nhận mật khẩu không trùng khớp.',
  },
  courses: {
    createSuccess: 'Tạo khóa học thành công.',
    createFailed: 'Tạo khóa học thất bại. Vui lòng kiểm tra lại thông tin.',
    publishSuccess: 'Đã xuất bản khóa học thành công.',
    publishFailed: 'Có lỗi xảy ra khi phát hành khóa học.',
    archiveSuccess: 'Đã lưu trữ khóa học thành công.',
    archiveFailed: 'Có lỗi xảy ra khi lưu trữ khóa học.',
    updateInfoUnavailable: 'Màn hình chỉnh sửa thông tin đang được cập nhật.',
    validation: {
      titleRequired: 'Vui lòng nhập tên khóa học.',
      subjectRequired: 'Vui lòng chọn môn học.',
      gradeInvalid: 'Khối lớp phải hợp lệ.',
      teacherRequired: 'Vui lòng chọn giảng viên.',
      priceInvalid: 'Giá gốc không được nhỏ hơn 0đ.',
      salePriceInvalid: 'Giá khuyến mãi phải nhỏ hơn giá gốc.',
      thumbnailFileInvalid: 'Chỉ chấp nhận định dạng ảnh .jpg, .png, .webp.',
      thumbnailFileTooLarge: 'Dung lượng ảnh bìa không được vượt quá 5MB.',
    },
  },
  chapters: {
    titleRequired: 'Vui lòng nhập tên chương.',
    reorderSuccess: 'Sắp xếp chương thành công.',
    reorderFailed: 'Sắp xếp chương thất bại. Hệ thống đã tự động hoàn tác.',
    updateSuccess: 'Đã cập nhật chương thành công.',
    createSuccess: 'Đã thêm chương mới thành công.',
    deleteSuccess: 'Đã xóa chương thành công.',
  },
  lessons: {
    titleRequired: 'Vui lòng nhập tiêu đề bài học.',
    documentContentRequired: 'Nội dung tài liệu không được để trống.',
    assessmentRequired: 'Vui lòng chọn bài kiểm tra để liên kết.',
    youtubeUrlRequired: 'Vui lòng nhập đường dẫn YouTube URL.',
    videoFileRequired: 'Vui lòng tải lên tệp video bài học.',
    videoFileInvalid: 'Vui lòng chỉ tải lên tệp video (.mp4, .webm).',
    videoFileTooLarge: 'Dung lượng video vượt quá giới hạn cho phép (Tối đa 500MB).',
    saveFailed: 'Có lỗi xảy ra khi lưu bài học.',
    reorderSuccess: 'Sắp xếp bài học thành công.',
    reorderFailed: 'Sắp xếp bài học thất bại. Hệ thống đã tự động hoàn tác.',
    moveAcrossChapterUnsupported: 'Không hỗ trợ kéo thả bài học sang chương khác.',
    updateSuccess: 'Đã cập nhật bài học thành công.',
    createSuccess: 'Đã thêm bài học mới thành công.',
    deleteSuccess: 'Đã xóa bài học thành công.',
  },
  demo: {
    published: 'Đã chuyển trạng thái sang Published (Demo).',
    archived: 'Đã chuyển trạng thái sang Archived (Demo).',
    chapterUpdated: 'Đã cập nhật chương (Demo Mode).',
    chapterCreated: 'Đã thêm chương mới (Demo Mode).',
    chapterDeleted: 'Đã xóa chương (Demo Mode).',
    chapterReordered: 'Sắp xếp chương thành công (Demo Mode).',
    lessonUpdated: 'Đã cập nhật bài học (Demo Mode).',
    lessonCreated: 'Đã thêm bài học mới (Demo Mode).',
    lessonDeleted: 'Đã xóa bài học (Demo Mode).',
    lessonReordered: 'Sắp xếp bài học thành công (Demo Mode).',
    apiConnected: 'Đã kết nối API đồng bộ hóa thời gian thực.',
  },
} as const;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};
