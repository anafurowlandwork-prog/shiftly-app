// Safe, resilient Firebase & local persistence adapter

let auth = null;
let db = null;
let isFirebaseConfigured = false;

// Only attempt to initialize Firebase if explicit valid API keys are supplied
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (apiKey && apiKey.length > 20 && !apiKey.includes("DummyKey")) {
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');

    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shiftly-app.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shiftly-app",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shiftly-app.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456"
    };

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
  } catch (err) {
    console.warn("Firebase not active (running in standalone offline mode):", err);
  }
}

export { auth, db, isFirebaseConfigured };

// ==========================================
// 🔐 AUTHENTICATION SERVICE (Resilient)
// ==========================================

export async function loginUser(email, password) {
  if (isFirebaseConfigured && auth) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      return formatUserData(userCred.user);
    } catch (e) {
      console.warn("Cloud login failed, using local auth:", e.message);
    }
  }

  // Local persistent user fallback
  const localUser = {
    uid: 'user_' + Math.random().toString(36).substring(2, 9),
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
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
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
    } catch (e) {
      console.warn("Cloud signup failed, using local auth:", e.message);
    }
  }

  const localUser = {
    uid: 'user_' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: displayName || email.split('@')[0],
    role,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('shiftly_current_user', JSON.stringify(localUser));
  return localUser;
}

export async function loginAsGuest(role = 'customer') {
  const guestUser = {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    email: 'guest@shiftly.com',
    displayName: role === 'driver' ? 'Marcus Vance (Driver)' : 'Sarah Jenkins (Customer)',
    role,
    isAnonymous: true,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('shiftly_current_user', JSON.stringify(guestUser));
  return guestUser;
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (e) {}
  }
  localStorage.removeItem('shiftly_current_user');
}

export function subscribeToAuthState(callback) {
  try {
    const stored = localStorage.getItem('shiftly_current_user');
    callback(stored ? JSON.parse(stored) : null);
  } catch (e) {
    callback(null);
  }
  return () => {};
}

function formatUserData(user, defaultRole = 'customer') {
  return {
    uid: user.uid,
    email: user.email || 'user@shiftly.com',
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Shiftly User'),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    role: defaultRole
  };
}

// ==========================================
// 📦 BOOKINGS REPOSITORY
// ==========================================

export async function saveBooking(bookingData) {
  const bookingId = bookingData.id || 'SHFT-' + Math.floor(100000 + Math.random() * 900000);
  const enrichedBooking = {
    ...bookingData,
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: bookingData.status || 'driver_assigned'
  };

  try {
    const existing = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
    const updated = [enrichedBooking, ...existing.filter(b => b.id !== bookingId)];
    localStorage.setItem('shiftly_bookings', JSON.stringify(updated));
  } catch (e) {
    console.warn("Local storage write error:", e);
  }

  return enrichedBooking;
}

export async function updateBookingInCloud(bookingId, updates) {
  try {
    const existing = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
    const updated = existing.map(b => b.id === bookingId ? { ...b, ...updates } : b);
    localStorage.setItem('shiftly_bookings', JSON.stringify(updated));
  } catch (e) {}
}

export function subscribeToBookings(userId, callback) {
  try {
    const local = JSON.parse(localStorage.getItem('shiftly_bookings') || '[]');
    callback(local);
  } catch (e) {
    callback([]);
  }
  return () => {};
}

// ==========================================
// 💬 CHAT MESSAGES
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

  try {
    const key = `shiftly_chat_${bookingId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, msgObj]));
  } catch (e) {}

  return msgObj;
}
