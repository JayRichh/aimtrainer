// WeaponSystem.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WeaponSystemProps, WeaponType, TargetData, GameSettings, PlayerData } from '../types';
import { Weapon } from '../components/Weapon';
import { createExplosion } from '@/components/ExplosionEffect';
import { ExtendedNPCData } from '../utils/npcUtils';

const BULLET_SPEEDS: Record<WeaponType, number> = {
  Pistol: 50,
  Rifle: 60,
  Shotgun: 40,
  Sniper: 80,
  SMG: 70,
  RocketLauncher: 30,
  LaserGun: 100,
  Crossbow: 45,
  Flamethrower: 25,
  GrenadeLauncher: 35,
};

const BULLET_LIFETIMES: Record<WeaponType, number> = {
  Pistol: 2000,
  Rifle: 2000,
  Shotgun: 2000,
  Sniper: 3000,
  SMG: 2000,
  RocketLauncher: 2500,
  LaserGun: 100,
  Crossbow: 2000,
  Flamethrower: 1000,
  GrenadeLauncher: 2500,
};

const FIRE_RATES: Record<WeaponType, number> = {
  Pistol: 2,
  Rifle: 5,
  Shotgun: 1,
  Sniper: 0.5,
  SMG: 10,
  RocketLauncher: 0.5,
  LaserGun: 20,
  Crossbow: 1,
  Flamethrower: 15,
  GrenadeLauncher: 1,
};

const AUTO_FIRE_WEAPONS: WeaponType[] = ['Rifle', 'SMG', 'LaserGun', 'Flamethrower'];

const WEAPON_SWAP_DURATION = 500; // ms

const RECOIL_STRENGTH: Record<WeaponType, number> = {
  Pistol: 0.05,
  Rifle: 0.08,
  Shotgun: 0.12,
  Sniper: 0.15,
  SMG: 0.04,
  RocketLauncher: 0.2,
  LaserGun: 0.02,
  Crossbow: 0.06,
  Flamethrower: 0.03,
  GrenadeLauncher: 0.1,
};

const RECOIL_RECOVERY_SPEED = 0.92;
const RECOIL_MAX_ANGLE = Math.PI / 6; // 30 degrees

export function WeaponSystem({
  currentWeapon,
  onWeaponChange,
  onShoot,
  settings,
  targets,
  setTargets,
  onHit,
  isGamePaused,
  npcs,
  setNPCs,
  players,
  setPlayers,
}: WeaponSystemProps) {
  const { camera, scene } = useThree();
  const [lastShot, setLastShot] = useState(0);
  const bulletsRef = useRef<(THREE.Mesh | THREE.Line)[]>([]);
  const trailsRef = useRef<THREE.Line[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isFireButtonHeld, setIsFireButtonHeld] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const recoilRef = useRef<THREE.Group>(new THREE.Group());
  const recoilVelocityRef = useRef(new THREE.Vector3());
  const weaponRef = useRef<THREE.Group>(null!);
  const muzzleFlashRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    scene.add(recoilRef.current);
    recoilRef.current.add(weaponRef.current);
    return () => {
      scene.remove(recoilRef.current);
    };
  }, [scene]);

  const explode = (bullet: THREE.Object3D, scene: THREE.Scene) => {
    const explosionColor = new THREE.Color(0xff5500);
    const explosionRadius = currentWeapon === 'RocketLauncher' ? 3 : 2;
    const explosionDuration = 2;
    const explosionUpdate = createExplosion(scene, bullet.position, explosionColor, explosionRadius, explosionDuration);

    // Check for targets within the explosion radius
    targets.forEach((target) => {
      const targetPosition = new THREE.Vector3(...target.position);
      const distance = bullet.position.distanceTo(targetPosition);
      if (distance <= explosionRadius) {
        const damage = Math.floor(100 * (1 - distance / explosionRadius));
        onHit(target.id, damage);
      }
    });

    // Check for NPCs within the explosion radius
    npcs.forEach((npc) => {
      const npcPosition = new THREE.Vector3(...npc.position);
      const distance = bullet.position.distanceTo(npcPosition);
      if (distance <= explosionRadius) {
        const damage = Math.floor(100 * (1 - distance / explosionRadius));
        handleNPCHit(npc.id, damage);
      }
    });

    return explosionUpdate;
  };


