import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import './CircularGallery.css';

function debounce(func, wait) { let timeout; return function (...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }
function lerp(p1, p2, t) { return p1 + (p2 - p1) * t; }
function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => { if (key !== 'constructor' && typeof instance[key] === 'function') { instance[key] = instance[key].bind(instance); } });
}

function getFontSize(font) { const match = font.match(/(\d+)px/); return match ? parseInt(match[1], 10) : 30; }

function createTextTexture(gl, text, font, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const lines = text.split('\n');
  const lineHeight = getFontSize(font) * 1.3;
  let maxWidth = 0;
  lines.forEach(line => {
    const m = context.measureText(line);
    if (m.width > maxWidth) maxWidth = m.width;
  });
  const textWidth = Math.ceil(maxWidth);
  const textHeight = Math.ceil(lineHeight * lines.length);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line, i) => {
    context.fillText(line, canvas.width / 2, canvas.height / 2 - (lines.length - 1) * lineHeight / 2 + i * lineHeight);
  });
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor, font }) {
    autoBind(this);
    this.gl = gl; this.plane = plane; this.renderer = renderer; this.text = text; this.textColor = textColor; this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      depthTest: true, depthWrite: true,
      vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragment: `precision highp float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 color=texture2D(tMap,vUv);if(color.a<0.1)discard;gl_FragColor=color;}`,
      uniforms: { tMap: { value: texture } }, transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    this.aspect = width / height;
    this.mesh.position.z = 0.1;
    this.mesh.setParent(this.plane);
  }
  updateLayout(basePlaneHeight) {
    // The title lives inside the image plane, so use local plane coordinates.
    // World-size values here would be scaled twice and push the text off canvas.
    const textHeight = 0.15;
    this.mesh.scale.set(textHeight * this.aspect, textHeight, 1);
    this.mesh.position.set(0, -0.5 - textHeight * 0.5 - 0.05, 0.1);
  }
}

