import { useEffect } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { getOptimizedUrl, IMAGE_SIZES } from '@/lib/image-utils';

/**
 * Preloads the currently selected wall image via <link rel="preload">.
 * Only preloads the main center scene image for fastest FCP.
 */
export default function ImagePreloader() {
  const { getSelectedWall, getSelectedDoor } = useShowroom();
  const wall = getSelectedWall();
  const door = getSelectedDoor();

  useEffect(() => {
    const urls: string[] = [];

    if (wall?.image) {
      urls.push(getOptimizedUrl(wall.image, IMAGE_SIZES.desktop));
    }
    if (door?.image) {
      urls.push(getOptimizedUrl(door.image, IMAGE_SIZES.desktop));
    }

    const links: HTMLLinkElement[] = [];

    urls.forEach(url => {
      // Remove previous preload links
      const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach(link => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [wall?.image, door?.image]);

  return null;
}
