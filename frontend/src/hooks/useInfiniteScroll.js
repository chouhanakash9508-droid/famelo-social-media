import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export const useInfiniteScroll = (fetchMore, hasMore = true) => {
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      await fetchMore();
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, hasMore, loading]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  return { ref, loading };
};