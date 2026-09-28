import { describe, expect, it } from 'vitest'
import { formatDuration, formatKm, formatPLN } from './format'

const nbsp = (s: string) => s.replace(/\s/g, ' ')

describe('format', () => {
  it('formats PLN', () => expect(nbsp(formatPLN(113.75))).toBe('113,75 zł'))
  it('formats km', () => expect(nbsp(formatKm(292_345))).toBe('292,3 km'))
  it('formats duration', () => {
    expect(formatDuration(3 * 3600 + 25 * 60)).toBe('3 godz. 25 min')
    expect(formatDuration(40 * 60)).toBe('40 min')
  })
})
