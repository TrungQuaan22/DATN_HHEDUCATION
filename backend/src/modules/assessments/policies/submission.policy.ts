import Decimal from 'decimal.js'

type ScoreInput = number | string | { toString(): string } | null | undefined

const toDecimal = (value: ScoreInput) => new Decimal(value?.toString() ?? 0)

export const zeroScore = () => '0'

export const addScores = (...values: ScoreInput[]) =>
  values.reduce<Decimal>((total, value) => total.plus(toDecimal(value)), new Decimal(0)).toString()

export const multiplyScore = (score: ScoreInput, multiplier: number) =>
  toDecimal(score).mul(multiplier).toString()

export const scoresAreEqual = (left: ScoreInput, right: ScoreInput) =>
  toDecimal(left).equals(toDecimal(right))

export function haveSameItems(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  const rightSet = new Set(right)
  return left.every((item) => rightSet.has(item))
}

export function calculateTrueFalseRatio(correctCount: number, totalCount: number): number {
  if (totalCount === 4) {
    const ratios: Record<number, number> = {
      4: 1,
      3: 0.5,
      2: 0.25,
      1: 0.1,
      0: 0
    }

    return ratios[correctCount] ?? 0
  }

  return totalCount > 0 ? correctCount / totalCount : 0
}
