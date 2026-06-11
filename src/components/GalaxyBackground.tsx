import { useEffect, useRef, useCallback } from 'react';

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
  ringInnerColor?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planetsRef = useRef<Planet[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  
  // 3D Rotation state
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  
  // Auto-rotation
  const autoRotateRef = useRef(true);
  const autoRotateSpeedRef = useRef(0.002);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate beautiful starfield with twinkling
    const generateStars = (width: number, height: number): Star[] => {
      const stars: Star[] = [];
      
      // Deep background stars
      for (let i = 0; i < 1200; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: 0.5 + Math.random() * 1.5,
          size: 0.3 + Math.random() * 0.6,
          opacity: 0.15 + Math.random() * 0.25,
          color: `rgba(255, 255, 255, ${0.15 + Math.random() * 0.25})`,
          twinkleSpeed: 0.003 + Math.random() * 0.007,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      
      // Mid-layer stars
      for (let i = 0; i < 600; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 1500,
          y: (Math.random() - 0.5) * 1500,
          z: 0.8 + Math.random() * 1,
          size: 0.6 + Math.random() * 0.8,
          opacity: 0.35 + Math.random() * 0.35,
          color: `rgba(255, 245, 235, ${0.4 + Math.random() * 0.3})`,
          twinkleSpeed: 0.005 + Math.random() * 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      
      // Bright foreground stars with color
      const brightColors = ['#ffffff', '#ffe8d0', '#d0e8ff', '#ffd8e0', '#ffffd0'];
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 1200,
          y: (Math.random() - 0.5) * 1200,
          z: 1.2 + Math.random() * 0.8,
          size: 1.2 + Math.random() * 1.8,
          opacity: 0.6 + Math.random() * 0.4,
          color: brightColors[Math.floor(Math.random() * brightColors.length)],
          twinkleSpeed: 0.002 + Math.random() * 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      
      return stars;
    };

    // Initialize planets with proper 3D orbits
    const initPlanets = (width: number, height: number): Planet[] => {
      const baseDistance = Math.min(width, height) * 0.095;
      
      return [
        { 
          name: 'Mercury', radius: 3.5, distance: baseDistance * 1.2,
          angle: 0, speed: 0.008,
          color: '#c9b69a', gradientStart: '#e0cdb0', gradientEnd: '#a89070',
          hasRing: false 
        },
        { 
          name: 'Venus', radius: 5, distance: baseDistance * 1.7,
          angle: 1.2, speed: 0.0055,
          color: '#e6c87a', gradientStart: '#f5e0a0', gradientEnd: '#c8a850',
          hasRing: false 
        },
        { 
          name: 'Earth', radius: 5.5, distance: baseDistance * 2.3,
          angle: 2.1, speed: 0.0042,
          color: '#4a90d9', gradientStart: '#6ab0f0', gradientEnd: '#2a70b0',
          hasRing: false 
        },
        { 
          name: 'Mars', radius: 4.5, distance: baseDistance * 2.9,
          angle: 3.0, speed: 0.0035,
          color: '#cf5c36', gradientStart: '#e07a50', gradientEnd: '#b03e20',
          hasRing: false 
        },
        { 
          name: 'Jupiter', radius: 11, distance: baseDistance * 3.8,
          angle: 3.8, speed: 0.0022,
          color: '#d4a574', gradientStart: '#e8c090', gradientEnd: '#b88858',
          hasRing: false 
        },
        { 
          name: 'Saturn', radius: 9.5, distance: baseDistance * 4.6,
          angle: 4.5, speed: 0.0018,
          color: '#f4d59e', gradientStart: '#ffe8c0', gradientEnd: '#d4b070',
          hasRing: true, ringColor: 'rgba(200, 175, 120, 0.5)', ringInnerColor: 'rgba(180, 155, 100, 0.35)'
        },
        { 
          name: 'Uranus', radius: 7, distance: baseDistance * 5.3,
          angle: 5.2, speed: 0.0013,
          color: '#8fd6d6', gradientStart: '#a8e8e8', gradientEnd: '#70b8b8',
          hasRing: false 
        },
        { 
          name: 'Neptune', radius: 6.8, distance: baseDistance * 6.0,
          angle: 5.8, speed: 0.001,
          color: '#4169e1', gradientStart: '#6088f0', gradientEnd: '#2850b0',
          hasRing: false 
        },
      ];
    };

    // 3D to 2D projection
    const project3D = (
      x: number, 
      y: number, 
      z: number, 
      centerX: number, 
      centerY: number,
      rotX: number,
      rotY: number
    ): { x: number; y: number; scale: number } => {
      // Apply rotation around Y axis (horizontal rotation)
      let cosY = Math.cos(rotY);
      let sinY = Math.sin(rotY);
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;
      
      // Apply rotation around X axis (vertical rotation)
      let cosX = Math.cos(rotX);
      let sinX = Math.sin(rotX);
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;
      
      // Perspective projection (z affects scale)
      const perspective = 800;
      const scale = perspective / (perspective + z2 + 400);
      
      return {
        x: centerX + x1 * scale,
        y: centerY + y1 * scale,
        scale: scale
      };
    };

    // Draw 3D starfield with twinkling
    const drawStars = (
      ctx: CanvasRenderingContext2D, 
      stars: Star[], 
      centerX: number, 
      centerY: number,
      rotX: number,
      rotY: number,
      time: number
    ) => {
      for (const star of stars) {
        const projected = project3D(star.x, star.y, star.z, centerX, centerY, rotX, rotY);
        
        if (projected.scale < 0.1) continue;
        
        const twinkle = 0.7 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3;
        const finalSize = star.size * Math.sqrt(projected.scale);
        const finalOpacity = star.opacity * projected.scale * twinkle;
        
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = finalOpacity;
        ctx.fill();
        
        // Glow effect for brighter stars
        if (star.size > 1.2 && projected.scale > 0.5) {
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, finalSize * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = finalOpacity * 0.15;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    // Draw Sun with glow effect
    const drawSun = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      scale: number,
      time: number
    ) => {
      const finalRadius = radius * Math.sqrt(scale);
      const pulse = 1 + Math.sin(time * 0.003) * 0.03;
      const currentRadius = finalRadius * pulse;
      
      // Outer corona glow
      const coronaGrad = ctx.createRadialGradient(x, y, currentRadius * 0.5, x, y, currentRadius * 2.5);
      coronaGrad.addColorStop(0, 'rgba(255, 200, 80, 0.3)');
      coronaGrad.addColorStop(0.5, 'rgba(255, 150, 40, 0.1)');
      coronaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(x, y, currentRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(x - 4 * scale, y - 4 * scale, 0, x, y, currentRadius);
      sunGrad.addColorStop(0, '#fff8e8');
      sunGrad.addColorStop(0.3, '#ffe890');
      sunGrad.addColorStop(0.7, '#ffb850');
      sunGrad.addColorStop(1, '#ff8030');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright core
      ctx.fillStyle = 'rgba(255, 255, 240, 0.5)';
      ctx.beginPath();
      ctx.arc(x - 2 * scale, y - 2 * scale, currentRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw planet with 3D shading
    const drawPlanet = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      scale: number,
      planet: Planet,
      time: number
    ) => {
      const finalRadius = radius * Math.sqrt(scale);
      if (finalRadius < 1) return;
      
      // Planet body with 3D shading
      const planetGrad = ctx.createRadialGradient(
        x - finalRadius * 0.35, 
        y - finalRadius * 0.35, 
        0, 
        x, 
        y, 
        finalRadius
      );
      planetGrad.addColorStop(0, planet.gradientStart);
      planetGrad.addColorStop(0.6, planet.gradientEnd);
      planetGrad.addColorStop(1, '#1a1a30');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Atmosphere glow
      const atmGlow = ctx.createRadialGradient(x, y, finalRadius * 0.8, x, y, finalRadius * 1.3);
      atmGlow.addColorStop(0, 'transparent');
      atmGlow.addColorStop(0.7, `${planet.gradientStart}25`);
      atmGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = atmGlow;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(x - finalRadius * 0.2, y - finalRadius * 0.2, finalRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Saturn rings (3D perspective)
      if (planet.hasRing && planet.ringColor && scale > 0.3) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.5);
        
        const ringScaleX = 1.5 * Math.sqrt(scale);
        const ringScaleY = 0.45 * Math.sqrt(scale);
        
        ctx.strokeStyle = planet.ringColor;
        ctx.lineWidth = finalRadius * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, finalRadius * 1.5, finalRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        if (planet.ringInnerColor) {
          ctx.strokeStyle = planet.ringInnerColor;
          ctx.lineWidth = finalRadius * 0.15;
          ctx.beginPath();
          ctx.ellipse(0, 0, finalRadius * 1.2, finalRadius * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    };

    // Draw orbit rings (3D perspective ellipses)
    const drawOrbits = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      planets: Planet[],
      rotX: number,
      rotY: number,
      time: number
    ) => {
      ctx.setLineDash([5, 8]);
      ctx.lineWidth = 0.8;
      
      for (const planet of planets) {
        ctx.beginPath();
        
        // Draw orbit as ellipse in 3D perspective
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          const x = Math.cos(angle) * planet.distance;
          const z = Math.sin(angle) * planet.distance;
          
          const projected = project3D(x, 0, z, centerX, centerY, rotX, rotY);
          
          if (i === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        
        ctx.strokeStyle = `rgba(100, 120, 160, 0.15)`;
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    };

    let stars = generateStars(canvas.width, canvas.height);
    let planets = initPlanets(canvas.width, canvas.height);
    let time = 0;

    // Mouse drag handlers for 360° rotation
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;
      
      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.006;
      
      // Clamp vertical rotation to avoid flip
      targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x));
      
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      canvas.style.cursor = 'grab';
      
      // Resume auto-rotation after 3 seconds of no interaction
      setTimeout(() => {
        if (!isDraggingRef.current) {
          autoRotateRef.current = true;
        }
      }, 3000);
    };

    const handleWheel = (e: WheelEvent) => {
      // Optional: Zoom effect on scroll
      autoRotateRef.current = false;
      setTimeout(() => {
        if (!isDraggingRef.current) {
          autoRotateRef.current = true;
        }
      }, 2000);
    };

    // Animation loop
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
      
      // Smooth rotation interpolation
      if (autoRotateRef.current && !isDraggingRef.current) {
        targetRotationRef.current.y += autoRotateSpeedRef.current;
      }
      
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.08;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.08;
      
      // Deep space background with gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#070714');
      bgGrad.addColorStop(0.4, '#050510');
      bgGrad.addColorStop(0.7, '#03030c');
      bgGrad.addColorStop(1, '#010108');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      
      // Draw starfield
      drawStars(ctx, stars, centerX, centerY, rotationRef.current.x, rotationRef.current.y, time);
      
      // Draw orbit paths
      drawOrbits(ctx, centerX, centerY, planets, rotationRef.current.x, rotationRef.current.y, time);
      
      // Draw Sun (always at center in 3D space)
      const sunProjected = project3D(0, 0, 0, centerX, centerY, rotationRef.current.x, rotationRef.current.y);
      const sunRadius = Math.min(width, height) * 0.03;
      drawSun(ctx, sunProjected.x, sunProjected.y, sunRadius, sunProjected.scale, time);
      
      // Update and draw planets in 3D space
      for (const planet of planets) {
        planet.angle += planet.speed;
        
        // Planet position in 3D space
        const x = Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.distance;
        const y = 0;
        
        const projected = project3D(x, y, z, centerX, centerY, rotationRef.current.x, rotationRef.current.y);
        
        drawPlanet(ctx, projected.x, projected.y, planet.radius, projected.scale, planet, time);
      }
      
      // Subtle vignette effect
      const vignette = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.7);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.6, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      
      // Instruction text (disappears after interaction)
      if (time < 300 && !isDraggingRef.current) {
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.fillText('🖱️ Drag to rotate 360° | ✨ Auto-rotating', centerX, height - 30);
      }
      ctx.textAlign = 'left';
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Set up event listeners
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = generateStars(canvas.width, canvas.height);
      planets = initPlanets(canvas.width, canvas.height);
    };

    canvas.style.cursor = 'grab';
    handleResize();
    
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
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
