/* ============================================================
   Фоновая музыка — тёмный эмбиент на Web Audio
   Генерируется на месте: дрон, ветер, редкие колокольчики.
   Никаких файлов и прав — всё синтезируется в браузере.
   ============================================================ */
(function () {
  "use strict";

  const btn = document.getElementById("sound");
  if (!btn) return;

  let ctx = null;
  let master = null;
  let built = false;
  let on = false;
  let bellTimer = null;

  const NOTES = [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66];

  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function brownNoise(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.2;
      }
    }
    return buf;
  }

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.ratio.value = 3;
    master.connect(comp);
    comp.connect(ctx.destination);

    // пространство
    const verb = ctx.createConvolver();
    verb.buffer = impulse(4.2, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    verb.connect(wet);
    wet.connect(master);

    // дрон: четыре голоса, расстроенные, с медленными LFO
    const voices = [
      { f: 55.0, type: "sine", g: 0.26, lfo: 0.021 },
      { f: 82.41, type: "triangle", g: 0.13, lfo: 0.033 },
      { f: 110.0, type: "sine", g: 0.10, lfo: 0.017 },
      { f: 164.81, type: "sine", g: 0.045, lfo: 0.041 },
    ];

    voices.forEach((v, i) => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.value = v.f;
      osc.detune.value = (i - 1.5) * 7;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 380;
      lp.Q.value = 0.7;

      const g = ctx.createGain();
      g.gain.value = v.g;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = v.lfo;
      const lg = ctx.createGain();
      lg.gain.value = v.g * 0.55;
      lfo.connect(lg);
      lg.connect(g.gain);

      osc.connect(lp);
      lp.connect(g);
      g.connect(master);
      g.connect(verb);

      osc.start();
      lfo.start();
    });

    // ветер
    const noise = ctx.createBufferSource();
    noise.buffer = brownNoise(8);
    noise.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 520;
    bp.Q.value = 0.9;

    const ng = ctx.createGain();
    ng.gain.value = 0.06;

    const nlfo = ctx.createOscillator();
    nlfo.frequency.value = 0.047;
    const nlg = ctx.createGain();
    nlg.gain.value = 240;
    nlfo.connect(nlg);
    nlg.connect(bp.frequency);

    noise.connect(bp);
    bp.connect(ng);
    ng.connect(master);
    ng.connect(verb);

    noise.start();
    nlfo.start();

    built = true;
  }

  function bell() {
    if (!on) return;

    const f = NOTES[Math.floor(Math.random() * NOTES.length)];
    const t = ctx.currentTime;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 9);

    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = f;

    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.28;

    o1.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(master);

    o1.start(t);
    o2.start(t);
    o1.stop(t + 9.2);
    o2.stop(t + 9.2);

    bellTimer = setTimeout(bell, 9000 + Math.random() * 14000);
  }

  let busy = false;

  function setUI() {
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Turn off background music" : "Turn on background music");
  }

  // плавно поднять / опустить громкость (без щелчков)
  function fade(to, sec) {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(to, t + sec);
  }

  // включить: только если ещё не играет; повторные вызовы ничего не делают
  let hold = false;   // видео/интервью играет — музыка молчит
  async function start() {
    if (on || busy || hold) return;
    busy = true;
    try {
      if (!built) build();
      if (ctx.state !== "running") await ctx.resume();
      if (ctx.state !== "running") return;      // браузер не разрешил — молчим, без писка
      on = true;
      fade(0.5, 3);
      clearTimeout(bellTimer);
      bellTimer = setTimeout(bell, 2600);
      setUI();
    } catch (e) {
      /* ignore */
    } finally {
      busy = false;
    }
  }

  function stop() {
    if (!on) return;
    on = false;
    clearTimeout(bellTimer);
    fade(0, 1.3);
    setUI();
  }

  let userOff = false;
  btn.addEventListener("click", () => {
    if (on) { userOff = true; stop(); }
    else { userOff = false; hold = false; start(); }
  });

  // автозапуск — только на настоящее касание/клик (не на прокрутку)
  let downX = 0, downY = 0, downT = 0, moved = false;
  function onDown(e) { downX = e.clientX; downY = e.clientY; downT = Date.now(); moved = false; }
  function onMove(e) { if (Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10) moved = true; }
  function onUp(e) {
    if (moved || Date.now() - downT > 600) return;  // это был свайп/скролл
    tryAuto(e);
  }
  function tryAuto(e) {
    if (on || userOff) return cleanup();
    if (e && e.target && btn.contains(e.target)) return cleanup();
    if (e && e.target && e.target.closest && e.target.closest("[data-no-music]")) return;
    start().then(() => { if (on) cleanup(); });
  }
  function onKey(e) { if (e.key === "Enter" || e.key === " ") tryAuto(e); }
  function cleanup() {
    window.removeEventListener("pointerdown", onDown, true);
    window.removeEventListener("pointermove", onMove, true);
    window.removeEventListener("pointerup", onUp, true);
    window.removeEventListener("keydown", onKey, true);
  }
  window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
  window.addEventListener("pointermove", onMove, { capture: true, passive: true });
  window.addEventListener("pointerup", onUp, { capture: true, passive: true });
  window.addEventListener("keydown", onKey, true);

  // сворачивание / другая вкладка: сначала плавно в тишину, потом пауза
  let hideT = null;
  function goQuiet() {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.setTargetAtTime(0, t, 0.04);       // ~150 мс до тишины
    clearTimeout(hideT);
    hideT = setTimeout(() => { if (document.hidden && ctx) ctx.suspend().catch(() => {}); }, 220);
  }
  function wakeUp() {
    clearTimeout(hideT);
    if (!ctx || !on || hold) return;
    ctx.resume().then(() => { if (on && !document.hidden) fade(0.5, 1.5); }).catch(() => {});
  }
  // внешний API: пауза на время видео
  window.SiteMusic = {
    hold: function () { hold = true; if (on) { stop(); } },
    release: function () { hold = false; }
  };
  document.addEventListener("visibilitychange", () => { document.hidden ? goQuiet() : wakeUp(); });
  window.addEventListener("pagehide", goQuiet);
  window.addEventListener("pageshow", () => { if (!document.hidden) wakeUp(); });
})();
