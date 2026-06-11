import {
  PrismaClient,
  Subject,
  AssessmentType,
  GradingType,
  AssessmentVisibility,
  AssessmentPlacementType,
  AssessmentItemType,
  QuestionDifficulty,
  QuestionType,
  QuestionSource,
  QuestionStatus
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding a public practice assessment...')

  // 1. Clean existing public practices if they have the same slug
  const existingPlacement = await prisma.assessmentPlacement.findUnique({
    where: {
      slug: 'de-luyen-thi-thpt-quoc-gia-toan-hoc-ham-so'
    }
  })

  if (existingPlacement) {
    console.log('Found existing placement with the same slug, deleting to recreate...')
    await prisma.assessmentPlacement.delete({
      where: {
        id: existingPlacement.id
      }
    })
    await prisma.assessment.delete({
      where: {
        id: existingPlacement.assessmentId
      }
    })
  }

  // 2. Create Questions
  const q1 = await prisma.question.create({
    data: {
      difficulty: QuestionDifficulty.recognition,
      type: QuestionType.mcq,
      source: QuestionSource.bank,
      content: {
        text: 'Cho hàm số y = f(x) có bảng biến thiên như sau. Hàm số đã cho đồng biến trên khoảng nào dưới đây?'
      },
      explanation: {
        text: 'Dựa vào bảng biến thiên, ta thấy hàm số đồng biến trên các khoảng (-inf; -1) và (1; +inf).'
      },
      status: QuestionStatus.active,
      options: {
        createMany: {
          data: [
            { content: { text: '(-inf; -1)' }, isCorrect: true, orderIndex: 0 },
            { content: { text: '(-1; 1)' }, isCorrect: false, orderIndex: 1 },
            { content: { text: '(0; 1)' }, isCorrect: false, orderIndex: 2 },
            { content: { text: '(-1; +inf)' }, isCorrect: false, orderIndex: 3 }
          ]
        }
      }
    },
    include: {
      options: true
    }
  })

  const q2 = await prisma.question.create({
    data: {
      difficulty: QuestionDifficulty.understanding,
      type: QuestionType.mcq,
      source: QuestionSource.bank,
      content: {
        text: 'Đồ thị của hàm số nào dưới đây có dạng như đường cong trong hình bên?'
      },
      explanation: {
        text: 'Đồ thị hàm số bậc ba với hệ số a > 0 và đi qua các điểm cực trị.'
      },
      status: QuestionStatus.active,
      options: {
        createMany: {
          data: [
            { content: { text: 'y = x^3 - 3x' }, isCorrect: true, orderIndex: 0 },
            { content: { text: 'y = -x^3 + 3x' }, isCorrect: false, orderIndex: 1 },
            { content: { text: 'y = x^4 - 2x^2' }, isCorrect: false, orderIndex: 2 },
            { content: { text: 'y = -x^4 + 2x^2' }, isCorrect: false, orderIndex: 3 }
          ]
        }
      }
    },
    include: {
      options: true
    }
  })

  // 3. Create Assessment
  const assessment = await prisma.assessment.create({
    data: {
      subject: Subject.math,
      grade: 12,
      type: AssessmentType.exam,
      title: 'Đề luyện thi THPT Quốc gia Toán học - Khảo sát và vẽ đồ thị hàm số',
      gradingType: GradingType.auto,
      timeLimitMinutes: 45,
      visibility: AssessmentVisibility.published
    }
  })

  const section = await prisma.assessmentSection.create({
    data: {
      assessmentId: assessment.id,
      title: 'Trắc nghiệm',
      itemType: AssessmentItemType.mcq,
      orderIndex: 1000
    }
  })

  await prisma.assessmentItem.createMany({
    data: [
      {
        assessmentId: assessment.id,
        sectionId: section.id,
        itemType: AssessmentItemType.mcq,
        questionId: q1.id,
        orderIndex: 1000,
        maxScore: 5.0,
        correctAnswer: {
          correctOptions: ['A']
        }
      },
      {
        assessmentId: assessment.id,
        sectionId: section.id,
        itemType: AssessmentItemType.mcq,
        questionId: q2.id,
        orderIndex: 2000,
        maxScore: 5.0,
        correctAnswer: {
          correctOptions: ['A']
        }
      }
    ]
  })

  // 4. Create Placement
  const placement = await prisma.assessmentPlacement.create({
    data: {
      assessmentId: assessment.id,
      type: AssessmentPlacementType.public_practice,
      slug: 'de-luyen-thi-thpt-quoc-gia-toan-hoc-ham-so',
      isFeatured: true,
      openTime: new Date(),
      maxAttempts: 5
    }
  })

  console.log('Public practice assessment seeded successfully!')
  console.log(`Assessment ID: ${assessment.id}`)
  console.log(`Placement ID: ${placement.id}`)
  console.log(`Placement Slug: ${placement.slug}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
