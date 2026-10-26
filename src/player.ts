const playIcon =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M9 7.2v9.6L17.8 12 9 7.2z"/></svg>'
const pauseIcon =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7.2 6h3.2v12H7.2zm6.4 0h3.2v12h-3.2z"/></svg>'

function mount(root: HTMLElement): void {
  const video = root.querySelector<HTMLVideoElement>('[data-video]')
  const stage = root.querySelector<HTMLElement>('[data-stage]')
  const playBtn = root.querySelector<HTMLButtonElement>('[data-play]')
  const bar = root.querySelector<HTMLElement>('[data-progress-bar]')
  const progress = root.querySelector<HTMLElement>('[data-progress]')
  const status = root.querySelector<HTMLElement>('[data-status]')
  if (!video || !stage || !playBtn || !bar || !progress || !status) return

  video.controls = false
  video.muted = true
  video.loop = true
  video.playsInline = true

  const rates = [...root.querySelectorAll<HTMLButtonElement>('[data-rate]')]

  function syncRate(rate: number): void {
    video!.playbackRate = rate
    for (const button of rates) {
      const active = Number(button.dataset.rate) === rate
      button.setAttribute('aria-pressed', active ? 'true' : 'false')
    }
  }

  function syncPlay(): void {
    const playing = !video!.paused && !video!.ended
    playBtn!.setAttribute('aria-label', playing ? '暂停' : '播放')
    playBtn!.innerHTML = `${playing ? pauseIcon : playIcon}<span>${playing ? '暂停' : '播放'}</span>`
  }

  function showReady(): void {
    video!.classList.add('is-ready')
    status!.hidden = true
  }

  function showError(): void {
    const code = video!.error?.code ?? 0
    const message = video!.error?.message ?? ''
    video!.classList.remove('is-ready')
    status!.hidden = false
    status!.textContent = `示范视频暂时无法加载（错误 ${code}）`
    console.warn(code, message)
  }

  let frame = 0
  function paint(): void {
    const duration = video!.duration
    const ratio = duration && Number.isFinite(duration) ? video!.currentTime / duration : 0
    const clamped = Math.max(0, Math.min(1, ratio))
    bar!.style.transform = `scaleX(${clamped})`
    progress!.setAttribute('aria-valuenow', String(Math.round(clamped * 100)))
  }

  function tick(): void {
    paint()
    if (!video!.paused && !video!.ended) {
      frame = requestAnimationFrame(tick)
    }
  }

  function start(): void {
    const pending = video!.play()
    if (pending !== undefined) {
      pending.catch(() => {
        syncPlay()
      })
    }
  }

  playBtn.addEventListener('click', () => {
    if (video.paused || video.ended) start()
    else video.pause()
  })

  stage.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('button')) return
    if (video.paused || video.ended) start()
    else video.pause()
  })

  for (const button of rates) {
    button.addEventListener('click', () => {
      const rate = Number(button.dataset.rate)
      if (!Number.isFinite(rate)) return
      syncRate(rate)
    })
  }

  video.addEventListener('play', () => {
    syncPlay()
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(tick)
  })
  video.addEventListener('pause', syncPlay)
  video.addEventListener('ended', () => {
    syncPlay()
    paint()
  })
  video.addEventListener('loadeddata', showReady)
  video.addEventListener('error', showError)

  // Keep the URL literal (/videos/*.mp4?v=) so Vite does not copy the file into dist.
  const source = video.dataset.src
  if (source) video.setAttribute('src', source)

  if (video.error) showError()
  else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) showReady()

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    video.autoplay = false
    video.pause()
  } else if (video.paused) {
    start()
  }
  if (!video.paused) {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(tick)
  }
  syncPlay()
  paint()
}

const player = document.querySelector<HTMLElement>('[data-player]')
if (player) mount(player)
