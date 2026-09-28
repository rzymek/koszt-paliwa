import { useEffect, useState } from 'react'
import { fetchFuelPrices } from '../api/fuelPrices'
import type { FuelPrices } from '../domain/types'

export function useFuelPrices() {
  const [data, setData] = useState<FuelPrices | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetchFuelPrices(ctrl.signal).then(setData, (e: unknown) => {
      if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : String(e))
    })
    return () => ctrl.abort()
  }, [])

  return { data, error, loading: !data && !error }
}
