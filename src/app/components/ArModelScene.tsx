import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { PartModelFormat } from '../lib/threeModel';
import {
  centerAndScaleObject,
  disposeObject3D,
  loadPartObject3D,
} from '../lib/threeModel';

interface ArModelSceneProps {
  modelUrl: string;
  format: PartModelFormat;
  placed: boolean;
  placeRequestId: number;
  placementMode: 'ar' | 'preview';
  onPlaced: () => void;
  onModelError?: () => void;
  scale: number;
  rotationY: number;
  onModeChange?: (mode: 'ar' | 'preview') => void;
  onSessionChange?: (active: boolean) => void;
  /** Enable drag-to-orbit in desktop preview after the model is placed */
  orbitEnabled?: boolean;
}

export default function ArModelScene({
  modelUrl,
  format,
  placed,
  placeRequestId,
  placementMode,
  onPlaced,
  onModelError,
  scale,
  rotationY,
  onModeChange,
  onSessionChange,
  orbitEnabled = false,
}: ArModelSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const baseScaleRef = useRef(1);
  const onPlacedRef = useRef(onPlaced);
  const onModelErrorRef = useRef(onModelError);
  const onModeChangeRef = useRef(onModeChange);
  const onSessionChangeRef = useRef(onSessionChange);
  const placeOnFloorRef = useRef<() => void>(() => {});
  onPlacedRef.current = onPlaced;
  onModelErrorRef.current = onModelError;
  onModeChangeRef.current = onModeChange;
  onSessionChangeRef.current = onSessionChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modelUrl) return;

    let disposed = false;
    let hitTestSource: XRHitTestSource | null = null;
    let hitTestSourceRequested = false;
    let localSpace: XRReferenceSpace | null = null;
    let arButton: HTMLElement | null = null;

    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.17, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x3d8fc4, transparent: true, opacity: 0.85 }),
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);
    scene.add(reticle);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xe8eef3,
        transparent: true,
        opacity: 0.55,
        roughness: 0.9,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(8, 16, 0x3d8fc4, 0xd1d9e0);
    grid.position.y = 0.001;
    scene.add(grid);

    camera.position.set(0.6, 0.5, 0.9);
    camera.lookAt(0, 0.1, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enabled = false;
    controls.minDistance = 0.15;
    controls.maxDistance = 3;
    controlsRef.current = controls;

    const focusOnModel = () => {
      const model = modelRef.current;
      if (!model || !controlsRef.current) return;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 0.001);
      controlsRef.current.target.copy(center);
      camera.position.set(
        center.x + maxDim * 1.8,
        center.y + maxDim * 1.2,
        center.z + maxDim * 1.8,
      );
      controlsRef.current.update();
    };

    const placeModelAt = (matrix: THREE.Matrix4) => {
      const model = modelRef.current;
      if (!model) return;
      model.visible = true;
      model.position.setFromMatrixPosition(matrix);
      model.quaternion.setFromRotationMatrix(matrix);
      reticle.visible = false;
      focusOnModel();
      onPlacedRef.current();
    };

    placeOnFloorRef.current = () => {
      const model = modelRef.current;
      if (!model) return;
      model.visible = true;
      model.position.set(0, 0, 0);
      model.rotation.set(0, rotationY, 0);
      model.scale.setScalar(baseScaleRef.current * scale);
      reticle.visible = false;
      focusOnModel();
      onPlacedRef.current();
    };

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
      if (reticle.visible && modelRef.current && !modelRef.current.visible) {
        placeModelAt(reticle.matrix);
      }
    });
    scene.add(controller);

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

    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        if (disposed) return;
        if (!supported) {
          onModeChangeRef.current?.('preview');
          return;
        }
        onModeChangeRef.current?.('ar');
        arButton = ARButton.createButton(renderer, {
          requiredFeatures: ['hit-test'],
        });
        arButton.style.cssText =
          'position:absolute;bottom:6rem;left:50%;transform:translateX(-50%);z-index:20;display:none;';
        container.appendChild(arButton);

        renderer.xr.addEventListener('sessionstart', async () => {
          onSessionChangeRef.current?.(true);
          const session = renderer.xr.getSession();
          if (!session || !session.requestHitTestSource) return;
          localSpace = await session.requestReferenceSpace('local');
          const viewerSpace = await session.requestReferenceSpace('viewer');
          const source = await session.requestHitTestSource({ space: viewerSpace });
          hitTestSource = source ?? null;
          hitTestSourceRequested = Boolean(hitTestSource);
        });

        renderer.xr.addEventListener('sessionend', () => {
          onSessionChangeRef.current?.(false);
          hitTestSourceRequested = false;
          hitTestSource = null;
          reticle.visible = false;
        });
      });
    } else {
      onModeChangeRef.current?.('preview');
    }

    loadPartObject3D(modelUrl, format)
      .then((object) => {
        if (disposed) {
          disposeObject3D(object);
          return;
        }
        centerAndScaleObject(object, 0.2);
        baseScaleRef.current = object.scale.x;
        object.visible = false;
        modelRef.current = object;
        scene.add(object);
      })
      .catch(() => {
        if (!disposed) {
          container.dataset.error = 'true';
          onModelErrorRef.current?.();
        }
      });

    renderer.setAnimationLoop((_time, frame) => {
      if (frame && hitTestSourceRequested && hitTestSource && localSpace) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const pose = hitTestResults[0].getPose(localSpace);
          if (pose) {
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
          }
        } else {
          reticle.visible = false;
        }
      }

      if (controlsRef.current?.enabled) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      controlsRef.current?.dispose();
      controlsRef.current = null;
      const model = modelRef.current;
      if (model) disposeObject3D(model);
      modelRef.current = null;
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (arButton?.parentElement === container) container.removeChild(arButton);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, format]);

  useEffect(() => {
    if (placeRequestId <= 0 || placed) return;

    const inXr = rendererInSession();

    if (placementMode === 'ar' && !inXr) {
      const arBtn = containerRef.current?.querySelector('button');
      if (arBtn instanceof HTMLButtonElement) {
        arBtn.click();
        return;
      }
    }

    placeOnFloorRef.current();
  }, [placeRequestId, placed, placementMode]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.scale.setScalar(baseScaleRef.current * scale);
    model.rotation.y = rotationY;
  }, [scale, rotationY, placed]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const inXr = rendererInSession();
    controls.enabled = orbitEnabled && !inXr;
    if (controls.enabled && modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      controls.target.copy(box.getCenter(new THREE.Vector3()));
      controls.update();
    }
  }, [orbitEnabled, placed]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 ${orbitEnabled ? 'touch-none' : ''}`}
    />
  );
}

function rendererInSession() {
  return document.body.classList.contains('xr-present')
    || document.documentElement.classList.contains('xr-present');
}
