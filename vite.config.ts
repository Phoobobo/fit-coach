import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join, normalize, resolve, sep } from 'node:path'
import { defineConfig, type Connect, type Plugin } from 'vite'
import { exercises } from './src/data/exercises.ts'
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

function writeExercisePages(): Record<string, string> {
  const root = resolve(import.meta.dirname, 'exercise')
  rmSync(root, { recursive: true, force: true })
  const input: Record<string, string> = {}
  for (const exercise of exercises) {
    const dir = join(root, exercise.id)
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'index.html')
    writeFileSync(file, renderExerciseDocument(exercise))
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

function pagesPlugin(): Plugin {
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
        .replaceAll('<!-- LAYOUT_FOOTER -->', footerHtml())
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

const exerciseInputs = writeExercisePages()

export default defineConfig({
  appType: 'mpa',
  plugins: [pagesPlugin()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ...exerciseInputs,
      },
    },
  },
})
