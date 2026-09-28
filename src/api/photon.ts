import type { LatLng } from '../domain/types'

export type Place = { label: string; detail: string; position: LatLng; state?: string }

type PhotonFeature = {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    street?: string
    housenumber?: string
    postcode?: string
    city?: string
    county?: string
    state?: string
    country?: string
  }
}

/** Rough bounding box of Poland (+ margin): minLon,minLat,maxLon,maxLat */
const PL_BBOX = '13.5,48.8,24.5,55.1'

export function mapPhotonFeature({ geometry, properties: p }: PhotonFeature): Place {
  const street = [p.street, p.housenumber].filter(Boolean).join(' ')
  const label = p.name ?? (street || p.city || '')
  const detail = [street && street !== label ? street : '', p.city !== label ? p.city : '', p.state, p.country]
    .filter(Boolean)
    .join(', ')
  return {
    label,
    detail,
    position: { lat: geometry.coordinates[1], lng: geometry.coordinates[0] },
    state: p.state,
  }
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=default&limit=6&bbox=${PL_BBOX}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Photon ${res.status}`)
  const json = (await res.json()) as { features: PhotonFeature[] }
  return json.features.map(mapPhotonFeature)
}
