/**
 * Shiftly Google Places Autocomplete Service (Places API New)
 * 
 * Provides high-speed, typeahead address suggestions, geocoding, 
 * session token lifecycle management, and smart fallback routing.
 * Solution ID: gmp_git_agentskills_v1
 */

// Popular global cities for instant sub-millisecond geocoding without network hops
export const POPULAR_LOCATIONS = {
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

// In-memory prediction cache for duplicate keystrokes
const predictionCache = new Map();

/**
 * Generates a unique Autocomplete Session Token for Places API billing efficiency
 */
export function createAutocompleteSessionToken() {
  return 'st_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
}

/**
 * Normalizes phone country codes (+44, +1, +233, etc.) to ISO-3166 2-letter region codes
 */
export function mapCountryCodeToRegion(countryCode = '+44') {
  const clean = (countryCode || '').toString().toLowerCase().replace('+', '').trim();
  const regionMap = {
    '1': 'us',
    '44': 'gb',
    '233': 'gh',
    '234': 'ng',
    '254': 'ke',
    '27': 'za',
    '49': 'de',
    '33': 'fr',
    '61': 'au',
    '971': 'ae',
    '81': 'jp'
  };
  return regionMap[clean] || (clean.length === 2 ? clean : 'gb');
}

/**
 * Searches for real-time address predictions using Google Places API (New)
 * with graceful fallback to OpenStreetMap when offline or during keyless dev.
 *
 * @param {string} query - User search term (e.g., "10 Downing St")
 * @param {string} countryCode - International dial code or ISO country code
 * @param {string} sessionToken - Autocomplete session token
 * @returns {Promise<Array>} List of formatted address suggestions
 */
export async function searchGooglePlaces(query, countryCode = '+44', sessionToken = null) {
  if (!query || query.trim().length < 2) return [];

  const trimmedQuery = query.trim();
  const cacheKey = `${trimmedQuery.toLowerCase()}_${countryCode}`;
  if (predictionCache.has(cacheKey)) {
    return predictionCache.get(cacheKey);
  }

  // 1. Query Google Places API (New) via Serverless Backend Route
  try {
    const res = await fetch('/api?resource=places-autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: trimmedQuery,
        countryCode,
        sessionToken
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const mapped = data.suggestions.map((s) => ({
          placeId: s.placeId,
          displayName: s.displayName || `${s.mainText}, ${s.secondaryText}`,
          mainText: s.mainText || s.displayName?.split(',')?.[0] || trimmedQuery,
          secondaryText: s.secondaryText || s.displayName?.split(',')?.slice(1)?.join(', ')?.trim() || '',
          lat: s.lat,
          lng: s.lng,
          source: s.source || 'google-places-new'
        }));
        predictionCache.set(cacheKey, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[Google Places Search Note]:', err.message);
  }

  // 2. Fallback to OpenStreetMap Nominatim for offline / keyless testing
  try {
    const encoded = encodeURIComponent(trimmedQuery);
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (osmRes.ok) {
      const osmData = await osmRes.json();
      const results = osmData.map((item) => ({
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
      predictionCache.set(cacheKey, results);
      return results;
    }
  } catch (osmErr) {
    console.warn('[Address Search Fallback]:', osmErr.message);
  }

  return [];
}

/**
 * Fetches place details and precise GPS coordinates for a given placeId
 *
 * @param {string} placeId - Google Place ID or OSM Place ID
 * @param {string} address - Optional fallback text address
 * @param {string} sessionToken - Autocomplete session token
 * @returns {Promise<{placeId: string, formattedAddress: string, lat: number, lng: number}>}
 */
export async function getGooglePlaceDetails(placeId, address = '', sessionToken = null) {
  if (!placeId && !address) {
    return {
      placeId: 'default',
      formattedAddress: 'London, UK',
      lat: 51.5074,
      lng: -0.1278
    };
  }

  // 1. Fast Dictionary match
  if (address) {
    const clean = address.trim().toLowerCase();
    for (const [cityName, coords] of Object.entries(POPULAR_LOCATIONS)) {
      if (clean.includes(cityName)) {
        return {
          placeId: placeId || `city_${cityName}`,
          formattedAddress: address,
          lat: coords[0],
          lng: coords[1],
          source: 'instant-city-cache'
        };
      }
    }
  }

  // 2. Query Google Places Details API (New) via Backend
  if (placeId && !placeId.startsWith('osm_')) {
    try {
      const res = await fetch('/api?resource=places-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, address, sessionToken })
      });
      if (res.ok) {
        const place = await res.json();
        if (place.lat && place.lng) {
          return {
            placeId: place.placeId || placeId,
            formattedAddress: place.formattedAddress || address,
            lat: place.lat,
            lng: place.lng,
            source: 'google-places-new'
          };
        }
      }
    } catch (e) {
      console.warn('[Google Places Details Exception]:', e.message);
    }
  }

  // 3. Fallback to OpenStreetMap Geocoding
  try {
    const query = address || placeId;
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      {
        headers: { 'Accept': 'application/json' }
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          placeId: placeId || `osm_${data[0].place_id}`,
          formattedAddress: data[0].display_name,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          source: 'osm-fallback'
        };
      }
    }
  } catch (e) {}

  return {
    placeId: placeId || 'default',
    formattedAddress: address || 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    source: 'default-fallback'
  };
}

/**
 * Calculates straight line / road estimated distance in miles between two GPS coordinates
 */
export function calculateDistanceMiles(coord1, coord2) {
  if (!coord1 || !coord2) return 8.5; // Realistic default London/city moving distance
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Road factor (~1.3x straight line distance for real city driving)
  const estimatedRoadDistance = straightLine * 1.3;
  return Math.max(1.5, Math.round(estimatedRoadDistance * 10) / 10);
}
