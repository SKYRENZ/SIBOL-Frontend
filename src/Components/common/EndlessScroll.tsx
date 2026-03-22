import React, { useState, useEffect, useRef, useCallback } from 'react';

interface EndlessScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

const EndlessScroll: React.FC<EndlessScrollProps> = ({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
  className = '',
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    if (!targetRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    if (observerRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current && targetRef.current) {
        observerRef.current.unobserve(targetRef.current);
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div 
          ref={targetRef}
          className="flex justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading more machines...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Scroll down to load more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EndlessScroll;
