import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number; // Added 3D depth for stars
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
  // Dynamic 3D projected coordinates for rendering
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

  // 3D Angles (Pitch = Upar/Neeche, Yaw = Dayen/Bayen)
  const angleX = useRef<number>(0.6); // Default slightly tilted view
  const angleY = useRef<number>(0);
  const targetAngleX = useRef<number>(0.6);
  const targetAngleY = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const init = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Initialize Stars with 3D positions
      starsRef.current = [];
      const starColors = ['#ffffff', '#e0e8ff', '#ffe8e0', '#ffe0f0'];
      
      // 400 Background Stars
      for (let i = 0; i < 400; i++) {
        starsRef.current.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: (Math.random() - 0.5) * Math.max(width, height) * 2,
          size: 0.5 + Math.random() * 1,
          opacity: 0.1 + Math.random() * 0.4,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.5 + Math.random() * 2,
        });
      }

      // 80 Bright Stars
      for (let i = 0; i < 80; i++) {
        starsRef.current.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: (Math.random() - 0.5) * Math.max(width, height) * 2,
          size: 1.2 + Math.random() * 1.5,
          opacity: 0.4 + Math.random() * 0.5,
          color: '#ffffff',
          twinkleSpeed: 0.3 + Math.random() * 1,
        });
      }

      // Base distance scaled dynamically
      const baseDistance = Math.min(width, height) * 0.055;
      planetsRef.current = [
        { name: 'Mercury', radius: 2.5, distance: baseDistance * 1.2, angle: 0, speed: 0.04, color: '#b0a89c', glowColor: '#b0a89c30', hasRing: false },
        { name: 'Venus', radius: 3.8, distance: baseDistance * 1.8, angle: 0.8, speed: 0.03, color: '#e6b856', glowColor: '#e6b85630', hasRing: false },
        { name: 'Earth', radius: 4.5, distance: baseDistance * 2.5, angle: 1.6, speed: 0.022, color: '#4a90d9', glowColor: '#4a90d930', hasRing: false },
        { name: 'Mars', radius: 3.5, distance: baseDistance * 3.2, angle: 2.4, speed: 0.018, color: '#e0764a', glowColor: '#e0764a30', hasRing: false },
        { name: 'Jupiter', radius: 9.5, distance: baseDistance * 4.3, angle: 3.2, speed: 0.01, color: '#d8a27a', glowColor: '#d8a27a30', hasRing: false },
        { name: 'Saturn', radius: 8.0, distance: baseDistance * 5.5, angle: 4.0, speed: 0.008, color: '#f2cd9b', glowColor: '#f2cd9b30', hasRing: true, ringColor: 'rgba(210, 180, 140, 0.5)' },
        { name: 'Uranus', radius: 6.0, distance: baseDistance * 6.7, angle: 4.8, speed: 0.005, color: '#b0e0e6', glowColor: '#b0e0e630', hasRing: false },
        { name: 'Neptune', radius: 5.8, distance: baseDistance * 7.8, angle: 5.6, speed: 0.004, color: '#4169e1', glowColor: '#4169e130', hasRing: false },
      ];
    };

    // Formulate 3D Rotation Math
    const project3D = (x: number, y: number, z: number) => {
      // Rotate around Y axis (Yaw)
      let cosY = Math.cos(angleY.current);
      let sinY = Math.sin(angleY.current);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // Rotate around X axis (Pitch)
      let cosX = Math.cos(angleX.current);
      let sinX = Math.sin(angleX.current);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // Return center offset screen coords and z-depth for sorting
      return {
        x: canvas.width / 2 + x1,
        y: canvas.height / 2 + y2,
        z: z2
      };
    };

    const drawStars = (time: number) => {
      for (const star of starsRef.current) {
        const pt = project3D(star.x, star.y, star.z);
        
        // Don't clip stars behind camera range
        const twinkle = 0.7 + Math.sin(time * star.twinkleSpeed) * 0.3;
        const opacity = star.opacity * twinkle;
        
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawSun = (x: number, y: number, radius: number) => {
      const glowRadius = radius * 3.5;
      const glowGrad = ctx.createRadialGradient(x, y, radius, x, y, glowRadius);
      glowGrad.addColorStop(0, `rgba(255, 210, 120, 0.5)`);
      glowGrad.addColorStop(0.2, `rgba(255, 140, 40, 0.2)`);
      glowGrad.addColorStop(0.6, `rgba(255, 70, 0, 0.05)`);
      glowGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      const sunGrad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.2, 0, x, y, radius);
      sunGrad.addColorStop(0, '#fffbe8');
      sunGrad.addColorStop(0.3, '#ffd875');
      sunGrad.addColorStop(0.7, '#ff8c1a');
      sunGrad.addColorStop(1, '#e63900');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (p: Planet) => {
      const x = p.projX!;
      const y = p.projY!;
      const radius = p.radius;

      // Subtle dynamic sizing based on Z depth to enhance 3D effect
      const zScale = 1 + (p.projZ! / 1000); 
      const finalRadius = Math.max(1, radius * zScale);

      // Glow
      ctx.fillStyle = p.glowColor;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();
      
      // Spherical Shading (Light source is the Sun at the center)
      const planetGrad = ctx.createRadialGradient(x - finalRadius * 0.2, y - finalRadius * 0.2, 0, x, y, finalRadius);
      planetGrad.addColorStop(0, p.color);
      planetGrad.addColorStop(0.8, p.color);
      planetGrad.addColorStop(1, '#050510'); // Dark side
      
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Custom Features
      if (p.name === 'Jupiter') {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#a65d32';
        ctx.fillRect(x - finalRadius, y - finalRadius * 0.2, finalRadius * 2, finalRadius * 0.15);
        ctx.fillRect(x - finalRadius, y + finalRadius * 0.2, finalRadius * 2, finalRadius * 0.12);
        ctx.globalAlpha = 1;
      }

      // 3D Rings for Saturn
      if (p.hasRing) {
        ctx.save();
        ctx.translate(x, y);
        // Tilt the ring dynamically based on the camera tilt angleX
        ctx.scale(1, Math.abs(Math.sin(angleX.current)) * 0.5 + 0.1); 
        
        ctx.strokeStyle = p.ringColor || 'rgba(210, 180, 140, 0.5)';
        ctx.lineWidth = finalRadius * 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, finalRadius * 1.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const draw3DOrbitPaths = () => {
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      
      for (const planet of planetsRef.current) {
        ctx.beginPath();
        // 3D Circles drawn by sampling points
        for (let a = 0; a <= Math.PI * 2; a += 0.08) {
          const ox = Math.cos(a) * planet.distance;
          const oz = Math.sin(a) * planet.distance;
          const pt = project3D(ox, 0, oz);
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    // Smooth Interaction Handler (Bina Click kiye 360 view control)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Mapping Cursor position to Radians
      // X Movement rotates around Y-axis (Full 360 degree Yaw)
      targetAngleY.current = (mx / rect.width) * Math.PI * 2;
      // Y Movement tilts view up and down (Pitch)
      targetAngleX.current = ((my / rect.height) * Math.PI) - Math.PI / 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const ty = e.touches[0].clientY - rect.top;

      targetAngleY.current = (tx / rect.width) * Math.PI * 2;
      targetAngleX.current = ((ty / rect.height) * Math.PI) - Math.PI / 2;
    };

    const animate = () => {
      timeRef.current += 16;
      const time = timeRef.current;

      // 120FPS ultra-smooth interpolation (Lerp mechanics)
      angleX.current += (targetAngleX.current - angleX.current) * 0.05;
      angleY.current += (targetAngleY.current - angleY.current) * 0.05;

      // Space Background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#04040d');
      grad.addColorStop(0.5, '#020207');
      grad.addColorStop(1, '#000002');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Static Deep Stars
      drawStars(time);

      // Calculate 3D Projective Locations for standard orbital update
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.035;
      const sunProj = project3D(0, 0, 0);

      // Map Planet Positions in 3D Space
      const renderingQueue: any[] = [
        { type: 'sun', z: sunProj.z, x: sunProj.x, y: sunProj.y, r: sunRadius }
      ];

      for (const planet of planetsRef.current) {
        planet.angle += planet.speed; // Update orbit position
        
        // Standard X & Z coordinates on a 2D horizontal plane in 3D Space
        const px = Math.cos(planet.angle) * planet.distance;
        const pz = Math.sin(planet.angle) * planet.distance;
        const py = 0; // Keeping orbit flat on standard axis

        const pt = project3D(px, py, pz);
        planet.projX = pt.x;
        planet.projY = pt.y;
        planet.projZ = pt.z;

        renderingQueue.push({ type: 'planet', z: pt.z, data: planet });
      }

      // 3D Depth Sorting (Z-Buffering)
      // Jo object piche (chota Z) hai wo pehle draw hoga, jo aage (bada Z) hai wo baad me draw hoga.
      renderingQueue.sort((a, b) => a.z - b.z);

      // 1. Draw Orbits First (as depth layers)
      draw3DOrbitPaths();

      // 2. Draw Sun and Planets based on sorted depth order
      for (const item of renderingQueue) {
        if (item.type === 'sun') {
          drawSun(item.x, item.y, item.r);
        } else if (item.type === 'planet') {
          drawPlanet(item.data);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Listeners setup
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
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
        cursor: 'move'
      }}
    />
  );
};

export default GalaxyBackground;
