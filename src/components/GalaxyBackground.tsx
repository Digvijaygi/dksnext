import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

interface Planet {
  name: string;
  radius: number;
  distance: number;
  angle: number;
  speed: number;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  hasRing: boolean;
  ringColor?: string;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate elegant starfield
    const generateStars = (width: number, height: number): Star[] => {
      const stars: Star[] = [];
      
      // Tiny background stars
      for (let i = 0; i < 800; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.3 + Math.random() * 0.5,
          opacity: 0.1 + Math.random() * 0.3,
          color: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`,
        });
      }
      
      // Medium stars
      for (let i = 0; i < 200; i++) {
        const brightness = 0.4 + Math.random() * 0.4;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.6 + Math.random() * 0.8,
          opacity: brightness,
          color: `rgba(255, 245, 235, ${brightness})`,
        });
      }
      
      // Bright stars with slight color variation
      const colors = ['#ffffff', '#ffe8d0', '#d0e8ff', '#ffd8e0'];
      for (let i = 0; i < 50; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.2 + Math.random() * 1.5,
          opacity: 0.6 + Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      
      return stars;
    };

    let starsRef = generateStars(canvas.width, canvas.height);

    const initPlanets = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const baseDistance = Math.min(width, height) * 0.095;
      
      return [
        { 
          name: 'Mercury', radius: 3.5, distance: baseDistance, 
          angle: 0, speed: 0.0045, 
          color: '#c9b69a', gradientStart: '#e0cdb0', gradientEnd: '#a89070',
          hasRing: false 
        },
        { 
          name: 'Venus', radius: 5, distance: baseDistance * 1.45, 
          angle: 1.8, speed: 0.0032, 
          color: '#e6c87a', gradientStart: '#f5e0a0', gradientEnd: '#c8a850',
          hasRing: false 
        },
        { 
          name: 'Earth', radius: 5.5, distance: baseDistance * 1.95, 
          angle: 2.5, speed: 0.0026, 
          color: '#4a90d9', gradientStart: '#6ab0f0', gradientEnd: '#2a70b0',
          hasRing: false 
        },
        { 
          name: 'Mars', radius: 4.5, distance: baseDistance * 2.5, 
          angle: 3.2, speed: 0.0021, 
          color: '#cf5c36', gradientStart: '#e07a50', gradientEnd: '#b03e20',
          hasRing: false 
        },
        { 
          name: 'Jupiter', radius: 11, distance: baseDistance * 3.4, 
          angle: 4.0, speed: 0.0014, 
          color: '#d4a574', gradientStart: '#e8c090', gradientEnd: '#b88858',
          hasRing: false 
        },
        { 
          name: 'Saturn', radius: 9.5, distance: baseDistance * 4.2, 
          angle: 5.1, speed: 0.0011, 
          color: '#f4d59e', gradientStart: '#ffe8c0', gradientEnd: '#d4b070',
          hasRing: true, ringColor: 'rgba(200, 175, 120, 0.5)'
        },
      ];
    };

    // Smooth star twinkling animation
    let starTwinkle = 0;
    
    const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      for (const star of starsRef) {
        const twinkle = 0.85 + Math.sin(time * 0.002 + star.x * 0.01) * 0.15;
        const finalOpacity = star.opacity * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        if (typeof star.color === 'string' && star.color.startsWith('rgba')) {
          const match = star.color.match(/[\d.]+/g);
          if (match) {
            ctx.fillStyle = `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${finalOpacity})`;
          }
        } else {
          ctx.fillStyle = star.color;
          ctx.globalAlpha = finalOpacity;
        }
        ctx.fill();
        
        // Subtle glow for brighter stars
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = finalOpacity * 0.15;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number) => {
      const pulse = 1 + Math.sin(time * 0.003) * 0.02;
      const currentRadius = radius * pulse;
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(x, y, currentRadius, x, y, currentRadius * 3);
      outerGlow.addColorStop(0, 'rgba(255, 200, 100, 0.25)');
      outerGlow.addColorStop(0.5, 'rgba(255, 150, 50, 0.08)');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, currentRadius * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, currentRadius);
      sunGrad.addColorStop(0, '#fff8e8');
      sunGrad.addColorStop(0.3, '#ffe890');
      sunGrad.addColorStop(0.7, '#ffb850');
      sunGrad.addColorStop(1, '#ff8030');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner bright core
      ctx.fillStyle = 'rgba(255, 255, 240, 0.4)';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, currentRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      gradientStart: string,
      gradientEnd: string,
      hasRing: boolean,
      ringColor?: string
    ) => {
      // Planet shadow (3D effect)
      const planetGrad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 0, x, y, radius);
      planetGrad.addColorStop(0, gradientStart);
      planetGrad.addColorStop(0.6, gradientEnd);
      planetGrad.addColorStop(1, '#1a1a30');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Soft atmosphere glow
      const atmGlow = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.3);
      atmGlow.addColorStop(0, 'transparent');
      atmGlow.addColorStop(0.7, `${gradientStart}20`);
      atmGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = atmGlow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Rings
      if (hasRing && ringColor) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.4);
        ctx.shadowBlur = 0;
        
        // Outer ring
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = radius * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.5, radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring detail
        ctx.strokeStyle = 'rgba(200, 175, 120, 0.3)';
        ctx.lineWidth = radius * 0.15;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.2, radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
    };

    const drawOrbits = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, planets: Planet[]) => {
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 0.5;
      for (const planet of planets) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 120, 160, 0.12)';
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    // Parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      mouseRef.current = {
        x: (e.clientX - canvas.width / 2) / canvas.width,
        y: (e.clientY - canvas.height / 2) / canvas.height,
      };
    };

    let time = 0;
    let planets = initPlanets(canvas.width, canvas.height);

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      time++;
      
      // Deep elegant background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#070714');
      bgGrad.addColorStop(0.4, '#050510');
      bgGrad.addColorStop(0.7, '#03030c');
      bgGrad.addColorStop(1, '#010108');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      
      // Apply subtle parallax
      const offsetX = mouseRef.current.x * 15;
      const offsetY = mouseRef.current.y * 10;
      
      ctx.save();
      ctx.translate(offsetX, offsetY);
      
      // Draw stars
      drawStars(ctx, width, height, time);
      
      // Draw orbits
      drawOrbits(ctx, centerX + offsetX * 0.3, centerY + offsetY * 0.3, planets);
      
      // Draw Sun
      const sunRadius = Math.min(width, height) * 0.03;
      drawSun(ctx, centerX + offsetX * 0.1, centerY + offsetY * 0.1, sunRadius, time);
      
      // Update and draw planets
      for (const planet of planets) {
        planet.angle += planet.speed;
        
        const planetX = centerX + offsetX * 0.5 + Math.cos(planet.angle) * planet.distance;
        const planetY = centerY + offsetY * 0.5 + Math.sin(planet.angle) * planet.distance;
        
        drawPlanet(
          ctx,
          planetX,
          planetY,
          planet.radius,
          planet.gradientStart,
          planet.gradientEnd,
          planet.hasRing,
          planet.ringColor
        );
      }
      
      ctx.restore();
      
      // Subtle vignette effect
      const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.6, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef = generateStars(canvas.width, canvas.height);
      planets = initPlanets(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
