/* ============================================================
   Виктор Сафонкин — поведение сайта
   ============================================================ */
(function () {
  "use strict";

  const works = Array.isArray(window.WORKS) ? window.WORKS : [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- header ---------- */
  const hdr = $("#hdr");
  if (hdr) {
    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- menu ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- hero: параллакс и линза ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    const media = hero.querySelector(".hero-media");
    const disp = document.getElementById("lensDisp");
    const svgDefs = document.querySelector(".svg-defs");

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    let lastX = 0, lastY = 0, scale = 26;

    const tick = () => {
      cx += (tx - cx) * 0.085;
      cy += (ty - cy) * 0.085;
      if (media) {
        media.style.setProperty("--px", cx.toFixed(2) + "px");
        media.style.setProperty("--py", cy.toFixed(2) + "px");
      }
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05
        ? requestAnimationFrame(tick)
        : null;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const setLens = (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      hero.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    };

    hero.addEventListener("pointerenter", (e) => {
      setLens(e);
      hero.classList.add("warping");
      if (svgDefs && svgDefs.unpauseAnimations) svgDefs.unpauseAnimations();
    });

    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;

      tx = nx * -24;
      ty = ny * -16;
      start();
      setLens(e);

      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 6) {
        const target = 16 + Math.min(dist * 1.2, 22);
        scale += (target - scale) * 0.22;
        if (disp) disp.setAttribute("scale", scale.toFixed(1));
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      hero.classList.remove("warping");
      if (svgDefs && svgDefs.pauseAnimations) svgDefs.pauseAnimations();
      scale = 26;
      if (disp) disp.setAttribute("scale", "26");
      tx = 0;
      ty = 0;
      start();
    });
  }

  /* ---------- галерея: параллакс фрагментов ---------- */
  if (!reduce) {
    document.querySelectorAll(".work").forEach((card) => {
      const img = card.querySelector(".work-img img");
      if (!img) return;

      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;

        img.style.setProperty("--tx", (nx * -16).toFixed(1) + "px");
        img.style.setProperty("--ty", (ny * -12).toFixed(1) + "px");
        card.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
        card.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        img.style.setProperty("--tx", "0px");
        img.style.setProperty("--ty", "0px");
      });
    });
  }

  /* ---------- видео поверх фрагментов (если сгенерированы) ---------- */
  (function attachVideos() {
    const map = window.VIDEOS || {};
    document.querySelectorAll(".work").forEach((fig) => {
      const i = Number(fig.dataset.i);
      const src = map[i] || map[String(i)];
      if (!src) return;

      const box = fig.querySelector(".work-img");
      if (!box || box.querySelector("video")) return;

      const v = document.createElement("video");
      v.className = "work-video";
      v.src = src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "none";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      box.appendChild(v);

      v.addEventListener("loadeddata", () => v.classList.add("ready"));

      const play = () => { const p = v.play(); if (p) p.catch(() => {}); };
      const pause = () => v.pause();

      fig.addEventListener("pointerenter", play);
      fig.addEventListener("pointerleave", pause);

      const io = new IntersectionObserver(
        (es) => es.forEach((e) => { if (!e.isIntersecting) pause(); }),
        { rootMargin: "120px" }
      );
      io.observe(fig);
    });
  })();

  /* ---------- lightbox ---------- */
  const lb = $("#lb");
  if (!lb || works.length === 0) return;

  const img = $("#lbImg");
  const title = $("#lbTitle");
  const count = $("#lbCount");
  const btnPrev = $("#lbPrev");
  const btnNext = $("#lbNext");
  const btnClose = $("#lbClose");
  let index = 0;
  let lastFocus = null;

  const pad = (n) => String(n).padStart(2, "0");

  function show(i) {
    index = (i + works.length) % works.length;
    const w = works[index];
    img.src = w.file;
    img.alt = "«" + w.title + "»";
    title.textContent = w.title;
    count.textContent = pad(w.n) + " / " + pad(works.length);
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.classList.add("lb-open");
    btnClose.focus({ preventScroll: true });
  }

  function close() {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    img.src = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $$(".work").forEach((fig) => {
    const i = Number(fig.dataset.i) || 0;
    fig.addEventListener("click", () => open(i));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });

  const heroEl = $(".hero");
  if (heroEl) heroEl.addEventListener("click", (e) => {
    if (e.target.closest("a,button")) return;
    open(0);
  });

  btnPrev.addEventListener("click", () => show(index - 1));
  btnNext.addEventListener("click", () => show(index + 1));
  btnClose.addEventListener("click", close);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