class Media { itemScale = 0.5;
  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius, font, itemScale }) {
    this.extra = 0; this.geometry = geometry; this.gl = gl; this.image = image; this.index = index; this.length = length;
    this.renderer = renderer; this.scene = scene; this.screen = screen; this.text = text; this.viewport = viewport;
    this.bend = bend; this.textColor = textColor; this.borderRadius = borderRadius; this.font = font; this.itemScale = itemScale || 0.5;
    this.createShader(); this.createMesh(); this.createTitle(); this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: true, depthWrite: true,
      vertex: `precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform float uTime;uniform float uSpeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z=0.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
      fragment: `precision highp float;uniform vec2 uImageSizes;uniform vec2 uPlaneSizes;uniform sampler2D tMap;uniform float uBorderRadius;varying vec2 vUv;float roundedBoxSDF(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}void main(){vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);vec4 color=texture2D(tMap,uv);float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);float edgeSmooth=0.002;float alpha=1.0-smoothstep(-edgeSmooth,edgeSmooth,d);gl_FragColor=vec4(color.rgb,alpha);}`,
      uniforms: { tMap: { value: texture }, uPlaneSizes: { value: [0, 0] }, uImageSizes: { value: [0, 0] }, uSpeed: { value: 0 }, uTime: { value: 100 * Math.random() }, uBorderRadius: { value: this.borderRadius } },
      transparent: true
    });
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = this.image;
    img.onload = () => { texture.image = img; this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]; };
  }
  createMesh() { this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program }); this.plane.setParent(this.scene); }
  createTitle() { this.title = new Title({ gl: this.gl, plane: this.plane, renderer: this.renderer, text: this.text, textColor: this.textColor, font: this.font }); }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) { this.plane.position.y = this.imageBaseY; this.plane.rotation.z = 0; }
    else {
      const B_abs = Math.abs(this.bend); const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) { this.plane.position.y = -arc; this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R); }
      else { this.plane.position.y = arc; this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R); }
    }
    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) { this.extra -= this.widthTotal; this.isBefore = this.isAfter = false; }
    if (direction === 'left' && this.isAfter) { this.extra += this.widthTotal; this.isBefore = this.isAfter = false; }
    const targetScale = this.isHovered ? 1.2 : 1;
    this.hoverScale = lerp(this.hoverScale || 1, targetScale, 0.18);
    this.plane.scale.set(this.baseScaleX * this.hoverScale, this.baseScaleY * this.hoverScale, 1);
    this.plane.position.z = this.isHovered ? 0.2 : 0;
    this.title.updateLayout(this.baseScaleY);
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) { this.viewport = viewport; }
    this.scale = this.screen.height / 1500 * (this.itemScale || 0.5);
    this.baseScaleY = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.baseScaleX = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    // Reserve space below every poster for the two-line black title.
    this.imageBaseY = this.baseScaleY * 0.18;
    this.hoverScale = 1;
    this.plane.scale.y = this.baseScaleY;
    this.plane.scale.x = this.baseScaleX;
    this.title.updateLayout(this.baseScaleY);
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(container, { items, bend = 0, textColor = '#ffffff', borderRadius = 0.05, font, scrollSpeed = 2, scrollEase = 0.05, itemScale = 0.5, autoScroll = 0 }) {
    this.container = container; this.scrollSpeed = scrollSpeed; this.autoScroll = autoScroll;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.createRenderer(); this.createCamera(); this.createScene();
    this.onResize(); this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font, itemScale);
    this.update(); this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl; this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() { this.camera = new Camera(this.gl); this.camera.fov = 45; this.camera.position.z = 20; }
  createScene() { this.scene = new Transform(); }
  createGeometry() { this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 }); }
  createMedias(items, bend, textColor, borderRadius, font, itemScale) {
    this.mediasImages = items.concat(items);
    this.medias = this.mediasImages.map((data, index) => new Media({
      geometry: this.planeGeometry, gl: this.gl, image: data.image, index, length: this.mediasImages.length,
      renderer: this.renderer, scene: this.scene, screen: this.screen, text: data.text,
      viewport: this.viewport, bend, textColor, borderRadius, font, itemScale
    }));
  }
  onPointerDown(e) {
    this.isDown = true;
    this.pointerId = e.pointerId;
    this.scroll.position = this.scroll.current;
    this.start = e.clientX;
    this.container.setPointerCapture?.(e.pointerId);
  }
  onPointerMove(e) {
    this.updateHoveredMedia(e.clientX);
    if (!this.isDown || e.pointerId !== this.pointerId) return;
    const distance = (this.start - e.clientX) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onPointerUp(e) {
    if (e.pointerId !== this.pointerId) return;
    this.isDown = false;
    this.container.releasePointerCapture?.(e.pointerId);
    this.pointerId = null;
  }
  updateHoveredMedia(clientX) {
    const rect = this.container.getBoundingClientRect();
    const pointerX = ((clientX - rect.left) / rect.width) * this.viewport.width - this.viewport.width / 2;
    let closest = null;
    let closestDistance = Infinity;

    this.medias.forEach((media) => {
      const distance = Math.abs(media.plane.position.x - pointerX);
      if (distance < media.baseScaleX / 2 && distance < closestDistance) {
        closest = media;
        closestDistance = distance;
      }
    });

    this.medias.forEach((media) => { media.isHovered = media === closest; });
  }
  onPointerEnter(e) { this.isHovered = true; this.updateHoveredMedia(e.clientX); }
  onPointerLeave() { this.isHovered = false; this.medias.forEach((media) => { media.isHovered = false; }); }
  onKeyDown(e) { switch(e.key) { case 'ArrowRight': e.preventDefault(); this.scroll.target += this.scrollSpeed * 5; this.onCheckDebounce(); break; case 'ArrowLeft': e.preventDefault(); this.scroll.target -= this.scrollSpeed * 5; this.onCheckDebounce(); break; case 'Home': e.preventDefault(); this.scroll.target = 0; this.onCheckDebounce(); break; } }
  onCheck() { if (!this.medias || !this.medias[0]) return; const width = this.medias[0].width; const itemIndex = Math.round(Math.abs(this.scroll.target) / width); const item = width * itemIndex; this.scroll.target = this.scroll.target < 0 ? -item : item; }
  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
  }
  update(timestamp = 0) {
    const elapsed = this.lastTimestamp ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.1) : 0;
    this.lastTimestamp = timestamp;
    if (this.autoScroll && !this.isDown && !this.isHovered) {
      const worldUnitsPerPixel = this.viewport.width / this.screen.width;
      this.scroll.target += this.autoScroll * elapsed * worldUnitsPerPixel;
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    var direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) this.medias.forEach(function(media) { media.update(this.scroll, direction); }.bind(this));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnPointerEnter = this.onPointerEnter.bind(this);
    this.boundOnPointerLeave = this.onPointerLeave.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    this.container.addEventListener('pointerdown', this.boundOnPointerDown);
    this.container.addEventListener('pointermove', this.boundOnPointerMove);
    this.container.addEventListener('pointerup', this.boundOnPointerUp);
    this.container.addEventListener('pointercancel', this.boundOnPointerUp);
    this.container.addEventListener('pointerenter', this.boundOnPointerEnter);
    this.container.addEventListener('pointerleave', this.boundOnPointerLeave);
    this.container?.addEventListener('keydown', this.boundOnKeyDown);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('pointerdown', this.boundOnPointerDown);
    this.container.removeEventListener('pointermove', this.boundOnPointerMove);
    this.container.removeEventListener('pointerup', this.boundOnPointerUp);
    this.container.removeEventListener('pointercancel', this.boundOnPointerUp);
    this.container.removeEventListener('pointerenter', this.boundOnPointerEnter);
    this.container.removeEventListener('pointerleave', this.boundOnPointerLeave);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    if (this.container) this.container.removeEventListener('keydown', this.boundOnKeyDown);
  }
}

export default function CircularGallery({ items, bend = 0, textColor = '#ffffff', borderRadius = 0.05, font = 'bold 28px Microsoft YaHei', scrollSpeed = 2, scrollEase = 0.05, itemScale = 0.5, autoScroll = 0 }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, itemScale, autoScroll });
    return () => { app.destroy(); };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, itemScale, autoScroll]);
  return <div className="circular-gallery" ref={containerRef} tabIndex={0} role="region" aria-label="TV program gallery" />;
}
