export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  type: string;
  life: number;
  maxLife: number;
}

export interface ParticleConfig {
  particleCount: number;
  particles: Array<{
    type: string;
    color: string;
    size: number;
    speed: number;
    opacity: number;
    count: number;
  }>;
  background: {
    overlay: string;
    description: string;
  };
  behavior: {
    turbulence: number;
    drift: number;
    sinkRate: number;
  };
  effects: {
    glow: boolean;
    trails: boolean;
    pulse: boolean;
  };
}

export class ParticleSimulation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private config: ParticleConfig;
  private animationId: number | null = null;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement, config: ParticleConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    
    this.config.particles.forEach((particleType) => {
      for (let i = 0; i < particleType.count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * particleType.speed,
          vy: Math.random() * particleType.speed * 0.5,
          size: particleType.size * (0.5 + Math.random() * 0.5),
          color: particleType.color,
          opacity: particleType.opacity * (0.7 + Math.random() * 0.3),
          type: particleType.type,
          life: Math.random() * 100,
          maxLife: 100
        });
      }
    });
  }

  private updateParticle(particle: Particle) {
    // Update position
    particle.x += particle.vx + this.config.behavior.drift * 0.5;
    particle.y += particle.vy + this.config.behavior.sinkRate * 0.3;

    // Add turbulence
    if (this.config.behavior.turbulence > 0) {
      particle.vx += (Math.random() - 0.5) * this.config.behavior.turbulence * 0.1;
      particle.vy += (Math.random() - 0.5) * this.config.behavior.turbulence * 0.1;
    }

    // Damping
    particle.vx *= 0.99;
    particle.vy *= 0.99;

    // Wrap around edges
    if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
    if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
    if (particle.y > this.canvas.height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * this.canvas.width;
    }
    if (particle.y < -particle.size) particle.y = this.canvas.height + particle.size;

    // Update life for pulsing effect
    particle.life = (particle.life + 1) % particle.maxLife;
  }

  private drawParticle(particle: Particle) {
    const ctx = this.ctx;
    
    // Calculate pulse effect
    let sizeMultiplier = 1;
    let opacityMultiplier = 1;
    
    if (this.config.effects.pulse) {
      const pulsePhase = (particle.life / particle.maxLife) * Math.PI * 2;
      sizeMultiplier = 1 + Math.sin(pulsePhase) * 0.2;
      opacityMultiplier = 0.8 + Math.sin(pulsePhase) * 0.2;
    }

    const size = particle.size * sizeMultiplier;
    const opacity = particle.opacity * opacityMultiplier;

    ctx.save();

    // Draw glow effect
    if (this.config.effects.glow) {
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size * 2
      );
      gradient.addColorStop(0, this.hexToRGBA(particle.color, opacity * 0.6));
      gradient.addColorStop(0.5, this.hexToRGBA(particle.color, opacity * 0.3));
      gradient.addColorStop(1, this.hexToRGBA(particle.color, 0));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw main particle
    ctx.fillStyle = this.hexToRGBA(particle.color, opacity);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw subtle highlight
    const highlight = ctx.createRadialGradient(
      particle.x - size * 0.3, particle.y - size * 0.3, 0,
      particle.x, particle.y, size
    );
    highlight.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`);
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private hexToRGBA(hex: string, alpha: number): string {
    // Handle hex colors with or without #
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private animate() {
    this.time++;
    
    // Clear canvas with trail effect or full clear
    if (this.config.effects.trails) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw background overlay
    if (this.config.background.overlay) {
      this.ctx.fillStyle = this.config.background.overlay;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Update and draw particles
    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  public start() {
    if (this.animationId === null) {
      this.animate();
    }
  }

  public stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public updateConfig(newConfig: ParticleConfig) {
    this.config = newConfig;
    this.initParticles();
  }
}
