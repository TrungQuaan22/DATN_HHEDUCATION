import { mapMediaUrl } from '~/common/mappers/media.mapper'
import type { AuthUserRecord } from '../ports/auth-repository.port'
import type { LoginResponse, RegisterResponse } from '../dto'

export function mapAuthUserToLoginUser(record: AuthUserRecord): LoginResponse['user'] {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    avatarMediaId: record.avatarMediaId,
    avatarUrl: mapMediaUrl(record.avatarObjectKey),
    role: record.role,
    status: record.status
  }
}

export function mapAuthUserToRegisterResponse(record: AuthUserRecord): RegisterResponse {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    avatarMediaId: record.avatarMediaId,
    avatarUrl: mapMediaUrl(record.avatarObjectKey),
    role: 'student',
    status: 'active'
  }
}
