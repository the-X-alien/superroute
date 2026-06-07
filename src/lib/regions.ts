export interface RegionContext {
  name: string
  country: string
  currency: string
  providers: ProviderTemplate[]
  airports: Array<{ code: string; name: string; lat: number; lng: number }>
  airlines: AirlineTemplate[]
  taxis: ProviderTemplate[]
  carRentals: ProviderTemplate[]
  transit: ProviderTemplate[]
}

export interface ProviderTemplate {
  name: string
  type: string
  basePrice: number
  pricePerKm: number
  speedFactor: number
  co2PerKm: number
  rating: number
  icon: string
}

export interface AirlineTemplate {
  name: string
  iata: string
  basePrice: number
  pricePerKm: number
  rating: number
  co2PerKm: number
  alliance: string
}

const regions: Record<string, RegionContext> = {
  "US-CA-BAY": {
    name: "Silicon Valley / Bay Area",
    country: "US",
    currency: "USD",
    providers: [
      { name: "Walking", type: "walking", basePrice: 0, pricePerKm: 0, speedFactor: 5, co2PerKm: 0, rating: 5, icon: "🚶" },
      { name: "Cycling", type: "cycling", basePrice: 0, pricePerKm: 0, speedFactor: 15, co2PerKm: 0, rating: 4.5, icon: "🚲" },
      { name: "Scooter (Lime)", type: "scooter", basePrice: 1, pricePerKm: 0.35, speedFactor: 20, co2PerKm: 5, rating: 4.2, icon: "🛴" },
      { name: "Scooter (Bird)", type: "scooter", basePrice: 1, pricePerKm: 0.39, speedFactor: 20, co2PerKm: 5, rating: 4.0, icon: "🛴" },
    ],
    transit: [
      { name: "VTA Bus", type: "transit", basePrice: 2.50, pricePerKm: 0, speedFactor: 25, co2PerKm: 30, rating: 3.8, icon: "🚌" },
      { name: "VTA Light Rail", type: "transit", basePrice: 2.50, pricePerKm: 0, speedFactor: 30, co2PerKm: 20, rating: 4.0, icon: "🚋" },
      { name: "BART", type: "transit", basePrice: 3.20, pricePerKm: 0.15, speedFactor: 55, co2PerKm: 15, rating: 4.3, icon: "🚇" },
      { name: "Caltrain", type: "transit", basePrice: 3.50, pricePerKm: 0.12, speedFactor: 50, co2PerKm: 18, rating: 4.1, icon: "🚆" },
      { name: "AC Transit", type: "transit", basePrice: 2.25, pricePerKm: 0, speedFactor: 22, co2PerKm: 35, rating: 3.5, icon: "🚌" },
      { name: "SamTrans", type: "transit", basePrice: 2.00, pricePerKm: 0, speedFactor: 24, co2PerKm: 32, rating: 3.6, icon: "🚌" },
      { name: "Muni", type: "transit", basePrice: 2.50, pricePerKm: 0, speedFactor: 20, co2PerKm: 28, rating: 3.4, icon: "🚌" },
    ],
    taxis: [
      { name: "Yellow Cab", type: "taxi", basePrice: 3.50, pricePerKm: 2.20, speedFactor: 40, co2PerKm: 180, rating: 3.8, icon: "🚕" },
      { name: "Green Cab", type: "taxi", basePrice: 3.00, pricePerKm: 2.00, speedFactor: 40, co2PerKm: 170, rating: 3.9, icon: "🚕" },
      { name: "Luxor Cab", type: "taxi", basePrice: 4.00, pricePerKm: 2.50, speedFactor: 42, co2PerKm: 190, rating: 4.1, icon: "🚕" },
    ],
    carRentals: [
      { name: "Enterprise", type: "car_rental", basePrice: 45, pricePerKm: 0.10, speedFactor: 45, co2PerKm: 160, rating: 4.2, icon: "🚗" },
      { name: "Hertz", type: "car_rental", basePrice: 50, pricePerKm: 0.12, speedFactor: 47, co2PerKm: 165, rating: 4.0, icon: "🚗" },
      { name: "Avis", type: "car_rental", basePrice: 48, pricePerKm: 0.11, speedFactor: 46, co2PerKm: 162, rating: 3.9, icon: "🚗" },
      { name: "Budget", type: "car_rental", basePrice: 35, pricePerKm: 0.09, speedFactor: 44, co2PerKm: 158, rating: 3.7, icon: "🚗" },
      { name: "Zipcar", type: "car_rental", basePrice: 12, pricePerKm: 0.15, speedFactor: 45, co2PerKm: 160, rating: 4.1, icon: "🚗" },
    ],
    airports: [
      { code: "SFO", name: "San Francisco International", lat: 37.6213, lng: -122.3790 },
      { code: "SJC", name: "San Jose International", lat: 37.3639, lng: -121.9289 },
      { code: "OAK", name: "Oakland International", lat: 37.7112, lng: -122.2215 },
    ],
    airlines: [
        { name: "Southwest Airlines", iata: "WN", basePrice: 49, pricePerKm: 0.08, rating: 4.2, co2PerKm: 85, alliance: "None" },
        { name: "United Airlines", iata: "UA", basePrice: 59, pricePerKm: 0.10, rating: 4.0, co2PerKm: 88, alliance: "Star Alliance" },
        { name: "Delta Air Lines", iata: "DL", basePrice: 65, pricePerKm: 0.11, rating: 4.3, co2PerKm: 82, alliance: "SkyTeam" },
        { name: "American Airlines", iata: "AA", basePrice: 62, pricePerKm: 0.10, rating: 4.0, co2PerKm: 86, alliance: "oneworld" },
        { name: "Alaska Airlines", iata: "AS", basePrice: 55, pricePerKm: 0.09, rating: 4.4, co2PerKm: 80, alliance: "oneworld" },
        { name: "JetBlue", iata: "B6", basePrice: 45, pricePerKm: 0.07, rating: 4.1, co2PerKm: 78, alliance: "None" },
        { name: "Spirit Airlines", iata: "NK", basePrice: 29, pricePerKm: 0.05, rating: 3.2, co2PerKm: 90, alliance: "None" },
        { name: "Frontier Airlines", iata: "F9", basePrice: 32, pricePerKm: 0.05, rating: 3.4, co2PerKm: 88, alliance: "None" },
        { name: "Hawaiian Airlines", iata: "HA", basePrice: 78, pricePerKm: 0.12, rating: 4.5, co2PerKm: 75, alliance: "None" },
        { name: "Sun Country", iata: "SY", basePrice: 38, pricePerKm: 0.06, rating: 3.8, co2PerKm: 84, alliance: "None" },
        { name: "British Airways", iata: "BA", basePrice: 120, pricePerKm: 0.15, rating: 4.2, co2PerKm: 80, alliance: "oneworld" },
        { name: "Lufthansa", iata: "LH", basePrice: 110, pricePerKm: 0.14, rating: 4.3, co2PerKm: 78, alliance: "Star Alliance" },
        { name: "Emirates", iata: "EK", basePrice: 150, pricePerKm: 0.18, rating: 4.6, co2PerKm: 85, alliance: "None" },
        { name: "Singapore Airlines", iata: "SQ", basePrice: 140, pricePerKm: 0.17, rating: 4.7, co2PerKm: 75, alliance: "Star Alliance" },
        { name: "Cathay Pacific", iata: "CX", basePrice: 130, pricePerKm: 0.16, rating: 4.4, co2PerKm: 77, alliance: "oneworld" },
        { name: "ANA", iata: "NH", basePrice: 135, pricePerKm: 0.16, rating: 4.5, co2PerKm: 73, alliance: "Star Alliance" },
        { name: "Qatar Airways", iata: "QR", basePrice: 145, pricePerKm: 0.17, rating: 4.6, co2PerKm: 80, alliance: "oneworld" },
        { name: "Turkish Airlines", iata: "TK", basePrice: 95, pricePerKm: 0.12, rating: 3.9, co2PerKm: 82, alliance: "Star Alliance" },
        { name: "Air France", iata: "AF", basePrice: 105, pricePerKm: 0.13, rating: 4.1, co2PerKm: 79, alliance: "SkyTeam" },
        { name: "KLM", iata: "KL", basePrice: 100, pricePerKm: 0.13, rating: 4.1, co2PerKm: 79, alliance: "SkyTeam" },
    ],
  },
}

