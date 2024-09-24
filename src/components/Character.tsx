import React, { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import { Vector3, Mesh, Quaternion, Raycaster } from 'three'
import { useKeyboardControls } from '@react-three/drei'
import { CharacterProps } from '../types'

const SPEED = 4
const JUMP_FORCE = 30
const GRAVITY = 40
const GROUND_THRESHOLD = 0.5
const JUMP_COOLDOWN = 250

export function Character({ speed = 1, sensitivity = 0.002, isGamePaused }: CharacterProps) {
  const { camera, scene } = useThree()
  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 1, 0],
    args: [0.5],
  }))

  const velocity = useRef([0, 0, 0])
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity])

  const pos = useRef([0, 1, 0])
  useEffect(() => api.position.subscribe((p) => (pos.current = p)), [api.position])

  const [, get] = useKeyboardControls()
  const [canJump, setCanJump] = useState(true)
  const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, GROUND_THRESHOLD)

  useEffect(() => {
    camera.rotation.set(0, Math.PI, 0)
  }, [camera])

  const isOnGround = () => {
    raycaster.ray.origin.set(pos.current[0], pos.current[1], pos.current[2])
    const intersects = raycaster.intersectObjects(scene.children, true)
    return intersects.length > 0
  }

  useFrame(() => {
    if (isGamePaused) {
      api.velocity.set(0, 0, 0)
      return
    }

    const { forward, backward, left, right, jump, quickTurn } = get()
    const direction = new Vector3()

    const cameraQuaternion = new Quaternion()
    camera.getWorldQuaternion(cameraQuaternion)
    const cameraFront = new Vector3(0, 0, -1).applyQuaternion(cameraQuaternion)
    const cameraRight = new Vector3(1, 0, 0).applyQuaternion(cameraQuaternion)

    if (forward) direction.add(cameraFront)
    if (backward) direction.sub(cameraFront)
    if (left) direction.sub(cameraRight)
    if (right) direction.add(cameraRight)

    direction.y = 0
    direction.normalize().multiplyScalar(SPEED * speed)

    const onGround = isOnGround()
    
    api.velocity.set(direction.x, velocity.current[1], direction.z)

    if (jump && onGround && canJump) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2])
      setCanJump(false)
      setTimeout(() => setCanJump(true), JUMP_COOLDOWN)
    }

    api.applyForce([0, -GRAVITY, 0], [0, 0, 0])

    if (quickTurn) {
      camera.rotation.y += Math.PI
    }

    camera.position.set(pos.current[0], pos.current[1] + 1.6, pos.current[2])
  })

  return <mesh ref={ref} />
}