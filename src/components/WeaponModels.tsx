import { WeaponType } from '@/types';
import React, { useMemo } from 'react';
import * as THREE from 'three';

// Define types for weapon materials
interface WeaponMaterials {
  metalDark: THREE.MeshStandardMaterial;
  metalLight: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  plastic: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  ember: THREE.MeshBasicMaterial;
}

// Function to create materials
export const createMaterials = (): WeaponMaterials => {
    const materials: WeaponMaterials = {
      metalDark: new THREE.MeshStandardMaterial({
        color: '#404040',
        metalness: 0.8,
        roughness: 0.2,
      }),
      metalLight: new THREE.MeshStandardMaterial({
        color: '#a0a0a0',
        metalness: 0.8,
        roughness: 0.2,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: '#8b5a2b',
        metalness: 0.2,
        roughness: 0.7,
      }),
      plastic: new THREE.MeshStandardMaterial({
        color: '#202020',
        metalness: 0.1,
        roughness: 0.6,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0.1,
        roughness: 0,
        transmission: 0.9,
        transparent: true,
      }),
      ember: new THREE.MeshBasicMaterial({
        color: '#ff6000',
        transparent: true,
        opacity: 0.8,
      }),
    };
    return materials;
  };

// Define interfaces for part options
interface BarrelOptions {
  radiusTop?: number;
  radiusBottom?: number;
  length: number;
  radialSegments?: number;
  material: THREE.Material;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

interface BoxPartOptions {
  width: number;
  height: number;
  depth: number;
  material: THREE.Material;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

interface GripOptions {
  width: number;
  height: number;
  depth: number;
  material: THREE.Material;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

interface TriggerOptions {
  width?: number;
  height?: number;
  depth?: number;
  material: THREE.Material;
  position?: THREE.Vector3;
}

interface SightOptions {
  width?: number;
  height?: number;
  depth?: number;
  material: THREE.Material;
  position?: THREE.Vector3;
}

interface ScopeOptions {
  radius?: number;
  length: number;
  material: THREE.Material;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

interface StockOptions {
  width: number;
  height: number;
  depth: number;
  material: THREE.Material;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

// Reusable functions to create weapon parts
const createBarrel = (options: BarrelOptions): THREE.Mesh => {
  const {
    radiusTop = 0.02,
    radiusBottom = 0.02,
    length,
    radialSegments = 16,
    material,
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
  } = options;
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, radialSegments);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.copy(rotation);
  mesh.position.copy(position);
  return mesh;
};

const createBoxPart = (options: BoxPartOptions): THREE.Mesh => {
  const {
    width,
    height,
    depth,
    material,
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
  } = options;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.copy(rotation);
  mesh.position.copy(position);
  return mesh;
};

const createGrip = (options: GripOptions): THREE.Mesh => {
  const {
    width,
    height,
    depth,
    material,
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
  } = options;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.copy(rotation);
  mesh.position.copy(position);
  return mesh;
};

const createTrigger = (options: TriggerOptions): THREE.Mesh => {
  const {
    width = 0.01,
    height = 0.02,
    depth = 0.01,
    material,
    position = new THREE.Vector3(),
  } = options;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  return mesh;
};

const createSight = (options: SightOptions): THREE.Mesh => {
  const {
    width = 0.005,
    height = 0.005,
    depth = 0.005,
    material,
    position = new THREE.Vector3(),
  } = options;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  return mesh;
};

const createScope = (options: ScopeOptions): THREE.Group => {
  const {
    radius = 0.02,
    length,
    material,
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
  } = options;
  const scopeGroup = new THREE.Group();
  const mainBody = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 16),
    material
  );
  mainBody.rotation.x = Math.PI / 2;
  scopeGroup.add(mainBody);
  scopeGroup.position.copy(position);
  scopeGroup.rotation.copy(rotation);
  return scopeGroup;
};

const createStock = (options: StockOptions): THREE.Mesh => {
  const {
    width,
    height,
    depth,
    material,
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
  } = options;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.copy(rotation);
  mesh.position.copy(position);
  return mesh;
};

// Define weapon interfaces
interface WeaponPartProps {
  materials: WeaponMaterials;
}

// Pistol model with added details
export const PistolModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const pistolGroup = new THREE.Group();

