import * as T from "./vendor/three.module.js";
// Every engine owns one library. Prototypes share immutable GPU resources.
// Removing a clone releases its instance buffers only; library.dispose releases
// shared geometries, materials and textures once, after all scenes are gone.
export function createModelLibrary() {
  const lowDetail = false;
  let qualityLevel = 1;
  const clones = new Set(),
    originalMaterials = new WeakMap(),
    affordableMaterials = new Map();
  const prototypes = new Map(),
    resources = new Set(),
    instances = new Set();
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = noiseCanvas.height = 128;
  const context = noiseCanvas.getContext("2d"),
    pixels = context.createImageData(128, 128);
  let noiseSeed = 31;
  for (let i = 0; i < pixels.data.length; i += 4) {
    noiseSeed = (noiseSeed * 1664525 + 1013904223) >>> 0;
    const n = 100 + (noiseSeed >>> 24) * 0.5;
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = n;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const grain = new T.CanvasTexture(noiseCanvas);
  grain.wrapS = grain.wrapT = T.RepeatWrapping;
  grain.repeat.set(5, 5);
  resources.add(grain);
  const clamp = T.MathUtils.clamp;
  const shared = new Map();
  function gummy(color, extras = {}) {
    const key = color + JSON.stringify(extras);
    if (!shared.has(key))
      shared.set(
        key,
        new T.MeshPhysicalMaterial({
          color,
          roughness: 0.38,
          bumpMap: grain,
          bumpScale: 0.014,
          metalness: 0,
          transmission: 0.12,
          thickness: 0.6,
          ior: 1.42,
          envMapIntensity: 0.6,
          clearcoat: 0.45,
          clearcoatRoughness: 0.23,
          ...extras,
        }),
      );
    return shared.get(key);
  }
  const sugarMat = new T.MeshStandardMaterial({
    color: 0xfff9ed,
    roughness: 0.68,
    transparent: true,
    opacity: 0.8,
  });
  let randomSeed = 7;
  function random() {
    randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
    return randomSeed / 4294967296;
  }
  function rounded(w, h, d, r) {
    const geo = new T.BoxGeometry(w, h, d, 5, 5, 5);
    const pos = geo.attributes.position;
    const core = new T.Vector3(w / 2 - r, h / 2 - r, d / 2 - r);
    const v = new T.Vector3(),
      q = new T.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      q.set(
        clamp(v.x, -core.x, core.x),
        clamp(v.y, -core.y, core.y),
        clamp(v.z, -core.z, core.z),
      );
      v.sub(q).normalize().multiplyScalar(r).add(q);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }
  function crystals(points, count = 220) {
    const geo = new T.OctahedronGeometry(0.012, 0);
    const mesh = new T.InstancedMesh(geo, sugarMat, count);
    mesh.userData.sugarCount = count;
    const dummy = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const k = Math.floor(random() * (points.length - 1));
      dummy.position.copy(points[k]).lerp(points[k + 1], random());
      dummy.rotation.set(random() * 3, random() * 3, random() * 3);
      dummy.scale.setScalar(0.6 + random() * 0.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    return mesh;
  }
  function worm() {
    const g = new T.Group();
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(-1.22, 0.68, 0),
      new T.Vector3(-0.66, 0.77, 0.08),
      new T.Vector3(-0.4, 0.16, 0.02),
      new T.Vector3(0.08, -0.15, -0.08),
      new T.Vector3(0.64, 0.12, 0),
      new T.Vector3(0.83, -0.42, 0.07),
      new T.Vector3(0.55, -0.95, 0.16),
    ]);
    const seg = lowDetail ? 96 : 144,
      radial = lowDetail ? 16 : 24,
      frames = curve.computeFrenetFrames(seg, false),
      pos = [],
      norm = [],
      colors = [],
      uv = [],
      idx = [],
      surface = [];
    const blue = new T.Color("#069d9f"),
      yellow = new T.Color("#ffb923");
    for (let i = 0; i <= seg; i++) {
      const t = i / seg,
        c = curve.getPointAt(t);
      const radius =
        0.18 *
        Math.sqrt(Math.min(1, t / 0.035, (1 - t) / 0.035)) *
        (1 + 0.11 * Math.cos(t * Math.PI * 44));
      const color = blue
        .clone()
        .lerp(yellow, T.MathUtils.smoothstep(t, 0.42, 0.58));
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2,
          n = frames.normals[i]
            .clone()
            .multiplyScalar(Math.cos(a))
            .addScaledVector(frames.binormals[i], Math.sin(a));
        const point = c.clone().addScaledVector(n, radius);
        pos.push(point.x, point.y, point.z);
        norm.push(n.x, n.y, n.z);
        colors.push(color.r, color.g, color.b);
        uv.push(t, j / radial);
        surface.push(point.clone().addScaledVector(n, 0.009));
        if (i < seg && j < radial) {
          const k = i * (radial + 1) + j;
          idx.push(
            k,
            k + radial + 1,
            k + 1,
            k + 1,
            k + radial + 1,
            k + radial + 2,
          );
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    geometry.setAttribute("normal", new T.Float32BufferAttribute(norm, 3));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geometry.setIndex(idx);
    geometry.computeVertexNormals();
    g.add(
      new T.Mesh(
        geometry,
        gummy("#ffffff", { vertexColors: true, side: T.DoubleSide }),
      ),
    );
    g.add(crystals(surface, 1500));
    return g;
  }
  function teeth() {
    const g = new T.Group();
    const curve = new T.CatmullRomCurve3(
      Array.from({ length: 17 }, (_, i) => {
        const x = (i - 8) / 8;
        return new T.Vector3(x, 0.18 - 0.18 * x * x, -0.32 * x * x);
      }),
    );
    const gum = new T.Mesh(
      new T.TubeGeometry(curve, 64, 0.18, 24, false),
      gummy("#f14b79", { roughness: 0.4, clearcoat: 0.18 }),
    );
    g.add(gum);
    for (const t of [0, 1]) {
      const cap = new T.Mesh(new T.SphereGeometry(0.18, 16, 12), gum.material);
      cap.position.copy(curve.getPoint(t));
      g.add(cap);
    }
    const toothGeo = rounded(0.285, 0.4, 0.46, 0.11);
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * 0.28;
      const tooth = new T.Mesh(
        toothGeo,
        gummy("#fff9e8", { transmission: 0.03, roughness: 0.38 }),
      );
      tooth.position.set(
        x,
        -0.22 - Math.pow(x, 2) * 0.1,
        0.07 - Math.pow(x, 2) * 0.32,
      );
      tooth.rotation.z = -x * 0.14;
      g.add(tooth);
    }
    g.rotation.x = -0.1;
    return g;
  }
  function kiss() {
    const g = new T.Group();
    // White foam foot, broad pink shoulder and rounded crown, never a pointed drop.
    const pts = [
      new T.Vector2(0, -0.55),
      new T.Vector2(0.62, -0.55),
      new T.Vector2(0.76, -0.48),
      new T.Vector2(0.77, -0.32),
      new T.Vector2(0.74, -0.24),
      new T.Vector2(0.72, -0.2),
      new T.Vector2(0.69, 0.08),
      new T.Vector2(0.61, 0.35),
      new T.Vector2(0.51, 0.48),
      new T.Vector2(0.32, 0.53),
      new T.Vector2(0, 0.54),
    ];
    const profile = new T.SplineCurve(pts).getPoints(96);
    profile.forEach((p) => (p.x = Math.max(0, p.x)));
    const geometry = new T.LatheGeometry(profile, 64);
    const pos = geometry.attributes.position,
      colors = [],
      surface = [];
    const white = new T.Color("#fff5e5"),
      pink = new T.Color("#f32769");
    for (let i = 0; i < pos.count; i++) {
      const v = new T.Vector3().fromBufferAttribute(pos, i);
      const col = v.y < -0.22 ? white : pink;
      colors.push(col.r, col.g, col.b);
      if (v.y > -0.22) surface.push(v.clone().multiplyScalar(1.012));
    }
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    g.add(
      new T.Mesh(
        geometry,
        gummy("#ffffff", {
          vertexColors: true,
          roughness: 0.43,
          transmission: 0.08,
        }),
      ),
    );
    const sugarPoints = [];
    for (let i = 0; i < 4000; i++) {
      const t = 0.3 + random() * 0.69;
      const p = new T.SplineCurve(pts).getPoint(t);
      const a = random() * Math.PI * 2;
      sugarPoints.push(
        new T.Vector3(
          Math.sin(a) * (p.x + 0.006),
          p.y,
          Math.cos(a) * (p.x + 0.006),
        ),
      );
    }
    g.add(crystals(sugarPoints, 1600));
    return g;
  }
  function berry(variant = "black") {
    const g = new T.Group();
    const mat = gummy("#ffffff", {
      transmission: 0,
      roughness: 0.72,
      clearcoat: 0.03,
      bumpScale: 0.025,
    });
    const beadGeo = new T.SphereGeometry(0.058, 6, 4),
      count = 650;
    const beads = new T.InstancedMesh(beadGeo, mat, count),
      dummy = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const v = 1 - (2 * (i + 0.5)) / count,
        theta = i * Math.PI * (3 - Math.sqrt(5)) + (random() - 0.5) * 0.12;
      const r = Math.sqrt(1 - v * v),
        taper = 0.86 - 0.1 * v;
      dummy.position.set(
        Math.cos(theta) * r * 0.65 * taper,
        v * 0.7,
        Math.sin(theta) * r * 0.65 * taper,
      );
      dummy.position.multiplyScalar(0.96 + random() * 0.07);
      dummy.scale.setScalar(0.8 + random() * 0.4);
      dummy.rotation.set(random() * 3, random() * 3, random() * 3);
      dummy.updateMatrix();
      beads.setMatrixAt(i, dummy.matrix);
      beads.setColorAt(
        i,
        new T.Color().setHSL(
          variant === "red" ? 0.985 : 0.91,
          variant === "red" ? 0.82 : 0.18,
          variant === "red" ? 0.28 + random() * 0.08 : 0.008 + random() * 0.014,
        ),
      );
    }
    g.add(beads);
    const core = new T.Mesh(
      new T.SphereGeometry(0.5, 24, 18),
      gummy(variant === "red" ? "#a81431" : "#19121b", {
        transmission: 0,
        roughness: 0.55,
      }),
    );
    core.scale.y = 1.32;
    g.add(core);
    return g;
  }
  function buildCandy(id, variant) {
    randomSeed = 7;
    const g = id === "berry" ? berry(variant) : { worm, teeth, kiss }[id]();
    const box = new T.Box3().setFromObject(g),
      size = box.getSize(new T.Vector3()),
      center = box.getCenter(new T.Vector3());
    g.children.forEach((c) => c.position.sub(center));
    const scale = 2.4 / Math.max(size.x, size.y, size.z);
    g.scale.setScalar(scale);
    g.userData.baseScale = scale;
    return g;
  }
  function collect(object) {
    object.traverse((o) => {
      if (o.geometry) resources.add(o.geometry);
      if (o.material)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          resources.add(m),
        );
    });
  }
  function createCandy(id, variant = "black") {
    const key = id + variant;
    if (!prototypes.has(key)) {
      const p = buildCandy(id, variant);
      collect(p);
      prototypes.set(key, p);
    }
    const clone = prototypes.get(key).clone(true);
    clones.add(clone);
    clone.traverse((o) => {
      if (o.isInstancedMesh) {
        instances.add(o);
        if (o.userData.sugarCount)
          o.count = Math.round(
            o.userData.sugarCount * (qualityLevel < 1 ? 0.5 : 1),
          );
      }
    });
    applyQuality(clone);
    return clone;
  }
  function applyQuality(object) {
    object.traverse((o) => {
      if (!o.material?.isMeshPhysicalMaterial && !originalMaterials.has(o))
        return;
      const original = originalMaterials.get(o) ?? o.material;
      originalMaterials.set(o, original);
      if (qualityLevel >= 1) {
        o.material = original;
        return;
      }
      if (!affordableMaterials.has(original)) {
        const affordable = new T.MeshPhongMaterial({
          color: original.color,
          vertexColors: original.vertexColors,
          bumpMap: original.bumpMap,
          bumpScale: 0.008,
          shininess: original.roughness > 0.65 ? 55 : 45,
          specular: original.roughness > 0.65 ? "#151018" : "#7b626c",
          side: original.side,
          transparent: original.transparent,
          opacity: original.opacity,
        });
        affordableMaterials.set(original, affordable);
        resources.add(affordable);
      }
      o.material = affordableMaterials.get(original);
    });
  }
  function release(object) {
    clones.delete(object);
    object.traverse((o) => {
      if (o.isInstancedMesh) {
        o.dispose();
        instances.delete(o);
      }
    });
  }
  function buildBowl() {
    const group = new T.Group();
    const pts = [
      new T.Vector2(0.04, -1),
      new T.Vector2(0.65, -0.94),
      new T.Vector2(1.22, -0.6),
      new T.Vector2(1.5, -0.05),
      new T.Vector2(1.62, 0.35),
    ];
    const glass = new T.MeshPhysicalMaterial({
      color: "#fff6e9",
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.05,
      side: T.DoubleSide,
      depthWrite: false,
    });
    group.add(new T.Mesh(new T.LatheGeometry(pts, 48), glass));
    const rim = new T.Mesh(
      new T.TorusGeometry(1.62, 0.026, 8, 64),
      new T.MeshStandardMaterial({
        color: "#fff5e6",
        roughness: 0.15,
        transparent: true,
        opacity: 0.6,
      }),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.35;
    group.add(rim);
    return group;
  }

  function createBowl() {
    if (!prototypes.has("bowl")) {
      const b = buildBowl();
      collect(b);
      prototypes.set("bowl", b);
    }
    return prototypes.get("bowl").clone(true);
  }
  return {
    createCandy,
    createBowl,
    release,
    setQuality(level) {
      qualityLevel = level;
      clones.forEach(applyQuality);
      instances.forEach((o) => {
        if (o.userData.sugarCount)
          o.count = Math.round(o.userData.sugarCount * (level < 1 ? 0.5 : 1));
      });
      shared.forEach((m) => {
        m.userData.originalTransmission ??= m.transmission;
        const next = level < 1 ? 0 : m.userData.originalTransmission;
        if (m.transmission !== next) {
          m.transmission = next;
          m.needsUpdate = true;
        }
      });
    },
    dispose() {
      instances.forEach((i) => i.dispose());
      instances.clear();
      clones.clear();
      affordableMaterials.clear();
      prototypes.forEach((p) =>
        p.traverse((o) => {
          if (o.isInstancedMesh) o.dispose();
        }),
      );
      resources.forEach((r) => r.dispose());
      resources.clear();
      shared.clear();
      prototypes.clear();
    },
  };
}
// Standalone poster generation owns this separate library for the page lifetime.
let posterLibrary;
export function createCandy(id, variant) {
  posterLibrary ??= createModelLibrary();
  return posterLibrary.createCandy(id, variant);
}
