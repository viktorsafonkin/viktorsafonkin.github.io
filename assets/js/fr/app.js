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


  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- кнопка «плей» на карточках ---------- */
  document.querySelectorAll(".card-play").forEach((btn) => {
    const box = btn.closest(".work-img");
    let v = null;
    const stop = () => {
      if (v) { v.pause(); v.remove(); v = null; }
      btn.classList.remove("playing");
      btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace("Pause", "Voir la vidéo"));
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (v) { stop(); return; }
      v = document.createElement("video");
      v.className = "card-video";
      v.muted = true; v.defaultMuted = true; v.playsInline = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.preload = "auto";
      v.src = btn.dataset.video;
      v.addEventListener("ended", stop);
      box.insertBefore(v, btn);
      btn.classList.add("playing");
      btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace("Voir la vidéo", "Pause"));
      const p = v.play(); if (p) p.catch(() => {});
    });
    btn.addEventListener("keydown", (e) => e.stopPropagation());
  });

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
