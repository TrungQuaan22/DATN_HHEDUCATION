import { TeacherSummary } from "@/types/common";
import { CourseSummary, CourseDetail, AdminCourseSummary } from "./types";

export const mockTeachers: TeacherSummary[] = [
  {
    id: "teacher-1",
    fullName: "Cô Nguyễn Minh Anh",
    subject: "literature",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLYsdq-Ohrk1ef54qctVaXrp6UbsI743djPoBJ4fruZDVRG9-Nc0qSLlLkFQBpKCDsyddkz2BQJuJBPJfom9SxHG4uFdbP6UAzNY7Ls4SaREtiMMUje7QEeymQCxSnL2ZXBHEpe0-SrVqsJpUOP65SCUr4Do67uLSSE1czw4vn-xE8zJE6BR3JCeNUu8UEleetLERgZpPAQy87lolUnA1aSaiBWGNU18Ep6mDgLBPQUpe1Pn3HohvfEi3HBMG6iv7UbWLXbr2TcLs",
    title: "Giảng viên Ngữ Văn",
    bio: "Cô Nguyễn Minh Anh tốt nghiệp thủ khoa đầu vào Chuyên Văn THPT Chuyên Vĩnh Phúc, đạt giải Nhì Học sinh giỏi Quốc gia Ngữ văn, và đoạt Huy chương Vàng Trại hè Hùng Vương.",
    achievements: [
      {
        id: "ach-1",
        year: "Hiện tại",
        title: "Hành trình Học vấn Chuyên Văn",
        description:
          "K22 Chuyên Văn – THPT Chuyên Vĩnh Phúc; K75 HNUE – ĐH Sư phạm Hà Nội.",
      },
      {
        id: "ach-2",
        year: "Cấp 2",
        title: "Giải Nhất Ngữ văn cấp tỉnh",
        description: "Giải Nhất Ngữ văn lớp 6, 7; Giải Nhất cấp tỉnh lớp 9.",
      },
      {
        id: "ach-3",
        year: "Cấp 3",
        title: "Giải Nhì HSG Quốc gia (2019-2020)",
        description:
          "Thủ khoa đầu vào Chuyên Văn; Huy chương Vàng Trại hè Hùng Vương; Điểm tốt nghiệp: 9,75.",
      },
    ],
  },
  {
    id: "teacher-2",
    fullName: "ThS. Nguyễn Thành Trung",
    subject: "math",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc",
    title: "Chuyên gia Luyện thi Toán",
    bio: "Cựu giáo viên trường THPT Chuyên Lê Hồng Phong, với hơn 15 năm kinh nghiệm luyện thi đại học, giúp hàng nghìn học sinh đạt điểm 9+ môn Toán.",
    achievements: [
      {
        id: "ach-4",
        year: "Kinh nghiệm",
        title: "Giảng viên tại THPT Chuyên Lê Hồng Phong",
        description:
          "Hơn 15 năm kinh nghiệm luyện thi đại học môn Toán khối A, A1.",
      },
      {
        id: "ach-5",
        year: "Tác phẩm",
        title: 'Tác giả sách "Toán học Tư duy"',
        description:
          "Bộ sách giúp học sinh mất gốc lấy lại căn bản trong 30 ngày.",
      },
    ],
  },
  {
    id: "teacher-3",
    fullName: "GV. Nguyễn Thị Hiền",
    subject: "physics",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBiCHaR8B7lUE3lWUAJEU4NTnP2_XDy-0Da1ARx6oHmDTNDEgVtmcXs10wNSFnYci8CKjdsuXsSD2hbrHEum44y4kEhRw-jl2o4A6DBj5DuYZyODh4tOmdCcwg_oPhmr0S-Ig-iloXVEecnPm4FxwcGLWoxSpNiZb-LkksFvxx_T-owie9-rWihETMS1ToPrAFAxcYyIA8PHMUmnno0HBnWqC85VPqRZkKYI4pg46Z6PXOTfjw6_UWcfwx-YRZ3g73ZL04qjBeiT6o",
    title: "Thạc sĩ Vật Lý",
    bio: "Giảng viên tiêu biểu với phương pháp dạy học trực quan và ứng dụng thực tiễn.",
    achievements: [
      {
        id: "ach-6",
        year: "Kinh nghiệm",
        title: "Giáo viên Vật Lý Chuyên sâu",
        description:
          "Hơn 8 năm luyện thi THPT Quốc Gia, giúp học sinh nắm vững bản chất hiện tượng vật lý.",
      },
    ],
  },
];

