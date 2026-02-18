import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentsModal from '../components/CommentsModalNew';

const FeedPost = ({ post, onLike, onComment, onSave, onShare }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef(null);
  const postRef = useRef(null);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
      onLike?.(post.id);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
    onComment?.(post.id);
  };

  useEffect(() => {
    const video = videoRef.current;
    const post = postRef.current;
    
    if (video && post) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: [0.5] }
      );
      observer.observe(post);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <>
      <article ref={postRef} className="bg-white border-b border-gray-100 mb-6">
        {/* Header */}
        <header className="flex items-center px-4 py-3">
          <img
            src={post.user.avatar_url}
            alt={post.user.username}
            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
          />
          <div className="ml-3 flex-1">
            <span className="font-semibold text-sm text-black cursor-pointer hover:underline">
              {post.user.username}
            </span>
          </div>
          <button className="text-gray-900 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </header>

        {/* Media */}
        <div className="relative select-none" onDoubleClick={handleDoubleClick}>
          {post.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={post.media_url}
              className="w-full aspect-square object-cover cursor-pointer"
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={post.media_url}
              alt="Post content"
              className="w-full aspect-square object-cover cursor-pointer"
              draggable={false}
            />
          )}
          
          {/* Double-tap heart animation */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="animate-heart-burst">
                <svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLikeClick}
                className="transition-all duration-200 hover:scale-110 active:scale-95 p-1"
              >
                <svg
                  className={`w-6 h-6 transition-all duration-200 ${
                    isLiked ? 'text-red-500 fill-current scale-110' : 'text-black'
                  }`}
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={isLiked ? 0 : 1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handleCommentsClick}
                className="transition-transform duration-150 hover:scale-110 active:scale-95 p-1"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button
                onClick={() => onShare?.(post.id)}
                className="transition-transform duration-150 hover:scale-110 active:scale-95 p-1"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleSaveClick}
              className="transition-transform duration-150 hover:scale-110 active:scale-95 p-1"
            >
              <svg
                className={`w-6 h-6 transition-colors duration-200 ${
                  isSaved ? 'text-black fill-current' : 'text-black'
                }`}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isSaved ? 0 : 1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          </div>

          {/* Likes count */}
          {likesCount > 0 && (
            <div className="mb-2">
              <button className="font-semibold text-sm text-black hover:text-gray-600 transition-colors">
                {likesCount.toLocaleString()} likes
              </button>
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="mb-2">
              <span className="font-semibold text-sm text-black mr-2">{post.user.username}</span>
              <span className="text-sm text-black">{post.caption}</span>
            </div>
          )}

          {/* Comments preview */}
          {post.comments_count > 0 && (
            <button
              onClick={handleCommentsClick}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 block"
            >
              View all {post.comments_count} comments
            </button>
          )}

          {/* Time */}
          <div className="pb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">{post.created_at}</span>
          </div>
        </div>
      </article>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
      />
    </>
  );
};

const PostSkeleton = () => (
  <div className="bg-white border-b border-gray-100 mb-6 animate-pulse">
    <div className="flex items-center px-4 py-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="ml-3 flex-1">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="w-full aspect-square bg-gray-200"></div>
    <div className="px-4 pt-3 pb-6">
      <div className="flex items-center space-x-4 mb-3">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-2 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  // Mock data for demo
  const mockPosts = [
    {
      id: 1,
      user: {
        username: 'alice_j',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Beautiful sunset from my travels ✨ #wanderlust #photography',
      likes_count: 1247,
      comments_count: 23,
      created_at: '2 hours ago'
    },
    {
      id: 2,
      user: {
        username: 'david_w',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      media_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Coffee and code 💻☕ Perfect morning combo',
      likes_count: 892,
      comments_count: 15,
      created_at: '4 hours ago'
    },
    {
      id: 3,
      user: {
        username: 'sarah_m',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Morning workout done! 💪 Feeling energized and ready for the day #fitness #motivation',
      likes_count: 2156,
      comments_count: 67,
      created_at: '6 hours ago'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const lastPostElementRef = useRef();
  
  useEffect(() => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // Load more posts
        console.log('Loading more posts...');
      }
    });
    
    if (lastPostElementRef.current) {
      observerRef.current.observe(lastPostElementRef.current);
    }
  }, [loading, hasMore]);

  const handleLike = (postId) => {
    console.log('Liked post:', postId);
  };

  const handleComment = (postId) => {
    console.log('Comment on post:', postId);
  };

  const handleSave = (postId) => {
    console.log('Saved post:', postId);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {loading ? (
        <div>
          {[1, 2, 3].map(i => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div>
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : null}
            >
              <FeedPost
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onShare={handleShare}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;