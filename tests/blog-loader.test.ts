






import { describe, it, expect, beforeEach } from 'vitest';
import {
  
  type VideoEmbed,
  type Reference,
  type BlogFrontmatter,
  type LoadedBlogPost,
  type BlogListOptions,
  type BlogLoaderConfig,
  type ContentItem,
  
  configure,
  getConfig,
  resetConfig,
  
  matchesFilters,
  
  calculateReadingTime,
  calculateWordCount,
  extractExcerpt,
  
  loadBlogPosts,
  loadBlogPostsSync,
  loadBlogPost,
  loadBlogPostSync,
  loadSeries,
  getAllTags,
  getAllCategories,
  getAllSeries,
  getRelatedPosts,
} from '../src/index.js';





function makeContentItem(overrides: Partial<ContentItem> & { metadata?: Record<string, unknown> }): ContentItem {
  return {
    metadata: { title: 'Default Post', published: true },
    content: 'Default content body.',
    slug: 'default-post',
    filePath: '/content/blog/default-post.md',
    ...overrides,
  };
}

function makeFrontmatter(overrides: Partial<BlogFrontmatter> = {}): BlogFrontmatter {
  return {
    title: 'Test Post',
    ...overrides,
  };
}





function buildMockLoaders(items: ContentItem[]): BlogLoaderConfig {
  return {
    loadContent: (_type: string, options?: { handle?: string; aggregateAll?: boolean }) => {
      if (options?.handle) {
        return items.filter((i) => i.ownerHandle === options.handle);
      }
      return items;
    },
    loadSingleContent: (_type: string, slug: string, handle: string) => {
      return items.find((i) => i.slug === slug && i.ownerHandle === handle) ?? null;
    },
    findContentBySlug: (_type: string, slug: string) => {
      return items.find((i) => i.slug === slug) ?? null;
    },
  };
}


const FIXTURE_POSTS: ContentItem[] = [
  makeContentItem({
    metadata: {
      title: 'Post A',
      publishedAt: '2024-06-01',
      published: true,
      tags: ['svelte', 'typescript'],
      categories: ['frontend'],
      series: 'SvelteKit Deep Dive',
      seriesOrder: 1,
      author: 'alice',
      visibility: 'public',
    },
    content: 'Content of post A.',
    slug: 'post-a',
    filePath: '/content/users/alice/blog/post-a.md',
    ownerHandle: 'alice',
  }),
  makeContentItem({
    metadata: {
      title: 'Post B',
      publishedAt: '2024-07-15',
      published: true,
      tags: ['typescript', 'node'],
      categories: ['backend'],
      series: 'SvelteKit Deep Dive',
      seriesOrder: 2,
      author: 'alice',
      visibility: 'public',
    },
    content: 'Content of post B with more words to count.',
    slug: 'post-b',
    filePath: '/content/users/alice/blog/post-b.md',
    ownerHandle: 'alice',
  }),
  makeContentItem({
    metadata: {
      title: 'Post C',
      date: '2024-05-10',
      published: true,
      tags: ['react'],
      categories: ['frontend'],
      author: 'bob',
      visibility: 'members',
    },
    content: 'Content of post C.',
    slug: 'post-c',
    filePath: '/content/users/bob/blog/post-c.md',
    ownerHandle: 'bob',
  }),
  makeContentItem({
    metadata: {
      title: 'Draft Post',
      publishedAt: '2024-08-01',
      published: false,
      draft: true,
      tags: ['draft'],
      author: 'alice',
      visibility: 'public',
    },
    content: 'Draft content.',
    slug: 'draft-post',
    filePath: '/content/users/alice/blog/draft-post.md',
    ownerHandle: 'alice',
  }),
  makeContentItem({
    metadata: {
      title: 'Post D',
      publishedAt: '2024-04-01',
      published: true,
      tags: ['svelte'],
      categories: ['frontend', 'tutorial'],
      series: 'Svelte Basics',
      seriesOrder: 1,
      author: 'bob',
      visibility: 'public',
    },
    content: 'Content of post D.',
    slug: 'post-d',
    filePath: '/content/users/bob/blog/post-d.md',
    ownerHandle: 'bob',
  }),
];





