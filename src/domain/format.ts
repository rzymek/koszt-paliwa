const pln = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
const num1 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 })

export const formatPLN = (n: number) => pln.format(n)
export const formatKm = (meters: number) => `${num1.format(meters / 1000)} km`
export const formatLiters = (l: number) => `${num1.format(l)} l`

export function formatDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h ? `${h} godz. ${m} min` : `${m} min`
}
