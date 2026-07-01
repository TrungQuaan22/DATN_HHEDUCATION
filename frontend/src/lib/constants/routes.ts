export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    COURSES: '/courses',
    COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
    BLOG: '/blog',
    BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    COURSES: '/admin/courses',
    COURSE_NEW: '/admin/courses/new',
    COURSE_EDIT: (id: string) => `/admin/courses/${id}/edit`,
    COURSE_BUILDER: (id: string) => `/admin/courses/${id}/builder`,
    ASSESSMENTS: '/admin/assessments',
    BLOG_POSTS: '/admin/blog-posts',
    BLOG_POST_NEW: '/admin/blog-posts/new',
    BLOG_POST_EDIT: (id: string) => `/admin/blog-posts/${id}/edit`,
    ORDERS: '/admin/orders',
    PAYMENT_TRANSACTIONS: '/admin/payment-transactions',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    SUPPORT: '/admin/support',
  },
  LEARNING: {
    DASHBOARD: '/student',
    COURSES: '/student/courses',
    PRACTICE: '/student/practice',
    ASSESSMENTS: '/student/assessments',
  }
} as const;
