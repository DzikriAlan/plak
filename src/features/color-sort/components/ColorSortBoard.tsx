'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ColorSortBottle, ColorSortPour } from '../types/colorSortTypes'

interface Props {
  bottles: ColorSortBottle[]
  capacity: number
  selectedBottle: number | null
  activePour: ColorSortPour | null
  onEditColorSortBottle: (bottleId: number) => void
  onEditColorSortPourDone: () => void
}

const PALETTE = [
  '#f5b81a',
  '#2f5ce0',
  '#f4571f',
  '#8b3fc7',
  '#8cc63f',
  '#ec3f8e',
  '#c62828',
  '#17a2a2',
  '#9b8ef0',
  '#2f8f46',
  '#8b5a2b',
  '#e8e6e0',
]

const STROKE = '#f1ede4'
const GLASS = '#2b2b33'
const GLASS_EDGE = '#3d3d47'
const MYSTERY = '#111114'
const CORK = '#c9a06a'
const CORK_TOP = '#e0bd8e'
const CORK_GRAIN = '#a2794a'
const SHELF = '#1b1b20'
const SHELF_EDGE = '#33333c'

const BOTTLE_HALF_WIDTH = 0.46
const BOTTLE_HEIGHT = 2.5
const NECK_HALF_WIDTH = 0.24
const OUTLINE = 0.06
const POUR_DURATION = 900

