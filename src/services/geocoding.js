// Address Autocomplete & Distance Calculation Service

export async function searchAddresses(query) {
  if (!query || query.trim().length < 3) return [];

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.features) return [];

    return data.features.map(f => {
      const props = f.properties;
      const parts = [
        props.housenumber,
        props.street || props.name,
        props.city || props.district,
        props.state || props.county,
        props.country
      ].filter(Boolean);

      return {
        label: parts.join(', '),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        postcode: props.postcode,
        city: props.city
      };
    });
  } catch (error) {
    console.warn("Geocoding lookup error:", error);
    return [];
  }
}

// Calculate Haversine distance in miles between two coordinates
export function calculateGeoDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(2.5, Number((distance * 1.3).toFixed(1))); // Driving path multiplier
}
