import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  addDoc,
  updateDoc
} from 'firebase/firestore';

// Configuration from environment variables with fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopmentMode0000",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shiftly-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shiftly-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shiftly-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456"
};

// Check if real Firebase API credentials have been provided
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDummyKeyForDevelopmentMode0000"
);

// Initialize Firebase App instance
let app = null;
let auth = null;
let db = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback adapter):", error.message);
}

export { auth, db };

// ==========================================
// 🔐 AUTHENTICATION SERVICE
// ==========================================

export async function loginUser(email, password) {
  if (isFirebaseConfigured && auth) {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return formatUserData(userCred.user);
  }
  
  // Local persistent fallback for development/demo
  const localUser = {
    uid: 'user_' + btoa(email).substring(0, 10),
    email,
    displayName: email.split('@')[0],
    role: 'customer',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('shiftly_current_user', JSON.stringify(localUser));
  return localUser;
}

export async function signupUser(email, password, displayName, role = 'customer') {
  if (isFirebaseConfigured && auth) {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCred.user, { displayName });
    }
    // Save user profile document in Firestore
    if (db) {
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        createdAt: serverTimestamp()
      });
    }
    return formatUserData(userCred.user, role);
  }

  // Local persistent fallback
  const localUser = {
    uid: 'user_' + Date.now().toString(36),
    email,
    displayName: displayName || email.split('@')[0],
    role,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('shiftly_current_user', JSON.stringify(localUser));
  return localUser;
}

export async function loginAsGuest(role = 'customer') {
  if (isFirebaseConfigured && auth) {
    const userCred = await signInAnonymously(auth);
    return formatUserData(userCred.user, role);
  }

  const guestUser = {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    email: 'guest@shiftly.com',
    displayName: role === 'driver' ? 'Partner Driver' : 'Guest Customer',
    role,
    isAnonymous: true,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('shiftly_current_user', JSON.stringify(guestUser));
  return guestUser;
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  localStorage.removeItem('shiftly_current_user');
}

export function subscribeToAuthState(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(formatUserData(user));
      } else {
        const stored = localStorage.getItem('shiftly_current_user');
        callback(stored ? JSON.parse(stored) : null);
      }
    });
  }

  // Local storage listener
  const stored = localStorage.getItem('shiftly_current_user');
  callback(stored ? JSON.parse(stored) : null);
  return () => {};
}

function formatUserData(user, defaultRole = 'customer') {
  return {
    uid: user.uid,
    email: user.email || 'guest@shiftly.com',
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Shiftly User'),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    role: defaultRole
  };
}

// ==========================================
// 📦 FIRESTORE DATABASE: BOOKINGS
// ==========================================

export async function saveBooking(bookingData) {
  const bookingId = bookingData.id || 'SHF-' + Math.floor(100000 + Math.random() * 900000);
  const enrichedBooking = {
    ...bookingData,
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: bookingData.status || 'driver_assigned'
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'bookings', bookingId), {
      ...enrichedBooking,
      serverTimestamp: serverTimestamp()
    });
  }

  // Always keep localStorage synchronized
  const existing = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
  const updated = [enrichedBooking, ...existing.filter(b => b.id !== bookingId)];
  localStorage.setItem('shiftly_bookings', JSON.stringify(updated));

  return enrichedBooking;
}

export async function updateBookingInCloud(bookingId, updates) {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'bookings', bookingId), updates);
  }

  const existing = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
  const updated = existing.map(b => b.id === bookingId ? { ...b, ...updates } : b);
  localStorage.setItem('shiftly_bookings', JSON.stringify(updated));
}

export function subscribeToBookings(userId, callback) {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'bookings'),
      orderBy('serverTimestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(bookings);
    }, (error) => {
      console.warn("Firestore snapshot listener fallback:", error.message);
      const local = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
      callback(local);
    });
  }

  // Local persistent fallback
  const local = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
  callback(local);
  return () => {};
}

// ==========================================
// 💬 REALTIME CHAT MESSAGES
// ==========================================

export async function sendChatMessage(bookingId, message) {
  const msgObj = {
    id: Date.now(),
    bookingId,
    sender: message.sender,
    text: message.text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, 'bookings', bookingId, 'messages'), {
      ...msgObj,
      serverTimestamp: serverTimestamp()
    });
  }

  // Local storage backup
  const key = `shiftly_chat_${bookingId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([...existing, msgObj]));

  return msgObj;
}
