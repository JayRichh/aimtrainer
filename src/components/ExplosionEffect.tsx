import * as THREE from 'three';

class Explosion {
  private particles: THREE.Points;
  private material: THREE.ShaderMaterial;
  private startTime: number;
  private duration: number;
  private scene: THREE.Scene;
  private light: THREE.PointLight;
  private position: THREE.Vector3;
  private isFinished: boolean = false;

  constructor(scene: THREE.Scene, position: THREE.Vector3, color: THREE.Color, radius: number = 1, duration: number = 1.5) {
    this.scene = scene;
    this.duration = duration;
    this.position = position.clone();

    const geometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = Math.random() * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 5 + 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        duration: { value: this.duration },
        color: { value: color },
      },
      vertexShader: `
        uniform float time;
        uniform float duration;
        attribute float size;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          float progress = time / duration;
          pos *= mix(0.3, 2.5, progress);
          vAlpha = 1.0 - progress;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 - progress * 0.5);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        
        void main() {
          if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
          gl_FragColor = vec4(color, vAlpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    this.particles = new THREE.Points(geometry, this.material);
    this.particles.position.copy(this.position);
    this.scene.add(this.particles);

    // Add light flash
    this.light = new THREE.PointLight(color, 2, radius * 4);
    this.light.position.copy(this.position);
    this.scene.add(this.light);

    this.startTime = Date.now();
  }

  update() {
    if (this.isFinished) return false;

    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.material.uniforms.time.value = elapsedTime;

    // Fade out light
    const lightIntensity = Math.max(0, 2 - (elapsedTime / this.duration) * 2);
    this.light.intensity = lightIntensity;

    if (elapsedTime > this.duration) {
      this.cleanup();
      return false;
    }
    return true;
  }

  cleanup() {
    if (!this.isFinished) {
      this.scene.remove(this.particles);
      this.scene.remove(this.light);
      this.isFinished = true;
    }
  }
}

const createExplosion = (scene: THREE.Scene, position: THREE.Vector3, color: THREE.Color, radius: number = 2, duration: number = 2) => {
  const explosion = new Explosion(scene, position, color, radius, duration);
  return () => explosion.update();
};

export { createExplosion };