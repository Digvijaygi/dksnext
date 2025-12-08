import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
      initNebulas();
    };

    const initStars = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 3000);
      starsRef.current = [];
      
      const colors = ['#ffffff', '#a855f7', '#3b82f6', '#ec4899', '#fbbf24'];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 3 + 1,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const initNebulas = () => {
      nebulasRef.current = [];
      const nebulaCount = 5;
      
      const colors = [
        'rgba(139, 92, 246, 0.15)',
        'rgba(59, 130, 246, 0.12)',
        'rgba(236, 72, 153, 0.1)',
        'rgba(16, 185, 129, 0.08)',
        'rgba(251, 191, 36, 0.08)'
      ];
      
      for (let i = 0; i < nebulaCount; i++) {
        nebulasRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 400 + 200,
          color: colors[i % colors.length],
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    };

    const drawNebula = (nebula: Nebula, offsetX: number, offsetY: number) => {
      const x = nebula.x + offsetX * 0.3;
      const y = nebula.y + offsetY * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.size);
      gradient.addColorStop(0, nebula.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(x, y, nebula.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawStar = (star: Star, offsetX: number, offsetY: number, time: number) => {
      const parallaxX = offsetX * star.z * 0.5;
      const parallaxY = offsetY * star.z * 0.5;
      
      const x = star.x + parallaxX;
      const y = star.y + parallaxY;
      
      // Twinkle effect
      const twinkle = Math.sin(time * 0.003 + star.x * 0.01) * 0.3 + 0.7;
      const currentOpacity = star.opacity * twinkle;
      
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = currentOpacity;
      ctx.fill();
      
      // Glow effect for larger stars
      if (star.size > 1.5) {
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 4);
        glowGradient.addColorStop(0, star.color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, star.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = currentOpacity * 0.3;
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
    };

    const drawShootingStar = (time: number) => {
      const cycle = time % 8000;
      if (cycle < 500) {
        const progress = cycle / 500;
        const startX = canvas.width * 0.8;
        const startY = canvas.height * 0.1;
        const endX = canvas.width * 0.2;
        const endY = canvas.height * 0.4;
        
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        
        const gradient = ctx.createLinearGradient(
          currentX + 100, currentY - 50,
          currentX, currentY
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        
        ctx.beginPath();
        ctx.moveTo(currentX + 100, currentY - 50);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    };

    let time = 0;
    const animate = () => {
      time += 16;
      
      // Deep space gradient background
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      bgGradient.addColorStop(0, '#0a0a1a');
      bgGradient.addColorStop(0.5, '#050510');
      bgGradient.addColorStop(1, '#000005');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const offsetX = (mousePos.x - 0.5) * 100;
      const offsetY = (mousePos.y - 0.5) * 100;
      
      // Draw nebulas
      nebulasRef.current.forEach(nebula => {
        drawNebula(nebula, offsetX, offsetY);
      });
      
      // Draw stars
      starsRef.current.forEach(star => {
        drawStar(star, offsetX, offsetY, time);
      });
      
      // Draw shooting star
      drawShootingStar(time);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
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
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#000005' }}
    />
  );
};
