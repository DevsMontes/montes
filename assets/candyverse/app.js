import { products, moods } from "./data.js";
const $ = (s) => document.querySelector(s);
const state = {
  phase: "personality",
  result: null,
  variant: "black",
  mood: "adventure",
  items: [...moods.adventure.items],
  product: "worm",
  busy: false,
  blendStart: 0,
  blendDuration: 1600,
  rotation: 0,
  sparkUntil: 0,
};
let engine = null,
  blendTimer = null;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
$(".ingredients").innerHTML = products
  .map(
    (p) =>
      `<button type="button" data-ingredient="${p.id}" aria-pressed="false">${p.name}<span aria-hidden="true">＋</span></button>`,
  )
  .join("");
$(".product-controls").innerHTML = products
  .map(
    (p, i) =>
      `<button type="button" data-product="${p.id}" aria-pressed="${i === 0}"><span>0${i + 1}</span>${p.name}</button>`,
  )
  .join("");
function updateItems() {
  if (state.phase === "result") setPhase("ingredients");
  document.querySelectorAll("[data-ingredient]").forEach((b) => {
    const on = state.items.includes(b.dataset.ingredient);
    b.setAttribute("aria-pressed", on);
    b.querySelector("span").textContent = on ? "✓" : "＋";
  });
  $("#mix-count").textContent = `${state.items.length} / 4 ingredientes`;
  $("#blend").disabled = state.busy;
  const fallback = document.querySelector(".mix-fallback-items");
  fallback.innerHTML = state.items
    .map(
      (id) =>
        `<img src="../assets/candyverse/images/${id}.webp" alt="${products.find((p) => p.id === id).name}">`,
    )
    .join("");
  engine?.updateMix();
}
function setMood(key) {
  if (state.busy) return;
  setPhase("personality");
  state.mood = key;
  state.items = [...moods[key].items];
  const mood = moods[key];
  $(".mixer").style.setProperty("--mood", mood.color);
  $("#mix-title").innerHTML = mood.title;
  $("#mood-description").textContent = mood.description;
  $(".mix-word").textContent = mood.word;
  $("#mix-atmosphere").textContent = mood.atmosphere;
  document
    .querySelectorAll("[data-mood]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.mood === key));
  $("#mix-result").textContent =
    `Receita ${mood.name.toLowerCase()} selecionada. Personalize os ingredientes.`;
  updateItems();
}
function selectProduct(id) {
  const p = products.find((p) => p.id === id);
  state.product = id;
  $("#berry-variant").hidden = id !== "berry";
  state.rotation = 0;
  $("#product-name").innerHTML = p.title;
  $("#product-description").textContent = p.description;
  $("#product-index").textContent = `C—0${products.indexOf(p) + 1} / ${p.line}`;
  $("#product-traits").innerHTML = p.traits
    .map((t) => `<span>${t}</span>`)
    .join("");
  $(".collection").style.setProperty("--product-bg", p.bg);
  $(".product-watermark").textContent = `0${products.indexOf(p) + 1}`;
  $("#product-fallback").src =
    `../assets/candyverse/images/${id === "berry" && state.variant === "red" ? "berry-red" : id}.webp`;
  $("#product-fallback").alt = `${p.name}, representação ilustrada`;
  $(".product-stage").setAttribute(
    "aria-label",
    `Modelo de ${p.name}. Arraste horizontalmente ou use as setas para girar.`,
  );
  document
    .querySelectorAll("[data-product]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.product === id));
  $("#spark").textContent = {
    worm: "↝ Fazer uma onda",
    teeth: "☺ Abrir um sorriso",
    kiss: "♡ Mandar um beijo",
    berry: "✳ Acender os detalhes",
  }[id];
  engine?.updateProduct();
}
function lock(busy) {
  state.busy = busy;
  document
    .querySelectorAll("[data-mood],[data-ingredient],#clear,#reset-mix,#blend")
    .forEach((b) => (b.disabled = busy));
}
document
  .querySelectorAll("[data-mood]")
  .forEach((b) => b.addEventListener("click", () => setMood(b.dataset.mood)));
document.querySelectorAll("[data-ingredient]").forEach((b) =>
  b.addEventListener("click", () => {
    if (state.busy) return;
    setPhase("ingredients");
    const id = b.dataset.ingredient;
    if (state.items.includes(id))
      state.items = state.items.filter((x) => x !== id);
    else if (state.items.length < 4) state.items.push(id);
    else return;
    $("#mix-result").textContent = state.items.length
      ? "Ingredientes atualizados. Vamos misturar?"
      : "Escolha pelo menos um doce para misturar.";
    updateItems();
  }),
);
$("#clear").addEventListener("click", () => {
  state.items = [];
  updateItems();
  $("#mix-result").textContent =
    "Recipiente vazio. Escolha pelo menos um doce.";
});
$("#reset-mix").addEventListener("click", () => setMood(state.mood));
function setPhase(phase) {
  state.phase = phase;
  $(".mixer").dataset.phase = phase;
  document.querySelectorAll("[data-step]").forEach((el) => {
    if (el.dataset.step === phase) el.setAttribute("aria-current", "step");
    else el.removeAttribute("aria-current");
  });
  $(".mix-summary").hidden = phase !== "result";
  $(".result-actions").hidden = phase !== "result";
  $("#skip-mix").hidden = phase !== "mixing";
  $(".share-fallback").hidden = true;
}
function makeResult() {
  const ordered = products.filter((p) => state.items.includes(p.id));
  const signature = ordered.reduce((n, p) => n + (1 << products.indexOf(p)), 0);
  const first = {
    adventure: "Expedição",
    romantic: "Jardim",
    intense: "Órbita",
    solar: "Aurora",
  }[state.mood];
  const last = [
    "",
    "Elétrica",
    "Sorridente",
    "Inesperada",
    "de Afeto",
    "Doce Ousadia",
    "Encantada",
    "Multicor",
    "Magnética",
    "Selvagem",
    "Impossível",
    "Cósmica",
    "de Veludo",
    "Radiante",
    "Extraordinária",
    "Infinita",
  ][signature];
  return {
    name: first + " " + last,
    description:
      moods[state.mood].name + " · " + ordered.map((p) => p.name).join(" + "),
    items: ordered.map((p) => p.id),
    mood: state.mood,
  };
}
function finishMix() {
  if (!state.busy) return;
  clearTimeout(blendTimer);
  lock(false);
  $(".mixer").classList.remove("blend-active");
  state.result = makeResult();
  setPhase("result");
  $("#universe-name").textContent = state.result.name;
  $("#universe-description").textContent = state.result.description;
  $("#mix-result").textContent =
    "Seu universo " +
    state.result.name +
    " está pronto. Compartilhe ou crie outra combinação.";
  engine?.updateMix();
  const section = $(".mixer").getBoundingClientRect(),
    stage = $(".mix-stage").getBoundingClientRect();
  if (
    innerWidth <= 700 &&
    section.top < innerHeight &&
    section.bottom > 0 &&
    stage.bottom < 0
  ) {
    $(".mix-stage").scrollIntoView({
      block: "start",
      behavior: reduced.matches ? "instant" : "smooth",
    });
  }
}
$("#blend").addEventListener("click", () => {
  if (state.busy) return;
  if (!state.items.length) {
    $("#mix-result").textContent =
      "Adicione pelo menos um doce antes de misturar.";
    return;
  }
  lock(true);
  setPhase("mixing");
  state.blendStart = performance.now();
  state.blendDuration = reduced.matches ? 0 : 1400;
  $(".mixer").classList.add("blend-active");
  $("#mix-result").textContent = "Misturando seu universo…";
  engine?.wake();
  blendTimer = setTimeout(finishMix, state.blendDuration);
});
$("#skip-mix").addEventListener("click", finishMix);
$("#new-mix").addEventListener("click", () => {
  state.result = null;
  setPhase("ingredients");
  engine?.updateMix();
  $("#mix-result").textContent =
    "Sua receita foi mantida. Experimente outra combinação.";
});
function shareURL() {
  const u = new URL(location.href);
  u.search = "";
  u.hash = "mixer";
  u.searchParams.set("mood", state.mood);
  u.searchParams.set(
    "mix",
    products
      .filter((p) => state.items.includes(p.id))
      .map((p) => p.id)
      .join(","),
  );
  return u.href;
}
$("#share-mix").addEventListener("click", async () => {
  const url = shareURL(),
    title = state.result?.name ?? "Meu Candyverse";
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text: "Conheça meu universo Fini: " + title,
        url,
      });
      $("#mix-result").textContent = "Universo compartilhado.";
      return;
    }
  } catch (e) {
    if (e.name === "AbortError") {
      $("#mix-result").textContent =
        "Compartilhamento cancelado. Sua receita foi mantida.";
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    $("#mix-result").textContent =
      "Link copiado. Cole onde quiser compartilhar.";
  } catch {
    $(".share-fallback").hidden = false;
    $("#share-url").value = url;
    $("#share-url").focus();
    $("#share-url").select();
    $("#mix-result").textContent = "Selecione e copie o link acima.";
  }
});
$("#download-mix").addEventListener("click", async () => {
  const result = state.result;
  if (!result) return;
  const button = $("#download-mix");
  button.disabled = true;
  try {
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1350;
    const x = c.getContext("2d");
    x.fillStyle = moods[result.mood].color;
    x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = "#39136e";
    x.font = "bold 30px Space";
    x.fillText("FINI CANDYVERSE / SEU UNIVERSO", 70, 100);
    x.font = "bold 68px Space";
    const words = result.name.split(" ");
    let line = "",
      y = 230;
    for (const word of words) {
      if (x.measureText(line + word).width > 920) {
        x.fillText(line, 70, y);
        y += 80;
        line = "";
      }
      line += word + " ";
    }
    x.fillText(line, 70, y);
    const images = await Promise.all(
      result.items.map(
        (id) =>
          new Promise((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = reject;
            im.src = "../assets/candyverse/images/" + id + ".webp";
          }),
      ),
    );
    images.forEach((im, i) => {
      const columns = images.length === 1 ? 1 : 2;
      const w = columns === 1 ? 650 : 470;
      x.drawImage(
        im,
        columns === 1 ? 215 : 70 + (i % 2) * 470,
        400 + Math.floor(i / 2) * 370,
        w,
        w,
      );
    });
    x.font = "24px DM";
    x.fillText(
      "PERSONALIDADE / " + moods[result.mood].name.toUpperCase(),
      70,
      1240,
    );
    x.font = "18px DM";
    x.fillText("Montes Developers · conceito independente", 70, 1300);
    const blob = await new Promise((resolve) => c.toBlob(resolve, "image/png"));
    if (!blob) throw Error("export");
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "meu-candyverse.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("#mix-result").textContent = "Imagem do seu universo salva.";
  } catch {
    $("#mix-result").textContent =
      "Não foi possível salvar a imagem. Você ainda pode compartilhar o link.";
  } finally {
    button.disabled = false;
  }
});
$("#berry-variant").addEventListener("click", () => {
  state.variant = state.variant === "black" ? "red" : "black";
  $("#berry-variant").setAttribute("aria-pressed", state.variant === "red");
  $("#berry-variant").textContent =
    state.variant === "red" ? "Amora preta ↔" : "Amora vermelha ↔";
  $("#product-fallback").src =
    "../assets/candyverse/images/" +
    (state.variant === "red" ? "berry-red" : "berry") +
    ".webp";
  engine?.updateProduct();
});
document
  .querySelectorAll("[data-product]")
  .forEach((b) =>
    b.addEventListener("click", () => selectProduct(b.dataset.product)),
  );
