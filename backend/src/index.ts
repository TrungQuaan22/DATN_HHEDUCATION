import 'dotenv/config'

import express, { Request, Response, NextFunction } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'
import { authRoutes } from './modules/auth/routes'
import { randomUUID } from 'crypto'
import { adminBlogRoutes } from './modules/blogs/routes/admin.routes'
import { publicBlogRoutes } from './modules/blogs/routes/public.routes'
import { errorHandler } from './common/error/error'
import { adminChapterRoutes } from './modules/courses/routes/admin-chapters.routes'
import { adminCourseRoutes } from './modules/courses/routes/admin-courses.routes'
import { adminLessonRoutes } from './modules/courses/routes/admin-lessons.routes'
import { publicCourseRoutes } from './modules/courses/routes/public.routes'
import { learningCourseRoutes } from './modules/courses/routes/learning.routes'
import { adminMediaRoutes } from './modules/media/routes/admin.routes'
import { uploadRoutes } from './modules/media/routes/upload.routes'
import { adminUserRoutes } from './modules/users/routes/admin.routes'
import { userRoutes } from './modules/users/routes/user.routes'

const app = express()
const openApiDocument = YAML.parse(
  readFileSync(join(process.cwd(), 'docs', 'openapi.yaml'), 'utf8')
)

app.use(express.json())
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
app.use('/catalog', publicCourseRoutes)
app.use('/learning', learningCourseRoutes)
app.use(publicBlogRoutes)
app.use('/uploads', uploadRoutes)
app.use('/admin', adminUserRoutes)
app.use('/admin', adminCourseRoutes)
app.use('/admin', adminChapterRoutes)
app.use('/admin', adminLessonRoutes)
app.use('/admin', adminMediaRoutes)
app.use('/admin', adminBlogRoutes)

//Error handling middleware
app.use(errorHandler)

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`)
})
