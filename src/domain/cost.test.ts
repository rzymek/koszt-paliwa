import { describe, expect, it } from 'vitest'
import { perPerson, tripCost } from './cost'

describe('tripCost', () => {
  it('computes liters and total', () => {
    expect(tripCost({ distanceKm: 250, consumption: 7, price: 6.5 })).toEqual({ liters: 17.5, total: 113.75 })
  })

  it('is zero for zero distance', () => {
    expect(tripCost({ distanceKm: 0, consumption: 7, price: 6.5 }).total).toBe(0)
  })
})

describe('perPerson', () => {
  it('divides evenly', () => expect(perPerson(100, 4)).toBe(25))
  it('rounds up to the grosz', () => expect(perPerson(100, 3)).toBe(33.34))
  it('treats <1 passengers as 1', () => expect(perPerson(50, 0)).toBe(50))
})