    // Barrel
    const barrelLength = 0.25;
    const barrel = createBarrel({
      radiusTop: 0.015,
      radiusBottom: 0.015,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Slide
    const slide = createBoxPart({
      width: 0.05,
      height: 0.07,
      depth: 0.2,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.035, 0.1),
    });

    // Grip
    const grip = createGrip({
      width: 0.03,
      height: 0.1,
      depth: 0.08,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.05, -0.04),
      rotation: new THREE.Euler(-0.2, 0, 0),
    });

    // Magazine
    const magazine = createBoxPart({
      width: 0.02,
      height: 0.08,
      depth: 0.06,
      material: materials.metalLight,
      position: new THREE.Vector3(0, -0.09, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.plastic,
      position: new THREE.Vector3(0.005, -0.035, -0.01),
    });

    // Sights
    const frontSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.07, 0.17),
    });

    const rearSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.07, 0.05),
    });

    // Hammer
    const hammer = createBoxPart({
      width: 0.015,
      height: 0.02,
      depth: 0.005,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.05, -0.06),
      rotation: new THREE.Euler(0.3, 0, 0),
    });

    // Ejection Port
    const ejectionPort = createBoxPart({
      width: 0.02,
      height: 0.005,
      depth: 0.01,
      material: materials.metalLight,
      position: new THREE.Vector3(0.013, 0.045, 0.05),
    });

    // Assemble parts
    pistolGroup.add(
      barrel,
      slide,
      grip,
      magazine,
      trigger,
      frontSight,
      rearSight,
      hammer,
      ejectionPort
    );

    return pistolGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Rifle model with added details
export const RifleModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const rifleGroup = new THREE.Group();

    // Barrel
    const barrelLength = 0.7;
    const barrel = createBarrel({
      radiusTop: 0.008,
      radiusBottom: 0.008,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2 + 0.25),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Muzzle Brake
    const muzzleBrake = createBoxPart({
      width: 0.02,
      height: 0.02,
      depth: 0.05,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength + 0.25),
    });

    // Handguard
    const handguard = createBoxPart({
      width: 0.04,
      height: 0.05,
      depth: 0.3,
      material: materials.plastic,
      position: new THREE.Vector3(0, 0.025, 0.5),
    });

    // Upper Receiver
    const upperReceiver = createBoxPart({
      width: 0.05,
      height: 0.05,
      depth: 0.3,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.05, 0.25),
    });

    // Lower Receiver
    const lowerReceiver = createBoxPart({
      width: 0.05,
      height: 0.04,
      depth: 0.2,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0, 0.25),
    });

    // Stock
    const stock = createStock({
      width: 0.04,
      height: 0.07,
      depth: 0.25,
      material: materials.plastic,
      position: new THREE.Vector3(0, 0.03, -0.15),
    });

    // Magazine
    const magazine = createBoxPart({
      width: 0.02,
      height: 0.1,
      depth: 0.05,
      material: materials.metalDark,
      position: new THREE.Vector3(0, -0.05, 0.15),
      rotation: new THREE.Euler(0.2, 0, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.plastic,
      position: new THREE.Vector3(0.005, -0.025, 0.05),
    });

    // Pistol Grip
    const grip = createGrip({
      width: 0.02,
      height: 0.07,
      depth: 0.04,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.035, 0),
      rotation: new THREE.Euler(-0.3, 0, 0),
    });

    // Scope
    const scope = createScope({
      radius: 0.015,
      length: 0.15,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.09, 0.25),
    });

    // Foregrip
    const foregrip = createGrip({
      width: 0.02,
      height: 0.05,
      depth: 0.03,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.025, 0.45),
      rotation: new THREE.Euler(-0.5, 0, 0),
    });

    // Ejection Port
    const ejectionPort = createBoxPart({
      width: 0.02,
      height: 0.005,
      depth: 0.015,
      material: materials.metalDark,
      position: new THREE.Vector3(0.013, 0.03, 0.15),
    });

    // Charging Handle
    const chargingHandle = createBoxPart({
      width: 0.015,
      height: 0.005,
      depth: 0.03,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.055, 0),
    });

    // Assemble parts
    rifleGroup.add(
      barrel,
      muzzleBrake,
      handguard,
      upperReceiver,
      lowerReceiver,
      stock,
      magazine,
      trigger,
      grip,
      scope,
      foregrip,
      ejectionPort,
      chargingHandle
    );

    return rifleGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Shotgun model with added details
