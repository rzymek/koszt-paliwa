import { FUEL_TYPES, type FuelType } from '../../domain/types'
import type { ResolvedPrice } from '../../domain/voivodeship'
import { NumberField } from '../NumberField/NumberField'
import styles from './FuelSettings.module.css'

type Props = {
  consumption: number
  onConsumption: (v: number) => void
  fuel: FuelType
  onFuel: (f: FuelType) => void
  price: number | null
  autoPrice: ResolvedPrice | null
  priceError: string | null
  priceLoading: boolean
  onPrice: (v: number) => void
  onResetPrice: () => void
}

export function FuelSettings(p: Props) {
  const overridden = p.autoPrice !== null && p.price !== p.autoPrice.price
  return (
    <section className={styles.card} aria-label="Ustawienia paliwa">
      <div className={styles.pills} role="radiogroup" aria-label="Rodzaj paliwa">
        {FUEL_TYPES.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={p.fuel === f.id}
            className={p.fuel === f.id ? styles.selected : undefined}
            onClick={() => p.onFuel(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <label className={styles.field}>
        <span>Spalanie</span>
        <NumberField className={styles.input} value={p.consumption} onChange={p.onConsumption} aria-label="Spalanie" />
        <span className={styles.unit}>l/100 km</span>
      </label>

      <label className={styles.field}>
        <span>Cena</span>
        <NumberField className={styles.input} value={p.price} decimals={2} onChange={p.onPrice} aria-label="Cena za litr" />
        <span className={styles.unit}>zł/l</span>
      </label>
      <p className={styles.source}>
        {p.priceLoading && 'Pobieranie aktualnych cen…'}
        {p.priceError && !p.autoPrice && <span className={styles.error}>{p.priceError} — wpisz cenę ręcznie.</span>}
        {p.autoPrice &&
          (overridden ? (
            <>
              Cena własna ·{' '}
              <button className={styles.reset} onClick={p.onResetPrice}>
                ↺ przywróć {p.autoPrice.price.toFixed(2).replace('.', ',')} zł
              </button>
            </>
          ) : (
            <>
              {p.autoPrice.source}, {p.autoPrice.updated} ·{' '}
              <a href="https://www.e-petrol.pl/notowania/rynek-krajowy/ceny-stacje-paliw" target="_blank" rel="noreferrer">
                e-petrol.pl
              </a>
            </>
          ))}
      </p>
    </section>
  )
}
