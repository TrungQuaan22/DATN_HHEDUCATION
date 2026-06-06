import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import { learningCourseService } from '../services/learning.service'
import {
  getLearningLessonSchema,
  getLearningLessonHlsSchema,
  getLearningCourseSchema,
  updateLessonProgressSchema,
  listMyCoursesSchema
} from '../validators/learning.validator'

type GetLearningCourseValidated = z.infer<typeof getLearningCourseSchema>
type GetLearningLessonValidated = z.infer<typeof getLearningLessonSchema>
type GetLearningLessonHlsValidated = z.infer<typeof getLearningLessonHlsSchema>
type UpdateLessonProgressValidated = z.infer<typeof updateLessonProgressSchema>
type ListMyCoursesValidated = z.infer<typeof listMyCoursesSchema>

const streamToString = async (stream: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}

const buildHlsFileUrl = (req: Request, lessonId: string, fileName: string): string => {
  return `${req.protocol}://${req.get('host')}/learning/lessons/${lessonId}/hls/${fileName}`
}

const rewritePlaylistUrls = (playlist: string, req: Request, lessonId: string): string => {
  return playlist
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#') || /^https?:\/\//i.test(trimmed)) {
        return line
      }

      return buildHlsFileUrl(req, lessonId, trimmed)
    })
    .join('\n')
}

export class LearningCourseController {
  constructor(private readonly service = learningCourseService) {}

  listMyLearningCourses = async (req: Request, res: Response) => {
    const validated = req.validated as ListMyCoursesValidated
    const data = await this.service.listMyCourses({
      userId: req.user!.id,
      page: validated.query.page,
      limit: validated.query.limit
    })

    sendSuccess({ res, data })
  }

  getLearningCourse = async (req: Request, res: Response) => {
    const validated = req.validated as GetLearningCourseValidated
    const data = await this.service.getLearningCourse({
      userId: req.user!.id,
      courseSlug: validated.params.courseSlug
    })

    sendSuccess({ res, data })
  }

  getLearningLesson = async (req: Request, res: Response) => {
    const validated = req.validated as GetLearningLessonValidated
    const data = await this.service.getLearningLesson({
      userId: req.user!.id,
      lessonId: validated.params.lessonId
    })

    sendSuccess({ res, data })
  }

  streamLearningLessonHls = async (req: Request, res: Response) => {
    const validated = req.validated as GetLearningLessonHlsValidated
    const hlsFile = await this.service.getLearningLessonHlsFile({
      userId: req.user!.id,
      lessonId: validated.params.lessonId,
      fileName: validated.params.fileName
    })

    res.setHeader('Content-Type', hlsFile.contentType)
    res.setHeader('Cache-Control', 'private, max-age=3600')

    if (validated.params.fileName === 'index.m3u8') {
      const playlist = await streamToString(hlsFile.body)
      const rewrittenPlaylist = rewritePlaylistUrls(playlist, req, validated.params.lessonId)

      res.setHeader('Content-Length', Buffer.byteLength(rewrittenPlaylist))
      res.send(rewrittenPlaylist)
      return
    }

    if (hlsFile.contentLength !== undefined) {
      res.setHeader('Content-Length', String(hlsFile.contentLength))
    }

    hlsFile.body.pipe(res)
  }

  updateLessonProgress = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateLessonProgressValidated
    const data = await this.service.updateLessonProgress({
      userId: req.user!.id,
      lessonId: validated.params.lessonId,
      watchedSeconds: validated.body.watchedSeconds,
      lastPositionSec: validated.body.lastPositionSec
    })

    sendSuccess({ res, data })
  }
}

export const learningCourseController = new LearningCourseController(learningCourseService)

export const listMyLearningCoursesController = learningCourseController.listMyLearningCourses
export const getLearningCourseController = learningCourseController.getLearningCourse
export const getLearningLessonController = learningCourseController.getLearningLesson
export const streamLearningLessonHlsController = learningCourseController.streamLearningLessonHls
export const updateLessonProgressController = learningCourseController.updateLessonProgress