describe('Types', () => {
  it('BlogFrontmatter should require title', () => {
    const fm: BlogFrontmatter = { title: 'Hello' };
    expect(fm.title).toBe('Hello');
  });

  it('BlogFrontmatter should allow optional fields', () => {
    const fm: BlogFrontmatter = {
      title: 'Test',
      date: '2024-01-01',
      tags: ['a'],
      categories: ['b'],
      series: 'S',
      seriesOrder: 1,
      published: true,
      draft: false,
      featured: true,
    };
    expect(fm.tags).toEqual(['a']);
  });

  it('BlogFrontmatter should allow index-signature pass-through', () => {
    const fm: BlogFrontmatter = { title: 'X', customField: 42 };
    expect(fm['customField']).toBe(42);
  });

  it('LoadedBlogPost should have required shape', () => {
    const post: LoadedBlogPost = {
      frontmatter: { title: 'T' },
      content: 'body',
      slug: 'my-slug',
      filePath: '/a/b.md',
    };
    expect(post.slug).toBe('my-slug');
  });

  it('BlogListOptions should allow all optional fields', () => {
    const opts: BlogListOptions = {
      handle: 'alice',
      visibility: ['public'],
      limit: 10,
      offset: 5,
      tags: ['a'],
      series: 'S',
      publishedOnly: true,
      categories: ['c'],
    };
    expect(opts.limit).toBe(10);
  });

  it('VideoEmbed should have required fields', () => {
    const ve: VideoEmbed = { url: 'https://example.com', title: 'V', platform: 'youtube' };
    expect(ve.platform).toBe('youtube');
  });

  it('Reference should have required fields', () => {
    const ref: Reference = { title: 'Ref', url: 'https://example.com' };
    expect(ref.title).toBe('Ref');
  });
});





describe('Config DI', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('getConfig returns empty object by default', () => {
    const cfg = getConfig();
    expect(cfg).toEqual({});
  });

  it('configure sets loadContent', () => {
    const fn = () => [];
    configure({ loadContent: fn });
    expect(getConfig().loadContent).toBe(fn);
  });

  it('configure sets loadSingleContent', () => {
    const fn = () => null;
    configure({ loadSingleContent: fn });
    expect(getConfig().loadSingleContent).toBe(fn);
  });

  it('configure sets findContentBySlug', () => {
    const fn = () => null;
    configure({ findContentBySlug: fn });
    expect(getConfig().findContentBySlug).toBe(fn);
  });

  it('configure merges partial configs', () => {
    const fn1 = () => [];
    const fn2 = () => null;
    configure({ loadContent: fn1 });
    configure({ findContentBySlug: fn2 });
    const cfg = getConfig();
    expect(cfg.loadContent).toBe(fn1);
    expect(cfg.findContentBySlug).toBe(fn2);
  });

  it('resetConfig clears all config', () => {
    configure({ loadContent: () => [] });
    resetConfig();
    expect(getConfig()).toEqual({});
  });

  it('getConfig returns a copy (mutations do not leak)', () => {
    configure({ loadContent: () => [] });
    const cfg = getConfig();
    cfg.loadContent = undefined;
    expect(getConfig().loadContent).toBeDefined();
  });

  it('loader functions return empty arrays when loadContent not configured', async () => {
    const posts = await loadBlogPosts();
    expect(posts).toEqual([]);
  });

  it('loadBlogPost returns null when loadSingleContent not configured', async () => {
    const post = await loadBlogPost('missing', 'handle');
    expect(post).toBeNull();
  });

  it('loadBlogPost returns null when findContentBySlug not configured', async () => {
    const post = await loadBlogPost('missing');
    expect(post).toBeNull();
  });

  it('graceful degradation: getAllTags returns empty when not configured', async () => {
    const tags = await getAllTags();
    expect(tags).toEqual([]);
  });

  it('graceful degradation: getAllCategories returns empty when not configured', async () => {
    const categories = await getAllCategories();
    expect(categories).toEqual([]);
  });
});





