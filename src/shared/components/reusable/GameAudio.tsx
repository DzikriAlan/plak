'use client'

import { useEffect, useRef, useState } from 'react'

export type GameAudioKind = 'move' | 'capture' | 'match' | 'win' | 'lose' | 'invalid'

export type GameAudioCue = {
  id: number
  kind: GameAudioKind
}

interface Props {
  isActive: boolean
  isMusicOn: boolean
  isSoundOn: boolean
  bassScale: number[]
  leadScale: number[]
  stepDuration?: number
  musicLevel?: number
  cue: GameAudioCue | null
}

export default function GameAudio({
  isActive,
  isMusicOn,
  isSoundOn,
  bassScale,
  leadScale,
  stepDuration = 0.3,
  musicLevel = 0.1,
  cue,
}: Props) {
  const audioRef = useRef<{
    context: AudioContext
    musicGain: GainNode
    soundGain: GainNode
    noiseBuffer: AudioBuffer
    schedulerId: number
    nextNoteTime: number
    step: number
  } | null>(null)
  const playedRef = useRef(0)
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

      audioRef.current = { context, musicGain, soundGain, noiseBuffer, schedulerId: 0, nextNoteTime: 0, step: 0 }
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
      const bass = setup.context.createOscillator()
      const bassGain = setup.context.createGain()
      bass.type = 'triangle'
      bass.frequency.setValueAtTime(bassScale[Math.floor(step / 4) % bassScale.length], time)
      bassGain.gain.setValueAtTime(0.0001, time)
      bassGain.gain.exponentialRampToValueAtTime(0.42, time + 0.03)
      bassGain.gain.exponentialRampToValueAtTime(0.0001, time + stepDuration * 0.9)
      bass.connect(bassGain)
      bassGain.connect(setup.musicGain)
      bass.start(time)
      bass.stop(time + stepDuration)

      if (step % 2 !== 0) return
      const lead = setup.context.createOscillator()
      const leadGain = setup.context.createGain()
      const leadFilter = setup.context.createBiquadFilter()
      leadFilter.type = 'lowpass'
      leadFilter.frequency.value = 1800
      lead.type = 'sine'
      lead.frequency.setValueAtTime(leadScale[(step / 2) % leadScale.length], time)
      leadGain.gain.setValueAtTime(0.0001, time)
      leadGain.gain.exponentialRampToValueAtTime(0.13, time + 0.04)
      leadGain.gain.exponentialRampToValueAtTime(0.0001, time + stepDuration * 0.8)
      lead.connect(leadFilter)
      leadFilter.connect(leadGain)
      leadGain.connect(setup.musicGain)
      lead.start(time)
      lead.stop(time + stepDuration)
    }

    const postScheduler = () => {
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

    setup.musicGain.gain.linearRampToValueAtTime(musicLevel, setup.context.currentTime + 0.6)
    setup.schedulerId = window.setInterval(postScheduler, 80)
    postScheduler()

    return () => {
      window.clearInterval(setup.schedulerId)
    }
  }, [isMusicOn, isActive, isAudioReady, bassScale, leadScale, stepDuration, musicLevel])

  useEffect(() => {
    const setup = audioRef.current
    if (!setup || !cue || cue.id === playedRef.current) return
    playedRef.current = cue.id
    if (!isSoundOn || !isActive) return

    const postTone = (frequency: number, time: number, level: number, life: number, type: OscillatorType) => {
      const tone = setup.context.createOscillator()
      const toneGain = setup.context.createGain()
      tone.type = type
      tone.frequency.setValueAtTime(frequency, time)
      toneGain.gain.setValueAtTime(0.0001, time)
      toneGain.gain.exponentialRampToValueAtTime(level, time + 0.012)
      toneGain.gain.exponentialRampToValueAtTime(0.0001, time + life)
      tone.connect(toneGain)
      toneGain.connect(setup.soundGain)
      tone.start(time)
      tone.stop(time + life + 0.02)
    }

    const postThump = (time: number, level: number, cutoff: number) => {
      const source = setup.context.createBufferSource()
      const filter = setup.context.createBiquadFilter()
      const gain = setup.context.createGain()
      source.buffer = setup.noiseBuffer
      filter.type = 'lowpass'
      filter.frequency.value = cutoff
      gain.gain.setValueAtTime(level, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07)
      source.connect(filter)
      filter.connect(gain)
      gain.connect(setup.soundGain)
      source.start(time)
      source.stop(time + 0.09)
    }

    const now = setup.context.currentTime
    if (cue.kind === 'move') {
      postTone(320, now, 0.16, 0.07, 'sine')
      postThump(now, 0.14, 900)
      return
    }
    if (cue.kind === 'capture') {
      postTone(180, now, 0.26, 0.12, 'triangle')
      postThump(now, 0.3, 1600)
      return
    }
    if (cue.kind === 'match') {
      postTone(784, now, 0.16, 0.09, 'sine')
      postTone(1046.5, now + 0.06, 0.14, 0.12, 'sine')
      return
    }
    if (cue.kind === 'invalid') {
      postTone(150, now, 0.2, 0.16, 'sawtooth')
      return
    }
    if (cue.kind === 'lose') {
      ;[392, 329.63, 261.63].forEach((frequency, index) => postTone(frequency, now + index * 0.14, 0.2, 0.3, 'triangle'))
      return
    }
    ;[523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) =>
      postTone(frequency, now + index * 0.11, 0.22, 0.3, 'square'),
    )
  }, [cue, isSoundOn, isActive, isAudioReady])

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