export const ShotgunModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const shotgunGroup = new THREE.Group();

    // Barrel
    const barrelLength = 0.6;
    const barrel = createBarrel({
      radiusTop: 0.02,
      radiusBottom: 0.02,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Underbarrel Tube
    const underBarrel = createBarrel({
      radiusTop: 0.015,
      radiusBottom: 0.015,
      length: barrelLength - 0.1,
      material: materials.metalDark,
      position: new THREE.Vector3(0, -0.03, (barrelLength - 0.1) / 2 + 0.05),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Pump
    const pump = createBoxPart({
      width: 0.05,
      height: 0.04,
      depth: 0.1,
      material: materials.wood,
      position: new THREE.Vector3(0, 0.005, 0.35),
    });

    // Receiver
    const receiver = createBoxPart({
      width: 0.06,
      height: 0.08,
      depth: 0.25,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.04, 0.1),
    });

    // Stock
    const stock = createStock({
      width: 0.05,
      height: 0.08,
      depth: 0.35,
      material: materials.wood,
      position: new THREE.Vector3(0, 0.04, -0.2),
      rotation: new THREE.Euler(0.1, 0, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.metalDark,
      position: new THREE.Vector3(0.005, -0.02, 0.05),
    });

    // Shell Ejection Port
    const ejectionPort = createBoxPart({
      width: 0.025,
      height: 0.005,
      depth: 0.02,
      material: materials.metalDark,
      position: new THREE.Vector3(0.015, 0.03, 0.05),
    });

    // Sights
    const frontSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.08, 0.59),
    });

    const rearSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.08, 0.15),
    });

    // Assemble parts
    shotgunGroup.add(
      barrel,
      underBarrel,
      pump,
      receiver,
      stock,
      trigger,
      ejectionPort,
      frontSight,
      rearSight
    );

    return shotgunGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Sniper Rifle model with added details
export const SniperModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const sniperGroup = new THREE.Group();

    // Barrel
    const barrelLength = 1.0;
    const barrel = createBarrel({
      radiusTop: 0.012,
      radiusBottom: 0.012,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2 + 0.3),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Muzzle Brake
    const muzzleBrake = createBoxPart({
      width: 0.025,
      height: 0.025,
      depth: 0.05,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength + 0.3),
    });

    // Receiver
    const receiver = createBoxPart({
      width: 0.06,
      height: 0.07,
      depth: 0.4,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.035, 0.3),
    });

    // Stock
    const stock = createStock({
      width: 0.05,
      height: 0.08,
      depth: 0.5,
      material: materials.wood,
      position: new THREE.Vector3(0, 0.04, -0.25),
      rotation: new THREE.Euler(0.1, 0, 0),
    });

    // Magazine
    const magazine = createBoxPart({
      width: 0.025,
      height: 0.1,
      depth: 0.06,
      material: materials.metalDark,
      position: new THREE.Vector3(0, -0.05, 0.15),
      rotation: new THREE.Euler(0.2, 0, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.metalDark,
      position: new THREE.Vector3(0.005, -0.02, 0.05),
    });

    // Scope
    const scope = createScope({
      radius: 0.02,
      length: 0.3,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.1, 0.3),
    });

    // Bipod
    const bipodLeftLeg = createBarrel({
      radiusTop: 0.003,
      radiusBottom: 0.003,
      length: 0.2,
      material: materials.metalDark,
      position: new THREE.Vector3(-0.02, -0.1, 0.6),
      rotation: new THREE.Euler(0.5, 0, -0.2),
    });

    const bipodRightLeg = createBarrel({
      radiusTop: 0.003,
      radiusBottom: 0.003,
      length: 0.2,
      material: materials.metalDark,
      position: new THREE.Vector3(0.02, -0.1, 0.6),
      rotation: new THREE.Euler(0.5, 0, 0.2),
    });

    // Bolt Handle
    const boltHandle = createBoxPart({
      width: 0.01,
      height: 0.02,
      depth: 0.05,
      material: materials.metalDark,
      position: new THREE.Vector3(0.03, 0.05, 0.2),
      rotation: new THREE.Euler(0, 0, 0.5),
    });

    // Assemble parts
    sniperGroup.add(
      barrel,
      muzzleBrake,
      receiver,
      stock,
      magazine,
      trigger,
      scope,
      bipodLeftLeg,
      bipodRightLeg,
      boltHandle
    );

    return sniperGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Submachine Gun (SMG) model with added details
