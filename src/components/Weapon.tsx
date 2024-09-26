import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WeaponType, WeaponProps } from '../types';
import { WeaponModel, getMuzzlePosition } from './WeaponModels';

export const Weapon: React.FC<WeaponProps> = ({
  currentWeapon,
  isSwapping,
  isShooting,
  onShoot,
  muzzleFlashRef,
  isNPC = false,
  parentRef,
}) => {
  const weaponRef = useRef<THREE.Group>(null!);
  const swapAnimationRef = useRef<number>(0);
  const recoilRef = useRef<number>(0);
  const { camera } = useThree();
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);

  useEffect(() => {
    if (isShooting) {
      recoilRef.current = 0.2;
      setShowMuzzleFlash(true);
      setTimeout(() => setShowMuzzleFlash(false), 50);
      onShoot();
    }
  }, [isShooting, onShoot]);

  useFrame((_, delta) => {
    if (weaponRef.current) {
      
      if (isNPC && parentRef?.current) {
        // Position weapon relative to NPC
        weaponRef.current.position.copy(parentRef.current.position);
        weaponRef.current.quaternion.copy(parentRef.current.quaternion);
      } else {
        // Position weapon relative to player camera
        const weaponOffset = new THREE.Vector3(0.4, -0.3, -0.7);
        const rotatedOffset = weaponOffset.clone().applyQuaternion(camera.quaternion);
        const weaponPosition = camera.position.clone().add(rotatedOffset);
        weaponRef.current.position.lerp(weaponPosition, 0.1);
        weaponRef.current.quaternion.copy(camera.quaternion);
      }
  
      // Handle swapping animation
      if (isSwapping) {
        swapAnimationRef.current += delta * 4;
        const t = Math.min(swapAnimationRef.current, 1);
        const y = Math.sin(t * Math.PI) * 0.5;
        const scale = 1 + Math.sin(t * Math.PI * 2) * 0.2;
        weaponRef.current.position.y -= y;
        weaponRef.current.rotation.x -= y * 2;
        weaponRef.current.scale.setScalar(scale);
      } else {
        swapAnimationRef.current = 0; // Reset swap animation
        weaponRef.current.scale.setScalar(1);
      }

      // Handle recoil
      if (recoilRef.current > 0) {
        const recoilAmount = recoilRef.current;
        const recoilOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          recoilAmount * 0.1
        );
        weaponRef.current.position.add(recoilOffset);
        weaponRef.current.rotation.x -= recoilAmount * 0.3;
        weaponRef.current.rotation.y += (Math.random() - 0.5) * 0.02 * recoilAmount;
        recoilRef.current = Math.max(0, recoilRef.current - delta * 4);
      }
    }
  });

  return (
    <group ref={weaponRef}>
      <WeaponModel weaponType={currentWeapon} />
      <mesh ref={muzzleFlashRef} visible={showMuzzleFlash}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={0xffff00} />
      </mesh>
    </group>
  );
};
