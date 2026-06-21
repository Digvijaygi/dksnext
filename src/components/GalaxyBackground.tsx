import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  // Additional properties for original starfield
  originalX?: number;
  originalY?: number;
  hasGlow?: boolean;
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
  projX?: number;
  projY?: number;
  projZ?: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // 3D Angles: Pitch (Up/Down Tilt), Yaw (Left/Right 360), Roll (Scroll Wheel Control)
  const angleX = useRef<number>(0.6); // Default tilt
  const angleY = useRef<number>(0);   // Default rotation
  const angleZ = useRef<number>(0);   // Scroll wheel roll
  
  const targetAngleX = useRef<number>(0.6);
  const targetAngleY = useRef<number>(0);
  const targetAngleZ = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const init = () => {
      const width = canvas.width;
      const height = canvas.height;
      const maxDim = Math.max(width, height);

      // Combined Starfield: 3D stars + Original twinkling stars
      starsRef.current = [];
      const starColors = ['#ffffff', '#e0e8ff', '#ffe8e0', '#ffe0f0'];
      
      // 1. Background 3D stars (deep space)
      for (let i = 0; i < 300; i++) {
        starsRef.current.push({
          x: (Math.random() - 0.5) * maxDim * 3,
          y: (Math.random() - 0.5) * maxDim * 3,
          z: (Math.random() - 0.5) * maxDim * 3,
          size: 0.3 + Math.random() * 0.8,
          opacity: 0.2 + Math.random() * 0.4,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 2,
          hasGlow: false,
        });
      }
      
      // 2. Original twinkling stars (static on screen space) - ALL STARS MADE SMALLER
      for (let i = 0; i < 400; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0,
          size: 0.3 + Math.random() * 0.8, // Reduced from 0.5-1.5 to 0.3-0.8
          opacity: 0.3 + Math.random() * 0.5,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 2,
          originalX: Math.random() * width,
          originalY: Math.random() * height,
          hasGlow: Math.random() > 0.8,
        });
      }
      
      // 3. Bright twinkling stars (larger, more prominent) - SIZE REDUCED
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0,
          size: 0.8 + Math.random() * 1.2, // Reduced from 1.5-2 to 0.8-1.2
          opacity: 0.5 + Math.random() * 0.4,
          color: '#ffffff',
          twinkleSpeed: 0.3 + Math.random() * 1,
          originalX: Math.random() * width,
          originalY: Math.random() * height,
          hasGlow: true,
        });
      }

      // Planets Matrix - Proportions scaled for realistic 3D depth pop
      const baseDistance = Math.min(width, height) * 0.07;
      planetsRef.current = [
        { name: 'Mercury', radius: 3, distance: baseDistance * 1.2, angle: 0, speed: 0.035, color: '#b0a89c', glowColor: '#b0a89c25', hasRing: false },
        { name: 'Venus', radius: 4.5, distance: baseDistance * 1.8, angle: 0.8, speed: 0.025, color: '#e6b856', glowColor: '#e6b85625', hasRing: false },
        { name: 'Earth', radius: 5, distance: baseDistance * 2.5, angle: 1.6, speed: 0.018, color: '#4a90d9', glowColor: '#4a90d925', hasRing: false },
        { name: 'Mars', radius: 4, distance: baseDistance * 3.2, angle: 2.4, speed: 0.014, color: '#e0764a', glowColor: '#e0764a25', hasRing: false },
        { name: 'Jupiter', radius: 11, distance: baseDistance * 4.2, angle: 3.2, speed: 0.009, color: '#d8a27a', glowColor: '#d8a27a25', hasRing: false },
        { name: 'Saturn', radius: 9, distance: baseDistance * 5.4, angle: 4.0, speed: 0.007, color: '#f2cd9b', glowColor: '#f2cd9b25', hasRing: true, ringColor: 'rgba(210, 180, 140, 0.45)' },
        { name: 'Uranus', radius: 7, distance: baseDistance * 6.5, angle: 4.8, speed: 0.005, color: '#b0e0e6', glowColor: '#b0e0e625', hasRing: false },
        { name: 'Neptune', radius: 6.8, distance: baseDistance * 7.5, angle: 5.6, speed: 0.004, color: '#4169e1', glowColor: '#4169e125', hasRing: false },
      ];
    };

    // Advanced 3D Perspective Projection Engine (True Depth Simulation)
    const project3D = (x: number, y: number, z: number) => {
      // 1. Rotate around Y-axis (Yaw / Left-Right mouse movement)
      let cosY = Math.cos(angleY.current);
      let sinY = Math.sin(angleY.current);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // 2. Rotate around X-axis (Pitch / Up-Down mouse tilt)
      let cosX = Math.cos(angleX.current);
      let sinX = Math.sin(angleX.current);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // 3. Rotate around Z-axis (Roll / Scroll Wheel)
      let cosZ = Math.cos(angleZ.current);
      let sinZ = Math.sin(angleZ.current);
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      // Perspective Focal Length Calculation
      const fov = Math.max(canvas.width, canvas.height) * 0.8; 
      const cameraDistance = fov; // Camera position offset
      
      // Perspective Scale Factor
      const scale = fov / (fov + z2); 

      return {
        x: canvas.width / 2 + x3 * scale,
        y: canvas.height / 2 + y3 * scale,
        z: z2, // Sent for depth layering (Z-buffering)
        scale: scale
      };
    };

    const drawStars = (time: number) => {
      for (const star of starsRef.current) {
        let x, y, scale = 1;
        
        // Handle 3D stars (with z coordinate)
        if (star.z !== 0 || star.originalX === undefined) {
          const pt = project3D(star.x, star.y, star.z);
          x = pt.x;
          y = pt.y;
          scale = pt.scale;
        } else {
          // Original stars remain in screen space
          x = star.x;
          y = star.y;
          // Slight parallax effect for original stars (subtle)
          x += angleY.current * 15;
          y += angleX.current * 10;
          
          // Wrap around edges
          if (x < -50) x = canvas.width + 50;
          if (x > canvas.width + 50) x = -50;
          if (y < -50) y = canvas.height + 50;
          if (y > canvas.height + 50) y = -50;
        }
        
        // Twinkling effect
        const twinkle = 0.6 + Math.sin(time * star.twinkleSpeed) * 0.4;
        const opacity = Math.min(1, star.opacity * twinkle);
        
        // Draw star
        const finalSize = Math.max(0.2, star.size * (scale > 0 ? scale : 1));
        ctx.beginPath();
        ctx.arc(x, y, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        
        // Draw glow for brighter stars (glow size also reduced)
        if (star.hasGlow || star.size > 0.8) {
          ctx.beginPath();
          ctx.arc(x, y, finalSize * 2, 0, Math.PI * 2); // Reduced from 2.5 to 2
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity * 0.25;
          ctx.fill();
        }
        
        // Cross-shaped sparkle for very bright stars (sparkle size reduced)
        if (star.size > 1.2 && twinkle > 0.8) {
          ctx.globalAlpha = opacity * 0.6;
          ctx.beginPath();
          ctx.moveTo(x - finalSize * 1.5, y);
          ctx.lineTo(x + finalSize * 1.5, y);
          ctx.moveTo(x, y - finalSize * 1.5);
          ctx.lineTo(x, y + finalSize * 1.5);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawSun = (x: number, y: number, radius: number, scale: number) => {
      const finalRadius = radius * scale;
      const glowRadius = finalRadius * 4;

      const glowGrad = ctx.createRadialGradient(x, y, finalRadius, x, y, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 215, 130, 0.6)`);
      glowGrad.addColorStop(0.2, `rgba(255, 130, 30, 0.25)`);
      glowGrad.addColorStop(0.6, `rgba(255, 60, 0, 0.05)`);
      glowGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      const sunGrad = ctx.createRadialGradient(x - finalRadius * 0.2, y - finalRadius * 0.2, 0, x, y, finalRadius);
      sunGrad.addColorStop(0, '#fffdf0');
      sunGrad.addColorStop(0.2, '#ffdf85');
      sunGrad.addColorStop(0.6, '#ff7700');
      sunGrad.addColorStop(1, '#b32400');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (p: Planet, scale: number) => {
      const x = p.projX!;
      const y = p.projY!;
      const finalRadius = Math.max(0.8, p.radius * scale);

      // Render Atmosphere Glow
      ctx.fillStyle = p.glowColor;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Dynamic Shading matching 3D Sunlight vectors
      const planetGrad = ctx.createRadialGradient(x - finalRadius * 0.25, y - finalRadius * 0.25, 0, x, y, finalRadius);
      planetGrad.addColorStop(0, p.color);
      planetGrad.addColorStop(0.7, p.color);
      planetGrad.addColorStop(1, '#020208'); 
      
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 3D Saturn Rings Transformation
      if (p.hasRing) {
        ctx.save();
        ctx.translate(x, y);
        // Sync ring tilt with overall Pitch (angleX) & Roll (angleZ)
        ctx.rotate(angleZ.current);
        ctx.scale(1, Math.abs(Math.sin(angleX.current)) * 0.6 + 0.08); 
        
        ctx.strokeStyle = p.ringColor || 'rgba(210, 180, 140, 0.5)';
        ctx.lineWidth = finalRadius * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, finalRadius * 1.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const draw3DOrbitPaths = () => {
      ctx.lineWidth = 0.8;
      
      for (const planet of planetsRef.current) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        
        // Dynamic path rendering in 3D loop
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.05) {
          const ox = Math.cos(a) * planet.distance;
          const oz = Math.sin(a) * planet.distance;
          const pt = project3D(ox, 0, oz);
          
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
    };

    // ─── CONTROL LOGICS (BINA CLICK KIYE INTERACTION) ───

    // 1. Move Mouse Left/Right -> Rotate 360 | Move Up/Down -> Tilt View
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Full 360° Horizontal rotation (Yaw)
      targetAngleY.current = (mx / rect.width) * Math.PI * 2;
      // Verticle Tilt bounding mapping (Pitch)
      targetAngleX.current = ((my / rect.height) * Math.PI) - Math.PI / 2;
    };

    // 2. Scroll Wheel -> Extra Rotation Control (Z-Axis Roll)
    const handleWheel = (e: WheelEvent) => {
      // Modulates Z rotation gently on trackpad/mousewheel scroll
      targetAngleZ.current += e.deltaY * 0.002;
    };

    // 3. Touch Drag -> Mobile Controls
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const ty = e.touches[0].clientY - rect.top;

      targetAngleY.current = (tx / rect.width) * Math.PI * 2;
      targetAngleX.current = ((ty / rect.height) * Math.PI) - Math.PI / 2;
    };

    // Animation Loop optimized for 120FPS setups
    const animate = () => {
      timeRef.current += 16;
      const time = timeRef.current;

      // Interpolation (Lerp) for liquid smooth rendering mechanics
      angleX.current += (targetAngleX.current - angleX.current) * 0.05;
      angleY.current += (targetAngleY.current - angleY.current) * 0.05;
      angleZ.current += (targetAngleZ.current - angleZ.current) * 0.05;

      // Space Vacuum Cleansing
      ctx.fillStyle = '#010105';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render background cosmos
      drawStars(time);

      // Matrix computation setup for Depth Buffering
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.038;
      const sunProj = project3D(0, 0, 0);

      const renderingQueue: any[] = [
        { type: 'sun', z: sunProj.z, x: sunProj.x, y: sunProj.y, scale: sunProj.scale }
      ];

      // Update and map planets into perspective array
      for (const planet of planetsRef.current) {
        planet.angle += planet.speed; // Increment orbital movement
        
        const px = Math.cos(planet.angle) * planet.distance;
        const pz = Math.sin(planet.angle) * planet.distance;
        const py = 0; // Flat base grid inside 3D environment

        const pt = project3D(px, py, pz);
        planet.projX = pt.x;
        planet.projY = pt.y;
        planet.projZ = pt.z;

        renderingQueue.push({ type: 'planet', z: pt.z, scale: pt.scale, data: planet });
      }

      // ─── TRUE 3D DEPTH SORTING (Z-INDEX BUFFER) ───
      renderingQueue.sort((a, b) => b.z - a.z); // Render further objects first

      // Draw Orbit system paths in perspective
      draw3DOrbitPaths();

      // Final Render cycle
      for (const item of renderingQueue) {
        if (item.type === 'sun') {
          drawSun(item.x, item.y, sunRadius, item.scale);
        } else if (item.type === 'planet') {
          drawPlanet(item.data, item.scale);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Event Registration
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationRef.current);
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
        background: '#010105',
        cursor: 'crosshair'
      }}
    />
  );
};

export default GalaxyBackground;
