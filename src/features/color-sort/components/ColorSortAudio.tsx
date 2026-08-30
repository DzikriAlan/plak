'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  isActive: boolean
  isMusicOn: boolean
  isSoundOn: boolean
  pourKey: number
  sealedTotal: number
  isCleared: boolean
}

export default function ColorSortAudio({ isActive, isMusicOn, isSoundOn, pourKey, sealedTotal, isCleared }: Props) {
  const audioRef = useRef<{
    context: AudioContext
    musicGain: GainNode
    soundGain: GainNode
    noiseBuffer: AudioBuffer
    schedulerId: number
    nextNoteTime: number
    step: number
  } | null>(null)
  const trackRef = useRef({ pourKey: 0, sealedTotal: 0, isCleared: false })
  const [isAudioReady, setIsAudioReady] = useState(false)

  useEffect(() => {
    const getAudioSetup = () => {
      if (audioRef.current) return audioRef.current
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return null

      const context = new AudioContextClass()
      const musicGain = context.createGain()
      musicGain.gain.value = 0
      musicGain.connect(context.destination)
      const soundGain = context.createGain()
      soundGain.gain.value = 0.9
      soundGain.connect(context.destination)

      const noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      for (let index = 0; index < noiseData.length; index += 1) {
        noiseData[index] = Math.random() * 2 - 1
      }

      audioRef.current = {
        context,
        musicGain,
        soundGain,
        noiseBuffer,
        schedulerId: 0,
        nextNoteTime: 0,
        step: 0,
      }
      return audioRef.current
    }

    const postUnlockAudio = () => {
      const setup = getAudioSetup()
      if (!setup) return
      if (setup.context.state === 'suspended') setup.context.resume()
      setIsAudioReady(true)
      window.removeEventListener('pointerdown', postUnlockAudio)
    }

    window.addEventListener('pointerdown', postUnlockAudio)
    return () => {
      window.removeEventListener('pointerdown', postUnlockAudio)
      const setup = audioRef.current
      if (!setup) return
      window.clearInterval(setup.schedulerId)
      setup.context.close()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const setup = audioRef.current
    if (!setup) return

    const postMusicNote = (step: number, time: number) => {
      const bassScale = [55, 55, 73.42, 65.41]
      const leadScale = [220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63]

      const bass = setup.context.createOscillator()
      const bassGain = setup.context.createGain()
      bass.type = 'triangle'
      bass.frequency.setValueAtTime(bassScale[Math.floor(step / 4) % bassScale.length], time)
      bassGain.gain.setValueAtTime(0.0001, time)
      bassGain.gain.exponentialRampToValueAtTime(0.5, time + 0.02)
      bassGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24)
      bass.connect(bassGain)
      bassGain.connect(setup.musicGain)
      bass.start(time)
      bass.stop(time + 0.28)

      if (step % 2 !== 0) return
      const lead = setup.context.createOscillator()
      const leadGain = setup.context.createGain()
      const leadFilter = setup.context.createBiquadFilter()
      leadFilter.type = 'lowpass'
      leadFilter.frequency.value = 2200
      lead.type = 'square'
      lead.frequency.setValueAtTime(leadScale[(step / 2) % leadScale.length], time)
      leadGain.gain.setValueAtTime(0.0001, time)
      leadGain.gain.exponentialRampToValueAtTime(0.16, time + 0.02)
      leadGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2)
      lead.connect(leadFilter)
      leadFilter.connect(leadGain)
      leadGain.connect(setup.musicGain)
      lead.start(time)
      lead.stop(time + 0.24)
    }

    const postScheduler = () => {
      const stepDuration = 0.26
      setup.nextNoteTime = Math.max(setup.nextNoteTime, setup.context.currentTime)
      while (setup.nextNoteTime < setup.context.currentTime + 0.4) {
        postMusicNote(setup.step, setup.nextNoteTime)
        setup.nextNoteTime += stepDuration
        setup.step = (setup.step + 1) % 16
      }
    }

    window.clearInterval(setup.schedulerId)
    if (!isMusicOn || !isActive) {
      setup.musicGain.gain.linearRampToValueAtTime(0, setup.context.currentTime + 0.3)
      return
    }

    setup.musicGain.gain.linearRampToValueAtTime(0.14, setup.context.currentTime + 0.6)
    setup.schedulerId = window.setInterval(postScheduler, 80)
    postScheduler()

    return () => {
      window.clearInterval(setup.schedulerId)
    }
  }, [isMusicOn, isActive, isAudioReady])

  useEffect(() => {
    const setup = audioRef.current
    const track = trackRef.current
    if (!setup || !isSoundOn || !isActive) {
      track.pourKey = pourKey
      track.sealedTotal = sealedTotal
      track.isCleared = isCleared
      return
    }

    const postPourSound = () => {
      const start = setup.context.currentTime + 0.26
      const duration = 0.52
      const bubbleTotal = 48

      const getBubble = (time: number, ratio: number, level: number) => {
        const base = 340 + Math.random() * 700 + ratio * 900
        const life = 0.032 + Math.random() * 0.05
        const bubble = setup.context.createOscillator()
        const bubbleGain = setup.context.createGain()
        bubble.type = 'sine'
        bubble.frequency.setValueAtTime(base, time)
        bubble.frequency.exponentialRampToValueAtTime(base * (1.4 + Math.random() * 0.6), time + life)
        bubbleGain.gain.setValueAtTime(0.0001, time)
        bubbleGain.gain.exponentialRampToValueAtTime(level, time + 0.005)
        bubbleGain.gain.exponentialRampToValueAtTime(0.0001, time + life)
        bubble.connect(bubbleGain)
        bubbleGain.connect(setup.soundGain)
        bubble.start(time)
        bubble.stop(time + life + 0.02)
      }

      for (let index = 0; index < bubbleTotal; index += 1) {
        const ratio = index / bubbleTotal
        const time = start + ratio * duration + Math.random() * 0.022
        const swell = 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, ratio * 1.15))
        getBubble(time, ratio, (0.03 + Math.random() * 0.045) * swell)
      }
    }

    const postCorkSound = () => {
      const now = setup.context.currentTime
      const pop = setup.context.createOscillator()
      const popGain = setup.context.createGain()
      pop.type = 'sine'
      pop.frequency.setValueAtTime(520, now)
      pop.frequency.exponentialRampToValueAtTime(110, now + 0.09)
      popGain.gain.setValueAtTime(0.0001, now)
      popGain.gain.exponentialRampToValueAtTime(0.5, now + 0.012)
      popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13)
      pop.connect(popGain)
      popGain.connect(setup.soundGain)
      pop.start(now)
      pop.stop(now + 0.15)

      const click = setup.context.createBufferSource()
      const clickFilter = setup.context.createBiquadFilter()
      const clickGain = setup.context.createGain()
      click.buffer = setup.noiseBuffer
      clickFilter.type = 'highpass'
      clickFilter.frequency.value = 1800
      clickGain.gain.setValueAtTime(0.22, now)
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
      click.connect(clickFilter)
      clickFilter.connect(clickGain)
      clickGain.connect(setup.soundGain)
      click.start(now)
      click.stop(now + 0.06)
    }

    const postWinSound = () => {
      const now = setup.context.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((frequency, index) => {
        const time = now + index * 0.11
        const tone = setup.context.createOscillator()
        const toneGain = setup.context.createGain()
        tone.type = 'square'
        tone.frequency.setValueAtTime(frequency, time)
        toneGain.gain.setValueAtTime(0.0001, time)
        toneGain.gain.exponentialRampToValueAtTime(0.24, time + 0.02)
        toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3)
        tone.connect(toneGain)
        toneGain.connect(setup.soundGain)
        tone.start(time)
        tone.stop(time + 0.32)
      })
    }

    if (pourKey && pourKey !== track.pourKey) postPourSound()
    if (sealedTotal > track.sealedTotal) postCorkSound()
    if (isCleared && !track.isCleared) postWinSound()

    track.pourKey = pourKey
    track.sealedTotal = sealedTotal
    track.isCleared = isCleared
  }, [pourKey, sealedTotal, isCleared, isSoundOn, isActive, isAudioReady])

  useEffect(() => {
    const setup = audioRef.current
    if (!setup) return
    if (!isActive) {
      window.clearInterval(setup.schedulerId)
      setup.nextNoteTime = 0
      if (setup.context.state === 'running') setup.context.suspend()
      return
    }
    if (setup.context.state === 'suspended') setup.context.resume()
  }, [isActive, isAudioReady])

  return null
}
