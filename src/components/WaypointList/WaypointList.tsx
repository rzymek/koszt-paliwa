import type { Place } from '../../api/photon'
import type { Waypoint } from '../../domain/types'
import { AddressInput } from '../AddressInput/AddressInput'
import styles from './WaypointList.module.css'

export const MAX_WAYPOINTS = 10

export const waypointLetter = (i: number) => String.fromCharCode(65 + i)

type Props = {
  waypoints: Waypoint[]
  onSelect: (id: string, place: Place) => void
  onRemove: (id: string) => void
  onAddStop: () => void
  onSwap: () => void
}

function placeholder(i: number, count: number) {
  if (i === 0) return 'Wybierz punkt początkowy lub kliknij na mapie'
  if (i === count - 1) return 'Wybierz cel podróży'
  return 'Przystanek'
}

export function WaypointList({ waypoints, onSelect, onRemove, onAddStop, onSwap }: Props) {
  const count = waypoints.length
  return (
    <div className={styles.wrap}>
      <ol className={styles.list}>
        {waypoints.map((wp, i) => (
          <li key={wp.id} className={styles.row}>
            <span className={`${styles.badge} ${i === count - 1 ? styles.dest : ''}`} aria-hidden>
              {waypointLetter(i)}
            </span>
            <AddressInput
              aria-label={i === 0 ? 'Start' : i === count - 1 ? 'Cel' : `Przystanek ${i}`}
              value={wp.label}
              placeholder={placeholder(i, count)}
              onSelect={(place) => onSelect(wp.id, place)}
            />
            {count > 2 && (
              <button className={styles.icon} onClick={() => onRemove(wp.id)} title="Usuń punkt" aria-label="Usuń punkt">
                ×
              </button>
            )}
          </li>
        ))}
      </ol>
      {count === 2 && (
        <button className={styles.swap} onClick={onSwap} title="Zamień start i cel" aria-label="Zamień start i cel">
          ⇅
        </button>
      )}
      {count < MAX_WAYPOINTS && (
        <button className={styles.add} onClick={onAddStop}>
          <span aria-hidden>＋</span> Dodaj przystanek
        </button>
      )}
    </div>
  )
}
