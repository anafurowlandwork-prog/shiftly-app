/**
 * Shiftly Cloud Backend & Realtime Synchronization Service
 * Supports Cloud Firestore with automatic offline/local fallback.
 */
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, 
  updateDoc, onSnapshot, query, where, orderBy, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Standard Firebase config - reads from Vite environment or uses demo project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoShiftlyKeyForLogisticsApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shiftly-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shiftly-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shiftly-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109283746501",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109283746501:web:98a7b6c5d4e3f2a1"
};

let db = null;
let auth = null;
let isCloudActive = false;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  isCloudActive = true;
} catch (err) {
  console.info('Shiftly running in high-speed local persistence mode:', err.message);
  isCloudActive = false;
}

// Local in-memory / localStorage fallback store
const LOCAL_STORAGE_BOOKINGS = 'shiftly_bookings_store';
const LOCAL_STORAGE_MESSAGES = 'shiftly_messages_store';
const LOCAL_STORAGE_DRIVER_LOC = 'shiftly_driver_location';

function getLocalBookings() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalBookings(bookings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {}
}

/**
 * Creates a new move booking
 */
export async function createMoveBooking(bookingData) {
  const bookingId = bookingData.id || `SHFT-${Math.floor(100000 + Math.random() * 900000)}`;
  const fullBooking = {
    ...bookingData,
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: bookingData.status || 'DRIVER_EN_ROUTE',
    paymentStatus: bookingData.paymentStatus || 'PAID',
    updatedAt: new Date().toISOString()
  };

  // 1. Save to local storage
  const current = getLocalBookings();
  saveLocalBookings([fullBooking, ...current.filter(b => b.id !== bookingId)]);

  // 2. Sync to Firestore if cloud available
  if (isCloudActive && db) {
    try {
      await setDoc(doc(db, 'bookings', bookingId), fullBooking);
    } catch (err) {
      console.warn('Firestore sync skipped (offline mode):', err.message);
    }
  }

  return fullBooking;
}

/**
 * Updates booking status (e.g. ARRIVED_PICKUP, IN_TRANSIT, COMPLETED)
 */
export async function updateBookingStatus(bookingId, newStatus) {
  const current = getLocalBookings();
  const updated = current.map(b => b.id === bookingId ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b);
  saveLocalBookings(updated);

  if (isCloudActive && db) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Cloud update skipped:', err.message);
    }
  }
}

/**
 * Listens to realtime changes for a specific booking
 */
export function subscribeToBooking(bookingId, callback) {
  if (isCloudActive && db) {
    try {
      const unsub = onSnapshot(doc(db, 'bookings', bookingId), (snap) => {
        if (snap.exists()) {
          callback(snap.data());
        }
      }, (err) => {
        console.warn('Firestore subscription fallback:', err.message);
      });
      return unsub;
    } catch (e) {}
  }

  // Local poller fallback
  const interval = setInterval(() => {
    const list = getLocalBookings();
    const found = list.find(b => b.id === bookingId);
    if (found) callback(found);
  }, 1000);

  return () => clearInterval(interval);
}

/**
 * Sends a real-time chat message between customer and driver
 */
export async function sendChatMessage(bookingId, message) {
  const msgObj = {
    ...message,
    id: message.id || Date.now(),
    bookingId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES}_${bookingId}`);
    const msgs = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`${LOCAL_STORAGE_MESSAGES}_${bookingId}`, JSON.stringify([...msgs, msgObj]));
  } catch (e) {}

  if (isCloudActive && db) {
    try {
      await addDoc(collection(db, 'bookings', bookingId, 'messages'), msgObj);
    } catch (err) {}
  }

  return msgObj;
}

/**
 * Syncs driver GPS coordinates in realtime
 */
export async function broadcastDriverLocation(coords) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DRIVER_LOC, JSON.stringify({
      ...coords,
      timestamp: Date.now()
    }));
  } catch (e) {}

  if (isCloudActive && db) {
    try {
      await setDoc(doc(db, 'drivers', 'lead_driver'), {
        ...coords,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {}
  }
}
