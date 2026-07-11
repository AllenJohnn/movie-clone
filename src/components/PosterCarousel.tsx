import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieOrShow } from '../types';
import { PosterCard } from './PosterCard';

interface PosterCarouselProps {
  title: string;
  items: MovieOrShow[];
  fallbackMediaType?: 'movie' | 'tv';
  isLoading?: boolean;
}

export const PosterCarousel: React.FC<PosterCarouselProps> = ({
  title,
  items,
  fallbackMediaType,
  isLoading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScrollArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollArrows);
      // Run once on load/render
      checkScrollArrows();
      
      // Setup a ResizeObserver to handle screen size changes
      const observer = new ResizeObserver(() => checkScrollArrows());
      observer.observe(el);
      
      return () => {
        el.removeEventListener('scroll', checkScrollArrows);
        observer.disconnect();
      };
    }
  }, [items, isLoading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of view width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Mouse drag-to-scroll implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed factor
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-8 lg:px-12">
        <div className="h-6 w-48 rounded bg-card-dark animate-shimmer mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-none w-[160px] sm:w-[180px] md:w-[200px] aspect-[2/3] rounded-xl bg-card-dark animate-shimmer"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative py-6 group/carousel select-none px-4 md:px-8 lg:px-12">
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight text-white/90">
        {title}
      </h2>

      {/* Outer Wrapper */}
      <div className="relative">
        {/* Left Control Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-[-16px] md:left-[-24px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full glass border border-white/10 hover:border-brand text-white shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Control Arrow */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-[-16px] md:right-[-24px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full glass border border-white/10 hover:border-brand text-white shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-4 overflow-x-auto py-2 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none`}
          style={{ scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
        >
          {items.map((item) => (
            <div key={item.id} className="scroll-snap-align-start flex-none">
              <PosterCard media={item} fallbackMediaType={fallbackMediaType} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
