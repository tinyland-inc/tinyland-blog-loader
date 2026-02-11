/**
 * Utility functions for blog content processing
 *
 * Pure functions with no side effects and no external dependencies.
 */

/**
 * Calculate reading time based on word count.
 * Average reading speed: 200 words per minute.
 *
 * @param content - Markdown content
 * @returns Estimated reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Calculate word count from markdown content.
 *
 * @param content - Markdown content
 * @returns Word count
 */
export function calculateWordCount(content: string): number {
  return content.split(/\s+/).length;
}

/**
 * Extract a plain-text excerpt from markdown content.
 *
 * Strips markdown formatting (headers, emphasis, links) and
 * truncates at a word boundary, appending an ellipsis if needed.
 *
 * @param content - Markdown content
 * @param maxLength - Maximum excerpt length in characters (default 200)
 * @returns Excerpt text
 */
export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown formatting for excerpt
  const plainText = content
    .replace(/#{1,6}\s/g, '')                     // Remove headers
    .replace(/[*_~`]/g, '')                        // Remove emphasis markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')       // Convert links to text
    .replace(/\n+/g, ' ')                          // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Truncate at word boundary
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
}
