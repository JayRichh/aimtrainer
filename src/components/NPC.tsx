import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { NPCProps, Vector3 } from '../types'

const NPC: React.FC<NPCProps> = ({ data, settings, onHit, onShoot, playerPositions }) => {
  const npcRef = useRef<THREE.Group>(null)
  const { nodes, materials } = useGLTF('/models/character.glb') as any // Assuming we have a character model

  useEffect(() => {
    if (npcRef.current) {
      npcRef.current.position.set(data.position[0], data.position[1], data.position[2])
      npcRef.current.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2])
    }
  }, [data.position, data.rotation])

  useFrame((state, delta) => {
    if (!npcRef.current) return

    // Basic AI logic
    const npcPosition = new THREE.Vector3(data.position[0], data.position[1], data.position[2]);
    let closestPlayerDistance = Infinity;
    let closestPlayerPosition: [number, number, number] | null = null;

    Object.values(playerPositions).forEach(playerPos => {
      const playerPosition = new THREE.Vector3(...playerPos);  // Convert array to Vector3
      const distance = npcPosition.distanceTo(playerPosition);

      if (distance < closestPlayerDistance) {
        closestPlayerDistance = distance;
        closestPlayerPosition = playerPos;
      }
    });

    if (closestPlayerPosition) {
      // Look at the closest player
      npcRef.current.lookAt(new THREE.Vector3(closestPlayerPosition[0], closestPlayerPosition[1], closestPlayerPosition[2]))

      // Move towards the player if not too close
      if (closestPlayerDistance > 5) {
        const direction = new THREE.Vector3(closestPlayerPosition[0], closestPlayerPosition[1], closestPlayerPosition[2]).sub(npcPosition).normalize()
        npcRef.current.position.add(direction.multiplyScalar(data.speed * delta))
      }

      // Shoot at intervals
      if (Date.now() - data.lastShootTime > data.shootInterval) {
        onShoot(data.id)
      }
    }

    // Update NPC position in the game state
    data.position = [npcRef.current.position.x, npcRef.current.position.y, npcRef.current.position.z]
  })

  return (
    <group ref={npcRef}>
      <mesh
        geometry={nodes.Character.geometry}
        material={materials.CharacterMaterial}
        castShadow
      />
      {/* Add weapon model here */}
    </group>
  )
}

export default NPC
