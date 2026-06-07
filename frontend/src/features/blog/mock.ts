import { BlogPostSummary, BlogPostDetail } from './types';

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
  const summary = mockBlogPosts.find(p => p.slug === slug) || mockBlogPosts[0];
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