$("#reset-view").addEventListener("click", () => {
  state.rotation = 0;
  engine?.wake();
});
$("#spark").addEventListener("click", () => {
  state.sparkUntil = performance.now() + (reduced.matches ? 0 : 900);
  engine?.wake();
  $("#render-mode").textContent = reduced.matches
    ? "Movimento reduzido · detalhes de textura preservados"
    : "Um toque de brilho no seu doce.";
});
let drag = null;
const stage = $(".product-stage");
stage.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, angle: state.rotation, id: e.pointerId };
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  if (Math.abs(e.clientX - drag.x) > Math.abs(e.clientY - drag.y)) {
    state.rotation = Math.max(
      -Math.PI,
      Math.min(Math.PI, drag.angle + (e.clientX - drag.x) * 0.012),
    );
    engine?.wake();
  }
});
["pointerup", "pointercancel", "lostpointercapture"].forEach((event) =>
  stage.addEventListener(event, () => (drag = null)),
);
stage.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    state.rotation = Math.max(
      -Math.PI,
      Math.min(Math.PI, state.rotation + (e.key === "ArrowLeft" ? -0.2 : 0.2)),
    );
    engine?.wake();
  }
  if (e.key === "Home") {
    state.rotation = 0;
    engine?.wake();
  }
});
updateItems();
let webglState = "idle",
  startPromise = null;
