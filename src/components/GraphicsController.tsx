import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface GraphicsControllerProps {
  quality: number;
}

const GraphicsController: React.FC<GraphicsControllerProps> = ({ quality }) => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const shadowMapSize = Math.pow(2, 9 + quality);
    gl.shadowMap.type = quality > 3 ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    scene.traverse((object) => {
      if (object instanceof THREE.Light && object.shadow) {
        object.shadow.mapSize.width = shadowMapSize;
        object.shadow.mapSize.height = shadowMapSize;
      }
    });

    gl.setPixelRatio(window.devicePixelRatio * (quality / 5));
    gl.shadowMap.needsUpdate = true;
  }, [gl, scene, quality]);

  return null;
};

export default React.memo(GraphicsController);
