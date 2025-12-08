import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

interface Planet {
  x: number;
  y: number;
  size: number;
  color: string;
  ringColor?: string;
  hasRing: boolean;
  orbitSpeed: number;
  orbitRadius: number;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
}

interface Comet {
  x: number;
  y: number;
  speed: number;
  tailLength: number;
  active: boolean;
  angle: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const cometRef = useRef<Comet>({ x: 0, y: 0, speed: 8, tailLength: 150, active: false, angle: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initElements();
    };

    const initElements = () => {
      // Stars
      const starCount = Math.floor((canvas.width * canvas.height) / 2500);
      starsRef.current = [];
      const starColors = ['#ffffff', '#a855f7', '#3b82f6', '#ec4899', '#fbbf24', '#10b981', '#06b6d4'];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 3 + 1,
          size: Math.random() * 2.5 + 0.3,
          opacity: Math.random() * 0.8 + 0.2,
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }

      // Nebulas - more vibrant
      nebulasRef.current = [];
      const nebulaColors = [
        'rgba(139, 92, 246, 0.18)',
        'rgba(59, 130, 246, 0.15)',
        'rgba(236, 72, 153, 0.12)',
        'rgba(16, 185, 129, 0.1)',
        'rgba(251, 191, 36, 0.1)',
        'rgba(6, 182, 212, 0.12)',
        'rgba(244, 63, 94, 0.1)'
      ];
      
      for (let i = 0; i < 8; i++) {
        nebulasRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 500 + 250,
          color: nebulaColors[i % nebulaColors.length],
          opacity: Math.random() * 0.6 + 0.3
        });
      }

      // Planets
      planetsRef.current = [
        { x: canvas.width * 0.15, y: canvas.height * 0.2, size: 40, color: '#8b5cf6', hasRing: true, ringColor: '#c4b5fd', orbitSpeed: 0.0003, orbitRadius: 0 },
        { x: canvas.width * 0.85, y: canvas.height * 0.7, size: 25, color: '#f97316', hasRing: false, orbitSpeed: 0.0005, orbitRadius: 0 },
        { x: canvas.width * 0.7, y: canvas.height * 0.15, size: 18, color: '#06b6d4', hasRing: false, orbitSpeed: 0.0008, orbitRadius: 0 },
      ];

      // Asteroids
      asteroidsRef.current = [];
      for (let i = 0; i < 15; i++) {
        asteroidsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 0.5 + 0.2,
          angle: Math.random() * Math.PI * 2
        });
      }
    };

    const drawNebula = (nebula: Nebula, offsetX: number, offsetY: number, time: number) => {
      const x = nebula.x + offsetX * 0.2;
      const y = nebula.y + offsetY * 0.2;
      const pulse = Math.sin(time * 0.0005) * 20;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.size + pulse);
      gradient.addColorStop(0, nebula.color);
      gradient.addColorStop(0.5, nebula.color.replace(/[\d.]+\)$/, '0.05)'));
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(x, y, nebula.size + pulse, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawStar = (star: Star, offsetX: number, offsetY: number, time: number) => {
      const parallaxX = offsetX * star.z * 0.5;
      const parallaxY = offsetY * star.z * 0.5;
      
      const x = star.x + parallaxX;
      const y = star.y + parallaxY;
      
      const twinkle = Math.sin(time * 0.004 + star.x * 0.02 + star.y * 0.01) * 0.4 + 0.6;
      const currentOpacity = star.opacity * twinkle;
      
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = currentOpacity;
      ctx.fill();
      
      if (star.size > 1.5) {
        // Cross sparkle effect
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = currentOpacity * 0.5;
        ctx.beginPath();
        ctx.moveTo(x - star.size * 3, y);
        ctx.lineTo(x + star.size * 3, y);
        ctx.moveTo(x, y - star.size * 3);
        ctx.lineTo(x, y + star.size * 3);
        ctx.stroke();
        
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 5);
        glowGradient.addColorStop(0, star.color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, star.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = currentOpacity * 0.25;
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
    };

    const drawPlanet = (planet: Planet, offsetX: number, offsetY: number, time: number) => {
      const wobble = Math.sin(time * planet.orbitSpeed) * 10;
      const x = planet.x + offsetX * 0.4 + wobble;
      const y = planet.y + offsetY * 0.4;
      
      // Planet glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, planet.size * 2);
      glowGradient.addColorStop(0, planet.color);
      glowGradient.addColorStop(0.5, planet.color + '40');
      glowGradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, planet.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Planet body
      const planetGradient = ctx.createRadialGradient(x - planet.size * 0.3, y - planet.size * 0.3, 0, x, y, planet.size);
      planetGradient.addColorStop(0, '#ffffff40');
      planetGradient.addColorStop(0.3, planet.color);
      planetGradient.addColorStop(1, planet.color + '80');
      
      ctx.beginPath();
      ctx.arc(x, y, planet.size, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();
      
      // Ring
      if (planet.hasRing && planet.ringColor) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.4);
        ctx.scale(1, 0.3);
        ctx.strokeStyle = planet.ringColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, planet.size * 1.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, planet.size * 2.1, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawAsteroid = (asteroid: Asteroid, time: number) => {
      asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
      asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;
      
      if (asteroid.x < -50) asteroid.x = canvas.width + 50;
      if (asteroid.x > canvas.width + 50) asteroid.x = -50;
      if (asteroid.y < -50) asteroid.y = canvas.height + 50;
      if (asteroid.y > canvas.height + 50) asteroid.y = -50;
      
      ctx.fillStyle = '#6b7280';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawComet = (time: number) => {
      const comet = cometRef.current;
      
      if (!comet.active && Math.random() < 0.001) {
        comet.active = true;
        comet.x = canvas.width + 50;
        comet.y = Math.random() * canvas.height * 0.5;
        comet.angle = Math.PI + (Math.random() - 0.5) * 0.5;
      }
      
      if (comet.active) {
        comet.x += Math.cos(comet.angle) * comet.speed;
        comet.y += Math.sin(comet.angle) * comet.speed;
        
        // Comet tail
        const tailGradient = ctx.createLinearGradient(
          comet.x, comet.y,
          comet.x - Math.cos(comet.angle) * comet.tailLength,
          comet.y - Math.sin(comet.angle) * comet.tailLength
        );
        tailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        tailGradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.5)');
        tailGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(
          comet.x - Math.cos(comet.angle) * comet.tailLength,
          comet.y - Math.sin(comet.angle) * comet.tailLength
        );
        ctx.strokeStyle = tailGradient;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Comet head
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Glow
        const glowGradient = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 20);
        glowGradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        if (comet.x < -200 || comet.y > canvas.height + 200) {
          comet.active = false;
        }
      }
    };

    const drawGalaxySpiral = (time: number, offsetX: number, offsetY: number) => {
      const centerX = canvas.width * 0.5 + offsetX * 0.1;
      const centerY = canvas.height * 0.6 + offsetY * 0.1;
      
      ctx.globalAlpha = 0.03;
      for (let arm = 0; arm < 3; arm++) {
        const armOffset = (arm * Math.PI * 2) / 3;
        for (let i = 0; i < 100; i++) {
          const angle = i * 0.15 + armOffset + time * 0.00005;
          const radius = i * 5;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius * 0.4;
          
          ctx.beginPath();
          ctx.arc(x, y, 2 + i * 0.05, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#3b82f6';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let time = 0;
    const animate = () => {
      time += 16;
      
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      bgGradient.addColorStop(0, '#0a0a1a');
      bgGradient.addColorStop(0.3, '#070714');
      bgGradient.addColorStop(0.6, '#050510');
      bgGradient.addColorStop(1, '#020208');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const offsetX = (mousePosRef.current.x - 0.5) * 100;
      const offsetY = (mousePosRef.current.y - 0.5) * 100;
      
      // Draw galaxy spiral (background)
      drawGalaxySpiral(time, offsetX, offsetY);
      
      // Draw nebulas
      nebulasRef.current.forEach(nebula => {
        drawNebula(nebula, offsetX, offsetY, time);
      });
      
      // Draw asteroids
      asteroidsRef.current.forEach(asteroid => {
        drawAsteroid(asteroid, time);
      });
      
      // Draw stars
      starsRef.current.forEach(star => {
        drawStar(star, offsetX, offsetY, time);
      });
      
      // Draw planets
      planetsRef.current.forEach(planet => {
        drawPlanet(planet, offsetX, offsetY, time);
      });
      
      // Draw comet
      drawComet(time);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };

    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#020208' }}
    />
  );
};
