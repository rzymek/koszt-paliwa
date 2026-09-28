import type { LatLng } from '../domain/types'

export type ReverseResult = { label: string; state?: string }

type NominatimReverse = {
  name?: string
  display_name?: string
  address?: Record<string, string>
}

export function mapNominatimReverse(json: NominatimReverse): ReverseResult {
  const a = json.address ?? {}
  const locality = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.municipality
  const street = [a.road, a.house_number].filter(Boolean).join(' ')
  const label = [json.name || street, locality].filter(Boolean).join(', ') || json.display_name || ''
  return { label, state: a.state }
}

export async function reverseGeocode(p: LatLng, signal?: AbortSignal): Promise<ReverseResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=pl&zoom=17&lat=${p.lat}&lon=${p.lng}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)
  return mapNominatimReverse(await res.json())
}
