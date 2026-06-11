import { useEffect, useRef, useState, useCallback } from 'react';

interface Planet {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  angle: number;
  color: string;
  emissive: string;
  hasRing: boolean;
  ringColor?: string;
  ringInnerColor?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState({ x: 0, y: 0 });
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Generate 3D starfield with depth
  const generateStars = (width: number, height: number) => {
    const stars: Star[] = [];
    const starCount = 1500;
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 100,
        size: 0.5 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    return stars;
  };

  // Initialize planets with 3D positioning
  const initPlanets = () => {
    return [
      { 
        name: 'Mercury', radius: 0.8, distance: 4.5, speed: 0.025, angle: 0,
        color: '#c9b69a', emissive: '#8a7a60', hasRing: false 
      },
      { 
        name: 'Venus', radius: 1.0, distance: 6.5, speed: 0.018, angle: 1.2,
        color: '#e6c87a', emissive: '#b89850', hasRing: false 
      },
      { 
        name: 'Earth', radius: 1.1, distance: 8.5, speed: 0.015, angle: 2.1,
        color: '#4a90d9', emissive: '#2a60a0', hasRing: false 
      },
      { 
        name: 'Mars', radius: 0.9, distance: 10.5, speed: 0.012, angle: 3.0,
        color: '#cf5c36', emissive: '#9a3a18', hasRing: false 
      },
      { 
        name: 'Jupiter', radius: 2.2, distance: 14.5, speed: 0.008, angle: 3.8,
        color: '#d4a574', emissive: '#b08050', hasRing: false 
      },
      { 
        name: 'Saturn', radius: 1.9, distance: 17.5, speed: 0.007, angle: 4.5,
        color: '#f4d59e', emissive: '#c8a870', hasRing: true,
        ringColor: 'rgba(200, 175, 120, 0.7)', ringInnerColor: 'rgba(180, 155, 100, 0.5)'
      },
      { 
        name: 'Uranus', radius: 1.4, distance: 21.0, speed: 0.0055, angle: 5.2,
        color: '#7fdbda', emissive: '#5aaaa8', hasRing: false 
      },
      { 
        name: 'Neptune', radius: 1.4, distance: 24.5, speed: 0.0045, angle: 5.8,
        color: '#4169e1', emissive: '#2149b0', hasRing: false 
      },
    ];
  };

  // 3D to 2D projection
  const project3D = (x: number, y: number, z: number, width: number, height: number, rotX: number, rotY: number) => {
    // Rotate around Y axis (horizontal rotation)
    let rotatedX = x * Math.cos(rotY) + z * Math.sin(rotY);
    let rotatedZ = z * Math.cos(rotY) - x * Math.sin(rotY);
    
    // Rotate around X axis (vertical rotation)
    let rotatedY = y * Math.cos(rotX) - rotatedZ * Math.sin(rotX);
    let finalZ = rotatedZ * Math.cos(rotX) + y * Math.sin(rotX);
    
    // Perspective projection
    const perspective = 400;
    const scale = perspective / (perspective + finalZ);
    
    const screenX = width / 2 + rotatedX * scale * 50;
    const screenY = height / 2 + rotatedY * scale * 50;
    const scaleFactor = scale;
    
    return { x: screenX, y: screenY, scale: scaleFactor, z: finalZ };
  };

  // Draw star with twinkling effect
  const drawStar = (
    ctx: CanvasRenderingContext2D,
    star: Star,
    time: number,
    rotX: number,
    rotY: number,
    width: number,
    height: number
  ) => {
    const { x: screenX, y: screenY, scale: scaleFactor } = project3D(
      star.x, star.y, star.z, width, height, rotX, rotY
    );
    
    if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) return;
    
