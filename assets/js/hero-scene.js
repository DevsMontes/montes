import * as THREE from 'three';
import { SVGLoader } from '../vendor/three/SVGLoader.js';
import { FontLoader } from '../vendor/three/FontLoader.js';
import { TextGeometry } from '../vendor/three/TextGeometry.js';

const hero = document.querySelector('[data-cinematic-hero]');
const canvas = document.querySelector('[data-three-canvas]');
if (!hero || !canvas) throw new Error('Cena do hero não encontrada.');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const mobile = window.matchMedia('(max-width: 720px)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

if (reducedMotion.matches) {
  hero.classList.add('hero-cena-estatica');
} else {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile.matches, powerPreference: 'high-performance' });
  } catch {
    hero.classList.add('hero-cena-estatica');
  }

  if (renderer) {
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07111d, 0.052);
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 60);
    camera.position.set(0, 0.1, 9.4);

    const stage = new THREE.Group();
    const logo = new THREE.Group();
    stage.add(logo);
    scene.add(stage);

    const hemi = new THREE.HemisphereLight(0x91c8ff, 0x06101b, 1.45);
    const key = new THREE.SpotLight(0xc6e6ff, 75, 24, Math.PI / 5, 0.65, 1.2);
    key.position.set(-4.5, 5.2, 7);
    const rim = new THREE.PointLight(0x7558ff, 42, 18, 1.5);
    rim.position.set(5, -1, 4);
    const cold = new THREE.PointLight(0x4cbcff, 28, 15, 1.6);
    cold.position.set(-4, -2, 3);
    scene.add(hemi, key, rim, cold);

    const materialFor = (color) => new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.76,
      roughness: 0.24,
      clearcoat: 0.58,
      clearcoatRoughness: 0.2,
      reflectivity: 0.82,
      side: THREE.DoubleSide
    });
    const silver = materialFor(0xe8eef4);
    const cyan = materialFor(0x49c3ef);
    const violet = materialFor(0x8f5ce8);

    const addExtrudedMark = (svgData) => {
      const mark = new THREE.Group();
      svgData.paths.forEach((path, pathIndex) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 24,
            bevelEnabled: true,
            bevelThickness: 5,
            bevelSize: 3.2,
            bevelSegments: mobile.matches ? 2 : 4,
            curveSegments: mobile.matches ? 4 : 8
          });
          geometry.computeVertexNormals();
          const mesh = new THREE.Mesh(geometry, pathIndex === 2 ? violet : cyan);
          mark.add(mesh);
        });
      });
      mark.scale.set(0.0076, -0.0076, 0.0076);
      const bounds = new THREE.Box3().setFromObject(mark);
      const center = bounds.getCenter(new THREE.Vector3());
      mark.position.sub(center);
      mark.position.y = 1.55;
      logo.add(mark);
      return mark;
    };

    const addWordmark = (font) => {
      const createText = (text, size, depth, y, material) => {
        const geometry = new TextGeometry(text, {
          font,
          size,
          depth,
          curveSegments: mobile.matches ? 3 : 6,
          bevelEnabled: true,
          bevelThickness: 0.035,
          bevelSize: 0.018,
          bevelSegments: mobile.matches ? 1 : 3
        });
        geometry.center();
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = y;
        logo.add(mesh);
      };
      createText('MONTES', 0.61, 0.18, -1.82, silver);
      createText('D E V E L O P E R S', 0.13, 0.1, -2.3, cyan);
    };

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = mobile.matches ? 65 : 180;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 14;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0xb9d9f2, size: mobile.matches ? 0.018 : 0.024, transparent: true, opacity: 0.34, depthWrite: false }));
    scene.add(particles);

    const glowTexture = (() => {
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = textureCanvas.height = 128;
      const context = textureCanvas.getContext('2d');
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(114,173,230,.24)');
      gradient.addColorStop(0.45, 'rgba(57,111,175,.09)');
      gradient.addColorStop(1, 'rgba(5,13,23,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(textureCanvas);
    })();
    const mist = Array.from({ length: mobile.matches ? 2 : 4 }, (_, index) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, transparent: true, opacity: 0.28, depthWrite: false }));
      sprite.scale.set(5.5 + index, 2.5 + index * 0.45, 1);
      sprite.position.set(-1 + index * 1.2, -1.4 + index * 0.45, -2 - index);
      scene.add(sprite);
      return sprite;
    });

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const clock = new THREE.Clock();
    let progress = 0;
    let visible = true;
    let frame = 0;
    let ready = false;

    const layout = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.15 : 1.65));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const updateScroll = () => {
      const rect = hero.getBoundingClientRect();
      progress = clamp(-rect.top / Math.max(1, rect.height - innerHeight), 0, 1);
      hero.style.setProperty('--hero-progress', progress.toFixed(4));
    };

    const render = () => {
      frame = 0;
      if (!visible || document.hidden || !ready) return;
      const elapsed = clock.getElapsedTime();
      const intro = clamp(elapsed / 1.8, 0, 1);
      const easedIntro = 1 - Math.pow(1 - intro, 3);
      pointer.lerp(pointerTarget, 0.045);

      const mobileView = mobile.matches;
      stage.position.x = mobileView ? -0.15 + progress * 0.15 : 2.15 + progress * 0.55;
      stage.position.y = mobileView ? -1.18 + progress * 0.16 : -0.38 + progress * 0.16;
      stage.position.z = -1.6 * (1 - easedIntro) + progress * 0.55;
      stage.scale.setScalar((mobileView ? 0.24 : 0.56) * (0.72 + easedIntro * 0.28));
      stage.rotation.x = -0.07 + progress * 0.16 - pointer.y * 0.035;
      stage.rotation.y = -0.5 * (1 - easedIntro) + progress * 0.48 + pointer.x * 0.075 + Math.sin(elapsed * 0.28) * 0.025;
      stage.rotation.z = -0.035 + Math.sin(elapsed * 0.22) * 0.012;

      camera.position.z = 9.4 - progress * 1.15;
      camera.position.x = progress * -0.35;
      camera.lookAt(0.25, -0.15, 0);
      key.position.x = -4.5 + Math.sin(elapsed * 0.42) * 2.1 + pointer.x;
      rim.position.y = -1 + Math.cos(elapsed * 0.34) * 1.2;
      particles.rotation.y = elapsed * 0.012 + progress * 0.08;
      particles.position.y = progress * 0.35;
      mist.forEach((sprite, index) => {
        sprite.position.x += Math.sin(elapsed * 0.08 + index) * 0.0008;
        sprite.material.opacity = 0.19 + Math.sin(elapsed * 0.2 + index) * 0.045;
      });

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (!frame && visible && ready && !document.hidden) frame = requestAnimationFrame(render);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    Promise.all([
      new SVGLoader().loadAsync('assets/models/montes-mark.svg'),
      new FontLoader().loadAsync('assets/vendor/three/helvetiker_bold.typeface.json')
    ]).then(([svg, font]) => {
      addExtrudedMark(svg);
      addWordmark(font);
      ready = true;
      hero.classList.add('hero-cena-pronta');
      hero.dataset.sceneReady = 'true';
      layout();
      updateScroll();
      renderer.render(scene, camera);
      start();
    }).catch(() => {
      hero.classList.add('hero-cena-estatica');
      hero.dataset.sceneError = 'assets';
    });

    hero.addEventListener('pointermove', (event) => {
      if (!finePointer.matches) return;
      pointerTarget.set(event.clientX / innerWidth * 2 - 1, -(event.clientY / innerHeight * 2 - 1));
    });
    hero.addEventListener('pointerleave', () => pointerTarget.set(0, 0));
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', () => {
      layout();
      updateScroll();
    }, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }, { rootMargin: '12% 0px' }).observe(hero);
  }
}
