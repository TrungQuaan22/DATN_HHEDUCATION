export class Submission {
  readonly id?: string
  readonly assessmentId?: string
  readonly studentId?: string
  readonly status?: string

  constructor(data: {
    id?: string
    assessmentId?: string
    studentId?: string
    status?: string
  }) {
    this.id = data.id
    this.assessmentId = data.assessmentId
    this.studentId = data.studentId
    this.status = data.status
  }

  // --- Core Domain calculations (Ratio calculations and grading utilities) ---

  public calculateTrueFalseRatio(correctCount: number, totalCount: number): number {
    if (totalCount === 4) {
      const ratioByCorrectCount: Record<number, number> = {
        4: 1,
        3: 0.5,
        2: 0.25,
        1: 0.1,
        0: 0
      }

      return ratioByCorrectCount[correctCount] ?? 0
    }

    return totalCount > 0 ? correctCount / totalCount : 0
  }

  public isSameSet(left: string[], right: string[]): boolean {
    if (left.length !== right.length) {
      return false
    }

    const rightSet = new Set(right)
    return left.every((item) => rightSet.has(item))
  }
}
