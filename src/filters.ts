






import type { BlogFrontmatter, BlogListOptions } from './types.js';









export function matchesFilters(
  frontmatter: BlogFrontmatter,
  _slug: string,
  options: BlogListOptions,
): boolean {
  
  if (options.handle && frontmatter.author !== options.handle) {
    return false;
  }

  
  const postVisibility = (frontmatter.visibility as string) || 'public';
  if (options.visibility && !options.visibility.includes(postVisibility)) {
    return false;
  }

  
  if (options.publishedOnly) {
    const isPublished =
      frontmatter.published !== false && frontmatter.draft !== true;
    if (!isPublished) {
      return false;
    }
  }

  
  if (options.tags && options.tags.length > 0) {
    const postTags = frontmatter.tags || [];
    const hasMatchingTag = options.tags.some((tag) => postTags.includes(tag));
    if (!hasMatchingTag) {
      return false;
    }
  }

  
  if (options.categories && options.categories.length > 0) {
    const postCategories = frontmatter.categories || [];
    const hasMatchingCategory = options.categories.some((cat) =>
      postCategories.includes(cat),
    );
    if (!hasMatchingCategory) {
      return false;
    }
  }

  
  if (options.series && frontmatter.series !== options.series) {
    return false;
  }

  return true;
}
