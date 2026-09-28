import { round2 } from './cost'
import type { FuelPrices, FuelType } from './types'

/** "Województwo Mazowieckie" / "mazowieckie" → "mazowieckie" */
export function normalizeVoivodeship(state: string | undefined | null): string | null {
  if (!state) return null
  const name = state.toLowerCase().replace(/^województwo\s+/, '').trim()
  return name || null
}

/** Regional data older than this relative to the national average is treated as stale. */
const STALE_DAYS = 14

export type ResolvedPrice = { price: number; source: string; updated: string }

function daysBetween(a: string, b: string): number {
  return Math.abs(Date.parse(a) - Date.parse(b)) / 86_400_000
}

/**
 * Price for the given fuel near the start point. Uses the voivodeship average when fresh;
 * when stale, applies that region's offset from the regional mean to the current national average.
 */
export function resolvePrice(data: FuelPrices, fuel: FuelType, voivodeship: string | null): ResolvedPrice | null {
  const national = data.national.prices[fuel]
  const regional = voivodeship ? data.regions.prices[voivodeship]?.[fuel] : undefined

  if (regional !== undefined && voivodeship) {
    if (national === undefined || daysBetween(data.regions.updated, data.national.updated) <= STALE_DAYS) {
      return { price: regional, source: `średnia woj. ${voivodeship}`, updated: data.regions.updated }
    }
    const all = Object.values(data.regions.prices)
      .map((p) => p[fuel])
      .filter((v): v is number => v !== undefined)
    const mean = all.reduce((s, v) => s + v, 0) / all.length
    return {
      price: round2(national + regional - mean),
      source: `średnia krajowa skorygowana dla woj. ${voivodeship}`,
      updated: data.national.updated,
    }
  }

  if (national === undefined) return null
  return { price: national, source: 'średnia krajowa', updated: data.national.updated }
}
