import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Sky, Environment, Stars, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { type SceneSetupProps } from '@/types';

const SceneSetup: React.FC<SceneSetupProps> = React.memo(
  ({ sunPosition, graphicsQuality, timeOfDay, weatherCondition }) => {
    const { scene, gl, camera } = useThree();
    const directionalLightRef = useRef<THREE.DirectionalLight>(null);

    useHelper(
      directionalLightRef as React.MutableRefObject<THREE.DirectionalLight>,
      THREE.DirectionalLightHelper,
      5,
    );

    useEffect(() => {
      if (directionalLightRef.current) {
        directionalLightRef.current.shadow.mapSize.width = 2048 * graphicsQuality;
        directionalLightRef.current.shadow.mapSize.height = 2048 * graphicsQuality;
        directionalLightRef.current.shadow.camera.near = 1;
        directionalLightRef.current.shadow.camera.far = 50;
        directionalLightRef.current.shadow.bias = -0.001;
      }

      // Adjust fog for better visibility
      scene.fog = new THREE.Fog(0xffffff, 75, 150);

      // Optimize renderer settings
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;

      // Adjust camera settings for better depth perception
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.near = 0.1;
        camera.far = 1000;
        camera.updateProjectionMatrix();
      }

      // Ensure high-quality textures
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
          object.material.envMapIntensity = 1;
          object.material.needsUpdate = true;
        }
      });
    }, [graphicsQuality, scene, gl, camera]);

    const skyProps =
      timeOfDay === 'day'
        ? {
            sunPosition,
            turbidity: 8,
            rayleigh: 0.3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            exposure: 0.5,
          }
        : {
            sunPosition: [0, -1, 0] as [number, number, number],
            inclination: 0,
            azimuth: 0.25,
            exposure: 0.1,
          };

    const environmentPreset = timeOfDay === 'day' ? 'sunset' : 'night';

    useFrame(() => {
      if (directionalLightRef.current) {
        directionalLightRef.current.position.copy(new THREE.Vector3(...sunPosition));
      }
    });

    return (
      <>
        <Sky {...skyProps} />
        <Environment preset={environmentPreset} background={false} />

        {timeOfDay === 'night' && (
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        )}

        {weatherCondition === 'cloudy' && <fog attach="fog" args={['#c1c1c1', 0, 100]} />}

        <ambientLight
          intensity={timeOfDay === 'day' ? 0.7 * graphicsQuality : 0.3 * graphicsQuality}
        />
        <directionalLight
          ref={directionalLightRef}
          position={sunPosition}
          intensity={timeOfDay === 'day' ? 1.2 * graphicsQuality : 0.4 * graphicsQuality}
          castShadow
        />
        <hemisphereLight
          intensity={0.3 * graphicsQuality}
          color={timeOfDay === 'day' ? '#ffffff' : '#000033'}
          groundColor={timeOfDay === 'day' ? '#bbbbff' : '#000000'}
        />
      </>
    );
  },
);

SceneSetup.displayName = 'SceneSetup';

export default SceneSetup;
