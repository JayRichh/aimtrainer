import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'
import { CharacterProps } from '../types'
import { Weapon } from './Weapon'

const JUMP_FORCE = 4
const DEFAULT_SPEED = 5

export function Character({ speed = DEFAULT_SPEED }: CharacterProps) {
  const { camera } = useThree()
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 1.6, 0],
  }))

  const velocity = useRef(new THREE.Vector3())
  const position = useRef(new THREE.Vector3())
  const [, get] = useKeyboardControls()
  const [isJumping, setIsJumping] = useState(false)

  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]))
    const unsubscribePosition = api.position.subscribe((p) => position.current.set(p[0], p[1], p[2]))
    
    // Set initial camera rotation to look forward
    camera.rotation.set(0, 0, 0)

    return () => {
      unsubscribeVelocity()
      unsubscribePosition()
    }
  }, [api.velocity, api.position, camera])

  useFrame(() => {
    const { forward, backward, left, right, jump } = get()
    const direction = new THREE.Vector3()

    // Calculate movement direction based on camera orientation
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0
    cameraDirection.normalize()

    const rightVector = new THREE.Vector3()
    rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize()

    if (forward) direction.add(cameraDirection)
    if (backward) direction.sub(cameraDirection)
    if (left) direction.sub(rightVector)
    if (right) direction.add(rightVector)
    direction.normalize().multiplyScalar(speed)

    api.velocity.set(direction.x, velocity.current.y, direction.z)
    if (jump && !isJumping) {
      api.velocity.set(velocity.current.x, JUMP_FORCE, velocity.current.z)
      setIsJumping(true)
    }

    if (Math.abs(velocity.current.y) < 0.05) {
      setIsJumping(false)
    }

    camera.position.copy(position.current)
  })

  return (
    <>
      <mesh ref={ref} />
      <Weapon />
    </>
  )
}
