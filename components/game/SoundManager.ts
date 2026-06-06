let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export async function playTick(muted: boolean) {
  if (muted || typeof window === 'undefined') return
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') await ac.resume()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.frequency.value = 800 + Math.random() * 400
    gain.gain.setValueAtTime(0.15, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08)
    osc.start()
    osc.stop(ac.currentTime + 0.08)
  } catch {
    // Audio context unavailable — ignore
  }
}

export async function playWin(muted: boolean) {
  if (muted || typeof window === 'undefined') return
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') await ac.resume()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.frequency.value = freq
      const t = ac.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch {
    // Audio context unavailable — ignore
  }
}
