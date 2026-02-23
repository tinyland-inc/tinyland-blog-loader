







import { getConfig } from './config.js';
import { matchesFilters } from './filters.js';
import type {
  BlogFrontmatter,
  BlogListOptions,
  LoadedBlogPost,
} from './types.js';









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

  
  posts.sort((a, b) => {
    const dateA = new Date(
      a.frontmatter.publishedAt || a.frontmatter.date || 0,
    );
    const dateB = new Date(
      b.frontmatter.publishedAt || b.frontmatter.date || 0,
    );
    return dateB.getTime() - dateA.getTime();
  });

  
  const start = options.offset || 0;
  const end = options.limit ? start + options.limit : undefined;

  return posts.slice(start, end);
}




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











export async function loadBlogPosts(
  options: BlogListOptions = {},
): Promise<LoadedBlogPost[]> {
  return loadBlogPostsCore(options);
}







export function loadBlogPostsSync(
  options: BlogListOptions = {},
): LoadedBlogPost[] {
  return loadBlogPostsCore(options);
}








export async function loadBlogPost(
  slug: string,
  handle?: string,
): Promise<LoadedBlogPost | null> {
  return loadBlogPostCore(slug, handle);
}








export function loadBlogPostSync(
  slug: string,
  handle?: string,
): LoadedBlogPost | null {
  return loadBlogPostCore(slug, handle);
}







export async function loadSeries(
  seriesName: string,
): Promise<LoadedBlogPost[]> {
  const posts = await loadBlogPosts({ series: seriesName });
  return posts.sort(
    (a, b) =>
      (a.frontmatter.seriesOrder || 0) - (b.frontmatter.seriesOrder || 0),
  );
}







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

      
      const sharedTags = (post.frontmatter.tags || []).filter((tag) =>
        currentPost.frontmatter.tags?.includes(tag),
      );
      score += sharedTags.length * 2;

      
      const sharedCategories = (post.frontmatter.categories || []).filter(
        (cat) => currentPost.frontmatter.categories?.includes(cat),
      );
      score += sharedCategories.length;

      
      if (
        post.frontmatter.series &&
        post.frontmatter.series === currentPost.frontmatter.series
      ) {
        score += 10;
      }

      
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
