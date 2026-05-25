import { CourseSummary, CourseDetail, TeacherSummary, BlogPostSummary, BlogPostDetail } from '@/types/common';

export const mockTeachers: TeacherSummary[] = [
  {
    id: 'teacher-1',
    fullName: 'Cô Nguyễn Minh Anh',
    subject: 'literature',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLYsdq-Ohrk1ef54qctVaXrp6UbsI743djPoBJ4fruZDVRG9-Nc0qSLlLkFQBpKCDsyddkz2BQJuJBPJfom9SxHG4uFdbP6UAzNY7Ls4SaREtiMMUje7QEeymQCxSnL2ZXBHEpe0-SrVqsJpUOP65SCUr4Do67uLSSE1czw4vn-xE8zJE6BR3JCeNUu8UEleetLERgZpPAQy87lolUnA1aSaiBWGNU18Ep6mDgLBPQUpe1Pn3HohvfEi3HBMG6iv7UbWLXbr2TcLs',
    title: 'Giảng viên Ngữ Văn',
    bio: 'Cô Nguyễn Minh Anh tốt nghiệp thủ khoa đầu vào Chuyên Văn THPT Chuyên Vĩnh Phúc, đạt giải Nhì Học sinh giỏi Quốc gia Ngữ văn, và đoạt Huy chương Vàng Trại hè Hùng Vương.',
    achievements: [
      {
        id: 'ach-1',
        year: 'Hiện tại',
        title: 'Hành trình Học vấn Chuyên Văn',
        description: 'K22 Chuyên Văn – THPT Chuyên Vĩnh Phúc; K75 HNUE – ĐH Sư phạm Hà Nội.'
      },
      {
        id: 'ach-2',
        year: 'Cấp 2',
        title: 'Giải Nhất Ngữ văn cấp tỉnh',
        description: 'Giải Nhất Ngữ văn lớp 6, 7; Giải Nhất cấp tỉnh lớp 9.'
      },
      {
        id: 'ach-3',
        year: 'Cấp 3',
        title: 'Giải Nhì HSG Quốc gia (2019-2020)',
        description: 'Thủ khoa đầu vào Chuyên Văn; Huy chương Vàng Trại hè Hùng Vương; Điểm tốt nghiệp: 9,75.'
      }
    ]
  },
  {
    id: 'teacher-2',
    fullName: 'ThS. Nguyễn Thành Trung',
    subject: 'math',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc',
    title: 'Chuyên gia Luyện thi Toán',
    bio: 'Cựu giáo viên trường THPT Chuyên Lê Hồng Phong, với hơn 15 năm kinh nghiệm luyện thi đại học, giúp hàng nghìn học sinh đạt điểm 9+ môn Toán.',
    achievements: [
      {
        id: 'ach-4',
        year: 'Kinh nghiệm',
        title: 'Giảng viên tại THPT Chuyên Lê Hồng Phong',
        description: 'Hơn 15 năm kinh nghiệm luyện thi đại học môn Toán khối A, A1.'
      },
      {
        id: 'ach-5',
        year: 'Tác phẩm',
        title: 'Tác giả sách "Toán học Tư duy"',
        description: 'Bộ sách giúp học sinh mất gốc lấy lại căn bản trong 30 ngày.'
      }
    ]
  },
  {
    id: 'teacher-3',
    fullName: 'GV. Nguyễn Thị Hiền',
    subject: 'physics',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiCHaR8B7lUE3lWUAJEU4NTnP2_XDy-0Da1ARx6oHmDTNDEgVtmcXs10wNSFnYci8CKjdsuXsSD2hbrHEum44y4kEhRw-jl2o4A6DBj5DuYZyODh4tOmdCcwg_oPhmr0S-Ig-iloXVEecnPm4FxwcGLWoxSpNiZb-LkksFvxx_T-owie9-rWihETMS1ToPrAFAxcYyIA8PHMUmnno0HBnWqC85VPqRZkKYI4pg46Z6PXOTfjw6_UWcfwx-YRZ3g73ZL04qjBeiT6o',
    title: 'Thạc sĩ Vật Lý',
    bio: 'Giảng viên tiêu biểu với phương pháp dạy học trực quan và ứng dụng thực tiễn.',
    achievements: [
      {
        id: 'ach-6',
        year: 'Kinh nghiệm',
        title: 'Giáo viên Vật Lý Chuyên sâu',
        description: 'Hơn 8 năm luyện thi THPT Quốc Gia, giúp học sinh nắm vững bản chất hiện tượng vật lý.'
      }
    ]
  }
];

