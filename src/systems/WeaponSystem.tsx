import { useState, useCallback, useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WeaponSystemProps } from '../types'

const BULLET_SPEED = 50
const BULLET_LIFETIME = 2000 // milliseconds

export function WeaponSystem({ currentWeapon, onWeaponChange }: WeaponSystemProps) {
  const { camera, scene } = useThree()
  const [lastShot, setLastShot] = useState(0)
  const bulletsRef = useRef<THREE.Mesh[]>([])
  const soundRef = useRef<THREE.Audio>()

  useEffect(() => {
    const listener = new THREE.AudioListener()
    camera.add(listener)

    const sound = new THREE.Audio(listener)
    const audioLoader = new THREE.AudioLoader()
    audioLoader.load('/sounds/gunshot.mp3', (buffer) => {
      sound.setBuffer(buffer)
      sound.setVolume(0.2)
    })

    soundRef.current = sound

    return () => {
      camera.remove(listener)
    }
  }, [camera])

  const shoot = useCallback(() => {
    const now = Date.now()
    const fireRate = currentWeapon === 'Pistol' ? 2 : currentWeapon === 'Rifle' ? 5 : 1
    if (now - lastShot > 1000 / fireRate) {
      setLastShot(now)

      if (soundRef.current && !soundRef.current.isPlaying) {
        soundRef.current.play()
      }

      const bulletGeometry = new THREE.SphereGeometry(0.05, 16, 16)
      const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
      const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial)

      bullet.position.set(camera.position.x, camera.position.y, camera.position.z)
      scene.add(bullet)

      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      bullet.userData.velocity = direction.multiplyScalar(BULLET_SPEED)
      bullet.userData.createdAt = now

      bulletsRef.current.push(bullet)
    }
  }, [camera, currentWeapon, lastShot, scene])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case '1':
          onWeaponChange('Pistol')
          break
        case '2':
          onWeaponChange('Rifle')
          break
        case '3':
          onWeaponChange('Shotgun')
          break
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        shoot()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [onWeaponChange, shoot])

  useFrame((_, delta) => {
    const now = Date.now()
    bulletsRef.current.forEach((bullet, index) => {
      bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(delta))
      
      if (now - bullet.userData.createdAt > BULLET_LIFETIME) {
        scene.remove(bullet)
        bulletsRef.current.splice(index, 1)
      }
    })
  })

  return null
}