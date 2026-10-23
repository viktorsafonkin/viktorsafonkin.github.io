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
        p.hue = (this.hue == null ? 28 : this.hue) + Math.random() * 18;
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
    // Блик: мягкая четырёхлучевая искра, вспыхивает и гаснет на месте
    glint: {
      blend: "screen",
      region: [0.1, 0.1, 0.9, 0.5],
      count: 3,
      spawn(p, w, h, r) {
        const [x0, y0, x1, y1] = r;
        p.x = (x0 + Math.random() * (x1 - x0)) * w;
        p.y = (y0 + Math.random() * (y1 - y0)) * h;
        p.vx = 0; p.vy = 0;
        p.size = 7 + Math.random() * 9;
        p.life = 0;
        p.max = 2.2 + Math.random() * 2.2;
        p.delay = Math.random() * 3;
        p.hue = this.hue == null ? 40 : this.hue;
      },
      draw(ctx, p) {
        const t = p.life - p.delay;
        const d = p.max - p.delay;
        if (t <= 0 || d <= 0) return;
        const a = Math.sin(Math.PI * Math.min(t / d, 1));
        const s = p.size * (0.6 + 0.4 * a);
        const c = "hsla(" + p.hue + ",80%,88%,";
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 0.9);
        g.addColorStop(0, c + (a * 0.75) + ")");
        g.addColorStop(1, c + "0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c + (a * 0.55) + ")";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - s * 2.2, p.y); ctx.lineTo(p.x + s * 2.2, p.y);
        ctx.moveTo(p.x, p.y - s * 1.6); ctx.lineTo(p.x, p.y + s * 1.6);
        ctx.stroke();
      },
    },

    // Световая полоса: тонкий луч скользит по лазеру / свету
    sweep: {
      blend: "screen",
      region: [0.5, 0.15, 1.0, 0.4],
      count: 1,
      spawn(p, w, h, r) {
        p.vx = 0; p.vy = 0;
        p.life = 0;
        p.max = 5 + Math.random() * 3;
        p.r = r; p.w = w; p.h = h;
        p.hue = this.hue == null ? 330 : this.hue;
      },
      draw(ctx, p) {
        const k = p.life / 2.4;           // проход ~2.4 с, потом пауза
        if (k >= 1) return;
        const [x0, y0, x1, y1] = p.r;
        const ax = x0 * p.w, ay = y1 * p.h, bx = x1 * p.w, by = y0 * p.h;
        const cx = ax + (bx - ax) * k, cy = ay + (by - ay) * k;
        const a = Math.sin(Math.PI * k);
        const rad = Math.max(8, p.w * 0.09);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, "hsla(" + p.hue + ",90%,90%," + (a * 0.55) + ")");
        g.addColorStop(1, "hsla(" + p.hue + ",90%,70%,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      },
    },


    // Рябь: едва заметные светлые волны медленно плывут по картине
    ripple: {
      blend: "soft-light",
      region: [0, 0, 1, 1],
      count: 3,
      spawn(p, w, h, r, initial) {
        p.vx = 0; p.vy = 0;
        p.x = 0; p.y = 0;
        p.life = 0;
        p.max = 14 + Math.random() * 8;
        p.y0 = Math.random() * h;
        p.speed = 6 + Math.random() * 6;
        p.amp = 4 + Math.random() * 5;
        p.len = 90 + Math.random() * 80;
        p.phase = Math.random() * 6.28;
        p.w = w; p.h = h;
      },
      draw(ctx, p, a) {
        const w = p.w, h = p.h;
        const y = (p.y0 + p.life * p.speed) % (h + 40) - 20;
        ctx.strokeStyle = "rgba(255,255,255," + (a * 0.16) + ")";
        ctx.lineWidth = 10;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const yy = y + Math.sin(x / p.len * 6.28 + p.phase + p.life * 0.5) * p.amp;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      },
    },


    // Шум: мелкое мерцающее «телевизионное» зерно (заранее готовые плитки)
    noise: {
      blend: "overlay",
      region: [0, 0, 1, 1],
      count: 1,
      spawn(p, w, h) {
        p.vx = 0; p.vy = 0; p.x = 0; p.y = 0;
        p.life = 0; p.max = 1e9; p.w = w; p.h = h;
        p.t = 0; p.i = 0; p.ox = 0; p.oy = 0;
      },
      tiles: null,
      draw(ctx, p) {
        const S = SCENES.noise;
        if (!S.tiles) {
          S.tiles = [];
          for (let k = 0; k < 4; k++) {
            const c = document.createElement("canvas");
            c.width = c.height = 96;
            const g = c.getContext("2d");
            const im = g.createImageData(96, 96);
            for (let j = 0; j < im.data.length; j += 4) {
              const v = Math.random() * 255;
              im.data[j] = im.data[j + 1] = im.data[j + 2] = v;
              im.data[j + 3] = 255;
            }
            g.putImageData(im, 0, 0);
            S.tiles.push(ctx.createPattern(c, "repeat"));
          }
        }
        p.t += 1;
        if (p.t % 4 === 0) {           // ~15 кадров/с
          p.i = (p.i + 1) % S.tiles.length;
          p.ox = Math.random() * 96; p.oy = Math.random() * 96;
        }
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.translate(-p.ox, -p.oy);
        ctx.fillStyle = S.tiles[p.i];
        ctx.fillRect(0, 0, p.w + 96, p.h + 96);
        ctx.restore();
      },
    },

    // Снег
    snow: {
      blend: "source-over",
      region: [0.0, -0.05, 1.0, 0.0],
      count: 42,
      spawn(p, w, h, r, initial) {
        p.x = Math.random() * w;
        p.y = initial ? Math.random() * h : -5;
        p.vy = 10 + Math.random() * 16;
        p.vx = -3 + Math.random() * 5;
        p.size = 1.1 + Math.random() * 1.7;
        p.life = 0;
        p.max = 30;
        p.alpha = 0.45 + Math.random() * 0.4;
        p.phase = Math.random() * 6.28;
      },
      draw(ctx, p, a) {
        p.x += Math.sin(p.life * 1.3 + p.phase) * 0.15;
        ctx.fillStyle = "rgba(90,100,115," + (a * p.alpha * 0.35) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255," + (a * p.alpha) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      },
    },
  };

  // во время прокрутки рисуем реже — меньше нагрузка на телефон
  let scrolling = false, scrollT = null, frameN = 0;
  window.addEventListener("scroll", () => {
    scrolling = true;
    clearTimeout(scrollT);
    scrollT = setTimeout(() => { scrolling = false; }, 180);
  }, { passive: true });

  function parseLayer(tok) {
    const [name, rest] = tok.split("@");
    const base = SCENES[name];
    if (!base) return null;
    const L = Object.create(base);
    if (rest) {
      const opts = rest.split(";");
      const reg = opts[0].split(",").map(Number);
      if (reg.length === 4 && reg.every(isFinite)) L.region = reg;
      opts.slice(1).forEach((o) => {
        const [k, v] = o.split("=");
        if (k === "hue") L.hue = Number(v);
        if (k === "n") L.count = Number(v);
      });
    }
    return L;
  }

  function Field(canvas, spec) {
    const layers = (spec || "").trim().split(/\s+/).map(parseLayer).filter(Boolean);
    if (!layers.length) return;

    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let visible = false;
    let raf = null;
    let last = 0;

    function size() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    function init() {
      if (!size()) return false;
      layers.forEach((L) => {
        L.parts = [];
        for (let i = 0; i < L.count; i++) {
          const p = {};
          L.spawn(p, w, h, L.region, true);
          p.life = Math.random() * p.max;
          L.parts.push(p);
        }
      });
      return true;
    }

    function step(dt) {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      for (const L of layers) {
        ctx.globalCompositeOperation = L.blend;
        for (const p of L.parts) {
          p.life += dt;
          p.x += (p.vx || 0) * dt;
          p.y += (p.vy || 0) * dt;
          if (p.rot !== undefined) p.rot += p.vr * dt;

          if (p.life > p.max || p.y > h + 40 || p.y < -60 || p.x > w + 80 || p.x < -80) {
            L.spawn(p, w, h, L.region, false);
            p.life = 0;
          }

          const fadeIn = Math.min(p.life / 0.8, 1);
          const fadeOut = Math.min((p.max - p.life) / 1.6, 1);
          const a = Math.max(0, Math.min(fadeIn, fadeOut));
          if (isFinite(p.x) && isFinite(p.y)) L.draw(ctx, p, a);
        }
      }
    }

    let ready = false;
    function loop(t) {
      if (!visible || document.hidden) {
        raf = null;
        return;
      }
      if (!ready) ready = init();
      if (ready) {
        if (!last) last = t;
        const dt = Math.min((t - last) / 1000, 0.05);
        last = t;
        if (!scrolling || (++frameN & 3) === 0) step(scrolling ? dt * 4 : dt);
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    }

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

    window.addEventListener("resize", () => { ready = init(); }, { passive: true });

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