export const mockCourses: CourseSummary[] = [
  {
    id: 'course-math-12-adv',
    title: 'Giải Tích Nâng Cao: Từ Cơ Bản Đến Thủ Khoa',
    slug: 'toan-hoc-nang-cao-giai-tich-hinh-hoc',
    description: 'Chương trình ôn luyện toàn diện được thiết kế bởi các chuyên gia hàng đầu, tập trung vào tư duy logic và kỹ thuật giải nhanh trắc nghiệm.',
    subject: 'math',
    grade: 12,
    teacher: {
      id: 'teacher-2',
      fullName: 'ThS. Nguyễn Thành Trung',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc'
    },
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6v-5ho_dbCv7F9m85XNArev25lzqCQsB63igfRHXRYQRXT4oT-GePLTQLBJt_Le3n2v6xPKayQ4b15pH4FWK-_FaCnHkAA1CQuuj5Jka3Af3rcRHChUNQBLpzRhAWnYV4WmvzSAxaGGmIc7FYgdSwCWrAc-oV9mR-IZPWrLvUjxYsdKJh-PMikdGKdISNWSdy36k5klU7nMk8u_7HWC2aY3c3DYHgtfILjCMwR-hCnv_OAbvV0zR6Adw8kCc6dk8A_cfHp98tkk',
    price: 1200000,
    salePrice: 850000,
    status: 'published',
    lessonsCount: 42,
    isFeatured: true,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z'
  },
  {
    id: 'course-physics-11',
    title: 'Quang Hình Học & Dòng Điện Xoay Chiều',
    slug: 'vat-ly-11-dien-tu-truong-quang-hoc',
    description: 'Toàn bộ lý thuyết và bài tập giải thích cặn kẽ về từ trường, điện tích và hệ thống quang hình học.',
    subject: 'physics',
    grade: 11,
    teacher: {
      id: 'teacher-3',
      fullName: 'GV. Nguyễn Thị Hiền',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiCHaR8B7lUE3lWUAJEU4NTnP2_XDy-0Da1ARx6oHmDTNDEgVtmcXs10wNSFnYci8CKjdsuXsSD2hbrHEum44y4kEhRw-jl2o4A6DBj5DuYZyODh4tOmdCcwg_oPhmr0S-Ig-iloXVEecnPm4FxwcGLWoxSpNiZb-LkksFvxx_T-owie9-rWihETMS1ToPrAFAxcYyIA8PHMUmnno0HBnWqC85VPqRZkKYI4pg46Z6PXOTfjw6_UWcfwx-YRZ3g73ZL04qjBeiT6o'
    },
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGJQRo8kdV4S4CczdPHUjlMoIrBDUfjwxO6OxeJU_Qip21FzNx_K3rMB6q0PpOmwsp2mBBYPVXKVWCzJtNJRxy6FG94KLJ-o-89Jrrt-dfGP9BBi4BNwFozh50LfqmqxUEYl5xpdD_0hIQL8sHnnBDxvhCoUvumPXns9vtEzvfxdWA-DPgTaXJGtkVKef0FEYc9clMzUsFKwT9qbsY06b7b5QpwTXJIX_Ah9-dKmYfLreadZy1JOMiW2G5_c6V6AE9VrZVVDzXqhQ',
    price: 980000,
    salePrice: 690000,
    status: 'published',
    lessonsCount: 35,
    isFeatured: true,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z'
  },
  {
    id: 'course-literature-11',
    title: 'Tư Duy Văn Học: Phân Tích & Cảm Thụ Tác Phẩm',
    slug: 'ngu-van-11-phan-tich-cam-thu-tac-pham',
    description: 'Rèn luyện kỹ năng phân tích thơ, truyện ngắn, lập luận văn học mạch lạc để chinh phục điểm 9+ Ngữ văn.',
    subject: 'literature',
    grade: 11,
    teacher: {
      id: 'teacher-1',
      fullName: 'Cô Nguyễn Minh Anh',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLYsdq-Ohrk1ef54qctVaXrp6UbsI743djPoBJ4fruZDVRG9-Nc0qSLlLkFQBpKCDsyddkz2BQJuJBPJfom9SxHG4uFdbP6UAzNY7Ls4SaREtiMMUje7QEeymQCxSnL2ZXBHEpe0-SrVqsJpUOP65SCUr4Do67uLSSE1czw4vn-xE8zJE6BR3JCeNUu8UEleetLERgZpPAQy87lolUnA1aSaiBWGNU18Ep6mDgLBPQUpe1Pn3HohvfEi3HBMG6iv7UbWLXbr2TcLs'
    },
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT5WffzErKRVnG_p09zXyozZAVSAUWQfs4dIbYyON82WDYmD34ZVWLQchKThnEx0Se4gZ3S8E4m8yzmlyuMLhbHpSdV1PK_RYidZCwhtIb-ewFi0YulCPDKoaFgeor6JxcfkQ8WLbXyJ17Lz1196Fq9eA3_CZlG4LCTtFPJuDObvDwEWWz5m-EsL6tchH6UyTM9YqutAOCJX0ZOuKajGTvL_rSVteOIBgvO85HzjzyBrUbL4a9vNntRG7raW5trbax9Iska5ftS9Q',
    price: 720000,
    salePrice: null,
    status: 'published',
    lessonsCount: 30,
    isFeatured: true,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z'
  },
  {
    id: 'course-chemistry-11',
    title: 'Hóa Học Hữu Cơ Toàn Diện',
    slug: 'hoa-hoc-huu-co-toan-dien',
    description: 'Bảo bối thần kỳ giúp học sinh lấy gốc và nâng cao toàn bộ kiến thức hóa hữu cơ lớp 11.',
    subject: 'chemistry',
    grade: 11,
    teacher: {
      id: 'teacher-3',
      fullName: 'GV. Nguyễn Thị Hiền',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiCHaR8B7lUE3lWUAJEU4NTnP2_XDy-0Da1ARx6oHmDTNDEgVtmcXs10wNSFnYci8CKjdsuXsSD2hbrHEum44y4kEhRw-jl2o4A6DBj5DuYZyODh4tOmdCcwg_oPhmr0S-Ig-iloXVEecnPm4FxwcGLWoxSpNiZb-LkksFvxx_T-owie9-rWihETMS1ToPrAFAxcYyIA8PHMUmnno0HBnWqC85VPqRZkKYI4pg46Z6PXOTfjw6_UWcfwx-YRZ3g73ZL04qjBeiT6o'
    },
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGJQRo8kdV4S4CczdPHUjlMoIrBDUfjwxO6OxeJU_Qip21FzNx_K3rMB6q0PpOmwsp2mBBYPVXKVWCzJtNJRxy6FG94KLJ-o-89Jrrt-dfGP9BBi4BNwFozh50LfqmqxUEYl5xpdD_0hIQL8sHnnBDxvhCoUvumPXns9vtEzvfxdWA-DPgTaXJGtkVKef0FEYc9clMzUsFKwT9qbsY06b7b5QpwTXJIX_Ah9-dKmYfLreadZy1JOMiW2G5_c6V6AE9VrZVVDzXqhQ',
    price: 1100000,
    salePrice: 750000,
    status: 'published',
    lessonsCount: 40,
    isFeatured: false,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z'
  },
  {
    id: 'course-english-11',
    title: 'Luyện Thi IELTS 6.5+ Cho Học Sinh Cấp 3',
    slug: 'luyen-thi-ielts-6-5-cho-hoc-sinh-cap-3',
    description: 'Chương trình được thiết kế đặc biệt bám sát đề thi IELTS học thuật và cấu trúc đề thi THPTQG.',
    subject: 'english',
    grade: 11,
    teacher: {
      id: 'teacher-1',
      fullName: 'Cô Nguyễn Minh Anh',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLYsdq-Ohrk1ef54qctVaXrp6UbsI743djPoBJ4fruZDVRG9-Nc0qSLlLkFQBpKCDsyddkz2BQJuJBPJfom9SxHG4uFdbP6UAzNY7Ls4SaREtiMMUje7QEeymQCxSnL2ZXBHEpe0-SrVqsJpUOP65SCUr4Do67uLSSE1czw4vn-xE8zJE6BR3JCeNUu8UEleetLERgZpPAQy87lolUnA1aSaiBWGNU18Ep6mDgLBPQUpe1Pn3HohvfEi3HBMG6iv7UbWLXbr2TcLs'
    },
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6v-5ho_dbCv7F9m85XNArev25lzqCQsB63igfRHXRYQRXT4oT-GePLTQLBJt_Le3n2v6xPKayQ4b15pH4FWK-_FaCnHkAA1CQuuj5Jka3Af3rcRHChUNQBLpzRhAWnYV4WmvzSAxaGGmIc7FYgdSwCWrAc-oV9mR-IZPWrLvUjxYsdKJh-PMikdGKdISNWSdy36k5klU7nMk8u_7HWC2aY3c3DYHgtfILjCMwR-hCnv_OAbvV0zR6Adw8kCc6dk8A_cfHp98tkk',
    price: 1500000,
    salePrice: 990000,
    status: 'published',
    lessonsCount: 50,
    isFeatured: false,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z'
  },
  {
    id: 'course-history-11',
    title: 'Lịch Sử Việt Nam Cận Hiện Đại',
    slug: 'lich-su-viet-nam-can-hien-dai',
    description: 'Hệ thống hóa toàn bộ các mốc lịch sử quan trọng bằng sơ đồ tư duy, giúp học bài siêu nhanh.',
    subject: 'history',
    grade: 11,
    teacher: {
      id: 'teacher-2',
      fullName: 'ThS. Nguyễn Thành Trung',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc'
    },
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT5WffzErKRVnG_p09zXyozZAVSAUWQfs4dIbYyON82WDYmD34ZVWLQchKThnEx0Se4gZ3S8E4m8yzmlyuMLhbHpSdV1PK_RYidZCwhtIb-ewFi0YulCPDKoaFgeor6JxcfkQ8WLbXyJ17Lz1196Fq9eA3_CZlG4LCTtFPJuDObvDwEWWz5m-EsL6tchH6UyTM9YqutAOCJX0ZOuKajGTvL_rSVteOIBgvO85HzjzyBrUbL4a9vNntRG7raW5trbax9Iska5ftS9Q',
    price: 550000,
    salePrice: null,
    status: 'published',
    lessonsCount: 20,
    isFeatured: false,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z'
  }
];

