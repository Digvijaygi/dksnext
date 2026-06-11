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
  ringColor?: string;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  
  // For 360-degree view control based on cursor position
  const rotationAngle = useRef(0);
  const targetRotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const init = () => {
      const width = canvas.width;
      const height = canvas.height;

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

      // All planets of solar system - realistic proportions and distances
      const baseDistance = Math.min(width, height) * 0.045;
      planetsRef.current = [
        { 
          name: 'Mercury', 
          radius: 2.5, 
          distance: baseDistance * 1.2, 
          angle: 0, 
          speed: 0.0048, 
          color: '#b0a89c', 
          glowColor: '#b0a89c30', 
          hasRing: false 
        },
        { 
          name: 'Venus', 
          radius: 3.5, 
          distance: baseDistance * 1.7, 
          angle: 0.8, 
          speed: 0.0035, 
          color: '#e6b856', 
          glowColor: '#e6b85630', 
          hasRing: false 
        },
        { 
          name: 'Earth', 
          radius: 4, 
          distance: baseDistance * 2.3, 
          angle: 1.6, 
          speed: 0.003, 
          color: '#4a90d9', 
          glowColor: '#4a90d930', 
          hasRing: false 
        },
        { 
          name: 'Mars', 
          radius: 3.2, 
          distance: baseDistance * 2.9, 
          angle: 2.4, 
          speed: 0.0025, 
          color: '#e0764a', 
          glowColor: '#e0764a30', 
          hasRing: false 
        },
        { 
          name: 'Jupiter', 
          radius: 8.5, 
          distance: baseDistance * 4.0, 
          angle: 3.2, 
          speed: 0.0018, 
          color: '#d8a27a', 
          glowColor: '#d8a27a30', 
          hasRing: false 
        },
        { 
          name: 'Saturn', 
          radius: 7.2, 
          distance: baseDistance * 5.0, 
          angle: 4.0, 
          speed: 0.0014, 
          color: '#f2cd9b', 
          glowColor: '#f2cd9b30', 
          hasRing: true,
          ringColor: 'rgba(210, 180, 140, 0.6)'
        },
        { 
          name: 'Uranus', 
          radius: 5.5, 
          distance: baseDistance * 6.2, 
          angle: 4.8, 
          speed: 0.001, 
          color: '#b0e0e6', 
          glowColor: '#b0e0e630', 
          hasRing: false 
        },
        { 
          name: 'Neptune', 
          radius: 5.3, 
          distance: baseDistance * 7.3, 
          angle: 5.6, 
          speed: 0.0008, 
          color: '#4169e1', 
          glowColor: '#4169e130', 
          hasRing: false 
        },
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
      
      // Sun body with realistic texture
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
      
      // Sun spots (subtle)
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#cc6600';
      ctx.beginPath();
      ctx.ellipse(x - radius * 0.2, y - radius * 0.15, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + radius * 0.25, y + radius * 0.1, radius * 0.12, radius * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
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
      planetName: string,
      time: number
    ) => {
      // Planet glow
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet body with shading
      const planetGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      planetGrad.addColorStop(0, color);
      planetGrad.addColorStop(0.7, color);
      planetGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add planet-specific details
      if (planetName === 'Jupiter') {
        // Jupiter's bands
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#b87333';
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(x - radius, y + i * radius * 0.4, radius * 2, radius * 0.15);
        }
        // Great Red Spot
        ctx.fillStyle = '#cc5544';
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.3, y + radius * 0.2, radius * 0.25, radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (planetName === 'Mars') {
        // Mars surface details
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.2, y - radius * 0.1, radius * 0.2, radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.3, y + radius * 0.2, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (planetName === 'Earth') {
        // Earth's subtle blue-green variation
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#2e8b57';
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.1, y - radius * 0.1, radius * 0.3, radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0e68c';
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.2, y + radius * 0.15, radius * 0.2, radius * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (planetName === 'Saturn') {
        // Saturn's subtle bands
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#c9a87d';
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(x - radius, y + i * radius * 0.3, radius * 2, radius * 0.1);
        }
        ctx.globalAlpha = 1;
      }
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // Rings for Saturn
      if (hasRing) {
        ctx.save();
        ctx.translate(x, y);
        const ringTilt = 0.6;
        ctx.rotate(ringTilt);
        
        // Inner ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ringColor || 'rgba(210, 180, 140, 0.7)';
        ctx.lineWidth = radius * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.4, radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Outer ring
        ctx.strokeStyle = 'rgba(200, 170, 130, 0.4)';
        ctx.lineWidth = radius * 0.25;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.7, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Gap in ring
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = radius * 0.08;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.55, radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
    };

    const drawOrbitPaths = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      ctx.setLineDash([5, 8]);
      ctx.lineWidth = 0.5;
      for (const planet of planetsRef.current) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    // Mouse move handler for cursor-based rotation (no click needed)
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Get cursor position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const canvasWidth = rect.width;
      
      // Calculate rotation angle based on cursor X position (0 to 1 range)
      // Left edge = 0 radians, Right edge = 2*PI radians (full circle)
      const normalizedX = Math.max(0, Math.min(1, mouseX / canvasWidth));
      // Map to full 360 degrees (2 * PI radians)
      const newAngle = normalizedX * Math.PI * 2;
      
      // Apply smooth lerp for better experience
      targetRotation.current = newAngle;
    };

    // Touch move handler for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || !e.touches[0]) return;
      
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const canvasWidth = rect.width;
      
      const normalizedX = Math.max(0, Math.min(1, touchX / canvasWidth));
      const newAngle = normalizedX * Math.PI * 2;
      
      targetRotation.current = newAngle;
    };

    let animationId: number;

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
      
      // Smooth rotation interpolation (lerp for smoother motion)
      rotationAngle.current += (targetRotation.current - rotationAngle.current) * 0.08;
      
      // Clear with deep space gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#060612');
      gradient.addColorStop(1, '#02020a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars (static background, not rotating)
      drawStars(ctx, time, width, height);
      
      // Save context state for rotation
      ctx.save();
      
      // Rotate the entire solar system around the center based on cursor position
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle.current);
      ctx.translate(-centerX, -centerY);
      
      // Draw orbit paths (they rotate with the system)
      drawOrbitPaths(ctx, centerX, centerY);
      
      // Draw Sun (always at center)
      const sunRadius = Math.min(width, height) * 0.04;
      drawSun(ctx, centerX, centerY, sunRadius, time);
      
      // Update and draw planets (with their own orbits)
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
          planet.ringColor,
          planet.name,
          time
        );
      }
      
      // Restore context state
      ctx.restore();
      
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Setup event listeners for cursor-based rotation (no click needed)
    const setupEventListeners = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      // Optional: reset rotation when mouse leaves canvas
      canvas.addEventListener('mouseleave', () => {
        // Smoothly return to center or keep last position
        // You can uncomment below to reset to center when mouse leaves
        // targetRotation.current = Math.PI; // Center position
      });
    };

    const removeEventListeners = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    setupEventListeners();
    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      removeEventListeners();
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
        userSelect: 'none',
        cursor: 'crosshair'
      }}
    />
  );
};

export default GalaxyBackground;