describe('matchesFilters', () => {
  it('passes all when no filters specified', () => {
    expect(matchesFilters(makeFrontmatter(), 'slug', {})).toBe(true);
  });

  it('filters by handle (match)', () => {
    const fm = makeFrontmatter({ author: 'alice' });
    expect(matchesFilters(fm, 's', { handle: 'alice' })).toBe(true);
  });

  it('filters by handle (no match)', () => {
    const fm = makeFrontmatter({ author: 'bob' });
    expect(matchesFilters(fm, 's', { handle: 'alice' })).toBe(false);
  });

  it('filters by single visibility (match)', () => {
    const fm = makeFrontmatter({ visibility: 'public' });
    expect(matchesFilters(fm, 's', { visibility: ['public'] })).toBe(true);
  });

  it('filters by single visibility (no match)', () => {
    const fm = makeFrontmatter({ visibility: 'private' });
    expect(matchesFilters(fm, 's', { visibility: ['public'] })).toBe(false);
  });

  it('filters by multiple visibility levels', () => {
    const fm = makeFrontmatter({ visibility: 'members' });
    expect(matchesFilters(fm, 's', { visibility: ['public', 'members'] })).toBe(true);
  });

  it('defaults visibility to public when not set on post', () => {
    const fm = makeFrontmatter();
    expect(matchesFilters(fm, 's', { visibility: ['public'] })).toBe(true);
  });

  it('rejects when post has no visibility and filter excludes public', () => {
    const fm = makeFrontmatter();
    expect(matchesFilters(fm, 's', { visibility: ['private'] })).toBe(false);
  });

  it('publishedOnly=true passes when published=true', () => {
    const fm = makeFrontmatter({ published: true });
    expect(matchesFilters(fm, 's', { publishedOnly: true })).toBe(true);
  });

  it('publishedOnly=true passes when published is undefined and draft is undefined', () => {
    const fm = makeFrontmatter();
    expect(matchesFilters(fm, 's', { publishedOnly: true })).toBe(true);
  });

  it('publishedOnly=true rejects when published=false', () => {
    const fm = makeFrontmatter({ published: false });
    expect(matchesFilters(fm, 's', { publishedOnly: true })).toBe(false);
  });

  it('publishedOnly=true rejects when draft=true', () => {
    const fm = makeFrontmatter({ draft: true });
    expect(matchesFilters(fm, 's', { publishedOnly: true })).toBe(false);
  });

  it('publishedOnly=false does not filter drafts', () => {
    const fm = makeFrontmatter({ draft: true });
    expect(matchesFilters(fm, 's', { publishedOnly: false })).toBe(true);
  });

  it('publishedOnly undefined does not filter drafts', () => {
    const fm = makeFrontmatter({ draft: true });
    expect(matchesFilters(fm, 's', {})).toBe(true);
  });

  it('tag filter matches when post has one matching tag', () => {
    const fm = makeFrontmatter({ tags: ['svelte', 'ts'] });
    expect(matchesFilters(fm, 's', { tags: ['ts'] })).toBe(true);
  });

  it('tag filter matches any (not all) tags', () => {
    const fm = makeFrontmatter({ tags: ['svelte'] });
    expect(matchesFilters(fm, 's', { tags: ['svelte', 'react'] })).toBe(true);
  });

  it('tag filter rejects when no tags match', () => {
    const fm = makeFrontmatter({ tags: ['go'] });
    expect(matchesFilters(fm, 's', { tags: ['svelte'] })).toBe(false);
  });

  it('tag filter rejects when post has no tags', () => {
    const fm = makeFrontmatter();
    expect(matchesFilters(fm, 's', { tags: ['svelte'] })).toBe(false);
  });

  it('category filter matches when post has one matching category', () => {
    const fm = makeFrontmatter({ categories: ['frontend', 'tutorial'] });
    expect(matchesFilters(fm, 's', { categories: ['tutorial'] })).toBe(true);
  });

  it('category filter rejects when no categories match', () => {
    const fm = makeFrontmatter({ categories: ['backend'] });
    expect(matchesFilters(fm, 's', { categories: ['frontend'] })).toBe(false);
  });

  it('category filter rejects when post has no categories', () => {
    const fm = makeFrontmatter();
    expect(matchesFilters(fm, 's', { categories: ['frontend'] })).toBe(false);
  });

  it('series filter matches', () => {
    const fm = makeFrontmatter({ series: 'SvelteKit' });
    expect(matchesFilters(fm, 's', { series: 'SvelteKit' })).toBe(true);
  });

  it('series filter rejects', () => {
    const fm = makeFrontmatter({ series: 'React' });
    expect(matchesFilters(fm, 's', { series: 'SvelteKit' })).toBe(false);
  });

  it('series filter rejects when post has no series', () => {
    const fm = makeFrontmatter();
    expect(matchesFilters(fm, 's', { series: 'SvelteKit' })).toBe(false);
  });

  it('combined filters: handle + publishedOnly + tags', () => {
    const fm = makeFrontmatter({ author: 'alice', published: true, tags: ['svelte'] });
    expect(
      matchesFilters(fm, 's', { handle: 'alice', publishedOnly: true, tags: ['svelte'] }),
    ).toBe(true);
  });

  it('combined filters fail if any single filter fails', () => {
    const fm = makeFrontmatter({ author: 'bob', published: true, tags: ['svelte'] });
    expect(
      matchesFilters(fm, 's', { handle: 'alice', publishedOnly: true, tags: ['svelte'] }),
    ).toBe(false);
  });
});





