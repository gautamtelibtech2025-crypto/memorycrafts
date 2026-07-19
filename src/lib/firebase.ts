import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, setLogLevel, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { UserProfile } from '../types';
import { apiUpload, apiDelete } from './api';

// Check if Firebase config is provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

let app;
let auth: any;
let db: any;
const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    // Suppress Firestore verbose warnings/debug logs
    setLogLevel('error');
  } catch (error) {
    console.error('Failed to initialize real Firebase, falling back to Mock:', error);
  }
}

// Simple PubSub for Auth change listeners in mock mode
const mockAuthListeners: Array<(user: any) => void> = [];

// Local storage keys for Mock Mode
const MOCK_USER_KEY = 'memorycraft_mock_user';
const MOCK_PROFILES_KEY = 'memorycraft_mock_profiles';

const getMockProfiles = (): Record<string, any> => {
  try {
    const data = localStorage.getItem(MOCK_PROFILES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveMockProfiles = (profiles: Record<string, any>) => {
  localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));
};

// Simulated user object for Mock mode when signed in
let currentMockUser: any = null;
try {
  const savedUser = localStorage.getItem(MOCK_USER_KEY);
  if (savedUser) {
    currentMockUser = JSON.parse(savedUser);
  }
} catch {
  currentMockUser = null;
}

export { auth, db };

// Unified Auth state subscription
export function subscribeToAuthState(callback: (user: any) => void) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create profile
        const profile = await syncUserProfile(firebaseUser);
        callback(profile);
      } else {
        callback(null);
      }
    });
  } else {
    // Mock mode subscription
    mockAuthListeners.push(callback);
    // Emit current state initially (async to match firebase behavior)
    setTimeout(() => {
      if (currentMockUser) {
        const profiles = getMockProfiles();
        const profile = profiles[currentMockUser.uid] || currentMockUser;
        callback(profile);
      } else {
        callback(null);
      }
    }, 100);

    return () => {
      const index = mockAuthListeners.indexOf(callback);
      if (index > -1) {
        mockAuthListeners.splice(index, 1);
      }
    };
  }
}

// Automatically create user document if not exist
export async function syncUserProfile(user: any): Promise<UserProfile> {
  const now = new Date().toISOString();
  const cacheKey = `firebase_profile_cache_${user.uid}`;
  
  if (isFirebaseConfigured && db) {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update the user document with updated photo/name if changed
        const updatedData = {
          updatedAt: now,
          // Sync any changes from social login
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL,
        };
        try {
          await updateDoc(userDocRef, updatedData);
        } catch (updateErr: any) {
          console.warn('Non-fatal: failed to update user profile doc in Firestore (possibly offline):', updateErr.message || updateErr);
        }
        
        const profile: UserProfile = {
          uid: user.uid,
          displayName: data.displayName || user.displayName,
          email: data.email || user.email,
          photoURL: data.photoURL || user.photoURL,
          phoneNumber: data.phoneNumber || user.phoneNumber || '',
          createdAt: data.createdAt || now,
          updatedAt: now,
          country: data.country || '',
          state: data.state || '',
          city: data.city || '',
        };
        
        // Save to local cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(profile));
        } catch (cacheErr) {
          console.info('Failed to save profile cache:', cacheErr);
        }
        
        return profile;
      } else {
        // First-time registration
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Bespoke Patron',
          email: user.email,
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
          phoneNumber: user.phoneNumber || '',
          createdAt: now,
          updatedAt: now,
          country: '',
          state: '',
          city: '',
        };
        try {
          await setDoc(userDocRef, newProfile);
        } catch (setErr: any) {
          console.info('Non-fatal: failed to create user profile doc in Firestore (possibly offline):', setErr.message || setErr);
        }
        
        // Save to local cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(newProfile));
        } catch (cacheErr) {
          console.info('Failed to save profile cache:', cacheErr);
        }
        
        return newProfile;
      }
    } catch (err: any) {
      console.info('Notice: Firestore profile sync failed (possibly offline). Falling back to local cache or credentials:', err.message || err);
      
      // Try to load from local cache
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (cacheErr) {
        console.info('Failed to load profile from cache:', cacheErr);
      }
      
      // Secondary fallback
      return {
        uid: user.uid,
        displayName: user.displayName || 'Bespoke Patron',
        email: user.email,
        photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        phoneNumber: user.phoneNumber || '',
        createdAt: now,
        updatedAt: now,
        country: '',
        state: '',
        city: '',
      };
    }
  } else {
    // Mock Mode sync
    const profiles = getMockProfiles();
    let existing = profiles[user.uid];
    if (existing) {
      existing.updatedAt = now;
      profiles[user.uid] = existing;
      saveMockProfiles(profiles);
      return existing;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Olivia',
        email: user.email || 'lakshyachoudhary5656@gmail.com',
        photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        phoneNumber: user.phoneNumber || '+1 (555) 019-2834',
        createdAt: now,
        updatedAt: now,
        country: 'United States',
        state: 'New York',
        city: 'Manhattan',
      };
      profiles[user.uid] = newProfile;
      saveMockProfiles(profiles);
      return newProfile;
    }
  }
}

