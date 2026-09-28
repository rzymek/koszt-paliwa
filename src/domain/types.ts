export type LatLng = { lat: number; lng: number }

export type Waypoint = {
  id: string
  label: string
  position: LatLng | null
  /** Voivodeship as returned by the geocoder, e.g. "województwo mazowieckie" */
  state?: string
}

export type FuelType = 'pb95' | 'pb98' | 'on' | 'lpg'

export const FUEL_TYPES: { id: FuelType; label: string }[] = [
  { id: 'pb95', label: '95' },
  { id: 'pb98', label: '98' },
  { id: 'on', label: 'ON' },
  { id: 'lpg', label: 'LPG' },
]

export type PriceSet = Partial<Record<FuelType, number>>

/** Payload of GET /api/fuel-prices (shared with server/). */
export type FuelPrices = {
  national: { updated: string; prices: PriceSet }
  regions: { updated: string; prices: Record<string, PriceSet> }
}

export type Route = {
  distanceM: number
  durationS: number
  /** [lat, lng] pairs */
  geometry: [number, number][]
}

let nextId = 0
export const newWaypoint = (init: Partial<Omit<Waypoint, 'id'>> = {}): Waypoint => ({
  id: `wp${++nextId}`,
  label: '',
  position: null,
  ...init,
})
