import type { LatLng, Route } from '../domain/types'

type OsrmResponse = {
  code: string
  message?: string
  routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[]
}

export function mapOsrmResponse(json: OsrmResponse): Route {
  const r = json.routes?.[0]
  if (json.code !== 'Ok' || !r) throw new Error(json.message ?? `Nie znaleziono trasy (${json.code})`)
  return {
    distanceM: r.distance,
    durationS: r.duration,
    geometry: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
  }
}

export async function fetchRoute(points: LatLng[], signal?: AbortSignal): Promise<Route> {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
  const res = await fetch(url, { signal })
  if (!res.ok && res.status !== 400) throw new Error(`OSRM ${res.status}`)
  return mapOsrmResponse(await res.json())
}
