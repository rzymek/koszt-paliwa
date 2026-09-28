import { useEffect, useState } from 'react'

type Props = {
  value: number | null
  onChange: (value: number) => void
  id?: string
  'aria-label'?: string
  className?: string
  min?: number
  /** Fixed number of decimals shown when not editing */
  decimals?: number
}

const toText = (v: number | null, decimals?: number) =>
  v === null ? '' : (decimals === undefined ? String(v) : v.toFixed(decimals)).replace('.', ',')

/** Decimal input accepting both "6,79" and "6.79"; commits only valid numbers. */
export function NumberField({ value, onChange, min = 0, decimals, ...rest }: Props) {
  const [text, setText] = useState(toText(value, decimals))

  useEffect(() => {
    setText((t) => (Number(t.replace(',', '.')) === value ? t : toText(value, decimals)))
  }, [value, decimals])

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number(e.target.value.trim().replace(',', '.'))
        if (e.target.value.trim() !== '' && Number.isFinite(n) && n >= min) onChange(n)
      }}
      onBlur={() => setText(toText(value, decimals))}
    />
  )
}
