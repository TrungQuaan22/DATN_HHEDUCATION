import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MediaStatus,
  MediaType,
  MediaVisibility,
  UserRole,
  UserStatus,
  type Media
} from '@prisma/client'

import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'
import type {
  TeacherOptionRecord,
  UpdateUserProfileInput,
  UserProfileRecord,
  UserRepositoryPort
} from '../ports/user-repository.port'
import { UserService } from './user.service'

const studentId = '00000000-0000-0000-0000-000000000001'
const avatarId = '00000000-0000-0000-0000-000000000002'

const baseUser: UserProfileRecord = {
  id: studentId,
  email: 'student@example.com',
  fullName: 'Tên cũ',
  avatarMediaId: null,
  avatarObjectKey: null,
  role: UserRole.student,
  status: UserStatus.active,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z')
}

class InMemoryUserRepository implements UserRepositoryPort {
  user: UserProfileRecord | null = { ...baseUser }
  lastUpdate: UpdateUserProfileInput | null = null

  findUserProfileById(): Promise<UserProfileRecord | null> {
    return Promise.resolve(this.user)
  }

  listUsers(): Promise<[UserProfileRecord[], number]> {
    return Promise.resolve([this.user ? [this.user] : [], this.user ? 1 : 0])
  }

  getUserStats(): Promise<[number, number, number]> {
    return Promise.resolve([0, 0, 0])
  }

  listTeacherOptions(): Promise<[TeacherOptionRecord[], number]> {
    return Promise.resolve([[], 0])
  }

  updateUserStatus(): Promise<unknown> {
    return Promise.resolve(null)
  }

  updateUserProfile(data: UpdateUserProfileInput): Promise<UserProfileRecord> {
    if (!this.user) throw new Error('User not found')
    this.lastUpdate = data
    this.user = {
      ...this.user,
      fullName: data.fullName ?? this.user.fullName,
      avatarMediaId:
        data.avatarMediaId === undefined ? this.user.avatarMediaId : data.avatarMediaId,
      avatarObjectKey:
        data.avatarObjectKey === undefined ? this.user.avatarObjectKey : data.avatarObjectKey
    }
    return Promise.resolve(this.user)
  }
}

class InMemoryMediaRepository implements MediaRepositoryPort {
  media: Media | null = null

  createMedia(): Promise<Media> {
    throw new Error('Not used in this test')
  }

  findMediaById(): Promise<Media | null> {
    return Promise.resolve(this.media)
  }

  updateMediaById(): Promise<Media> {
    throw new Error('Not used in this test')
  }

  listOrphanMediaForCleanup(): Promise<Media[]> {
    return Promise.resolve([])
  }

  deleteMediaById(): Promise<Media> {
    throw new Error('Not used in this test')
  }

  lockMediaForTranscoding(): Promise<boolean> {
    return Promise.resolve(false)
  }

  markMediaReady(): Promise<void> {
    return Promise.resolve()
  }

  markMediaFailed(): Promise<void> {
    return Promise.resolve()
  }
}

function readyAvatar(uploadedById: string): Media {
  return {
    id: avatarId,
    type: MediaType.image,
    status: MediaStatus.ready,
    visibility: MediaVisibility.private,
    originalName: 'avatar.png',
    objectKey: `users/${studentId}/avatar.png`,
    mimeType: 'image/png',
    sizeBytes: 1024,
    etag: null,
    width: 128,
    height: 128,
    durationSec: null,
    uploadedById,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z')
  }
}

test('updates the display name and a ready avatar owned by the user', async () => {
  const users = new InMemoryUserRepository()
  const media = new InMemoryMediaRepository()
  media.media = readyAvatar(studentId)
  const service = new UserService(users, media)

  const result = await service.updateMe({
    userId: studentId,
    fullName: 'Nguyễn Văn An',
    avatarMediaId: avatarId
  })

  assert.equal(result.fullName, 'Nguyễn Văn An')
  assert.equal(result.avatarMediaId, avatarId)
  assert.equal(users.lastUpdate?.avatarObjectKey, `users/${studentId}/avatar.png`)
})

test('rejects an avatar uploaded by another student', async () => {
  const users = new InMemoryUserRepository()
  const media = new InMemoryMediaRepository()
  media.media = readyAvatar('00000000-0000-0000-0000-000000000099')
  const service = new UserService(users, media)

  await assert.rejects(
    service.updateMe({ userId: studentId, avatarMediaId: avatarId }),
    /You can only use your own uploaded media/
  )
  assert.equal(users.lastUpdate, null)
})
