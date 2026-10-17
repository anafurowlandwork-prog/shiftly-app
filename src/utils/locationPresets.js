/**
 * Shiftly Country Location & Region Presets
 * Dynamically configures cities, GPS coordinates, address placeholders,
 * and quick-route chips based on the authenticated country calling code.
 */

export const COUNTRY_LOCATION_PRESETS = {
  '+233': {
    country: 'Ghana',
    flag: '🇬🇭',
    region: 'gh',
    city: 'Accra',
    defaultCoords: [5.6037, -0.1870],
    defaultPickup: 'Airport Residential Area, Accra, Ghana',
    defaultDropoff: 'East Legon, Accra, Ghana',
    pickupCoords: [5.6010, -0.1790],
    dropoffCoords: [5.6350, -0.1580],
    placeholderPickup: 'e.g. Airport Residential, Accra or Digital Address',
    placeholderDropoff: 'e.g. East Legon, Accra or Spintex Road',
    distanceMiles: 4.5,
    quickRoutes: [
      {
        name: '🇬🇭 East Legon Route',
        pickup: 'Airport Residential Area, Accra, Ghana',
        pickupCoords: [5.6010, -0.1790],
        dropoff: 'East Legon, Accra, Ghana',
        dropoffCoords: [5.6350, -0.1580]
      },
      {
        name: '🇬🇭 Cantonments Route',
        pickup: 'Oxford Street, Osu, Accra, Ghana',
        pickupCoords: [5.5560, -0.1818],
        dropoff: 'Cantonments, Accra, Ghana',
        dropoffCoords: [5.5790, -0.1730]
      },
      {
        name: '🇬🇭 Tema Route',
        pickup: 'Spintex Road, Accra, Ghana',
        pickupCoords: [5.6260, -0.0980],
        dropoff: 'Community 1, Tema, Ghana',
        dropoffCoords: [5.6560, -0.0160]
      }
    ],
    mockDriver: {
      name: 'Kwame Mensah',
      rating: '4.98 ★',
      trips: '520 moves',
      phone: '+233 24 123 4567',
      vehiclePlate: 'GR-2024-26',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+234': {
    country: 'Nigeria',
    flag: '🇳🇬',
    region: 'ng',
    city: 'Lagos',
    defaultCoords: [6.5244, 3.3792],
    defaultPickup: 'Victoria Island, Lagos, Nigeria',
    defaultDropoff: 'Lekki Phase 1, Lagos, Nigeria',
    pickupCoords: [6.4281, 3.4219],
    dropoffCoords: [6.4474, 3.4738],
    placeholderPickup: 'e.g. Adeola Odeku, Victoria Island, Lagos',
    placeholderDropoff: 'e.g. Admiralty Way, Lekki Phase 1, Lagos',
    distanceMiles: 5.2,
    quickRoutes: [
      {
        name: '🇳🇬 Island Route',
        pickup: 'Victoria Island, Lagos, Nigeria',
        pickupCoords: [6.4281, 3.4219],
        dropoff: 'Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
        dropoffCoords: [6.4474, 3.4738]
      },
      {
        name: '🇳🇬 Ikeja Route',
        pickup: 'GRA Ikeja, Lagos, Nigeria',
        pickupCoords: [6.5880, 3.3540],
        dropoff: 'Maryland Crescent, Ikeja, Lagos, Nigeria',
        dropoffCoords: [6.5720, 3.3680]
      }
    ],
    mockDriver: {
      name: 'Chinedu Okafor',
      rating: '4.96 ★',
      trips: '410 moves',
      phone: '+234 801 234 5678',
      vehiclePlate: 'LAG-892-AA',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+44': {
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'gb',
    city: 'London',
    defaultCoords: [51.5074, -0.1278],
    defaultPickup: 'Oxford Street, London, W1D 1BS, UK',
    defaultDropoff: 'King’s Road, Chelsea, London, SW3 4ND, UK',
    pickupCoords: [51.5154, -0.1419],
    dropoffCoords: [51.4875, -0.1687],
    placeholderPickup: 'e.g. 10 Oxford Street, London or Postcode',
    placeholderDropoff: 'e.g. 25 King\'s Road, London or Postcode',
    distanceMiles: 3.2,
    quickRoutes: [
      {
        name: '🇬🇧 London Route',
        pickup: 'Oxford Street, London, W1D 1BS, UK',
        pickupCoords: [51.5154, -0.1419],
        dropoff: 'King’s Road, Chelsea, London, SW3 4ND, UK',
        dropoffCoords: [51.4875, -0.1687]
      },
      {
        name: '🇬🇧 Manchester Route',
        pickup: 'Manchester City Centre, M1 1AE, UK',
        pickupCoords: [53.4808, -2.2426],
        dropoff: 'MediaCityUK, Salford, M50 2EQ, UK',
        dropoffCoords: [53.4722, -2.2985]
      }
    ],
    mockDriver: {
      name: 'Marcus Vance',
      rating: '4.98 ★',
      trips: '480 moves',
      phone: '+44 7378 142815',
      vehiclePlate: 'LX24 XFR',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+1': {
    country: 'United States',
    flag: '🇺🇸',
    region: 'us',
    city: 'Boston',
    defaultCoords: [42.3601, -71.0589],
    defaultPickup: '742 Evergreen Terrace, Downtown Boston, MA',
    defaultDropoff: '1200 Beacon Street, Brookline, MA',
    pickupCoords: [42.352, -71.058],
    dropoffCoords: [42.343, -71.115],
    placeholderPickup: 'e.g. 742 Evergreen Terr, Boston or ZIP',
    placeholderDropoff: 'e.g. 1200 Beacon St, Brookline or ZIP',
    distanceMiles: 3.8,
    quickRoutes: [
      {
        name: '🇺🇸 Boston Route',
        pickup: '742 Evergreen Terrace, Downtown Boston, MA',
        pickupCoords: [42.352, -71.058],
        dropoff: '1200 Beacon Street, Brookline, MA',
        dropoffCoords: [42.343, -71.115]
      },
      {
        name: '🇺🇸 New York Route',
        pickup: 'Times Square, Manhattan, NY',
        pickupCoords: [40.7580, -73.9855],
        dropoff: 'DUMBO, Brooklyn, NY',
        dropoffCoords: [40.7033, -73.9881]
      }
    ],
    mockDriver: {
      name: 'Tyler Hayes',
      rating: '4.97 ★',
      trips: '530 moves',
      phone: '+1 (555) 392-8190',
      vehiclePlate: 'MA 7XF-992',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+254': {
    country: 'Kenya',
    flag: '🇰🇪',
    region: 'ke',
    city: 'Nairobi',
    defaultCoords: [-1.2921, 36.8219],
    defaultPickup: 'Westlands, Nairobi, Kenya',
    defaultDropoff: 'Kilimani, Nairobi, Kenya',
    pickupCoords: [-1.2675, 36.8120],
    dropoffCoords: [-1.2980, 36.7880],
    placeholderPickup: 'e.g. Westlands, Nairobi or Estate',
    placeholderDropoff: 'e.g. Kilimani, Nairobi or Ring Road',
    distanceMiles: 4.1,
    quickRoutes: [
      {
        name: '🇰🇪 Nairobi Route',
        pickup: 'Westlands, Nairobi, Kenya',
        pickupCoords: [-1.2675, 36.8120],
        dropoff: 'Kilimani, Nairobi, Kenya',
        dropoffCoords: [-1.2980, 36.7880]
      }
    ],
    mockDriver: {
      name: 'Brian Kiprop',
      rating: '4.95 ★',
      trips: '360 moves',
      phone: '+254 712 345678',
      vehiclePlate: 'KDF 419G',
      photo: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+27': {
    country: 'South Africa',
    flag: '🇿🇦',
    region: 'za',
    city: 'Johannesburg',
    defaultCoords: [-26.2041, 28.0473],
    defaultPickup: 'Sandton City, Sandton, Johannesburg',
    defaultDropoff: 'Rosebank Mall, Rosebank, Johannesburg',
    pickupCoords: [-26.1076, 28.0567],
    dropoffCoords: [-26.1462, 28.0416],
    placeholderPickup: 'e.g. Sandton City, Johannesburg',
    placeholderDropoff: 'e.g. Rosebank, Johannesburg',
    distanceMiles: 4.8,
    quickRoutes: [
      {
        name: '🇿🇦 Joburg Route',
        pickup: 'Sandton City, Johannesburg',
        pickupCoords: [-26.1076, 28.0567],
        dropoff: 'Rosebank, Johannesburg',
        dropoffCoords: [-26.1462, 28.0416]
      }
    ],
    mockDriver: {
      name: 'Sipho Ndlovu',
      rating: '4.94 ★',
      trips: '290 moves',
      phone: '+27 82 123 4567',
      vehiclePlate: 'GP 77 XP',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+33': {
    country: 'France',
    flag: '🇫🇷',
    region: 'fr',
    city: 'Paris',
    defaultCoords: [48.8566, 2.3522],
    defaultPickup: 'Champs-Élysées, 75008 Paris, France',
    defaultDropoff: 'Boulevard Saint-Germain, 75006 Paris, France',
    pickupCoords: [48.8698, 2.3075],
    dropoffCoords: [48.8530, 2.3330],
    placeholderPickup: 'e.g. Champs-Élysées, Paris or Code Postal',
    placeholderDropoff: 'e.g. Blvd Saint-Germain, Paris or Code Postal',
    distanceMiles: 3.0,
    quickRoutes: [
      {
        name: '🇫🇷 Paris Route',
        pickup: 'Champs-Élysées, 75008 Paris, France',
        pickupCoords: [48.8698, 2.3075],
        dropoff: 'Boulevard Saint-Germain, 75006 Paris, France',
        dropoffCoords: [48.8530, 2.3330]
      }
    ],
    mockDriver: {
      name: 'Julien Moreau',
      rating: '4.96 ★',
      trips: '380 moves',
      phone: '+33 6 12 34 56 78',
      vehiclePlate: 'EK-419-DF',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+49': {
    country: 'Germany',
    flag: '🇩🇪',
    region: 'de',
    city: 'Berlin',
    defaultCoords: [52.5200, 13.4050],
    defaultPickup: 'Alexanderplatz, 10178 Berlin, Germany',
    defaultDropoff: 'Kurfürstendamm, 10707 Berlin, Germany',
    pickupCoords: [52.5219, 13.4132],
    dropoffCoords: [52.5028, 13.3150],
    placeholderPickup: 'e.g. Alexanderplatz, Berlin or PLZ',
    placeholderDropoff: 'e.g. Kurfürstendamm, Berlin or PLZ',
    distanceMiles: 5.5,
    quickRoutes: [
      {
        name: '🇩🇪 Berlin Route',
        pickup: 'Alexanderplatz, 10178 Berlin, Germany',
        pickupCoords: [52.5219, 13.4132],
        dropoff: 'Kurfürstendamm, 10707 Berlin, Germany',
        dropoffCoords: [52.5028, 13.3150]
      }
    ],
    mockDriver: {
      name: 'Lukas Weber',
      rating: '4.97 ★',
      trips: '440 moves',
      phone: '+49 151 12345678',
      vehiclePlate: 'B-SW 2026',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
    }
  },
  '+971': {
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'ae',
    city: 'Dubai',
    defaultCoords: [25.2048, 55.2708],
    defaultPickup: 'Downtown Dubai, Dubai, UAE',
    defaultDropoff: 'Dubai Marina, Dubai, UAE',
    pickupCoords: [25.1972, 55.2744],
    dropoffCoords: [25.0805, 55.1403],
    placeholderPickup: 'e.g. Downtown Dubai or Building Name',
    placeholderDropoff: 'e.g. Dubai Marina or Tower Name',
    distanceMiles: 12.0,
    quickRoutes: [
      {
        name: '🇦🇪 Dubai Route',
        pickup: 'Downtown Dubai, Dubai, UAE',
        pickupCoords: [25.1972, 55.2744],
        dropoff: 'Dubai Marina, Dubai, UAE',
        dropoffCoords: [25.0805, 55.1403]
      }
    ],
    mockDriver: {
      name: 'Tariq Al-Mansoor',
      rating: '4.99 ★',
      trips: '610 moves',
      phone: '+971 50 123 4567',
      vehiclePlate: 'DXB-9281',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
    }
  }
};

/**
 * Get active location preset for a given country calling code (e.g., '+233' -> Ghana)
 */
export function getLocationPreset(countryCode = '+44') {
  if (!countryCode) return COUNTRY_LOCATION_PRESETS['+44'];
  const cleanCode = countryCode.toString().trim();
  return COUNTRY_LOCATION_PRESETS[cleanCode] || COUNTRY_LOCATION_PRESETS['+44'];
}
