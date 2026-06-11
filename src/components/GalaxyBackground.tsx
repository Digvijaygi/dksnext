import { useEffect, useRef, useState } from 'react';

interface Planet {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  angle: number;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  hasRing: boolean;
  ringColor?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Generate stars
  const generateStars = (width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < 800; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.2 + Math.random() * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    return stars;
  };

  // Planets data
  const initPlanets = (width: number, height: number) => {
    const baseDistance = Math.min(width, height) * 0.09;
    return [
      { name: 'Mercury', radius: 4, distance: baseDistance, speed: 0.02, angle: 0,
        color: '#c9b69a', gradientStart: '#e0cdb0', gradientEnd: '#a89070', hasRing: false },
      { name: 'Venus', radius: 5.5, distance: baseDistance * 1.45, speed: 0.014, angle: 1.2,
        color: '#e6c87a', gradientStart: '#f5e0a0', gradientEnd: '#c8a850', hasRing: false },
      { name: 'Earth', radius: 6, distance: baseDistance * 1.95, speed: 0.012, angle: 2.5,
        color: '#4a90d9', gradientStart: '#6ab0f0', gradientEnd: '#2a70b0', hasRing: false },
      { name: 'Mars', radius: 5, distance: baseDistance * 2.5, speed: 0.01, angle: 3.8,
        color: '#cf5c36', gradientStart: '#e07a50', gradientEnd: '#b03e20', hasRing: false },
      { name: 'Jupiter', radius: 13, distance: baseDistance * 3.4, speed: 0.007, angle: 4.5,
        color: '#d4a574', gradientStart: '#e8c090', gradientEnd: '#b88858', hasRing: false },
      { name: 'Saturn', radius: 11, distance: baseDistance * 4.2, speed: 0.0055, angle: 5.2,
        color: '#f4d59e', gradientStart: '#ffe8c0', gradientEnd: '#d4b070', hasRing: true, ringColor: 'rgba(200, 175, 120, 0.6)' },
      { name: 'Uranus', radius: 8, distance: baseDistance * 5.0, speed: 0.0045, angle: 6.0,
        color: '#7fdbda', gradientStart: '#a0f0f0', gradientEnd: '#60b0b0', hasRing: false },
      { name: 'Neptune', radius: 8, distance: baseDistance * 5.8, speed: 0.0038, angle: 6.8,
        color: '#4169e1', gradientStart: '#6080f0', gradientEnd: '#2049a0', hasRing: false },
    ];
  };

  // Draw stars with twinkle
  const drawStars = (ctx: CanvasRenderingContext2D, time: number) => {
    for (const star of starsRef.current) {
      const twinkle = 0.7 + Math.sin(time * 0.003 * star.twinkleSpeed + star.twinklePhase) * 0.3;
      const opacity = star.opacity * twinkle;
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 245, 235, ${opacity})`;
      ctx.fill();
      
      if (star.size > 1) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${opacity * 0.3})`;
        ctx.fill();
      }
    }
  };

  // Draw Sun
  const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number) => {
    const pulse = 1 + Math.sin(time * 0.005) * 0.02;
    const currentRadius = radius * pulse;
    
    // Outer glow
    for (let i = 3; i >= 0; i--) {
      const glowGrad = ctx.createRadialGradient(x, y, currentRadius * 0.5, x, y, currentRadius * (1.5 + i * 0.5));
      glowGrad.addColorStop(0, `rgba(255, 200, 80, ${0.12 - i * 0.02})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, currentRadius * (1.5 + i * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Sun body
    const sunGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, currentRadius);
    sunGrad.addColorStop(0, '#fff8e8');
    sunGrad.addColorStop(0.3, '#ffe890');
    sunGrad.addColorStop(0.7, '#ffb850');
    sunGrad.addColorStop(1, '#ff8030');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw planet
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
    // Planet glow
    ctx.fillStyle = `${gradientStart}30`;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Planet body
    const planetGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    planetGrad.addColorStop(0, gradientStart);
    planetGrad.addColorStop(0.7, gradientEnd);
    planetGrad.addColorStop(1, '#1a1a30');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Rings for Saturn
    if (hasRing && ringColor) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.5);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = radius * 0.35;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.5, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Draw orbit path
  const drawOrbit = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 120, 160, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Mouse handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(e.clientX);
    setLastY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;
    setRotationY(prev => prev + deltaX * 0.005);
    setRotationX(prev => Math.min(Math.max(prev + deltaY * 0.005, -0.8), 0.8));
    setLastX(e.clientX);
    setLastY(e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Convert 3D to 2D with rotation
  const rotatePoint = (x: number, z: number, rotY: number) => {
    const rotatedX = x * Math.cos(rotY) - z * Math.sin(rotY);
    const rotatedZ = x * Math.sin(rotY) + z * Math.cos(rotY);
    return { x: rotatedX, z: rotatedZ };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width;
    let height = canvas.height;
    let planets = initPlanets(width, height);
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      starsRef.current = generateStars(width, height);
      planets = initPlanets(width, height);
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    let time = 0;
    
    const animate = () => {
      if (!ctx || !canvas) return;
      
      width = canvas.width;
      height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      time++;
      timeRef.current = time;
      
      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(0.5, '#060612');
      bgGrad.addColorStop(1, '#02020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars
      drawStars(ctx, time);
      
      // Apply 3D rotation effect
      ctx.save();
      
      // Draw orbits (ellipses due to rotation)
      for (const planet of planets) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const angle = (i / 100) * Math.PI * 2;
          const x = Math.cos(angle) * planet.distance;
          const z = Math.sin(angle) * planet.distance;
          const rotated = rotatePoint(x, z, rotationY);
          const screenX = centerX + rotated.x;
          const screenY = centerY + rotated.z * Math.sin(rotationX);
          if (i === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.strokeStyle = 'rgba(100, 120, 160, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Update and draw planets
      for (const planet of planets) {
        planet.angle += planet.speed;
        
        // 3D position
        const x = Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.distance;
        const rotated = rotatePoint(x, z, rotationY);
        
        // Apply X rotation and perspective
        const perspectiveY = rotated.z * Math.sin(rotationX);
        const scale = 1 - Math.abs(rotated.z) * 0.0008;
        
        const screenX = centerX + rotated.x;
        const screenY = centerY + perspectiveY;
        const radiusScale = planet.radius * Math.max(0.3, Math.min(1.2, scale));
        
        if (screenX > -100 && screenX < width + 100) {
          drawPlanet(
            ctx, screenX, screenY, radiusScale,
            planet.gradientStart, planet.gradientEnd,
            planet.hasRing, planet.ringColor
          );
        }
      }
      
      // Draw Sun (center)
      drawSun(ctx, centerX, centerY, Math.min(width, height) * 0.045, time);
      
      ctx.restore();
      
      // Vignette
      const vignette = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.6);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.7, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      
      // Instructions
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Drag to rotate 3D view | 8 Planets orbiting the Sun', width / 2, height - 20);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotationX, rotationY]);
  
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default GalaxyBackground;
