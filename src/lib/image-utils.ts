/**
 * Image optimization utilities for Supabase Storage images.
 * Generates responsive URLs with WebP format and size transformations.
 */

const SUPABASE_STORAGE_HOST = 'supabase.co/storage';

/** Check if URL is a Supabase storage URL that supports transformations */
function isTransformable(url: string): boolean {
  return url.includes(SUPABASE_STORAGE_HOST) || url.includes('supabase');
}

/** Image size presets */
export const IMAGE_SIZES = {
  mobile: 720,
  tablet: 1280,
  desktop: 1920,
  thumbnail: 200,
} as const;

/**
 * Generate an optimized image URL with Supabase image transformations.
 * Falls back to original URL if not a Supabase storage image.
 */
export function getOptimizedUrl(
  url: string | null | undefined,
  width: number = IMAGE_SIZES.desktop,
  quality: number = 80,
): string {
  if (!url) return '';

  // If it's a Supabase storage URL, use render/image transform
  if (isTransformable(url)) {
    // Supabase storage transform: /render/image/public/... → /render/image/public/...?width=X&format=webp
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&resize=contain&quality=${quality}`;
  }

  return url;
}

/**
 * Generate srcSet string for responsive images
 */
export function getSrcSet(url: string | null | undefined): string {
  if (!url || !isTransformable(url)) return '';

  return [
    `${getOptimizedUrl(url, IMAGE_SIZES.mobile)} ${IMAGE_SIZES.mobile}w`,
    `${getOptimizedUrl(url, IMAGE_SIZES.tablet)} ${IMAGE_SIZES.tablet}w`,
    `${getOptimizedUrl(url, IMAGE_SIZES.desktop)} ${IMAGE_SIZES.desktop}w`,
  ].join(', ');
}

/**
 * Generate thumbnail srcSet for sidebar/picker images
 */
export function getThumbnailUrl(url: string | null | undefined): string {
  if (!url) return '';
  return getOptimizedUrl(url, IMAGE_SIZES.thumbnail, 70);
}

/** GPU-accelerated styles for image containers */
export const gpuAccelStyle: React.CSSProperties = {
  willChange: 'transform',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};
