import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  where,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const uploadPost = async (postData) => {
  try {
    const { caption, location, mediaType, mediaUrl } = postData;

    // Create post document with provided mediaUrl
    const post = {
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'image',
      caption: caption || '',
      location: location || '',
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      userId: postData.userId,
      user: postData.user
    };

    const docRef = await addDoc(collection(db, 'posts'), post);
    
    return { id: docRef.id, ...post };
  } catch (error) {
    console.error('Error uploading post:', error);
    throw error;
  }
};

export const getPosts = async (page = 1, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (page > 1) {
      // For pagination, you'd need to implement proper cursor-based pagination
      // This is a simplified version
      const offset = (page - 1) * pageSize;
      q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        isLiked: false, // You'd check this against user's likes
        isSaved: false  // You'd check this against user's saved posts
      });
    });

    return {
      posts,
      hasMore: posts.length === pageSize
    };
  } catch (error) {
    console.error('Error getting posts:', error);
    return { posts: [], hasMore: false };
  }
};

export const getExplorePosts = async () => {
  try {
    const q = query(
      collection(db, 'posts'),
      orderBy('likesCount', 'desc'),
      limit(30)
    );

    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return posts;
  } catch (error) {
    console.error('Error getting explore posts:', error);
    return [];
  }
};

export const likePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, 'likes', `${userId}_${postId}`);
    
    // Check if already liked
    const likeDoc = await getDoc(likeRef);
    
    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likesCount: increment(-1)
      });
      return false;
    } else {
      // Like
      await addDoc(collection(db, 'likes'), {
        userId,
        postId,
        createdAt: new Date().toISOString()
      });
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const savePost = async (postId, userId) => {
  try {
    const saveRef = doc(db, 'saves', `${userId}_${postId}`);
    
    // Check if already saved
    const saveDoc = await getDoc(saveRef);
    
    if (saveDoc.exists()) {
      // Unsave
      await deleteDoc(saveRef);
      return false;
    } else {
      // Save
      await addDoc(collection(db, 'saves'), {
        userId,
        postId,
        createdAt: new Date().toISOString()
      });
      return true;
    }
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

export const addComment = async (postId, userId, text) => {
  try {
    const comment = {
      postId,
      userId,
      text,
      createdAt: new Date().toISOString(),
      likesCount: 0
    };

    const docRef = await addDoc(collection(db, 'comments'), comment);
    
    // Update post comments count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    return { id: docRef.id, ...comment };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    // Firebase doesn't support full-text search natively
    // This is a simplified search that looks for exact matches
    // In production, you'd use Algolia or similar service
    
    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchTerm.toLowerCase()),
      where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Default export object containing all functions
const postService = {
  uploadPost,
  getPosts,
  getExplorePosts,
  likePost,
  savePost,
  addComment,
  getComments,
  searchUsers
};

export { postService };
export default postService;