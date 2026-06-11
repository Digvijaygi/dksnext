import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
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
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const init = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clean starfield - not too many stars
      starsRef.current = [];
      const starColors = ['#ffffff', '#e0e8ff', '#ffe8e0', '#ffe0f0'];
      
      // Background stars (small, faint)
      for (let i = 0; i < 400; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.5 + Math.random() * 1,
          opacity: 0.2 + Math.random() * 0.4,
          speed: 0.001 + Math.random() * 0.003,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 2,
        });
      }
      
      // Bright stars (fewer, larger)
      for (let i = 0; i < 80; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.5 + Math.random() * 2,
          opacity: 0.5 + Math.random() * 0.4,
          speed: 0.002 + Math.random() * 0.004,
          color: '#ffffff',
          twinkleSpeed: 0.3 + Math.random() * 1,
        });
      }

      // Planets - clean and simple
      const baseDistance = Math.min(width, height) * 0.08;
      planetsRef.current = [
        { name: 'Mars', radius: 5, distance: baseDistance, angle: 0, speed: 0.003, color: '#e0764a', glowColor: '#e0764a40', hasRing: false },
        { name: 'Earth', radius: 6, distance: baseDistance * 1.6, angle: 1.2, speed: 0.0022, color: '#4a90d9', glowColor: '#4a90d940', hasRing: false },
        { name: 'Jupiter', radius: 12, distance: baseDistance * 2.5, angle: 2.5, speed: 0.0015, color: '#d4a574', glowColor: '#d4a57440', hasRing: false },
        { name: 'Saturn', radius: 10, distance: baseDistance * 3.3, angle: 3.8, speed: 0.0011, color: '#f4d59e', glowColor: '#f4d59e40', hasRing: true },
      ];
    };

    const drawStars = (ctx: CanvasRenderingContext2D, time: number, width: number, height: number) => {
      for (const star of starsRef.current) {
        // Subtle twinkling
        const twinkle = 0.7 + Math.sin(time * star.twinkleSpeed) * 0.3;
        const opacity = star.opacity * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        
        // Glow for brighter stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity * 0.3;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number) => {
      // Sun glow
      const glowRadius = radius * 2.5;
      const glowGrad = ctx.createRadialGradient(x, y, radius, x, y, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 200, 100, 0.3)`);
      glowGrad.addColorStop(0.5, `rgba(255, 150, 50, 0.1)`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, radius);
      sunGrad.addColorStop(0, '#fff5e0');
      sunGrad.addColorStop(0.4, '#ffdd88');
      sunGrad.addColorStop(0.8, '#ffaa44');
      sunGrad.addColorStop(1, '#ff8833');
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
      time: number
    ) => {
      // Planet glow
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet body
      const planetGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      planetGrad.addColorStop(0, color);
      planetGrad.addColorStop(0.8, color);
      planetGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Rings for Saturn
      if (hasRing) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.5);
        ctx.strokeStyle = 'rgba(210, 180, 140, 0.5)';
        ctx.lineWidth = radius * 0.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.4, radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawOrbitPaths = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      ctx.setLineDash([5, 8]);
      ctx.lineWidth = 0.5;
      for (const planet of planetsRef.current) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    let animationId: number;
    let lastTime = 0;

    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      timeRef.current += 16;
      const time = timeRef.current;
      
      // Clear with deep space gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#060612');
      gradient.addColorStop(1, '#02020a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars
      drawStars(ctx, time, width, height);
      
      // Draw orbit paths
      drawOrbitPaths(ctx, centerX, centerY);
      
      // Draw Sun
      const sunRadius = Math.min(width, height) * 0.035;
      drawSun(ctx, centerX, centerY, sunRadius, time);
      
      // Update and draw planets
      for (const planet of planetsRef.current) {
        planet.angle += planet.speed;
        
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
          time
        );
      }
      
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default GalaxyBackground;
