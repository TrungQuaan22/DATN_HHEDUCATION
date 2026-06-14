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
