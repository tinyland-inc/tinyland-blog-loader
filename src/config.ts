













export interface ContentItem {
  metadata: Record<string, unknown>;
  content: string;
  slug: string;
  filePath: string;
  ownerHandle?: string;
}







export interface BlogLoaderConfig {
  



  loadContent?: (
    contentType: string,
    options?: { handle?: string; aggregateAll?: boolean },
  ) => ContentItem[];

  


  loadSingleContent?: (
    contentType: string,
    slug: string,
    handle: string,
  ) => ContentItem | null;

  


  findContentBySlug?: (
    contentType: string,
    slug: string,
  ) => ContentItem | null;
}

let _config: BlogLoaderConfig = {};





export function configure(config: Partial<BlogLoaderConfig>): void {
  _config = { ..._config, ...config };
}





export function getConfig(): BlogLoaderConfig {
  return { ..._config };
}





export function resetConfig(): void {
  _config = {};
}
