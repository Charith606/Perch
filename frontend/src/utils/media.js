/**
 * Helper to identify if a media item or URL is a video
 */
export function isVideoUrl(item) {
  if (!item) return false;
  const url = typeof item === 'string' ? item : item.url || '';
  if (typeof item === 'object' && item.type === 'video') return true;
  
  if (url.startsWith('data:video/')) return true;
  
  const cleanUrl = url.toLowerCase().split('?')[0];
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.m4v')
  );
}

export function getMediaUrl(item) {
  if (!item) return '';
  return typeof item === 'string' ? item : item.url || '';
}
