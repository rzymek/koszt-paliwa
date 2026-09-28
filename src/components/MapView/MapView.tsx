import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import type { LatLng, Route, Waypoint } from '../../domain/types'
import { waypointLetter } from '../WaypointList/WaypointList'
import './MapView.css'

type Props = {
  waypoints: Waypoint[]
  route: Route | null
  onMapClick: (p: LatLng) => void
  onMarkerDrag: (id: string, p: LatLng) => void
}

const POLAND_CENTER: [number, number] = [52.07, 19.48]

function icon(letter: string, dest: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="wp-marker${dest ? ' wp-marker--dest' : ''}"><span>${letter}</span></div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  })
}

function ClickHandler({ onClick }: { onClick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

/** Leaves room for the floating side panel on desktop. */
const panelPadding = (): L.PointExpression => (window.innerWidth > 700 ? [440, 40] : [40, 40])

/** Pans/zooms to the route (or the chosen points) whenever it changes. */
function FitView({ points }: { points: [number, number][] }) {
  const map = useMap()
  const key = points.length ? `${points.length}:${points[0]}:${points[points.length - 1]}` : ''
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) {
      if (map.getZoom() < 11 || !map.getBounds().contains(points[0])) map.setView(points[0], Math.max(map.getZoom(), 11))
    } else {
      map.fitBounds(L.latLngBounds(points), { paddingTopLeft: panelPadding(), paddingBottomRight: [40, 40] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

export function MapView({ waypoints, route, onMapClick, onMarkerDrag }: Props) {
  const viewPoints: [number, number][] =
    route?.geometry ?? waypoints.flatMap((w) => (w.position ? [[w.position.lat, w.position.lng] as [number, number]] : []))

  return (
    <MapContainer center={POLAND_CENTER} zoom={6} className="map" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <ClickHandler onClick={onMapClick} />
      <FitView points={viewPoints} />
      {route && (
        <>
          <Polyline positions={route.geometry} pathOptions={{ color: '#0b57d0', weight: 9, opacity: 0.35 }} />
          <Polyline positions={route.geometry} pathOptions={{ color: '#1a73e8', weight: 5 }} />
        </>
      )}
      {waypoints.map((w, i) =>
        w.position ? (
          <Marker
            key={w.id}
            position={w.position}
            draggable
            icon={icon(waypointLetter(i), i === waypoints.length - 1)}
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng()
                onMarkerDrag(w.id, { lat: ll.lat, lng: ll.lng })
              },
            }}
          />
        ) : null,
      )}
    </MapContainer>
  )
}
