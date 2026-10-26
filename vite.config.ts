import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join, normalize, resolve, sep } from 'node:path'
import { defineConfig, type Connect, type Plugin } from 'vite'
import { exercises } from './src/data/exercises.ts'
import { isFiling, type Filing } from './src/filing.ts'
import {
  escapeHtml,
  footerHtml,
  headerHtml,
  renderExerciseCards,
  renderExerciseCount,
  renderExerciseDocument,
  renderFeaturedCta,
  renderFeaturedPanel,
  siteDescription,
} from './src/render.ts'

const FILING_URL = 'https://account.phoobobo.top/api/filing.json'

function readFallbackFiling(): Filing {
  const file = resolve(import.meta.dirname, 'src/data/filing.json')
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'))
  if (!isFiling(parsed)) {
    throw new Error('src/data/filing.json 格式不正确')
  }
  return parsed
}

async function loadFiling(): Promise<Filing> {
  const fallback = readFallbackFiling()
  try {
    const response = await fetch(FILING_URL, {
      signal: AbortSignal.timeout(4000),
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      console.warn(`备案接口返回 ${response.status}，使用 src/data/filing.json`)
      return fallback
    }
    const parsed: unknown = await response.json()
    if (!isFiling(parsed)) {
      console.warn('备案接口内容无法识别，使用 src/data/filing.json')
      return fallback
    }
    return parsed
  } catch {
    console.warn('备案接口不可达，使用 src/data/filing.json')
    return fallback
  }
}

function writeExercisePages(filing: Filing): Record<string, string> {
  const root = resolve(import.meta.dirname, 'exercise')
  rmSync(root, { recursive: true, force: true })
  const input: Record<string, string> = {}
  for (const exercise of exercises) {
    const dir = join(root, exercise.id)
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'index.html')
    writeFileSync(file, renderExerciseDocument(exercise, filing))
    input[`exercise-${exercise.id}`] = file
  }
  return input
}

function videoPath(url: string): string | null {
  const pathOnly = url.split('?')[0] ?? ''
  let decoded = pathOnly
  try {
    decoded = decodeURIComponent(pathOnly)
  } catch {
    return null
  }
  if (!decoded.startsWith('/videos/') || !decoded.endsWith('.mp4')) return null
  const rel = normalize(decoded.slice('/videos/'.length))
  if (!rel || rel.startsWith('..') || rel.includes('/') || rel.includes('\\') || rel.includes(sep)) {
    return null
  }
  const root = join(import.meta.dirname, 'videos')
  const file = join(root, rel)
  if (!file.startsWith(root + sep)) return null
  if (!existsSync(file) || !statSync(file).isFile()) return null
  return file
}

function serveVideo(req: IncomingMessage, res: ServerResponse, file: string): void {
  const size = statSync(file).size
  const range = req.headers.range
  res.setHeader('Content-Type', 'video/mp4')
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Cache-Control', 'no-cache')

  const pipe = (start: number, end: number, status: number): void => {
    res.statusCode = status
    res.setHeader('Content-Length', String(end - start + 1))
    if (status === 206) {
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
    }
    const stream = createReadStream(file, { start, end })
    const destroy = (): void => {
      stream.destroy()
    }
    req.on('close', destroy)
    stream.on('error', () => {
      if (!res.headersSent) res.statusCode = 500
      res.end()
    })
    stream.pipe(res)
  }

  if (!range) {
    pipe(0, size - 1, 200)
    return
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match) {
    res.statusCode = 416
    res.setHeader('Content-Range', `bytes */${size}`)
    res.end()
    return
  }
  const start = match[1] ? Number(match[1]) : 0
  const end = match[2] ? Number(match[2]) : size - 1
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end >= size || start > end) {
    res.statusCode = 416
    res.setHeader('Content-Range', `bytes */${size}`)
    res.end()
    return
  }
  pipe(start, end, 206)
}

function videosMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const file = videoPath(req.url ?? '')
    if (!file) {
      next()
      return
    }
    serveVideo(req, res, file)
  }
}

function pagesPlugin(filing: Filing): Plugin {
  const description = escapeHtml(siteDescription(exercises))
  const featured = exercises[0]
  if (!featured) throw new Error('至少需要一个动作')

  return {
    name: 'xinglian-pages',
    transformIndexHtml(html) {
      if (!html.includes('__SITE_DESCRIPTION__') && !html.includes('<!-- EXERCISE_CARDS -->')) {
        return html
      }
      return html
        .replaceAll('__SITE_DESCRIPTION__', description)
        .replaceAll('<!-- LAYOUT_HEADER -->', headerHtml())
        .replaceAll('<!-- LAYOUT_FOOTER -->', footerHtml(filing))
        .replaceAll('<!-- FEATURED_CTA -->', renderFeaturedCta(featured))
        .replaceAll('<!-- FEATURED_PANEL -->', renderFeaturedPanel(featured))
        .replaceAll('<!-- EXERCISE_TOTAL -->', String(exercises.length))
        .replaceAll('<!-- EXERCISE_COUNT -->', renderExerciseCount(exercises))
        .replaceAll('<!-- EXERCISE_CARDS -->', renderExerciseCards(exercises))
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? ''
        const queryIndex = raw.indexOf('?')
        const path = queryIndex === -1 ? raw : raw.slice(0, queryIndex)
        const query = queryIndex === -1 ? '' : raw.slice(queryIndex)
        const match = path.match(/^\/exercise\/([a-z0-9-]+)\/?$/)
        if (match && exercises.some((exercise) => exercise.id === match[1])) {
          req.url = `/exercise/${match[1]}/index.html${query}`
        }
        next()
      })
      server.middlewares.use(videosMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(videosMiddleware())
    },
  }
}

export default defineConfig(async () => {
  const filing = await loadFiling()
  const exerciseInputs = writeExercisePages(filing)
  return {
    appType: 'mpa',
    plugins: [pagesPlugin(filing)],
    build: {
      rolldownOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          ...exerciseInputs,
        },
      },
    },
  }
})
