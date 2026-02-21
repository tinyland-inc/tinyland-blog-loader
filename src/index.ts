/**
 * @tummycrypt/tinyland-blog-loader
 *
 * Framework-agnostic blog post loader with filtering, pagination,
 * and content discovery. Content I/O is injected via configure()
 * so this package has zero runtime dependencies.
 *
 * @example
 * ```typescript
 * import {
 *   configure,
 *   loadBlogPosts,
 *   loadBlogPost,
 *   getRelatedPosts,
 * } from '@tummycrypt/tinyland-blog-loader';
 *
 * configure({
 *   loadContent: myContentLoader,
 *   findContentBySlug: mySlugFinder,
 * });
 *
 * const posts = await loadBlogPosts({ publishedOnly: true, limit: 10 });
 * const single = await loadBlogPost('my-post');
 * const related = await getRelatedPosts('my-post', 3);
 * ```
 */

// Types
export type {
  VideoEmbed,
  Reference,
  BlogFrontmatter,
  LoadedBlogPost,
  BlogListOptions,
} from './types.js';

// Configuration (DI)
export type { BlogLoaderConfig, ContentItem } from './config.js';
export { configure, getConfig, resetConfig } from './config.js';

// Filters
export { matchesFilters } from './filters.js';

// Utilities
export {
  calculateReadingTime,
  calculateWordCount,
  extractExcerpt,
} from './utils.js';

// Loader functions
export {
  loadBlogPosts,
  loadBlogPostsSync,
  loadBlogPost,
  loadBlogPostSync,
  loadSeries,
  getAllTags,
  getAllCategories,
  getAllSeries,
  getRelatedPosts,
} from './blog-loader.js';
