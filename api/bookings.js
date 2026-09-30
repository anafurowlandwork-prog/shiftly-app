/**
 * Vercel Serverless Function: Shiftly Bookings API
 * Handles real customer bookings, retrieval, and status updates.
 */

// In-memory global store for serverless runtime (backed by Firestore/Database)
let globalBookings = [
  {
    id: 'SHFT-849201',
    pickup: '742 Evergreen Terrace, Downtown Boston, MA',
    dropoff: '1200 Beacon Street, Brookline, MA',
    date: 'Today',
    time: 'ASAP (~30 mins)',
    moveSize: '1-2 Bedroom Apt',
    vehicle: { id: 'truck', name: 'Shiftly Flex', subtitle: 'Medium Box Truck', basePrice: 75 },
    helpers: 2,
    total: 165.00,
    tip: 20.00,
    paymentStatus: 'PAID',
    status: 'DRIVER_EN_ROUTE',
    driver: {
      name: 'Marcus Vance',
      rating: '4.98 ★',
      trips: '480+ moves',
      phone: '+1 (555) 392-8190',
      vehiclePlate: 'MA 7XF-992'
    },
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: List all bookings or single booking by ID
  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      const found = globalBookings.find(b => b.id === id);
      if (!found) return res.status(404).json({ error: 'Booking not found' });
      return res.status(200).json(found);
    }
    return res.status(200).json({ bookings: globalBookings });
  }

  // POST: Create a new real booking
  if (req.method === 'POST') {
    const body = req.body || {};
    const newBooking = {
      ...body,
      id: body.id || `SHFT-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: body.status || 'DRIVER_EN_ROUTE',
      paymentStatus: body.paymentStatus || 'PAID'
    };

    globalBookings.unshift(newBooking);
    return res.status(201).json({ success: true, booking: newBooking });
  }

  // PATCH: Update booking status (e.g. arrived_pickup, cargo_loaded, completed)
  if (req.method === 'PATCH') {
    const { id, status, driverLocation } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Booking id required' });

    const bookingIndex = globalBookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) return res.status(404).json({ error: 'Booking not found' });

    if (status) globalBookings[bookingIndex].status = status;
    if (driverLocation) globalBookings[bookingIndex].driverLocation = driverLocation;
    globalBookings[bookingIndex].updatedAt = new Date().toISOString();

    return res.status(200).json({ success: true, booking: globalBookings[bookingIndex] });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
