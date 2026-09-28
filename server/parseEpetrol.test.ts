// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseEpetrol } from './parseEpetrol.ts'

const html = readFileSync(join(import.meta.dirname, '__fixtures__/epetrol.html'), 'utf8')

describe('parseEpetrol', () => {
  const data = parseEpetrol(html)

  it('takes the newest national row with all four fuels', () => {
    expect(data.national).toEqual({
      updated: '2026-09-23',
      prices: { pb98: 8.84, pb95: 7.99, on: 8.99, lpg: 3.14 },
    })
  })

  it('parses all 16 voivodeships', () => {
    expect(Object.keys(data.regions.prices)).toHaveLength(16)
    expect(data.regions.updated).toBe('2026-07-08')
    expect(data.regions.prices['dolnośląskie']).toEqual({ pb95: 6.79, on: 6.94, lpg: 3.24 })
  })

  it('throws on unrelated html', () => {
    expect(() => parseEpetrol('<html><body>nic</body></html>')).toThrow(/not found/)
  })
})
