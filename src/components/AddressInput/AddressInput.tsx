import { useEffect, useRef, useState } from 'react'
import { searchPlaces, type Place } from '../../api/photon'
import styles from './AddressInput.module.css'

type Props = {
  value: string
  placeholder: string
  onSelect: (place: Place) => void
  'aria-label'?: string
}

export function AddressInput({ value, placeholder, onSelect, ...rest }: Props) {
  const [text, setText] = useState(value)
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const dirty = useRef(false)

  useEffect(() => {
    setText(value)
    dirty.current = false
  }, [value])

  useEffect(() => {
    if (!dirty.current || text.trim().length < 3) {
      setResults([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      searchPlaces(text, ctrl.signal).then(
        (r) => {
          setResults(r)
          setActive(0)
          setOpen(true)
        },
        () => {},
      )
    }, 300)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [text])

  const choose = (place: Place) => {
    setOpen(false)
    setResults([])
    dirty.current = false
    setText(place.label)
    onSelect(place)
  }

  return (
    <div className={styles.wrap}>
      <input
        {...rest}
        className={styles.input}
        placeholder={placeholder}
        value={text}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-autocomplete="list"
        onChange={(e) => {
          dirty.current = true
          setText(e.target.value)
        }}
        onFocus={(e) => {
          e.target.select()
          if (results.length) setOpen(true)
        }}
        onBlur={() => {
          setOpen(false)
          if (!text.trim()) setText(value)
        }}
        onKeyDown={(e) => {
          if (!open || !results.length) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => (a + 1) % results.length)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => (a - 1 + results.length) % results.length)
          } else if (e.key === 'Enter') {
            e.preventDefault()
            choose(results[active])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      {open && results.length > 0 && (
        <ul className={styles.list} role="listbox">
          {results.map((r, i) => (
            <li
              key={`${r.position.lat},${r.position.lng},${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? styles.active : undefined}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(r)
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className={styles.pin} aria-hidden>
                📍
              </span>
              <span>
                <span className={styles.label}>{r.label}</span>
                {r.detail && <span className={styles.detail}>{r.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
