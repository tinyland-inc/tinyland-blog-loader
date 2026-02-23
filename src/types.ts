










export interface VideoEmbed {
  url: string;
  title: string;
  platform: 'youtube' | 'peertube' | 'vimeo';
  thumbnailUrl?: string;
  videoId?: string;
}




export interface Reference {
  title: string;
  url: string;
  description?: string;
  author?: string;
}








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




export interface LoadedBlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  slug: string;
  filePath: string;
}




export interface BlogListOptions {
  
  handle?: string;
  
  visibility?: string[];
  
  limit?: number;
  
  offset?: number;
  
  tags?: string[];
  
  series?: string;
  
  publishedOnly?: boolean;
  
  categories?: string[];
}
