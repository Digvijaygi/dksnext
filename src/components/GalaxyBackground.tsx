import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
}

interface Planet {
  name: string;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  hasRing?: boolean;
  ringColor?: string;
  moons?: { radius: number; orbitRadius: number; speed: number; angle: number; color: string }[];
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const blackHoleRef = useRef({ rotation: 0, pulsePhase: 0 });

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
      // Stars
      const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 6000));
      starsRef.current = [];
      const starColors = ['#ffffff', '#ffe4c4', '#87ceeb', '#ffd700', '#ff6b6b'];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }

      // 8 Planets of Solar System with realistic orbital speeds
      const baseOrbit = Math.min(canvas.width, canvas.height) * 0.08;
      planetsRef.current = [
        { name: 'Mercury', radius: 4, color: '#b5b5b5', orbitRadius: baseOrbit, orbitSpeed: 0.004, angle: Math.random() * Math.PI * 2 },
        { name: 'Venus', radius: 6, color: '#e6c87a', orbitRadius: baseOrbit * 1.4, orbitSpeed: 0.003, angle: Math.random() * Math.PI * 2 },
        { name: 'Earth', radius: 7, color: '#4a90d9', orbitRadius: baseOrbit * 1.9, orbitSpeed: 0.0025, angle: Math.random() * Math.PI * 2,
          moons: [{ radius: 2, orbitRadius: 14, speed: 0.01, angle: 0, color: '#c0c0c0' }] },
        { name: 'Mars', radius: 5, color: '#cf5c36', orbitRadius: baseOrbit * 2.5, orbitSpeed: 0.002, angle: Math.random() * Math.PI * 2 },
        { name: 'Jupiter', radius: 16, color: '#d4a574', orbitRadius: baseOrbit * 3.4, orbitSpeed: 0.0012, angle: Math.random() * Math.PI * 2,
          moons: [
            { radius: 3, orbitRadius: 24, speed: 0.008, angle: 0, color: '#ffa500' },
            { radius: 2, orbitRadius: 30, speed: 0.006, angle: Math.PI, color: '#d4d4d4' }
          ] },
        { name: 'Saturn', radius: 14, color: '#f4d59e', orbitRadius: baseOrbit * 4.2, orbitSpeed: 0.0009, angle: Math.random() * Math.PI * 2,
          hasRing: true, ringColor: 'rgba(210, 180, 140, 0.5)' },
        { name: 'Uranus', radius: 10, color: '#7fdbda', orbitRadius: baseOrbit * 5, orbitSpeed: 0.0006, angle: Math.random() * Math.PI * 2,
          hasRing: true, ringColor: 'rgba(127, 219, 218, 0.3)' },
        { name: 'Neptune', radius: 9, color: '#4169e1', orbitRadius: baseOrbit * 5.8, orbitSpeed: 0.0004, angle: Math.random() * Math.PI * 2 },
      ];

      // Shooting stars
      shootingStarsRef.current = [];
      for (let i = 0; i < 3; i++) {
        shootingStarsRef.current.push({
          x: 0, y: 0,
          length: 80 + Math.random() * 60,
          speed: 12 + Math.random() * 8,
          angle: Math.PI / 4 + Math.random() * 0.4,
          opacity: 0,
          active: false,
        });
      }
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
      blackHoleRef.current.rotation += 0.008;
      blackHoleRef.current.pulsePhase += 0.015;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Background gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height) * 0.8);
      gradient.addColorStop(0, '#0d0d1a');
      gradient.addColorStop(0.3, '#0a0a15');
      gradient.addColorStop(0.6, '#050510');
      gradient.addColorStop(1, '#000003');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with parallax
      starsRef.current.forEach(star => {
        const parallaxX = star.x + mouseRef.current.x * star.z * 0.5;
        const parallaxY = star.y + mouseRef.current.y * star.z * 0.5;
        
        const twinkle = Math.sin(time * 0.003 * star.speed + star.x) * 0.4 + 0.6;
        
        const hex = star.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        ctx.beginPath();
        ctx.arc(parallaxX, parallaxY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity * twinkle})`;
        ctx.fill();
        
        if (star.size > 1.5) {
          const glow = ctx.createRadialGradient(parallaxX, parallaxY, 0, parallaxX, parallaxY, star.size * 3);
          glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 * twinkle})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(parallaxX, parallaxY, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Shooting stars
      shootingStarsRef.current.forEach(star => {
        if (!star.active && Math.random() < 0.001) {
          star.active = true;
          star.x = Math.random() * canvas.width * 0.5;
          star.y = Math.random() * canvas.height * 0.3;
          star.opacity = 1;
        }
        
        if (star.active) {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.02;
          
          if (star.opacity <= 0) {
            star.active = false;
          } else {
            const gradient = ctx.createLinearGradient(
              star.x, star.y,
              star.x - Math.cos(star.angle) * star.length,
              star.y - Math.sin(star.angle) * star.length
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
              star.x - Math.cos(star.angle) * star.length,
              star.y - Math.sin(star.angle) * star.length
            );
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      });

      // BLACK HOLE (positioned offset from center)
      const bhX = centerX * 0.6;
      const bhY = centerY * 0.7;
      const bhRadius = Math.min(canvas.width, canvas.height) * 0.06;
      const bhPulse = Math.sin(blackHoleRef.current.pulsePhase) * 3;

      ctx.save();
      ctx.translate(bhX, bhY);
      
      // Outer accretion glow
      for (let i = 4; i >= 0; i--) {
        const diskGrad = ctx.createRadialGradient(0, 0, bhRadius, 0, 0, bhRadius * 3 + i * 15);
        diskGrad.addColorStop(0, 'transparent');
        diskGrad.addColorStop(0.4, `rgba(255, ${80 + i * 25}, 30, ${0.12 - i * 0.02})`);
        diskGrad.addColorStop(0.7, `rgba(255, ${130 + i * 20}, 80, ${0.08 - i * 0.015})`);
        diskGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhRadius * 3 + i * 15 + bhPulse, (bhRadius * 1.2 + i * 6) * 0.35, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spinning accretion disk
      ctx.save();
      ctx.rotate(blackHoleRef.current.rotation);
      for (let ring = 0; ring < 4; ring++) {
        ctx.strokeStyle = `rgba(255, ${160 - ring * 35}, ${80 - ring * 20}, ${0.5 - ring * 0.1})`;
        ctx.lineWidth = 3 - ring * 0.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhRadius * 1.6 + ring * 12, (bhRadius * 0.7 + ring * 5) * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Event horizon
      const eventHorizon = ctx.createRadialGradient(0, 0, 0, 0, 0, bhRadius);
      eventHorizon.addColorStop(0, '#000000');
      eventHorizon.addColorStop(0.8, '#000000');
      eventHorizon.addColorStop(1, 'rgba(30, 0, 50, 0.8)');
      ctx.fillStyle = eventHorizon;
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
      ctx.fill();

      // Photon ring
      const photonOpacity = 0.5 + Math.sin(blackHoleRef.current.pulsePhase * 2) * 0.2;
      ctx.strokeStyle = `rgba(255, 180, 120, ${photonOpacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius + 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // SUN at center
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.035;
      const sunPulse = Math.sin(time * 0.002) * 2;
      
      // Sun corona
      for (let i = 3; i >= 0; i--) {
        const coronaGrad = ctx.createRadialGradient(centerX, centerY, sunRadius, centerX, centerY, sunRadius * 2 + i * 20);
        coronaGrad.addColorStop(0, `rgba(255, 200, 50, ${0.25 - i * 0.05})`);
        coronaGrad.addColorStop(0.6, `rgba(255, 150, 0, ${0.12 - i * 0.025})`);
        coronaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius * 2 + i * 20 + sunPulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun body
      const sunGrad = ctx.createRadialGradient(centerX - sunRadius * 0.2, centerY - sunRadius * 0.2, 0, centerX, centerY, sunRadius + sunPulse);
      sunGrad.addColorStop(0, '#ffffd0');
      sunGrad.addColorStop(0.4, '#ffdd00');
      sunGrad.addColorStop(0.75, '#ff9500');
      sunGrad.addColorStop(1, '#ff5500');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius + sunPulse, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbit paths
      ctx.setLineDash([4, 8]);
      planetsRef.current.forEach(planet => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw planets orbiting the Sun
      planetsRef.current.forEach(planet => {
        // Update planet angle for orbit
        planet.angle += planet.orbitSpeed;
        
        const orbitX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
        const orbitY = centerY + Math.sin(planet.angle) * planet.orbitRadius;
        
        // Planet glow
        const planetGlow = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, planet.radius * 2);
        planetGlow.addColorStop(0, planet.color + '40');
        planetGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet rings (Saturn, Uranus)
        if (planet.hasRing && planet.ringColor) {
          ctx.save();
          ctx.translate(orbitX, orbitY);
          ctx.rotate(0.4);
          ctx.strokeStyle = planet.ringColor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.radius * 2, planet.radius * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.radius * 1.6, planet.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        
        // Planet body
        const pGrad = ctx.createRadialGradient(orbitX - planet.radius * 0.3, orbitY - planet.radius * 0.3, 0, orbitX, orbitY, planet.radius);
        pGrad.addColorStop(0, planet.color);
        pGrad.addColorStop(1, '#000000');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Moons
        if (planet.moons) {
          planet.moons.forEach(moon => {
            moon.angle += moon.speed;
            const moonX = orbitX + Math.cos(moon.angle) * moon.orbitRadius;
            const moonY = orbitY + Math.sin(moon.angle) * moon.orbitRadius;
            
            ctx.fillStyle = moon.color;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moon.radius, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

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

export default GalaxyBackground;