    const twinkle = Math.sin(time * 0.002 * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
    const brightness = star.brightness * twinkle * (0.5 + scaleFactor * 0.5);
    const size = star.size * (0.3 + scaleFactor * 0.7);
    
    ctx.beginPath();
    ctx.arc(screenX, screenY, Math.max(0.3, size), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 245, 235, ${brightness * 0.6})`;
    ctx.fill();
    
    // Star glow
    if (size > 0.8) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 200, ${brightness * 0.15})`;
      ctx.fill();
    }
  };

  // Draw Sun with glow effect
  const drawSun = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    time: number
  ) => {
    const radius = 3.5 * scale;
    const pulse = 1 + Math.sin(time * 0.005) * 0.03;
    const currentRadius = radius * pulse;
    
    // Corona glow layers
    for (let i = 3; i >= 0; i--) {
      const glowSize = currentRadius * (1.5 + i * 0.6);
      const gradient = ctx.createRadialGradient(x, y, currentRadius * 0.5, x, y, glowSize);
      gradient.addColorStop(0, `rgba(255, 200, 80, ${0.15 - i * 0.03})`);
      gradient.addColorStop(0.5, `rgba(255, 120, 40, ${0.08 - i * 0.02})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Sun body
    const sunGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, currentRadius);
    sunGradient.addColorStop(0, '#fff8e0');
    sunGradient.addColorStop(0.3, '#ffe890');
    sunGradient.addColorStop(0.7, '#ffb850');
    sunGradient.addColorStop(1, '#ff8030');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun spots
    ctx.fillStyle = 'rgba(80, 40, 10, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + currentRadius * 0.2, y - currentRadius * 0.15, currentRadius * 0.2, currentRadius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw planet with 3D shading
  const drawPlanet = (
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    x: number,
    y: number,
    scale: number,
    time: number,
    lightDir: { x: number; y: number }
  ) => {
    const radius = planet.radius * scale;
    if (radius < 0.5) return;
    
    // Planet glow
    const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.8);
    glowGradient.addColorStop(0, `${planet.color}30`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    // 3D shading based on light direction
    const lightX = x + lightDir.x * radius * 0.7;
    const lightY = y + lightDir.y * radius * 0.7;
    const planetGradient = ctx.createRadialGradient(lightX, lightY, 0, x, y, radius);
    planetGradient.addColorStop(0, planet.color);
    planetGradient.addColorStop(0.6, planet.color);
    planetGradient.addColorStop(0.9, planet.emissive);
    planetGradient.addColorStop(1, '#1a0a2a');
    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Specular highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * scale})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Atmosphere rim light
    const rimGradient = ctx.createLinearGradient(
      x + radius * 0.5, y + radius * 0.3,
      x - radius * 0.5, y - radius * 0.3
    );
    rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    rimGradient.addColorStop(0.5, 'transparent');
    rimGradient.addColorStop(1, `rgba(${planet.color.slice(1, 3)}, ${planet.color.slice(3, 5)}, ${planet.color.slice(5, 7)}, 0.1)`);
    ctx.fillStyle = rimGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rings for Saturn
    if (planet.hasRing && planet.ringColor) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.5);
      
      // Outer ring
      ctx.strokeStyle = planet.ringColor;
      ctx.lineWidth = radius * 0.35;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.5, radius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner ring
      if (planet.ringInnerColor) {
        ctx.strokeStyle = planet.ringInnerColor;
        ctx.lineWidth = radius * 0.18;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.2, radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  };

  // Draw orbit trails
  const drawOrbit = (
    ctx: CanvasRenderingContext2D,
    distance: number,
    rotX: number,
    rotY: number,
    width: number,
    height: number
  ) => {
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = 0;
      
      const { x: screenX, y: screenY } = project3D(x, y, z, width, height, rotX, rotY);
      points.push({ x: screenX, y: screenY });
    }
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(100, 120, 160, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setRotationAngle(prev => ({
      x: Math.min(Math.max(prev.x + deltaY * 0.005, -Math.PI / 2.5), Math.PI / 2.5),
      y: prev.y + deltaX * 0.005,
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - lastMousePos.x;
    const deltaY = e.touches[0].clientY - lastMousePos.y;
    
    setRotationAngle(prev => ({
      x: Math.min(Math.max(prev.x + deltaY * 0.005, -Math.PI / 2.5), Math.PI / 2.5),
      y: prev.y + deltaX * 0.005,
    }));
    
    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width;
    let height = canvas.height;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    starsRef.current = generateStars(width, height);
    planetsRef.current = initPlanets();
    
    let time = 0;
    
    const animate = () => {
      if (!ctx || !canvas) return;
      
      width = canvas.width;
      height = canvas.height;
      
      time++;
      timeRef.current = time;
      
      // Deep space background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#050510');
      bgGradient.addColorStop(0.5, '#03030c');
      bgGradient.addColorStop(1, '#010108');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      ctx.save();
      
      // Draw stars
      for (const star of starsRef.current) {
        drawStar(ctx, star, time, rotationAngle.x, rotationAngle.y, width, height);
      }
      
      // Draw orbits
      for (const planet of planetsRef.current) {
        drawOrbit(ctx, planet.distance, rotationAngle.x, rotationAngle.y, width, height);
      }
      
      // Update planet positions and draw
      for (const planet of planetsRef.current) {
        planet.angle += planet.speed;
        
        const x = Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.distance;
        const y = 0;
        
        const { x: screenX, y: screenY, scale } = project3D(
          x, y, z, width, height, rotationAngle.x, rotationAngle.y
        );
        
        if (screenX > -100 && screenX < width + 100 && screenY > -100 && screenY < height + 100) {
          drawPlanet(
            ctx, planet, screenX, screenY, scale, time,
            { x: Math.cos(rotationAngle.y), y: Math.sin(rotationAngle.x) }
          );
        }
      }
      
      // Draw Sun (always in center of 3D space)
      const { x: sunX, y: sunY, scale: sunScale } = project3D(
        0, 0, 0, width, height, rotationAngle.x, rotationAngle.y
      );
      drawSun(ctx, sunX, sunY, sunScale, time);
      
      ctx.restore();
      
      // Draw vignette
      const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.6);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.7, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      
      // Draw instruction text
      ctx.font = '12px "Inter", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('🖱️ Drag to rotate 360° | ✨ 3D Solar System', width / 2, height - 25);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotationAngle]);
  
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
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