function renderStatus(status, message) {
  webglState = status;
  document.body.dataset.webgl = status;
  $("#render-mode").textContent = message;
  $("#retry-3d").hidden = status !== "failed";
  $(".hero-stage .stage-foot").textContent =
    status === "ready"
      ? "MOVA PARA EXPLORAR · ROLE PARA DESCOBRIR"
      : status === "failed"
        ? "SEU UNIVERSO CONTINUA EM IMAGENS"
        : "PREPARANDO SEU UNIVERSO…";
}
async function start3D() {
  if (startPromise || webglState === "ready") return startPromise;
  const retry = webglState === "failed";
  renderStatus(
    retry ? "retrying" : "loading",
    "Preparando sua experiência 3D…",
  );
  engine?.dispose();
  engine = null;
  startPromise = (async () => {
    try {
      const { createEngine } = await import("./scene.js");
      engine = await createEngine(state, reduced, (status, message) => {
        if (status === "restored") {
          renderStatus("failed", message);
          start3D();
        } else renderStatus(status, message);
      });
      renderStatus(
        "ready",
        reduced.matches
          ? "3D · movimento reduzido"
          : "3D · gire e descubra os detalhes",
      );
    } catch (error) {
      renderStatus("failed", "Modo ilustrado · o Mixer continua disponível");
      console.info("Candyverse: fallback ativo.", error.message);
    } finally {
      startPromise = null;
    }
  })();
  return startPromise;
}
$("#retry-3d").addEventListener("click", () => start3D());
// Bounded allowlist: no serialized HTML or unrestricted object merge in shared recipes.
const params = new URLSearchParams(location.search),
  sharedMood = params.get("mood"),
  sharedMix = params.get("mix");
