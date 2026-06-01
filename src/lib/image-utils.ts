export function resolveImageUrl(url?: string | null): string {
  if (!url) return '/car-placeholder.jpg';
  
  // 🔥 Les anciennes URLs absolues backend → convertir en chemin relatif (proxy Next.js)
  if (url.startsWith('http://localhost:3001')) {
    return url.replace('http://localhost:3001', '');
  }
  
  // URLs externes (Unsplash, etc.) : on les garde
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Déjà relatif (/vehicles/xxx.jpg ou /uploads/xxx.jpg)
  return url;
}
