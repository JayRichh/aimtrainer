import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import { Audio, AudioListener, AudioLoader, Vector3 } from 'three'
import { TargetProps } from '../types'
import * as THREE from 'three'

export const Target: React.FC<TargetProps> = ({ position, onHit, size, difficulty }) => {
  const [ref, api] = useBox<THREE.Group>(() => ({ 
    mass: 1, 
    position, 
    args: [size, size, 0.1 * size],
    type: 'Static',
  }))
  const [hovered, setHovered] = useState(false)
  const [hit, setHit] = useState(false)
  const sound = useRef<Audio>()
  const originalPosition = useRef(new Vector3(...position))
  const currentPosition = useRef(new Vector3(...position))

  useEffect(() => {
    const listener = new AudioListener()
    const audioLoader = new AudioLoader()
    sound.current = new Audio(listener)

    audioLoader.load('/sounds/hit.mp3', (buffer) => {
      if (sound.current) {
        sound.current.setBuffer(buffer)
        sound.current.setVolume(0.5)
      }
    })

    return () => {
      if (sound.current) {
        sound.current.disconnect()
      }
    }
  }, [])

  useFrame((state) => {
    if (hit) {
      setHit(false)
    }

    const time = state.clock.getElapsedTime()
    const speed = difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 1 : 2
    const amplitude = size * 2

    const newY = originalPosition.current.y + Math.sin(time * speed) * amplitude
    const newX = originalPosition.current.x + Math.cos(time * speed * 0.5) * amplitude
    const newZ = originalPosition.current.z + Math.sin(time * speed * 0.3) * amplitude

    currentPosition.current.set(newX, newY, newZ)
    api.position.set(newX, newY, newZ)
  })

  const handleHit = () => {
    if (!hit) {
      setHit(true)
      if (sound.current) {
        sound.current.play()
      }
      onHit()
    }
  }

  return (
    <group ref={ref} scale={[size, size, size]}>
      <mesh
        name="target"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleHit}
      >
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color={hit ? 'red' : hovered ? 'lightblue' : 'lightgreen'} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <ringGeometry args={[0.1, 0.2, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  )
}