export const mockCourses: CourseSummary[] = [
  {
    id: "course-math-12-adv",
    title: "Giải Tích Nâng Cao: Từ Cơ Bản Đến Thủ Khoa",
    slug: "toan-hoc-nang-cao-giai-tich-hinh-hoc",
    description:
      "Chương trình ôn luyện toàn diện được thiết kế bởi các chuyên gia hàng đầu, tập trung vào tư duy logic và kỹ thuật giải nhanh trắc nghiệm.",
    subject: "math",
    grade: 12,
    teacher: {
      id: "teacher-2",
      fullName: "ThS. Nguyễn Thành Trung",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc",
    },
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-6v-5ho_dbCv7F9m85XNArev25lzqCQsB63igfRHXRYQRXT4oT-GePLTQLBJt_Le3n2v6xPKayQ4b15pH4FWK-_FaCnHkAA1CQuuj5Jka3Af3rcRHChUNQBLpzRhAWnYV4WmvzSAxaGGmIc7FYgdSwCWrAc-oV9mR-IZPWrLvUjxYsdKJh-PMikdGKdISNWSdy36k5klU7nMk8u_7HWC2aY3c3DYHgtfILjCMwR-hCnv_OAbvV0zR6Adw8kCc6dk8A_cfHp98tkk",
    price: 1200000,
    salePrice: 850000,
    status: "published",
    totalLessons: 42,
    isFeatured: true,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: "course-physics-11",
    title: "Quang Hình Học & Dòng Điện Xoay Chiều",
    slug: "vat-ly-11-dien-tu-truong-quang-hoc",
    description:
      "Toàn bộ lý thuyết và bài tập giải thích cặn kẽ về từ trường, điện tích và hệ thống quang hình học.",
    subject: "physics",
    grade: 11,
    teacher: {
      id: "teacher-3",
      fullName: "GV. Nguyễn Thị Hiền",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBiCHaR8B7lUE3lWUAJEU4NTnP2_XDy-0Da1ARx6oHmDTNDEgVtmcXs10wNSFnYci8CKjdsuXsSD2hbrHEum44y4kEhRw-jl2o4A6DBj5DuYZyODh4tOmdCcwg_oPhmr0S-Ig-iloXVEecnPm4FxwcGLWoxSpNiZb-LkksFvxx_T-owie9-rWihETMS1ToPrAFAxcYyIA8PHMUmnno0HBnWqC85VPqRZkKYI4pg46Z6PXOTfjw6_UWcfwx-YRZ3g73ZL04qjBeiT6o",
    },
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGJQRo8kdV4S4CczdPHUjlMoIrBDUfjwxO6OxeJU_Qip21FzNx_K3rMB6q0PpOmwsp2mBBYPVXKVWCzJtNJRxy6FG94KLJ-o-89Jrrt-dfGP9BBi4BNwFozh50LfqmqxUEYl5xpdD_0hIQL8sHnnBDxvhCoUvumPXns9vtEzvfxdWA-DPgTaXJGtkVKef0FEYc9clMzUsFKwT9qbsY06b7b5QpwTXJIX_Ah9-dKmYfLreadZy1JOMiW2G5_c6V6AE9VrZVVDzXqhQ",
    price: 980000,
    salePrice: 690000,
    status: "published",
    totalLessons: 35,
    isFeatured: true,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: "course-literature-11",
    title: "Tư Duy Văn Học: Phân Tích & Cảm Thụ Tác Phẩm",
    slug: "ngu-van-11-phan-tich-cam-thu-tac-pham",
    description:
      "Rèn luyện kỹ năng phân tích thơ, truyện ngắn, lập luận văn học mạch lạc để chinh phục điểm 9+ Ngữ văn.",
    subject: "literature",
    grade: 11,
    teacher: {
      id: "teacher-1",
      fullName: "Cô Nguyễn Minh Anh",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLYsdq-Ohrk1ef54qctVaXrp6UbsI743djPoBJ4fruZDVRG9-Nc0qSLlLkFQBpKCDsyddkz2BQJuJBPJfom9SxHG4uFdbP6UAzNY7Ls4SaREtiMMUje7QEeymQCxSnL2ZXBHEpe0-SrVqsJpUOP65SCUr4Do67uLSSE1czw4vn-xE8zJE6BR3JCeNUu8UEleetLERgZpPAQy87lolUnA1aSaiBWGNU18Ep6mDgLBPQUpe1Pn3HohvfEi3HBMG6iv7UbWLXbr2TcLs",
    },
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCT5WffzErKRVnG_p09zXyozZAVSAUWQfs4dIbYyON82WDYmD34ZVWLQchKThnEx0Se4gZ3S8E4m8yzmlyuMLhbHpSdV1PK_RYidZCwhtIb-ewFi0YulCPDKoaFgeor6JxcfkQ8WLbXyJ17Lz1196Fq9eA3_CZlG4LCTtFPJuDObvDwEWWz5m-EsL6tchH6UyTM9YqutAOCJX0ZOuKajGTvL_rSVteOIBgvO85HzjzyBrUbL4a9vNntRG7raW5trbax9Iska5ftS9Q",
    price: 720000,
    salePrice: null,
    status: "published",
    totalLessons: 30,
    isFeatured: true,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: "course-chemistry-11",
    title: "Hóa Học Hữu Cơ Toàn Diện",
    slug: "hoa-hoc-huu-co-toan-dien",
    description:
      "Bảo bối thần kỳ giúp học sinh lấy gốc và nâng cao toàn bộ kiến thức hóa hữu cơ lớp 11.",
    subject: "chemistry",
    grade: 11,
    teacher: {
      id: "teacher-3",
      fullName: "GV. Nguyễn Thị Hiền",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBiCHaR8B7lUE3lWUAJEU4NTnP2_XDy-0Da1ARx6oHmDTNDEgVtmcXs10wNSFnYci8CKjdsuXsSD2hbrHEum44y4kEhRw-jl2o4A6DBj5DuYZyODh4tOmdCcwg_oPhmr0S-Ig-iloXVEecnPm4FxwcGLWoxSpNiZb-LkksFvxx_T-owie9-rWihETMS1ToPrAFAxcYyIA8PHMUmnno0HBnWqC85VPqRZkKYI4pg46Z6PXOTfjw6_UWcfwx-YRZ3g73ZL04qjBeiT6o",
    },
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGJQRo8kdV4S4CczdPHUjlMoIrBDUfjwxO6OxeJU_Qip21FzNx_K3rMB6q0PpOmwsp2mBBYPVXKVWCzJtNJRxy6FG94KLJ-o-89Jrrt-dfGP9BBi4BNwFozh50LfqmqxUEYl5xpdD_0hIQL8sHnnBDxvhCoUvumPXns9vtEzvfxdWA-DPgTaXJGtkVKef0FEYc9clMzUsFKwT9qbsY06b7b5QpwTXJIX_Ah9-dKmYfLreadZy1JOMiW2G5_c6V6AE9VrZVVDzXqhQ",
    price: 1100000,
    salePrice: 750000,
    status: "published",
    totalLessons: 40,
    isFeatured: false,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: "course-english-11",
    title: "Luyện Thi IELTS 6.5+ Cho Học Sinh Cấp 3",
    slug: "luyen-thi-ielts-6-5-cho-hoc-sinh-cap-3",
    description:
      "Chương trình được thiết kế đặc biệt bám sát đề thi IELTS học thuật và cấu trúc đề thi THPTQG.",
    subject: "english",
    grade: 11,
    teacher: {
      id: "teacher-1",
      fullName: "Cô Nguyễn Minh Anh",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLYsdq-Ohrk1ef54qctVaXrp6UbsI743djPoBJ4fruZDVRG9-Nc0qSLlLkFQBpKCDsyddkz2BQJuJBPJfom9SxHG4uFdbP6UAzNY7Ls4SaREtiMMUje7QEeymQCxSnL2ZXBHEpe0-SrVqsJpUOP65SCUr4Do67uLSSE1czw4vn-xE8zJE6BR3JCeNUu8UEleetLERgZpPAQy87lolUnA1aSaiBWGNU18Ep6mDgLBPQUpe1Pn3HohvfEi3HBMG6iv7UbWLXbr2TcLs",
    },
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-6v-5ho_dbCv7F9m85XNArev25lzqCQsB63igfRHXRYQRXT4oT-GePLTQLBJt_Le3n2v6xPKayQ4b15pH4FWK-_FaCnHkAA1CQuuj5Jka3Af3rcRHChUNQBLpzRhAWnYV4WmvzSAxaGGmIc7FYgdSwCWrAc-oV9mR-IZPWrLvUjxYsdKJh-PMikdGKdISNWSdy36k5klU7nMk8u_7HWC2aY3c3DYHgtfILjCMwR-hCnv_OAbvV0zR6Adw8kCc6dk8A_cfHp98tkk",
    price: 1500000,
    salePrice: 990000,
    status: "published",
    totalLessons: 50,
    isFeatured: false,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: "course-history-11",
    title: "Lịch Sử Việt Nam Cận Hiện Đại",
    slug: "lich-su-viet-nam-can-hien-dai",
    description:
      "Hệ thống hóa toàn bộ các mốc lịch sử quan trọng bằng sơ đồ tư duy, giúp học bài siêu nhanh.",
    subject: "history",
    grade: 11,
    teacher: {
      id: "teacher-2",
      fullName: "ThS. Nguyễn Thành Trung",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc",
    },
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCT5WffzErKRVnG_p09zXyozZAVSAUWQfs4dIbYyON82WDYmD34ZVWLQchKThnEx0Se4gZ3S8E4m8yzmlyuMLhbHpSdV1PK_RYidZCwhtIb-ewFi0YulCPDKoaFgeor6JxcfkQ8WLbXyJ17Lz1196Fq9eA3_CZlG4LCTtFPJuDObvDwEWWz5m-EsL6tchH6UyTM9YqutAOCJX0ZOuKajGTvL_rSVteOIBgvO85HzjzyBrUbL4a9vNntRG7raW5trbax9Iska5ftS9Q",
    price: 550000,
    salePrice: null,
    status: "published",
    totalLessons: 20,
    isFeatured: false,
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
  },
];

