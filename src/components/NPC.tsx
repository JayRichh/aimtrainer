import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NPCProps, WeaponType } from '../types';
import Player from './Player';
import { Weapon } from './Weapon';

const NPC: React.FC<NPCProps> = ({ data, settings, onHit, onShoot, playerPositions }) => {
  const npcRef = useRef<THREE.Group>(null);
  const lastShootTimeRef = useRef<number>(Date.now());
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const [isShooting, setIsShooting] = useState(false);
  const steeringForceRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    if (npcRef.current) {
      npcRef.current.position.set(...data.position);
      npcRef.current.rotation.set(...data.rotation);
    }
  }, [data.position, data.rotation]);

  const handleNPCShoot = () => {
    onShoot(data.id);
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 100);
  };

  useFrame((state, delta) => {
    if (!npcRef.current) return;

    const npcPosition = new THREE.Vector3(...data.position);
    let closestPlayerDistance = Infinity;
    let closestPlayerPosition: THREE.Vector3 | null = null;

    Object.values(playerPositions).forEach((playerPos) => {
      const playerPosition = new THREE.Vector3(...playerPos);
      const distance = npcPosition.distanceTo(playerPosition);

      if (distance < closestPlayerDistance) {
        closestPlayerDistance = distance;
        closestPlayerPosition = playerPosition;
      }
    });

    if (closestPlayerPosition) {
      // Look at the closest player
      npcRef.current.lookAt(closestPlayerPosition);

      // Move towards the player using steering behavior
      const desiredVelocity = new THREE.Vector3().subVectors(closestPlayerPosition, npcPosition).normalize().multiplyScalar(settings.npcMovementSpeed);
      const steeringForce = desiredVelocity.sub(steeringForceRef.current);
      steeringForceRef.current.add(steeringForce.multiplyScalar(delta * 3));
      npcRef.current.position.add(steeringForceRef.current.clone().multiplyScalar(delta));

      // Check line of sight before shooting
      const direction = new THREE.Vector3().subVectors(closestPlayerPosition, npcPosition).normalize();
      const raycaster = new THREE.Raycaster(npcPosition, direction);
      const intersects = raycaster.intersectObjects(state.scene.children, true);
      
      if (intersects.length > 0 && intersects[0].distance < closestPlayerDistance) {
        // Clear line of sight, shoot at intervals based on reaction time and accuracy
        const currentTime = Date.now();
        if (currentTime - lastShootTimeRef.current > data.reactionTime) {
          const hitChance = Math.random();
          if (hitChance <= data.accuracy) {
            handleNPCShoot();
          }
          lastShootTimeRef.current = currentTime;
        }
      }
    }

    // Update NPC position in the game state
    data.position = [
      npcRef.current.position.x,
      npcRef.current.position.y,
      npcRef.current.position.z,
    ];
  });

  return (
    <group ref={npcRef}>
      <Player
        position={data.position}
        rotation={data.rotation}
        speed={data.speed}
      />
      <Weapon
        currentWeapon={data.weapon}
        isSwapping={false}
        isShooting={isShooting}
        onShoot={handleNPCShoot}
        muzzleFlashRef={muzzleFlashRef}
      />
    </group>
  );
};

export default NPC;