export default function ColorSortBoard({
  bottles,
  capacity,
  selectedBottle,
  activePour,
  onEditColorSortBottle,
  onEditColorSortPourDone,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<{
    bottles: ColorSortBottle[]
    capacity: number
    selectedBottle: number | null
    activePour: ColorSortPour | null
    onEditColorSortBottle: (bottleId: number) => void
    onEditColorSortPourDone: () => void
    isPourResolved: boolean
  }>({
    bottles,
    capacity,
    selectedBottle,
    activePour,
    onEditColorSortBottle,
    onEditColorSortPourDone,
    isPourResolved: false,
  })

  useEffect(() => {
    const previousPour = frameRef.current.activePour
    frameRef.current = {
      bottles,
      capacity,
      selectedBottle,
      activePour,
      onEditColorSortBottle,
      onEditColorSortPourDone,
      isPourResolved: previousPour === activePour ? frameRef.current.isPourResolved : false,
    }
  }, [bottles, capacity, selectedBottle, activePour, onEditColorSortBottle, onEditColorSortPourDone])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const getBottleShape = (inset: number) => {
      const halfWidth = BOTTLE_HALF_WIDTH - inset
      const neckHalf = NECK_HALF_WIDTH - inset * 0.7
      const height = BOTTLE_HEIGHT - inset
      const bottom = inset
      const radius = 0.14
      const shoulder = height - 0.5
      const neckTop = height

      const shape = new THREE.Shape()
      shape.moveTo(-halfWidth + radius, bottom)
      shape.lineTo(halfWidth - radius, bottom)
      shape.quadraticCurveTo(halfWidth, bottom, halfWidth, bottom + radius)
      shape.lineTo(halfWidth, shoulder)
      shape.quadraticCurveTo(halfWidth, shoulder + 0.3, neckHalf, shoulder + 0.36)
      shape.lineTo(neckHalf, neckTop - 0.1)
      shape.lineTo(neckHalf + 0.03, neckTop - 0.08)
      shape.lineTo(neckHalf + 0.03, neckTop)
      shape.lineTo(-neckHalf - 0.03, neckTop)
      shape.lineTo(-neckHalf - 0.03, neckTop - 0.08)
      shape.lineTo(-neckHalf, neckTop - 0.1)
      shape.lineTo(-neckHalf, shoulder + 0.36)
      shape.quadraticCurveTo(-halfWidth, shoulder + 0.3, -halfWidth, shoulder)
      shape.lineTo(-halfWidth, bottom + radius)
      shape.quadraticCurveTo(-halfWidth, bottom, -halfWidth + radius, bottom)
      return shape
    }

    const getCorkShape = (inset: number) => {
      const flangeHalf = NECK_HALF_WIDTH + 0.02 - inset
      const plugTopHalf = NECK_HALF_WIDTH - 0.05 - inset
      const plugBottomHalf = NECK_HALF_WIDTH - 0.09 - inset
      const bottom = inset
      const flangeBottom = 0.12
      const top = 0.25 - inset

      const shape = new THREE.Shape()
      shape.moveTo(-plugBottomHalf, bottom)
      shape.lineTo(plugBottomHalf, bottom)
      shape.lineTo(plugTopHalf, flangeBottom)
      shape.lineTo(flangeHalf, flangeBottom + 0.015)
      shape.lineTo(flangeHalf, top - 0.035)
      shape.quadraticCurveTo(flangeHalf, top, flangeHalf - 0.035, top)
      shape.lineTo(-flangeHalf + 0.035, top)
      shape.quadraticCurveTo(-flangeHalf, top, -flangeHalf, top - 0.035)
      shape.lineTo(-flangeHalf, flangeBottom + 0.015)
      shape.lineTo(-plugTopHalf, flangeBottom)
      shape.lineTo(-plugBottomHalf, bottom)
      return shape
    }

    const getShapeMesh = (inset: number, color: string, depth: number) => {
      const geometry = new THREE.ShapeGeometry(getBottleShape(inset), 12)
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.z = depth
      return mesh
    }

    const getQuestionTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const context = canvas.getContext('2d')
      if (context) {
        context.fillStyle = '#8d8d97'
        context.font = '900 104px "Arial Black", system-ui, sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('?', 64, 70)
      }
      const texture = new THREE.CanvasTexture(canvas)
      texture.anisotropy = 4
      return texture
    }

    const getLayout = (total: number) => {
      const perRow = total <= 6 ? total : Math.ceil(total / Math.ceil(total / 6))
      const rowTotal = Math.ceil(total / perRow)
      const spacingX = BOTTLE_HALF_WIDTH * 2 + 0.36
      const spacingY = BOTTLE_HEIGHT + 0.9
      const positions: THREE.Vector3[] = []
      for (let index = 0; index < total; index += 1) {
        const row = Math.floor(index / perRow)
        const itemsInRow = Math.min(perRow, total - row * perRow)
        const column = index - row * perRow
        const x = (column - (itemsInRow - 1) / 2) * spacingX
        const y = ((rowTotal - 1) / 2 - row) * spacingY - BOTTLE_HEIGHT / 2
        positions.push(new THREE.Vector3(x, y, 0))
      }
      return { positions, perRow, rowTotal, spacingX, spacingY }
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = []

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100)
    camera.position.set(0, 0, 10)

    const root = new THREE.Group()
    scene.add(root)

    const questionTexture = getQuestionTexture()
    const layout = getLayout(bottles.length)
    const bottleGroups = new Map<number, THREE.Group>()
    const liquidMeshes = new Map<number, THREE.Mesh[]>()
    const hiddenMeshes = new Map<number, THREE.Mesh[]>()
    const capGroups = new Map<number, THREE.Group>()
    const capProgress = new Map<number, number>()
    const basePositions = new Map<number, THREE.Vector3>()
    const hitMeshes: THREE.Mesh[] = []
    disposables.push(questionTexture)

    const pushDisposable = (mesh: THREE.Mesh) => {
      disposables.push(mesh.geometry, mesh.material as THREE.Material)
    }

    bottles.forEach((bottle, index) => {
      const group = new THREE.Group()
      group.position.copy(layout.positions[index])
      root.add(group)

      const outline = getShapeMesh(0, STROKE, 0)
      const glassEdge = getShapeMesh(OUTLINE, GLASS_EDGE, 0.01)
      const glass = getShapeMesh(OUTLINE + 0.03, GLASS, 0.02)
      pushDisposable(outline)
      pushDisposable(glassEdge)
      pushDisposable(glass)
      group.add(outline, glassEdge, glass)

      const shineGeometry = new THREE.PlaneGeometry(0.09, BOTTLE_HEIGHT * 0.55)
      const shineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
      const shine = new THREE.Mesh(shineGeometry, shineMaterial)
      shine.position.set(-BOTTLE_HALF_WIDTH * 0.52, BOTTLE_HEIGHT * 0.42, 0.08)
      disposables.push(shineGeometry, shineMaterial)
      group.add(shine)

      const capGroup = new THREE.Group()
      capGroup.position.set(0, BOTTLE_HEIGHT + 0.5, 0.12)
      capGroup.visible = false
      group.add(capGroup)

      const corkOutline = new THREE.Mesh(
        new THREE.ShapeGeometry(getCorkShape(-0.02), 8),
        new THREE.MeshBasicMaterial({ color: STROKE }),
      )
      pushDisposable(corkOutline)
      capGroup.add(corkOutline)

      const corkBody = new THREE.Mesh(
        new THREE.ShapeGeometry(getCorkShape(0.02), 8),
        new THREE.MeshBasicMaterial({ color: CORK }),
      )
      corkBody.position.z = 0.01
      pushDisposable(corkBody)
      capGroup.add(corkBody)

      const corkTopGeometry = new THREE.PlaneGeometry(NECK_HALF_WIDTH * 2 - 0.02, 0.04)
      const corkTopMaterial = new THREE.MeshBasicMaterial({ color: CORK_TOP })
      const corkTop = new THREE.Mesh(corkTopGeometry, corkTopMaterial)
      corkTop.position.set(0, 0.208, 0.02)
      disposables.push(corkTopGeometry, corkTopMaterial)
      capGroup.add(corkTop)

      const grainOffsets = [0.155, 0.085]
      grainOffsets.forEach((offsetY) => {
        const grainGeometry = new THREE.PlaneGeometry(NECK_HALF_WIDTH * 0.9, 0.018)
        const grainMaterial = new THREE.MeshBasicMaterial({ color: CORK_GRAIN })
        const grain = new THREE.Mesh(grainGeometry, grainMaterial)
        grain.position.set(0, offsetY, 0.02)
        disposables.push(grainGeometry, grainMaterial)
        capGroup.add(grain)
      })

      const hitGeometry = new THREE.PlaneGeometry(BOTTLE_HALF_WIDTH * 2.6, BOTTLE_HEIGHT * 1.15)
      const hitMaterial = new THREE.MeshBasicMaterial({ visible: false })
      const hit = new THREE.Mesh(hitGeometry, hitMaterial)
      hit.position.set(0, BOTTLE_HEIGHT / 2, 0.1)
      hit.userData.bottleId = bottle.id
      disposables.push(hitGeometry, hitMaterial)
      group.add(hit)
      hitMeshes.push(hit)

      const liquids: THREE.Mesh[] = []
      const hidden: THREE.Mesh[] = []
      for (let slot = 0; slot < capacity + 2; slot += 1) {
        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.z = 0.04
        mesh.visible = false
        disposables.push(geometry, material)
        group.add(mesh)
        liquids.push(mesh)

        const maskGeometry = new THREE.PlaneGeometry(1, 1)
        const maskMaterial = new THREE.MeshBasicMaterial({ color: MYSTERY })
        const mask = new THREE.Mesh(maskGeometry, maskMaterial)
        mask.position.z = 0.05
        mask.visible = false
        disposables.push(maskGeometry, maskMaterial)
        group.add(mask)

        const markGeometry = new THREE.PlaneGeometry(0.34, 0.34)
        const markMaterial = new THREE.MeshBasicMaterial({ map: questionTexture, transparent: true })
        const mark = new THREE.Mesh(markGeometry, markMaterial)
        mark.position.z = 0.01
        disposables.push(markGeometry, markMaterial)
        mask.add(mark)
        hidden.push(mask)
      }

      capGroups.set(bottle.id, capGroup)
      capProgress.set(bottle.id, 0)
      bottleGroups.set(bottle.id, group)
      liquidMeshes.set(bottle.id, liquids)
      hiddenMeshes.set(bottle.id, hidden)
      basePositions.set(bottle.id, layout.positions[index].clone())
    })

    for (let row = 0; row < layout.rowTotal; row += 1) {
      const itemsInRow = Math.min(layout.perRow, bottles.length - row * layout.perRow)
      const rowY = ((layout.rowTotal - 1) / 2 - row) * layout.spacingY - BOTTLE_HEIGHT / 2
      const shelfWidth = itemsInRow * layout.spacingX + 0.5

      const slabGeometry = new THREE.PlaneGeometry(shelfWidth, 0.22)
      const slabMaterial = new THREE.MeshBasicMaterial({ color: SHELF })
      const slab = new THREE.Mesh(slabGeometry, slabMaterial)
      slab.position.set(0, rowY - 0.11, -0.05)
      disposables.push(slabGeometry, slabMaterial)
      root.add(slab)

      const edgeGeometry = new THREE.PlaneGeometry(shelfWidth, 0.03)
      const edgeMaterial = new THREE.MeshBasicMaterial({ color: SHELF_EDGE })
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial)
      edge.position.set(0, rowY, -0.04)
      disposables.push(edgeGeometry, edgeMaterial)
      root.add(edge)
    }

    const STREAM_STEPS = 20
    const streamGeometry = new THREE.BufferGeometry()
    const streamPositions = new Float32Array((STREAM_STEPS + 1) * 2 * 3)
    const streamIndices: number[] = []
    for (let step = 0; step < STREAM_STEPS; step += 1) {
      const a = step * 2
      streamIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3))
    streamGeometry.setIndex(streamIndices)
    const streamMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    const stream = new THREE.Mesh(streamGeometry, streamMaterial)
    stream.frustumCulled = false
    stream.visible = false
    disposables.push(streamGeometry, streamMaterial)
    root.add(stream)

    const dropletMeshes: THREE.Mesh[] = []
    for (let index = 0; index < 3; index += 1) {
      const dropletGeometry = new THREE.CircleGeometry(0.045, 10)
      const dropletMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial)
      droplet.position.z = 0.51
      droplet.visible = false
      disposables.push(dropletGeometry, dropletMaterial)
      root.add(droplet)
      dropletMeshes.push(droplet)
    }

    const updateViewportSize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)

      const boardWidth = layout.perRow * layout.spacingX + 0.9
      const boardHeight = layout.rowTotal * layout.spacingY + 0.7
      const aspect = width / height
      const halfHeight = Math.max(boardHeight / 2, boardWidth / 2 / aspect)
      const halfWidth = halfHeight * aspect
      camera.left = -halfWidth
      camera.right = halfWidth
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()
    }

    updateViewportSize()
    const resizeObserver = new ResizeObserver(updateViewportSize)
    resizeObserver.observe(mount)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const updatePointerPick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(hitMeshes, false)
      if (!hits.length) return
      frameRef.current.onEditColorSortBottle(hits[0].object.userData.bottleId as number)
    }

    renderer.domElement.addEventListener('pointerdown', updatePointerPick)

    const innerBottom = OUTLINE + 0.1
    const innerHeight = BOTTLE_HEIGHT - 0.72
    const innerWidth = (BOTTLE_HALF_WIDTH - OUTLINE - 0.055) * 2
    const segmentHeight = innerHeight / capacity

    const getVisualFill = (state: typeof frameRef.current, progress: number) => {
      const fills = new Map<number, Array<{ colorIndex: number; height: number; isHidden: boolean }>>()
      state.bottles.forEach((bottle) => {
        const isComplete =
          bottle.segments.length === state.capacity &&
          bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
        fills.set(
          bottle.id,
          bottle.segments.map((segment) => ({
            colorIndex: segment.colorIndex,
            height: segmentHeight,
            isHidden: segment.isHidden && !isComplete,
          })),
        )
      })

      const pour = state.activePour
      if (!pour) return fills

      const rawFlow = Math.min(1, Math.max(0, (progress - 0.34) / 0.44))
      const flow = rawFlow * rawFlow * (3 - 2 * rawFlow)
      const moved = flow * pour.amount
      const source = fills.get(pour.from)
      const target = fills.get(pour.to)
      if (!source || !target) return fills

      let remaining = moved
      for (let index = source.length - 1; index >= 0 && remaining > 0; index -= 1) {
        const take = Math.min(1, remaining)
        source[index].height = segmentHeight * (1 - take)
        remaining -= take
      }
      let added = moved
      while (added > 0) {
        const take = Math.min(1, added)
        target.push({ colorIndex: pour.colorIndex, height: segmentHeight * take, isHidden: false })
        added -= take
      }
      return fills
    }

    const boardMinX = Math.min(...layout.positions.map((position) => position.x)) - BOTTLE_HALF_WIDTH
    const boardMaxX = Math.max(...layout.positions.map((position) => position.x)) + BOTTLE_HALF_WIDTH
    const pourSideRef = { startedAt: -1, isFromLeft: true }

    const updateBottleTransform = (state: typeof frameRef.current, progress: number) => {
      state.bottles.forEach((bottle) => {
        const group = bottleGroups.get(bottle.id)
        const base = basePositions.get(bottle.id)
        if (!group || !base) return
        const isSelected = state.selectedBottle === bottle.id
        const targetY = base.y + (isSelected ? 0.3 : 0)
        group.position.x += (base.x - group.position.x) * 0.25
        group.position.y += (targetY - group.position.y) * 0.25
        group.position.z = state.activePour?.from === bottle.id ? group.position.z : 0
        group.rotation.z += ((isSelected ? -0.06 : 0) - group.rotation.z) * 0.25
      })

      const pour = state.activePour
      if (!pour) {
        stream.visible = false
        dropletMeshes.forEach((droplet) => {
          droplet.visible = false
        })
        return
      }

      const sourceGroup = bottleGroups.get(pour.from)
      const targetBase = basePositions.get(pour.to)
      const sourceBase = basePositions.get(pour.from)
      if (!sourceGroup || !targetBase || !sourceBase) return

      const getPlacement = (isFromLeft: boolean) => {
        const tiltFull = (isFromLeft ? -1 : 1) * 1.15
        const lipFull = new THREE.Vector3((isFromLeft ? 1 : -1) * NECK_HALF_WIDTH * 0.8, BOTTLE_HEIGHT, 0)
        const rotatedLip = lipFull.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltFull)
        const restLip = new THREE.Vector3(
          targetBase.x + (isFromLeft ? -0.22 : 0.22),
          targetBase.y + BOTTLE_HEIGHT + 0.3,
          0,
        )
        const position = restLip.clone().sub(rotatedLip)
        const corners = [
          new THREE.Vector3(-BOTTLE_HALF_WIDTH, 0, 0),
          new THREE.Vector3(BOTTLE_HALF_WIDTH, 0, 0),
          new THREE.Vector3(-BOTTLE_HALF_WIDTH, BOTTLE_HEIGHT + 0.4, 0),
          new THREE.Vector3(BOTTLE_HALF_WIDTH, BOTTLE_HEIGHT + 0.4, 0),
        ].map((corner) => corner.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltFull).add(position))
        const xValues = corners.map((corner) => corner.x)
        const yValues = corners.map((corner) => corner.y)
        const margin = 0.25
        const overhang = layout.spacingX * 0.55
        const limitLeft = Math.max(camera.left + margin, boardMinX - overhang)
        const limitRight = Math.min(camera.right - margin, boardMaxX + overhang)
        const spill =
          Math.max(0, limitLeft - Math.min(...xValues)) +
          Math.max(0, Math.max(...xValues) - limitRight) +
          Math.max(0, Math.max(...yValues) - (camera.top - margin))
        return { tiltFull, lipFull, position, spill }
      }

      const cached = pourSideRef.startedAt === pour.startedAt ? pourSideRef.isFromLeft : null
      const preferred = sourceBase.x <= targetBase.x
      const getResolvedSide = () => {
        if (cached !== null) return cached
        const preferredSpill = getPlacement(preferred).spill
        const oppositeSpill = getPlacement(!preferred).spill
        const resolved = preferredSpill <= 0.001 || preferredSpill <= oppositeSpill ? preferred : !preferred
        pourSideRef.startedAt = pour.startedAt
        pourSideRef.isFromLeft = resolved
        return resolved
      }

      const isLeftSide = getResolvedSide()
      const placement = getPlacement(isLeftSide)
      const lift = Math.sin((Math.min(progress, 0.32) / 0.32) * Math.PI * 0.5)
      const settle = progress > 0.78 ? (progress - 0.78) / 0.22 : 0
      const travel = Math.max(0, lift - settle)

      const tilt = placement.tiltFull * travel
      const lipLocal = placement.lipFull
      const restPosition = placement.position

      sourceGroup.position.x = sourceBase.x + (restPosition.x - sourceBase.x) * travel
      sourceGroup.position.y = sourceBase.y + (restPosition.y - sourceBase.y) * travel
      sourceGroup.position.z = travel > 0.001 ? 0.7 : 0
      sourceGroup.rotation.z = tilt

      const head = Math.min(1, Math.max(0, (progress - 0.27) / 0.11))
      const tail = Math.min(1, Math.max(0, (progress - 0.78) / 0.08))
      const isFlowing = head > tail
      stream.visible = isFlowing
      dropletMeshes.forEach((droplet) => {
        droplet.visible = isFlowing
      })
      if (!isFlowing) return

      const lip = sourceGroup.localToWorld(lipLocal.clone())
      root.worldToLocal(lip)
      const landing = new THREE.Vector3(targetBase.x, targetBase.y + BOTTLE_HEIGHT - 0.08, 0)
      const control = new THREE.Vector3(lip.x + (landing.x - lip.x) * 0.62, lip.y + 0.07, 0)
      const color = PALETTE[pour.colorIndex % PALETTE.length]
      const time = Date.now() / 1000

      const getCurvePoint = (value: number) =>
        new THREE.Vector3(
          (1 - value) * (1 - value) * lip.x + 2 * (1 - value) * value * control.x + value * value * landing.x,
          (1 - value) * (1 - value) * lip.y + 2 * (1 - value) * value * control.y + value * value * landing.y,
          0,
        )

      const getCurveNormal = (value: number) => {
        const dx =
          2 * (1 - value) * (control.x - lip.x) + 2 * value * (landing.x - control.x)
        const dy =
          2 * (1 - value) * (control.y - lip.y) + 2 * value * (landing.y - control.y)
        const length = Math.max(Math.hypot(dx, dy), 0.0001)
        return new THREE.Vector2(-dy / length, dx / length)
      }

      for (let step = 0; step <= STREAM_STEPS; step += 1) {
        const ratio = step / STREAM_STEPS
        const value = tail + (head - tail) * ratio
        const point = getCurvePoint(value)
        const normal = getCurveNormal(value)
        const taper = 0.085 - 0.035 * value
        const wobble = Math.sin(time * 13 + value * 11) * 0.012 * (1 - value * 0.4)
        const width = Math.max(0.02, taper + wobble)
        const offset = step * 6
        streamPositions[offset] = point.x + normal.x * width
        streamPositions[offset + 1] = point.y + normal.y * width
        streamPositions[offset + 2] = 0.5
        streamPositions[offset + 3] = point.x - normal.x * width
        streamPositions[offset + 4] = point.y - normal.y * width
        streamPositions[offset + 5] = 0.5
      }
      streamGeometry.attributes.position.needsUpdate = true
      ;(stream.material as THREE.MeshBasicMaterial).color.set(color)

      dropletMeshes.forEach((droplet, index) => {
        const cycle = (time * 1.7 + index * 0.33) % 1
        const value = tail + (head - tail) * cycle
        const point = getCurvePoint(value)
        const sway = Math.sin(time * 9 + index * 2) * 0.02
        droplet.position.set(point.x + sway, point.y, 0.51)
        droplet.scale.setScalar(0.55 + (1 - cycle) * 0.5)
        ;(droplet.material as THREE.MeshBasicMaterial).color.set(color)
      })
    }

    const updateLiquids = (state: typeof frameRef.current, progress: number) => {
      const getMergedRuns = (fill: Array<{ colorIndex: number; height: number; isHidden: boolean }>) => {
        const runs: Array<{ colorIndex: number; height: number; isHidden: boolean }> = []
        fill.forEach((segment) => {
          if (segment.height <= 0.0005) return
          const last = runs[runs.length - 1]
          const isMergeable = !!last && !last.isHidden && !segment.isHidden && last.colorIndex === segment.colorIndex
          if (isMergeable) {
            last.height += segment.height
            return
          }
          runs.push({ ...segment })
        })
        return runs
      }

      const fills = getVisualFill(state, progress)
      state.bottles.forEach((bottle) => {
        const liquids = liquidMeshes.get(bottle.id)
        const hidden = hiddenMeshes.get(bottle.id)
        const fill = fills.get(bottle.id)
        if (!liquids || !hidden || !fill) return

        const runs = getMergedRuns(fill)
        let cursor = innerBottom
        liquids.forEach((mesh, slot) => {
          const run = runs[slot]
          const mask = hidden[slot]
          if (!run) {
            mesh.visible = false
            mask.visible = false
            return
          }
          const centerY = cursor + run.height / 2

          mesh.visible = !run.isHidden
          mesh.scale.set(innerWidth, run.height, 1)
          mesh.position.y = centerY
          ;(mesh.material as THREE.MeshBasicMaterial).color.set(PALETTE[run.colorIndex % PALETTE.length])

          mask.visible = run.isHidden
          mask.scale.set(innerWidth, run.height, 1)
          mask.position.y = centerY
          cursor += run.height
        })
      })
    }

    const updateBottleCap = (state: typeof frameRef.current, delta: number) => {
      const getEasedDrop = (value: number) => {
        const overshoot = 1.9
        const shifted = value - 1
        return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted
      }

      state.bottles.forEach((bottle) => {
        const capGroup = capGroups.get(bottle.id)
        if (!capGroup) return

        const isComplete =
          bottle.segments.length === state.capacity &&
          bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
        const isPouring = state.activePour?.from === bottle.id || state.activePour?.to === bottle.id
        const target = isComplete && !isPouring ? 1 : 0
        const current = capProgress.get(bottle.id) ?? 0
        const step = Math.min(1, delta * 3.6)
        const next = current + (target - current) * step
        capProgress.set(bottle.id, next)

        capGroup.visible = next > 0.01
        if (!capGroup.visible) return

        const eased = getEasedDrop(Math.min(1, next))
        capGroup.position.y = BOTTLE_HEIGHT + 0.5 - eased * 0.62
        capGroup.scale.set(1, 1, 1)
      })
    }

    const clock = new THREE.Clock()
    let animationId = 0
    const updateFrame = () => {
      animationId = requestAnimationFrame(updateFrame)
      const state = frameRef.current
      const pour = state.activePour
      const progress = pour ? Math.min(1, (Date.now() - pour.startedAt) / POUR_DURATION) : 0

      updateBottleTransform(state, progress)
      updateLiquids(state, progress)
      const delta = Math.min(clock.getDelta(), 0.05)
      updateBottleCap(state, delta)

      if (pour && progress >= 1 && !state.isPourResolved) {
        state.isPourResolved = true
        state.onEditColorSortPourDone()
      }

      renderer.render(scene, camera)
    }
    updateFrame()

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', updatePointerPick)
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottles.length, capacity])

  return <div ref={mountRef} className="h-full w-full touch-none" />
}