describe('loadBlogPosts', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('loads all posts when no filters', async () => {
    const posts = await loadBlogPosts();
    expect(posts.length).toBe(5);
  });

  it('sorts by date newest first', async () => {
    const posts = await loadBlogPosts();
    
    expect(posts[0].slug).toBe('draft-post');
    expect(posts[1].slug).toBe('post-b');
    expect(posts[2].slug).toBe('post-a');
  });

  it('uses publishedAt over date for sorting', async () => {
    const posts = await loadBlogPosts();
    
    const indexA = posts.findIndex((p) => p.slug === 'post-a');
    const indexC = posts.findIndex((p) => p.slug === 'post-c');
    expect(indexA).toBeLessThan(indexC);
  });

  it('handles missing dates (sorted to end)', async () => {
    resetConfig();
    const items = [
      makeContentItem({ metadata: { title: 'No Date', published: true }, slug: 'no-date' }),
      makeContentItem({
        metadata: { title: 'Has Date', publishedAt: '2024-01-01', published: true },
        slug: 'has-date',
      }),
    ];
    configure(buildMockLoaders(items));
    const posts = await loadBlogPosts();
    expect(posts[0].slug).toBe('has-date');
    expect(posts[1].slug).toBe('no-date');
  });

  it('applies pagination offset', async () => {
    const posts = await loadBlogPosts({ offset: 2 });
    expect(posts.length).toBe(3);
  });

  it('applies pagination limit', async () => {
    const posts = await loadBlogPosts({ limit: 2 });
    expect(posts.length).toBe(2);
  });

  it('applies combined offset and limit', async () => {
    const posts = await loadBlogPosts({ offset: 1, limit: 2 });
    expect(posts.length).toBe(2);
    expect(posts[0].slug).toBe('post-b');
  });

  it('filters by publishedOnly', async () => {
    const posts = await loadBlogPosts({ publishedOnly: true });
    expect(posts.every((p) => p.frontmatter.draft !== true)).toBe(true);
    expect(posts.length).toBe(4);
  });

  it('filters by handle', async () => {
    const posts = await loadBlogPosts({ handle: 'alice' });
    
    expect(posts.every((p) => p.frontmatter.author === 'alice')).toBe(true);
  });

  it('filters by tags', async () => {
    const posts = await loadBlogPosts({ tags: ['svelte'] });
    expect(posts.length).toBe(2); 
  });

  it('filters by categories', async () => {
    const posts = await loadBlogPosts({ categories: ['backend'] });
    expect(posts.length).toBe(1);
    expect(posts[0].slug).toBe('post-b');
  });

  it('filters by series', async () => {
    const posts = await loadBlogPosts({ series: 'SvelteKit Deep Dive' });
    expect(posts.length).toBe(2);
  });

  it('filters by visibility', async () => {
    const posts = await loadBlogPosts({ visibility: ['members'] });
    expect(posts.length).toBe(1);
    expect(posts[0].slug).toBe('post-c');
  });

  it('handles empty result gracefully', async () => {
    const posts = await loadBlogPosts({ tags: ['nonexistent'] });
    expect(posts).toEqual([]);
  });

  it('returns empty array when no loader configured', async () => {
    resetConfig();
    const posts = await loadBlogPosts();
    expect(posts).toEqual([]);
  });

  it('combined filters narrow results correctly', async () => {
    const posts = await loadBlogPosts({
      publishedOnly: true,
      tags: ['typescript'],
      visibility: ['public'],
    });
    expect(posts.length).toBe(2); 
  });
});





