export const getFullImageUrl = (path?: string): string => {
  if (!path) return '';

  // Data URLs and blobs are already usable.
  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const cdnBase = (import.meta.env.VITE_CDN_URL || apiUrl).replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');

  // If the path is an absolute URL, decide whether to rewrite it or keep as-is.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);

      // Rewrite private R2 storage URLs to go through the backend worker
      if (parsed.hostname.endsWith('.r2.cloudflarestorage.com')) {
        // Extract the R2 key after the bucket name segment
        // e.g. /ecommerce/uploads/uuid.webp → /uploads/uuid.webp
        const segments = parsed.pathname.split('/').filter(Boolean);
        // Drop the bucket name (first segment), keep the rest
        const key = segments.length > 1 ? segments.slice(1).join('/') : segments.join('/');
        return `${apiUrl}/${key}`;
      }

      // Preserve URLs that already point to the CDN or the API.
      const baseHosts = new Set([
        new URL(cdnBase).hostname,
        new URL(apiUrl).hostname
      ]);
      if (baseHosts.has(parsed.hostname)) {
        return path;
      }

      // Development placeholder hosts that should be rewritten to the local API URL.
      const placeholderHosts = new Set(['cdn.example.local', 'localhost', '127.0.0.1']);
      if (placeholderHosts.has(parsed.hostname)) {
        return `${apiUrl}/${parsed.pathname.replace(/^\/+/, '')}`;
      }
    } catch {
      // If parsing fails, fall back to default handling below.
    }
    // External URLs (e.g., third-party CDN) are returned unchanged.
    return path;
  }

  // For relative paths (including those starting with a slash), prepend the CDN base.
  return `${cdnBase}/${normalizedPath}`;
};