const applyRecoil = useCallback(() => {
  const recoilStrength = RECOIL_STRENGTH[currentWeapon];
  const recoilAngleX = (Math.random() - 0.5) * 0.02 * recoilStrength;
  const recoilAngleY = Math.random() * 0.05 * recoilStrength;

  recoilVelocityRef.current.x += recoilAngleX;
  recoilVelocityRef.current.y += recoilAngleY;

  // Clamp the recoil to prevent excessive movement
  recoilVelocityRef.current.x = THREE.MathUtils.clamp(
    recoilVelocityRef.current.x,
    -RECOIL_MAX_ANGLE,
    RECOIL_MAX_ANGLE,
  );
  recoilVelocityRef.current.y = THREE.MathUtils.clamp(
    recoilVelocityRef.current.y,
    0,
    RECOIL_MAX_ANGLE,
  );
}, [currentWeapon]);

const shoot = useCallback(() => {
  if (isGamePaused || isSwapping) return;

  const now = Date.now();
  const fireRate = FIRE_RATES[currentWeapon];

  if (now - lastShot > 1000 / fireRate) {
    setLastShot(now);
    setIsShooting(true);

    // Weapon-specific shoot logic
    switch (currentWeapon) {
      case 'Pistol':
        shootPistol();
        break;
      case 'Rifle':
        shootRifle();
        break;
      case 'Shotgun':
        shootShotgun();
        break;
      case 'Sniper':
        shootSniper();
        break;
      case 'SMG':
        shootSMG();
        break;
      case 'RocketLauncher':
        shootRocketLauncher();
        break;
      case 'LaserGun':
        shootLaserGun();
        break;
      case 'Crossbow':
        shootCrossbow();
        break;
      case 'Flamethrower':
        shootFlamethrower();
        break;
      case 'GrenadeLauncher':
        shootGrenadeLauncher();
        break;
      default:
        shootPistol();
        break;
    }

    applyRecoil();
    onShoot();

    // Reset isShooting after a short delay
    setTimeout(() => setIsShooting(false), 50);
  }
}, [
  camera,
  currentWeapon,
  lastShot,
  scene,
  onShoot,
  settings.bulletTrailEnabled,
  isGamePaused,
  isSwapping,
  applyRecoil,
]);

const getMuzzlePosition = (): THREE.Vector3 => {
  if (!weaponRef.current || !muzzleFlashRef.current) return new THREE.Vector3();
  const muzzlePosition = new THREE.Vector3();
  muzzleFlashRef.current.getWorldPosition(muzzlePosition);
  return muzzlePosition;
};

const createGroundDecal = (position: THREE.Vector3) => {
  const decalGeometry = new THREE.CircleGeometry(0.2, 16);
  const decalMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const decal = new THREE.Mesh(decalGeometry, decalMaterial);
  decal.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
  decal.position.copy(position);
  decal.position.y = 0.01; // Slightly above ground to prevent z-fighting
  scene.add(decal);

  // Optionally, remove the decal after some time
  setTimeout(() => {
    scene.remove(decal);
  }, 10000);
};

const removeBullet = (bullet: THREE.Object3D) => {
  scene.remove(bullet);
  if (bullet.userData.trail) {
    scene.remove(bullet.userData.trail);
    trailsRef.current = trailsRef.current.filter((t) => t !== bullet.userData.trail);
  }
};

const shootBullet = (weaponType: WeaponType) => {
  const now = Date.now();
  const bulletGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const bulletMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: settings.bulletTrailEnabled ? true : false,
    opacity: settings.bulletTrailEnabled ? 0.8 : 1,
  });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  const muzzlePosition = getMuzzlePosition();
  bullet.position.copy(muzzlePosition);

  scene.add(bullet);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  bullet.userData.velocity = direction.multiplyScalar(BULLET_SPEEDS[weaponType]);
  bullet.userData.createdAt = now;

  bulletsRef.current.push(bullet);

  if (settings.bulletTrailEnabled && weaponType !== 'LaserGun') {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);
    trailsRef.current.push(trail);
    bullet.userData.trail = trail;

    const positions = new Float32Array(3);
    positions[0] = bullet.position.x;
    positions[1] = bullet.position.y;
    positions[2] = bullet.position.z;
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }
};

// Weapon-specific shoot functions
const shootPistol = () => shootBullet('Pistol');
const shootRifle = () => shootBullet('Rifle');
const shootSniper = () => shootBullet('Sniper');
const shootSMG = () => shootBullet('SMG');
const shootCrossbow = () => shootBullet('Crossbow');

