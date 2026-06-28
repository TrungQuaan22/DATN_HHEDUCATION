export function getAssessmentContentLabel(
  content: unknown,
  fallback: string,
): string {
  if (typeof content === "string" && content.trim()) return content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    const value = content as Record<string, unknown>;
    for (const key of ["label", "text", "content"]) {
      const candidate = value[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
  }
  return fallback;
}
