import { parse, type HTMLElement } from 'node-html-parser'
import type { FuelPrices, FuelType, PriceSet } from '../src/domain/types.ts'

const HEADER_TO_FUEL: Record<string, FuelType> = {
  pb98: 'pb98',
  pb95: 'pb95',
  on: 'on',
  lpg: 'lpg',
}

function parseNumber(text: string): number | undefined {
  const n = Number(text.trim().replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function headers(table: HTMLElement): string[] {
  return table.querySelectorAll('thead th').map((th) => th.text.trim().toLowerCase().replace(/\s+/g, ''))
}

function rows(table: HTMLElement): string[][] {
  return table.querySelectorAll('tbody tr').map((tr) => tr.querySelectorAll('td').map((td) => td.text.trim()))
}

function pricesFromRow(cols: string[], row: string[]): PriceSet {
  const prices: PriceSet = {}
  cols.forEach((col, i) => {
    const fuel = HEADER_TO_FUEL[col]
    const value = fuel && parseNumber(row[i] ?? '')
    if (fuel && value) prices[fuel] = value
  })
  return prices
}

export function parseEpetrol(html: string): FuelPrices {
  const tables = parse(html).querySelectorAll('table.tablesort')

  const nationalTable = tables.find((t) => {
    const h = headers(t)
    return h[0] === 'aktualizacja' && h.includes('pb95') && !h.includes('województwo') && !h.includes('miasto')
  })
  const regionTable = tables.find((t) => headers(t).includes('województwo') && headers(t).includes('lpg'))
  if (!nationalTable) throw new Error('e-petrol: national price table not found')

  const nCols = headers(nationalTable)
  const latest = rows(nationalTable)
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r[0] ?? ''))
    .sort((a, b) => b[0].localeCompare(a[0]))[0]
  if (!latest) throw new Error('e-petrol: national price table is empty')

  const regions: FuelPrices['regions'] = { updated: '', prices: {} }
  if (regionTable) {
    const rCols = headers(regionTable)
    const nameIdx = rCols.indexOf('województwo')
    for (const row of rows(regionTable)) {
      const name = row[nameIdx]?.toLowerCase()
      if (!name) continue
      regions.prices[name] = pricesFromRow(rCols, row)
      if (row[0] > regions.updated) regions.updated = row[0]
    }
  }

  return {
    national: { updated: latest[0], prices: pricesFromRow(nCols, latest) },
    regions,
  }
}
