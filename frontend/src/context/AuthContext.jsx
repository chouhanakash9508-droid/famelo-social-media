import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data()
            });
          } else {
            // Create user document if it doesn't exist
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.email.split('@')[0],
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL || '',
              bio: '',
              followers: 0,
              following: 0,
              posts: 0,
              createdAt: new Date().toISOString(),
              isVerified: false,
              is_admin: false
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userData });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Don't set user to null if there's an error, just log it
          if (!user) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.email.split('@')[0],
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
            });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, username, fullName) => {
    try {
      setLoading(true);
      console.log('Starting signup process...');
      
      // Check if username is already taken
      console.log('Checking username availability...');
      const usernameQuery = await getDoc(doc(db, 'usernames', username.toLowerCase()));
      if (usernameQuery.exists()) {
        throw new Error('Username is already taken');
      }
      console.log('Username available');

      console.log('Creating Firebase Auth user...');
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase Auth user created:', firebaseUser.uid);
      
      console.log('Updating user profile...');
      await updateProfile(firebaseUser, {
        displayName: fullName
      });
      console.log('Profile updated');

      const userData = {
        uid: firebaseUser.uid,
        email,
        username: username.toLowerCase(),
        displayName: fullName,
        photoURL: '',
        bio: '',
        followers: 0,
        following: 0,
        posts: 0,
        createdAt: new Date().toISOString(),
        isVerified: false,
        is_admin: false
      };

      console.log('Creating user document in Firestore...');
      // Create user document and reserve username
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      console.log('User document created');
      
      console.log('Reserving username...');
      await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: firebaseUser.uid });
      console.log('Username reserved');
      
      setUser({ uid: firebaseUser.uid, email, ...userData });
      toast.success('Welcome to Famelo!');
      console.log('Signup completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      let message = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
        case 'permission-denied':
        case 'firestore/permission-denied':
          message = 'Permission denied. Please check Firestore rules.';
          break;
        default:
          message = error.message || 'Failed to create account';
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername, password) => {
    try {
      setLoading(true);
      let email = emailOrUsername;
      
      // Check if input is username (no @ symbol)
      if (!emailOrUsername.includes('@')) {
        const usernameDoc = await getDoc(doc(db, 'usernames', emailOrUsername.toLowerCase()));
        if (usernameDoc.exists()) {
          const userDoc = await getDoc(doc(db, 'users', usernameDoc.data().uid));
          if (userDoc.exists()) {
            email = userDoc.data().email;
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('Username not found');
        }
      }

      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data()
        });
      }

      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Invalid credentials';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Incorrect username or password';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Try again later';
          break;
        default:
          message = error.message || 'Login failed';
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let message = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
        default:
          message = error.message || 'Failed to send reset email';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      setUser(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    initializing,
    isAuthenticated: !!user,
    isLoading: loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}