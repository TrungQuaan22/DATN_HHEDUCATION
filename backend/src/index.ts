import 'dotenv/config'

import express, { Request, Response, NextFunction } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'
import { authRoutes } from './modules/auth/routes'
import { randomUUID } from 'crypto'
import {
  adminAssessmentRoutes,
  learningAssessmentRoutes,
  publicAssessmentRoutes
} from './modules/assessments'
import { studentAssessmentService } from './modules/assessments/wiring'
import { startAssessmentDeadlineWorker } from './modules/assessments/jobs/assessment-deadline.worker'
import { adminBlogRoutes } from './modules/blogs/routes/admin.routes'
import { publicBlogRoutes } from './modules/blogs/routes/public.routes'
import { errorHandler } from './common/error/error'
import { adminChapterRoutes } from './modules/courses/routes/admin-chapters.routes'
import { adminCourseRoutes } from './modules/courses/routes/admin-courses.routes'
import { adminLessonRoutes } from './modules/courses/routes/admin-lessons.routes'
import { publicCourseRoutes } from './modules/courses/routes/public.routes'
import { learningCourseRoutes } from './modules/courses/routes/learning.routes'
import { enrollmentRoutes } from './modules/enrollments/routes'
import { uploadRoutes } from './modules/media/routes/upload.routes'
import { adminOrderRoutes } from './modules/orders/routes/admin-order.routes'
import { orderRoutes } from './modules/orders/routes/order.routes'
import { adminPaymentTransactionRoutes } from './modules/payments/routes/admin-payment-transaction.routes'
import { notificationRoutes } from './modules/notifications/routes'
import { paymentWebhookRoutes } from './modules/payments/routes/webhook.routes'
import { tutorRoutes } from './modules/tutor/routes'
import { adminUserRoutes } from './modules/users/routes/admin.routes'
import { userRoutes } from './modules/users/routes/user.routes'

const app = express()
const openApiDocument = YAML.parse(
  readFileSync(join(process.cwd(), 'docs', 'openapi.yaml'), 'utf8')
)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-Id, Idempotency-Key, Range'
  )

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }

  next()
})
app.use(
  express.json({
    verify: (req: Request, _res, buf) => {
      if (req.originalUrl.startsWith('/payments/webhooks/sepay')) {
        req.rawBody = Buffer.from(buf)
      }
    }
  })
)
app.use(express.urlencoded({ extended: true }))

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || randomUUID()
  req.requestId = requestId as string
  res.setHeader('X-Request-Id', requestId)
  next()
})
//Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/notifications', notificationRoutes)
app.use('/catalog', publicCourseRoutes)
app.use('/practice', publicAssessmentRoutes)
app.use('/learning', learningCourseRoutes)
app.use('/learning', learningAssessmentRoutes)
app.use('/learning', tutorRoutes)
app.use(publicBlogRoutes)
app.use('/uploads', uploadRoutes)
app.use('/orders', orderRoutes)
app.use('/payments/webhooks', paymentWebhookRoutes)
app.use('/admin', adminUserRoutes)
app.use('/admin', adminCourseRoutes)
app.use('/admin', adminChapterRoutes)
app.use('/admin', adminLessonRoutes)
app.use('/admin', enrollmentRoutes)
app.use('/admin', adminBlogRoutes)
app.use('/admin', adminAssessmentRoutes)
app.use('/admin', adminOrderRoutes)
app.use('/admin', adminPaymentTransactionRoutes)

//Error handling middleware
app.use(errorHandler)

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`)
  startAssessmentDeadlineWorker(studentAssessmentService)
})