export const SMGModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const smgGroup = new THREE.Group();

    // Barrel
    const barrelLength = 0.4;
    const barrel = createBarrel({
      radiusTop: 0.008,
      radiusBottom: 0.008,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2 + 0.1),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Suppressor
    const suppressor = createBarrel({
      radiusTop: 0.012,
      radiusBottom: 0.012,
      length: 0.15,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength + 0.1),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Receiver
    const receiver = createBoxPart({
      width: 0.05,
      height: 0.06,
      depth: 0.25,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.03, 0.1),
    });

    // Stock
    const stock = createStock({
      width: 0.04,
      height: 0.06,
      depth: 0.2,
      material: materials.plastic,
      position: new THREE.Vector3(0, 0.03, -0.1),
    });

    // Magazine
    const magazine = createBoxPart({
      width: 0.015,
      height: 0.15,
      depth: 0.04,
      material: materials.metalDark,
      position: new THREE.Vector3(0, -0.075, 0.05),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.plastic,
      position: new THREE.Vector3(0.005, -0.03, 0.02),
    });

    // Grip
    const grip = createGrip({
      width: 0.02,
      height: 0.07,
      depth: 0.04,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.035, -0.02),
      rotation: new THREE.Euler(-0.3, 0, 0),
    });

    // Iron Sights
    const frontSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.07, barrelLength + 0.2),
    });

    const rearSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.07, 0.05),
    });

    // Charging Handle
    const chargingHandle = createBoxPart({
      width: 0.03,
      height: 0.005,
      depth: 0.015,
      material: materials.metalDark,
      position: new THREE.Vector3(-0.03, 0.05, 0.1),
    });

    // Assemble parts
    smgGroup.add(
      barrel,
      suppressor,
      receiver,
      stock,
      magazine,
      trigger,
      grip,
      frontSight,
      rearSight,
      chargingHandle
    );

    return smgGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Rocket Launcher model with added details
