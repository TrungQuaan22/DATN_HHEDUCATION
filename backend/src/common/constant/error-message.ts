import { ERROR_CODE } from './error-code'

export const ERROR_MESSAGE = {
  [ERROR_CODE.BAD_REQUEST]: 'Bad request. Please check your input and try again.',
  [ERROR_CODE.UNAUTHORIZED]: 'Unauthorized. Please log in to access this resource.',
  [ERROR_CODE.FORBIDDEN]: 'Forbidden. You do not have permission to access this resource.',
  [ERROR_CODE.NOT_FOUND]: 'Not found. The requested resource does not exist.',
  [ERROR_CODE.CONFLICT]:
    'Conflict. The request could not be completed due to a conflict with the current state of the resource.',
  [ERROR_CODE.INVALID_CREDENTIALS]:
    'Invalid credentials. Please check your email and password and try again.',
  [ERROR_CODE.ACCOUNT_NOT_VERIFIED]:
    'Account not verified. Please verify your account before logging in.',
  [ERROR_CODE.ACCOUNT_BANNED]:
    'Account banned. Your account has been banned. Please contact support for more information.',
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: 'An internal server error occurred. Please try again later.',
  [ERROR_CODE.EMAIL_ALREADY_EXISTS]: 'Email already exists. Please use a different email address.',
  [ERROR_CODE.INVALID_ACCESS_TOKEN]: 'Invalid access token. Please log in again.',
  [ERROR_CODE.ACCESS_TOKEN_EXPIRED]: 'Access token expired. Please refresh your session.',
  [ERROR_CODE.INVALID_REFRESH_TOKEN]: 'Invalid refresh token. Please log in again.',
  [ERROR_CODE.REFRESH_TOKEN_REUSED]: 'Refresh token reuse detected. Please log in again.',
  [ERROR_CODE.USER_NOT_FOUND]: 'User not found. The specified user does not exist.',
  [ERROR_CODE.COURSE_TITLE_ALREADY_EXISTS]:
    'Course title already exists in a draft or published course. Please use a different title.',
  [ERROR_CODE.COURSE_SLUG_ALREADY_EXISTS]:
    'Course slug already exists. Please use a different slug.',
  [ERROR_CODE.BLOG_SLUG_ALREADY_EXISTS]: 'Blog slug already exists. Please use a different slug.',
  [ERROR_CODE.BLOG_POST_NOT_FOUND]: 'Blog post not found. The specified post does not exist.',
  [ERROR_CODE.INVALID_COURSE_TEACHER]:
    'Teacher does not exist, is not active, or is not a teacher account.',
  [ERROR_CODE.COURSE_NOT_FOUND]: 'Course not found. The specified course does not exist.',
  [ERROR_CODE.INVALID_COURSE_STATUS]: 'Course status does not allow this action.',
  [ERROR_CODE.CHAPTER_NOT_FOUND]: 'Chapter not found. The specified chapter does not exist.',
  [ERROR_CODE.LESSON_NOT_FOUND]: 'Lesson not found. The specified lesson does not exist.',
  [ERROR_CODE.INVALID_REORDER_PAYLOAD]:
    'Invalid reorder payload. The provided ids must exactly match the current scope.'
}
