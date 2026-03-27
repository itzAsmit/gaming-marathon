import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MonolithThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountEl.clientWidth / mountEl.clientHeight, 1, 1000);
    camera.position.z = 400;
    scene.add(camera);

    const circle = new THREE.Object3D();
    const skelet = new THREE.Object3D();
    const particle = new THREE.Object3D();

    scene.add(circle);
    scene.add(skelet);
    scene.add(particle);

    const particleGeometry = new THREE.TetrahedronGeometry(2, 0);
    const planetGeometry = new THREE.IcosahedronGeometry(7, 1);
    const wireGeometry = new THREE.IcosahedronGeometry(15, 1);

    const particleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      transparent: true,
      opacity: 0.11,
    });

    const particleCount = window.innerWidth < 768 ? 450 : 800;
    for (let i = 0; i < particleCount; i += 1) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
      mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      mesh.position.multiplyScalar(90 + Math.random() * 700);
      mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      particle.add(mesh);
    }

    const planetMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      transparent: true,
      opacity: 0.09,
    });

    const wireMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      wireframe: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.scale.setScalar(16);
    circle.add(planet);

    const wirePlanet = new THREE.Mesh(wireGeometry, wireMaterial);
    wirePlanet.scale.setScalar(10);
    skelet.add(wirePlanet);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(1, 0, 0);
    const fillLight = new THREE.DirectionalLight(0xd4d4d4, 0.55);
    fillLight.position.set(0.75, 1, 0.5);
    const rimLight = new THREE.DirectionalLight(0x7a7a7a, 0.5);
    rimLight.position.set(-0.75, -1, 0.5);

    scene.add(ambientLight);
    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(rimLight);

    let frameId = 0;

    const onResize = () => {
      if (!mountEl) return;
      const width = mountEl.clientWidth;
      const height = mountEl.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);

      particle.rotation.y -= 0.0026;
      circle.rotation.x -= 0.0016;
      circle.rotation.y -= 0.0021;
      skelet.rotation.x -= 0.0008;
      skelet.rotation.y += 0.0015;

      renderer.clear();
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mountEl);
    onResize();
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      particle.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      planetGeometry.dispose();
      wireGeometry.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      planetMaterial.dispose();
      wireMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" aria-hidden="true" />;
}
