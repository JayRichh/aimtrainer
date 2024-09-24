import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  fov: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ fov }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov]);

  return null;
};

export default React.memo(CameraController);
