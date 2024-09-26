import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NPCProps, Vector3 } from '../types';
import Player from './Player';
import { Weapon } from './Weapon';
import {
  updateNPCMovement,
  updateNPCShooting,
  initializeNPC,
  ExtendedNPCData,
} from '../utils/npcUtils';

const NPC: React.FC<NPCProps> = ({
  data,
  settings,
  onHit,
  onShoot,
  playerPositions,
  mapBounds,
  gameState,
}) => {
  const npcRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const [isShooting, setIsShooting] = useState(false);

  // Use a ref for extendedData
  const extendedDataRef = useRef<ExtendedNPCData>(initializeNPC(data));
  const bobbingOffset = useRef(0);

  const handleNPCShoot = () => {
    onShoot(extendedDataRef.current.id);
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 100);
  };

  const respawnNPC = () => {
    const playerPos = Object.values(playerPositions)[0];
    const newPosition = getRandomPositionAroundPlayer(
      playerPos,
      5,
      20,
      mapBounds,
    );
    extendedDataRef.current.position.copy(newPosition);
    extendedDataRef.current.targetPosition.copy(newPosition);
    extendedDataRef.current.lastMoveTime = Date.now();
    extendedDataRef.current.moveInterval = Math.random() * 2000 + 1000;
    extendedDataRef.current.state = 'idle';
  };

  useFrame((state, delta) => {
    if (!npcRef.current || gameState !== 'playing') return;

    let closestPlayerDistance = Infinity;
    let closestPlayerPosition: Vector3 | null = null;

    Object.entries(playerPositions).forEach(([playerId, playerPos]) => {
      const distance = extendedDataRef.current.position.distanceTo(playerPos);
      if (distance < closestPlayerDistance) {
        closestPlayerDistance = distance;
        closestPlayerPosition = playerPos;
      }
    });

    if (closestPlayerPosition) {
      // Update NPC movement
      const updatedNPC = updateNPCMovement(
        extendedDataRef.current,
        closestPlayerPosition,
        settings,
        delta,
        mapBounds,
      );

      // Update extendedDataRef directly
      extendedDataRef.current = updatedNPC;

      // Update NPC position and rotation in the scene
      npcRef.current.position.copy(updatedNPC.position);
      npcRef.current.rotation.copy(updatedNPC.rotation);

      // Add bobbing motion to make the NPC less rigid
      bobbingOffset.current += delta * 2; // Adjust speed as needed
      const bobbingAmount = Math.sin(bobbingOffset.current) * 0.05; // Adjust amplitude as needed
      npcRef.current.position.y += bobbingAmount;

      // Update NPC shooting
      updateNPCShooting(
        updatedNPC,
        closestPlayerPosition,
        settings,
        delta,
        (hitScore: number) => {
          onHit(updatedNPC.id, hitScore);
          handleNPCShoot();
        },
      );
    }
  });

  // Handle hit event
  useEffect(() => {
    const handleHit = (event: CustomEvent) => {
      if (event.detail.npcId === extendedDataRef.current.id) {
        // Decrease health or handle NPC hit logic here
        // For now, we'll just respawn the NPC
        respawnNPC();
      }
    };

    // Add event listener for hit
    window.addEventListener('npcHit', handleHit as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('npcHit', handleHit as EventListener);
    };
  }, []);

  return (
    <group ref={npcRef}>
      <Player
        position={[0, 0, 0]} // Relative to npcRef
        rotation={[0, 0, 0]} // Relative to npcRef
        speed={extendedDataRef.current.speed}
        isNPC={true}
      />
      <group position={[0, 0.5, -0.5]} rotation={[0, Math.PI, 0]}>
        <Weapon
          currentWeapon={extendedDataRef.current.weapon}
          isSwapping={false}
          isShooting={isShooting}
          onShoot={handleNPCShoot}
          muzzleFlashRef={muzzleFlashRef}
          isNPC={true}
          parentRef={npcRef}
        />
      </group>
    </group>
  );
};

// Helper function to get random position around player
const getRandomPositionAroundPlayer = (
  playerPosition: Vector3,
  minDistance: number,
  maxDistance: number,
  mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number },
): Vector3 => {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * (maxDistance - minDistance) + minDistance;
  let x = playerPosition.x + Math.cos(angle) * distance;
  let z = playerPosition.z + Math.sin(angle) * distance;

  // Ensure the position is within map bounds
  x = Math.max(mapBounds.minX, Math.min(mapBounds.maxX, x));
  z = Math.max(mapBounds.minZ, Math.min(mapBounds.maxZ, z));

  return new THREE.Vector3(x, playerPosition.y, z);
};

export default NPC;
