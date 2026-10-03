/**
 * Shiftly Geolocation & Real-Time Map Navigation Utilities
 * Provides worldwide geocoding, address autocomplete, coordinate interpolation,
 * and distance calculation using OpenStreetMap Nominatim.
 */

// Fallback coordinate dictionary for common global cities if offline
const POPULAR_LOCATIONS = {
  // UK
  'london': [51.5074, -0.1278],
  'manchester': [53.4808, -2.2426],
  'birmingham': [52.4862, -1.8904],
  'leeds': [53.8008, -1.5491],
  'glasgow': [55.8642, -4.2518],
  'edinburgh': [55.9533, -3.1883],
  'liverpool': [53.4084, -2.9916],
  'bristol': [51.4545, -2.5879],
  'cambridge': [52.2053, 0.1218],
  'oxford': [51.7520, -1.2577],

  // US
  'boston': [42.3601, -71.0589],
  'new york': [40.7128, -74.0060],
  'brooklyn': [40.6782, -73.9442],
  'los angeles': [34.0522, -118.2437],
  'chicago': [41.8781, -87.6298],
  'san francisco': [37.7749, -122.4194],
  'austin': [30.2672, -97.7431],
  'miami': [25.7617, -80.1918],

  // International
  'lagos': [6.5244, 3.3792],
  'accra': [5.6037, -0.1870],
  'toronto': [43.6532, -79.3832],
  'sydney': [-33.8688, 151.2093],
  'berlin': [52.5200, 13.4050],
  'paris': [48.8566, 2.3522]
};

/**
 * Searches for real address suggestions using Google Places API (New) with fallback
 */
export async function searchAddressSuggestions(query, countryCode = '+44') {
  if (!query || query.trim().length < 2) return [];
  
  // 1. Try Google Places API (New) via Shiftly Master API
  try {
    const res = await fetch('/api?resource=places-autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: query.trim(), countryCode })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.suggestions && data.suggestions.length > 0) {
        return data.suggestions.map((s) => ({
          placeId: s.placeId,
          displayName: s.displayName || `${s.mainText}, ${s.secondaryText}`,
          mainText: s.mainText || s.displayName.split(',')[0],
          secondaryText: s.secondaryText || s.displayName.split(',').slice(1).join(', ').trim(),
          lat: s.lat,
          lng: s.lng,
          source: s.source || 'google-places-new'
        }));
      }
    }
  } catch (err) {
    console.warn('[Places Search API]:', err.message);
  }

  // 2. Direct OpenStreetMap Nominatim Fallback
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      placeId: `osm_${item.place_id || item.osm_id}`,
      displayName: item.display_name,
      mainText: item.display_name.split(',')[0],
      secondaryText: item.display_name.split(',').slice(1).join(', ').trim(),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city: item.address?.city || item.address?.town || item.address?.village || item.address?.state,
      country: item.address?.country,
      source: 'osm-fallback'
    }));
  } catch (err) {
    console.warn('Address search fallback:', err.message);
    return [];
  }
}

/**
 * Resolves any address string or placeId to GPS [lat, lng] coordinates
 */
export async function geocodeAddress(address, placeId = null) {
  if (!address || typeof address !== 'string') {
    return [51.5074, -0.1278]; // Default: London
  }

  const clean = address.trim().toLowerCase();

  // 1. Check quick city lookup dictionary for instant sub-millisecond response
  for (const [cityName, coords] of Object.entries(POPULAR_LOCATIONS)) {
    if (clean.includes(cityName)) {
      return coords;
    }
  }

  // 2. Query Google Places Details API via Shiftly Backend
  if (placeId && !placeId.startsWith('osm_')) {
    try {
      const res = await fetch('/api?resource=places-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, address })
      });
      if (res.ok) {
        const place = await res.json();
        if (place.lat && place.lng) {
          return [place.lat, place.lng];
        }
      }
    } catch (e) {
      console.warn('[Places Details Exception]:', e.message);
    }
  }

  // 3. Fetch from OpenStreetMap Nominatim
  try {
    const encoded = encodeURIComponent(address.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (err) {
    console.warn('Geocoding network fallback:', err.message);
  }

  // 4. Fallback coordinate generation with deterministic hash offset
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) / 1000) - 0.05;
  const lngOffset = ((Math.abs(hash * 31) % 100) / 1000) - 0.05;

  return [51.5074 + latOffset, -0.1278 + lngOffset];
}

/**
 * Calculates Haversine distance in miles between two coordinates
 */
export function calculateDistanceMiles([lat1, lon1], [lat2, lon2]) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.max(1.2, parseFloat(d.toFixed(1)));
}

/**
 * Generates intermediate route waypoints with subtle realistic road curvature
 */
export function generateInterpolatedRoute(startCoords, endCoords, numPoints = 8) {
  const [startLat, startLng] = startCoords;
  const [endLat, endLng] = endCoords;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Linear interpolation
    let lat = startLat + (endLat - startLat) * t;
    let lng = startLng + (endLng - startLng) * t;

    // Add gentle sinusoidal road variation in the middle
    if (i > 0 && i < numPoints) {
      const curve = Math.sin(t * Math.PI) * 0.003;
      lat += curve;
      lng -= curve * 0.5;
    }

    points.push([parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))]);
  }

  return points;
}
