import { hash } from 'bcrypt'

import {
  CourseStatus,
  EnrollmentSource,
  LessonType,
  MediaStatus,
  MediaType,
  MediaVisibility,
  PrismaClient,
  Subject,
  UserRole,
  UserStatus,
  VideoType
} from '@prisma/client'

const prisma = new PrismaClient()

async function seedPasswordHash(password: string): Promise<string> {
  const saltRounds = 10
  return await hash(password, saltRounds)
}
const users = [
  {
    email: 'admin@hheducation.local',
    fullName: 'System Admin',
    role: UserRole.admin,
    status: UserStatus.active
  },
  {
    email: 'teacher@hheducation.local',
    fullName: 'Demo Teacher',
    role: UserRole.teacher,
    status: UserStatus.active
  },
  {
    email: 'student.active@hheducation.local',
    fullName: 'Active Student',
    role: UserRole.student,
    status: UserStatus.active
  },
  {
    email: 'student.pending@hheducation.local',
    fullName: 'Pending Verification Student',
    role: UserRole.student,
    status: UserStatus.pending_verification
  },
  {
    email: 'student.banned@hheducation.local',
    fullName: 'Banned Student',
    role: UserRole.student,
    status: UserStatus.banned
  }
]

const demoCourses = [
  {
    title: 'Toan 12 - Nen tang ham so',
    slug: 'toan-12-nen-tang-ham-so',
    description:
      'Khoa hoc giup hoc sinh lop 12 nam chac ham so, dao ham va cac dang bai thuong gap trong ky thi.',
    subject: Subject.math,
    grade: 12,
    price: 499000,
    salePrice: 299000,
    isFeatured: true,
    thumbnailObjectKey: 'seed/course-thumbnails/toan-12-ham-so.jpg',
    chapters: [
      {
        title: 'Tong quan ham so',
        lessons: [
          {
            title: 'Ham so va tap xac dinh',
            type: LessonType.video,
            videoType: VideoType.youtube,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationSec: 720,
            allowPreview: true
          },
          {
            title: 'Bang bien thien co ban',
            type: LessonType.document,
            description: 'Tom tat cac buoc lap bang bien thien va loi sai thuong gap.',
            allowPreview: true
          }
        ]
      },
      {
        title: 'Dao ham va ung dung',
        lessons: [
          {
            title: 'Quy tac tinh dao ham',
            type: LessonType.video,
            videoType: VideoType.youtube,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationSec: 900,
            allowPreview: false
          },
          {
            title: 'Cuc tri cua ham so',
            type: LessonType.video,
            videoType: VideoType.youtube,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationSec: 1020,
            allowPreview: false
          }
        ]
      }
    ]
  },
  {
    title: 'Ngu van 12 - Doc hieu va nghi luan',
    slug: 'ngu-van-12-doc-hieu-nghi-luan',
    description: 'He thong hoa ky nang doc hieu, phan tich tac pham va viet bai nghi luan van hoc.',
    subject: Subject.literature,
    grade: 12,
    price: 399000,
    salePrice: 249000,
    isFeatured: true,
    thumbnailObjectKey: 'seed/course-thumbnails/ngu-van-12.jpg',
    chapters: [
      {
        title: 'Doc hieu van ban',
        lessons: [
          {
            title: 'Cach doc cau hoi doc hieu',
            type: LessonType.video,
            videoType: VideoType.youtube,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationSec: 660,
            allowPreview: true
          },
          {
            title: 'Nhan dien phong cach ngon ngu',
            type: LessonType.document,
            description: 'Bang tong hop dau hieu nhan dien phong cach ngon ngu.',
            allowPreview: false
          }
        ]
      }
    ]
  },
  {
    title: 'Tieng Anh 11 - Grammar for Tests',
    slug: 'tieng-anh-11-grammar-for-tests',
    description:
      'On tap ngu phap cot loi lop 11 qua vi du ngan, bai tap nhanh va loi giai chi tiet.',
    subject: Subject.english,
    grade: 11,
    price: 299000,
    salePrice: null,
    isFeatured: false,
    thumbnailObjectKey: 'seed/course-thumbnails/tieng-anh-11.jpg',
    chapters: [
      {
        title: 'Core grammar',
        lessons: [
          {
            title: 'Tenses review',
            type: LessonType.video,
            videoType: VideoType.youtube,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationSec: 780,
            allowPreview: true
          },
          {
            title: 'Relative clauses',
            type: LessonType.video,
            videoType: VideoType.youtube,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationSec: 840,
            allowPreview: false
          }
        ]
      }
    ]
  }
]

async function upsertSeedImage(objectKey: string, originalName: string, uploadedById: string) {
  return prisma.media.upsert({
    where: {
      objectKey
    },
    update: {
      status: MediaStatus.ready,
      visibility: MediaVisibility.public,
      uploadedById
    },
    create: {
      type: MediaType.image,
      status: MediaStatus.ready,
      visibility: MediaVisibility.public,
      originalName,
      objectKey,
      mimeType: 'image/jpeg',
      sizeBytes: 102400,
      uploadedById
    }
  })
}