export async function getRegionForCoords(lat: number, lng: number): Promise<RegionContext> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=airport&lat=${lat}&lon=${lng}&addressdetails=1&limit=5`, {
      headers: { 'User-Agent': 'SuperRoute-App' }
    });
    const airportsNearby = await response.json();
    
    // Dynamic Region Creation
    return {
      name: "Local Region",
      country: airportsNearby[0]?.address?.country_code?.toUpperCase() || "US",
      currency: "USD", // Should ideally be dynamic based on country
      providers: [
        { name: "Walking", type: "walking", basePrice: 0, pricePerKm: 0, speedFactor: 5, co2PerKm: 0, rating: 5, icon: "🚶" },
        { name: "Cycling", type: "cycling", basePrice: 0, pricePerKm: 0, speedFactor: 15, co2PerKm: 0, rating: 4.5, icon: "🚲" },
      ],
      transit: [],
      taxis: [],
      carRentals: [],
      airports: airportsNearby.map((a: any) => ({
        code: a.name.split(' ')[0].toUpperCase(), // Fallback code estimation
        name: a.name,
        lat: parseFloat(a.lat),
        lng: parseFloat(a.lon)
      })),
      airlines: regions["US-CA-BAY"].airlines // Reuse global airline templates
    };
  } catch (error) {
    console.error("Error fetching regional context:", error);
    return regions["US-CA-BAY"];
  }
}
