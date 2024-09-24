import React from 'react'
import { usePlane } from '@react-three/cannon'
import type { PlaneProps } from '@react-three/cannon'
import { DoubleSide, TextureLoader, RepeatWrapping } from 'three'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export function Ground() {
  const [ref] = usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.1, 0],
    type: 'Static',
  } as PlaneProps))

  const texture = useLoader(TextureLoader, '/textures/ground.jpg')
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(100, 100)

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} side={DoubleSide} />
    </mesh>
  )
}
