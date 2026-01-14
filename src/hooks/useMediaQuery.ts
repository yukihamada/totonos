import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches.
 * @param query - The media query to match (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Check if window is defined (for SSR compatibility)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints for common use cases.
 */
export const breakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

/**
 * Hook that returns the current device type based on screen width.
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useMediaQuery(breakpoints.mobile);
  const isTablet = useMediaQuery(breakpoints.tablet);

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Convenience hook for checking if the device is mobile.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Convenience hook for checking if the device is touch-capable.
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}
