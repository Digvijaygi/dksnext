import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
}

interface Planet {
  name: string;
  radius: number;
  distance: number;
  angle: number;
  speed: number;
  color: string;
  glowColor: string;
  hasRing: boolean;
  ringColor?: string;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const timeRef = useRef(0);
  
  // 360-degree view control based on cursor/touch position
  const rotationAngle = useRef(0);
  const targetRotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Stars aur Planets ka initialization logic
    const initSpace = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clean starfield (Static Background)
      starsRef.current = [];
      const starColors = ['#ffffff', '#e0e8ff', '#ffe8e0', '#ffe0f0'];
      
      // Faint background stars
      for (let i = 0; i < 400; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.5 + Math.random() * 1,
          opacity: 0.2 + Math.random() * 0.4,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 2,
        });
      }
      
      // Bright stars
      for (let i = 0; i < 80; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.5 + Math.random() * 2,
          opacity: 0.5 + Math.random() * 0.4,
          color: '#ffffff',
          twinkleSpeed: 0.3 + Math.random() * 1,
        });
      }

      // Planets setup with realistic proportions
      const baseDistance = Math.min(width, height) * 0.05;
      planetsRef.current = [
        { name: 'Mercury', radius: 2.5, distance: baseDistance * 1.2, angle: 0, speed: 0.0048, color: '#b0a89c', glowColor: '#b0a89c30', hasRing: false },
        { name: 'Venus', radius: 3.5, distance: baseDistance * 1.7, angle: 0.8, speed: 0.0035, color: '#e6b856', glowColor: '#e6b85630', hasRing: false },
        { name: 'Earth', radius: 4, distance: baseDistance * 2.3, angle: 1.6, speed: 0.003, color: '#4a90d9', glowColor: '#4a90d930', hasRing: false },
        { name: 'Mars', radius: 3.2, distance: baseDistance * 2.9, angle: 2.4, speed: 0.0025, color: '#e0764a', glowColor: '#e0764a30', hasRing: false },
        { name: 'Jupiter', radius: 8.5, distance: baseDistance * 4.0, angle: 3.2, speed: 0.0018, color: '#d8a27a', glowColor: '#d8a27a30', hasRing: false },
        { name: 'Saturn', radius: 7.2, distance: baseDistance * 5.0, angle: 4.0, speed: 0.0014, color: '#f2cd9b', glowColor: '#f2cd9b30', hasRing: true, ringColor: 'rgba(210, 180, 140, 0.6)' },
        { name: 'Uranus', radius: 5.5, distance: baseDistance * 6.2, angle: 4.8, speed: 0.001, color: '#b0e0e6', glowColor: '#b0e0e630', hasRing: false },
        { name: 'Neptune', radius: 5.3, distance: baseDistance * 7.3, angle: 5.6, speed: 0.0008, color: '#4169e1', glowColor: '#4169e130', hasRing: false },
      ];
    };

    const drawStars = (ctx: CanvasRenderingContext2D, time: number) => {
      for (const star of starsRef.current) {
        const twinkle = 0.7 + Math.sin(time * star.twinkleSpeed) * 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.fill();
        
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.opacity * twinkle * 0.3;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      const glowRadius = radius * 3;
      const glowGrad = ctx.createRadialGradient(x, y, radius, x, y, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 200, 100, 0.4)`);
      glowGrad.addColorStop(0.3, `rgba(255, 150, 50, 0.15)`);
      glowGrad.addColorStop(0.6, `rgba(255, 100, 0, 0.05)`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      const sunGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
      sunGrad.addColorStop(0, '#fff8e7');
      sunGrad.addColorStop(0.3, '#ffe4a0');
      sunGrad.addColorStop(0.6, '#ffcc66');
      sunGrad.addColorStop(0.9, '#ff9933');
      sunGrad.addColorStop(1, '#ff6600');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      color: string,
      glowColor: string,
      hasRing: boolean,
      ringColor: string | undefined,
      planetName: string
    ) => {
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      const planetGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      planetGrad.addColorStop(0, color);
      planetGrad.addColorStop(0.7, color);
      planetGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet Details
      if (planetName === 'Jupiter') {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#b87333';
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(x - radius, y + i * radius * 0.4, radius * 2, radius * 0.15);
        }
        ctx.fillStyle = '#cc5544';
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.3, y + radius * 0.2, radius * 0.25, radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (planetName === 'Saturn' && hasRing) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.6);
        ctx.strokeStyle = ringColor || 'rgba(210, 180, 140, 0.7)';
        ctx.lineWidth = radius * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.4, radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawOrbitPaths = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 0.6;
      for (const planet of planetsRef.current) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    // Global Window/Screen-based Mouse Move Handler (Bina click ke smoothly chalega)
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      // Left edge = 0, Right edge = 1
      const normalizedX = Math.max(0, Math.min(1, e.clientX / windowWidth));
      // Map to full 360 degrees (2 * Math.PI)
      targetRotation.current = normalizedX * Math.PI * 2;
    };

    // Mobile / Touch devices slider handler
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const windowWidth = window.innerWidth;
      const normalizedX = Math.max(0, Math.min(1, e.touches[0].clientX / windowWidth));
      targetRotation.current = normalizedX * Math.PI * 2;
    };

    let animationId: number;

    // High performance smooth 120fps loop loop
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      timeRef.current += 0.015; // Slow smooth time
      const time = timeRef.current;
      
      // Smooth LERP (Linear Interpolation) -> No jerky rotation
      rotationAngle.current += (targetRotation.current - rotationAngle.current) * 0.06;
      
      // Clear with Space Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#070714');
      gradient.addColorStop(0.5, '#04040b');
      gradient.addColorStop(1, '#010105');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 1. Stars Draw (Static background - No rotation)
      drawStars(ctx, time);
      
      // 2. Solar System Rotation Layer Setup
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle.current); // Rotate everything around center Sun
      ctx.translate(-centerX, -centerY);
      
      // Orbit paths (Rotates with view)
      drawOrbitPaths(ctx, centerX, centerY);
      
      // Sun Center
      const sunRadius = Math.min(width, height) * 0.035;
      drawSun(ctx, centerX, centerY, sunRadius);
      
      // Update & Draw Individual Planets
      for (const planet of planetsRef.current) {
        planet.angle += planet.speed; // Normal orbital speed
        
        const planetX = centerX + Math.cos(planet.angle) * planet.distance;
        const planetY = centerY + Math.sin(planet.angle) * planet.distance;
        
        drawPlanet(
          ctx, 
          planetX, 
          planetY, 
          planet.radius, 
          planet.color, 
          planet.glowColor, 
          planet.hasRing,
          planet.ringColor,
          planet.name
        );
      }
      
      ctx.restore();
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initSpace();
    };

    // Event Listeners bind to 'window' for flawless edge-to-edge tracking
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });

    // Initial Trigger
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        display: 'block',
        width: '100vw',
        height: '100vh',
        userSelect: 'none',
        cursor: 'crosshair',
        backgroundColor: '#010105'
      }}
    />
  );
};

export default GalaxyBackground;