// Sign in using Google Provider
export async function signInWithGoogle(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userProfile = await syncUserProfile(result.user);
      return userProfile;
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  } else {
    // Mock mode simulated Google Sign In
    return new Promise((resolve, reject) => {
      // Simulate Google Sign-In Popup with latency
      setTimeout(() => {
        // Check if cancel was requested or just complete it
        const mockGoogleUser = {
          uid: 'mock-google-user-12345',
          displayName: 'Olivia',
          email: 'lakshyachoudhary5656@gmail.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
          phoneNumber: '+1 (555) 019-2834',
        };
        
        currentMockUser = mockGoogleUser;
        localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockGoogleUser));
        
        // Save to profiles
        const now = new Date().toISOString();
        const profiles = getMockProfiles();
        if (!profiles[mockGoogleUser.uid]) {
          profiles[mockGoogleUser.uid] = {
            ...mockGoogleUser,
            createdAt: now,
            updatedAt: now,
            country: 'United States',
            state: 'New York',
            city: 'Manhattan',
          };
          saveMockProfiles(profiles);
        }
        
        const activeProfile = profiles[mockGoogleUser.uid];
        
        // Notify listeners
        mockAuthListeners.forEach((listener) => listener(activeProfile));
        resolve(activeProfile);
      }, 1000);
    });
  }
}

// Sign in with Email and Password
export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await syncUserProfile(result.user);
      return userProfile;
    } catch (error: any) {
      console.error('Email Login Error:', error);
      throw error;
    }
  } else {
    // Mock mode simulated Email Login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const profiles = getMockProfiles();
        const found = Object.values(profiles).find((p: any) => p.email === email);
        if (found) {
          currentMockUser = {
            uid: found.uid,
            displayName: found.displayName,
            email: found.email,
            photoURL: found.photoURL,
            phoneNumber: found.phoneNumber,
          };
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(currentMockUser));
          mockAuthListeners.forEach((listener) => listener(found));
          resolve(found);
        } else {
          const err = new Error('No user found with this email. Please register first.');
          (err as any).code = 'auth/user-not-found';
          reject(err);
        }
      }, 1000);
    });
  }
}

// Register with Email and Password
export async function registerWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && auth) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set the display name on the auth profile
      await updateProfile(result.user, {
        displayName: displayName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
      });
      // Force refresh auth user to populate updated profile fields
      await result.user.reload();
      const updatedUser = auth.currentUser;
      const userProfile = await syncUserProfile(updatedUser || result.user);
      return userProfile;
    } catch (error: any) {
      console.error('Email Registration Error:', error);
      throw error;
    }
  } else {
    // Mock mode simulated Registration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const profiles = getMockProfiles();
        const exists = Object.values(profiles).some((p: any) => p.email === email);
        if (exists) {
          const err = new Error('An account already exists with this email address.');
          (err as any).code = 'auth/email-already-in-use';
          reject(err);
        } else {
          const uid = `mock-email-user-${Math.floor(10000 + Math.random() * 90000)}`;
          const newProfile: UserProfile = {
            uid,
            displayName,
            email,
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
            phoneNumber: '',
            createdAt: now,
            updatedAt: now,
            country: '',
            state: '',
            city: '',
          };
          profiles[uid] = newProfile;
          saveMockProfiles(profiles);
          
          currentMockUser = {
            uid,
            displayName,
            email,
            photoURL: newProfile.photoURL,
            phoneNumber: '',
          };
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(currentMockUser));
          
          mockAuthListeners.forEach((listener) => listener(newProfile));
          resolve(newProfile);
        }
      }, 1000);
    });
  }
}