const shootShotgun = () => {
  const now = Date.now();
  const numPellets = 8;
  const spreadAngle = 0.1;

  const muzzlePosition = getMuzzlePosition();

  for (let i = 0; i < numPellets; i++) {
    const bulletGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: settings.bulletTrailEnabled ? true : false,
      opacity: settings.bulletTrailEnabled ? 0.8 : 1,
    });
    const pellet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    pellet.position.copy(muzzlePosition);

    scene.add(pellet);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const spread = new THREE.Vector3(
      (Math.random() - 0.5) * spreadAngle,
      (Math.random() - 0.5) * spreadAngle,
      0,
    );
    direction.add(spread).normalize();

    pellet.userData.velocity = direction.multiplyScalar(BULLET_SPEEDS['Shotgun']);
    pellet.userData.createdAt = now;

    bulletsRef.current.push(pellet);

    if (settings.bulletTrailEnabled) {
      const trailGeometry = new THREE.BufferGeometry();
      const trailMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
      });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trail);
      trailsRef.current.push(trail);
      pellet.userData.trail = trail;

      const positions = new Float32Array(3);
      positions[0] = pellet.position.x;
      positions[1] = pellet.position.y;
      positions[2] = pellet.position.z;
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }
};

const shootRocketLauncher = () => {
  const now = Date.now();
  const rocketGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
  const rocketMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
  const rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);

  const muzzlePosition = getMuzzlePosition();
  rocket.position.copy(muzzlePosition);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

  scene.add(rocket);

  rocket.userData.velocity = direction.multiplyScalar(BULLET_SPEEDS['RocketLauncher']);
  rocket.userData.createdAt = now;

  bulletsRef.current.push(rocket);
};

const shootGrenadeLauncher = () => {
  const now = Date.now();
  const grenadeGeometry = new THREE.SphereGeometry(0.07, 16, 16);
  const grenadeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const grenade = new THREE.Mesh(grenadeGeometry, grenadeMaterial);

  const muzzlePosition = getMuzzlePosition();
  grenade.position.copy(muzzlePosition);

  scene.add(grenade);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  grenade.userData.velocity = direction.multiplyScalar(BULLET_SPEEDS['GrenadeLauncher']);
  grenade.userData.createdAt = now;
  grenade.userData.exploded = false;

  bulletsRef.current.push(grenade);
};

const shootLaserGun = () => {
  const now = Date.now();

  const muzzlePosition = getMuzzlePosition();

  const laserGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -100),
  ]);
  const laserMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 3,
  });
  const laser = new THREE.Line(laserGeometry, laserMaterial);

  laser.position.copy(muzzlePosition);
  laser.quaternion.copy(camera.quaternion);

  scene.add(laser);

  laser.userData.createdAt = now;

  bulletsRef.current.push(laser);
};

const shootFlamethrower = () => {
  const now = Date.now();
  const flameGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const flameMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.7,
  });
  const flame = new THREE.Mesh(flameGeometry, flameMaterial);

  const muzzlePosition = getMuzzlePosition();
  flame.position.copy(muzzlePosition);

  scene.add(flame);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  flame.userData.velocity = direction.multiplyScalar(BULLET_SPEEDS['Flamethrower']);

  bulletsRef.current.push(flame);
};

