import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTranslation } from '../i18n';

export function ThreeDViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const t = useTranslation();

  useEffect(() => {
    if (!mountRef.current) return;

    // Set up the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 6);

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x3b8526, depthWrite: false }) // Grass green
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Add some random cubes (trees/buildings)
    const blockGeo = new THREE.BoxGeometry(1, 1, 1);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        if (Math.abs(x) < 3 && Math.abs(z) < 3) continue; // Keep center clear

        const trunk = new THREE.Mesh(blockGeo, blockMat);
        trunk.position.set(x, 0.5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);

        const leaves = new THREE.Mesh(blockGeo, leafMat);
        leaves.position.set(x, 1.5, z);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        scene.add(leaves);
    }

    // Add a simple "character"
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x0066ff });
    const player = new THREE.Mesh(geometry, material);
    player.position.y = 1;
    player.castShadow = true;
    scene.add(player);

    // Keyboard controls
    const keys = { w: false, a: false, s: false, d: false };
    
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.hasOwnProperty(key)) keys[key as keyof typeof keys] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.hasOwnProperty(key)) keys[key as keyof typeof keys] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Game loop
    let animationFrameId: number;
    const speed = 0.15;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Movement
      let moved = false;
      if (keys.w) { player.position.z -= speed; moved = true; }
      if (keys.s) { player.position.z += speed; moved = true; }
      if (keys.a) { player.position.x -= speed; moved = true; }
      if (keys.d) { player.position.x += speed; moved = true; }

      // Make camera follow player smoothly
      camera.position.x += (player.position.x - camera.position.x) * 0.1;
      camera.position.z += (player.position.z + 6 - camera.position.z) * 0.1;
      camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative outline-none" tabIndex={0} ref={mountRef} autoFocus>
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded text-xs select-none pointer-events-none z-10 backdrop-blur-sm border border-white/20">
        <div className="font-bold mb-1">{t.apps.exeRunner.context3D}</div>
        <div>{t.apps.exeRunner.move}</div>
        <div>{t.apps.exeRunner.focus}</div>
      </div>
    </div>
  );
}
