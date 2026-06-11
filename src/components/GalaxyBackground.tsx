import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
  pulseSpeed?: number;
  pulsePhase?: number;
}

interface Planet {
  name: string;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  hasRing?: boolean;
  ringColor?: string;
  ringInnerColor?: string;
  atmosphere?: boolean;
  atmosphereColor?: string;
  shadow?: boolean;
  moons?: { radius: number; orbitRadius: number; speed: number; angle: number; color: string }[];
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
  tailWidth: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  colors: string[];
  opacity: number;
  pulseSpeed: number;
  phase: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const dustParticlesRef = useRef<DustParticle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const blackHoleRef = useRef({ rotation: 0, pulsePhase: 0, accretionPhase: 0 });
  const timeRef = useRef(0);

  // Helper: blend colors for nebula
  const blendColors = (ctx: CanvasRenderingContext2D, colors: string[], x: number, y: number, radiusX: number, radiusY: number, rotation: number, opacity: number, phase: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity * (0.7 + Math.sin(phase) * 0.3);
    
    // Create multiple overlapping gradients for rich nebula effect
    const gradient = ctx.createLinearGradient(-radiusX, -radiusY, radiusX, radiusY);
    colors.forEach((color, idx) => {
      gradient.addColorStop(idx / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add inner bright core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX * 0.3);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, 0.15)`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX * 0.5, radiusY * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initUniverse();
    };

    const initUniverse = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Enhanced starfield with depth layering
      const starCount = Math.min(800, Math.floor((width * height) / 3000));
      starsRef.current = [];
      const starColors = ['#ffffff', '#ffe4c4', '#87ceeb', '#ffd700', '#ffaa66', '#aaccff', '#ffccaa'];
      
      // Create stars in layers (far, mid, near)
      for (let i = 0; i < starCount; i++) {
        const layer = Math.random();
        let size, z, speed;
        if (layer < 0.6) {
          size = Math.random() * 1.2 + 0.3;
          z = Math.random() * 800 + 200;
          speed = Math.random() * 0.2 + 0.05;
        } else if (layer < 0.9) {
          size = Math.random() * 2 + 0.8;
          z = Math.random() * 400 + 100;
          speed = Math.random() * 0.4 + 0.15;
        } else {
          size = Math.random() * 3.5 + 1.5;
          z = Math.random() * 150 + 50;
          speed = Math.random() * 0.6 + 0.3;
        }
        
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: z,
          size: size,
          opacity: Math.random() * 0.7 + 0.3,
          speed: speed,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          pulseSpeed: 0.002 + Math.random() * 0.003,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Add faint background stars
      for (let i = 0; i < starCount * 2; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 1200,
          size: Math.random() * 0.6 + 0.1,
          opacity: Math.random() * 0.3 + 0.05,
          speed: 0.02,
          color: '#aaaaff',
        });
      }

      // Nebulae - cosmic gas clouds
      nebulaeRef.current = [
        {
          x: width * 0.2, y: height * 0.3,
          radiusX: width * 0.25, radiusY: height * 0.2,
          rotation: 0.5,
          colors: ['rgba(80, 30, 120, 0.4)', 'rgba(60, 20, 100, 0.3)', 'rgba(40, 10, 80, 0.2)', 'transparent'],
          opacity: 0.6,
          pulseSpeed: 0.002,
          phase: 0,
        },
        {
          x: width * 0.7, y: height * 0.6,
          radiusX: width * 0.3, radiusY: height * 0.25,
          rotation: -0.3,
          colors: ['rgba(30, 60, 130, 0.4)', 'rgba(20, 40, 100, 0.3)', 'rgba(10, 20, 70, 0.2)', 'transparent'],
          opacity: 0.5,
          pulseSpeed: 0.0015,
          phase: 1,
        },
        {
          x: width * 0.5, y: height * 0.2,
          radiusX: width * 0.2, radiusY: height * 0.15,
          rotation: 0.8,
          colors: ['rgba(140, 60, 30, 0.3)', 'rgba(100, 40, 20, 0.2)', 'transparent'],
          opacity: 0.4,
          pulseSpeed: 0.003,
          phase: 2,
        },
        {
          x: width * 0.85, y: height * 0.4,
          radiusX: width * 0.18, radiusY: height * 0.22,
          rotation: -0.6,
          colors: ['rgba(90, 40, 110, 0.35)', 'rgba(70, 30, 90, 0.25)', 'transparent'],
          opacity: 0.45,
          pulseSpeed: 0.0025,
          phase: 1.5,
        },
      ];

      // Dust particles
      const dustCount = Math.min(400, Math.floor((width * height) / 8000));
      dustParticlesRef.current = [];
      for (let i = 0; i < dustCount; i++) {
        dustParticlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.15,
          color: `rgba(${100 + Math.random() * 100}, ${80 + Math.random() * 80}, ${60 + Math.random() * 60}, ${Math.random() * 0.1})`,
        });
      }

      // Planets - More realistic orbital mechanics
      const baseOrbit = Math.min(width, height) * 0.07;
      planetsRef.current = [
        { name: 'Mercury', radius: 3.5, color: '#c9b69a', orbitRadius: baseOrbit, orbitSpeed: 0.0048, angle: Math.random() * Math.PI * 2, shadow: true },
        { name: 'Venus', radius: 5, color: '#e6b856', orbitRadius: baseOrbit * 1.45, orbitSpeed: 0.0035, angle: Math.random() * Math.PI * 2, atmosphere: true, atmosphereColor: '#ffcc8844', shadow: true },
        { name: 'Earth', radius: 5.5, color: '#4a90d9', orbitRadius: baseOrbit * 1.95, orbitSpeed: 0.0029, angle: Math.random() * Math.PI * 2,
          atmosphere: true, atmosphereColor: '#88ccff44', shadow: true,
          moons: [{ radius: 1.5, orbitRadius: 12, speed: 0.012, angle: 0, color: '#c0c0c0' }] },
        { name: 'Mars', radius: 4, color: '#cf5c36', orbitRadius: baseOrbit * 2.55, orbitSpeed: 0.0023, angle: Math.random() * Math.PI * 2, shadow: true },
        { name: 'Jupiter', radius: 12, color: '#c9aa7a', orbitRadius: baseOrbit * 3.5, orbitSpeed: 0.0013, angle: Math.random() * Math.PI * 2,
          atmosphere: true, atmosphereColor: '#ffccaa33', shadow: true,
          moons: [
            { radius: 2.5, orbitRadius: 22, speed: 0.007, angle: 0, color: '#ffccaa' },
            { radius: 2, orbitRadius: 28, speed: 0.0055, angle: Math.PI, color: '#aa9988' },
            { radius: 1.8, orbitRadius: 34, speed: 0.0045, angle: 1.2, color: '#ccaa99' }
          ] },
        { name: 'Saturn', radius: 10.5, color: '#e8cfaa', orbitRadius: baseOrbit * 4.3, orbitSpeed: 0.001, angle: Math.random() * Math.PI * 2,
          hasRing: true, ringColor: 'rgba(200, 170, 120, 0.6)', ringInnerColor: 'rgba(160, 130, 90, 0.4)', shadow: true },
        { name: 'Uranus', radius: 7.5, color: '#8fd6d6', orbitRadius: baseOrbit * 5.1, orbitSpeed: 0.0007, angle: Math.random() * Math.PI * 2,
          hasRing: true, ringColor: 'rgba(120, 180, 180, 0.4)', ringInnerColor: 'rgba(100, 150, 150, 0.3)', shadow: true },
        { name: 'Neptune', radius: 7, color: '#3a60d0', orbitRadius: baseOrbit * 5.9, orbitSpeed: 0.00055, angle: Math.random() * Math.PI * 2, shadow: true, atmosphere: true, atmosphereColor: '#4488ff33' },
      ];

      // Shooting stars - more realistic trails
      shootingStarsRef.current = [];
      for (let i = 0; i < 5; i++) {
        shootingStarsRef.current.push({
          x: 0, y: 0,
          length: 60 + Math.random() * 80,
          speed: 8 + Math.random() * 12,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.6,
          opacity: 0,
          active: false,
          tailWidth: 1.5 + Math.random() * 1.5,
          color: `hsl(${40 + Math.random() * 30}, 100%, ${60 + Math.random() * 30}%)`,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Subtle parallax effect based on mouse position
      mouseRef.current = {
        x: (e.clientX - canvas.width / 2) / canvas.width,
        y: (e.clientY - canvas.height / 2) / canvas.height,
      };
    };

    // Render planet with shadows and atmosphere
    const renderPlanet = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      color: string, 
      hasShadow: boolean = false,
      hasAtmosphere: boolean = false,
      atmosphereColor: string = '',
      lightAngle: number = 0.8
    ) => {
      // Shadow side (dark side of planet)
      if (hasShadow) {
        const shadowGrad = ctx.createLinearGradient(x - radius * 0.5, y - radius * 0.3, x + radius * 0.7, y + radius * 0.5);
        shadowGrad.addColorStop(0, color);
        shadowGrad.addColorStop(0.7, color);
        shadowGrad.addColorStop(1, '#1a0a2a');
        ctx.fillStyle = shadowGrad;
      } else {
        const planetGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        planetGrad.addColorStop(0, color);
        planetGrad.addColorStop(0.9, '#2a1a3a');
        ctx.fillStyle = planetGrad;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Atmosphere glow
      if (hasAtmosphere && atmosphereColor) {
        const atmGrad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.2, radius * 0.8, x, y, radius * 1.3);
        atmGrad.addColorStop(0, 'transparent');
        atmGrad.addColorStop(0.7, atmosphereColor);
        atmGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = atmGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Specular highlight
      const highlight = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.25, 0, x - radius * 0.25, y - radius * 0.25, radius * 0.4);
      highlight.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
      highlight.addColorStop(1, 'transparent');
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      
      const deltaTime = Math.min(32, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      timeRef.current += deltaTime;
      const time = timeRef.current;
      
      blackHoleRef.current.rotation += 0.005;
      blackHoleRef.current.pulsePhase += 0.012;
      blackHoleRef.current.accretionPhase += 0.02;
      
      // Deep space background with radial gradient from center (galactic core)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#04040c');
      bgGrad.addColorStop(0.5, '#03030a');
      bgGrad.addColorStop(1, '#010105');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      
      // Draw nebulae (behind stars)
      nebulaeRef.current.forEach(nebula => {
        nebula.phase += nebula.pulseSpeed * deltaTime;
        blendColors(
          ctx, nebula.colors, 
          nebula.x, nebula.y, 
          nebula.radiusX, nebula.radiusY, 
          nebula.rotation, 
          nebula.opacity,
          nebula.phase
        );
      });
      
      // Draw dust particles
      dustParticlesRef.current.forEach(dust => {
        ctx.fillStyle = dust.color;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Stars with parallax and twinkling
      starsRef.current.forEach(star => {
        // Parallax based on mouse and star depth
        const parallaxFactor = star.z / 800;
        const offsetX = mouseRef.current.x * star.z * 0.08;
        const offsetY = mouseRef.current.y * star.z * 0.08;
        
        let xPos = star.x + offsetX;
        let yPos = star.y + offsetY;
        
        // Wrap around edges for infinite field
        if (xPos < 0) xPos = width;
        if (xPos > width) xPos = 0;
        if (yPos < 0) yPos = height;
        if (yPos > height) yPos = 0;
        
        const twinkle = star.pulseSpeed 
          ? 0.5 + Math.sin(time * 0.002 * star.speed + (star.pulsePhase || 0)) * 0.5
          : 0.7 + Math.random() * 0.3;
        
        const hex = star.color;
        let r, g, b;
        if (hex.startsWith('#')) {
          r = parseInt(hex.slice(1, 3), 16);
          g = parseInt(hex.slice(3, 5), 16);
          b = parseInt(hex.slice(5, 7), 16);
        } else {
          r = g = b = 200;
        }
        
        // Star glow for brighter stars
        if (star.size > 1.2) {
          ctx.shadowBlur = star.size * 3;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        }
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity * twinkle})`;
        ctx.fill();
        
        // Reset shadow for small stars
        if (star.size <= 1.2) {
          ctx.shadowBlur = 0;
        }
      });
      ctx.shadowBlur = 0;
      