const handleWeaponChange = useCallback(
  (newWeapon: WeaponType) => {
    if (newWeapon !== currentWeapon && !isSwapping) {
      setIsSwapping(true);
      setTimeout(() => {
        onWeaponChange(newWeapon);
        setIsSwapping(false);
      }, WEAPON_SWAP_DURATION);
    }
  },
  [currentWeapon, onWeaponChange, isSwapping],
);

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isGamePaused) return;

    switch (event.key) {
      case '1':
        handleWeaponChange('Pistol');
        break;
      case '2':
        handleWeaponChange('Rifle');
        break;
      case '3':
        handleWeaponChange('Shotgun');
        break;
      case '4':
        handleWeaponChange('Sniper');
        break;
      case '5':
        handleWeaponChange('SMG');
        break;
      case '6':
        handleWeaponChange('RocketLauncher');
        break;
      case '7':
        handleWeaponChange('LaserGun');
        break;
      case '8':
        handleWeaponChange('Crossbow');
        break;
      case '9':
        handleWeaponChange('Flamethrower');
        break;
      case '0':
        handleWeaponChange('GrenadeLauncher');
        break;
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      setIsFireButtonHeld(true);
      shoot();
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      setIsFireButtonHeld(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [handleWeaponChange, shoot, isGamePaused]);

  const handleNPCHit = (npcId: string, damage: number) => {
    setNPCs((prevNPCs) => 
      prevNPCs.map((npc) => 
        npc.id === npcId
          ? { ...npc, health: Math.max(0, npc.health - damage) }
          : npc
      )
    );
  };

  useFrame((_, delta) => {
    if (isGamePaused) return;
  
    const now = Date.now();
  
    if (isFireButtonHeld && AUTO_FIRE_WEAPONS.includes(currentWeapon)) {
      shoot();
    }
  
    recoilRef.current.rotation.x += recoilVelocityRef.current.y;
    recoilRef.current.rotation.y += recoilVelocityRef.current.x;
  
    recoilVelocityRef.current.multiplyScalar(RECOIL_RECOVERY_SPEED);
    recoilRef.current.rotation.x *= RECOIL_RECOVERY_SPEED;
    recoilRef.current.rotation.y *= RECOIL_RECOVERY_SPEED;

    bulletsRef.current = bulletsRef.current.filter((bullet, index) => {
      if (bullet instanceof THREE.Line) {
        if (now - (bullet.userData.createdAt as number) > 100) {
          scene.remove(bullet);
          return false;
        }
        return true;
      }
  
      if (bullet instanceof THREE.Mesh) {
        bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(delta));
  
        if (bullet.position.y <= 0) {
          if (currentWeapon === 'RocketLauncher' || currentWeapon === 'GrenadeLauncher') {
            if (!bullet.userData.exploded) {
              bullet.userData.explosionUpdate = explode(bullet, scene);
              bullet.userData.exploded = true;
            }
          } else {
            createGroundDecal(bullet.position);
            removeBullet(bullet);
            return false;
          }
        }
  
        if (settings.bulletTrailEnabled && bullet.userData.trail) {
          const trail = bullet.userData.trail;
          const positions = trail.geometry.attributes.position.array as Float32Array;
          const newPositions = new Float32Array(positions.length + 3);
          newPositions.set(positions);
          newPositions[positions.length] = bullet.position.x;
          newPositions[positions.length + 1] = bullet.position.y;
          newPositions[positions.length + 2] = bullet.position.z;
          trail.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
          trail.geometry.attributes.position.needsUpdate = true;
        }

        // Check for target hits
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          const targetPosition = new THREE.Vector3(...target.position);
          const distance = bullet.position.distanceTo(targetPosition);
          const collisionDistance = 0.05 + target.size * 0.5;
    
          if (distance < collisionDistance) {
            if (currentWeapon === 'RocketLauncher' || currentWeapon === 'GrenadeLauncher') {
              if (!bullet.userData.exploded) {
                bullet.userData.explosionUpdate = explode(bullet, scene);
                bullet.userData.exploded = true;
              }
            } else {
              const hitOffset = distance - 0.05;
              const maxDistance = target.size * 0.5;
              const hitScore = Math.max(100 - (hitOffset / maxDistance) * 100, 10);
              onHit(target.id, hitScore);
              removeBullet(bullet);
              return false;
            }
            break;
          }
        }

      // Check for NPC hits
      for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        const npcPosition = new THREE.Vector3(...npc.position);
        const distance = bullet.position.distanceTo(npcPosition);
        const collisionDistance = 0.05 + 1; // Assuming NPC size is 1 unit
  
        if (distance < collisionDistance) {
          if (currentWeapon === 'RocketLauncher' || currentWeapon === 'GrenadeLauncher') {
            if (!bullet.userData.exploded) {
              bullet.userData.explosionUpdate = explode(bullet, scene);
              bullet.userData.exploded = true;
            }
          } else {
            const hitOffset = distance - 0.05;
            const maxDistance = 1; // Assuming NPC size is 1 unit
            const hitScore = Math.max(100 - (hitOffset / maxDistance) * 100, 10);
            handleNPCHit(npc.id, hitScore);
            removeBullet(bullet);
            return false;
          }
          break;
        }
      }

        if (
          (currentWeapon === 'RocketLauncher' || currentWeapon === 'GrenadeLauncher') &&
          !bullet.userData.exploded &&
          now - bullet.userData.createdAt > 1500
        ) {
          bullet.userData.explosionUpdate = explode(bullet, scene);
          bullet.userData.exploded = true;
        }
  
        if (bullet.userData.explosionUpdate) {
          const isExplosionActive = bullet.userData.explosionUpdate();
          if (!isExplosionActive) {
            delete bullet.userData.explosionUpdate;
            removeBullet(bullet);
            return false;
          }
        }
  
        if (now - bullet.userData.createdAt > BULLET_LIFETIMES[currentWeapon]) {
          removeBullet(bullet);
          return false;
        }
      }

      return true;
    });
  });

  return (
    <group ref={weaponRef}>
      <Weapon
        currentWeapon={currentWeapon}
        isSwapping={isSwapping}
        isShooting={isShooting}
        onShoot={shoot}
        muzzleFlashRef={muzzleFlashRef}
      />
    </group>
  );
}
