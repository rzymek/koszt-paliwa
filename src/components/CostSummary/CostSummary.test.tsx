import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { CostSummary } from './CostSummary'

const route = { distanceM: 250_000, durationS: 3 * 3600, geometry: [] }
const text = (el: HTMLElement) => el.textContent!.replace(/\s/g, ' ')

function Harness({ price = 6.5 as number | null }) {
  const [n, setN] = useState(1)
  return <CostSummary route={route} consumption={7} price={price} passengers={n} onPassengers={setN} />
}

describe('CostSummary', () => {
  it('shows total, distance, time and liters', () => {
    render(<Harness />)
    expect(text(screen.getByTestId('total'))).toBe('113,75 zł')
    expect(screen.getByText(/250 km · 3 godz. 0 min · 17,5 l/)).toBeInTheDocument()
    expect(screen.queryByTestId('per-person')).toBeNull()
  })

  it('splits cost between passengers on single click', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: '3' }))
    expect(text(screen.getByTestId('per-person'))).toBe('37,92 zł / osoba')
  })

  it('shows dash when price is unknown', () => {
    render(<Harness price={null} />)
    expect(screen.getByTestId('total')).toHaveTextContent('—')
  })
})
