// This file will handle all third-party API integrations for fetching live data.

// Placeholder for API keys. These should be stored securely.
const API_KEYS = {
  DUFFEL_ACCESS_TOKEN: "duffel_test_placeholder",
  RENTALCARS_API_KEY: "rentalcars_placeholder",
  LYFT_CLIENT_ID: "lyft_client_id_placeholder",
  LYFT_CLIENT_SECRET: "lyft_client_secret_placeholder",
  UBER_CLIENT_SECRET: "aqqd2wkXqe6V4QpNQYiyyZd7LPR2p_r8bjEOrabw",
  UBER_SERVER_TOKEN: "uber_server_token_placeholder",
  TRANSITLAND_API_KEY: "transitland_placeholder",
};

// --- RIDE-SHARING APIS ---

export interface RideEstimate {
  provider: 'Uber' | 'Lyft';
  displayName: string;
  price: number;
  duration: number; // in seconds
  distance: number; // in meters
}

export async function getLyftEstimates(startLat: number, startLng: number, endLat: number, endLng: number): Promise<RideEstimate[]> {
  // Use btoa for Base64 in browser environment
  const auth = btoa(`${API_KEYS.LYFT_CLIENT_ID}:${API_KEYS.LYFT_CLIENT_SECRET}`);
  
  try {
    const tokenResponse = await fetch('https://api.lyft.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify({ grant_type: 'client_credentials', scope: 'public' })
    });
    
    if (!tokenResponse.ok) return [];
    
    const { access_token } = await tokenResponse.json();

    const url = `https://api.lyft.com/v1/cost?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${access_token}` } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.cost_estimates.map((est: any) => ({
      provider: 'Lyft',
      displayName: est.display_name,
      price: (est.estimated_cost_cents_min + est.estimated_cost_cents_max) / 200, // avg price in dollars
      duration: est.estimated_duration_seconds,
      distance: est.estimated_distance_miles * 1609.34,
    }));
  } catch (error) {
    console.error("Error fetching Lyft estimates:", error);
    return [];
  }
}

export async function getUberEstimates(startLat: number, startLng: number, endLat: number, endLng: number): Promise<RideEstimate[]> {
  const url = `https://api.uber.com/v1.2/estimates/price?start_latitude=${startLat}&start_longitude=${startLng}&end_latitude=${endLat}&end_longitude=${endLng}`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Token ${API_KEYS.UBER_SERVER_TOKEN}`, 'Accept-Language': 'en_US', 'Content-Type': 'application/json' } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.prices.map((est: any) => ({
      provider: 'Uber',
      displayName: est.display_name,
      price: (est.low_estimate + est.high_estimate) / 2,
      duration: est.duration,
      distance: est.distance * 1609.34,
    }));
  } catch (error) {
    console.error("Error fetching Uber estimates:", error);
    return [];
  }
}

// --- FLIGHTS API ---

export interface FlightOffer {
  id: string;
  airlineName: string;
  airlineIata: string;
  price: number;
  currency: string;
  duration: number; // ISO 8601 duration string, e.g., "PT8H45M"
  stops: number;
  legs: Array<{
    departure: string; // ISO 8601 datetime
    arrival: string;   // ISO 8601 datetime
    originCode: string;
    destinationCode: string;
  }>;
  bookingUrl: string;
}

export async function getFlightOffers(originCode: string, destinationCode: string, departureDate: string): Promise<FlightOffer[]> {
  const body = {
    data: {
      slices: [{ origin: originCode, destination: destinationCode, departure_date: departureDate }],
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy',
    },
  };
  try {
    const response = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Accept-Encoding': 'gzip',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v1',
        'Authorization': `Bearer ${API_KEYS.DUFFEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Duffel API error: ${response.status}`, errorBody);
        return [];
    }

    const data = await response.json();
    
    return data.data.offers.map((offer: any) => ({
      id: offer.id,
      airlineName: offer.owner.name,
      airlineIata: offer.owner.iata_code,
      price: parseFloat(offer.total_amount),
      currency: offer.total_currency,
      duration: offer.slices[0].duration,
      stops: offer.slices[0].segments.length - 1,
      legs: offer.slices[0].segments.map((seg: any) => ({
          departure: seg.departing_at,
          arrival: seg.arriving_at,
          originCode: seg.origin.iata_code,
          destinationCode: seg.destination.iata_code
      })),
      bookingUrl: `https://app.duffel.com/flights?offer_id=${offer.id}`
    }));

  } catch (error) {
    console.error("Error fetching flight offers from Duffel:", error);
    return [];
  }
}

// --- TRANSIT API ---

export interface TransitAgency {
  id: string;
  name: string;
  onestopId: string;
}

export async function getTransitAgenciesByLocation(lat: number, lng: number, radiusMeters: number = 50000): Promise<TransitAgency[]> {
  const url = `https://transit.land/api/v2/rest/agencies?lat=${lat}&lon=${lng}&r=${radiusMeters}&per_page=10&apikey=${API_KEYS.TRANSITLAND_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.agencies) return [];
    return data.agencies.map((agency: any) => ({
      id: agency.id,
      name: agency.name || agency.agency_name,
      onestopId: agency.onestop_id,
    }));
  } catch (error) {
    console.error("Error fetching transit agencies from TransitLand:", error);
    return [];
  }
}

// --- CAR RENTALS ---

export interface CarRentalOffer {
    company: string;
    carName: string;
    price: number; // Per day
    currency: string;
    bookingUrl: string;
}

export async function getCarRentalOffers(lat: number, lng: number, pickupDate: string, dropoffDate: string): Promise<CarRentalOffer[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=car_rental&lat=${lat}&lon=${lng}&addressdetails=1&limit=5`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SuperRoute-App'
      }
    });
    if (!response.ok) return [];
    
    const locations = await response.json();
    
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const days = Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));

    return locations.map((loc: any) => ({
      company: loc.name || (loc.address && loc.address.car_rental) || "Local Rental",
      carName: "Standard Class",
      price: 55 * days, // Estimated average price per day
      currency: "USD",
      bookingUrl: `https://www.google.com/search?q=${encodeURIComponent((loc.name || "car rental") + " " + (loc.address?.city || ""))}`
    }));
  } catch (error) {
    console.error("Error fetching car rentals via Nominatim:", error);
    return [];
  }
}