import React, { useRef, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { NPCProps } from '../types';

export function NPC({ data, settings, onHit, onShoot }: NPCProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF('//cdn.wtlstudio.com/sample.wtlstudio.com/48315172-1012-4127-9e52-ed8738ba5e37.glb') as any;

  useEffect(() => {
    if (group.current) {
      group.current.position.set(data.position[0], data.position[1], data.position[2]);
      group.current.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
    }
  }, [data.position, data.rotation]);

  useFrame((state, delta) => {
    if (group.current) {
      // Basic AI logic: Chase target
      const targetPosition = new THREE.Vector3(...settings.targetPosition);
      const currentPosition = group.current.position;

      const direction = new THREE.Vector3();
      direction.subVectors(targetPosition, currentPosition).normalize();
      
      if (data.state === 'moving') {
        group.current.position.add(direction.multiplyScalar(delta * settings.targetSpeed));
      } else if (data.state === 'attacking' && settings.npcShootBack) {
        // Implement shooting logic here
        if (Math.random() < 0.01) { // 1% chance to shoot per frame
          onShoot(data.id);
        }
      }
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onHit(data.id, 10);
  };

  return (
    <group ref={group} onClick={handleClick}>
      <mesh
        geometry={nodes.NPC.geometry}
        material={materials.NPCSkin}
        scale={[0.5, 0.5, 0.5]} // Adjust scale as needed
      />
    </group>
  );
}

useGLTF.preload('//cdn.wtlstudio.com/sample.wtlstudio.com/48315172-1012-4127-9e52-ed8738ba5e37.glb');
