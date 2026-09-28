export const round2 = (n: number) => Math.round(n * 100) / 100

export function tripCost(p: { distanceKm: number; consumption: number; price: number }) {
  const liters = (p.distanceKm * p.consumption) / 100
  return { liters, total: round2(liters * p.price) }
}

/** Rounded up to the grosz so the sum never falls short of the total. */
export function perPerson(total: number, passengers: number): number {
  return Math.ceil(round2((total * 100) / Math.max(1, passengers))) / 100
}
