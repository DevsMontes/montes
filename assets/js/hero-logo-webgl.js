(() => {
  'use strict';

  const scene = document.querySelector('[data-logo-scene]');
  const canvas = document.querySelector('[data-logo-canvas]');
  const hero = document.querySelector('[data-hero]');
  if (!scene || !canvas || !hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance'
  });
  if (!gl) {
    scene.dataset.logoError = 'webgl-indisponivel';
    return;
  }

  const vertexSource = `
    precision mediump float;
    attribute vec2 aPosition;
    attribute vec2 aUv;
    uniform float uTime;
    uniform float uLayer;
    uniform float uScroll;
    uniform vec2 uPointer;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vec2 p = aPosition;
      float calm = 1.0 - uLayer;
      float wave = sin(aUv.x * 7.2 + uTime * .72) * .014;
      wave += cos(aUv.y * 8.8 - uTime * .52) * .009;
      wave *= sin(aUv.y * 3.14159265) * calm;

      float angleY = uPointer.x * .16 + sin(uTime * .19) * .025;
      float angleX = -uPointer.y * .11 + cos(uTime * .23) * .018 - uScroll * .055;
      float z = wave - uLayer * .085;

      float cy = cos(angleY);
      float sy = sin(angleY);
      vec3 rotated = vec3(p.x * cy + z * sy, p.y, -p.x * sy + z * cy);
      float cx = cos(angleX);
      float sx = sin(angleX);
      rotated = vec3(rotated.x, rotated.y * cx - rotated.z * sx, rotated.y * sx + rotated.z * cx);

      float perspective = 1.0 / (1.0 + rotated.z * .2);
      vec2 depthOffset = vec2(-.018, .024) * uLayer;
      vec2 drift = vec2(sin(uTime * .17), cos(uTime * .21)) * .008 * calm;
      gl_Position = vec4((rotated.xy * perspective * .91) + depthOffset + drift, 0.0, 1.0);
      vUv = aUv;
      vWave = wave;
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uLayer;
    uniform vec2 uPointer;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vec4 texel = texture2D(uTexture, vUv);
      float luminance = max(texel.r, max(texel.g, texel.b));
      float mask = smoothstep(.025, .16, luminance);
      if (mask < .01) discard;

      float sweepPosition = fract(uTime * .075 + uPointer.x * .08);
      float sweep = 1.0 - smoothstep(.0, .19, abs((vUv.x * .72 + vUv.y * .28) - sweepPosition));
      float edgeLight = pow(max(0.0, 1.0 - abs(vUv.y - .5) * 2.0), 2.0);
      vec3 cobalt = vec3(.07, .23, .58);
      vec3 violet = vec3(.34, .12, .68);
      vec3 depthColor = mix(cobalt, violet, vUv.x);
      vec3 face = texel.rgb * (1.02 + sweep * .28 + abs(vWave) * 4.0);
      vec3 color = mix(depthColor * (.18 + edgeLight * .12), face, 1.0 - uLayer);
      float alpha = mask * mix(.28, 1.0, 1.0 - uLayer);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      scene.dataset.logoError = gl.getShaderInfoLog(shader) || 'shader-invalido';
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    scene.dataset.logoError = gl.getProgramInfoLog(program) || 'programa-invalido';
    return;
  }
  gl.useProgram(program);

  const columns = innerWidth <= 720 ? 24 : 42;
  const rows = innerWidth <= 720 ? 16 : 28;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= columns; x += 1) {
      const u = x / columns;
      const v = y / rows;
      positions.push(u * 2 - 1, 1 - v * 2);
      uvs.push(u, v);
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const a = y * (columns + 1) + x;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const bindAttribute = (name, values) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  };
  bindAttribute('aPosition', positions);
  bindAttribute('aUv', uvs);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  const uniforms = {
    time: gl.getUniformLocation(program, 'uTime'),
    layer: gl.getUniformLocation(program, 'uLayer'),
    scroll: gl.getUniformLocation(program, 'uScroll'),
    pointer: gl.getUniformLocation(program, 'uPointer'),
    texture: gl.getUniformLocation(program, 'uTexture')
  };
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(uniforms.texture, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let visible = true;
  let frame = 0;
  let startedAt = performance.now();

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const density = Math.min(devicePixelRatio || 1, innerWidth <= 720 ? 1.15 : 1.6);
    const width = Math.max(2, Math.round(bounds.width * density));
    const height = Math.max(2, Math.round(bounds.height * density));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  const draw = (now = performance.now()) => {
    frame = 0;
    resize();
    const isReduced = reducedMotion.matches;
    pointer.x += (pointer.targetX - pointer.x) * (isReduced ? 1 : .065);
    pointer.y += (pointer.targetY - pointer.y) * (isReduced ? 1 : .065);
    const progress = Number.parseFloat(getComputedStyle(hero).getPropertyValue('--hero-progress')) || 0;
    const time = isReduced ? 0 : (now - startedAt) / 1000;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.scroll, progress);
    gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
    const layers = innerWidth <= 720 ? 4 : 7;
    for (let layer = layers; layer >= 0; layer -= 1) {
      gl.uniform1f(uniforms.layer, layer / Math.max(1, layers));
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
    if (visible && !isReduced) frame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (!visible || frame || reducedMotion.matches) return;
    frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const image = new Image();
  image.decoding = 'async';
  image.addEventListener('load', () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    scene.classList.add('webgl-ativo');
    scene.dataset.logoReady = 'true';
    startedAt = performance.now();
    draw();
  }, { once: true });
  image.addEventListener('error', () => {
    scene.dataset.logoError = 'textura-indisponivel';
  }, { once: true });
  image.src = 'logomontes.png';

  hero.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const bounds = scene.getBoundingClientRect();
    pointer.targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointer.targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
  });
  hero.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { rootMargin: '12% 0px' }).observe(hero);
  reducedMotion.addEventListener?.('change', () => {
    stop();
    draw();
  });
  window.addEventListener('resize', () => {
    resize();
    if (reducedMotion.matches) draw();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
})();
