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

  // Camera distance from center
  const cameraDistance = 1000;

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
    
    const perspective = 600 / zFinal;
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

      console.log('Initializing with dimensions:', width, height);

      // 3D Starfield with depth (Z-axis)
      starsRef.current = [];
      const starColors = ['#ffffff', '#e0e8ff', '#ffe8e0', '#ffe0f0', '#aaccff'];
      
      // Generate 1000 stars in 3D space
      for (let i = 0; i < 1000; i++) {
        // Spread stars in a sphere-like volume
        const radius = 600 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = Math.sin(phi) * Math.cos(theta) * radius;
        const y = Math.sin(phi) * Math.sin(theta) * radius;
        const z = Math.cos(phi) * radius;
        
        // Reduced size for all stars
        let starSize;
        const randomSize = Math.random();
        if (randomSize > 0.95) {
          starSize = 0.8 + Math.random() * 0.4;
        } else if (randomSize > 0.7) {
          starSize = 0.5 + Math.random() * 0.3;
        } else {
          starSize = 0.3 + Math.random() * 0.2;
        }
        
        starsRef.current.push({
          x, y, z,
          size: starSize,
          opacity: 0.3 + Math.random() * 0.5,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 1.5,
        });
      }

      console.log('Stars generated:', starsRef.current.length);

      // Planets in 3D space
      const baseDistance = 150;
      planetsRef.current = [
        { 
          name: 'Mercury', 
          radius: 6, 
          distance: baseDistance * 1.2, 
          angle: 0, 
          speed: 0.008, 
          color: '#c0b8ac', 
          glowColor: '#c0b8ac40', 
          hasRing: false,
          tiltAngle: 0.1
        },
        { 
          name: 'Venus', 
          radius: 8, 
          distance: baseDistance * 1.7, 
          angle: 0.8, 
          speed: 0.0055, 
          color: '#e6c856', 
          glowColor: '#e6c85640', 
          hasRing: false,
          tiltAngle: 0.2
        },
        { 
          name: 'Earth', 
          radius: 9, 
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
          radius: 7, 
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
          radius: 18, 
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
          radius: 15, 
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
          radius: 12, 
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
          radius: 11, 
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
      for (const star of starsRef.current) {
        const projected = project3D(
          { x: star.x, y: star.y, z: star.z },
          rotX,
          rotY,
          width,
          height
        );
        
        if (!projected) continue;
        
        // Star twinkling effect
        const twinkle = 0.7 + Math.sin(time * star.twinkleSpeed * 0.002) * 0.3;
        const opacity = star.opacity * twinkle * Math.min(1, 400 / projected.z);
        
        // Size based on depth
        const size = star.size * (400 / projected.z);
        
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, Math.max(0.3, Math.min(size, 2)), 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        
        // Small glow for brighter stars
        if (size > 0.8) {
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity * 0.2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawSun3D = (ctx: CanvasRenderingContext2D, rotX: number, rotY: number, width: number, height: number, time: number) => {
      const sunPos = project3D({ x: 0, y: 0, z: 0 }, rotX, rotY, width, height);
      if (!sunPos) return;
      
      const radius = 40;
      const depthScale = Math.min(1, 500 / sunPos.z);
      const finalRadius = radius * depthScale;
      
      // Sun glow
      const glowRadius = finalRadius * 3;
      const glowGrad = ctx.createRadialGradient(sunPos.x, sunPos.y, finalRadius, sunPos.x, sunPos.y, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 200, 100, 0.5)`);
      glowGrad.addColorStop(0.3, `rgba(255, 150, 50, 0.2)`);
      glowGrad.addColorStop(0.6, `rgba(255, 100, 0, 0.08)`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(sunPos.x - 8, sunPos.y - 8, 0, sunPos.x, sunPos.y, finalRadius);
      sunGrad.addColorStop(0, '#fff8e7');
      sunGrad.addColorStop(0.3, '#ffe4a0');
      sunGrad.addColorStop(0.6, '#ffcc66');
      sunGrad.addColorStop(0.9, '#ff9933');
      sunGrad.addColorStop(1, '#ff6600');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, finalRadius, 0, Math.PI * 2);
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
      const planetY = Math.sin(planet.angle * 2) * planet.tiltAngle * 10;
      
      const projected = project3D({ x: planetX, y: planetY, z: planetZ }, rotX, rotY, width, height);
      if (!projected) return;
      
      const depthScale = Math.min(1, 500 / projected.z);
      const finalRadius = planet.radius * depthScale;
      
      // Planet glow
      ctx.fillStyle = planet.glowColor;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, finalRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet body
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
      
      // Saturn's rings
      if (planet.hasRing && planet.name === 'Saturn') {
        ctx.save();
        ctx.translate(projected.x, projected.y);
        const ringTilt = 0.5;
        ctx.rotate(ringTilt);
        
        ctx.strokeStyle = planet.ringColor || 'rgba(210, 180, 140, 0.6)';
        ctx.lineWidth = finalRadius * 0.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, finalRadius * 1.5, finalRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(projected.x - finalRadius * 0.25, projected.y - finalRadius * 0.25, finalRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    };

    // Mouse/touch interaction
    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      mouseX.current = (clientX / window.innerWidth) * 2 - 1;
      mouseY.current = (clientY / window.innerHeight) * 2 - 1;
      
      setTargetRotY(mouseX.current * Math.PI * 1.2);
      setTargetRotX(mouseY.current * Math.PI * 0.4);
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
      e.preventDefault();
      setTargetRotY(prev => prev + e.deltaY * 0.003);
    }, []);

    // Animation loop
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      if (width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Smooth interpolation
      currentRotX.current += (targetRotX - currentRotX.current) * 0.06;
      currentRotY.current += (targetRotY - currentRotY.current) * 0.06;
      
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
      drawStars3D(ctx, currentRotX.current, currentRotY.current, width, height, time);
      
      // Draw Sun
      drawSun3D(ctx, currentRotX.current, currentRotY.current, width, height, time);
      
      // Draw planets
      for (const planet of planetsRef.current) {
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

    // Setup
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [project3D]);

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
