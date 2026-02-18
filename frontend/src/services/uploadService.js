import { 
  collection, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const uploadPost = async (postData, onProgress) => {
  try {
    const { caption, location, user, mediaUrl, mediaType } = postData;
    
    // Simulate progress for consistency
    if (onProgress) {
      onProgress(100);
    }
    
    // Create post document in Firestore
    const postDoc = {
      userId: user.uid,
      user: {
        uid: user.uid,
        username: user.username,
        displayName: user.displayName,
        photoURL: user.photoURL || ''
      },
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'image',
      caption: caption?.trim() || '',
      location: location?.trim() || '',
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'posts'), postDoc);
    
    // Update user's post count
    await updateDoc(doc(db, 'users', user.uid), {
      posts: increment(1)
    });
    
    return {
      id: docRef.id,
      ...postDoc,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error uploading post:', error);
    throw error;
  }
};