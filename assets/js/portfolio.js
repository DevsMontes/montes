/* Native scroll, no animation dependencies. All content remains readable without JS. */
(() => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine) and (min-width: 761px)");
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(".reading-progress");
  const menu = document.querySelector("#mobile-menu");
  const menuButton = document.querySelector(".menu-toggle");
  const steps = [...document.querySelectorAll("[data-step]")];
  const timeline = document.querySelector(".process-steps");
  const sections = [...document.querySelectorAll("main > section[id]")];
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  let scheduled = false;
  let currentStage = -1;

  function closeMenu() {
    menu.close();
    menuButton.setAttribute("aria-expanded", "false");
  }
  menuButton.addEventListener("click", () => {
    menu.showModal();
    menuButton.setAttribute("aria-expanded", "true");
  });
  menu.querySelector("[data-close-menu]").addEventListener("click", closeMenu);
  menu.addEventListener("close", () =>
    menuButton.setAttribute("aria-expanded", "false"),
  );
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [...menu.querySelectorAll("button,a[href]")];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      closeMenu();
      const destination = document.querySelector(link.hash);
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
    }),
  );
  matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches && menu.open) closeMenu();
  });

  const serviceData = [
    ["Presença.", "ESTRATÉGIA / INTERFACE / RESPONSIVIDADE"],
    ["Clareza.", "OPERAÇÃO / CONTROLE / PRODUTIVIDADE"],
    ["Conexão.", "FLUXOS / CONEXÕES / EFICIÊNCIA"],
    ["Diálogo.", "ATENDIMENTO / ORGANIZAÇÃO / AUTOMAÇÃO"],
  ];
  const services = [...document.querySelectorAll("[data-service]")];
  services.forEach((item, index) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      services.forEach((other) => {
        if (other !== item) other.open = false;
      });
      const word = document.querySelector("[data-service-word]");
      word.textContent = serviceData[index][0];
      document.querySelector("[data-service-tags]").textContent =
        serviceData[index][1];
      document.querySelector("[data-service-count]").textContent =
        `0${index + 1} / 04`;
      if (!reducedMotion.matches)
        word.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 320, easing: "ease-out" },
        );
    });
  });

  function updateScroll() {
    scheduled = false;
    const viewport = innerHeight;
    const maxScroll = document.documentElement.scrollHeight - viewport;
    header.classList.toggle("scrolled", scrollY > 24);
    progress.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0})`;
    const position = viewport * 0.44;
    let stage = 0;
    steps.forEach((step, index) => {
      if (step.getBoundingClientRect().top < position) stage = index;
    });
    if (stage !== currentStage) {
      currentStage = stage;
      steps.forEach((step, index) =>
        step.classList.toggle("is-active", index === stage),
      );
      document.querySelector("[data-stage-number]").textContent =
        `0${stage + 1}`;
      document.querySelector("[data-stage-name]").textContent =
        steps[stage].dataset.stage;
      document.querySelector("[data-stage-caption]").textContent =
        steps[stage].dataset.caption;
    }
    const bounds = timeline.getBoundingClientRect();
    const timelineProgress = Math.max(
      0,
      Math.min(1, (position - bounds.top) / bounds.height),
    );
    timeline.style.setProperty("--process-progress", timelineProgress);
    let active = sections[0].id;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top < viewport * 0.38)
        active = section.id;
    });
    navLinks.forEach((link) => {
      if (link.hash === `#${active}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function scheduleScroll() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateScroll);
    }
  }
  addEventListener("scroll", scheduleScroll, { passive: true });
  addEventListener("resize", scheduleScroll, { passive: true });
  updateScroll();

  let revealObserver;
  function enableReveals() {
    revealObserver?.disconnect();
    document.documentElement.classList.toggle(
      "motion-on",
      !reducedMotion.matches,
    );
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(
        ".work-heading,.project,.expertise-intro,.altrix-copy,.altrix-flow,.commitments li,.contact-heading",
      )
      .forEach((item) => {
        item.dataset.reveal = "";
        revealObserver.observe(item);
      });
  }
  enableReveals();
  reducedMotion.addEventListener("change", enableReveals);

  // A contextual label supplements the native cursor only on large, fine-pointer screens.
  let cursor;
  let cursorFrame = 0;
  let cursorPosition = { x: 0, y: 0 };
  function syncCursor() {
    cursor?.remove();
    cursor = null;
    if (reducedMotion.matches || !finePointer.matches) return;
    cursor = document.createElement("span");
    cursor.className = "project-cursor";
    cursor.textContent = "VISUALIZAR ↗";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
  }
  document.querySelectorAll("[data-project]").forEach((project) => {
    project.addEventListener("pointermove", (event) => {
      if (!cursor) return;
      cursorPosition = { x: event.clientX + 16, y: event.clientY + 16 };
      cursor.classList.add("visible");
      if (cursorFrame) return;
      cursorFrame = requestAnimationFrame(() => {
        if (cursor)
          cursor.style.transform = `translate(${Math.min(cursorPosition.x, innerWidth - 160)}px,${Math.min(cursorPosition.y, innerHeight - 60)}px)`;
        cursorFrame = 0;
      });
    });
    project.addEventListener("pointerleave", () =>
      cursor?.classList.remove("visible"),
    );
  });
  syncCursor();
  reducedMotion.addEventListener("change", syncCursor);
  finePointer.addEventListener("change", syncCursor);
  document
    .querySelectorAll("[data-open-altrix]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        document.dispatchEvent(
          new CustomEvent("altrix:open", { detail: { trigger: button } }),
        ),
      ),
    );
  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
})();