// Send password reset email
export async function sendPasswordReset(email: string): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  } else {
    // Mock mode simulated reset
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const profiles = getMockProfiles();
        const exists = Object.values(profiles).some((p: any) => p.email === email);
        if (exists) {
          resolve();
        } else {
          const err = new Error('No user found with this email.');
          (err as any).code = 'auth/user-not-found';
          reject(err);
        }
      }, 1000);
    });
  }
}

// Log out
export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  } else {
    currentMockUser = null;
    localStorage.removeItem(MOCK_USER_KEY);
    mockAuthListeners.forEach((listener) => listener(null));
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const cacheKey = `firebase_profile_cache_${uid}`;
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {}
        return data;
      }
    } catch (err: any) {
      console.info('Notice: Failed to get user profile from Firestore:', err.message || err);
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
    }
    return null;
  } else {
    const profiles = getMockProfiles();
    return profiles[uid] || null;
  }
}

// Save user profile edits
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const updatedProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  const cacheKey = `firebase_profile_cache_${profile.uid}`;

  if (isFirebaseConfigured && db) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(updatedProfile));
    } catch {}

    const userDocRef = doc(db, 'users', profile.uid);
    // Avoid updating email (though UI handles this, enforce security/rules)
    const { email, createdAt, ...editableFields } = updatedProfile;
    try {
      await setDoc(userDocRef, {
        ...editableFields,
        updatedAt: updatedProfile.updatedAt,
      }, { merge: true });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'users/' + profile.uid);
    }

    // Update Firebase Auth profile display name if changed
    if (auth && auth.currentUser) {
      if (auth.currentUser.displayName !== updatedProfile.displayName) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: updatedProfile.displayName || ''
          });
        } catch (authErr: any) {
          console.error('Failed to update Firebase Auth profile display name:', authErr);
          throw authErr;
        }
      }
    }
  } else {
    const profiles = getMockProfiles();
    profiles[profile.uid] = updatedProfile;
    saveMockProfiles(profiles);
    
    // Notify listeners about updated user details
    mockAuthListeners.forEach((listener) => listener(updatedProfile));
  }
}

// Upload a profile picture
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (isFirebaseConfigured && auth) {
    // Real mode upload to Django
    const formData = new FormData();
    formData.append('file', file);
    const result = await apiUpload('/api/users/profile-photo/', formData);
    
    // Update the user's Firestore profile photoURL
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, {
        photoURL: result.photoURL,
        updatedAt: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn('Failed to update Firestore photoURL:', dbErr);
    }

    // Update the Firebase Auth user's photoURL
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          photoURL: result.photoURL
        });
      } catch (authErr) {
        console.warn('Failed to update Firebase Auth user photoURL:', authErr);
      }
    }

    // Clear/update local cache
    const cacheKey = `firebase_profile_cache_${uid}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.photoURL = result.photoURL;
        parsed.updatedAt = new Date().toISOString();
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
      }
    } catch (cacheErr) {
      console.info('Failed to update profile cache:', cacheErr);
    }

    return result.photoURL;
  } else {
    // Mock mode: Convert to base64 Data URL and save in mock profiles
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Url = e.target?.result as string;
        
        // Save to mock profiles
        const profiles = getMockProfiles();
        if (profiles[uid]) {
          profiles[uid].photoURL = base64Url;
          profiles[uid].updatedAt = new Date().toISOString();
          saveMockProfiles(profiles);
        }
        
        // Save to mock currentUser
        if (currentMockUser && currentMockUser.uid === uid) {
          currentMockUser.photoURL = base64Url;
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(currentMockUser));
        }

        // Notify listeners
        mockAuthListeners.forEach((listener) => {
          if (profiles[uid]) {
            listener(profiles[uid]);
          }
        });

        resolve(base64Url);
      };
      reader.onerror = () => reject(new Error('Failed to read file as Base64'));
      reader.readAsDataURL(file);
    });
  }
}

// Re-authenticate user before deleting (recent login requirement)
export async function reauthenticateGoogleUser(): Promise<void> {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(auth.currentUser, provider);
  }
}

export async function reauthenticateEmailUser(password: string): Promise<void> {
  if (isFirebaseConfigured && auth && auth.currentUser && auth.currentUser.email) {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  }
}

// Delete user account and associated private data
export async function deleteUserAccountFirestoreAndAuth(): Promise<void> {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    const uid = auth.currentUser.uid;

    // 1. Clean up profile picture from Django disk/backend
    try {
      await apiDelete('/api/users/profile-photo/delete/');
    } catch (err) {
      console.warn('Failed to clean up profile photo from backend:', err);
    }

    // 2. Anonymize Orders & Delete Chats in Firestore
    if (db) {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', uid));
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        
        for (const docSnapshot of querySnapshot.docs) {
          const orderId = docSnapshot.id;
          
          // Anonymize the order record: decouple it from the user's UID
          const orderDocRef = doc(db, 'orders', orderId);
          batch.update(orderDocRef, {
            userId: 'anonymized-deleted-user',
            updatedAt: new Date().toISOString()
          });

          // Delete chats associated with this order
          try {
            const chatMessagesRef = collection(db, 'chats', orderId, 'messages');
            const messagesSnapshot = await getDocs(chatMessagesRef);
            for (const msgDoc of messagesSnapshot.docs) {
              batch.delete(doc(db, 'chats', orderId, 'messages', msgDoc.id));
            }
          } catch (chatErr) {
            console.warn(`Failed to clean up chat messages for order ${orderId}:`, chatErr);
          }
        }
        
        // 3. Delete user profile document from Firestore
        const userDocRef = doc(db, 'users', uid);
        batch.delete(userDocRef);

        // Commit all Firestore operations in a batch
        await batch.commit();
      } catch (firestoreErr) {
        console.error('Failed to clean up Firestore user data during account deletion:', firestoreErr);
        throw firestoreErr;
      }
    }

    // 4. Delete Firebase Auth user
    try {
      await deleteUser(auth.currentUser);
    } catch (authErr: any) {
      console.error('Failed to delete Firebase Auth user:', authErr);
      throw authErr;
    }

    // 5. Clean up Local Storage
    const cacheKey = `firebase_profile_cache_${uid}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`memorycraft_orders_v1_${uid}`);
  } else {
    // Mock Mode deletion
    const currentMock = currentMockUser;
    if (currentMock) {
      const uid = currentMock.uid;
      
      // Clean up mock profiles
      const profiles = getMockProfiles();
      delete profiles[uid];
      saveMockProfiles(profiles);

      // Clean up local storage items
      localStorage.removeItem(MOCK_USER_KEY);
      localStorage.removeItem(`memorycraft_orders_v1_${uid}`);
      currentMockUser = null;

      // Notify listeners
      mockAuthListeners.forEach((listener) => listener(null));
    }
  }
}

