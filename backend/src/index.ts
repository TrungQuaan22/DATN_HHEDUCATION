import express , {Request, Response, NextFunction} from 'express'
import { authRoutes } from './modules/auth/routes'
import { randomUUID } from 'crypto'
import { errorHandler } from './common/error/error'

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req : Request, res : Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || randomUUID()
  req.requestId = requestId as string
  res.setHeader('X-Request-Id', requestId)
  next()
}
)
//Routes
app.use('/auth', authRoutes)
//Error handling middleware
app.use(errorHandler)


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})