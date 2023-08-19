import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const parameters = {
  count: 10000,
  size: 0.01,
  radius: 7,
  branches: 5,
  spin: 1,
  randomness: 0.5,
  gravity: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let particlesGeometry, particlesMaterial, particles;

const generateGalaxy = () => {
  // Destroy the old galaxy
  if (particles) {
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    scene.remove(particles);
  }

  // Geometry
  particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius =
      Math.pow(Math.random(), parameters.gravity) * parameters.radius;

    const angleStep = (Math.PI * 2) / parameters.branches;

    const spinAngle = radius * parameters.spin;

    const randomX =
      Math.pow(Math.random(), parameters.gravity) *
      parameters.randomness *
      ((Math.random() - 0.5) * 2);
    const randomY =
      Math.pow(Math.random(), parameters.gravity) *
      parameters.randomness *
      ((Math.random() - 0.5) * 2);
    const randomZ =
      Math.pow(Math.random(), parameters.gravity) *
      parameters.randomness *
      ((Math.random() - 0.5) * 2);

    positions[i3 + 0] = radius * Math.sin(spinAngle + angleStep * i) + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = radius * Math.cos(spinAngle + angleStep * i) + randomZ;

    const mixedColor = colorInside
      .clone()
      .lerp(colorOutside, radius / parameters.radius);

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  //   Material
  particlesMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
};

gui
  .add(parameters, "count")
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "radius")
  .min(1)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "randomness")
  .min(0)
  .max(1)
  .step(0.1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "gravity")
  .min(2)
  .max(10)
  .step(1)
  .onFinishChange(generateGalaxy);

gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);

gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

generateGalaxy();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (particles && parameters.spin) {
    particles.rotation.x = Math.sin(elapsedTime) / parameters.radius;
    // particles.rotation.z = Math.cos(elapsedTime) / parameters.radius;
    particles.rotation.y = -(elapsedTime * parameters.spin) / 2;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
