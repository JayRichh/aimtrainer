import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ColorblindControllerProps {
  mode: string;
}

const ColorblindController: React.FC<ColorblindControllerProps> = ({ mode }) => {
  const { scene } = useThree();

  const colorAdjustments = {
    none: { r: 1, g: 1, b: 1 },
    protanopia: { r: 0.567, g: 0.433, b: 0 },
    deuteranopia: { r: 0.625, g: 0.375, b: 0 },
    tritanopia: { r: 0.95, g: 0.05, b: 0 },
  };

  useEffect(() => {
    const adjustment = colorAdjustments[mode as keyof typeof colorAdjustments] || colorAdjustments.none;

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.color.setRGB(
          object.material.color.r * adjustment.r,
          object.material.color.g * adjustment.g,
          object.material.color.b * adjustment.b
        );
        object.material.needsUpdate = true;
      }
    });
  }, [scene, mode]);

  return null;
};

export default React.memo(ColorblindController);