// Remove the profile picture (fallback to Google or default)
export async function removeProfilePhoto(uid: string): Promise<string | null> {
  if (isFirebaseConfigured && auth) {
    // 1. Delete picture file on Django backend
    try {
      await apiDelete('/api/users/profile-photo/delete/');
    } catch (err) {
      console.warn('Failed to delete profile photo from backend:', err);
    }

    // 2. Detect Google photo fallback
    let fallbackPhotoURL: string | null = null;
    if (auth.currentUser) {
      const googleProvider = auth.currentUser.providerData.find(
        (p) => p.providerId === 'google.com'
      );
      if (googleProvider && googleProvider.photoURL) {
        fallbackPhotoURL = googleProvider.photoURL;
      }
    }

    // 3. Update Firestore
    if (db) {
      const userDocRef = doc(db, 'users', uid);
      try {
        await updateDoc(userDocRef, {
          photoURL: fallbackPhotoURL,
          updatedAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('Failed to update Firestore photoURL during removal:', dbErr);
      }
    }

    // 4. Update Firebase Auth
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          photoURL: fallbackPhotoURL
        });
      } catch (authErr) {
        console.warn('Failed to update Firebase Auth user photoURL during removal:', authErr);
      }
    }

    // 5. Update Local Cache
    const cacheKey = `firebase_profile_cache_${uid}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.photoURL = fallbackPhotoURL;
        parsed.updatedAt = new Date().toISOString();
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
      }
    } catch (cacheErr) {
      console.info('Failed to update profile cache:', cacheErr);
    }

    return fallbackPhotoURL;
  } else {
    // Mock Mode photo removal
    const profiles = getMockProfiles();
    if (profiles[uid]) {
      profiles[uid].photoURL = null;
      profiles[uid].updatedAt = new Date().toISOString();
      saveMockProfiles(profiles);
    }

    if (currentMockUser && currentMockUser.uid === uid) {
      currentMockUser.photoURL = null;
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(currentMockUser));
    }

    mockAuthListeners.forEach((listener) => {
      if (profiles[uid]) {
        listener(profiles[uid]);
      }
    });

    return null;
  }
}


