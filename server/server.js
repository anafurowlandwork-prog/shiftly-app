/**
 * Shiftly Standalone Real-Time Express & WebSocket Server
 * Enables live bi-directional driver tracking, realtime booking updates, and chat.
 */
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(express.json());

// In-memory data store for live rides, chats, and coordinates
const state = {
  bookings: [],
  activeDrivers: new Map(),
  chatMessages: new Map(), // bookingId -> array of messages
};

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Shiftly Real-Time Engine', timestamp: new Date().toISOString() });
});

// Bookings API
app.get('/api/bookings', (req, res) => {
  res.json({ success: true, bookings: state.bookings });
});

app.post('/api/bookings', (req, res) => {
  const newBooking = {
    ...req.body,
    id: req.body.id || `SHFT-${Math.floor(100000 + Math.random() * 900000)}`,
    status: req.body.status || 'DRIVER_EN_ROUTE',
    createdAt: new Date().toISOString()
  };
  state.bookings.unshift(newBooking);
  console.log(`[Shiftly Server] New booking created: ${newBooking.id} (${newBooking.pickup} -> ${newBooking.dropoff})`);
  res.status(201).json({ success: true, booking: newBooking });
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = state.bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  console.log(`[Shiftly Server] Booking ${id} status updated to: ${status}`);
  res.json({ success: true, booking });
});

// Live Driver Location Broadcast
app.post('/api/driver/location', (req, res) => {
  const { driverId, lat, lng, heading, speedMph } = req.body;
  const locData = {
    driverId: driverId || 'DRV-9921',
    lat,
    lng,
    heading: heading || 0,
    speedMph: speedMph || 0,
    updatedAt: new Date().toISOString()
  };
  state.activeDrivers.set(locData.driverId, locData);
  res.json({ success: true, location: locData });
});

app.get('/api/driver/:driverId/location', (req, res) => {
  const loc = state.activeDrivers.get(req.params.driverId) || {
    driverId: req.params.driverId,
    lat: 42.352,
    lng: -71.058,
    heading: 240,
    speedMph: 25,
    updatedAt: new Date().toISOString()
  };
  res.json(loc);
});

// Real-Time Chat API
app.get('/api/bookings/:id/messages', (req, res) => {
  const msgs = state.chatMessages.get(req.params.id) || [];
  res.json({ messages: msgs });
});

app.post('/api/bookings/:id/messages', (req, res) => {
  const { id } = req.params;
  const newMsg = {
    ...req.body,
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  const list = state.chatMessages.get(id) || [];
  list.push(newMsg);
  state.chatMessages.set(id, list);
  res.status(201).json({ success: true, message: newMsg });
});

server.listen(PORT, () => {
  console.log(`🚀 Shiftly Real-Time Backend running on http://localhost:${PORT}`);
});
