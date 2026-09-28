import { describe, expect, it } from 'vitest'
import { mapNominatimReverse } from './nominatim'
import { mapOsrmResponse } from './osrm'
import { mapPhotonFeature } from './photon'

describe('mapOsrmResponse', () => {
  it('maps distance, duration and flips coordinates to [lat, lng]', () => {
    const route = mapOsrmResponse({
      code: 'Ok',
      routes: [{ distance: 1000, duration: 60, geometry: { coordinates: [[21, 52], [19.9, 50.06]] } }],
    })
    expect(route).toEqual({ distanceM: 1000, durationS: 60, geometry: [[52, 21], [50.06, 19.9]] })
  })

  it('throws when no route', () => {
    expect(() => mapOsrmResponse({ code: 'NoRoute', message: 'Impossible route' })).toThrow('Impossible route')
  })
})

describe('mapPhotonFeature', () => {
  it('maps a city', () => {
    expect(
      mapPhotonFeature({
        geometry: { coordinates: [21.01, 52.23] },
        properties: { name: 'Warszawa', state: 'województwo mazowieckie', country: 'Polska' },
      }),
    ).toEqual({
      label: 'Warszawa',
      detail: 'województwo mazowieckie, Polska',
      position: { lat: 52.23, lng: 21.01 },
      state: 'województwo mazowieckie',
    })
  })

  it('builds a label from street when unnamed', () => {
    const p = mapPhotonFeature({
      geometry: { coordinates: [19.9, 50.06] },
      properties: { street: 'Floriańska', housenumber: '3', city: 'Kraków' },
    })
    expect(p.label).toBe('Floriańska 3')
    expect(p.detail).toBe('Kraków')
  })
})

describe('mapNominatimReverse', () => {
  it('uses road + locality and state', () => {
    expect(
      mapNominatimReverse({
        address: { road: 'Marszałkowska', house_number: '1', city: 'Warszawa', state: 'województwo mazowieckie' },
      }),
    ).toEqual({ label: 'Marszałkowska 1, Warszawa', state: 'województwo mazowieckie' })
  })
})