export const mockCourseDetails: Record<string, CourseDetail> = {
  "toan-hoc-nang-cao-giai-tich-hinh-hoc": {
    ...mockCourses[0],
    relatedCourses: mockCourses
      .filter(
        (course) =>
          course.id !== mockCourses[0].id &&
          course.grade === mockCourses[0].grade &&
          course.isFeatured,
      )
      .slice(0, 3),
    chapters: [
      {
        id: "chap-1",
        title: "Chương I: Ứng dụng đạo hàm để khảo sát hàm số",
        orderIndex: 1,
        lessons: [
          {
            id: "les-1-1",
            title: "Sự đồng biến, nghịch biến của hàm số",
            type: "video",
            videoType: "youtube",
            durationSec: 2720,
            orderIndex: 1,
            allowPreview: true,
          },
          {
            id: "les-1-2",
            title: "Cực trị của hàm số - Các dạng bài tập trọng tâm",
            type: "video",
            videoType: "youtube",
            durationSec: 3492,
            orderIndex: 2,
            allowPreview: false,
          },
          {
            id: "les-1-3",
            title: "Giá trị lớn nhất và nhỏ nhất của hàm số",
            type: "video",
            videoType: "youtube",
            durationSec: 2525,
            orderIndex: 3,
            allowPreview: false,
          },
        ],
      },
      {
        id: "chap-2",
        title: "Chương II: Hàm số Lũy thừa, Mũ và Logarit",
        orderIndex: 2,
        lessons: [
          {
            id: "les-2-1",
            title: "Lũy thừa và các phép toán cơ bản",
            type: "video",
            videoType: "youtube",
            durationSec: 1800,
            orderIndex: 1,
            allowPreview: false,
          },
          {
            id: "les-2-2",
            title: "Hàm số mũ và hàm số logarit",
            type: "video",
            videoType: "youtube",
            durationSec: 2400,
            orderIndex: 2,
            allowPreview: false,
          },
        ],
      },
      {
        id: "chap-3",
        title: "Chương III: Nguyên hàm và Tích phân",
        orderIndex: 3,
        lessons: [
          {
            id: "les-3-1",
            title: "Định nghĩa nguyên hàm và tính chất",
            type: "video",
            videoType: "youtube",
            durationSec: 2100,
            orderIndex: 1,
            allowPreview: false,
          },
        ],
      },
    ],
  },
};

