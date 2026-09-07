import * as THREE from 'three';
import { SVGLoader } from '../vendor/three/SVGLoader.js';

const hero = document.querySelector('[data-cinematic-hero]');
const canvas = hero?.querySelector('[data-three-canvas]');
if (!hero || !canvas) throw new Error('Cena do hero não encontrada.');

const media = {
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
  compact: window.matchMedia('(max-width: 1080px)'),
  mobile: window.matchMedia('(max-width: 720px)')
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

class MontesHeroScene {
  constructor(element, targetCanvas) {
    this.hero = element;
    this.canvas = targetCanvas;
    this.clock = new THREE.Clock();
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.pointerVelocity = new THREE.Vector2();
    this.progress = 0;
    this.visible = true;
    this.ready = false;
    this.frame = 0;
    this.startedAt = performance.now();
    this.pieces = [];
    this.disposables = [];
    this.abortController = new AbortController();
    this.assemble = this.shouldAssemble();
  }

  shouldAssemble() {
    try {
      const key = 'montes-hero-assembled-v1';
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, 'true');
      return true;
    } catch {
      return true;
    }
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: !media.mobile.matches,
      powerPreference: 'high-performance'
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.01;
  }

  createEnvironment() {
    const environment = new THREE.Scene();
    environment.background = new THREE.Color(0x07111d);
    const panels = [
      [-3.5, 3.2, 4, 0xa8c9df, 2.8],
      [4.2, 0.8, 2.5, 0x245d91, 2.1],
      [0, -3.8, 3, 0x0b263c, 3.2]
    ].map(([x, y, z, color, scale]) => {
      const geometry = new THREE.PlaneGeometry(scale, scale);
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const panel = new THREE.Mesh(geometry, material);
      panel.position.set(x, y, z);
      panel.lookAt(0, 0, 0);
      environment.add(panel);
      return { geometry, material };
    });
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const target = pmrem.fromScene(environment, 0.11);
    this.scene.environment = target.texture;
    panels.forEach(({ geometry, material }) => {
      geometry.dispose();
      material.dispose();
    });
    pmrem.dispose();
    this.disposables.push(target);
  }

  createLights() {
    this.hemi = new THREE.HemisphereLight(0x9abbd1, 0x06101a, 0.82);
    this.key = new THREE.SpotLight(0xc8def0, 47, 24, Math.PI / 5.8, 0.76, 1.4);
    this.key.position.set(-4.2, 5.4, 7.2);
    this.rim = new THREE.PointLight(0x4d8fc4, 18, 17, 1.7);
    this.rim.position.set(4.8, 0.5, 3.3);
    this.fill = new THREE.PointLight(0x183e66, 12, 15, 1.9);
    this.fill.position.set(-3.6, -2.2, 3);
    this.scene.add(this.hemi, this.key, this.rim, this.fill);
  }

  createMaterials() {
    const anodized = (color, roughness) => {
      const material = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: media.mobile.matches ? 0.085 : 0.025,
        metalness: 0.68,
        roughness,
        clearcoat: 0.16,
        clearcoatRoughness: 0.48,
        envMapIntensity: 0.72,
        side: THREE.DoubleSide
      });
      this.disposables.push(material);
      return material;
    };
    this.materials = [
      anodized(0x176b9d, 0.34),
      anodized(0x126f9e, 0.39),
      anodized(0x28538b, 0.37)
    ];
  }

  createLogo(svgData) {
    this.logo = new THREE.Group();
    this.stage.add(this.logo);
    svgData.paths.forEach((path, pathIndex) => {
      SVGLoader.createShapes(path).forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 17,
          bevelEnabled: true,
          bevelThickness: 2.6,
          bevelSize: 2.15,
          bevelSegments: media.mobile.matches ? 2 : 4,
          curveSegments: media.mobile.matches ? 4 : 7
        });
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, this.materials[pathIndex] || this.materials[0]);
        mesh.userData.target = new THREE.Vector3();
        const offsets = [
          new THREE.Vector3(0.08, 0.24, -0.1),
          new THREE.Vector3(-0.3, -0.06, 0.13),
          new THREE.Vector3(0.27, -0.11, 0.16)
        ];
        mesh.userData.offset = offsets[pathIndex] || new THREE.Vector3();
        this.pieces.push(mesh);
        this.logo.add(mesh);
        this.disposables.push(geometry);
      });
    });
    this.logo.scale.set(0.0076, -0.0076, 0.0076);
    const bounds = new THREE.Box3().setFromObject(this.logo);
    const center = bounds.getCenter(new THREE.Vector3());
    this.logo.position.sub(center);
  }

  createAtmosphere() {
    const particleCount = media.mobile.matches ? 34 : 92;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 14;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xb7cddd,
      size: media.mobile.matches ? 0.013 : 0.017,
      transparent: true,
      opacity: 0.2,
      depthWrite: false
    });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    this.disposables.push(geometry, material);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d');
    const gradient = context.createRadialGradient(128, 64, 4, 128, 64, 116);
    gradient.addColorStop(0, 'rgba(0,8,16,.44)');
    gradient.addColorStop(0.46, 'rgba(0,8,16,.2)');
    gradient.addColorStop(1, 'rgba(0,8,16,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 128);
    const texture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.5, depthWrite: false });
    this.contactShadow = new THREE.Sprite(shadowMaterial);
    this.contactShadow.scale.set(4.8, 2.1, 1);
    this.contactShadow.position.set(0.08, -1.32, -0.32);
    this.stage.add(this.contactShadow);
    this.disposables.push(texture, shadowMaterial);
  }

  async init() {
    this.createRenderer();
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07111d, 0.043);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this.camera.position.set(0, 0.1, 9.8);
    this.stage = new THREE.Group();
    this.scene.add(this.stage);
    this.createEnvironment();
    this.createLights();
    this.createMaterials();
    this.createAtmosphere();
    const svg = await new SVGLoader().loadAsync('assets/models/montes-mark.svg');
    this.createLogo(svg);
    this.ready = true;
    this.hero.classList.add('hero-cena-pronta');
    this.hero.dataset.sceneReady = 'true';
    this.layout();
    this.updateScroll();
    this.bindEvents();
    this.renderer.render(this.scene, this.camera);
    this.start();
  }

  layout() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (!width || !height) return;
    const dprLimit = media.mobile.matches ? 1.05 : 1.45;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprLimit));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateScroll() {
    const rect = this.hero.getBoundingClientRect();
    this.progress = clamp(-rect.top / Math.max(1, rect.height - innerHeight), 0, 1);
    this.hero.style.setProperty('--hero-progress', this.progress.toFixed(4));
  }

  updatePointer() {
    const spring = 0.035;
    const damping = 0.84;
    this.pointerVelocity.x = (this.pointerVelocity.x + (this.pointerTarget.x - this.pointer.x) * spring) * damping;
    this.pointerVelocity.y = (this.pointerVelocity.y + (this.pointerTarget.y - this.pointer.y) * spring) * damping;
    this.pointer.add(this.pointerVelocity);
  }

  render = () => {
    this.frame = 0;
    if (!this.visible || document.hidden || !this.ready) return;
    const elapsed = this.clock.getElapsedTime();
    const introElapsed = (performance.now() - this.startedAt) / 1000;
    const intro = easeOutCubic(clamp(introElapsed / 1.15, 0, 1));
    const assembly = this.assemble ? easeOutCubic(clamp((introElapsed - 0.12) / 1.05, 0, 1)) : 1;
    this.updatePointer();

    this.pieces.forEach((piece) => {
      piece.position.copy(piece.userData.target).addScaledVector(piece.userData.offset, 1 - assembly);
      piece.rotation.z = (1 - assembly) * (piece.userData.offset.x * 0.1);
    });

    const isMobile = media.mobile.matches;
    const isCompact = media.compact.matches;
    const compactRatio = clamp((innerWidth - 768) / 312, 0, 1);
    const restingScale = isMobile ? 0.255 : isCompact ? 0.31 + compactRatio * 0.07 : 0.455;
    const float = Math.sin(elapsed * 0.62) * 0.018;
    this.stage.position.x = isMobile ? 0.08 : isCompact ? 1.15 + compactRatio * 0.55 : 2.62 + this.progress * 0.18;
    this.stage.position.y = isMobile ? -1.32 + float : isCompact ? -0.28 + float : -0.14 + float + this.progress * 0.1;
    this.stage.position.z = -0.42 * (1 - intro) + this.progress * 0.28;
    this.stage.scale.setScalar(restingScale * (0.92 + intro * 0.08));
    this.stage.rotation.x = -0.055 + this.progress * 0.075 - this.pointer.y * 0.012;
    this.stage.rotation.y = -0.085 + this.progress * 0.14 + this.pointer.x * 0.028;
    this.stage.rotation.z = -0.012 + Math.sin(elapsed * 0.38) * 0.004;

    this.camera.position.x = -this.progress * 0.16 + this.pointer.x * 0.055;
    this.camera.position.y = 0.1 + this.pointer.y * 0.035;
    this.camera.position.z = 9.8 - this.progress * 0.62;
    this.camera.lookAt(0.18, -0.12, 0);

    const lightBreath = 1 + Math.sin(elapsed * 0.48) * 0.025;
    this.key.intensity = 47 * intro * lightBreath;
    this.rim.intensity = 18 * intro;
    this.fill.intensity = 12 * intro;
    this.key.position.x = -4.2 + this.pointer.x * 0.65 + this.progress * 0.35;
    this.key.position.y = 5.4 + this.pointer.y * 0.35;
    this.rim.position.y = 0.5 + Math.sin(elapsed * 0.32) * 0.12;
    this.contactShadow.material.opacity = 0.38 + this.progress * 0.07;
    this.particles.rotation.y = elapsed * 0.003 + this.progress * 0.035;
    this.particles.position.y = this.progress * 0.12;

    this.hero.style.setProperty('--hero-pointer-x', this.pointer.x.toFixed(4));
    this.hero.style.setProperty('--hero-pointer-y', this.pointer.y.toFixed(4));
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.render);
  };

  start() {
    if (!this.frame && this.visible && this.ready && !document.hidden) this.frame = requestAnimationFrame(this.render);
  }

  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  bindEvents() {
    const { signal } = this.abortController;
    this.hero.addEventListener('pointermove', (event) => {
      if (!media.finePointer.matches) return;
      const rect = this.hero.getBoundingClientRect();
      this.pointerTarget.set(
        clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1),
        clamp(-((event.clientY - rect.top) / innerHeight * 2 - 1), -1, 1)
      );
    }, { signal, passive: true });
    this.hero.addEventListener('pointerleave', () => this.pointerTarget.set(0, 0), { signal });
    window.addEventListener('scroll', () => this.updateScroll(), { signal, passive: true });
    window.addEventListener('resize', () => {
      this.layout();
      this.updateScroll();
    }, { signal, passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? this.stop() : this.start(), { signal });
    window.addEventListener('pagehide', () => this.dispose(), { signal, once: true });
    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.visible ? this.start() : this.stop();
    }, { rootMargin: '10% 0px' });
    this.observer.observe(this.hero);
  }

  dispose() {
    this.stop();
    this.observer?.disconnect();
    this.abortController.abort();
    this.disposables.forEach((resource) => resource.dispose?.());
    this.renderer?.dispose();
  }
}

if (media.reduced.matches) {
  hero.classList.add('hero-cena-estatica');
} else {
  const scene = new MontesHeroScene(hero, canvas);
  scene.init().catch(() => {
    scene.dispose();
    hero.classList.add('hero-cena-estatica');
    hero.dataset.sceneError = 'assets';
  });
}
