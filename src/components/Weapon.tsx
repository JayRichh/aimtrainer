import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function Weapon() {
  const { camera } = useThree()
  const weaponRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (weaponRef.current) {
      weaponRef.current.position.setFromMatrixPosition(camera.matrixWorld)
      weaponRef.current.rotation.setFromRotationMatrix(camera.matrixWorld)
      weaponRef.current.translateX(0.3)
      weaponRef.current.translateY(-0.3)
      weaponRef.current.translateZ(-0.5)
    }
  })

  return (
    <group ref={weaponRef}>
      <mesh>
        <boxGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0, 0.03, 0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.1]} />
        <meshStandardMaterial color="darkgray" />
      </mesh>
    </group>
  )
}