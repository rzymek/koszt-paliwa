import { perPerson, tripCost } from '../../domain/cost'
import { formatDuration, formatKm, formatLiters, formatPLN } from '../../domain/format'
import type { Route } from '../../domain/types'
import styles from './CostSummary.module.css'

type Props = {
  route: Route
  consumption: number
  price: number | null
  passengers: number
  onPassengers: (n: number) => void
}

export function CostSummary({ route, consumption, price, passengers, onPassengers }: Props) {
  const { liters, total } = tripCost({ distanceKm: route.distanceM / 1000, consumption, price: price ?? 0 })
  return (
    <section className={styles.card} aria-label="Koszt podróży">
      <div className={styles.head}>
        <span className={styles.total} data-testid="total">
          {price === null ? '—' : formatPLN(total)}
        </span>
        <span className={styles.meta}>
          {formatKm(route.distanceM)} · {formatDuration(route.durationS)} · {formatLiters(liters)}
        </span>
      </div>

      <div className={styles.split}>
        <span className={styles.splitLabel}>Osób</span>
        <div className={styles.chips} role="radiogroup" aria-label="Liczba osób">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={passengers === n}
              className={passengers === n ? styles.selected : undefined}
              onClick={() => onPassengers(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {passengers > 1 && price !== null && (
        <p className={styles.perPerson} data-testid="per-person">
          <strong>{formatPLN(perPerson(total, passengers))}</strong> / osoba
        </p>
      )}
    </section>
  )
}
