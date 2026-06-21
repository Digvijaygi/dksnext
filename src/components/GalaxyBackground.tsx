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

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
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
      
      // 2. Original twinkling stars (static on screen space)
      for (let i = 0; i < 400; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0,
          size: 0.3 + Math.random() * 0.8,
          opacity: 0.3 + Math.random() * 0.5,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 2,
          originalX: Math.random() * width,
          originalY: Math.random() * height,
          hasGlow: Math.random() > 0.8,
        });
      }
      
      // 3. Bright twinkling stars (larger, more prominent)
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0,
          size: 0.8 + Math.random() * 1.2,
          opacity: 0.5 + Math.random() * 0.4,
          color: '#ffffff',
          twinkleSpeed: 0.3 + Math.random() * 1,
          originalX: Math.random() * width,
          originalY: Math.random() * height,
          hasGlow: true,
        });
      }
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
      
      // Perspective Scale Factor
      const scale = fov / (fov + z2); 

      return {
        x: canvas.width / 2 + x3 * scale,
        y: canvas.height / 2 + y3 * scale,
        z: z2,
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
        
        // Draw glow for brighter stars
        if (star.hasGlow || star.size > 0.8) {
          ctx.beginPath();
          ctx.arc(x, y, finalSize * 2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity * 0.25;
          ctx.fill();
        }
        
        // Cross-shaped sparkle for very bright stars
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

    // ─── CONTROL LOGICS ───

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

    // Animation Loop
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

      // Render stars only
      drawStars(time);

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
