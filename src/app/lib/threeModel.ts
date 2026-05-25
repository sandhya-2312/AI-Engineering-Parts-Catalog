import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type PartModelFormat = 'glb' | 'stl';

const gltfLoader = new GLTFLoader();
const stlLoader = new STLLoader();

const defaultMaterial = new THREE.MeshStandardMaterial({
  color: 0x9ca3af,
  metalness: 0.35,
  roughness: 0.45,
});

export async function loadPartObject3D(url: string, format: PartModelFormat): Promise<THREE.Object3D> {
  if (format === 'glb') {
    const gltf = await gltfLoader.loadAsync(url);
    return gltf.scene;
  }

  const geometry = await stlLoader.loadAsync(url);
  geometry.computeBoundingBox();
  geometry.center();
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, defaultMaterial.clone());
}

export function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

export function centerAndScaleObject(object: THREE.Object3D, targetSize = 0.2) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  object.scale.setScalar(targetSize / maxDim);
}

export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  object: THREE.Object3D,
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const fov = (camera.fov * Math.PI) / 180;
  const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.4;

  camera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance);
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
}
