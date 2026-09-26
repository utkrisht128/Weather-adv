import { useEffect, useRef } from "react";

const rand = (a, b) => a + Math.random() * (b - a);

const CLOUDS = { clear: 0, partly: 4, cloudy: 9, fog: 6, drizzle: 7, rain: 8, snow: 7, storm: 10 };

// Full-screen animated sky: clouds, rain, snow, stars, lightning, sun glow and fog,
// driven by the current conditions.
export default function WeatherScene({ scene, isDay, intensity = 0.5 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let flash = 0;
    let bolt = null;
    let shooting = null;

    const wet = ["rain", "drizzle", "storm"].includes(scene);
    const cloudCount = CLOUDS[scene] ?? 4;
    const starCount = !isDay && ["clear", "partly"].includes(scene) ? 160 : 0;
    const dropCount = wet ? Math.round((scene === "drizzle" ? 90 : 160) + 220 * intensity) : 0;
    const flakeCount = scene === "snow" ? Math.round(80 + 200 * intensity) : 0;

    let clouds = [];
    let stars = [];
    let drops = [];
    let flakes = [];
    let fogBands = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      clouds = Array.from({ length: cloudCount }, () => ({
        x: rand(-0.2, 1.1) * w,
        y: rand(0.02, scene === "fog" ? 0.9 : 0.45) * h,
        r: rand(90, 220),
        v: rand(0.05, 0.25),
        a: rand(0.12, scene === "storm" ? 0.45 : 0.3),
      }));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.75,
        r: rand(0.3, 1.4),
        p: Math.random() * Math.PI * 2,
        s: rand(0.01, 0.04),
      }));
      drops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        l: rand(10, 24),
        v: rand(9, 16) * (scene === "drizzle" ? 0.6 : 1),
      }));
      flakes = Array.from({ length: flakeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1, 3.5),
        v: rand(0.4, 1.4),
        p: Math.random() * Math.PI * 2,
      }));
      fogBands =
        scene === "fog"
          ? Array.from({ length: 5 }, (_, i) => ({ y: (0.3 + i * 0.15) * h, x: rand(0, w), v: rand(0.1, 0.3) }))
          : [];
    }

    function makeBolt() {
      const pts = [[rand(0.15, 0.85) * w, 0]];
      const end = h * rand(0.4, 0.7);
      while (pts[pts.length - 1][1] < end) {
        const [x, y] = pts[pts.length - 1];
        pts.push([x + rand(-40, 40), y + rand(20, 50)]);
      }
      return { pts, life: 1 };
    }

    function drawGlow(t) {
      const pulse = 1 + Math.sin(t / 2000) * 0.05;
      const gx = w * 0.82;
      const gy = h * 0.12;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 380 * pulse);
      g.addColorStop(0, isDay ? "rgba(255,236,170,0.55)" : "rgba(200,215,255,0.22)");
      g.addColorStop(0.35, isDay ? "rgba(255,200,120,0.15)" : "rgba(160,180,255,0.06)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function drawStars() {
      ctx.fillStyle = "#fff";
      for (const s of stars) {
        s.p += s.s;
        ctx.globalAlpha = 0.4 + Math.sin(s.p) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (starCount && !shooting && Math.random() < 0.002) {
        shooting = { x: rand(0.1, 0.7) * w, y: rand(0.05, 0.3) * h, life: 1 };
      }
      if (shooting) {
        const p = 1 - shooting.life;
        const hx = shooting.x + p * 300;
        const hy = shooting.y + p * 120;
        const g = ctx.createLinearGradient(hx - 80, hy - 32, hx, hy);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, `rgba(255,255,255,${shooting.life})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx - 80, hy - 32);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        shooting.life -= 0.02;
        if (shooting.life <= 0) shooting = null;
      }
    }

    function drawClouds() {
      const tint = scene === "storm" ? "60,65,85" : isDay ? "255,255,255" : "150,160,190";
      for (const c of clouds) {
        c.x += c.v;
        if (c.x - c.r * 1.6 > w) c.x = -c.r * 1.6;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 1.6);
        g.addColorStop(0, `rgba(${tint},${c.a})`);
        g.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.r * 1.6, c.r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFog() {
      for (const f of fogBands) {
        f.x = (f.x + f.v) % w;
        const g = ctx.createLinearGradient(0, f.y - 60, 0, f.y + 60);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, `rgba(255,255,255,${isDay ? 0.18 : 0.08})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, f.y - 60, w, 120);
      }
    }

    function drawRain() {
      ctx.strokeStyle = isDay ? "rgba(220,235,255,0.45)" : "rgba(180,200,240,0.35)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.v;
        d.x -= d.v * 0.15;
        if (d.y > h) {
          d.y = -d.l;
          d.x = Math.random() * (w + 100);
        }
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * 0.15, d.y + d.l);
      }
      ctx.stroke();
    }

    function drawSnow() {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const f of flakes) {
        f.p += 0.01;
        f.y += f.v;
        f.x += Math.sin(f.p) * 0.6;
        if (f.y > h) {
          f.y = -5;
          f.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawLightning() {
      if (!bolt && Math.random() < 0.004) {
        bolt = makeBolt();
        flash = 0.5;
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(220,225,255,${flash})`;
        ctx.fillRect(0, 0, w, h);
        flash = flash < 0.01 ? 0 : flash * 0.85;
      }
      if (bolt) {
        ctx.strokeStyle = `rgba(255,255,255,${bolt.life})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#b9c6ff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        bolt.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.shadowBlur = 0;
        bolt.life -= 0.05;
        if (bolt.life <= 0) bolt = null;
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      if (scene === "clear" || scene === "partly") drawGlow(t);
      if (stars.length) drawStars();
      drawClouds();
      if (fogBands.length) drawFog();
      if (drops.length) drawRain();
      if (flakes.length) drawSnow();
      if (scene === "storm" && !reduced) drawLightning();
      if (!reduced) raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      resize();
      init();
      if (reduced) frame(0);
    };
    resize();
    init();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [scene, isDay, intensity]);

  return <canvas ref={ref} className="scene" aria-hidden="true" />;
}
