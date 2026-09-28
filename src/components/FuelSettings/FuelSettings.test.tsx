import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { FuelType } from '../../domain/types'
import { FuelSettings } from './FuelSettings'

const auto = { price: 7.99, source: 'średnia krajowa', updated: '2026-09-23' }

function Harness() {
  const [fuel, setFuel] = useState<FuelType>('pb95')
  const [override, setOverride] = useState<number | null>(null)
  return (
    <>
      <FuelSettings
        consumption={7}
        onConsumption={() => {}}
        fuel={fuel}
        onFuel={setFuel}
        price={override ?? auto.price}
        autoPrice={auto}
        priceError={null}
        priceLoading={false}
        onPrice={setOverride}
        onResetPrice={() => setOverride(null)}
      />
      <output data-testid="state">{`${fuel}:${override}`}</output>
    </>
  )
}

describe('FuelSettings', () => {
  it('shows auto price with its source', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Cena za litr')).toHaveValue('7,99')
    expect(screen.getByText(/średnia krajowa, 2026-09-23/)).toBeInTheDocument()
  })

  it('accepts a manual price with decimal comma and allows reset', async () => {
    render(<Harness />)
    const input = screen.getByLabelText('Cena za litr')
    await userEvent.clear(input)
    await userEvent.type(input, '6,5')
    expect(screen.getByTestId('state')).toHaveTextContent('pb95:6.5')
    await userEvent.click(screen.getByRole('button', { name: /przywróć/ }))
    expect(screen.getByTestId('state')).toHaveTextContent('pb95:null')
    expect(input).toHaveValue('7,99')
  })

  it('switches fuel type', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'ON' }))
    expect(screen.getByRole('radio', { name: 'ON' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('state')).toHaveTextContent('on:')
  })
})