export const RocketLauncherModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const launcherGroup = new THREE.Group();

    // Launch Tube
    const tubeLength = 1.2;
    const tube = createBarrel({
      radiusTop: 0.05,
      radiusBottom: 0.05,
      length: tubeLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, tubeLength / 2),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Front Sight
    const frontSight = createSight({
      width: 0.02,
      height: 0.02,
      depth: 0.005,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.08, tubeLength - 0.1),
    });

    // Rear Sight
    const rearSight = createSight({
      width: 0.02,
      height: 0.02,
      depth: 0.005,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.08, 0.1),
    });

    // Grip
    const grip = createGrip({
      width: 0.03,
      height: 0.08,
      depth: 0.03,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.04, 0.4),
      rotation: new THREE.Euler(-0.3, 0, 0),
    });

    // Shoulder Rest
    const shoulderRest = createStock({
      width: 0.05,
      height: 0.02,
      depth: 0.2,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.02, -0.1),
      rotation: new THREE.Euler(0, 0, 0.1),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.plastic,
      position: new THREE.Vector3(0.005, -0.03, 0.35),
    });

    // Rockets (visual only, not functional)
    const rocket = createBarrel({
      radiusTop: 0.045,
      radiusBottom: 0.045,
      length: 0.3,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0, -0.15),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Assemble parts
    launcherGroup.add(
      tube,
      frontSight,
      rearSight,
      grip,
      shoulderRest,
      trigger,
      rocket
    );

    return launcherGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Laser Gun model with added details
export const LaserGunModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const laserGunGroup = new THREE.Group();

    // Barrel
    const barrelLength = 0.5;
    const barrel = createBarrel({
      radiusTop: 0.012,
      radiusBottom: 0.012,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2 + 0.15),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Barrel Fins (for cooling or aesthetics)
    const finCount = 6;
    const finSpacing = barrelLength / finCount;
    for (let i = 0; i < finCount; i++) {
      const fin = createBoxPart({
        width: 0.03,
        height: 0.005,
        depth: 0.005,
        material: materials.metalLight,
        position: new THREE.Vector3(0, 0.012, i * finSpacing + 0.15),
      });
      laserGunGroup.add(fin);
    }

    // Body
    const body = createBoxPart({
      width: 0.06,
      height: 0.05,
      depth: 0.3,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.025, 0.15),
    });

    // Energy Cell (magazine)
    const energyCell = createBoxPart({
      width: 0.04,
      height: 0.06,
      depth: 0.1,
      material: materials.glass,
      position: new THREE.Vector3(0, -0.03, 0),
    });

    // Grip
    const grip = createGrip({
      width: 0.03,
      height: 0.07,
      depth: 0.04,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.035, -0.05),
      rotation: new THREE.Euler(-0.4, 0, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.plastic,
      position: new THREE.Vector3(0.005, -0.025, 0.0),
    });

    // Scope (futuristic design)
    const scope = createScope({
      radius: 0.015,
      length: 0.2,
      material: materials.glass,
      position: new THREE.Vector3(0, 0.07, 0.2),
    });

    // Side Panels
    const sidePanelLeft = createBoxPart({
      width: 0.005,
      height: 0.04,
      depth: 0.25,
      material: materials.metalDark,
      position: new THREE.Vector3(-0.03, 0.025, 0.15),
    });

    const sidePanelRight = createBoxPart({
      width: 0.005,
      height: 0.04,
      depth: 0.25,
      material: materials.metalDark,
      position: new THREE.Vector3(0.03, 0.025, 0.15),
    });

    // Assemble parts
    laserGunGroup.add(
      barrel,
      body,
      energyCell,
      grip,
      trigger,
      scope,
      sidePanelLeft,
      sidePanelRight
    );

    return laserGunGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Crossbow model with added details
export const CrossbowModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const crossbowGroup = new THREE.Group();

    // Stock
    const stock = createStock({
      width: 0.03,
      height: 0.06,
      depth: 0.5,
      material: materials.wood,
      position: new THREE.Vector3(0, 0.03, -0.25),
    });

    // Barrel
    const barrel = createBoxPart({
      width: 0.03,
      height: 0.02,
      depth: 0.6,
      material: materials.wood,
      position: new THREE.Vector3(0, 0.05, 0.1),
    });

    // Bow Limbs
    const leftLimb = createBarrel({
      radiusTop: 0.008,
      radiusBottom: 0.008,
      length: 0.3,
      material: materials.metalDark,
      position: new THREE.Vector3(-0.15, 0.1, 0.35),
      rotation: new THREE.Euler(0, 0, 0.5),
    });

    const rightLimb = createBarrel({
      radiusTop: 0.008,
      radiusBottom: 0.008,
      length: 0.3,
      material: materials.metalDark,
      position: new THREE.Vector3(0.15, 0.1, 0.35),
      rotation: new THREE.Euler(0, 0, -0.5),
    });

    // String
    const stringGeometry = new THREE.BufferGeometry();
    const stringVertices = new Float32Array([
      -0.15, 0.1, 0.35,
      0, 0.05, 0.1,
      0.15, 0.1, 0.35,
    ]);
    stringGeometry.setAttribute('position', new THREE.BufferAttribute(stringVertices, 3));
    const string = new THREE.Line(
      stringGeometry,
      new THREE.LineBasicMaterial({ color: '#000000' })
    );

    // Trigger
    const trigger = createTrigger({
      material: materials.metalLight,
      position: new THREE.Vector3(0.005, -0.02, 0),
    });

    // Sight
    const sight = createSight({
      width: 0.01,
      height: 0.01,
      depth: 0.01,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.06, 0.2),
    });

    // Arrow (Bolt)
    const arrowShaft = createBarrel({
      radiusTop: 0.004,
      radiusBottom: 0.004,
      length: 0.5,
      material: materials.wood,
      position: new THREE.Vector3(0, 0.05, 0.4),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    const arrowHead = createBoxPart({
      width: 0.01,
      height: 0.01,
      depth: 0.02,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.05, 0.65),
    });

    // Assemble parts
    crossbowGroup.add(
      stock,
      barrel,
      leftLimb,
      rightLimb,
      string,
      trigger,
      sight,
      arrowShaft,
      arrowHead
    );

    return crossbowGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Flamethrower model with added details
export const FlamethrowerModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const flamethrowerGroup = new THREE.Group();

    // Fuel Tank
    const tank = createBarrel({
      radiusTop: 0.1,
      radiusBottom: 0.1,
      length: 0.4,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, -0.2),
      rotation: new THREE.Euler(0, 0, 0),
    });

    // Barrel
    const barrelLength = 0.6;
    const barrel = createBarrel({
      radiusTop: 0.015,
      radiusBottom: 0.015,
      length: barrelLength,
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0, barrelLength / 2 + 0.1),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Body
    const body = createBoxPart({
      width: 0.06,
      height: 0.08,
      depth: 0.2,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.04, 0),
    });

    // Grip
    const grip = createGrip({
      width: 0.03,
      height: 0.08,
      depth: 0.03,
      material: materials.plastic,
      position: new THREE.Vector3(0, -0.04, 0.05),
      rotation: new THREE.Euler(-0.3, 0, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.metalDark,
      position: new THREE.Vector3(0.005, -0.02, 0.05),
    });

    // Hose
    const hoseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.2),
      new THREE.Vector3(0.1, -0.1, 0),
      new THREE.Vector3(0, 0, 0.1),
    ]);
    const hoseGeometry = new THREE.TubeGeometry(hoseCurve, 20, 0.01, 8, false);
    const hose = new THREE.Mesh(hoseGeometry, materials.metalDark);

    // Pilot Light
    const pilotLight = createBarrel({
      radiusTop: 0.005,
      radiusBottom: 0.005,
      length: 0.05,
      material: materials.metalDark,
      position: new THREE.Vector3(0, -0.015, barrelLength + 0.1),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Flame
    const flameGeometry = new THREE.ConeGeometry(0.05, 0.2, 16);
    const flame = new THREE.Mesh(flameGeometry, materials.ember);
    flame.position.set(0, 0, barrelLength + 0.2);
    flame.rotation.x = Math.PI / 2;

    // Assemble parts
    flamethrowerGroup.add(
      tank,
      barrel,
      body,
      grip,
      trigger,
      hose,
      pilotLight,
      flame
    );

    return flamethrowerGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// Grenade Launcher model with added details
export const GrenadeLauncherModel: React.FC<WeaponPartProps> = ({ materials }) => {
  const group = useMemo(() => {
    const grenadeLauncherGroup = new THREE.Group();

    // Barrel
    const barrelLength = 0.4;
    const barrel = createBarrel({
      radiusTop: 0.03,
      radiusBottom: 0.03,
      length: barrelLength,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0, barrelLength / 2 + 0.1),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    });

    // Cylinder (Revolving chamber)
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.07, 16),
      materials.metalLight
    );
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.set(0, 0, 0);

    // Frame
    const frame = createBoxPart({
      width: 0.06,
      height: 0.08,
      depth: 0.2,
      material: materials.metalDark,
      position: new THREE.Vector3(0, 0.04, -0.05),
    });

    // Grip
    const grip = createGrip({
      width: 0.03,
      height: 0.08,
      depth: 0.03,
      material: materials.wood,
      position: new THREE.Vector3(0, -0.04, -0.1),
      rotation: new THREE.Euler(-0.3, 0, 0),
    });

    // Trigger
    const trigger = createTrigger({
      material: materials.metalDark,
      position: new THREE.Vector3(0.005, -0.02, -0.02),
    });

    // Iron Sights
    const frontSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.07, barrelLength + 0.1),
    });

    const rearSight = createSight({
      material: materials.metalLight,
      position: new THREE.Vector3(0, 0.07, -0.05),
    });

    // Assemble parts
    grenadeLauncherGroup.add(
      barrel,
      cylinder,
      frame,
      grip,
      trigger,
      frontSight,
      rearSight
    );

    return grenadeLauncherGroup;
  }, [materials]);

  return <primitive object={group} />;
};

