export const countTags = (tagSources: Array<{ tags: string[] }>, limit: number) => {
  const counts = new Map<string, number>()

  for (const post of tagSources) {
    for (const rawTag of post.tags) {
      const tag = rawTag.trim()
      if (!tag) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'vi'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export const countCategories = (categorySources: Array<{ category: string | null }>, limit: number) => {
  const counts = new Map<string, number>()

  for (const post of categorySources) {
    const category = post.category?.trim()
    if (!category) continue
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'vi'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}
