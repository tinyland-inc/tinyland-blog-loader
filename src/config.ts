/**
 * Configuration module for @tinyland-inc/tinyland-blog-loader
 *
 * Provides dependency injection for content-loading functions so the
 * package stays framework-agnostic. Consumers wire in their own
 * content loader at application startup via configure().
 *
 * If no loader functions are configured, all loader operations
 * degrade gracefully (returning empty arrays or null).
 */

/**
 * A single content item returned by the injected content loader.
 */
export interface ContentItem {
  metadata: Record<string, unknown>;
  content: string;
  slug: string;
  filePath: string;
  ownerHandle?: string;
}

/**
 * Dependency-injection configuration for the blog loader.
 *
 * Each function mirrors a content-loader primitive that the blog
 * loader delegates to for actual file I/O and frontmatter parsing.
 */
export interface BlogLoaderConfig {
  /**
   * Load all content items of a given type, optionally scoped by handle.
   * When aggregateAll is true, content from all users should be returned.
   */
  loadContent?: (
    contentType: string,
    options?: { handle?: string; aggregateAll?: boolean },
  ) => ContentItem[];

  /**
   * Load a single content item by type, slug, and owner handle.
   */
  loadSingleContent?: (
    contentType: string,
    slug: string,
    handle: string,
  ) => ContentItem | null;

  /**
   * Find a content item by type and slug across all owners.
   */
  findContentBySlug?: (
    contentType: string,
    slug: string,
  ) => ContentItem | null;
}

let _config: BlogLoaderConfig = {};

/**
 * Configure the blog loader with content-loading functions.
 * Merges the provided config into the current config.
 */
export function configure(config: Partial<BlogLoaderConfig>): void {
  _config = { ..._config, ...config };
}

/**
 * Get the current blog loader configuration.
 * Returns a shallow copy to prevent external mutation.
 */
export function getConfig(): BlogLoaderConfig {
  return { ..._config };
}

/**
 * Reset configuration to empty state.
 * Useful for testing.
 */
export function resetConfig(): void {
  _config = {};
}
