import { useState, useEffect } from 'react';

const ActivityItem = ({ activity }) => {
  const getActivityText = () => {
    switch (activity.type) {
      case 'like':
        return 'liked your photo.';
      case 'comment':
        return 'commented on your photo.';
      case 'follow':
        return 'started following you.';
      case 'mention':
        return 'mentioned you in a comment.';
      default:
        return '';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  return (
    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
      <img
        src={activity.user.avatar_url}
        alt={activity.user.username}
        className="w-11 h-11 rounded-full object-cover cursor-pointer"
      />
      <div className="ml-3 flex-1">
        <div className="text-sm">
          <span className="font-semibold text-black cursor-pointer hover:underline">
            {activity.user.username}
          </span>
          <span className="text-gray-700 ml-1">{getActivityText()}</span>
          <span className="text-gray-400 ml-2 text-xs">
            {getTimeAgo(activity.timestamp)}
          </span>
        </div>
      </div>
      
      <div className="ml-3">
        {activity.type === 'follow' ? (
          <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors duration-200">
            Follow
          </button>
        ) : activity.post_thumbnail ? (
          <img
            src={activity.post_thumbnail}
            alt="Post"
            className="w-11 h-11 object-cover cursor-pointer"
          />
        ) : null}
      </div>
    </div>
  );
};

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const mockActivities = [
    {
      id: 1,
      type: 'like',
      user: {
        username: 'alice_j',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      post_thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'comment',
      user: {
        username: 'david_w',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      post_thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=150&h=150&fit=crop',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'follow',
      user: {
        username: 'sarah_m',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !activity.read;
    return activity.type === activeTab;
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center px-4 py-3">
              <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
              <div className="ml-3 flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-11 h-11 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-black">Activity</h1>
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'like', label: 'Likes' },
            { id: 'comment', label: 'Comments' },
            { id: 'follow', label: 'Follows' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredActivities.length > 0 ? (
          filteredActivities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500 text-center">
              When people interact with your posts, you will see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;