type SearchWhere = {
  AND?: unknown
}

interface ApplySearchConditionOptions<TWhere extends SearchWhere> {
  where: TWhere
  search?: string
  field?: string
  tokenField?: string
}

export function normalizeText(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')   // Tách các ký tự có dấu thành ký tự cơ bản + dấu
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu đã tách ra
      .replace(/đ/g, 'd') // Thay thế đ bằng d vì đ không có dạng tách dấu
      .replace(/[_-]+/g, ' ') // Thay thế các ký tự đặc biệt như _ và - bằng khoảng trắng
      .trim()
      .replace(/\s+/g, ' ')
  )
}

export function tokenizeSearch(text: string): string[] {
  const normalizedText = normalizeText(text)
  const tokens = normalizedText.split(/\s+/).filter(Boolean)

  return [...new Set(tokens)]
}
/*
  Chiến lược tìm kiếm:
  - Chuẩn hóa chuỗi tìm kiếm: Loại bỏ dấu, chuyển về chữ thường, thay thế các ký tự đặc biệt bằng khoảng trắng.
  - Tách chuỗi thành các token riêng biệt dựa trên khoảng trắng.
  - Tìm kiếm theo OR 1 [field] (default: 'title') chứa toàn bộ input và OR 2 [tokenField](default: 'slug') chứa từng token riêng lẻ (AND giữa các token). 
 */
export function applySearchCondition<TWhere extends SearchWhere>({
  where,
  search,
  field = 'title',
  tokenField = 'slug'
}: ApplySearchConditionOptions<TWhere>) {
  const keyword = search?.trim()

  if (!keyword) {
    return where
  }

  const tokens = tokenizeSearch(keyword)

  const searchCondition: { OR: unknown[] } = {
    OR: [
      {
        [field]: {
          contains: keyword,
          mode: 'insensitive' as const
        }
      }
    ]
  }

  if (tokens.length > 0) {
    searchCondition.OR.push({
      AND: tokens.map((token) => ({
        [tokenField]: {
          contains: token,
          mode: 'insensitive' as const
        }
      }))
    })
  }

  return {
    ...where,
    AND: [
      ...(Array.isArray(where.AND) ? where.AND : []), //spread existing AND conditions if any and add the new search condition
      searchCondition
    ]
  }
}
