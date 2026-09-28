import type { FuelPrices } from '../domain/types'

export async function fetchFuelPrices(signal?: AbortSignal): Promise<FuelPrices> {
  const res = await fetch('/api/fuel-prices', { signal })
  if (!res.ok) throw new Error(`Nie udało się pobrać cen paliw (${res.status})`)
  return res.json()
}