export const mockCourseDetails: Record<string, CourseDetail> = {
  'toan-hoc-nang-cao-giai-tich-hinh-hoc': {
    ...mockCourses[0],
    relatedCourses: mockCourses
      .filter((course) => course.id !== mockCourses[0].id && course.grade === mockCourses[0].grade && course.isFeatured)
      .slice(0, 3),
    chapters: [
      {
        id: 'chap-1',
        title: 'Chương I: Ứng dụng đạo hàm để khảo sát hàm số',
        orderIndex: 1,
        lessons: [
          { id: 'les-1-1', title: 'Sự đồng biến, nghịch biến của hàm số', type: 'video', videoType: 'youtube', durationSec: 2720, orderIndex: 1, allowPreview: true },
          { id: 'les-1-2', title: 'Cực trị của hàm số - Các dạng bài tập trọng tâm', type: 'video', videoType: 'youtube', durationSec: 3492, orderIndex: 2, allowPreview: false },
          { id: 'les-1-3', title: 'Giá trị lớn nhất và nhỏ nhất của hàm số', type: 'video', videoType: 'youtube', durationSec: 2525, orderIndex: 3, allowPreview: false }
        ]
      },
      {
        id: 'chap-2',
        title: 'Chương II: Hàm số Lũy thừa, Mũ và Logarit',
        orderIndex: 2,
        lessons: [
          { id: 'les-2-1', title: 'Lũy thừa và các phép toán cơ bản', type: 'video', videoType: 'youtube', durationSec: 1800, orderIndex: 1, allowPreview: false },
          { id: 'les-2-2', title: 'Hàm số mũ và hàm số logarit', type: 'video', videoType: 'youtube', durationSec: 2400, orderIndex: 2, allowPreview: false }
        ]
      },
      {
        id: 'chap-3',
        title: 'Chương III: Nguyên hàm và Tích phân',
        orderIndex: 3,
        lessons: [
          { id: 'les-3-1', title: 'Định nghĩa nguyên hàm và tính chất', type: 'video', videoType: 'youtube', durationSec: 2100, orderIndex: 1, allowPreview: false }
        ]
      }
    ]
  }
};

