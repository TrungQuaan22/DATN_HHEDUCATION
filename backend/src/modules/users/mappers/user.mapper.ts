import { mapMediaUrl } from '~/common/mappers/media.mapper'
import type { UserProfileRecord, TeacherOptionRecord } from '../ports/user-repository.port'
import type { AdminUserItemResponse, AdminTeacherOptionItemResponse, CreateTeacherResponse } from '../dto/admin.dto'
import type { GetMeResponse } from '../dto/user.dto'
import type { AuthUserRecord } from '~/modules/auth/ports/auth-repository.port'

export function mapUserProfileToResponse(record: UserProfileRecord): GetMeResponse {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    avatarMediaId: record.avatarMediaId,
    avatarUrl: mapMediaUrl(record.avatarObjectKey),
    role: record.role,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

export function mapUserProfileToAdminItemResponse(record: UserProfileRecord): AdminUserItemResponse {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    avatarMediaId: record.avatarMediaId,
    avatarUrl: mapMediaUrl(record.avatarObjectKey),
    role: record.role,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

export function mapTeacherOptionToResponse(record: TeacherOptionRecord): AdminTeacherOptionItemResponse {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    avatarUrl: mapMediaUrl(record.avatarObjectKey)
  }
}

export function mapAuthUserToCreateTeacherResponse(record: AuthUserRecord): CreateTeacherResponse {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    avatarMediaId: record.avatarMediaId,
    avatarUrl: mapMediaUrl(record.avatarObjectKey),
    role: 'teacher',
    status: 'active'
  }
}
