'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RUBIK_COLORS, RUBIK_FACES, RUBIK_TURNS, getRubikStickerPlace } from '@/shared/lib/rubikEngine'
import type { RubikAxis, RubikFaceKey, RubikTurnKey } from '@/shared/lib/rubikEngine'
import type { RubikTurn } from '../types/rubikTypes'

interface Props {
  isActive: boolean
  facelets: string[]
  turn: RubikTurn | null
  onSubmitRubikTurn: (turn: RubikTurnKey, isPrime: boolean) => void
}

const CUBIE_SIZE = 0.94
const STICKER_SIZE = 0.8
const BODY = '#141416'
const TURN_DURATION = 220
const DRAG_THRESHOLD = 10

const AXIS_SLOT: Record<RubikAxis, number> = { x: 0, y: 1, z: 2 }
const TURN_KEYS = Object.keys(RUBIK_TURNS) as RubikTurnKey[]

export default function RubikCube({ isActive, facelets, turn, onSubmitRubikTurn }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<{ isActive: boolean; onSubmitRubikTurn: (turn: RubikTurnKey, isPrime: boolean) => void }>({
    isActive,
    onSubmitRubikTurn,
  })
  const sceneRef = useRef<{
    postFacelets: (next: string[]) => void
    postTurn: (next: RubikTurn) => void
    start: () => void
    stop: () => void
  } | null>(null)

  useEffect(() => {
    frameRef.current.onSubmitRubikTurn = onSubmitRubikTurn
  }, [onSubmitRubikTurn])
  useEffect(() => {
    frameRef.current.isActive = isActive
    if (isActive) sceneRef.current?.start()
    else sceneRef.current?.stop()
  }, [isActive])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const disposables: Array<THREE.BufferGeometry | THREE.Material> = []
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(4.6, 4.2, 5.6)

    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7)
    keyLight.position.set(5, 8, 7)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35)
    fillLight.position.set(-6, -3, -5)
    scene.add(fillLight)

    const root = new THREE.Group()
    root.rotation.set(-0.18, -0.62, 0)
    scene.add(root)
    const pivot = new THREE.Group()
    root.add(pivot)

    const bodyGeometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: BODY })
    const stickerGeometry = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE)
    disposables.push(bodyGeometry, bodyMaterial, stickerGeometry)

    const cubies = new Map<string, THREE.Mesh>()
    const cubieMeshes: THREE.Mesh[] = []
    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          const cubie = new THREE.Mesh(bodyGeometry, bodyMaterial)
          cubie.position.set(x, y, z)
          cubie.userData.place = [x, y, z]
          root.add(cubie)
          cubies.set(`${x},${y},${z}`, cubie)
          cubieMeshes.push(cubie)
        }
      }
    }

    // Setiap stiker adalah bidang tipis yang menempel di permukaan luar kubus kecilnya.
    const stickers = new Map<number, THREE.Mesh>()
    RUBIK_FACES.forEach((face, faceIndex) => {
      for (let index = 0; index < 9; index += 1) {
        const place = getRubikStickerPlace(face as RubikFaceKey, index)
        const cubie = cubies.get(place.position.join(','))
        if (!cubie) continue

        const material = new THREE.MeshLambertMaterial({ color: RUBIK_COLORS[face] })
        const sticker = new THREE.Mesh(stickerGeometry, material)
        const [normalX, normalY, normalZ] = place.normal
        const offset = CUBIE_SIZE / 2 + 0.011
        sticker.position.set(normalX * offset, normalY * offset, normalZ * offset)
        // Arah hadap ditulis langsung supaya tidak bergantung pada matriks dunia yang belum dihitung.
        sticker.rotation.set(normalY * -(Math.PI / 2), normalX * (Math.PI / 2) + (normalZ < 0 ? Math.PI : 0), 0)
        disposables.push(material)
        cubie.add(sticker)
        stickers.set(faceIndex * 9 + index, sticker)
      }
    })

    const postStickerColors = (next: string[]) => {
      next.forEach((face, index) => {
        const sticker = stickers.get(index)
        const color = RUBIK_COLORS[face as RubikFaceKey]
        if (!sticker || !color) return
        ;(sticker.material as THREE.MeshLambertMaterial).color.set(color)
      })
    }
    postStickerColors(facelets)

    const animation = { key: null as RubikTurnKey | null, from: 0, startedAt: 0 }

    const postLayerPivot = (key: RubikTurnKey) => {
      const setting = RUBIK_TURNS[key]
      const slot = AXIS_SLOT[setting.axis]
      pivot.rotation.set(0, 0, 0)
      cubies.forEach((cubie) => {
        const place = cubie.userData.place as number[]
        if (place[slot] !== setting.layer) return
        pivot.add(cubie)
      })
    }

    const postLayerRelease = () => {
      pivot.rotation.set(0, 0, 0)
      // Lapisan dikembalikan ke akar setelah putaran selesai supaya putaran berikutnya bebas dipilih.
      ;[...pivot.children].forEach((child) => root.add(child))
    }

    const postTurn = (next: RubikTurn) => {
      const setting = RUBIK_TURNS[next.turn]
      if (!setting) return
      if (animation.key) postLayerRelease()

      // Warna sudah memperlihatkan hasil akhir, jadi lapisan diputar dari sudut sebelumnya ke nol.
      const angle = setting.sign * (next.isPrime ? -1 : 1) * (Math.PI / 2)
      postLayerPivot(next.turn)
      pivot.rotation[setting.axis] = -angle
      animation.key = next.turn
      animation.from = -angle
      animation.startedAt = Date.now()
    }

    const updateViewportSize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      // Kubus dijauhkan pada layar sempit supaya seluruh sisinya tetap masuk bingkai.
      const distance = 8.4 / Math.min(1.35, Math.max(0.62, camera.aspect))
      camera.position.setLength(distance)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }
    updateViewportSize()
    const resizeObserver = new ResizeObserver(updateViewportSize)
    resizeObserver.observe(mount)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const drag = {
      mode: 'idle' as 'idle' | 'orbit' | 'turn',
      x: 0,
      y: 0,
      place: [] as number[],
      normal: [] as number[],
      point: new THREE.Vector3(),
    }

    // Seluruh badan kubus dijadikan sasaran, bukan hanya stikernya, supaya celah hitam di antara
    // stiker tidak ikut tertangkap sebagai usapan pemutar sudut pandang.
    const getPointerHit = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(cubieMeshes, false)[0]
      if (!hit?.face) return null

      // Sisi kotak yang tertusuk menentukan permukaan yang disentuh, jadi arahnya dibulatkan
      // ke salah satu dari enam arah mata kubus.
      const normal = hit.face.normal.toArray().map((value) => Math.round(value))
      return { place: hit.object.userData.place as number[], normal, point: hit.point }
    }

    // Arah usapan dibandingkan dengan arah gerak layar dari setiap putaran yang mungkin,
    // lalu putaran dengan arah paling mirip yang dijalankan.
    const getDraggedTurn = (deltaX: number, deltaY: number) => {
      const slot = drag.normal.findIndex((value) => value !== 0)
      const center = new THREE.Vector3(0, 0, 0).applyMatrix4(root.matrixWorld)
      const arm = drag.point.clone().sub(center)
      const screen = new THREE.Vector2(deltaX, -deltaY).normalize()

      const candidates = TURN_KEYS.filter((key) => {
        const setting = RUBIK_TURNS[key]
        return AXIS_SLOT[setting.axis] !== slot && setting.layer === drag.place[AXIS_SLOT[setting.axis]]
      }).flatMap((key) => {
        const setting = RUBIK_TURNS[key]
        const axis = new THREE.Vector3(
          setting.axis === 'x' ? 1 : 0,
          setting.axis === 'y' ? 1 : 0,
          setting.axis === 'z' ? 1 : 0,
        ).transformDirection(root.matrixWorld)

        return [false, true].map((isPrime) => {
          const sign = setting.sign * (isPrime ? -1 : 1)
          const velocity = axis.clone().multiplyScalar(sign).cross(arm).multiplyScalar(0.001)
          const before = drag.point.clone().project(camera)
          const after = drag.point.clone().add(velocity).project(camera)
          const moved = new THREE.Vector2(after.x - before.x, after.y - before.y)
          if (!moved.length()) return { key, isPrime, score: -1 }
          return { key, isPrime, score: moved.normalize().dot(screen) }
        })
      })

      if (!candidates.length) return null
      const best = candidates.sort((left, right) => right.score - left.score)[0]
      return best.score > 0 ? best : null
    }

    const updateDragStart = (event: PointerEvent) => {
      const hit = getPointerHit(event)
      drag.x = event.clientX
      drag.y = event.clientY
      renderer.domElement.setPointerCapture(event.pointerId)
      // Selama lapisan sebelumnya masih berputar, arah permukaannya belum tetap, jadi sentuhan
      // di atas kubus diabaikan sampai putaran itu selesai.
      if (hit && animation.key) {
        drag.mode = 'idle'
        return
      }
      // Usapan di dalam kubus memutar lapisan, usapan di luar kubus memutar sudut pandang.
      if (!hit) {
        drag.mode = 'orbit'
        return
      }
      drag.mode = 'turn'
      drag.place = hit.place
      drag.normal = hit.normal
      drag.point.copy(hit.point)
    }

    const updateDragMove = (event: PointerEvent) => {
      if (drag.mode === 'idle') return
      const deltaX = event.clientX - drag.x
      const deltaY = event.clientY - drag.y

      if (drag.mode === 'orbit') {
        drag.x = event.clientX
        drag.y = event.clientY
        root.rotation.y += deltaX * 0.008
        root.rotation.x = Math.max(-1.2, Math.min(1.2, root.rotation.x + deltaY * 0.008))
        return
      }

      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return
      // Putaran baru ditolak selama lapisan sebelumnya masih beranimasi supaya papan tidak melenceng.
      if (animation.key) return
      const found = getDraggedTurn(deltaX, deltaY)
      drag.mode = 'idle'
      if (!found) return
      frameRef.current.onSubmitRubikTurn(found.key, found.isPrime)
    }

    const updateDragEnd = (event: PointerEvent) => {
      drag.mode = 'idle'
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId)
      }
    }
    renderer.domElement.addEventListener('pointerdown', updateDragStart)
    renderer.domElement.addEventListener('pointermove', updateDragMove)
    renderer.domElement.addEventListener('pointerup', updateDragEnd)
    renderer.domElement.addEventListener('pointercancel', updateDragEnd)

    let animationId = 0
    const updateFrame = () => {
      animationId = requestAnimationFrame(updateFrame)

      if (animation.key) {
        const setting = RUBIK_TURNS[animation.key]
        const progress = Math.min(1, (Date.now() - animation.startedAt) / TURN_DURATION)
        // Perlambatan di akhir membuat putaran terasa seperti tangan yang melepas lapisan.
        const eased = 1 - Math.pow(1 - progress, 3)
        pivot.rotation[setting.axis] = animation.from * (1 - eased)
        if (progress >= 1) {
          animation.key = null
          postLayerRelease()
        }
      }

      renderer.render(scene, camera)
    }
    const postLoopStart = () => {
      if (animationId) return
      updateFrame()
    }
    const postLoopStop = () => {
      if (!animationId) return
      cancelAnimationFrame(animationId)
      animationId = 0
    }

    sceneRef.current = { postFacelets: postStickerColors, postTurn, start: postLoopStart, stop: postLoopStop }
    if (frameRef.current.isActive) postLoopStart()

    return () => {
      sceneRef.current = null
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', updateDragStart)
      renderer.domElement.removeEventListener('pointermove', updateDragMove)
      renderer.domElement.removeEventListener('pointerup', updateDragEnd)
      renderer.domElement.removeEventListener('pointercancel', updateDragEnd)
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
    // Adegan hanya dibangun sekali; perubahan warna dan putaran dikirim lewat penunjuk adegan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    sceneRef.current?.postFacelets(facelets)
  }, [facelets])
  useEffect(() => {
    if (!turn) return
    sceneRef.current?.postTurn(turn)
  }, [turn])

  return <div ref={mountRef} className="h-full w-full touch-none" />
}
