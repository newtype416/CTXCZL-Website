import { useEffect, useRef } from 'react';
import { Camera, GLTFLoader, Program, Renderer, Transform, Vec3 } from 'ogl';
import { assetUrl } from '../utils/assets';

const vertex = `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vModelX;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vModelX = position.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = `
  precision highp float;
  uniform sampler2D tMap;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vModelX;
  void main() {
    if (vModelX > -0.32) discard;
    vec3 light = normalize(vec3(-0.45, 0.82, 0.55));
    float shade = 0.38 + 0.62 * max(dot(normalize(vNormal), light), 0.0);
    vec4 color = texture2D(tMap, vUv);
    gl_FragColor = vec4(color.rgb * shade, color.a);
  }
`;

const smooth = (value, target, amount) => value + (target - value) * amount;

function materialFor(gl, texture) {
  return new Program(gl, {
    vertex,
    fragment,
    cullFace: false,
    uniforms: { tMap: { value: texture } },
  });
}

export default function DogRunScene({ followPointer = false, jumpTrigger = 0 }) {
  const canvasRef = useRef(null);
  const jumpRef = useRef(jumpTrigger);

  useEffect(() => {
    jumpRef.current = jumpTrigger;
  }, [jumpTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 42, near: 0.1, far: 100 });
    camera.position.set(0, 0, 4.15);
    const scene = new Transform();
    const dog = new Transform();
    dog.setParent(scene);
    dog.scale.set(3, 3, 3);

    let modelReady = false;
    let disposed = false;
    GLTFLoader.load(gl, assetUrl('/models/border-collie.glb')).then((gltf) => {
      if (disposed) return;
      gltf.scene.forEach((node) => node.setParent(dog));
      gltf.meshes.forEach(({ primitives }) => {
        primitives.forEach((mesh) => {
          const texture = mesh.program.gltfMaterial?.baseColorTexture?.texture;
          if (texture) mesh.program = materialFor(gl, texture);
        });
      });
      modelReady = true;
    }).catch((error) => console.error('Unable to load desktop pet model.', error));

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, lastInput: performance.now(), facing: 0 };
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height));
      camera.perspective({ aspect: width / height });
    };
    const wake = (x, y) => {
      pointer.targetX = Math.max(-1, Math.min(1, x));
      pointer.targetY = Math.max(-1, Math.min(1, y));
      pointer.lastInput = performance.now();
    };
    const onPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      wake(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
    };
    const onWheel = (event) => wake(pointer.targetX + Math.sign(event.deltaX) * 0.12, pointer.targetY - Math.sign(event.deltaY) * 0.2);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastJump = jumpRef.current;
    let jumpStartedAt = -Infinity;

    let frame = 0;
    const render = (time) => {
      if (jumpRef.current !== lastJump) {
        lastJump = jumpRef.current;
        jumpStartedAt = time;
      }
      const running = !reduceMotion && time - pointer.lastInput < 720;
      pointer.x = smooth(pointer.x, pointer.targetX, running ? 0.08 : 0.025);
      pointer.y = smooth(pointer.y, pointer.targetY, running ? 0.07 : 0.02);
      pointer.facing = smooth(pointer.facing, running ? pointer.targetX * 0.32 : 0, 0.06);

      const jumpElapsed = time - jumpStartedAt;
      const jumpOffset = !reduceMotion && jumpElapsed >= 0 && jumpElapsed < 800
        ? Math.abs(Math.sin((jumpElapsed / 400) * Math.PI)) * 0.34
        : 0;
      dog.position.x = 1.92 + pointer.x * 0.16;
      dog.position.y = pointer.y * 0.08 + jumpOffset;
      dog.rotation.y = pointer.facing;
      dog.rotation.z = running ? pointer.targetX * -0.06 : 0;
      if (modelReady) renderer.render({ scene, camera, frustumCull: false });
      frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    (followPointer ? window : canvas).addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      observer.disconnect();
      (followPointer ? window : canvas).removeEventListener('pointermove', onPointer);
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frame);
    };
  }, [followPointer]);

  return <canvas ref={canvasRef} className="dog-run-scene" aria-label="Interactive 3D dog" role="img" />;
}
