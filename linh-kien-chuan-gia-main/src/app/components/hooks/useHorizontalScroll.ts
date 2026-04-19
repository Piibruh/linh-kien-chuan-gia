import { useRef, useState, useEffect, useCallback } from 'react';

interface UseHorizontalScrollOptions {
  scrollPercent?: number; // Percentage of container width to scroll (default: 0.8)
  edgeThreshold?: number; // Pixels from edge to consider at edge (default: 5)
  enableKeyboard?: boolean; // Enable arrow key navigation (default: true)
}

export function useHorizontalScroll(options: UseHorizontalScrollOptions = {}) {
  const { scrollPercent = 0.8, edgeThreshold = 5, enableKeyboard = true } = options;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position and update button states
  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(scrollLeft > edgeThreshold);
    setCanScrollRight(scrollLeft < maxScroll - edgeThreshold);
  }, [edgeThreshold]);

  // Scroll function
  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollAmount = container.clientWidth * scrollPercent;
      const targetScroll =
        direction === 'left'
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    },
    [scrollPercent]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();

    // Scroll handler throttled by rAF (keeps scrolling smooth)
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateScrollButtons();
      });
    };

    // Resize handler (debounced)
    let resizeTimeout: number | undefined;
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => updateScrollButtons(), 100);
    };

    // Keyboard navigation handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableKeyboard) return;
      const el = scrollContainerRef.current;
      if (!el) return;

      // Only handle if container or its children are focused
      if (!el.contains(document.activeElement)) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const leftOk = el.scrollLeft > edgeThreshold;
      const rightOk = el.scrollLeft < maxScroll - edgeThreshold;

      if (e.key === 'ArrowLeft' && leftOk) {
        e.preventDefault();
        scroll('left');
      } else if (e.key === 'ArrowRight' && rightOk) {
        e.preventDefault();
        scroll('right');
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    if (enableKeyboard) document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (enableKeyboard) document.removeEventListener('keydown', handleKeyDown);
    };
  }, [updateScrollButtons, scroll, enableKeyboard, edgeThreshold]);

  return {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scroll,
  };
}
