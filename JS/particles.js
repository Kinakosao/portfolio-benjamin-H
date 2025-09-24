// Fond interactif style "code/game": particules reliées, réactives au pointeur.
class ParticleBg {
    constructor(canvas) {
      this.c = canvas.getContext("2d", { alpha: true });
      this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      this.resize = this.resize.bind(this);
      this.tick = this.tick.bind(this);
      this.onMove = this.onMove.bind(this);
  
      this.particles = [];
      this.mouse = { x: -9999, y: -9999 };
      this.opts = { count: 90, speed: 0.3, linkDist: 120, radius: 2.1 };
      this.resize();
      window.addEventListener("resize", this.resize, { passive: true });
      window.addEventListener("pointermove", this.onMove, { passive: true });
      this.init();
      requestAnimationFrame(this.tick);
    }
    resize() {
      const { canvas } = this.c;
      canvas.width = innerWidth * this.pixelRatio;
      canvas.height = innerHeight * this.pixelRatio;
      this.c.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }
    init() {
      this.particles = Array.from({ length: this.opts.count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * this.opts.speed,
        vy: (Math.random() - 0.5) * this.opts.speed
      }));
    }
    onMove(e) { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }
    tick() {
      const { c, particles: p, opts, mouse } = this;
      c.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < p.length; i++) {
        const a = p[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > innerWidth) a.vx *= -1;
        if (a.y < 0 || a.y > innerHeight) a.vy *= -1;
  
        // Attraction légère du pointeur
        const dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx*dx + dy*dy;
        if (d2 < 16000) { a.vx += dx * -0.00002; a.vy += dy * -0.00002; }
  
        // Dessin point
        c.fillStyle = "rgba(110,231,255,.9)";
        c.beginPath(); c.arc(a.x, a.y, opts.radius, 0, Math.PI * 2); c.fill();
  
        // Liens
        for (let j = i + 1; j < p.length; j++) {
          const b = p[j];
          const ddx = a.x - b.x, ddy = a.y - b.y;
          const d = Math.hypot(ddx, ddy);
          if (d < opts.linkDist) {
            const alpha = 1 - d / opts.linkDist;
            c.strokeStyle = `rgba(179,136,255,${alpha * 0.5})`;
            c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
          }
        }
      }
      requestAnimationFrame(this.tick);
    }
  }
  export { ParticleBg };
  