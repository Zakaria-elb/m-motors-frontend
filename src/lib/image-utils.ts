export function resolveImageUrl(url?: string | null): string {
  if (!url) return '/car-placeholder.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}
