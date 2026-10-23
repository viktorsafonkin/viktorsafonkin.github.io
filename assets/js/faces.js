/* ============================================================
   Мимика: девушка моргает, женщины поют.
   Работает по заранее выверенным координатам глаз и рта
   на крупных планах (frag-05 и frag-01).
   ============================================================ */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const CFG = {
    // «Ночные игры» — веки на глазах
    4: {
      type: "blink",
      eyes: [[0.437, 0.565], [0.522, 0.565]],
      rx: 0.026,
      ry: 0.0115,
    },
    // «Время» — рты поющих
    0: {
      type: "sing",
      mouths: [[0.709, 0.155, 0.0], [0.884, 0.185, 1.7]],
      rx: 0.017,
      ry: 0.013,
    },
  };

  function build(canvas, cfg) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let visible = false;
    let raf = null;
    let last = 0;
    let t = 0;
    let nextBlink = 2 + Math.random() * 3;
    let blinkAt = -1;
    let doubleBlink = false;

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

    function eyelid(nx, ny, alpha) {
      const x = nx * w;
      const y = ny * h;
      const rx = cfg.rx * w;
      const ry = cfg.ry * h;

      ctx.save();
      ctx.filter = "none";
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56,36,30," + alpha.toFixed(3) + ")";
      ctx.fill();
      ctx.restore();
    }

    function mouth(nx, ny, open, alpha) {
      const x = nx * w;
      const y = ny * h;
      const rx = cfg.rx * w;
      const ry = cfg.ry * h * open;

      ctx.save();
      ctx.filter = "none";
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(74,26,22," + alpha.toFixed(3) + ")";
      ctx.fill();
      ctx.restore();
    }

    function frame(ts) {
      if (!visible || document.hidden) {
        raf = null;
        return;
      }
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.06);
      last = ts;
      t += dt;

      ctx.clearRect(0, 0, w, h);

      if (cfg.type === "blink") {
        if (blinkAt < 0 && t > nextBlink) {
          blinkAt = t;
          nextBlink = t + 3.2 + Math.random() * 4.8;
          doubleBlink = Math.random() < 0.25;
        }
        if (blinkAt >= 0) {
          const p = (t - blinkAt) / 0.15;
          if (p > 1) {
            if (doubleBlink && p < 1.6) {
              // второй, быстрый — продолжаем кривую
            } else {
              blinkAt = -1;
            }
          }
          const cp = Math.min(p, 1);
          const a = Math.sin(Math.PI * cp) * 0.62;
          cfg.eyes.forEach((e) => eyelid(e[0], e[1], a));
        }
      }

      if (cfg.type === "sing") {
        cfg.mouths.forEach((m) => {
          const k = 0.5 + 0.5 * Math.sin(t * 2.6 + m[2]);
          const open = 0.45 + k * 0.95;
          mouth(m[0], m[1], open, 0.22 + k * 0.16);
        });
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    size();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible) start();
        });
      },
      { rootMargin: "60px", threshold: 0.05 }
    );
    io.observe(canvas);

    window.addEventListener("resize", size, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && visible) start();
    });
  }

  function boot() {
    document.querySelectorAll("canvas.face").forEach((c) => {
      const fig = c.closest(".work");
      if (!fig) return;
      const cfg = CFG[Number(fig.dataset.i)];
      if (cfg) build(c, cfg);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
