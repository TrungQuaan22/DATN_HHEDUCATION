import 'dotenv/config'

import express, { Request, Response, NextFunction } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'
import { authRoutes } from './modules/auth/routes'
import { randomUUID } from 'crypto'
import { errorHandler } from './common/error/error'
import { adminChapterRoutes } from './modules/courses/routes/admin-chapters.routes'
import { adminCourseRoutes } from './modules/courses/routes/admin-courses.routes'
import { publicCourseRoutes } from './modules/courses/routes/public.routes'
import { adminMediaRoutes } from './modules/media/routes/admin.routes'
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
app.use('/admin', adminUserRoutes)
app.use('/admin', adminCourseRoutes)
app.use('/admin', adminChapterRoutes)
app.use('/admin', adminMediaRoutes)

//Error handling middleware
app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