      // Shooting stars
      shootingStarsRef.current.forEach(star => {
        if (!star.active && Math.random() < 0.0008) {
          star.active = true;
          star.x = Math.random() * width * 0.6 + width * 0.2;
          star.y = Math.random() * height * 0.3;
          star.opacity = 0.9 + Math.random() * 0.3;
        }
        
        if (star.active) {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.008;
          
          if (star.opacity <= 0 || star.x > width + 200 || star.x < -200 || star.y > height + 200 || star.y < -200) {
            star.active = false;
          } else {
            // Tapered tail effect
            for (let i = 0; i < 3; i++) {
              const t = i / 3;
              const segmentOpacity = star.opacity * (1 - t);
              const segmentWidth = star.tailWidth * (1 - t);
              const segmentX = star.x - Math.cos(star.angle) * star.length * t;
              const segmentY = star.y - Math.sin(star.angle) * star.length * t;
              
              ctx.beginPath();
              ctx.moveTo(star.x, star.y);
              ctx.lineTo(segmentX, segmentY);
              ctx.strokeStyle = star.color;
              ctx.lineWidth = segmentWidth;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
            
            // Bright head
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.tailWidth * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.fill();
          }
        }
      });
      
      // Black hole (galactic core) - offset from center for dramatic effect
      const bhX = width * 0.55;
      const bhY = height * 0.45;
      const bhRadius = Math.min(width, height) * 0.045;
      
      ctx.save();
      ctx.translate(bhX, bhY);
      
      // Accretion disk glow layers
      const pulseScale = 1 + Math.sin(blackHoleRef.current.pulsePhase) * 0.05;
      for (let i = 4; i >= 0; i--) {
        const diskRadius = bhRadius * (2.5 + i * 0.5) * pulseScale;
        const grad = ctx.createRadialGradient(0, 0, bhRadius * 0.5, 0, 0, diskRadius);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.3, `rgba(255, ${100 + i * 30}, ${50 + i * 15}, ${0.08 - i * 0.01})`);
        grad.addColorStop(0.7, `rgba(200, ${80 + i * 20}, 40, ${0.04 - i * 0.007})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, diskRadius, diskRadius * 0.3, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Spiral accretion streams
      ctx.save();
      ctx.rotate(blackHoleRef.current.rotation);
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        for (let ang = 0; ang < Math.PI * 4; ang += 0.1) {
          const r = bhRadius * (1.2 + ang * 0.3);
          const xOff = Math.cos(ang + s * Math.PI) * r;
          const yOff = Math.sin(ang * 0.5) * r * 0.2;
          if (ang === 0) ctx.moveTo(xOff, yOff);
          else ctx.lineTo(xOff, yOff);
        }
        ctx.strokeStyle = `rgba(255, 150, 80, ${0.3 + Math.sin(blackHoleRef.current.accretionPhase + s) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
      
      // Event horizon
      const horizonGrad = ctx.createRadialGradient(-bhRadius * 0.2, -bhRadius * 0.2, 0, 0, 0, bhRadius);
      horizonGrad.addColorStop(0, '#000000');
      horizonGrad.addColorStop(0.7, '#0a0015');
      horizonGrad.addColorStop(1, '#1a0525');
      ctx.fillStyle = horizonGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Photon ring (Einstein ring)
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius + 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 180, 100, ${0.4 + Math.sin(blackHoleRef.current.pulsePhase * 3) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius - 1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 50, 30, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
      
      // Sun (star of the system) at center
      const sunRadius = Math.min(width, height) * 0.032;
      const sunPulse = Math.sin(time * 0.0025) * 1.5;
      
      // Solar corona layers
      for (let i = 3; i >= 0; i--) {
        const coronaRad = sunRadius * (1.6 + i * 0.4) + sunPulse * 0.5;
        const coronaGrad = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.8, centerX, centerY, coronaRad);
        coronaGrad.addColorStop(0, `rgba(255, 200, 100, ${0.2 - i * 0.04})`);
        coronaGrad.addColorStop(0.5, `rgba(255, 120, 50, ${0.12 - i * 0.025})`);
        coronaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coronaRad, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Sun body with granulation effect
      const sunGrad = ctx.createRadialGradient(centerX - sunRadius * 0.2, centerY - sunRadius * 0.2, 0, centerX, centerY, sunRadius + sunPulse);
      sunGrad.addColorStop(0, '#fff5c4');
      sunGrad.addColorStop(0.3, '#ffe480');
      sunGrad.addColorStop(0.6, '#ffa830');
      sunGrad.addColorStop(0.9, '#ff5a20');
      sunGrad.addColorStop(1, '#dd3a00');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius + sunPulse * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun spots (subtle)
      ctx.fillStyle = 'rgba(80, 40, 10, 0.2)';
      ctx.beginPath();
      ctx.ellipse(centerX + sunRadius * 0.3, centerY - sunRadius * 0.15, sunRadius * 0.2, sunRadius * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX - sunRadius * 0.1, centerY + sunRadius * 0.25, sunRadius * 0.12, sunRadius * 0.1, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Orbit paths (semi-transparent dashed)
      ctx.setLineDash([5, 10]);
      planetsRef.current.forEach(planet => {
        ctx.strokeStyle = 'rgba(100, 120, 160, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      
      // Update and draw planets
      planetsRef.current.forEach(planet => {
        planet.angle += planet.orbitSpeed * (deltaTime / 16);
        
        const orbitX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
        const orbitY = centerY + Math.sin(planet.angle) * planet.orbitRadius;
        
        // Planet glow
        const glowRad = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, planet.radius * 2.2);
        glowRad.addColorStop(0, `${planet.color}30`);
        glowRad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowRad;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Render planet with shadow and atmosphere
        renderPlanet(
          ctx, orbitX, orbitY, planet.radius, planet.color, 
          planet.shadow, planet.atmosphere, planet.atmosphereColor
        );
        
        // Rings for Saturn and Uranus
        if (planet.hasRing && planet.ringColor) {
          ctx.save();
          ctx.translate(orbitX, orbitY);
          ctx.rotate(0.5);
          ctx.shadowBlur = 0;
          
          // Outer ring
          ctx.strokeStyle = planet.ringColor;
          ctx.lineWidth = planet.radius * 0.35;
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.radius * 1.5, planet.radius * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner ring
          if (planet.ringInnerColor) {
            ctx.strokeStyle = planet.ringInnerColor;
            ctx.lineWidth = planet.radius * 0.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, planet.radius * 1.2, planet.radius * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          
          ctx.restore();
        }
        
        // Moons with orbital motion
        if (planet.moons) {
          planet.moons.forEach(moon => {
            moon.angle += moon.speed * (deltaTime / 16);
            const moonX = orbitX + Math.cos(moon.angle) * moon.orbitRadius;
            const moonY = orbitY + Math.sin(moon.angle) * moon.orbitRadius;
            
            // Moon shadow
            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.fillStyle = moon.color;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moon.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon highlight
            ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.beginPath();
            ctx.arc(moonX - moon.radius * 0.2, moonY - moon.radius * 0.2, moon.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });
      
      ctx.shadowBlur = 0;
      
      // Final touch: subtle lens flare effect from sun
      const flareGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
      flareGrad.addColorStop(0, 'rgba(255, 200, 100, 0.03)');
      flareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, 0, width, height);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animate(0);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#000005', display: 'block' }}
    />
  );
};

export default GalaxyBackground;
