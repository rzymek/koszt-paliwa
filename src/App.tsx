import { useCallback, useEffect, useRef, useState } from 'react'
import { reverseGeocode } from './api/nominatim'
import type { Place } from './api/photon'
import { CostSummary } from './components/CostSummary/CostSummary'
import { FuelSettings } from './components/FuelSettings/FuelSettings'
import { MapView } from './components/MapView/MapView'
import { MAX_WAYPOINTS, WaypointList } from './components/WaypointList/WaypointList'
import { newWaypoint, type FuelType, type LatLng, type Waypoint } from './domain/types'
import { normalizeVoivodeship, resolvePrice } from './domain/voivodeship'
import { useFuelPrices } from './hooks/useFuelPrices'
import { usePersistentState } from './hooks/usePersistentState'
import { useRoute } from './hooks/useRoute'
import styles from './App.module.css'

const MY_LOCATION = 'Twoja lokalizacja'
const coordsLabel = (p: LatLng) => `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`

export default function App() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(() => [newWaypoint(), newWaypoint()])
  const waypointsRef = useRef(waypoints)
  waypointsRef.current = waypoints
  const [consumption, setConsumption] = usePersistentState('consumption', 7)
  const [fuel, setFuel] = usePersistentState<FuelType>('fuel', 'pb95')
  const [passengers, setPassengers] = usePersistentState('passengers', 1)
  const [priceOverride, setPriceOverride] = useState<number | null>(null)

  const prices = useFuelPrices()
  const voivodeship = normalizeVoivodeship(waypoints[0].state)
  const autoPrice = prices.data ? resolvePrice(prices.data, fuel, voivodeship) : null
  const price = priceOverride ?? autoPrice?.price ?? null

  const placed = waypoints.flatMap((w) => (w.position ? [w.position] : []))
  const { route, loading: routeLoading, error: routeError } = useRoute(placed)

  const update = useCallback((id: string, patch: Partial<Waypoint>) => {
    setWaypoints((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }, [])

  /** Fills in the address (unless keepLabel) and voivodeship once reverse geocoding returns. */
  const geocodeInto = useCallback((id: string, position: LatLng, keepLabel = false) => {
    reverseGeocode(position).then(
      ({ label, state }) =>
        setWaypoints((ws) =>
          ws.map((w) =>
            w.id === id && w.position === position ? { ...w, label: (!keepLabel && label) || w.label, state } : w,
          ),
        ),
      () => {},
    )
  }, [])

  /** Sets a point from the map. */
  const placeAt = useCallback(
    (id: string, position: LatLng) => {
      update(id, { position, label: coordsLabel(position), state: undefined })
      geocodeInto(id, position)
    },
    [update, geocodeInto],
  )

  // Default start: the user's current location, unless a start was already chosen.
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (cancelled) return
        const start = waypointsRef.current[0]
        if (start.position) return
        const position = { lat: coords.latitude, lng: coords.longitude }
        update(start.id, { position, label: MY_LOCATION, state: undefined })
        geocodeInto(start.id, position, true)
      },
      () => {},
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    )
    return () => {
      cancelled = true
    }
  }, [update, geocodeInto])

  const onMapClick = (p: LatLng) => {
    const empty = waypoints.find((w) => !w.position)
    if (empty) return placeAt(empty.id, p)
    if (waypoints.length >= MAX_WAYPOINTS) return
    const stop = newWaypoint()
    setWaypoints((ws) => [...ws.slice(0, -1), stop, ws[ws.length - 1]])
    placeAt(stop.id, p)
  }

  const onSelect = (id: string, place: Place) => update(id, { position: place.position, label: place.label, state: place.state })

  return (
    <div className={styles.app}>
      <aside className={styles.panel}>
        <h1 className={styles.title}>
          <span aria-hidden>⛽</span> Koszt paliwa
        </h1>

        <WaypointList
          waypoints={waypoints}
          onSelect={onSelect}
          onRemove={(id) => setWaypoints((ws) => ws.filter((w) => w.id !== id))}
          onAddStop={() => setWaypoints((ws) => [...ws.slice(0, -1), newWaypoint(), ws[ws.length - 1]])}
          onSwap={() => setWaypoints((ws) => [...ws].reverse())}
        />

        <hr className={styles.divider} />

        <FuelSettings
          consumption={consumption}
          onConsumption={setConsumption}
          fuel={fuel}
          onFuel={(f) => {
            setFuel(f)
            setPriceOverride(null)
          }}
          price={price}
          autoPrice={autoPrice}
          priceError={prices.error}
          priceLoading={prices.loading}
          onPrice={setPriceOverride}
          onResetPrice={() => setPriceOverride(null)}
        />

        <hr className={styles.divider} />

        {route ? (
          <div className={routeLoading ? styles.stale : undefined}>
            <CostSummary
              route={route}
              consumption={consumption}
              price={price}
              passengers={passengers}
              onPassengers={setPassengers}
            />
          </div>
        ) : (
          <p className={routeError ? styles.error : styles.hint}>
            {routeError ??
              (routeLoading ? 'Wyznaczanie trasy…' : 'Wpisz adresy lub kliknij na mapie, aby wyznaczyć trasę.')}
          </p>
        )}
      </aside>

      <main className={styles.map}>
        <MapView waypoints={waypoints} route={route} onMapClick={onMapClick} onMarkerDrag={placeAt} />
      </main>
    </div>
  )
}
