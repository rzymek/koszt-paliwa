import type { Connect, Plugin } from 'vite'
import { handleFuelPrices } from './fuelPrices.ts'

const middleware: Connect.NextHandleFunction = (req, res, next) => {
  if (req.method === 'GET' && req.url?.split('?')[0] === '/api/fuel-prices') {
    void handleFuelPrices(res)
    return
  }
  next()
}

export function fuelPricesPlugin(): Plugin {
  return {
    name: 'fuel-prices-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
