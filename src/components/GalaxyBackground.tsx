import { useEffect, useRef, useState, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Planet3D {
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
  ringInnerColor?: string;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galaxyCanvasRef = useRef<HTMLCanvasElement>(null);
  const planetsRef = useRef<Planet3D[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const galaxyAnimationRef = useRef<number>();
  
  // 3D Rotation state
  const [rotation, setRotation] = useState({ x: 0.2, y: 0.5 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const isDragging = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  // Galaxy stars static reference
  const galaxyStarsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Array<{ x: number; y: number; radius: number; color: string; opacity: number }>>([]);

  // Generate beautiful starfield for galaxy background
  const generateGalaxyStars = (width: number, height: number) => {
    const stars: Star[] = [];
    
    // Tiny background stars
    for (let i = 0; i < 1200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.3 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.3,
        color: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    // Medium stars
    for (let i = 0; i < 400; i++) {
      const brightness = 0.4 + Math.random() * 0.4;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.6 + Math.random() * 0.8,
        opacity: brightness,
        color: `rgba(255, 245, 235, ${brightness})`,
        twinkleSpeed: 0.8 + Math.random() * 2.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    // Bright stars
    const colors = ['#ffffff', '#ffe8d0', '#d0e8ff', '#ffd8e0', '#ffeedd'];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.2 + Math.random() * 1.8,
        opacity: 0.6 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: 0.3 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    return stars;
  };

  // Generate nebulae
  const generateNebulae = (width: number, height: number) => {
    return [
      { x: width * 0.2, y: height * 0.3, radius: 150, color: 'rgba(100, 60, 150, 0.08)', opacity: 0.6 },
      { x: width * 0.7, y: height * 0.6, radius: 200, color: 'rgba(60, 80, 160, 0.06)', opacity: 0.5 },
      { x: width * 0.5, y: height * 0.2, radius: 120, color: 'rgba(150, 80, 100, 0.05)', opacity: 0.4 },
      { x: width * 0.85, y: height * 0.4, radius: 100, color: 'rgba(80, 60, 120, 0.07)', opacity: 0.5 },
      { x: width * 0.1, y: height * 0.7, radius: 130, color: 'rgba(120, 70, 90, 0.06)', opacity: 0.4 },
    ];
  };

  // Initialize planets
  const initPlanets = (width: number, height: number) => {
    const baseDistance = Math.min(width, height) * 0.095;
    
    return [
      { 
        name: 'Mercury', radius: 3.5, distance: baseDistance, 
        angle: 0, speed: 0.012, 
        color: '#c9b69a', gradientStart: '#e0cdb0', gradientEnd: '#a89070',
        hasRing: false 
      },
      { 
        name: 'Venus', radius: 5, distance: baseDistance * 1.45, 
        angle: 1.8, speed: 0.0085, 
        color: '#e6c87a', gradientStart: '#f5e0a0', gradientEnd: '#c8a850',
        hasRing: false 
      },
      { 
        name: 'Earth', radius: 5.5, distance: baseDistance * 1.95, 
        angle: 2.5, speed: 0.007, 
        color: '#4a90d9', gradientStart: '#6ab0f0', gradientEnd: '#2a70b0',
        hasRing: false 
      },
      { 
        name: 'Mars', radius: 4.5, distance: baseDistance * 2.5, 
        angle: 3.2, speed: 0.0058, 
        color: '#cf5c36', gradientStart: '#e07a50', gradientEnd: '#b03e20',
        hasRing: false 
      },
      { 
        name: 'Jupiter', radius: 11, distance: baseDistance * 3.4, 
        angle: 4.0, speed: 0.0038, 
        color: '#d4a574', gradientStart: '#e8c090', gradientEnd: '#b88858',
        hasRing: false 
      },
      { 
        name: 'Saturn', radius: 9.5, distance: baseDistance * 4.2, 
        angle: 5.1, speed: 0.003, 
        color: '#f4d59e', gradientStart: '#ffe8c0', gradientEnd: '#d4b070',
        hasRing: true, ringColor: 'rgba(200, 175, 120, 0.5)', ringInnerColor: 'rgba(180, 155, 100, 0.3)'
      },
      { 
        name: 'Uranus', radius: 7, distance: baseDistance * 5.0, 
        angle: 6.0, speed: 0.0022, 
        color: '#8fd6d6', gradientStart: '#a8e8e8', gradientEnd: '#70b0b0',
        hasRing: false 
      },
      { 
        name: 'Neptune', radius: 6.8, distance: baseDistance * 5.8, 
        angle: 6.8, speed: 0.0018, 
        color: '#3a60d0', gradientStart: '#6080e0', gradientEnd: '#2a40a0',
        hasRing: false 
      },
    ];
  };

  // Draw galaxy background (static, beautiful space)
  const drawGalaxyBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Deep space gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#070714');
    bgGrad.addColorStop(0.4, '#050510');
    bgGrad.addColorStop(0.7, '#03030c');
    bgGrad.addColorStop(1, '#010108');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    // Draw nebulae
    for (const nebula of nebulaeRef.current) {
      const grad = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
      grad.addColorStop(0, nebula.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw stars with twinkling
    for (const star of galaxyStarsRef.current) {
      const twinkle = 0.7 + Math.sin(time * 0.002 * star.twinkleSpeed + star.twinklePhase) * 0.3;
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
      
      // Glow for brighter stars
      if (star.size > 1.2) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = finalOpacity * 0.15;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    
    // Subtle vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(0.6, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  };

  // Draw 3D Solar System
  const drawSolarSystem = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const sunRadius = Math.min(width, height) * 0.035;
    
    ctx.save();
    
    // Apply 3D rotation transformation
    const rotX = (rotation.x - 0.5) * Math.PI * 2;
    const rotY = (rotation.y - 0.5) * Math.PI;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(rotY);
    ctx.transform(1, 0, Math.sin(rotX) * 0.5, 1, 0, 0);
    
    // Draw orbit paths (elliptical due to rotation)
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 0.8;
    for (const planet of planetsRef.current) {
      ctx.beginPath();
      ctx.ellipse(0, 0, planet.distance, planet.distance * 0.7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 120, 160, 0.2)';
      ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Draw Sun
    const sunPulse = 1 + Math.sin(time * 0.003) * 0.02;
    const currentSunRadius = sunRadius * sunPulse;
    
    // Sun glow
    const sunGlow = ctx.createRadialGradient(0, 0, currentSunRadius, 0, 0, currentSunRadius * 3);
    sunGlow.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    sunGlow.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(0, 0, currentSunRadius * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun body
    const sunGrad = ctx.createRadialGradient(-4, -4, 0, 0, 0, currentSunRadius);
    sunGrad.addColorStop(0, '#fff8e8');
    sunGrad.addColorStop(0.3, '#ffe890');
    sunGrad.addColorStop(0.7, '#ffb850');
    sunGrad.addColorStop(1, '#ff8030');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(0, 0, currentSunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun inner bright core
    ctx.fillStyle = 'rgba(255, 255, 240, 0.3)';
    ctx.beginPath();
    ctx.arc(-2, -2, currentSunRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw planets
    for (const planet of planetsRef.current) {
      // Update planet angle
      planet.angle += planet.speed;
      
      // Calculate 3D position with elliptical orbit
      const x = Math.cos(planet.angle) * planet.distance;
      const y = Math.sin(planet.angle) * planet.distance * 0.7;
      
      // Calculate size based on distance (perspective)
      const perspectiveScale = 1 - (planet.distance / (Math.min(width, height) * 0.6)) * 0.3;
      const planetRadius = planet.radius * perspectiveScale;
      
      // Planet shadow (3D effect)
      const planetGrad = ctx.createRadialGradient(x - planetRadius * 0.35, y - planetRadius * 0.35, 0, x, y, planetRadius);
      planetGrad.addColorStop(0, planet.gradientStart);
      planetGrad.addColorStop(0.6, planet.gradientEnd);
      planetGrad.addColorStop(1, '#1a1a30');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Atmosphere glow
      const atmGlow = ctx.createRadialGradient(x, y, planetRadius * 0.8, x, y, planetRadius * 1.3);
      atmGlow.addColorStop(0, 'transparent');
      atmGlow.addColorStop(0.7, `${planet.gradientStart}20`);
      atmGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = atmGlow;
      ctx.beginPath();
      ctx.arc(x, y, planetRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(x - planetRadius * 0.2, y - planetRadius * 0.2, planetRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Saturn rings
      if (planet.hasRing && planet.ringColor) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.6);
        ctx.shadowBlur = 0;
        
        // Outer ring
        ctx.strokeStyle = planet.ringColor;
        ctx.lineWidth = planetRadius * 0.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, planetRadius * 1.6, planetRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        if (planet.ringInnerColor) {
          ctx.strokeStyle = planet.ringInnerColor;
          ctx.lineWidth = planetRadius * 0.2;
          ctx.beginPath();
          ctx.ellipse(0, 0, planetRadius * 1.3, planetRadius * 0.42, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }
    
    ctx.restore();
  };

  // Galaxy animation loop
  let galaxyTime = 0;
  const animateGalaxy = () => {
    const galaxyCanvas = galaxyCanvasRef.current;
    if (!galaxyCanvas) return;
    
    const ctx = galaxyCanvas.getContext('2d');
    if (!ctx) return;
    
    const width = galaxyCanvas.width;
    const height = galaxyCanvas.height;
    
    galaxyTime++;
    
    drawGalaxyBackground(ctx, width, height, galaxyTime);
    
    galaxyAnimationRef.current = requestAnimationFrame(animateGalaxy);
  };

  // Solar System animation loop
  let solarTime = 0;
  const animateSolarSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    solarTime++;
    
    // Clear with transparency to show galaxy background
    ctx.clearRect(0, 0, width, height);
    
    drawSolarSystem(ctx, width, height, solarTime);
    
    animationRef.current = requestAnimationFrame(animateSolarSystem);
  };

  // Handle mouse for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = (e.clientX - lastMouseRef.current.x) * 0.008;
    const deltaY = (e.clientY - lastMouseRef.current.y) * 0.008;
    
    setRotation(prev => ({
      x: Math.min(Math.max(prev.x + deltaX, 0), 1),
      y: Math.min(Math.max(prev.y + deltaY, 0.1), 0.9)
    }));
    
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const galaxyCanvas = galaxyCanvasRef.current;
    
    if (canvas && galaxyCanvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      galaxyCanvas.width = window.innerWidth;
      galaxyCanvas.height = window.innerHeight;
      
      planetsRef.current = initPlanets(canvas.width, canvas.height);
      galaxyStarsRef.current = generateGalaxyStars(galaxyCanvas.width, galaxyCanvas.height);
      nebulaeRef.current = generateNebulae(galaxyCanvas.width, galaxyCanvas.height);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    animateGalaxy();
    animateSolarSystem();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (galaxyAnimationRef.current) cancelAnimationFrame(galaxyAnimationRef.current);
    };
  }, [handleResize]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: -10,
        cursor: isDragging.current ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Galaxy Background Canvas */}
      <canvas
        ref={galaxyCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      
      {/* Solar System Canvas (transparent overlay) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      
      {/* Instruction Text */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: 12,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        🖱️ Click and drag to rotate Solar System 360°
      </div>
    </div>
  );
};

export default GalaxyBackground;