if (sharedMix && sharedMix.length <= 40 && Object.hasOwn(moods, sharedMood)) {
  const ids = sharedMix.split(",");
  if (
    ids.length >= 1 &&
    ids.length <= 4 &&
    new Set(ids).size === ids.length &&
    ids.every((id) => products.some((p) => p.id === id))
  ) {
    setMood(sharedMood);
    state.items = ids;
    updateItems();
    state.result = makeResult();
    setPhase("result");
    $("#universe-name").textContent = state.result.name;
    $("#universe-description").textContent = state.result.description;
    $("#mix-result").textContent =
      "Receita compartilhada carregada. Este universo também pode ser seu.";
  }
}
// Read-only diagnostics for reproducible local runtime tests.
window.candyverseDiagnostics = () => ({
  webglState,
  phase: state.phase,
  rotation: state.rotation,
  product: state.product,
  variant: state.variant,
  result: state.result,
  items: [...state.items],
  ...(engine?.metrics() ?? {}),
});
const activate = () => {
  start3D();
  window.removeEventListener("scroll", activate);
  window.removeEventListener("pointerdown", activate);
  window.removeEventListener("keydown", activate);
  document
    .querySelector(".hero-stage")
    .removeEventListener("pointermove", activate);
};
window.addEventListener("scroll", activate, { passive: true });
window.addEventListener("pointerdown", activate, { once: true, passive: true });
window.addEventListener("keydown", activate, { once: true });
document
  .querySelector(".hero-stage")
  .addEventListener("pointermove", activate, { once: true, passive: true });
window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  if (state.busy) finishMix();
  clearTimeout(blendTimer);
  engine?.dispose();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.busy) finishMix();
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) engine?.wake();
});
