import type { Subject } from '@prisma/client'

export const SUBJECT_VALUES = [
  'math',
  'physics',
  'chemistry',
  'literature',
  'english',
  'biology',
  'history',
  'geography'
] as const satisfies readonly Subject[]

export type SubjectValue = (typeof SUBJECT_VALUES)[number]

export const GRADE_VALUES = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const

export type GradeValue = number
