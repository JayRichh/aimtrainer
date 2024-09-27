import React, { useRef, useEffect, useState, useMemo, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NPCProps, Vector3, NPCData, GameSettings, ExtendedNPCData } from '../types';
import Player from './Player';
import { Weapon } from './Weapon';
import {
  updateNPCShooting,
  initializeNPC,
  updateNPCMovement,
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
  const [isHit, setIsHit] = useState(false);
  const [health, setHealth] = useState(100);

  // Use ExtendedNPCData type for extendedDataRef
  const extendedDataRef = useRef<ExtendedNPCData>(initializeNPC(data));

  // Create a pool of blood splatter objects
  const bloodSplatterPool = useMemo(() => {
    const pool: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const splatter = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 32),
        new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
      );
      splatter.visible = false;
      pool.push(splatter);
    }
    return pool;
  }, []);

  const handleNPCShoot = () => {
    onShoot(data.id);
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 100);
  };

  const respawnNPC = () => {
    const initializedNPC = initializeNPC(data);
    if (initializedNPC && npcRef.current) {
      // Spawn NPC at a fixed position
      const fixedPosition = new THREE.Vector3(
        Math.random() * (mapBounds.maxX - mapBounds.minX) + mapBounds.minX,
        0,
        Math.random() * (mapBounds.maxZ - mapBounds.minZ) + mapBounds.minZ
      );
      initializedNPC.position.copy(fixedPosition);
      initializedNPC.targetPosition = fixedPosition.clone();
      initializedNPC.state = 'idle';
      extendedDataRef.current = initializedNPC;
      setHealth(100);

      // Set the NPC's position and rotation
      npcRef.current.position.copy(fixedPosition);
      npcRef.current.rotation.setFromQuaternion(initializedNPC.rotation);
    }
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
      extendedDataRef.current = updateNPCMovement(
        extendedDataRef.current,
        closestPlayerPosition,
        delta,
        settings
      );

      // Update NPC position and rotation in the scene
      npcRef.current.position.copy(extendedDataRef.current.position);
      
      // Update NPC rotation to face the closest player
      const direction = new THREE.Vector3().subVectors(closestPlayerPosition, extendedDataRef.current.position);
      const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.normalize());
      npcRef.current.quaternion.slerp(rotation, 0.1);

      // Update NPC shooting
      updateNPCShooting(
        extendedDataRef.current,
        closestPlayerPosition,
        settings,
        delta,
        (hitScore: number) => {
          onHit(extendedDataRef.current.id, hitScore);
          handleNPCShoot();
        }
      );
    }

    // Handle hit effect
    if (isHit) {
      npcRef.current.scale.setScalar(1.2); // Expand on hit
      setTimeout(() => {
        if (npcRef.current) {
          npcRef.current.scale.setScalar(1); // Return to normal size
        }
        setIsHit(false);
      }, 100);
    }
  });

  // Handle hit event
  useEffect(() => {
    const handleHit = (event: CustomEvent) => {
      if (event.detail.npcId === data.id) {
        setIsHit(true);
        setHealth((prevHealth) => {
          const newHealth = prevHealth - event.detail.damage;
          if (newHealth <= 0) {
            respawnNPC();
            return 100;
          }
          return newHealth;
        });
        createSplatterEffect();
      }
    };

    // Add event listener for hit
    window.addEventListener('npcHit', handleHit as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('npcHit', handleHit as EventListener);
    };
  }, []);

  const createSplatterEffect = () => {
    if (npcRef.current) {
      const availableSplatter = bloodSplatterPool.find(splatter => !splatter.visible);
      if (availableSplatter) {
        availableSplatter.position.copy(npcRef.current.position);
        availableSplatter.position.y += 0.01; // Slightly above ground
        availableSplatter.rotation.x = -Math.PI / 2; // Lay flat on the ground
        availableSplatter.visible = true;
        npcRef.current.parent?.add(availableSplatter);

        // Hide splatter after a few seconds
        setTimeout(() => {
          availableSplatter.visible = false;
          npcRef.current?.parent?.remove(availableSplatter);
        }, 5000);
      }
    }
  };

  return (
    <group ref={npcRef}>
      <Player
        position={[0, 0, 0]} // Relative to npcRef
        rotation={[0, 0, 0]} // Relative to npcRef
        speed={0} // Set speed to 0 as we're handling movement in updateNPCMovement
        isNPC={true}
      />
      <group position={[0, 0.5, -0.5]} rotation={[0, Math.PI, 0]}>
        <Weapon
          currentWeapon={data.weapon}
          isSwapping={false}
          isShooting={isShooting}
          onShoot={handleNPCShoot}
          muzzleFlashRef={muzzleFlashRef}
          isNPC={true}
          parentRef={npcRef as RefObject<THREE.Group>}
        />
      </group>
      {/* Health bar */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[health / 100, 0.1]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </group>
  );
};

export default NPC;