describe('loadBlogPostsSync', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('loads all posts synchronously', () => {
    const posts = loadBlogPostsSync();
    expect(posts.length).toBe(5);
  });

  it('sorts by date newest first', () => {
    const posts = loadBlogPostsSync();
    expect(posts[0].slug).toBe('draft-post');
  });

  it('applies filters synchronously', () => {
    const posts = loadBlogPostsSync({ publishedOnly: true });
    expect(posts.length).toBe(4);
  });

  it('applies pagination synchronously', () => {
    const posts = loadBlogPostsSync({ limit: 3 });
    expect(posts.length).toBe(3);
  });

  it('returns same results as async version', async () => {
    const syncPosts = loadBlogPostsSync({ publishedOnly: true, limit: 2 });
    const asyncPosts = await loadBlogPosts({ publishedOnly: true, limit: 2 });
    expect(syncPosts.map((p) => p.slug)).toEqual(asyncPosts.map((p) => p.slug));
  });
});





describe('loadBlogPost', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('finds a post by slug', async () => {
    const post = await loadBlogPost('post-a');
    expect(post).not.toBeNull();
    expect(post!.frontmatter.title).toBe('Post A');
  });

  it('uses handle to load from specific user first', async () => {
    const post = await loadBlogPost('post-a', 'alice');
    expect(post).not.toBeNull();
    expect(post!.slug).toBe('post-a');
  });

  it('falls back to findContentBySlug when no handle', async () => {
    const post = await loadBlogPost('post-c');
    expect(post).not.toBeNull();
    expect(post!.frontmatter.title).toBe('Post C');
  });

  it('returns null for missing slug', async () => {
    const post = await loadBlogPost('nonexistent');
    expect(post).toBeNull();
  });

  it('returns null for wrong handle', async () => {
    const post = await loadBlogPost('post-a', 'bob');
    expect(post).toBeNull();
  });

  it('maps frontmatter correctly', async () => {
    const post = await loadBlogPost('post-b');
    expect(post!.frontmatter.tags).toEqual(['typescript', 'node']);
    expect(post!.frontmatter.series).toBe('SvelteKit Deep Dive');
  });

  it('maps content correctly', async () => {
    const post = await loadBlogPost('post-a');
    expect(post!.content).toBe('Content of post A.');
  });

  it('maps filePath correctly', async () => {
    const post = await loadBlogPost('post-a');
    expect(post!.filePath).toBe('/content/users/alice/blog/post-a.md');
  });
});





describe('loadBlogPostSync', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('finds a post by slug synchronously', () => {
    const post = loadBlogPostSync('post-b');
    expect(post).not.toBeNull();
    expect(post!.frontmatter.title).toBe('Post B');
  });

  it('returns null for missing slug', () => {
    const post = loadBlogPostSync('nonexistent');
    expect(post).toBeNull();
  });

  it('returns same result as async version', async () => {
    const syncPost = loadBlogPostSync('post-a');
    const asyncPost = await loadBlogPost('post-a');
    expect(syncPost!.slug).toBe(asyncPost!.slug);
    expect(syncPost!.frontmatter.title).toBe(asyncPost!.frontmatter.title);
  });
});





describe('loadSeries', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('filters by series name', async () => {
    const posts = await loadSeries('SvelteKit Deep Dive');
    expect(posts.length).toBe(2);
    expect(posts.every((p) => p.frontmatter.series === 'SvelteKit Deep Dive')).toBe(true);
  });

  it('sorts by seriesOrder ascending', async () => {
    const posts = await loadSeries('SvelteKit Deep Dive');
    expect(posts[0].frontmatter.seriesOrder).toBe(1);
    expect(posts[1].frontmatter.seriesOrder).toBe(2);
  });

  it('handles missing seriesOrder (treated as 0)', async () => {
    resetConfig();
    const items = [
      makeContentItem({
        metadata: { title: 'No Order', series: 'TestSeries', published: true },
        slug: 'no-order',
      }),
      makeContentItem({
        metadata: { title: 'Has Order', series: 'TestSeries', seriesOrder: 1, published: true },
        slug: 'has-order',
      }),
    ];
    configure(buildMockLoaders(items));
    const posts = await loadSeries('TestSeries');
    expect(posts[0].slug).toBe('no-order');
    expect(posts[1].slug).toBe('has-order');
  });

  it('returns empty for nonexistent series', async () => {
    const posts = await loadSeries('Nonexistent');
    expect(posts).toEqual([]);
  });

  it('returns only posts from the specified series', async () => {
    const posts = await loadSeries('Svelte Basics');
    expect(posts.length).toBe(1);
    expect(posts[0].slug).toBe('post-d');
  });
});





