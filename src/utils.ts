












export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}







export function calculateWordCount(content: string): number {
  return content.split(/\s+/).length;
}











export function extractExcerpt(content: string, maxLength: number = 200): string {
  
  const plainText = content
    .replace(/#{1,6}\s/g, '')                     
    .replace(/[*_~`]/g, '')                        
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')       
    .replace(/\n+/g, ' ')                          
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
}
