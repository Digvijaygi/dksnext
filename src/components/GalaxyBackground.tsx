import { useEffect, useRef, useState, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
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
  tiltAngle: number;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  
  // 3D Camera/Rotation State
  const [targetRotX, setTargetRotX] = useState(0);
  const [targetRotY, setTargetRotY] = useState(0);
  const currentRotX = useRef(0);
  const currentRotY = useRef(0);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isInteracting = useRef(false);
  const frameRef = useRef<number>();

  // Camera distance from center
  const cameraDistance = 800;

  const project3D = useCallback((point: Vector3D, rotX: number, rotY: number, width: number, height: number): { x: number; y: number; z: number } | null => {
    // Apply rotation around Y axis (horizontal rotation - 360°)
    let x1 = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
    let z1 = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
    let y1 = point.y;
    
    // Apply rotation around X axis (vertical tilt - up/down)
    let x2 = x1;
    let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);
    
    // Apply camera distance (move camera back)
    const zFinal = z2 + cameraDistance;
    
    // Perspective projection
    if (zFinal <= 0.1) return null;
    
    const perspective = 500 / zFinal;
    const projectedX = width / 2 + x2 * perspective;
    const projectedY = height / 2 + y2 * perspective;
    
    return { x: projectedX, y: projectedY, z: zFinal };
  }, [cameraDistance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const init = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 3D Starfield with depth (Z-axis) - ALL STARS ARE SMALL
      starsRef.current = [];
      const starColors = ['#ffffff', '#e0e8ff', '#ffe8e0', '#ffe0f0', '#aaccff'];
      
      // Generate 2000 stars in 3D space (increased count for better density)
      for (let i = 0; i < 2000; i++) {
        // Spread stars in a sphere-like volume
        const radius = 800 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = Math.sin(phi) * Math.cos(theta) * radius;
        const y = Math.sin(phi) * Math.sin(theta) * radius;
        const z = Math.cos(phi) * radius;
        
        starsRef.current.push({
          x, y, z,
          // All stars are now tiny: size between 0.3 and 1.2 pixels
          size: 0.3 + Math.random() * 0.9,
          opacity: 0.15 + Math.random() * 0.4,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.3 + Math.random() * 2,
        });
      }

      // Planets in 3D space - all on the same plane (Y=0) for solar system
      const baseDistance = 120;
      planetsRef.current = [
        { 
          name: 'Mercury', 
          radius: 8, 
          distance: baseDistance * 1.2, 
          angle: 0, 
          speed: 0.008, 
          color: '#b0a89c', 
          glowColor: '#b0a89c40', 
          hasRing: false,
          tiltAngle: 0.1
        },
        { 
          name: 'Venus', 
          radius: 10, 
          distance: baseDistance * 1.7, 
          angle: 0.8, 
          speed: 0.0055, 
          color: '#e6b856', 
          glowColor: '#e6b85640', 
          hasRing: false,
          tiltAngle: 0.2
        },
        { 
          name: 'Earth', 
          radius: 11, 
          distance: baseDistance * 2.3, 
          angle: 1.6, 
          speed: 0.0045, 
          color: '#4a90d9', 
          glowColor: '#4a90d940', 
          hasRing: false,
          tiltAngle: 0.3
        },
        { 
          name: 'Mars', 
          radius: 9, 
          distance: baseDistance * 2.9, 
          angle: 2.4, 
          speed: 0.0038, 
          color: '#e0764a', 
          glowColor: '#e0764a40', 
          hasRing: false,
          tiltAngle: 0.15
        },
        { 
          name: 'Jupiter', 
          radius: 22, 
          distance: baseDistance * 4.0, 
          angle: 3.2, 
          speed: 0.0025, 
          color: '#d8a27a', 
          glowColor: '#d8a27a50', 
          hasRing: false,
          tiltAngle: 0.1
        },
        { 
          name: 'Saturn', 
          radius: 19, 
          distance: baseDistance * 5.0, 
          angle: 4.0, 
          speed: 0.002, 
          color: '#f2cd9b', 
          glowColor: '#f2cd9b50', 
          hasRing: true,
          ringColor: 'rgba(210, 180, 140, 0.8)',
          tiltAngle: 0.4
        },
        { 
          name: 'Uranus', 
          radius: 15, 
          distance: baseDistance * 6.2, 
          angle: 4.8, 
          speed: 0.0015, 
          color: '#b0e0e6', 
          glowColor: '#b0e0e640', 
          hasRing: false,
          tiltAngle: 0.5
        },
        { 
          name: 'Neptune', 
          radius: 14, 
          distance: baseDistance * 7.3, 
          angle: 5.6, 
          speed: 0.0012, 
          color: '#4169e1', 
          glowColor: '#4169e140', 
          hasRing: false,
          tiltAngle: 0.3
        },
      ];
    };

    const drawStars3D = (ctx: CanvasRenderingContext2D, rotX: number, rotY: number, width: number, height: number, time: number) => {
      // Sort stars by depth (Z) for proper rendering
      const starsWithDepth = starsRef.current.map(star => {
        const projected = project3D(
          { x: star.x, y: star.y, z: star.z },
          rotX,
          rotY,
          width,
          height
        );
        return { star, projected, depth: projected?.z || 9999 };
      });
      
      // Sort by depth (farthest first)
      starsWithDepth.sort((a, b) => b.depth - a.depth);
      
      for (const { star, projected } of starsWithDepth) {
        if (!projected) continue;
        
        // Star twinkling effect
        const twinkle = 0.6 + Math.sin(time * star.twinkleSpeed) * 0.4;
        const opacity = star.opacity * twinkle * Math.min(1, 300 / projected.z);
        
        // Size based on depth - even smaller for distant stars
        let size = star.size * (300 / projected.z);
        // Cap maximum size to keep stars small
        size = Math.min(size, 1.5);
        
        // Only draw if size is visible
        if (size < 0.2) continue;
        
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        
        // Very subtle glow for slightly brighter stars (reduced intensity)
        if (size > 0.8) {
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity * 0.15;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawSun3D = (ctx: CanvasRenderingContext2D, rotX: number, rotY: number, width: number, height: number, time: number) => {
      const sunPos = project3D({ x: 0, y: 0, z: 0 }, rotX, rotY, width, height);
      if (!sunPos) return;
      
      const radius = 35;
      const depthScale = Math.min(1, 500 / sunPos.z);
      const finalRadius = radius * depthScale;
      
      // Sun glow
      const glowRadius = finalRadius * 3;
      const glowGrad = ctx.createRadialGradient(sunPos.x, sunPos.y, finalRadius, sunPos.x, sunPos.y, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 200, 100, 0.4)`);
      glowGrad.addColorStop(0.3, `rgba(255, 150, 50, 0.15)`);
      glowGrad.addColorStop(0.6, `rgba(255, 100, 0, 0.05)`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(sunPos.x - 5, sunPos.y - 5, 0, sunPos.x, sunPos.y, finalRadius);
      sunGrad.addColorStop(0, '#fff8e7');
      sunGrad.addColorStop(0.3, '#ffe4a0');
      sunGrad.addColorStop(0.6, '#ffcc66');
      sunGrad.addColorStop(0.9, '#ff9933');
      sunGrad.addColorStop(1, '#ff6600');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, finalRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun spots
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#cc6600';
      ctx.beginPath();
      ctx.ellipse(sunPos.x - finalRadius * 0.2, sunPos.y - finalRadius * 0.15, finalRadius * 0.15, finalRadius * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sunPos.x + finalRadius * 0.25, sunPos.y + finalRadius * 0.1, finalRadius * 0.12, finalRadius * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawPlanet3D = (
      ctx: CanvasRenderingContext2D,
      planet: Planet,
      rotX: number,
      rotY: number,
      width: number,
      height: number,
      time: number
    ) => {
      // Calculate planet position in 3D space
      const planetX = Math.cos(planet.angle) * planet.distance;
      const planetZ = Math.sin(planet.angle) * planet.distance;
      const planetY = Math.sin(planet.angle) * planet.tiltAngle * 15;
      
      const projected = project3D({ x: planetX, y: planetY, z: planetZ }, rotX, rotY, width, height);
      if (!projected) return;
      
      const depthScale = Math.min(1, 500 / projected.z);
      const finalRadius = planet.radius * depthScale;
      
      // Planet glow
      ctx.fillStyle = planet.glowColor;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, finalRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet body with 3D shading
      const planetGrad = ctx.createRadialGradient(
        projected.x - finalRadius * 0.3, 
        projected.y - finalRadius * 0.3, 
        0, 
        projected.x, 
        projected.y, 
        finalRadius
      );
      planetGrad.addColorStop(0, planet.color);
      planetGrad.addColorStop(0.7, planet.color);
      planetGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, finalRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet-specific details
      if (planet.name === 'Jupiter') {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#b87333';
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(projected.x - finalRadius, projected.y + i * finalRadius * 0.4, finalRadius * 2, finalRadius * 0.15);
        }
        ctx.fillStyle = '#cc5544';
        ctx.beginPath();
        ctx.ellipse(projected.x + finalRadius * 0.3, projected.y + finalRadius * 0.2, finalRadius * 0.25, finalRadius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (planet.name === 'Saturn' && planet.hasRing) {
        // 3D Rings for Saturn
        ctx.save();
        ctx.translate(projected.x, projected.y);
        const ringTilt = 0.6;
        ctx.rotate(ringTilt);
        
        ctx.strokeStyle = planet.ringColor || 'rgba(210, 180, 140, 0.7)';
        ctx.lineWidth = finalRadius * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, finalRadius * 1.4, finalRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(200, 170, 130, 0.4)';
        ctx.lineWidth = finalRadius * 0.25;
        ctx.beginPath();
        ctx.ellipse(0, 0, finalRadius * 1.7, finalRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(projected.x - finalRadius * 0.25, projected.y - finalRadius * 0.25, finalRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    };

    // Smooth mouse/touch interaction without click
    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      mouseX.current = (clientX / window.innerWidth) * 2 - 1;
      mouseY.current = (clientY / window.innerHeight) * 2 - 1;
      
      // Target rotation based on mouse position
      setTargetRotY(mouseX.current * Math.PI * 1.5); // 270° rotation left/right
      setTargetRotX(mouseY.current * Math.PI * 0.5); // 90° tilt up/down
      
      isInteracting.current = true;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
      e.preventDefault();
      // Scroll wheel for zoom/extra rotation
      setTargetRotY(prev => prev + e.deltaY * 0.005);
    }, []);

    const handleMouseLeave = useCallback(() => {
      isInteracting.current = false;
    }, []);

    // Animation loop with smooth interpolation (Lerp for 120FPS feel)
    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Smooth interpolation (lerp) - 0.08 gives smooth glide effect
      currentRotX.current += (targetRotX - currentRotX.current) * 0.08;
      currentRotY.current += (targetRotY - currentRotY.current) * 0.08;
      
      timeRef.current += 16;
      const time = timeRef.current;
      
      // Clear with deep space gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#060612');
      gradient.addColorStop(1, '#02020a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars first (background)
      drawStars3D(ctx, currentRotX.current, currentRotY.current, width, height, time);
      
      // Get all planets with their depths for Z-buffering
      const planetsWithDepth = planetsRef.current.map(planet => {
        const planetX = Math.cos(planet.angle) * planet.distance;
        const planetZ = Math.sin(planet.angle) * planet.distance;
        const planetY = Math.sin(planet.angle) * planet.tiltAngle * 15;
        
        const projected = project3D(
          { x: planetX, y: planetY, z: planetZ },
          currentRotX.current,
          currentRotY.current,
          width,
          height
        );
        
        return { planet, projected, depth: projected?.z || 9999 };
      });
      
      // Sort planets by depth (farthest first) for proper occlusion
      planetsWithDepth.sort((a, b) => b.depth - a.depth);
      
      // Draw Sun (always at center)
      drawSun3D(ctx, currentRotX.current, currentRotY.current, width, height, time);
      
      // Draw planets in correct Z-order
      for (const { planet, projected } of planetsWithDepth) {
        if (!projected) continue;
        drawPlanet3D(ctx, planet, currentRotX.current, currentRotY.current, width, height, time);
      }
      
      // Update planet angles
      for (const planet of planetsRef.current) {
        planet.angle += planet.speed;
        if (planet.angle > Math.PI * 2) planet.angle -= Math.PI * 2;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Setup event listeners
    const setupEventListeners = () => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('wheel', handleWheel, { passive: false });
      
      // Optional: Add touch start for better mobile experience
      window.addEventListener('touchstart', handleMouseMove);
    };

    const removeEventListeners = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleMouseMove);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    setupEventListeners();
    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      removeEventListeners();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [project3D, handleMouseMove, handleWheel, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        display: 'block',
        width: '100%',
        height: '100%',
        userSelect: 'none'
      }}
    />
  );
};

export default GalaxyBackground;