// Fallback generator for detail pages to prevent crash
export function getCourseDetail(slug: string): CourseDetail {
  if (mockCourseDetails[slug]) return mockCourseDetails[slug];
  const summary = mockCourses.find(c => c.slug === slug) || mockCourses[0];
  return {
    ...summary,
    relatedCourses: mockCourses
      .filter((course) => course.id !== summary.id && course.grade === summary.grade && course.isFeatured)
      .slice(0, 3),
    chapters: [
      {
        id: 'chap-default-1',
        title: 'Chương 1: Kiến thức nền tảng và trọng tâm',
        orderIndex: 1,
        lessons: [
          { id: 'les-def-1', title: 'Bài học mở đầu: Phương pháp học hiệu quả', type: 'video', videoType: 'youtube', durationSec: 1200, orderIndex: 1, allowPreview: true },
          { id: 'les-def-2', title: 'Tổng quan các dạng bài tập thi cử', type: 'video', videoType: 'youtube', durationSec: 2400, orderIndex: 2, allowPreview: false }
        ]
      }
    ]
  };
}

export const mockBlogPosts: BlogPostSummary[] = [
  {
    id: 'blog-1',
    title: 'Cách xây dựng kỷ luật tự thân trong môi trường học tập số hóa',
    slug: 'cach-xay-dung-ky-luat-tu-than-trong-moi-truong-hoc-tap-so-hoa',
    excerpt: 'Hành trình làm chủ kiến thức đòi hỏi nhiều hơn là chỉ những bài giảng hay. Khám phá chiến lược 5 bước để duy trì sự tập trung tuyệt đối khi tự học.',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTV3P9BCGpwU2FyBY2afXI9kSj6HNGaoxgh-S20Yj2fzx8t40zAA8OVzZ7l3YJThKhgClPrxNQE_gnrxoDY7JIiy7QuZ_JtS0tof3eNfGbxdmjAjGEFwTZSkK6OslNDEQnPcEOpLyZ0pU6aktj-kYPGIpgSR-FNXHFXaDBWU0XduLYoDd0o8_ttRj9TVZtVik_CIjJVC39UnQD5GSg0UGoviZZmPyBNWvcDJQzZKMtFd0xNkYffCu8ab7eVwuweoUd-xYulDa7TLs',
    author: {
      id: 'teacher-4',
      fullName: 'TS. Minh Hoàng',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChmNniuk3ysuYXoyz-q2M6QjLF00QVnIrTtRrXxU7V2FjwZ1Vvg9mytKyHSC0bu2XxhgoeCRZQ74TiGyxfMJ_LuqlSoCL8SFrnh701erP785yuK-pOPPgdGWWwGO6sPOFtEr9-q0hdZfmL9peBp9W0hGrEOQ73SRSOy3wDCbKYTdHPkSOLAZi7jnxMMCbDv4OJgH9yPbNZ8zMkgrGPz95KIdGVRw0vT95hYYUTppUsLolVY_m3HcDbXWG5oDgb6kkzKnqbvJHzLvM'
    },
    publishedAt: '2026-05-25T00:00:00.000Z',
    readingMinutes: 8,
    tags: ['Phương pháp học', 'Kỹ năng mềm']
  },
  {
    id: 'blog-2',
    title: 'Tư duy phản biện: Kỹ năng sống còn cho thế kỷ 21',
    slug: 'tu-duy-phan-bien-ky-nang-song-con-cho-the-ky-21',
    excerpt: 'Đừng chỉ tiếp nhận thông tin, hãy học cách đặt câu hỏi. Một cái nhìn đa chiều sẽ mở ra những cơ hội mới cho tư duy của bạn.',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHXKO3GyJdiCIa7kuhzVfl4ktgj3R1iSMNlw-q0Qnlx2_EoBF86ORkI85JD-LjNh6JfdleL42lkQc8-PI_ljIPDi5yml4782o8-CS8KZ7EQwEFsdc1VHFaZ2rrop0pD5B5f7kAfxihjVubls--7ExFdd8ps2EmUYU0iZGTMzXEzfKbP7kKW9ztlPgZ1YOI7ZV2De7Uj2V6Nlp5F6VSyOUBinn675nFwbS-n22Xu-LIyxXjCIERhXhpyXb7-QA8VdE2oirSZqR-psM',
    author: {
      id: 'teacher-2',
      fullName: 'ThS. Nguyễn Thành Trung',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4S8fKaZ0l5L5a4MxXU18NwexnR9VACoZKIdT5JT8b-BOU953aO_y_3U9NIyJGV47zp6CMub4v3QGNs1EOaxUk0Y-kkgYAEdfHMMNoQbV3zk4n0Uo_5moY7r5QeohMkkUH18rj-P8dOgusEcaNRkypCRkTxvfkJouBeBv28kbaV6DQESS8REsK6gXQ55xL-UMJoCH8CPpn8Vit685byFTXIh9DkdzOoSlFDFEY_7y3lAS7eeQRsrTisXLKDlqoDO8Qrl8bDtbeqTc'
    },
    publishedAt: '2026-05-24T00:00:00.000Z',
    readingMinutes: 5,
    tags: ['Kỹ năng mềm']
  },
  {
    id: 'blog-3',
    title: 'AI trong giáo dục: Bạn đồng hành hay đối thủ?',
    slug: 'ai-trong-giao-duc-ban-dong-hanh-hay-doi-thu',
    excerpt: 'Phân tích sâu về tác động của trí tuệ nhân tạo đến cách chúng ta học tập và giảng dạy trong tương lai gần.',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8B5Ggcq_uqyTTQYckcdOiBHGXN04utl4nld5y1IxpFC_5szuHjNup8by-00oc5VkugCklvYG8oRwAQvqG_xJ_sIHAad9zN7yruXQ9h3gqU4-TNwj4XqRVi_WnkS_dlyKeTjdrGbdIH8ntUCi5EloxoLqVZGLLu8hwb9sScm7kjbKrqFnpywihzS8chGRva4aRpS8-ISJtesNzLimrMxA022YqeGTtX7XYbjrTcmn6eg7jtv-8kapCMSWt2CNyc_-rJvx0QSHYpR4',
    author: {
      id: 'teacher-2',
      fullName: 'ThS. Nguyễn Thành Trung'
    },
    publishedAt: '2026-05-23T00:00:00.000Z',
    readingMinutes: 12,
    tags: ['Công nghệ giáo dục']
  },
  {
    id: 'blog-4',
    title: 'Nghệ thuật ghi chép hiệu quả bằng phương pháp Cornell',
    slug: 'nghe-thuat-ghi-chep-hieu-qua-bang-phuong-phap-cornell',
    excerpt: 'Tối ưu hóa khả năng ghi nhớ và ôn tập thông qua cách hệ thống hóa thông tin ngay trong quá trình học tập trên lớp.',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnK7RM_JplJ8ErbPh26oJDNH76O8byDNGvq0eS0RVELZZHYOHeqXZvpxWuF4Hf-L5FPOykBGIAFWUlKhCyjlPzAknp8-S9FyZhhPxECih51jJa0EZ9CFFG9oYxtBjMoTQz1WaoqRVj0GURlsNf8Ynw-_CJsRP9ETcOpiUd-wkNN1RF1ZeHbPG3acBDzie39skFdlZqxwYZm0eoQrPCzKGEkEMQLkr7gWgv7i-tPwmOpdtCYgNUbR6WPlSyQMt4ZSUuXnGisr6jDsQ',
    author: {
      id: 'teacher-5',
      fullName: 'Nguyễn Lan Anh',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg7FB5R6z50g9gpASYEpwCMfZdZNwIhnSSfMtsyrPIT20QjflCmIlf3-qpCGTEbJCcZy2HyOp4g22hlUJGbsnqDKOUmb3Nxgj3Lwwvp0HZNeHBiryHf3gKutChTD8YVjhkV6-dqDHJYcOI8PIf1-hg6ZKgJKkWbCfl9Jes65MlX7F3D1d2yIuOESdXxBAIZdq8bLZKXONGTmgruo5KThmhPndmpVcX9Gv4EWNDEthRq6Kmit5YJpgTv2z6L7F8XCrtGESmthC-Lsg'
    },
    publishedAt: '2026-05-22T00:00:00.000Z',
    readingMinutes: 6,
    tags: ['Kỹ năng mềm', 'Phương pháp học']
  },
  {
    id: 'blog-5',
    title: 'Lộ trình học tập toàn diện cho ngành Khoa học Dữ liệu',
    slug: 'lo-trinh-hoc-tap-toan-dien-cho-nganh-khoa-hoc-du-lieu',
    excerpt: 'Từ toán học cơ bản đến Machine Learning nâng cao, đây là những gì bạn cần chuẩn bị để bước chân vào ngành khoa học dữ liệu.',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXChmeVIw5oG9HaPnwWzhhZ1gdzMEJy5zK8EU0Ha-xX68QmlFbViEudoELyRTRGLL500I5yKCa8Xc4WgOEbXhD2khtIAmCaD1jSHZvAvRxW0e-vE0eSNppmG1qT7A9eAJJEXD4gbz1dknGjs92s9VSBdE2JiQQoXliCEEHGX6SipPcA4HxsvwAiNyMGZHePT2kB4szhAxX04nEZa88df3CEjVYkM0PMUk6wTaM6QPrjZl2pZo6AWw11H8yYGubUUdpB6Q_YC7tTRM',
    author: {
      id: 'teacher-6',
      fullName: 'Lê Minh Tâm',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFYHvJRCPKP8dz46EV_E25OhclgB1yrlRVHF6vfjAVIbhpnAgYiOKzk92CcFezg44kQIaY_Yd5ObHwocbWCBmpM8dXWKly80k-wiLLRXsGOEFWvFvV_FgG0e5dnMwwxzFl9ThyyiQzXhEpFuGlR6KnobRHjtG8KoLBiyeJgKvNSDfm56F_XUPqaX5Pj35TMhrrBX9JbrXqE-COj20MKcKfuLK1p3bS-42aUu6IMcRUyrP6lHftkzyinjUw7DUf8LNK9CFG3__tbeE'
    },
    publishedAt: '2026-05-21T00:00:00.000Z',
    readingMinutes: 15,
    tags: ['Hướng nghiệp']
  },
  {
    id: 'blog-6',
    title: 'Vượt qua nỗi sợ khi nói tiếng Anh trước công chúng',
    slug: 'vuot-qua-noi-so-khi-noi-tieng-anh-truoc-cong-chung',
    excerpt: 'Chia sẻ về tâm lý học ngôn ngữ và các bài tập thực hành giúp bạn tự tin nói tiếng Anh trôi chảy và lôi cuốn người nghe.',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC34lbxE5vuyQV5vwkmxqlL1NOb8-xLh8JKMpEDcv5VbrvEPjfhGvBJ6o1-BHd6WHtbtl1HkBmgifGOrwpXIAKkkTTtilmoxFrUvtloKdVWhAAbLJgGygqijV9ySvpNv6Y0_AahM75mRy0hZYF7AdHsKeSyZ2ixomewClBOuv_egd1_LzmL_zbcTQudowCP7oYRbYnYQG5xjWwBN-ptJg8qNPpeS9lV2K3O-AwWrQQydQi7N4Oof_qxzpJ6L2dewCAlzSqF77YyMe8',
    author: {
      id: 'teacher-7',
      fullName: 'Trần Thu Hà',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnoMy2mblWfRaRsLLUg25LNrui0pWYNFWRSUknEvTq-OYTHp4RuxMGQ81JKOmeewbWTcOSoIywOYVL4s0kfQYyvKG-tF49ILlKMXKf5dKPK4i2pKw68QzGQ4dzylvbbwoCQte6yIytTDLKnp7WEW9rT8o0k3dAdsqwfdczpm88BL1A-zzbyNKwN4-jMvcDnfsNWBAbdwLkYMzpiSikkLxYEXfwJjENp6Qz84GrHqnK10wVcsJEevv91ymiQDKhklt_od1LJWe_uKw'
    },
    publishedAt: '2026-05-20T00:00:00.000Z',
    readingMinutes: 10,
    tags: ['Phương pháp học']
  }
];

