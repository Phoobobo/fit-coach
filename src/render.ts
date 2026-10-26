import type { Exercise } from './data/exercises.ts'
import type { Filing } from './filing.ts'

export const SITE_ORIGIN = 'https://fit.phoobobo.top'

const THUMBS = [
  'linear-gradient(160deg, #f3e0dc 0%, #e4b7b2 55%, #d2a29d 100%)',
  'linear-gradient(200deg, #f0d9dc 0%, #ddb0b4 50%, #c99096 100%)',
  'linear-gradient(145deg, #efe0da 0%, #e0b8b2 48%, #c9a099 100%)',
]

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function videoUrl(exercise: Exercise): string {
  return `${exercise.video}?v=${exercise.videoVersion}`
}

export function siteDescription(list: readonly Exercise[]): string {
  const names = list.map((exercise) => exercise.name).join('、')
  return `型练是面向中文用户的动作示范站。观看${names}的循环示范，对照要点与常见错误把动作练标准。`
}

export function headerHtml(): string {
  return `<header class="site-header">
    <a class="skip" href="#main">跳到主要内容</a>
    <div class="wrap header-inner">
      <a class="brand" href="/" aria-label="型练，返回首页">
        <img class="brand-mark" src="/favicon.svg" alt="" width="32" height="32" />
        <span>型练</span>
      </a>
      <nav class="nav" aria-label="页面">
        <a href="/#library">动作库</a>
      </nav>
    </div>
  </header>`
}

export function footerHtml(filing: Filing): string {
  return `<footer class="site-footer">
    <div class="wrap footer-inner">
      <p class="footer-brand">型练 · 动作示范</p>
      <div class="filings">
        <a class="beian" href="${escapeHtml(filing.icp.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(filing.icp.text)}</a>
        <a class="beian beian-police" href="${escapeHtml(filing.police.url)}" target="_blank" rel="noopener noreferrer"><img src="/police-filing.png" alt="" width="18" height="20" />${escapeHtml(filing.police.text)}</a>
      </div>
    </div>
  </footer>`
}

function playIcon(): string {
  return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M9 7.2v9.6L17.8 12 9 7.2z"/></svg>`
}

export function renderFeaturedCta(exercise: Exercise): string {
  const href = `/exercise/${exercise.id}/`
  return `<a class="btn btn-primary" href="${href}">观看${escapeHtml(exercise.name)}</a>`
}

export function renderFeaturedPanel(exercise: Exercise): string {
  const href = `/exercise/${exercise.id}/`
  return `<a class="feature" href="${href}" aria-label="观看${escapeHtml(exercise.name)}示范">
    <div class="feature-top">
      <span class="pill">正在示范</span>
      <span class="pill">${escapeHtml(exercise.difficulty)}</span>
    </div>
    <div class="feature-copy">
      <p class="feature-kicker">${escapeHtml(exercise.muscles)}</p>
      <p class="feature-title">${escapeHtml(exercise.name)}</p>
      <span class="feature-go">观看示范</span>
    </div>
  </a>`
}

export function renderExerciseCount(list: readonly Exercise[]): string {
  return `共 ${list.length} 个动作`
}

export function renderExerciseCards(list: readonly Exercise[]): string {
  return list
    .map((exercise, index) => {
      const href = `/exercise/${exercise.id}/`
      const number = String(index + 1).padStart(2, '0')
      const background = THUMBS[index % THUMBS.length]
      return `<a class="card" href="${href}" aria-label="观看${escapeHtml(exercise.name)}示范">
        <div class="thumb" style="background: ${background}">
          <span class="badge">${escapeHtml(exercise.difficulty)}</span>
          <span class="card-no">${number}</span>
          <span class="play-fab">${playIcon()}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(exercise.name)}</h3>
          <p class="card-muscles">${escapeHtml(exercise.muscles)}</p>
          <p class="card-rx">${escapeHtml(exercise.prescription)}</p>
        </div>
      </a>`
    })
    .join('\n')
}

function pointsHtml(items: readonly string[]): string {
  return items
    .map((item, index) => `<li><span>${index + 1}</span><p>${escapeHtml(item)}</p></li>`)
    .join('\n')
}

function clip(value: string, max = 140): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

export function renderExerciseDocument(exercise: Exercise, filing: Filing): string {
  const title = `${exercise.name} — 动作示范 · 型练`
  const description = clip(
    `${exercise.name}动作示范，主要练${exercise.muscles}。难度${exercise.difficulty}，${exercise.prescription}。`,
  )
  const canonical = `${SITE_ORIGIN}/exercise/${exercise.id}/`
  const src = videoUrl(exercise)
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#141113" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE_ORIGIN}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="型练：把动作看清楚" />
    <meta property="og:locale" content="zh_CN" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    ${headerHtml()}
    <main id="main">
      <a class="back" href="/#library">← 返回动作库</a>
      <article class="exercise">
        <header class="exercise-head">
          <p class="eyebrow">动作示范</p>
          <h1>${escapeHtml(exercise.name)}</h1>
          <ul class="chips">
            <li>${escapeHtml(exercise.difficulty)}</li>
            <li>${escapeHtml(exercise.muscles)}</li>
          </ul>
          <p class="lede">${escapeHtml(exercise.name)}主要练${escapeHtml(exercise.muscles)}。跟着循环示范，按要点慢慢做。</p>
        </header>
        <div class="player" data-player>
          <div class="stage" data-stage>
            <p class="stage-status" data-status>视频加载中</p>
            <video
              class="stage-video"
              data-video
              data-src="${escapeHtml(src)}"
              autoplay
              muted
              loop
              playsinline
              webkit-playsinline
              preload="auto"
            ></video>
          </div>
          <div class="controls">
            <button type="button" class="ctrl ctrl-play" data-play aria-label="播放">
              ${playIcon()}<span>播放</span>
            </button>
            <div class="progress" data-progress role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="播放进度">
              <span data-progress-bar></span>
            </div>
            <div class="rates" role="group" aria-label="播放速度">
              <button type="button" class="ctrl" data-rate="0.5" aria-pressed="false">0.5x</button>
              <button type="button" class="ctrl" data-rate="1" aria-pressed="true">1x</button>
            </div>
          </div>
          <p class="player-hint">默认静音循环播放。可以暂停，或改成 0.5 倍速看清发力。</p>
        </div>
        <section class="rx" aria-label="建议组数和次数">
          <span>建议组数 / 次数</span>
          <strong>${escapeHtml(exercise.prescription)}</strong>
        </section>
        <div class="guide">
          <section class="panel">
            <h2>动作要点</h2>
            <ol class="points">
              ${pointsHtml(exercise.cues)}
            </ol>
          </section>
          <section class="panel">
            <h2>常见错误</h2>
            <ol class="points points-warn">
              ${pointsHtml(exercise.mistakes)}
            </ol>
          </section>
        </div>
      </article>
    </main>
    ${footerHtml(filing)}
    <script type="module" src="/src/player.ts"></script>
  </body>
</html>
`
}
