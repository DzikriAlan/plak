'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ColorSortBottle, ColorSortPour } from '../types/colorSortTypes'

interface Props {
  isActive: boolean
  bottles: ColorSortBottle[]
  selectedBottle: number | null
  activePours: ColorSortPour[]
  onEditColorSortBottle: (bottleId: number) => void
  onEditColorSortPourDone: (pourId: number) => void
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
const SHELF = '#1b1b20'
const SHELF_EDGE = '#33333c'
const CORK = '#c9a06a'
const CORK_TOP = '#e0bd8e'
const CORK_GRAIN = '#a2794a'

const BOTTLE_HALF_WIDTH = 0.46
const NECK_HALF_WIDTH = 0.24
const OUTLINE = 0.06
const SEGMENT_HEIGHT = 0.445
const INNER_BOTTOM = 0.16
const NECK_SPACE = 0.56
const POUR_DURATION = 900

export default function ColorSortBoard({
  isActive,
  bottles,
  selectedBottle,
  activePours,
  onEditColorSortBottle,
  onEditColorSortPourDone,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const loopRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const frameRef = useRef<{
    bottles: ColorSortBottle[]
    selectedBottle: number | null
    activePours: ColorSortPour[]
    onEditColorSortBottle: (bottleId: number) => void
    onEditColorSortPourDone: (pourId: number) => void
    resolvedPours: Set<number>
    isActive: boolean
  }>({
    bottles,
    selectedBottle,
    activePours,
    onEditColorSortBottle,
    onEditColorSortPourDone,
    resolvedPours: new Set(),
    isActive,
  })

  useEffect(() => {
    frameRef.current.bottles = bottles
    frameRef.current.selectedBottle = selectedBottle
    frameRef.current.activePours = activePours
    frameRef.current.onEditColorSortBottle = onEditColorSortBottle
    frameRef.current.onEditColorSortPourDone = onEditColorSortPourDone
    frameRef.current.isActive = isActive
  }, [bottles, selectedBottle, activePours, onEditColorSortBottle, onEditColorSortPourDone, isActive])

  useEffect(() => {
    if (isActive) loopRef.current?.start()
    else loopRef.current?.stop()
  }, [isActive])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const getBottleHeight = (capacity: number) => INNER_BOTTOM + capacity * SEGMENT_HEIGHT + NECK_SPACE

    const getBottleShape = (inset: number, height: number) => {
      const halfWidth = BOTTLE_HALF_WIDTH - inset
      const neckHalf = NECK_HALF_WIDTH - inset * 0.7
      const top = height - inset
      const bottom = inset
      const radius = 0.14
      const shoulder = top - 0.5

      const shape = new THREE.Shape()
      shape.moveTo(-halfWidth + radius, bottom)
      shape.lineTo(halfWidth - radius, bottom)
      shape.quadraticCurveTo(halfWidth, bottom, halfWidth, bottom + radius)
      shape.lineTo(halfWidth, shoulder)
      shape.quadraticCurveTo(halfWidth, shoulder + 0.3, neckHalf, shoulder + 0.36)
      shape.lineTo(neckHalf, top - 0.1)
      shape.lineTo(neckHalf + 0.03, top - 0.08)
      shape.lineTo(neckHalf + 0.03, top)
      shape.lineTo(-neckHalf - 0.03, top)
      shape.lineTo(-neckHalf - 0.03, top - 0.08)
      shape.lineTo(-neckHalf, top - 0.1)
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

    const getLayout = (items: ColorSortBottle[]) => {
      const total = items.length
      const perRow = total <= 6 ? total : Math.ceil(total / Math.ceil(total / 6))
      const rowTotal = Math.ceil(total / perRow)
      const spacingX = BOTTLE_HALF_WIDTH * 2 + 0.36
      const rowGap = 0.9

      const rowHeights: number[] = []
      for (let row = 0; row < rowTotal; row += 1) {
        const rowItems = items.slice(row * perRow, row * perRow + perRow)
        rowHeights.push(Math.max(...rowItems.map((item) => getBottleHeight(item.capacity))))
      }
      const boardHeight = rowHeights.reduce((sum, height) => sum + height, 0) + rowGap * (rowTotal - 1)

      const positions: THREE.Vector3[] = []
      let cursorTop = boardHeight / 2
      const rowBottoms: number[] = []
      for (let row = 0; row < rowTotal; row += 1) {
        rowBottoms.push(cursorTop - rowHeights[row])
        cursorTop -= rowHeights[row] + rowGap
      }

      items.forEach((item, index) => {
        const row = Math.floor(index / perRow)
        const itemsInRow = Math.min(perRow, total - row * perRow)
        const column = index - row * perRow
        const x = (column - (itemsInRow - 1) / 2) * spacingX
        positions.push(new THREE.Vector3(x, rowBottoms[row], 0))
      })

      return { positions, perRow, rowTotal, spacingX, rowBottoms, boardHeight }
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
    disposables.push(questionTexture)
    const layout = getLayout(bottles)
    const bottleGroups = new Map<number, THREE.Group>()
    const bottleHeights = new Map<number, number>()
    const liquidMeshes = new Map<number, THREE.Mesh[]>()
    const hiddenMeshes = new Map<number, THREE.Mesh[]>()
    const capGroups = new Map<number, THREE.Group>()
    const capProgress = new Map<number, number>()
    const basePositions = new Map<number, THREE.Vector3>()
    const hitMeshes: THREE.Mesh[] = []

    const pushDisposable = (mesh: THREE.Mesh) => {
      disposables.push(mesh.geometry, mesh.material as THREE.Material)
    }

    const getShapeMesh = (inset: number, color: string, depth: number, height: number) => {
      const geometry = new THREE.ShapeGeometry(getBottleShape(inset, height), 12)
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.z = depth
      return mesh
    }

    bottles.forEach((bottle, index) => {
      const height = getBottleHeight(bottle.capacity)
      const group = new THREE.Group()
      group.position.copy(layout.positions[index])
      root.add(group)

      const outline = getShapeMesh(0, STROKE, 0, height)
      const glassEdge = getShapeMesh(OUTLINE, GLASS_EDGE, 0.01, height)
      const glass = getShapeMesh(OUTLINE + 0.03, GLASS, 0.02, height)
      pushDisposable(outline)
      pushDisposable(glassEdge)
      pushDisposable(glass)
      group.add(outline, glassEdge, glass)

      const shineGeometry = new THREE.PlaneGeometry(0.09, height * 0.55)
      const shineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
      const shine = new THREE.Mesh(shineGeometry, shineMaterial)
      shine.position.set(-BOTTLE_HALF_WIDTH * 0.52, height * 0.42, 0.08)
      disposables.push(shineGeometry, shineMaterial)
      group.add(shine)

      const capGroup = new THREE.Group()
      capGroup.position.set(0, height + 0.5, 0.12)
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

      const hitGeometry = new THREE.PlaneGeometry(BOTTLE_HALF_WIDTH * 2.6, height * 1.15)
      const hitMaterial = new THREE.MeshBasicMaterial({ visible: false })
      const hit = new THREE.Mesh(hitGeometry, hitMaterial)
      hit.position.set(0, height / 2, 0.1)
      hit.userData.bottleId = bottle.id
      disposables.push(hitGeometry, hitMaterial)
      group.add(hit)
      hitMeshes.push(hit)

      const liquids: THREE.Mesh[] = []
      const hidden: THREE.Mesh[] = []
      for (let slot = 0; slot < bottle.capacity + 2; slot += 1) {
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
      bottleHeights.set(bottle.id, height)
      liquidMeshes.set(bottle.id, liquids)
      hiddenMeshes.set(bottle.id, hidden)
      basePositions.set(bottle.id, layout.positions[index].clone())
    })

    for (let row = 0; row < layout.rowTotal; row += 1) {
      const itemsInRow = Math.min(layout.perRow, bottles.length - row * layout.perRow)
      const rowY = layout.rowBottoms[row]
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
    const streamTotal = Math.max(1, Math.floor(bottles.length / 2))
    const streamPool: Array<{ mesh: THREE.Mesh; positions: Float32Array; droplets: THREE.Mesh[] }> = []
    for (let index = 0; index < streamTotal; index += 1) {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array((STREAM_STEPS + 1) * 2 * 3)
      const indices: number[] = []
      for (let step = 0; step < STREAM_STEPS; step += 1) {
        const anchor = step * 2
        indices.push(anchor, anchor + 1, anchor + 2, anchor + 1, anchor + 3, anchor + 2)
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setIndex(indices)
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.frustumCulled = false
      mesh.visible = false
      disposables.push(geometry, material)
      root.add(mesh)

      const droplets: THREE.Mesh[] = []
      for (let dropletIndex = 0; dropletIndex < 3; dropletIndex += 1) {
        const dropletGeometry = new THREE.CircleGeometry(0.045, 10)
        const dropletMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial)
        droplet.position.z = 0.51
        droplet.visible = false
        disposables.push(dropletGeometry, dropletMaterial)
        root.add(droplet)
        droplets.push(droplet)
      }

      streamPool.push({ mesh, positions, droplets })
    }

    const updateViewportSize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)

      const boardWidth = layout.perRow * layout.spacingX + 0.9
      const boardHeight = layout.boardHeight + 0.9
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

    const boardMinX = Math.min(...layout.positions.map((position) => position.x)) - BOTTLE_HALF_WIDTH
    const boardMaxX = Math.max(...layout.positions.map((position) => position.x)) + BOTTLE_HALF_WIDTH
    const pourSides = new Map<number, boolean>()
    const innerWidth = (BOTTLE_HALF_WIDTH - OUTLINE - 0.055) * 2

    const getPourProgress = (pour: ColorSortPour, now: number) => Math.min(1, (now - pour.startedAt) / POUR_DURATION)

    const getVisualFill = (state: typeof frameRef.current, now: number) => {
      const fills = new Map<number, Array<{ colorIndex: number; height: number; isHidden: boolean }>>()
      state.bottles.forEach((bottle) => {
        const isComplete =
          bottle.segments.length === bottle.capacity &&
          bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
        fills.set(
          bottle.id,
          bottle.segments.map((segment) => ({
            colorIndex: segment.colorIndex,
            height: SEGMENT_HEIGHT,
            isHidden: segment.isHidden && !isComplete,
          })),
        )
      })

      state.activePours.forEach((pour) => {
        const progress = getPourProgress(pour, now)
        const rawFlow = Math.min(1, Math.max(0, (progress - 0.34) / 0.44))
        const flow = rawFlow * rawFlow * (3 - 2 * rawFlow)
        const moved = flow * pour.amount
        const source = fills.get(pour.from)
        const target = fills.get(pour.to)
        if (!source || !target) return

        let remaining = moved
        for (let index = source.length - 1; index >= 0 && remaining > 0; index -= 1) {
          const take = Math.min(1, remaining)
          source[index].height = SEGMENT_HEIGHT * (1 - take)
          remaining -= take
        }
        let added = moved
        while (added > 0) {
          const take = Math.min(1, added)
          target.push({ colorIndex: pour.colorIndex, height: SEGMENT_HEIGHT * take, isHidden: false })
          added -= take
        }
      })

      return fills
    }

    const updatePourPlacement = (state: typeof frameRef.current, pour: ColorSortPour, now: number, slot: number) => {
      const sourceGroup = bottleGroups.get(pour.from)
      const sourceBase = basePositions.get(pour.from)
      const targetBase = basePositions.get(pour.to)
      const sourceHeight = bottleHeights.get(pour.from)
      const targetHeight = bottleHeights.get(pour.to)
      const stream = streamPool[slot]
      if (!sourceGroup || !sourceBase || !targetBase || !sourceHeight || !targetHeight || !stream) return

      const getPlacement = (isFromLeft: boolean) => {
        const tiltFull = (isFromLeft ? -1 : 1) * 1.15
        const lipFull = new THREE.Vector3((isFromLeft ? 1 : -1) * NECK_HALF_WIDTH * 0.8, sourceHeight, 0)
        const rotatedLip = lipFull.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltFull)
        const restLip = new THREE.Vector3(
          targetBase.x + (isFromLeft ? -0.22 : 0.22),
          targetBase.y + targetHeight + 0.3,
          0,
        )
        const position = restLip.clone().sub(rotatedLip)
        const corners = [
          new THREE.Vector3(-BOTTLE_HALF_WIDTH, 0, 0),
          new THREE.Vector3(BOTTLE_HALF_WIDTH, 0, 0),
          new THREE.Vector3(-BOTTLE_HALF_WIDTH, sourceHeight + 0.4, 0),
          new THREE.Vector3(BOTTLE_HALF_WIDTH, sourceHeight + 0.4, 0),
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

      const getResolvedSide = () => {
        const cached = pourSides.get(pour.id)
        if (cached !== undefined) return cached
        const preferred = sourceBase.x <= targetBase.x
        const preferredSpill = getPlacement(preferred).spill
        const oppositeSpill = getPlacement(!preferred).spill
        const resolved = preferredSpill <= 0.001 || preferredSpill <= oppositeSpill ? preferred : !preferred
        pourSides.set(pour.id, resolved)
        return resolved
      }

      const progress = getPourProgress(pour, now)
      const isFromLeft = getResolvedSide()
      const placement = getPlacement(isFromLeft)
      const lift = Math.sin((Math.min(progress, 0.32) / 0.32) * Math.PI * 0.5)
      const settle = progress > 0.78 ? (progress - 0.78) / 0.22 : 0
      const travel = Math.max(0, lift - settle)

      sourceGroup.position.x = sourceBase.x + (placement.position.x - sourceBase.x) * travel
      sourceGroup.position.y = sourceBase.y + (placement.position.y - sourceBase.y) * travel
      sourceGroup.position.z = travel > 0.001 ? 0.7 : 0
      sourceGroup.rotation.z = placement.tiltFull * travel

      const head = Math.min(1, Math.max(0, (progress - 0.27) / 0.11))
      const tail = Math.min(1, Math.max(0, (progress - 0.78) / 0.08))
      const isFlowing = head > tail
      stream.mesh.visible = isFlowing
      stream.droplets.forEach((droplet) => {
        droplet.visible = isFlowing
      })
      if (!isFlowing) return

      const lip = sourceGroup.localToWorld(placement.lipFull.clone())
      root.worldToLocal(lip)
      const landing = new THREE.Vector3(targetBase.x, targetBase.y + targetHeight - 0.08, 0)
      const control = new THREE.Vector3(lip.x + (landing.x - lip.x) * 0.62, lip.y + 0.07, 0)
      const color = PALETTE[pour.colorIndex % PALETTE.length]
      const time = now / 1000

      const getCurvePoint = (value: number) =>
        new THREE.Vector3(
          (1 - value) * (1 - value) * lip.x + 2 * (1 - value) * value * control.x + value * value * landing.x,
          (1 - value) * (1 - value) * lip.y + 2 * (1 - value) * value * control.y + value * value * landing.y,
          0,
        )

      const getCurveNormal = (value: number) => {
        const dx = 2 * (1 - value) * (control.x - lip.x) + 2 * value * (landing.x - control.x)
        const dy = 2 * (1 - value) * (control.y - lip.y) + 2 * value * (landing.y - control.y)
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
        stream.positions[offset] = point.x + normal.x * width
        stream.positions[offset + 1] = point.y + normal.y * width
        stream.positions[offset + 2] = 0.5
        stream.positions[offset + 3] = point.x - normal.x * width
        stream.positions[offset + 4] = point.y - normal.y * width
        stream.positions[offset + 5] = 0.5
      }
      stream.mesh.geometry.attributes.position.needsUpdate = true
      ;(stream.mesh.material as THREE.MeshBasicMaterial).color.set(color)

      stream.droplets.forEach((droplet, index) => {
        const cycle = (time * 1.7 + index * 0.33) % 1
        const value = tail + (head - tail) * cycle
        const point = getCurvePoint(value)
        const sway = Math.sin(time * 9 + index * 2) * 0.02
        droplet.position.set(point.x + sway, point.y, 0.51)
        droplet.scale.setScalar(0.55 + (1 - cycle) * 0.5)
        ;(droplet.material as THREE.MeshBasicMaterial).color.set(color)
      })
    }

    const updateBottleTransform = (state: typeof frameRef.current, now: number) => {
      const pouringIds = new Set(state.activePours.map((pour) => pour.from))

      state.bottles.forEach((bottle) => {
        const group = bottleGroups.get(bottle.id)
        const base = basePositions.get(bottle.id)
        if (!group || !base || pouringIds.has(bottle.id)) return
        const isSelected = state.selectedBottle === bottle.id
        const targetY = base.y + (isSelected ? 0.3 : 0)
        group.position.x += (base.x - group.position.x) * 0.25
        group.position.y += (targetY - group.position.y) * 0.25
        group.position.z = 0
        group.rotation.z += ((isSelected ? -0.06 : 0) - group.rotation.z) * 0.25
      })

      state.activePours.forEach((pour, slot) => {
        updatePourPlacement(state, pour, now, slot)
      })

      for (let slot = state.activePours.length; slot < streamPool.length; slot += 1) {
        streamPool[slot].mesh.visible = false
        streamPool[slot].droplets.forEach((droplet) => {
          droplet.visible = false
        })
      }
    }

    const updateLiquids = (state: typeof frameRef.current, now: number) => {
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

      const fills = getVisualFill(state, now)
      state.bottles.forEach((bottle) => {
        const liquids = liquidMeshes.get(bottle.id)
        const hidden = hiddenMeshes.get(bottle.id)
        const fill = fills.get(bottle.id)
        if (!liquids || !hidden || !fill) return

        const runs = getMergedRuns(fill)
        let cursor = INNER_BOTTOM
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

      const busyIds = new Set(state.activePours.flatMap((pour) => [pour.from, pour.to]))

      state.bottles.forEach((bottle) => {
        const capGroup = capGroups.get(bottle.id)
        const height = bottleHeights.get(bottle.id)
        if (!capGroup || !height) return

        const isComplete =
          bottle.segments.length === bottle.capacity &&
          bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
        const target = isComplete && !busyIds.has(bottle.id) ? 1 : 0
        const current = capProgress.get(bottle.id) ?? 0
        const step = Math.min(1, delta * 3.6)
        const next = current + (target - current) * step
        capProgress.set(bottle.id, next)

        capGroup.visible = next > 0.01
        if (!capGroup.visible) return

        const eased = getEasedDrop(Math.min(1, next))
        capGroup.position.y = height + 0.5 - eased * 0.62
      })
    }

    const clock = new THREE.Clock()
    let animationId = 0
    const updateFrame = () => {
      animationId = requestAnimationFrame(updateFrame)
      const state = frameRef.current
      const now = Date.now()
      const delta = Math.min(clock.getDelta(), 0.05)

      updateBottleTransform(state, now)
      updateLiquids(state, now)
      updateBottleCap(state, delta)

      state.activePours.forEach((pour) => {
        if (getPourProgress(pour, now) < 1 || state.resolvedPours.has(pour.id)) return
        state.resolvedPours.add(pour.id)
        pourSides.delete(pour.id)
        state.onEditColorSortPourDone(pour.id)
      })

      renderer.render(scene, camera)
    }
    const postLoopStart = () => {
      if (animationId) return
      clock.getDelta()
      updateFrame()
    }
    const postLoopStop = () => {
      if (!animationId) return
      cancelAnimationFrame(animationId)
      animationId = 0
    }

    loopRef.current = { start: postLoopStart, stop: postLoopStop }
    if (frameRef.current.isActive) postLoopStart()

    return () => {
      loopRef.current = null
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', updatePointerPick)
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottles.length, bottles.map((bottle) => bottle.capacity).join(',')])

  return <div ref={mountRef} className="h-full w-full touch-none" />
}
