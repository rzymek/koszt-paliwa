import { useEffect, useState } from 'react'
import { fetchRoute } from '../api/osrm'
import type { LatLng, Route } from '../domain/types'

type State = { route: Route | null; loading: boolean; error: string | null }

export function useRoute(points: LatLng[]): State {
  const [state, setState] = useState<State>({ route: null, loading: false, error: null })
  const key = points.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join(';')

  useEffect(() => {
    if (points.length < 2) {
      setState({ route: null, loading: false, error: null })
      return
    }
    const ctrl = new AbortController()
    setState((s) => ({ ...s, loading: true, error: null }))
    fetchRoute(points, ctrl.signal).then(
      (route) => setState({ route, loading: false, error: null }),
      (e: unknown) => {
        if (ctrl.signal.aborted) return
        setState({ route: null, loading: false, error: e instanceof Error ? e.message : String(e) })
      },
    )
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key captures points
  }, [key])

  return state
}
