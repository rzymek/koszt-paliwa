import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleFuelPrices } from '../server/fuelPrices.ts'

/** Vercel serverless function: GET /api/fuel-prices */
export default function handler(_req: IncomingMessage, res: ServerResponse) {
  return handleFuelPrices(res)
}
