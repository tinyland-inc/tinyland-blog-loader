/**
 * Blog post loader functions
 *
 * All content I/O is delegated to the injected content-loader functions
 * provided via configure(). If no loader is configured, functions
 * degrade gracefully by returning empty arrays or null.
 */

import { getConfig } from './config.js';
import { matchesFilters } from './filters.js';
import type {
  BlogFrontmatter,
  BlogListOptions,
  LoadedBlogPost,
} from './types.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Load raw content items from the configured content loader.
 * Returns an empty array when no loadContent function is configured.
 */
function loadRawContent(
  options: BlogListOptions = {},
): { metadata: Record<string, unknown>; content: string; slug: string; filePath: string }[] {
  const config = getConfig();
  if (!config.loadContent) {
    return [];
  }
  return config.loadContent('blog', {
    handle: options.handle,
    aggregateAll: !options.handle,
  });
}

/**
 * Core implementation shared by the async and sync list loaders.
 */
function loadBlogPostsCore(options: BlogListOptions = {}): LoadedBlogPost[] {
  const rawItems = loadRawContent(options);
  const posts: LoadedBlogPost[] = [];

  for (const item of rawItems) {
    const frontmatter = item.metadata as BlogFrontmatter;

    if (!matchesFilters(frontmatter, item.slug, options)) {
      continue;
    }

    posts.push({
      frontmatter,
      content: item.content,
      slug: item.slug,
      filePath: item.filePath,
    });
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    const dateA = new Date(
      a.frontmatter.publishedAt || a.frontmatter.date || 0,
    );
    const dateB = new Date(
      b.frontmatter.publishedAt || b.frontmatter.date || 0,
    );
    return dateB.getTime() - dateA.getTime();
  });

  // Apply pagination
  const start = options.offset || 0;
  const end = options.limit ? start + options.limit : undefined;

  return posts.slice(start, end);
}

/**
 * Core implementation shared by the async and sync single-post loaders.
 */
function loadBlogPostCore(
  slug: string,
  handle?: string,
): LoadedBlogPost | null {
  const config = getConfig();

  let content:
    | { metadata: Record<string, unknown>; content: string; slug: string; filePath: string }
    | null
    | undefined;

  if (handle) {
    if (config.loadSingleContent) {
      content = config.loadSingleContent('blog', slug, handle);
    }
  } else {
    if (config.findContentBySlug) {
      content = config.findContentBySlug('blog', slug);
    }
  }

  if (!content) {
    return null;
  }

  return {
    frontmatter: content.metadata as BlogFrontmatter,
    content: content.content,
    slug: content.slug,
    filePath: content.filePath,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load all blog posts with optional filtering.
 *
 * @param options - Filtering and pagination options
 * @returns Array of loaded blog posts sorted by date (newest first)
 */
export async function loadBlogPosts(
  options: BlogListOptions = {},
): Promise<LoadedBlogPost[]> {
  return loadBlogPostsCore(options);
}

/**
 * Synchronous version of loadBlogPosts.
 *
 * @param options - Filtering and pagination options
 * @returns Array of loaded blog posts sorted by date (newest first)
 */
export function loadBlogPostsSync(
  options: BlogListOptions = {},
): LoadedBlogPost[] {
  return loadBlogPostsCore(options);
}

/**
 * Load a single blog post by slug.
 *
 * @param slug - The post slug (without file extension)
 * @param handle - Optional user handle to check user directory first
 * @returns The loaded blog post, or null if not found
 */
export async function loadBlogPost(
  slug: string,
  handle?: string,
): Promise<LoadedBlogPost | null> {
  return loadBlogPostCore(slug, handle);
}

/**
 * Synchronous version of loadBlogPost.
 *
 * @param slug - The post slug (without file extension)
 * @param handle - Optional user handle to check user directory first
 * @returns The loaded blog post, or null if not found
 */
export function loadBlogPostSync(
  slug: string,
  handle?: string,
): LoadedBlogPost | null {
  return loadBlogPostCore(slug, handle);
}

/**
 * Load posts in a series, sorted by seriesOrder.
 *
 * @param seriesName - The name of the series
 * @returns Array of posts in the series, sorted by seriesOrder ascending
 */
export async function loadSeries(
  seriesName: string,
): Promise<LoadedBlogPost[]> {
  const posts = await loadBlogPosts({ series: seriesName });
  return posts.sort(
    (a, b) =>
      (a.frontmatter.seriesOrder || 0) - (b.frontmatter.seriesOrder || 0),
  );
}

/**
 * Get all unique tags across posts.
 *
 * @param options - Optional filtering options
 * @returns Sorted array of unique tags
 */
export async function getAllTags(
  options: Pick<BlogListOptions, 'publishedOnly' | 'handle'> = {},
): Promise<string[]> {
  const posts = await loadBlogPosts(options);
  const tags = new Set<string>();

  for (const post of posts) {
    for (const tag of post.frontmatter.tags || []) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Get all unique categories across posts.
 *
 * @param options - Optional filtering options
 * @returns Sorted array of unique categories
 */
export async function getAllCategories(
  options: Pick<BlogListOptions, 'publishedOnly' | 'handle'> = {},
): Promise<string[]> {
  const posts = await loadBlogPosts(options);
  const categories = new Set<string>();

  for (const post of posts) {
    for (const category of post.frontmatter.categories || []) {
      categories.add(category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Get all unique series names.
 *
 * @param options - Optional filtering options
 * @returns Sorted array of series names
 */
export async function getAllSeries(
  options: Pick<BlogListOptions, 'publishedOnly' | 'handle'> = {},
): Promise<string[]> {
  const posts = await loadBlogPosts(options);
  const series = new Set<string>();

  for (const post of posts) {
    if (post.frontmatter.series) {
      series.add(post.frontmatter.series);
    }
  }

  return Array.from(series).sort();
}

/**
 * Get related posts based on shared tags, categories, series, and author.
 *
 * Scoring:
 * - Shared tag: +2 per tag
 * - Shared category: +1 per category
 * - Same series: +10
 * - Same author: +1
 *
 * @param slug - The current post slug
 * @param limit - Maximum number of related posts to return (default 5)
 * @returns Array of related posts sorted by relevance score descending
 */
export async function getRelatedPosts(
  slug: string,
  limit: number = 5,
): Promise<LoadedBlogPost[]> {
  const currentPost = await loadBlogPost(slug);
  if (!currentPost) {
    return [];
  }

  const allPosts = await loadBlogPosts({ publishedOnly: true });

  const scored = allPosts
    .filter((p) => p.slug !== slug)
    .map((post) => {
      let score = 0;

      // Count shared tags (+2 each)
      const sharedTags = (post.frontmatter.tags || []).filter((tag) =>
        currentPost.frontmatter.tags?.includes(tag),
      );
      score += sharedTags.length * 2;

      // Count shared categories (+1 each)
      const sharedCategories = (post.frontmatter.categories || []).filter(
        (cat) => currentPost.frontmatter.categories?.includes(cat),
      );
      score += sharedCategories.length;

      // Same series bonus (+10)
      if (
        post.frontmatter.series &&
        post.frontmatter.series === currentPost.frontmatter.series
      ) {
        score += 10;
      }

      // Same author bonus (+1)
      if (
        post.frontmatter.author &&
        post.frontmatter.author === currentPost.frontmatter.author
      ) {
        score += 1;
      }

      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);

  return scored;
}
