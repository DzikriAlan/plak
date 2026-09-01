'use client'

import { useEffect, useRef } from 'react'
import type { MazeRunnerCell, MazeRunnerDirection, MazeRunnerPoint } from '../types/mazeRunnerTypes'
import MazeRunnerIcon from './MazeRunnerIcon'

interface Props {
  cells: MazeRunnerCell[]
  rowTotal: number
  colTotal: number
  player: MazeRunnerPoint
  goal: MazeRunnerPoint
  hintPath: MazeRunnerPoint[]
  onEditMazeRunnerMove: (direction: MazeRunnerDirection) => void
  onEditMazeRunnerRun: (direction: MazeRunnerDirection) => void
}

const CELL = 24
const PADDING = 8
const WALL = '#43434d'
const STEP_RATIO = 0.55
const WHEEL_STEP = 44
const FLICK_DISTANCE = 16
const MAX_STEP_PER_EVENT = 3

export default function MazeRunnerBoard({
  cells,
  rowTotal,
  colTotal,
  player,
  goal,
  hintPath,
  onEditMazeRunnerMove,
  onEditMazeRunnerRun,
}: Props) {
  const boardRef = useRef<SVGSVGElement | null>(null)
  const gestureRef = useRef({ isDown: false, x: 0, y: 0, isMoved: false })
  const wheelRef = useRef({ x: 0, y: 0 })
  const previousRef = useRef(player)

  const boardWidth = colTotal * CELL + PADDING * 2
  const boardHeight = rowTotal * CELL + PADDING * 2
  // Durasi animasi mengikuti jarak langkah supaya lari beberapa petak tetap terlihat mengalir.
  const stepDistance = Math.abs(player.row - previousRef.current.row) + Math.abs(player.col - previousRef.current.col)
  const stepDuration = Math.min(320, Math.max(90, stepDistance * 80))
  previousRef.current = player

  const getStepSize = () => {
    const board = boardRef.current
    if (!board) return { x: 32, y: 32 }
    const rect = board.getBoundingClientRect()
    if (!rect.width || !rect.height) return { x: 32, y: 32 }
    return {
      x: Math.max(14, (rect.width / boardWidth) * CELL * STEP_RATIO),
      y: Math.max(14, (rect.height / boardHeight) * CELL * STEP_RATIO),
    }
  }

  const getFlickDirection = (shiftX: number, shiftY: number) => {
    if (Math.abs(shiftX) < FLICK_DISTANCE && Math.abs(shiftY) < FLICK_DISTANCE) return null
    if (Math.abs(shiftX) > Math.abs(shiftY)) return (shiftX > 0 ? 'right' : 'left') as MazeRunnerDirection
    return (shiftY > 0 ? 'down' : 'up') as MazeRunnerDirection
  }

  const editMazeRunnerPointerStart = (event: React.PointerEvent<SVGSVGElement>) => {
    gestureRef.current = { isDown: true, x: event.clientX, y: event.clientY, isMoved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  // Seretan jari maupun trackpad digeser per jarak satu petak, jadi gerakannya mengalir mengikuti arah tangan.
  const editMazeRunnerPointerTrack = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!gestureRef.current.isDown) return
    const step = getStepSize()
    for (let count = 0; count < MAX_STEP_PER_EVENT; count += 1) {
      const gesture = gestureRef.current
      const shiftX = event.clientX - gesture.x
      const shiftY = event.clientY - gesture.y
      const isHorizontal = Math.abs(shiftX) > Math.abs(shiftY)
      if (isHorizontal && Math.abs(shiftX) >= step.x) {
        gestureRef.current = { ...gesture, x: gesture.x + Math.sign(shiftX) * step.x, y: event.clientY, isMoved: true }
        onEditMazeRunnerMove(shiftX > 0 ? 'right' : 'left')
        continue
      }
      if (!isHorizontal && Math.abs(shiftY) >= step.y) {
        gestureRef.current = { ...gesture, x: event.clientX, y: gesture.y + Math.sign(shiftY) * step.y, isMoved: true }
        onEditMazeRunnerMove(shiftY > 0 ? 'down' : 'up')
        continue
      }
      return
    }
  }

  const clearMazeRunnerPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const gesture = gestureRef.current
    gestureRef.current = { ...gesture, isDown: false }
    if (!gesture.isDown || gesture.isMoved) return
    // Sentilan cepat tanpa seretan membuat pemain berlari lurus sampai persimpangan.
    const direction = getFlickDirection(event.clientX - gesture.x, event.clientY - gesture.y)
    if (direction) onEditMazeRunnerRun(direction)
  }

  // Usapan dua jari di trackpad terbaca sebagai wheel, jadi diakumulasi sampai cukup untuk satu petak.
  // Arahnya sengaja berlawanan dengan usapan: scroll ke atas menjalankan pemain ke bawah.
  const editMazeRunnerWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    const wheel = wheelRef.current
    wheel.x += event.deltaX
    wheel.y += event.deltaY
    if (Math.abs(wheel.x) > Math.abs(wheel.y)) {
      if (Math.abs(wheel.x) < WHEEL_STEP) return
      onEditMazeRunnerMove(wheel.x > 0 ? 'right' : 'left')
    } else {
      if (Math.abs(wheel.y) < WHEEL_STEP) return
      onEditMazeRunnerMove(wheel.y > 0 ? 'down' : 'up')
    }
    wheelRef.current = { x: 0, y: 0 }
  }

  // Sentuhan di papan ditahan di level DOM dengan listener non passive supaya usapan tidak
  // memicu gestur bawaan peramban seperti geser mundur halaman atau tarik untuk muat ulang.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const editTouchGesture = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault()
    }
    board.addEventListener('touchstart', editTouchGesture, { passive: false })
    board.addEventListener('touchmove', editTouchGesture, { passive: false })
    return () => {
      board.removeEventListener('touchstart', editTouchGesture)
      board.removeEventListener('touchmove', editTouchGesture)
    }
  }, [])

  const getWallLines = () => {
    const lines: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> = []
    cells.forEach((cell) => {
      const x = cell.col * CELL
      const y = cell.row * CELL
      if (!cell.isTopOpen) lines.push({ id: `t${cell.id}`, x1: x, y1: y, x2: x + CELL, y2: y })
      if (!cell.isLeftOpen) lines.push({ id: `l${cell.id}`, x1: x, y1: y, x2: x, y2: y + CELL })
      if (cell.col === colTotal - 1 && !cell.isRightOpen) {
        lines.push({ id: `r${cell.id}`, x1: x + CELL, y1: y, x2: x + CELL, y2: y + CELL })
      }
      if (cell.row === rowTotal - 1 && !cell.isBottomOpen) {
        lines.push({ id: `b${cell.id}`, x1: x, y1: y + CELL, x2: x + CELL, y2: y + CELL })
      }
    })
    return lines
  }

  const walls = getWallLines()
  const hintPoints = hintPath.map((point) => `${point.col * CELL + CELL / 2},${point.row * CELL + CELL / 2}`).join(' ')

  return (
    <div className="h-full w-full touch-none overscroll-none rounded-2xl border border-[#26262b] bg-[#121214] p-1.5 sm:p-2">
      <svg
        ref={boardRef}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        preserveAspectRatio="none"
        className="h-full w-full touch-none select-none"
        onPointerDown={editMazeRunnerPointerStart}
        onPointerMove={editMazeRunnerPointerTrack}
        onPointerUp={clearMazeRunnerPointer}
        onPointerCancel={clearMazeRunnerPointer}
        onWheel={editMazeRunnerWheel}
      >
        <g transform={`translate(${PADDING} ${PADDING})`}>
          {hintPath.length > 1 ? (
            <polyline
              points={hintPoints}
              fill="none"
              stroke="#f0b429"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.35"
            />
          ) : null}

          <g transform={`translate(${goal.col * CELL - CELL * 0.06} ${goal.row * CELL - CELL * 0.06}) scale(1.12)`}>
            <MazeRunnerIcon kind="cave" />
          </g>

          <g
            style={{
              transform: `translate(${player.col * CELL}px, ${player.row * CELL}px)`,
              transition: `transform ${stepDuration}ms ease-out`,
            }}
          >
            <MazeRunnerIcon kind="player" />
          </g>

          <g stroke={WALL} strokeWidth="2.4" strokeLinecap="round">
            {walls.map((line) => (
              <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
