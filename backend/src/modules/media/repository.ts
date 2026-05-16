import { MediaStatus, type MediaType, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

export const mediaRepository = {
  createMedia(data: {
    type: MediaType
    status: MediaStatus
    objectKey: string
    originalName: string
    mimeType: string
    sizeBytes: number
    uploadedById: string
  }) {
    return prisma.media.create({
      data
    })
  },

  findMediaById(mediaId: string) {
    return prisma.media.findUnique({
      where: {
        id: mediaId
      }
    })
  },

  updateMediaById(mediaId: string, data: Prisma.MediaUpdateInput) {
    return prisma.media.update({
      where: {
        id: mediaId
      },
      data
    })
  },

  listOrphanMediaForCleanup(data: {
    type: MediaType
    statuses: MediaStatus[]
    olderThan: Date
    limit: number
  }) {
    return prisma.media.findMany({
      where: {
        type: data.type,
        status: {
          in: data.statuses
        },
        updatedAt: {
          lt: data.olderThan
        },
        courseThumbnails: {
          none: {}
        },
        blogThumbnails: {
          none: {}
        },
        userAvatars: {
          none: {}
        },
        lessonVideos: {
          none: {}
        }
      },
      orderBy: {
        updatedAt: 'asc'
      },
      take: data.limit
    })
  },

  deleteMediaById(mediaId: string) {
    return prisma.media.delete({
      where: {
        id: mediaId
      }
    })
  }
}