export function getCourseDetail(slug: string): CourseDetail {
  if (mockCourseDetails[slug]) return mockCourseDetails[slug];
  const summary = mockCourses.find((c) => c.slug === slug) || mockCourses[0];
  return {
    ...summary,
    relatedCourses: mockCourses
      .filter(
        (course) =>
          course.id !== summary.id &&
          course.grade === summary.grade &&
          course.isFeatured,
      )
      .slice(0, 3),
    chapters: [
      {
        id: "chap-default-1",
        title: "Chương 1: Kiến thức nền tảng và trọng tâm",
        orderIndex: 1,
        lessons: [
          {
            id: "les-def-1",
            title: "Bài học mở đầu: Phương pháp học hiệu quả",
            type: "video",
            videoType: "youtube",
            durationSec: 1200,
            orderIndex: 1,
            allowPreview: true,
          },
          {
            id: "les-def-2",
            title: "Tổng quan các dạng bài tập thi cử",
            type: "video",
            videoType: "youtube",
            durationSec: 2400,
            orderIndex: 2,
            allowPreview: false,
          },
        ],
      },
    ],
  };
}

export const mockAdminCourses: AdminCourseSummary[] = [
  {
    id: "course-1",
    title: "Ngữ Văn 12 - Tích Chữ",
    slug: "ngu-van-12-tich-chu",
    description: "Khoá học ôn luyện thi THPT Quốc gia môn Ngữ Văn chuyên sâu.",
    subject: "literature",
    grade: 12,
    teacherId: "teacher-1",
    teacher: {
      id: "teacher-1",
      email: "hatran@hheducation.com",
      fullName: "Trần Thu Hà",
      avatarMediaId: null,
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0",
    },
    thumbnailMediaId: null,
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVHwjx_spiNkTVFUqN2XnwoK-BVcLQqTmqKGUv8r-jJ4GMX9klsCpXIXccTRFUSA5sYw5fKViKUiXFvHnnJMq3IL_L1eOVp-vTC4mecH_L45x72S6CNPBUjWzNpKyQ8acfW6CzJviBFMiWUd-H_1qR9_nrUeyz-o0eu4POyRMVQsu5_nGhKCb6zIALiaXG_pL-_c8sPbddn-kvuiJfW5uVu6Cmz0qPMSCpU9tIVFYE7_7BOmS0qUjuitk3pQjUkeMLVqCaBFtwyeA",
    price: 299000,
    salePrice: null,
    status: "draft",
    isFeatured: false,
    enrolledCount: 0,
    totalLessons: 0,
    createdAt: "2026-05-28T10:00:00Z",
    updatedAt: "2026-05-28T12:00:00Z",
  },
  {
    id: "course-2",
    title: "IELTS Mastery 7.5+",
    slug: "ielts-mastery-v2",
    description:
      "Khoá học ôn luyện thi IELTS đầy đủ 4 kỹ năng đạt mục tiêu 7.5+.",
    subject: "english",
    grade: 12,
    teacherId: "teacher-2",
    teacher: {
      id: "teacher-2",
      email: "hunghong@hheducation.com",
      fullName: "Lê Mạnh Hùng",
      avatarMediaId: null,
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA8uAWXW-84lR1omWWGUfPf6jL2juqk_WnJ8qdZbjjgH_lIhk9swf9CasAe1T5Db6x06snq5bUO228jwBK_nIZRbIMvFHPzyOqLfzdYledH3OeqVsxi4JcpK5YBdKGejm26qEkIrseqkXzEjb3isIKXrF6B4JZ8u-M3Z6VMJiwa7He1N1B-vvSRTQfgBFqFL02GvvdZGfrg2MqzraCJaM1frwvDihe5xMj-y875lHe5z0bLZ8eOzeay40p-nPWucHplkjZAVSC-p3E",
    },
    thumbnailMediaId: null,
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZSCn7b7vu3CbZMLcBJqFZN0wjfyyJ7JTbAEUSkWGDzpi_yBM3uIPaJf8BWErZsQYtYpWMYwloMMd8KQCgHz6L3tbf_-VuYnm8shw-1Vp5kIZLE9QVPaW5glM8-muDSTB3yAH_UxtDGnktWDF4Yrh2rRby9YVig3TOj_VQD2cJeOuQwDrLoE-N2sNmceVE1JegOuIJ77qpXT2tw_b7mApZxjApY7kgc0soseYm7vh-G3viU_26ZU4uSS9STjH2qoBa5qSLec6290Q",
    price: 1450000,
    salePrice: 1190000,
    status: "published",
    isFeatured: true,
    enrolledCount: 142,
    totalLessons: 12,
    createdAt: "2026-04-10T08:00:00Z",
    updatedAt: "2026-05-25T14:30:00Z",
  },
  {
    id: "course-3",
    title: "Toán 12 Nâng cao",
    slug: "math-12-advanced",
    description:
      "Bồi dưỡng kiến thức Toán học chuyên sâu chuẩn bị cho kì thi học sinh giỏi và THPT.",
    subject: "math",
    grade: 12,
    teacherId: "teacher-3",
    teacher: {
      id: "teacher-3",
      email: "annguyen@hheducation.com",
      fullName: "Nguyễn Văn An",
      avatarMediaId: null,
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAZgwyYtu2i65sFL8Y7A6KaG2czYIN8JkmqQyrqraxAgGgO7He_27ZUFzYvdOoKD_7wZ-4s6eram-uDxLXBOqu8ICcxuMLgFLU78dxSpS_MXbkZeRG8qjuDaNZzeEo0xbQSyeJc2hfGi_x9E3dbVPs7JMHqo_y1gAj2qngSbZ5-DLBBgDSZgcOli8pr8Qud2THSM-RzUYTPgl-3lN4YGPmIemeLUDrC53o9rLu-txR8rnntvttem58MXxr69TISQdey-i9RcaPIgmE",
    },
    thumbnailMediaId: null,
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgJqthbQmHMzThVYyl5GFHA_uhIeXb3tFrUElnf_5xhRMFIGHOHlGmcDg7bP02O6TvXlggf_H3orb4c9H7qOtmPNhyiPOATuHxhlYS-uPdRmhP45DwewsmW785e1YeqzEAhDzFn5CKXgCTXVT6wPtO9LhbqKfdjbBF_P2FgSCw5z89dIFtV6Z2XJKLSBoAjFk4Bman7CaMDxoDkBF3C0xMQBqqeuA5CS_QtC5mM4jVqA0nJhbfsnD5mVee1NcFkfvqqQFFEeztKso",
    price: 550000,
    salePrice: null,
    status: "draft",
    isFeatured: true,
    enrolledCount: 5,
    totalLessons: 8,
    createdAt: "2026-05-15T09:15:00Z",
    updatedAt: "2026-05-15T09:15:00Z",
  },
  {
    id: "course-4",
    title: "Vật Lý 11 Cơ bản",
    slug: "phys-11-core",
    description:
      "Kiến thức Vật lý nền tảng lớp 11 bám sát chương trình sách giáo khoa.",
    subject: "physics",
    grade: 11,
    teacherId: "teacher-4",
    teacher: {
      id: "teacher-4",
      email: "ducvu@hheducation.com",
      fullName: "Vũ Minh Đức",
      avatarMediaId: null,
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAZgwyYtu2i65sFL8Y7A6KaG2czYIN8JkmqQyrqraxAgGgO7He_27ZUFzYvdOoKD_7wZ-4s6eram-uDxLXBOqu8ICcxuMLgFLU78dxSpS_MXbkZeRG8qjuDaNZzeEo0xbQSyeJc2hfGi_x9E3dbVPs7JMHqo_y1gAj2qngSbZ5-DLBBgDSZgcOli8pr8Qud2THSM-RzUYTPgl-3lN4YGPmIemeLUDrC53o9rLu-txR8rnntvttem58MXxr69TISQdey-i9RcaPIgmE",
    },
    thumbnailMediaId: null,
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDeH3AclEgxLOHTlncQaBuhxf91OxqFpCr7JjzCMnm8bu5R1TE8MiyrQzEVP6O9IpPh9EnwnaByYjvCYT8wg5fYVhtkIMjQkZn5R38zQ-9jqFxxUkhxAXkWfavO5S6ccbrIXwIlXAOrrNXJJ74b0x4x32FFkPfaPPMrmc0Y_m79YcdIOgalMJuwLMSBv3WIcoceqUWroRsA3c0hjpd8YjVt-et97L0k0JdDQukAoQQTXeQhsEfiDkUpHFmVrqn08ehP0XAJRAalnqA",
    price: 350000,
    salePrice: 199000,
    status: "archived",
    isFeatured: false,
    enrolledCount: 78,
    totalLessons: 15,
    createdAt: "2025-09-01T07:00:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
  },
];

export const mockTeachersList = [
  { id: "teacher-1", fullName: "Trần Thu Hà", email: "hatran@hheducation.com" },
  {
    id: "teacher-2",
    fullName: "Lê Mạnh Hùng",
    email: "hunghong@hheducation.com",
  },
  {
    id: "teacher-3",
    fullName: "Nguyễn Văn An",
    email: "annguyen@hheducation.com",
  },
  { id: "teacher-4", fullName: "Vũ Minh Đức", email: "ducvu@hheducation.com" },
];

