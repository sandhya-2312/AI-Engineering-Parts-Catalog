import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { PartModelFormat } from '../lib/threeModel';
import {
  disposeObject3D,
  fitCameraToObject,
  loadPartObject3D,
} from '../lib/threeModel';

export interface PartModelViewerControls {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleFullscreen: () => void;
}

interface PartModelViewerProps {
  modelUrl: string;
  format: PartModelFormat;
  className?: string;
  onReady?: (controls: PartModelViewerControls | null) => void;
}

export default function PartModelViewer({
  modelUrl,
  format,
  className,
  onReady,
}: PartModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modelUrl) return;

    let disposed = false;
    let frameId = 0;
    let modelRoot: THREE.Object3D | null = null;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.01;
    controls.maxDistance = 500;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-5, 2, -4);
    scene.add(fillLight);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const notifyReady = () => {
      onReadyRef.current?.(viewerControls);
    };

    const notifyDisposed = () => {
      onReadyRef.current?.(null);
    };

    const setCameraDistance = (scale: number) => {
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const distance = offset.length();
      if (distance === 0) return;
      const nextDistance = THREE.MathUtils.clamp(
        distance * scale,
        controls.minDistance,
        controls.maxDistance,
      );
      if (nextDistance === distance) return;
      offset.normalize().multiplyScalar(nextDistance);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    };

    const viewerControls: PartModelViewerControls = {
      resetView: () => {
        if (modelRoot) fitCameraToObject(camera, controls, modelRoot);
      },
      zoomIn: () => setCameraDistance(0.8),
      zoomOut: () => setCameraDistance(1.25),
      toggleFullscreen: () => {
        const el = container.closest('#part-model-preview') ?? container;
        if (!document.fullscreenElement) {
          el.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      },
    };

    loadPartObject3D(modelUrl, format)
      .then((object) => {
        if (disposed) {
          disposeObject3D(object);
          return;
        }
        if (modelRoot) {
          scene.remove(modelRoot);
          disposeObject3D(modelRoot);
        }
        modelRoot = object;
        scene.add(modelRoot);
        fitCameraToObject(camera, controls, modelRoot);
        notifyReady();
      })
      .catch(() => {
        if (!disposed) container.dataset.error = 'true';
      });

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      notifyDisposed();
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (modelRoot) disposeObject3D(modelRoot);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, format]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="3D part preview"
    />
  );
}