// WeaponModel component
interface WeaponModelProps {
  weaponType: WeaponType;
}
export const WeaponModel: React.FC<WeaponModelProps> = ({ weaponType }) => {
  const materials = createMaterials();
  
  const renderModel = () => {
      switch (weaponType) {
        case 'Pistol':
        return <PistolModel materials={materials} />;
        case 'Rifle':
        return <RifleModel materials={materials} />;
        case 'Shotgun':
        return <ShotgunModel materials={materials} />;
        case 'Sniper':
        return <SniperModel materials={materials} />;
        case 'SMG':
        return <SMGModel materials={materials} />;
        case 'RocketLauncher':
        return <RocketLauncherModel materials={materials} />;
        case 'LaserGun':
        return <LaserGunModel materials={materials} />;
        case 'Crossbow':
        return <CrossbowModel materials={materials} />;
        case 'Flamethrower':
        return <FlamethrowerModel materials={materials} />;
        case 'GrenadeLauncher':
        return <GrenadeLauncherModel materials={materials} />;
        default:
          return null;
      }
  };
  
  return <group>{renderModel()}</group>;
};
// Function to get muzzle position for each weapon
export function getMuzzlePosition(type: WeaponType): THREE.Vector3 {
  const scaleFactor = 3;
  switch (type) {
    case 'Pistol':
      return new THREE.Vector3(0, 0, 0.2 * scaleFactor);
    case 'Rifle':
      return new THREE.Vector3(0, 0, 0.4 * scaleFactor);
    case 'Shotgun':
      return new THREE.Vector3(0, 0, 0.3 * scaleFactor);
    case 'Sniper':
      return new THREE.Vector3(0, 0, 0.5 * scaleFactor);
    case 'SMG':
      return new THREE.Vector3(0, 0, 0.25 * scaleFactor);
    case 'RocketLauncher':
      return new THREE.Vector3(0, 0, 0.5 * scaleFactor);
    case 'LaserGun':
      return new THREE.Vector3(0, 0, 0.25 * scaleFactor);
    case 'Crossbow':
      return new THREE.Vector3(0, 0, 0.35 * scaleFactor);
    case 'Flamethrower':
      return new THREE.Vector3(0, 0, 0.45 * scaleFactor);
    case 'GrenadeLauncher':
      return new THREE.Vector3(0, 0, 0.3 * scaleFactor);
    default:
      return new THREE.Vector3(0, 0, 0);
  }
}

// Export NOTHING
// export {
//   PistolModel,
//   RifleModel,
//   ShotgunModel,
//   SniperModel,
//   SMGModel,
//   RocketLauncherModel,
//   LaserGunModel,
//   CrossbowModel,
//   FlamethrowerModel,
//   GrenadeLauncherModel,
// };