describe('getAllTags', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('returns unique tags', async () => {
    const tags = await getAllTags();
    const unique = new Set(tags);
    expect(tags.length).toBe(unique.size);
  });

  it('returns sorted tags', async () => {
    const tags = await getAllTags();
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
  });

  it('includes tags from all posts', async () => {
    const tags = await getAllTags();
    expect(tags).toContain('svelte');
    expect(tags).toContain('typescript');
    expect(tags).toContain('react');
    expect(tags).toContain('node');
    expect(tags).toContain('draft');
  });

  it('handles posts without tags', async () => {
    resetConfig();
    const items = [
      makeContentItem({ metadata: { title: 'No Tags', published: true }, slug: 'no-tags' }),
    ];
    configure(buildMockLoaders(items));
    const tags = await getAllTags();
    expect(tags).toEqual([]);
  });

  it('respects publishedOnly filter', async () => {
    const tags = await getAllTags({ publishedOnly: true });
    expect(tags).not.toContain('draft');
  });

  it('respects handle filter', async () => {
    const tags = await getAllTags({ handle: 'bob' });
    expect(tags).toContain('react');
    expect(tags).toContain('svelte');
    expect(tags).not.toContain('node');
  });
});





describe('getAllCategories', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('returns unique categories', async () => {
    const cats = await getAllCategories();
    const unique = new Set(cats);
    expect(cats.length).toBe(unique.size);
  });

  it('returns sorted categories', async () => {
    const cats = await getAllCategories();
    const sorted = [...cats].sort();
    expect(cats).toEqual(sorted);
  });

  it('includes categories from all posts', async () => {
    const cats = await getAllCategories();
    expect(cats).toContain('frontend');
    expect(cats).toContain('backend');
    expect(cats).toContain('tutorial');
  });

  it('handles posts without categories', async () => {
    resetConfig();
    const items = [
      makeContentItem({ metadata: { title: 'No Cats', published: true }, slug: 'no-cats' }),
    ];
    configure(buildMockLoaders(items));
    const cats = await getAllCategories();
    expect(cats).toEqual([]);
  });

  it('respects filters', async () => {
    const cats = await getAllCategories({ publishedOnly: true });
    expect(cats).toContain('frontend');
  });
});





describe('getAllSeries', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('returns unique series names', async () => {
    const series = await getAllSeries();
    const unique = new Set(series);
    expect(series.length).toBe(unique.size);
  });

  it('returns sorted series names', async () => {
    const series = await getAllSeries();
    const sorted = [...series].sort();
    expect(series).toEqual(sorted);
  });

  it('includes all series from posts', async () => {
    const series = await getAllSeries();
    expect(series).toContain('SvelteKit Deep Dive');
    expect(series).toContain('Svelte Basics');
  });

  it('handles posts without series', async () => {
    resetConfig();
    const items = [
      makeContentItem({ metadata: { title: 'No Series', published: true }, slug: 'no-series' }),
    ];
    configure(buildMockLoaders(items));
    const series = await getAllSeries();
    expect(series).toEqual([]);
  });

  it('respects filters', async () => {
    const series = await getAllSeries({ handle: 'alice' });
    expect(series).toContain('SvelteKit Deep Dive');
    expect(series).not.toContain('Svelte Basics');
  });
});





