'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  isActive: boolean
}

export default function ColorSortStars({ isActive }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const loopRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const activeRef = useRef(isActive)

  useEffect(() => {
    activeRef.current = isActive
    if (isActive) loopRef.current?.start()
    else loopRef.current?.stop()
  }, [isActive])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.set(0, 0, 5)

    const disposables: Array<THREE.BufferGeometry | THREE.Material> = []
    const layers: Array<{
      points: THREE.Points
      offsets: Float32Array
      velocities: Float32Array
      maxTotal: number
      share: number
      baseOpacity: number
      speed: number
      drawTotal: number
    }> = []
    const configs = [
      { maxTotal: 1600, share: 0.55, size: 1.2, opacity: 0.5, speed: 0.9 },
      { maxTotal: 880, share: 0.3, size: 1.8, opacity: 0.7, speed: 1.4 },
      { maxTotal: 440, share: 0.15, size: 2.5, opacity: 0.95, speed: 2.2 },
    ]

    configs.forEach((config) => {
      const offsets = new Float32Array(config.maxTotal * 2)
      const velocities = new Float32Array(config.maxTotal * 2)
      for (let index = 0; index < config.maxTotal; index += 1) {
        offsets[index * 2] = Math.random() * 2 - 1
        offsets[index * 2 + 1] = Math.random() * 2 - 1
        const angle = Math.random() * Math.PI * 2
        const speed = (0.006 + Math.random() * 0.018) * config.speed
        velocities[index * 2] = Math.cos(angle) * speed
        velocities[index * 2 + 1] = Math.sin(angle) * speed
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(config.maxTotal * 3), 3))
      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: config.size,
        sizeAttenuation: false,
        transparent: true,
        opacity: config.opacity,
      })
      const points = new THREE.Points(geometry, material)
      points.frustumCulled = false
      disposables.push(geometry, material)
      scene.add(points)
      layers.push({
        points,
        offsets,
        velocities,
        maxTotal: config.maxTotal,
        share: config.share,
        baseOpacity: config.opacity,
        speed: config.speed,
        drawTotal: config.maxTotal,
      })
    })

    const updateViewportSize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)

      const starTotal = Math.max(220, Math.min(2900, Math.round((width * height) / 1400)))
      layers.forEach((layer) => {
        layer.drawTotal = Math.min(layer.maxTotal, Math.round(starTotal * layer.share))
        layer.points.geometry.setDrawRange(0, layer.drawTotal)
      })
    }

    updateViewportSize()
    const resizeObserver = new ResizeObserver(updateViewportSize)
    resizeObserver.observe(mount)

    const clock = new THREE.Clock()
    let animationId = 0
    const updateFrame = () => {
      animationId = requestAnimationFrame(updateFrame)
      const delta = Math.min(clock.getDelta(), 0.05)
      const time = Date.now() / 1000

      layers.forEach((layer, layerIndex) => {
        const material = layer.points.material as THREE.PointsMaterial
        material.opacity = layer.baseOpacity * (0.72 + 0.28 * Math.sin(time * layer.speed + layerIndex * 1.7))

        const attribute = layer.points.geometry.getAttribute('position') as THREE.BufferAttribute
        const array = attribute.array as Float32Array
        for (let index = 0; index < layer.drawTotal; index += 1) {
          const offsetIndex = index * 2
          let offsetX = layer.offsets[offsetIndex] + layer.velocities[offsetIndex] * delta
          let offsetY = layer.offsets[offsetIndex + 1] + layer.velocities[offsetIndex + 1] * delta
          if (offsetX > 1) offsetX = -1
          if (offsetX < -1) offsetX = 1
          if (offsetY > 1) offsetY = -1
          if (offsetY < -1) offsetY = 1
          layer.offsets[offsetIndex] = offsetX
          layer.offsets[offsetIndex + 1] = offsetY

          const positionIndex = index * 3
          array[positionIndex] = offsetX
          array[positionIndex + 1] = offsetY
          array[positionIndex + 2] = 0
        }
        attribute.needsUpdate = true
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
    if (activeRef.current) postLoopStart()

    return () => {
      loopRef.current = null
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0" />
}
