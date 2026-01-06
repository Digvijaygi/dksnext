import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
}

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  ringColor?: string;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initUniverse();
    };

    const initUniverse = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 6000);
      starsRef.current = [];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 1000,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.2,
        });
      }

      // Initialize planets
      planetsRef.current = [
        { x: 0, y: 0, radius: 25, color: '#00d4aa', orbitRadius: 150, orbitSpeed: 0.0003, angle: 0 },
        { x: 0, y: 0, radius: 18, color: '#8b5cf6', orbitRadius: 250, orbitSpeed: 0.0002, angle: Math.PI / 3, ringColor: 'rgba(139, 92, 246, 0.3)' },
        { x: 0, y: 0, radius: 35, color: '#f59e0b', orbitRadius: 380, orbitSpeed: 0.00015, angle: Math.PI },
        { x: 0, y: 0, radius: 12, color: '#ef4444', orbitRadius: 120, orbitSpeed: 0.0005, angle: Math.PI * 1.5 },
        { x: 0, y: 0, radius: 8, color: '#3b82f6', orbitRadius: 300, orbitSpeed: 0.00025, angle: Math.PI / 2 },
      ];
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX - canvas.width / 2) * 0.0003,
        y: (e.clientY - canvas.height / 2) * 0.0003,
      };
    };

    let time = 0;
    const animate = () => {
      time += 16;
      rotationRef.current += 0.0005;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Deep space gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height));
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.3, '#050515');
      gradient.addColorStop(0.7, '#020210');
      gradient.addColorStop(1, '#000005');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw galaxy spiral core
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);
      
      // Spiral arms
      for (let arm = 0; arm < 4; arm++) {
        ctx.save();
        ctx.rotate((arm * Math.PI) / 2);
        
        for (let i = 0; i < 80; i++) {
          const angle = i * 0.15;
          const distance = i * 4;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const alpha = Math.max(0, 0.4 - i * 0.004);
          
          const grad = ctx.createRadialGradient(x, y, 0, x, y, 8 + Math.random() * 4);
          grad.addColorStop(0, `rgba(0, 212, 170, ${alpha})`);
          grad.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.5})`);
          grad.addColorStop(1, 'transparent');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, 8 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();

      // Draw stars with 3D rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      
      starsRef.current.forEach(star => {
        // Apply rotation
        const cosR = Math.cos(rotationRef.current * star.speed);
        const sinR = Math.sin(rotationRef.current * star.speed);
        
        let rotatedX = star.x * cosR - star.y * sinR;
        let rotatedY = star.x * sinR + star.y * cosR;
        
        // Apply mouse parallax
        rotatedX += mouseRef.current.x * star.z * 0.5;
        rotatedY += mouseRef.current.y * star.z * 0.5;

        // 3D perspective
        const perspective = 1000 / (1000 + star.z);
        const screenX = rotatedX * perspective;
        const screenY = rotatedY * perspective;
        const screenSize = star.size * perspective;
        
        // Twinkle effect
        const twinkle = Math.sin(time * 0.003 + star.x * 0.02) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
        
        // Star color variation
        const hue = (star.x + star.y) % 60 + 170;
        ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${star.opacity * twinkle * perspective})`;
        ctx.fill();
        
        // Star glow
        if (star.size > 1.5) {
          const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenSize * 3);
          glow.addColorStop(0, `hsla(${hue}, 100%, 80%, ${0.3 * twinkle})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(screenX, screenY, screenSize * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Draw orbiting planets
      planetsRef.current.forEach(planet => {
        planet.angle += planet.orbitSpeed * 16;
        
        const orbitX = centerX + Math.cos(planet.angle + rotationRef.current * 0.5) * planet.orbitRadius;
        const orbitY = centerY + Math.sin(planet.angle + rotationRef.current * 0.5) * planet.orbitRadius * 0.4;
        
        // Orbit path
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, planet.orbitRadius, planet.orbitRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Planet glow
        const planetGlow = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, planet.radius * 3);
        planetGlow.addColorStop(0, planet.color + '40');
        planetGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet body
        const planetGrad = ctx.createRadialGradient(
          orbitX - planet.radius * 0.3, orbitY - planet.radius * 0.3, 0,
          orbitX, orbitY, planet.radius
        );
        planetGrad.addColorStop(0, planet.color);
        planetGrad.addColorStop(0.7, planet.color + 'aa');
        planetGrad.addColorStop(1, planet.color + '44');
        
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet ring
        if (planet.ringColor) {
          ctx.strokeStyle = planet.ringColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(orbitX, orbitY, planet.radius * 1.8, planet.radius * 0.5, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Nebula clouds
      const nebulaPositions = [
        { x: 0.2, y: 0.3, color: 'rgba(0, 212, 170, 0.03)' },
        { x: 0.8, y: 0.7, color: 'rgba(139, 92, 246, 0.03)' },
        { x: 0.5, y: 0.2, color: 'rgba(236, 72, 153, 0.02)' },
      ];
      
      nebulaPositions.forEach(nebula => {
        const nx = canvas.width * nebula.x + Math.sin(time * 0.0005) * 30;
        const ny = canvas.height * nebula.y + Math.cos(time * 0.0005) * 30;
        
        const nebulaGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 300);
        nebulaGrad.addColorStop(0, nebula.color);
        nebulaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#000005' }}
    />
  );
};