describe('getRelatedPosts', () => {
  beforeEach(() => {
    resetConfig();
    configure(buildMockLoaders(FIXTURE_POSTS));
  });

  it('returns related posts based on shared tags', async () => {
    const related = await getRelatedPosts('post-a');
    expect(related.length).toBeGreaterThan(0);
  });

  it('scores shared tags at 2x weight', async () => {
    
    
    
    const related = await getRelatedPosts('post-a');
    const slugs = related.map((p) => p.slug);
    expect(slugs).toContain('post-b');
    expect(slugs).toContain('post-d');
  });

  it('scores shared categories at 1x weight', async () => {
    
    
    const related = await getRelatedPosts('post-a');
    const slugs = related.map((p) => p.slug);
    expect(slugs).toContain('post-c');
  });

  it('scores same series at 10x', async () => {
    
    
    const related = await getRelatedPosts('post-a');
    
    expect(related[0].slug).toBe('post-b');
  });

  it('scores same author at 1x', async () => {
    
    
    const related = await getRelatedPosts('post-a');
    const postB = related.find((p) => p.slug === 'post-b');
    expect(postB).toBeDefined();
  });

  it('excludes the current post from results', async () => {
    const related = await getRelatedPosts('post-a');
    expect(related.find((p) => p.slug === 'post-a')).toBeUndefined();
  });

  it('respects limit parameter', async () => {
    const related = await getRelatedPosts('post-a', 1);
    expect(related.length).toBeLessThanOrEqual(1);
  });

  it('sorts by score descending', async () => {
    const related = await getRelatedPosts('post-a');
    
    
    
    if (related.length >= 2) {
      expect(related[0].slug).toBe('post-b');
    }
  });

  it('returns empty array for unknown slug', async () => {
    const related = await getRelatedPosts('nonexistent');
    expect(related).toEqual([]);
  });

  it('excludes posts with zero score', async () => {
    resetConfig();
    const items = [
      makeContentItem({
        metadata: { title: 'Current', tags: ['unique'], published: true },
        slug: 'current',
      }),
      makeContentItem({
        metadata: { title: 'Unrelated', tags: ['other'], published: true },
        slug: 'unrelated',
      }),
    ];
    configure(buildMockLoaders(items));
    const related = await getRelatedPosts('current');
    expect(related).toEqual([]);
  });

  it('only includes published posts', async () => {
    
    const related = await getRelatedPosts('post-a');
    expect(related.find((p) => p.slug === 'draft-post')).toBeUndefined();
  });

  it('handles default limit of 5', async () => {
    const related = await getRelatedPosts('post-a');
    expect(related.length).toBeLessThanOrEqual(5);
  });
});





describe('calculateReadingTime', () => {
  it('calculates at 200 wpm', () => {
    
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
  });

  it('rounds up partial minutes', () => {
    
    const words = Array(201).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('handles short content', () => {
    expect(calculateReadingTime('hello world')).toBe(1);
  });

  it('handles empty content', () => {
    
    expect(calculateReadingTime('')).toBe(1);
  });

  it('handles long content', () => {
    const words = Array(1000).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(5);
  });

  it('counts words separated by various whitespace', () => {
    const text = 'one\ttwo\nthree   four';
    
    expect(calculateReadingTime(text)).toBe(1);
  });
});





describe('calculateWordCount', () => {
  it('counts words correctly', () => {
    expect(calculateWordCount('one two three')).toBe(3);
  });

  it('handles multiple spaces', () => {
    expect(calculateWordCount('one   two   three')).toBe(3);
  });

  it('handles empty content', () => {
    
    expect(calculateWordCount('')).toBe(1);
  });

  it('counts words with mixed whitespace', () => {
    expect(calculateWordCount('one\ntwo\tthree')).toBe(3);
  });
});





describe('extractExcerpt', () => {
  it('strips markdown headers', () => {
    const result = extractExcerpt('# Hello World');
    expect(result).toBe('Hello World');
  });

  it('strips multiple header levels', () => {
    const result = extractExcerpt('## Second\n### Third');
    expect(result).toBe('Second Third');
  });

  it('removes emphasis markers (* _ ~ `)', () => {
    const result = extractExcerpt('**bold** _italic_ ~strike~ `code`');
    expect(result).toBe('bold italic strike code');
  });

  it('converts links to text', () => {
    const result = extractExcerpt('[Click here](https://example.com) for more');
    expect(result).toBe('Click here for more');
  });

  it('truncates at word boundary', () => {
    const longText = 'word '.repeat(100);
    const result = extractExcerpt(longText, 20);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(23); 
  });

  it('adds ellipsis when truncated', () => {
    const longText = 'This is a very long text that will be truncated';
    const result = extractExcerpt(longText, 15);
    expect(result).toContain('...');
  });

  it('returns short content as-is', () => {
    const result = extractExcerpt('Short text');
    expect(result).toBe('Short text');
  });

  it('respects custom maxLength', () => {
    const text = 'one two three four five six seven eight nine ten';
    const result = extractExcerpt(text, 10);
    expect(result.length).toBeLessThanOrEqual(13); 
  });

  it('replaces newlines with spaces', () => {
    const result = extractExcerpt('line one\nline two\n\nline three');
    expect(result).toBe('line one line two line three');
  });

  it('trims leading and trailing whitespace', () => {
    const result = extractExcerpt('  hello world  ');
    expect(result).toBe('hello world');
  });
});
