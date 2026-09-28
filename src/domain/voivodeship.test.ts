import { describe, expect, it } from 'vitest'
import type { FuelPrices } from './types'
import { normalizeVoivodeship, resolvePrice } from './voivodeship'

const data = (regionsUpdated: string): FuelPrices => ({
  national: { updated: '2026-09-23', prices: { pb95: 8.0, pb98: 8.8, on: 9.0, lpg: 3.1 } },
  regions: {
    updated: regionsUpdated,
    prices: {
      mazowieckie: { pb95: 7.1, on: 7.2, lpg: 3.2 },
      lubelskie: { pb95: 6.9, on: 7.0, lpg: 3.0 },
    },
  },
})

describe('normalizeVoivodeship', () => {
  it('strips the "województwo" prefix', () => {
    expect(normalizeVoivodeship('województwo mazowieckie')).toBe('mazowieckie')
    expect(normalizeVoivodeship('Województwo Małopolskie')).toBe('małopolskie')
  })
  it('handles missing values', () => {
    expect(normalizeVoivodeship(undefined)).toBeNull()
    expect(normalizeVoivodeship('')).toBeNull()
  })
})

describe('resolvePrice', () => {
  it('uses fresh regional average directly', () => {
    expect(resolvePrice(data('2026-09-23'), 'pb95', 'mazowieckie')).toEqual({
      price: 7.1,
      source: 'średnia woj. mazowieckie',
      updated: '2026-09-23',
    })
  })

  it('applies regional offset to national average when regional data is stale', () => {
    // mean 7.0, mazowieckie +0.1 → 8.0 + 0.1
    expect(resolvePrice(data('2026-07-08'), 'pb95', 'mazowieckie')).toEqual({
      price: 8.1,
      source: 'średnia krajowa skorygowana dla woj. mazowieckie',
      updated: '2026-09-23',
    })
  })

  it('falls back to national when fuel is missing regionally (Pb98)', () => {
    expect(resolvePrice(data('2026-09-23'), 'pb98', 'mazowieckie')?.source).toBe('średnia krajowa')
  })

  it('falls back to national for unknown voivodeship', () => {
    expect(resolvePrice(data('2026-09-23'), 'on', null)?.price).toBe(9.0)
  })
})
