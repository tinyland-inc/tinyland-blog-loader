/**
 * Filtering logic for blog posts
 *
 * Provides the matchesFilters helper that checks whether a post's
 * frontmatter satisfies the constraints expressed by BlogListOptions.
 */

import type { BlogFrontmatter, BlogListOptions } from './types.js';

/**
 * Check if a post matches the given filters.
 *
 * @param frontmatter - Post frontmatter
 * @param _slug - Post slug (reserved for future per-slug filters)
 * @param options - Filter options
 * @returns true if the post matches all filters
 */
export function matchesFilters(
  frontmatter: BlogFrontmatter,
  _slug: string,
  options: BlogListOptions,
): boolean {
  // Filter by handle (author)
  if (options.handle && frontmatter.author !== options.handle) {
    return false;
  }

  // Filter by visibility (defaults to 'public' when not set on the post)
  const postVisibility = (frontmatter.visibility as string) || 'public';
  if (options.visibility && !options.visibility.includes(postVisibility)) {
    return false;
  }

  // Filter by published status
  if (options.publishedOnly) {
    const isPublished =
      frontmatter.published !== false && frontmatter.draft !== true;
    if (!isPublished) {
      return false;
    }
  }

  // Filter by tags (post must have at least one matching tag)
  if (options.tags && options.tags.length > 0) {
    const postTags = frontmatter.tags || [];
    const hasMatchingTag = options.tags.some((tag) => postTags.includes(tag));
    if (!hasMatchingTag) {
      return false;
    }
  }

  // Filter by categories (post must have at least one matching category)
  if (options.categories && options.categories.length > 0) {
    const postCategories = frontmatter.categories || [];
    const hasMatchingCategory = options.categories.some((cat) =>
      postCategories.includes(cat),
    );
    if (!hasMatchingCategory) {
      return false;
    }
  }

  // Filter by series
  if (options.series && frontmatter.series !== options.series) {
    return false;
  }

  return true;
}
