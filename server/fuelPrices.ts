import type { FuelPrices } from '../src/domain/types.ts'
import { parseEpetrol } from './parseEpetrol.ts'

const SOURCE_URL = 'https://www.e-petrol.pl/notowania/rynek-krajowy/ceny-stacje-paliw'
const TTL_MS = 6 * 60 * 60 * 1000

let cache: { at: number; data: FuelPrices } | null = null

export async function getFuelPrices(): Promise<FuelPrices> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data
  const res = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'koszt-paliwa/0.1' } })
  if (!res.ok) throw new Error(`e-petrol responded ${res.status}`)
  const data = parseEpetrol(await res.text())
  cache = { at: Date.now(), data }
  return data
}

type Res = { statusCode: number; setHeader(name: string, value: string): unknown; end(body: string): unknown }

export async function handleFuelPrices(res: Res): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const data = await getFuelPrices()
    res.statusCode = 200
    // s-maxage lets the CDN cache it — serverless instances don't keep the in-memory cache
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400')
    res.end(JSON.stringify(data))
  } catch (e) {
    res.statusCode = 502
    res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }))
  }
}
