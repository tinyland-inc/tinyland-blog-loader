/**
 * Type definitions for @tummycrypt/tinyland-blog-loader
 *
 * These are framework-agnostic, internalized versions of the blog types
 * that the loader inspects. They are kept minimal and self-contained
 * so the package has zero external type dependencies.
 */

/**
 * Video embed information for blog posts
 */
export interface VideoEmbed {
  url: string;
  title: string;
  platform: 'youtube' | 'peertube' | 'vimeo';
  thumbnailUrl?: string;
  videoId?: string;
}

/**
 * External reference/citation information
 */
export interface Reference {
  title: string;
  url: string;
  description?: string;
  author?: string;
}

/**
 * Blog post frontmatter interface
 *
 * Defines all fields that the blog loader inspects when filtering,
 * sorting, and scoring posts. The index signature allows pass-through
 * of additional fields that the loader does not use directly.
 */
export interface BlogFrontmatter {
  title: string;
  date?: string;
  publishedAt?: string;
  lastModified?: string;
  slug?: string;
  author?: { name: string; handle?: string; avatar?: string } | string;
  excerpt?: string;
  description?: string;
  published?: boolean;
  draft?: boolean;
  featured?: boolean;
  tags?: string[];
  categories?: string[];
  series?: string;
  seriesOrder?: number;
  visibility?: string;
  videos?: VideoEmbed[];
  references?: Reference[];
  [key: string]: unknown;
}

/**
 * A loaded blog post with parsed frontmatter, raw content, slug, and file path.
 */
export interface LoadedBlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  slug: string;
  filePath: string;
}

/**
 * Options for filtering and paginating blog post lists.
 */
export interface BlogListOptions {
  /** Filter by author handle */
  handle?: string;
  /** Filter by visibility levels */
  visibility?: string[];
  /** Limit number of results */
  limit?: number;
  /** Skip N results (for pagination) */
  offset?: number;
  /** Filter by tags (post must have at least one matching tag) */
  tags?: string[];
  /** Filter by series name */
  series?: string;
  /** Filter published posts only */
  publishedOnly?: boolean;
  /** Filter by categories */
  categories?: string[];
}
