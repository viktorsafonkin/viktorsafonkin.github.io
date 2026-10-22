/* ============================================================
   «Живые» фрагменты — минимальная анимация по сюжету картины.
   Поверх статичного кропа рисуется тонкий слой частиц:
   лепестки, искры, туман, потёки, пыль.
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const SCENES = {
    // Время: в глубине горит, летят искры
    embers: {
      blend: "screen",
      region: [0.15, 0.18, 0.75, 0.95],
      count: 14,
      spawn(p, w, h, r, initial) {
        const [x0, y0, x1, y1] = r;
        p.x = (x0 + Math.random() * (x1 - x0)) * w;
        p.y = (initial ? Math.random() : 0.75 + Math.random() * 0.25) * h;
        p.vy = -(10 + Math.random() * 26);
        p.vx = (Math.random() - 0.5) * 8;
        p.size = 0.8 + Math.random() * 1.9;
        p.life = 0;
        p.max = 3 + Math.random() * 3.5;
        p.hue = 28 + Math.random() * 18;
      },
      draw(ctx, p, a) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, "hsla(" + p.hue + ",95%,72%," + (a * 0.9) + ")");
        g.addColorStop(1, "hsla(" + p.hue + ",95%,60%,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      },
    },

    // Вечная весна / Розовый ветер: лепестки
    petals: {
      blend: "screen",
      region: [0.05, 0.0, 0.95, 1.0],
      count: 11,
      spawn(p, w, h, r, initial) {
        const [x0, y0, x1, y1] = r;
        p.x = (x0 + Math.random() * (x1 - x0)) * w;
        p.y = (y0 + Math.random() * (y1 - y0)) * h;
        if (initial) p.y = (y0 + Math.random() * (y1 - y0)) * h;
        p.vy = 6 + Math.random() * 14;
        p.vx = -6 + Math.random() * 12;
        p.size = 2.2 + Math.random() * 3.4;
        p.rot = Math.random() * Math.PI;
        p.vr = (Math.random() - 0.5) * 1.6;
        p.phase = Math.random() * 6.28;
        p.life = 0;
        p.max = 9 + Math.random() * 9;
      },
      draw(ctx, p, a) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = "rgba(240,196,208," + (a * 0.75) + ")";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    },

    // Красный смех: потёки краски
    drips: {
      blend: "source-over",
      region: [0.2, 0.15, 0.85, 0.95],
      count: 7,
      spawn(p, w, h, r, initial) {
        const [x0, y0, x1, y1] = r;
        p.x = (x0 + Math.random() * (x1 - x0)) * w;
        p.y = initial ? (y0 + Math.random() * (y1 - y0)) * h : (y0 - 0.05) * h;
        p.vy = 5 + Math.random() * 12;
        p.len = 8 + Math.random() * 22;
        p.size = 0.9 + Math.random() * 1.1;
        p.life = 0;
        p.max = 12 + Math.random() * 10;
        p.alpha = 0.25 + Math.random() * 0.25;
      },
      draw(ctx, p, a) {
        const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.len);
        g.addColorStop(0, "rgba(126,32,24,0)");
        g.addColorStop(1, "rgba(126,32,24," + (a * p.alpha) + ")");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - p.size / 2, p.y, p.size, p.len);
        ctx.fillStyle = "rgba(126,32,24," + (a * p.alpha * 1.1) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.len, p.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      },
    },

    // Туман / ночь
    fog: {
      blend: "screen",
      region: [0.0, 0.35, 1.0, 1.0],
      count: 5,
      spawn(p, w, h, r, initial) {
        const [x0, y0, x1, y1] = r;
        p.x = (x0 + Math.random() * (x1 - x0)) * w;
        p.y = (y0 + Math.random() * (y1 - y0)) * h;
        p.vx = 3 + Math.random() * 7;
        p.vy = (Math.random() - 0.5) * 1.5;
        p.size = 70 + Math.random() * 110;
        p.life = 0;
        p.max = 16 + Math.random() * 12;
        p.alpha = 0.05 + Math.random() * 0.055;
      },
      draw(ctx, p, a) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, "rgba(214,224,232," + (a * p.alpha) + ")");
        g.addColorStop(1, "rgba(214,224,232,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      },
    },

    // Пыль в воздухе — для тихих сцен
    dust: {
      blend: "screen",
      region: [0.0, 0.0, 1.0, 1.0],
      count: 16,
      spawn(p, w, h, r, initial) {
        const [x0, y0, x1, y1] = r;
        p.x = (x0 + Math.random() * (x1 - x0)) * w;
        p.y = (y0 + Math.random() * (y1 - y0)) * h;
        p.vx = (Math.random() - 0.5) * 6;
        p.vy = (Math.random() - 0.5) * 4;
        p.size = 0.6 + Math.random() * 1.2;
        p.life = 0;
        p.max = 10 + Math.random() * 12;
        p.alpha = 0.10 + Math.random() * 0.22;
      },
      draw(ctx, p, a) {
        ctx.fillStyle = "rgba(233,226,214," + (a * p.alpha) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      },
    },
  };

  function Field(canvas, sceneName) {
    const scene = SCENES[sceneName];
    if (!scene) return;

    const ctx = canvas.getContext("2d");
    const parts = [];
    let w = 0, h = 0, dpr = 1;
    let visible = false;
    let raf = null;
    let last = 0;

    function size() {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      size();
      parts.length = 0;
      for (let i = 0; i < scene.count; i++) {
        const p = {};
        scene.spawn(p, w, h, scene.region, true);
        p.life = Math.random() * p.max;
        parts.push(p);
      }
    }

    function step(dt) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = scene.blend;

      for (const p of parts) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.rot !== undefined) p.rot += p.vr * dt;

        if (p.life > p.max || p.y > h + 40 || p.y < -60 || p.x > w + 80 || p.x < -80) {
          scene.spawn(p, w, h, scene.region, false);
          p.life = 0;
        }

        const fadeIn = Math.min(p.life / 0.8, 1);
        const fadeOut = Math.min((p.max - p.life) / 1.6, 1);
        const a = Math.max(0, Math.min(fadeIn, fadeOut));

        scene.draw(ctx, p, a);
      }
    }

    function loop(t) {
      if (!visible || document.hidden) {
        raf = null;
        return;
      }
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      step(dt);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    }

    init();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible) start();
        });
      },
      { rootMargin: "80px", threshold: 0.05 }
    );
    io.observe(canvas);

    window.addEventListener("resize", () => {
      init();
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && visible) start();
    });
  }

  function boot() {
    document.querySelectorAll("canvas.fx").forEach((c) => Field(c, c.dataset.fx));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