export const mockBlogDetails: Record<string, BlogPostDetail> = {
  'nghe-thuat-ghi-chep-hieu-qua-bang-phuong-phap-cornell': {
    ...mockBlogPosts[3],
    relatedPosts: mockBlogPosts.filter((post) => post.id !== mockBlogPosts[3].id).slice(0, 3),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Nghị luận văn học luôn là một trong những phần "khó nhằn" nhất trong đề thi môn Ngữ văn. Để đạt điểm cao, không chỉ cần cảm xúc mà còn cần một tư duy logic chặt chẽ. Việc lập dàn ý chính là bước quan trọng nhất để bạn quản lý thời gian và cấu trúc bài viết của mình một cách tối ưu.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'I. Vì sao cần lập dàn ý?' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Nhiều học sinh thường bỏ qua bước này vì sợ tốn thời gian. Tuy nhiên, lập dàn ý thực chất giúp bạn tiết kiệm thời gian viết bằng cách tránh việc phải dừng lại suy nghĩ "viết gì tiếp theo" hoặc tệ hơn là phải xóa đi viết lại do lạc đề.'
            }
          ]
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'text',
              text: 'Lập dàn ý là xương sống giúp bài viết không bị lạc đề, đảm bảo sự mạch lạc và logic trong từng luận điểm.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'II. Các bước lập dàn ý chi tiết' }]
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Xác định yêu cầu đề bài: ', marks: [{ type: 'bold' }] },
                    { type: 'text', text: 'Đề bài yêu cầu phân tích nhân vật, phân tích tác phẩm hay so sánh văn học?' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Xây dựng hệ thống luận điểm: ', marks: [{ type: 'bold' }] },
                    { type: 'text', text: 'Chia nhỏ nội dung cần phân tích thành các ý lớn, tương ứng với các đoạn văn trong thân bài.' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Tìm luận cứ và dẫn chứng: ', marks: [{ type: 'bold' }] },
                    { type: 'text', text: 'Trích dẫn các chi tiết, câu thơ hoặc nhận định văn học để làm sáng tỏ luận điểm.' }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'image',
          attrs: {
            src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqLw_CsGz-jxnnVYaN5sj5U6QtNmlJMgcKZhjPIBPQs4NFfLgFzYeaoQ5Y6BxXz_qnebxBUqpCMRpHiYV7K33dclE4x5h7T_Hpqsj7VjXkAn7H5u0wQNe_zaQHEku5C8UlPJHqvdlgvID7ucCMTNBJa_ZOJjbgU85CDwm7lPoznjeosFeMPfg6J-YewuQ5mrhkMTulUJZ5V00TJAAdchrBzJnHJRMmTPLsTisjVoGNNSWsIpb3SUkS5oZF_dkqNwC9OkSFgceOtB4',
            alt: 'Literature video class'
          }
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'III. Công thức chung cho Nghị luận Văn học' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Cấu trúc điểm 10 bao gồm: Mở bài + Thân bài + Kết luận. Đảm bảo việc chuyển ý mượt mà giữa các phần.'
            }
          ]
        }
      ]
    }
  }
};

export function getBlogDetail(slug: string): BlogPostDetail {
  if (mockBlogDetails[slug]) return mockBlogDetails[slug];
  // Find summary fallback
  const summary = mockBlogPosts.find(p => p.slug === slug) || mockBlogPosts[0];
  // Return standard content
  return {
    ...summary,
    relatedPosts: mockBlogPosts.filter((post) => post.id !== summary.id).slice(0, 3),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Nội dung chi tiết của bài viết đang được biên soạn và cập nhật liên tục bởi các giáo viên nhiều kinh nghiệm tại hệ thống HH Education. Cảm ơn bạn đã quan tâm theo dõi.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Vì sao phương pháp học này lại cần thiết?' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Bằng việc tiếp thu một phương pháp tư duy đúng đắn, học sinh có thể rút ngắn thời gian ghi nhớ đến 50%, đồng thời giữ kiến thức sâu sắc hơn cho các kỳ thi căng thẳng phía trước.'
            }
          ]
        }
      ]
    }
  };
}
