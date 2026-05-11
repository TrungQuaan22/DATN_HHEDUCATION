/* eslint-disable @typescript-eslint/no-explicit-any */

type SearchWhere = Record<string, any>;

interface ApplySearchConditionConfig<TWhere extends SearchWhere> {
  where: TWhere;
  search?: string;
  titleField?: string;
  slugField?: string;
}

export function normalizeText(text: string): string {
  return text
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ') ?? '';
}

/**
 * Convert search text into tokens
 *
 * Example:
 * "Ngữ văn 11" -> ["ngu", "van", "11"]
 */
export function tokenizeSearch(text: string): string[] {
  return [
    ...new Set(
      normalizeText(text)
        .split(/\s+/)
        .filter(Boolean),
    ),
  ];
}

/**
 * Apply smart search condition (Title raw match OR Slug token-based AND match)
 */
export function applySearchCondition<TWhere extends SearchWhere>({
  where,
  search,
  titleField = 'title',
  slugField = 'slug',
}: ApplySearchConditionConfig<TWhere>): TWhere & { AND?: any[] } {
  const rawSearch = search?.trim();

  // Nếu không nhập chuỗi search hoặc chỉ nhập khoảng trắng, trả về nguyên vẹn where cũ
  if (!rawSearch) {
    return where;
  }

  const tokens = tokenizeSearch(rawSearch);

  // Tạo điều kiện cho Slug: Bắt buộc phải chứa đầy đủ các tokens sau khi đã lọc dấu (AND)
  const slugConditions = tokens.map((token) => ({
    [slugField]: {
      contains: token,
      mode: 'insensitive' as const,
    },
  }));

  // Tạo khối tổ hợp logic bảo hiểm: Match nguyên cụm Title gốc HOẶC Match toàn bộ từ trong Slug
  const searchClause = {
    OR: [
      {
        [titleField]: { contains: rawSearch, mode: 'insensitive' as const },
      },
      ...(slugConditions.length > 0 ? [{ AND: slugConditions }] : []),
    ],
  };

  // Trả về object where mới, đẩy searchClause vào mảng AND hiện tại để bảo toàn các điều kiện cũ khác
  return {
    ...where,
    AND: [
      ...(Array.isArray(where.AND) ? where.AND : []),
      searchClause,
    ],
  };
}