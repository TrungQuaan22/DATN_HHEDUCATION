import Decimal from 'decimal.js'

type ScoreInput = number | string | { toString(): string } | null | undefined

// Chuyển mọi kiểu input điểm sang Decimal để tránh sai số số thực.
const toDecimal = (value: ScoreInput) => new Decimal(value?.toString() ?? 0)

// Trả về điểm 0 theo dạng string thống nhất.
export const zeroScore = () => '0'

// Cộng nhiều giá trị điểm bằng Decimal.
export const addScores = (...values: ScoreInput[]) =>
  values.reduce<Decimal>((total, value) => total.plus(toDecimal(value)), new Decimal(0)).toString()

// Nhân điểm với hệ số bằng Decimal.
export const multiplyScore = (score: ScoreInput, multiplier: number) =>
  toDecimal(score).mul(multiplier).toString()

// So sánh hai giá trị điểm bằng Decimal.
export const scoresAreEqual = (left: ScoreInput, right: ScoreInput) =>
  toDecimal(left).equals(toDecimal(right))

// Kiểm tra hai danh sách id có cùng phần tử, không phụ thuộc thứ tự.
export function haveSameItems(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  const rightSet = new Set(right)
  return left.every((item) => rightSet.has(item))
}

// Tính tỉ lệ điểm cho câu true/false theo số mệnh đề đúng.
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
