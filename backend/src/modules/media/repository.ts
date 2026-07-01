import { MediaStatus, type MediaType } from '@prisma/client'

import { prisma } from '~/config/db'

import type { MediaRepositoryPort, UpdateMediaData } from './ports/media-repository.port'

export class PrismaMediaRepository implements MediaRepositoryPort {
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
  }

  findMediaById(mediaId: string) {
    return prisma.media.findUnique({
      where: {
        id: mediaId
      }
    })
  }

  updateMediaById(mediaId: string, data: UpdateMediaData) {
    return prisma.media.update({
      where: {
        id: mediaId
      },
      data
    })
  }

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
        blogPostContent: {
          none: {}
        },
        userAvatars: {
          none: {}
        },
        lessonVideos: {
          none: {}
        },
        lessonMaterials: {
          none: {}
        }
      },
      orderBy: {
        updatedAt: 'asc'
      },
      take: data.limit
    })
  }

  deleteMediaById(mediaId: string) {
    return prisma.media.delete({
      where: {
        id: mediaId
      }
    })
  }

  async lockMediaForTranscoding(mediaId: string): Promise<boolean> {
    const lockResult = await prisma.media.updateMany({
      where: {
        id: mediaId,
        status: MediaStatus.uploaded
      },
      data: {
        status: MediaStatus.processing
      }
    })

    return lockResult.count > 0
  }

  async markMediaReady(data: {
    mediaId: string
    playlistObjectKey: string
    durationSec: number | null
  }): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.media.update({
        where: {
          id: data.mediaId
        },
        data: {
          status: MediaStatus.ready,
          objectKey: data.playlistObjectKey,
          durationSec: data.durationSec ?? undefined
        }
      })

      if (data.durationSec) {
        await tx.lesson.updateMany({
          where: {
            videoMediaId: data.mediaId
          },
          data: {
            durationSec: data.durationSec
          }
        })
      }
    })
  }

  async markMediaFailed(mediaId: string): Promise<void> {
    await prisma.media.update({
      where: {
        id: mediaId
      },
      data: {
        status: MediaStatus.failed
      }
    })
  }
}

export const mediaRepository = new PrismaMediaRepository()
