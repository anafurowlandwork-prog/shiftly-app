/**
 * Vercel Serverless Function: Realtime Driver Location Sync
 * Handles GPS coordinate broadcasts and location queries.
 */

let activeDriverLocation = {
  driverId: 'DRV-9921',
  driverName: 'Marcus Vance',
  lat: 42.352,
  lng: -71.058,
  heading: 240,
  speedMph: 24,
  updatedAt: new Date().toISOString()
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch current driver GPS coordinates
  if (req.method === 'GET') {
    return res.status(200).json(activeDriverLocation);
  }

  // POST: Driver phone broadcasts new GPS coordinates
  if (req.method === 'POST') {
    const { lat, lng, heading, speedMph } = req.body || {};
    if (lat && lng) {
      activeDriverLocation = {
        ...activeDriverLocation,
        lat,
        lng,
        heading: heading || activeDriverLocation.heading,
        speedMph: speedMph || activeDriverLocation.speedMph,
        updatedAt: new Date().toISOString()
      };
    }
    return res.status(200).json({ success: true, location: activeDriverLocation });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
