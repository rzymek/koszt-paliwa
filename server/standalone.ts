import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { handleFuelPrices } from './fuelPrices.ts'

const DIST = join(import.meta.dirname, '..', 'dist')
const PORT = Number(process.env.PORT ?? 3000)
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
}

createServer(async (req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  if (path === '/api/fuel-prices') return handleFuelPrices(res)
  const file = normalize(join(DIST, path === '/' ? 'index.html' : path))
  if (!file.startsWith(DIST)) {
    res.statusCode = 403
    return res.end()
  }
  try {
    const body = await readFile(file)
    res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
    res.end(body)
  } catch {
    res.setHeader('Content-Type', TYPES['.html'])
    res.end(await readFile(join(DIST, 'index.html')))
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`))