async function upsertSeedCourse(data: {
  title: string
  slug: string
  description: string
  subject: Subject
  grade: number
  teacherId: string
  thumbnailMediaId: string
  thumbnailObjectKey: string
  price: number
  salePrice: number | null
  isFeatured: boolean
}) {
  const existingCourse = await prisma.course.findFirst({
    where: {
      slug: data.slug,
      deletedAt: null
    }
  })

  const courseData = {
    title: data.title,
    description: data.description,
    subject: data.subject,
    grade: data.grade,
    teacherId: data.teacherId,
    thumbnailMediaId: data.thumbnailMediaId,
    thumbnailObjectKey: data.thumbnailObjectKey,
    price: data.price,
    salePrice: data.salePrice,
    totalLessons: 0,
    status: CourseStatus.published,
    isFeatured: data.isFeatured
  }

  if (existingCourse) {
    return prisma.course.update({
      where: {
        id: existingCourse.id
      },
      data: courseData
    })
  }

  return prisma.course.create({
    data: {
      ...courseData,
      slug: data.slug
    }
  })
}

async function main() {
  const passwordHash = await seedPasswordHash('Password123!')
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        passwordHash
      },
      create: {
        ...user,
        passwordHash
      }
    })
  }

  const teacher = await prisma.user.findUniqueOrThrow({
    where: {
      email: 'teacher@hheducation.local'
    }
  })
  const student = await prisma.user.findUniqueOrThrow({
    where: {
      email: 'student.active@hheducation.local'
    }
  })

  let seededCoursesCount = 0
  let seededLessonsCount = 0

  for (const courseSeed of demoCourses) {
    const thumbnail = await upsertSeedImage(
      courseSeed.thumbnailObjectKey,
      `${courseSeed.slug}.jpg`,
      teacher.id
    )

    const course = await upsertSeedCourse({
      title: courseSeed.title,
      slug: courseSeed.slug,
      description: courseSeed.description,
      subject: courseSeed.subject,
      grade: courseSeed.grade,
      teacherId: teacher.id,
      thumbnailMediaId: thumbnail.id,
      thumbnailObjectKey: thumbnail.objectKey,
      price: courseSeed.price,
      salePrice: courseSeed.salePrice,
      isFeatured: courseSeed.isFeatured
    })

    let courseLessonCount = 0

    for (const [chapterIndex, chapterSeed] of courseSeed.chapters.entries()) {
      const chapter = await prisma.chapter.upsert({
        where: {
          courseId_orderIndex: {
            courseId: course.id,
            orderIndex: chapterIndex + 1
          }
        },
        update: {
          title: chapterSeed.title,
          deletedAt: null
        },
        create: {
          courseId: course.id,
          title: chapterSeed.title,
          orderIndex: chapterIndex + 1
        }
      })

      for (const [lessonIndex, lessonSeed] of chapterSeed.lessons.entries()) {
        await prisma.lesson.upsert({
          where: {
            chapterId_orderIndex: {
              chapterId: chapter.id,
              orderIndex: lessonIndex + 1
            }
          },
          update: {
            title: lessonSeed.title,
            type: lessonSeed.type,
            description: 'description' in lessonSeed ? lessonSeed.description : null,
            videoType: 'videoType' in lessonSeed ? lessonSeed.videoType : null,
            youtubeUrl: 'youtubeUrl' in lessonSeed ? lessonSeed.youtubeUrl : null,
            durationSec: 'durationSec' in lessonSeed ? lessonSeed.durationSec : null,
            allowPreview: lessonSeed.allowPreview,
            deletedAt: null
          },
          create: {
            chapterId: chapter.id,
            title: lessonSeed.title,
            type: lessonSeed.type,
            description: 'description' in lessonSeed ? lessonSeed.description : null,
            videoType: 'videoType' in lessonSeed ? lessonSeed.videoType : null,
            youtubeUrl: 'youtubeUrl' in lessonSeed ? lessonSeed.youtubeUrl : null,
            durationSec: 'durationSec' in lessonSeed ? lessonSeed.durationSec : null,
            allowPreview: lessonSeed.allowPreview,
            orderIndex: lessonIndex + 1
          }
        })

        courseLessonCount += 1
        seededLessonsCount += 1
      }
    }

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id
        }
      },
      update: {
        source: EnrollmentSource.manual
      },
      create: {
        userId: student.id,
        courseId: course.id,
        source: EnrollmentSource.manual
      }
    })

    await prisma.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id
        }
      },
      update: {
        completedLessons: 0
      },
      create: {
        userId: student.id,
        courseId: course.id,
        completedLessons: 0
      }
    })

    await prisma.course.update({
      where: {
        id: course.id
      },
      data: {
        totalLessons: courseLessonCount
      }
    })

    seededCoursesCount += 1
  }

  console.log(`Seeded ${users.length} users.`)
  console.log(`Seeded ${seededCoursesCount} published courses and ${seededLessonsCount} lessons.`)
  console.log('Seeded enrollments for student.active@hheducation.local.')
  console.log('Demo password for all seeded users: Password123!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
