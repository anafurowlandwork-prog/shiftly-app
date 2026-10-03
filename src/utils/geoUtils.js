import { 
  searchGooglePlaces, 
  getGooglePlaceDetails, 
  calculateDistanceMiles as calcDistMiles, 
  POPULAR_LOCATIONS,
  createAutocompleteSessionToken,
  mapCountryCodeToRegion
} from '../services/googlePlacesService';

export { 
  searchGooglePlaces, 
  getGooglePlaceDetails, 
  POPULAR_LOCATIONS,
  createAutocompleteSessionToken,
  mapCountryCodeToRegion
};

/**
 * Searches for real address suggestions using Google Places API (New)
 */
export async function searchAddressSuggestions(query, countryCode = '+44', sessionToken = null) {
  return await searchGooglePlaces(query, countryCode, sessionToken);
}

/**
 * Resolves any address string or placeId to GPS [lat, lng] coordinates
 */
export async function geocodeAddress(address, placeId = null, sessionToken = null) {
  const details = await getGooglePlaceDetails(placeId, address, sessionToken);
  return [details.lat, details.lng];
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
