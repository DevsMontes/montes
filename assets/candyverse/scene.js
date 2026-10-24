import * as T from "./vendor/three.module.js";
import { createModelLibrary } from "./models.js";
import { moods } from "./data.js";
export async function createEngine(state, reduced, onStatus = () => {}) {
  const startedAt = performance.now(),
    cleanups = [],
    abort = new AbortController();
  const cleanup = () => {
    abort.abort();
    for (const fn of cleanups.reverse()) {
      try {
        fn();
      } catch {}
    }
  };
  try {
    // Calibrate the browser's refresh cadence before initializing GPU work.
    const cadence = [];
    let previous = 0;
    await new Promise((resolve) => {
      function tick(t) {
        if (previous) cadence.push(t - previous);
        previous = t;
        if (cadence.length < 8) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
    const targetMS = [...cadence].sort((a, b) => a - b)[
      Math.floor(cadence.length / 2)
    ];
    const library = createModelLibrary();
    cleanups.push(() => library.dispose());
    const { createCandy, createBowl } = library;
    const renderer = new T.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    cleanups.push(() => {
      library.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    });
    let ratio = Math.min(devicePixelRatio, 1.75);
    renderer.setPixelRatio(ratio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.domElement.className = "gpu-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    const environment = new T.Scene();
    environment.background = new T.Color("#b8aab5");
    const envGeo = new T.PlaneGeometry(12, 12);
    const white = new T.MeshBasicMaterial({
      color: new T.Color(1.8, 1.7, 1.6),
      side: T.DoubleSide,
    });
    for (const pos of [
      [-5, 4, 3],
      [5, 3, 1],
      [0, 6, -3],
    ]) {
      const card = new T.Mesh(envGeo, white);
      card.position.set(...pos);
      card.lookAt(0, 0, 0);
      environment.add(card);
    }
    cleanups.push(() => {
      envGeo.dispose();
      white.dispose();
    });
    const pmrem = new T.PMREMGenerator(renderer);
    cleanups.push(() => pmrem.dispose());
    const envTarget = pmrem.fromScene(environment, 0.04, 0.1, 100, {
      size: 64,
    });
    cleanups.push(() => envTarget.dispose());

    const slots = [...document.querySelectorAll("[data-stage]")].map((el) => {
      const scene = new T.Scene();
      scene.environment = envTarget.texture;
      const ambient = new T.AmbientLight("#fff2ea", 0.8);
      scene.add(ambient);
      const key = new T.DirectionalLight("#fff5de", 3);
      key.position.set(-3, 5, 6);
      scene.add(key);
      const fill = new T.DirectionalLight("#ffc4e9", 1.4);
      fill.position.set(4, 1, -2);
      scene.add(fill);
      const camera = new T.PerspectiveCamera(34, 1, 0.1, 50);
      camera.position.set(0, 0, 10);
      const root = new T.Group();
      scene.add(root);
      return { el, scene, camera, root, key, fill, visible: false };
    });
    const hero = slots[0],
      mix = slots[1],
      product = slots[2];
    const heroPositions = [
      [-0.65, 0.25, 0.65],
      [0.85, 1.35, -0.6],
      [0.9, -0.85, 0.2],
      [-1, -1.35, -0.4],
    ];
    const heroRotations = [
      [0, 0.2, -0.4],
      [0.15, -0.3, -0.32],
      [0.25, -0.2, -0.18],
      [0.1, 0.3, 0.25],
    ];
    ["worm", "teeth", "kiss", "berry"].forEach((id, i) => {
      const candy = createCandy(id);
      candy.position.set(...heroPositions[i]);
      candy.rotation.set(...heroRotations[i]);
      candy.scale.multiplyScalar(
        i === 0 ? 1.3 : i === 1 ? 0.58 : i === 2 ? 0.78 : 0.48,
      );
      candy.userData.origin = candy.position.clone();
      candy.userData.angle = candy.rotation.clone();
      hero.root.add(candy);
    });
    let mixCandies = [],
      currentProduct = null,
      frame = 0,
      disposed = false,
      visible = true,
      ready = false,
      contextLost = false,
      dirty = true,
      lastTime = 0,
      lastDraw = 0,
      activeUntil = 0,
      draws = 0,
      renderMS = 0,
      qualityWindow = [],
      healthySamples = 0,
      frameTimes = [],
      initMS = 0;
    const bowl = createBowl();
    bowl.position.y = -0.5;
    mix.root.add(bowl);
    function release(object) {
      library.release(object);
    }
    function updateMix() {
      mixCandies.forEach((c) => {
        mix.root.remove(c);
        release(c);
      });
      mixCandies = [];
      const mood = moods[state.mood];
      mix.fill.color.set(mood.light);
      mix.key.intensity = state.mood === "intense" ? 4 : 3;
      state.items.forEach((id, i) => {
        const c = createCandy(id);
        c.scale.multiplyScalar(state.phase === "result" ? 0.6 : 0.39);
        const arrangements = {
          1: [[0, -0.1, 0]],
          2: [
            [-0.6, -0.05, 0.1],
            [0.65, 0.2, -0.2],
          ],
          3: [
            [-0.9, -0.05, 0.2],
            [0, 0.4, -0.35],
            [0.9, -0.05, 0.2],
          ],
          4: [
            [-0.85, -0.15, 0.3],
            [-0.4, 0.5, -0.3],
            [0.4, -0.15, 0.3],
            [0.85, 0.5, -0.3],
          ],
        };
        const slot =
          arrangements[state.items.length][
            (i + mood.seed) % state.items.length
          ];
        const pos =
          state.phase === "result"
            ? new T.Vector3(
                (i - (state.items.length - 1) / 2) * 1.25,
                0.25 + Math.sin(i * 2 + mood.seed) * 0.5,
                i % 2 ? 0.15 : 0.5,
              )
            : new T.Vector3(...slot);
        c.position.copy(pos);
        c.rotation.set(
          0.3 + i * 0.2,
          i * 0.8 + mood.seed * 0.4,
          (i - 1) * 0.35,
        );
        c.userData.origin = pos;
        c.userData.angle = c.rotation.clone();
        c.userData.entered = performance.now();
        c.userData.mixScale = c.scale.x;
        mix.root.add(c);
        mixCandies.push(c);
      });
      dirty = true;
      wake();
    }
    let productChanged = 0,
      previousProduct = null;
    function updateProduct() {
      if (currentProduct) {
        if (previousProduct) {
          product.root.remove(previousProduct);
          release(previousProduct);
        }
        previousProduct = currentProduct;
      }
      currentProduct = createCandy(state.product, state.variant);
      const presets = {
        worm: { x: 0.1, key: 3.3, fill: 1.1, tint: "#d8f6ee", zoom: 0.9 },
        teeth: { x: 0.26, key: 2.6, fill: 1.8, tint: "#fff0d7", zoom: 0.92 },
        kiss: { x: 0.14, key: 2.8, fill: 1.3, tint: "#ffd0e2", zoom: 0.95 },
        berry: { x: 0.12, key: 4, fill: 2, tint: "#d2e0ff", zoom: 0.95 },
      };
      const preset = presets[state.product];
      currentProduct.rotation.x = preset.x;
      product.key.intensity = preset.key;
      product.fill.intensity = preset.fill;
      product.fill.color.set(preset.tint);
      product.zoom = preset.zoom;
      product.baseFill = preset.fill;
      product.root.add(currentProduct);
      productChanged = performance.now();
      dirty = true;
      wake();
    }
    const pointer = { x: 0, y: 0 };
    hero.el.addEventListener("pointermove", onPointer, {
      signal: abort.signal,
    });
    hero.el.addEventListener("pointerleave", leavePointer, {
      signal: abort.signal,
    });
    function onPointer(e) {
      const r = hero.el.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width - 0.5;
      pointer.y = (e.clientY - r.top) / r.height - 0.5;
      wake();
    }
    function leavePointer() {
      pointer.x = pointer.y = 0;
      wake();
    }
    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(ratio);
      dirty = true;
      wake();
    }
    function render(time) {
      frame = 0;
      if (disposed || document.hidden || !visible) return;
      // Reconcile preferences on the next frame as well as the change event.
      if (reduced.matches && ratio !== Math.min(devicePixelRatio, 1.75)) {
        ratio = Math.min(devicePixelRatio, 1.75);
        renderer.setPixelRatio(ratio);
        library.setQuality(1);
        qualityWindow = [];
        healthySamples = 0;
      }
      const interactive =
        state.busy || time < activeUntil || time - productChanged < 500;
      if (!reduced.matches && !interactive && time - lastDraw < 80) {
        frame = requestAnimationFrame(render);
        return;
      }
      if (lastDraw && interactive) {
        frameTimes.push(time - lastDraw);
        if (frameTimes.length > 180) frameTimes.shift();
      }
      const deliveredMS = lastDraw ? time - lastDraw : targetMS;
      lastDraw = time;
      const drawStarted = performance.now();
      const delta = Math.min((time - lastTime) / 1000, 0.05) || 0.016;
      lastTime = time;
      renderer.setScissorTest(false);
      renderer.setClearColor(0, 0);
      renderer.clear();
      renderer.setScissorTest(true);
      let any = false,
        animate = false;
      for (const slot of slots) {
        if (!slot.visible) continue;
        const rect = slot.el.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight || !rect.width)
          continue;
        any = true;
        const width = rect.width,
          height = rect.height;
        slot.camera.aspect = width / height;
        const distance = Math.max(6.8, 5.7 / Math.min(slot.camera.aspect, 1.2));
        slot.camera.position.z =
          slot === hero
            ? distance + 0.9
            : slot === mix
              ? distance + 1
              : distance * (product.zoom || 0.9);
        slot.camera.position.y = slot === mix ? 2.8 : 0;
        slot.camera.lookAt(0, slot === mix ? -0.2 : 0, 0);
        slot.camera.updateProjectionMatrix();
        renderer.setViewport(
          rect.left,
          innerHeight - rect.bottom,
          width,
          height,
        );
        renderer.setScissor(
          Math.max(0, rect.left),
          Math.max(0, innerHeight - rect.bottom),
          Math.min(width, innerWidth - rect.left),
          Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0),
        );
        if (slot === hero) {
          animate = !reduced.matches;
          hero.root.rotation.y = T.MathUtils.damp(
            hero.root.rotation.y,
            reduced.matches ? 0 : pointer.x * 0.18,
            6,
            delta,
          );
          hero.root.rotation.x = T.MathUtils.damp(
            hero.root.rotation.x,
            reduced.matches ? 0 : pointer.y * 0.1,
            6,
            delta,
          );
          hero.root.children.forEach((c, i) => {
            const depth = [1, 0.45, 0.75, 0.35][i];
            c.position.x = T.MathUtils.damp(
              c.position.x,
              c.userData.origin.x +
                (reduced.matches ? 0 : pointer.x * 0.4 * depth),
              7,
              delta,
            );
            c.rotation.y = T.MathUtils.damp(
              c.rotation.y,
              c.userData.angle.y +
                (reduced.matches ? 0 : pointer.x * 0.35 * depth),
              7,
              delta,
            );
            c.position.y =
              c.userData.origin.y +
              (reduced.matches ? 0 : Math.sin(time * 0.0007 + i * 1.4) * 0.055);
          });
        }
        if (slot === mix) {
          animate = !reduced.matches;
          bowl.visible = state.phase !== "result";
          const mood = moods[state.mood],
            progress =
              state.busy && state.blendDuration
                ? Math.min(1, (time - state.blendStart) / state.blendDuration)
                : 0;
          mixCandies.forEach((c, i) => {
            const o = c.userData.origin,
              a = c.userData.angle;
            if (progress > 0 && !reduced.matches) {
              const turn = progress * Math.PI * 4 + i * 1.7;
              c.position.set(
                Math.cos(turn) * 0.8,
                o.y + Math.sin(progress * Math.PI) * 0.7,
                Math.sin(turn) * 0.5,
              );
              c.rotation.set(
                a.x + progress * Math.PI * 2,
                a.y + progress * Math.PI * 4,
                a.z + Math.sin(turn) * 0.5,
              );
            } else {
              const entering = reduced.matches
                ? 1
                : Math.min(1, (time - c.userData.entered) / 550);
              c.position.copy(o);
              c.position.y +=
                (1 - entering) * 1.3 +
                (reduced.matches
                  ? 0
                  : Math.sin(time * 0.001 * mood.speed + i) * 0.035);
              c.scale.setScalar(c.userData.mixScale * (0.6 + 0.4 * entering));
              c.rotation.copy(a);
            }
          });
        }
        if (slot === product && currentProduct) {
          currentProduct.rotation.y = reduced.matches
            ? state.rotation
            : T.MathUtils.damp(
                currentProduct.rotation.y,
                state.rotation,
                10,
                delta,
              );
          const pop = reduced.matches
            ? 1
            : Math.min(1, (time - productChanged) / 450);
          const pulse =
            state.sparkUntil > time && !reduced.matches
              ? 1 + Math.sin(((state.sparkUntil - time) / 900) * Math.PI) * 0.07
              : 1;
          if (previousProduct) {
            const exit = reduced.matches
              ? 1
              : Math.min(1, (time - productChanged) / 400);
            previousProduct.scale.setScalar(
              previousProduct.userData.baseScale * (1 - exit),
            );
            previousProduct.position.x = -exit * 0.45;
            if (exit === 1) {
              product.root.remove(previousProduct);
              release(previousProduct);
              previousProduct = null;
            }
          }
          product.root.scale.setScalar(
            (0.88 + 0.12 * pop) * (state.product === "teeth" ? 1 : pulse),
          );
          product.root.scale.x *= state.product === "teeth" ? pulse : 1;
          product.root.rotation.z =
            state.product === "worm" ? (pulse - 1) * 2 : 0;
          product.root.position.y =
            state.product === "kiss" ? (pulse - 1) * 3 : 0;
          product.fill.intensity =
            state.sparkUntil > time ? product.baseFill + 1 : product.baseFill;
          if (
            !reduced.matches &&
            (Math.abs(currentProduct.rotation.y - state.rotation) > 0.001 ||
              pop < 1 ||
              pulse > 1)
          )
            animate = true;
        }
        renderer.render(slot.scene, slot.camera);
      }
      renderMS = performance.now() - drawStarted;
      draws++;
      // Delivered rAF cadence and CPU submission cost are proxies, not GPU timers. Adapt with
      // hysteresis; interaction cadence remains requestAnimationFrame driven.
      if (interactive && !reduced.matches) {
        qualityWindow.push(Math.max(renderMS, deliveredMS));
        if (qualityWindow.length >= 6) {
          const average =
            qualityWindow.reduce((a, b) => a + b, 0) / qualityWindow.length;
          qualityWindow = [];
          healthySamples = average <= targetMS * 1.08 ? healthySamples + 6 : 0;
          const next =
            average > targetMS * 1.7
              ? Math.max(0.7, ratio - 0.35)
              : healthySamples >= 90
                ? Math.min(devicePixelRatio, 1.75, ratio + 0.1)
                : ratio;
          if (Math.abs(next - ratio) > 0.01) {
            healthySamples = 0;
            ratio = next;
            renderer.setPixelRatio(ratio);
            library.setQuality(ratio);
          }
        }
      }
      dirty = false;
      if (any && animate && !reduced.matches)
        frame = requestAnimationFrame(render);
    }
    function wake() {
      if (disposed || document.hidden || !ready || contextLost) return;
      if (!frame) lastDraw = 0;
      activeUntil = performance.now() + 650;
      if (!frame) frame = requestAnimationFrame(render);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const slot = slots.find((s) => s.el === e.target);
          slot.visible = e.isIntersecting;
        });
        visible = slots.some((s) => s.visible);
        if (visible) wake();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
          renderer.setScissorTest(false);
          renderer.clear();
        }
      },
      { threshold: 0 },
    );
    cleanups.push(() => observer.disconnect());
    slots.forEach((s) => observer.observe(s.el));
    function onScroll() {
      if (reduced.matches || !frame) wake();
    }
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else wake();
    }
    function onMotion() {
      if (reduced.matches) {
        ratio = Math.min(devicePixelRatio, 1.75);
        renderer.setPixelRatio(ratio);
        library.setQuality(1);
        qualityWindow = [];
        healthySamples = 0;
      }
      dirty = true;
      wake();
    }
    renderer.domElement.addEventListener(
      "webglcontextlost",
      (e) => {
        e.preventDefault();
        contextLost = true;
        cancelAnimationFrame(frame);
        frame = 0;
        slots.forEach((s) => s.el.classList.remove("webgl-ready"));
        onStatus("failed", "Modo ilustrado · contexto 3D interrompido");
      },
      { signal: abort.signal },
    );
    renderer.domElement.addEventListener("webglcontextrestored", () => {
      contextLost = false;
      // Rebuild PMREM and all render targets after context restoration.
      onStatus("restored", "Restaurando a cena 3D…");
    });
    window.addEventListener("resize", resize, { signal: abort.signal });
    window.addEventListener("scroll", onScroll, {
      passive: true,
      signal: abort.signal,
    });
    document.addEventListener("visibilitychange", onVisibility, {
      signal: abort.signal,
    });
    reduced.addEventListener("change", onMotion);
    cleanups.push(() => reduced.removeEventListener("change", onMotion));
    updateMix();
    updateProduct();
    let compileTimeout;
    try {
      await Promise.race([
        Promise.all(slots.map((s) => renderer.compileAsync(s.scene, s.camera))),
        new Promise((_, reject) => {
          compileTimeout = setTimeout(
            () => reject(Error("3D preparation timed out")),
            15000,
          );
        }),
      ]);
    } finally {
      clearTimeout(compileTimeout);
    }
    initMS = performance.now() - startedAt;
    ready = true;
    document.body.append(renderer.domElement);
    slots.forEach((s) => s.el.classList.add("webgl-ready"));
    wake();
    return {
      updateMix,
      updateProduct,
      wake,
      renderer,
      slots,
      dispose() {
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(frame);
        slots.forEach((s) => s.el.classList.remove("webgl-ready"));
        cleanup();
      },
      metrics() {
        return {
          initMS,
          targetRefreshFPS: 1000 / targetMS,
          draws,
          renderMS,
          pixelRatio: ratio,
          motionReduced: reduced.matches,
          interactionFPS: frameTimes.length
            ? 1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length)
            : null,
          memory: { ...renderer.info.memory },
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        };
      },
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}
