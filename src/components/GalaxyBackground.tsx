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
  x: number;
  y: number;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  ringColor?: string;
  hasRing?: boolean;
  moons?: { radius: number; orbitRadius: number; speed: number; angle: number; color: string }[];
  texture?: { type: 'striped' | 'spotted' | 'solid' | 'gas'; colors: string[] };
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  orbitRadius: number;
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

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(0);
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
      // Stars with color variations
      const starCount = Math.floor((canvas.width * canvas.height) / 4000);
      starsRef.current = [];
      const starColors = ['#ffffff', '#ffe4c4', '#87ceeb', '#ffd700', '#ff6b6b', '#c8a2c8'];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 1500,
          size: Math.random() * 3 + 0.3,
          opacity: Math.random() * 0.9 + 0.1,
          speed: Math.random() * 0.3 + 0.1,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }

      // Solar System Planets
      planetsRef.current = [
        // Sun (at center, will be drawn separately)
        // Mercury
        { 
          name: 'Mercury',
          x: 0, y: 0, radius: 8, color: '#b5b5b5', 
          orbitRadius: 80, orbitSpeed: 0.002, angle: Math.random() * Math.PI * 2,
          texture: { type: 'solid', colors: ['#b5b5b5', '#8a8a8a'] }
        },
        // Venus
        { 
          name: 'Venus',
          x: 0, y: 0, radius: 12, color: '#e6c87a', 
          orbitRadius: 120, orbitSpeed: 0.0015, angle: Math.random() * Math.PI * 2,
          texture: { type: 'gas', colors: ['#e6c87a', '#d4a84b', '#c99739'] }
        },
        // Earth
        { 
          name: 'Earth',
          x: 0, y: 0, radius: 14, color: '#4a90d9', 
          orbitRadius: 170, orbitSpeed: 0.001, angle: Math.random() * Math.PI * 2,
          texture: { type: 'spotted', colors: ['#4a90d9', '#2e7d32', '#1565c0'] },
          moons: [{ radius: 4, orbitRadius: 25, speed: 0.003, angle: 0, color: '#c0c0c0' }]
        },
        // Mars
        { 
          name: 'Mars',
          x: 0, y: 0, radius: 10, color: '#cf5c36', 
          orbitRadius: 230, orbitSpeed: 0.0008, angle: Math.random() * Math.PI * 2,
          texture: { type: 'solid', colors: ['#cf5c36', '#b84a28'] },
          moons: [
            { radius: 2, orbitRadius: 18, speed: 0.004, angle: 0, color: '#a0a0a0' },
            { radius: 1.5, orbitRadius: 24, speed: 0.003, angle: Math.PI, color: '#909090' }
          ]
        },
        // Jupiter
        { 
          name: 'Jupiter',
          x: 0, y: 0, radius: 40, color: '#d4a574', 
          orbitRadius: 320, orbitSpeed: 0.0004, angle: Math.random() * Math.PI * 2,
          texture: { type: 'striped', colors: ['#d4a574', '#c49464', '#b48454', '#e6c9a8'] },
          moons: [
            { radius: 5, orbitRadius: 55, speed: 0.002, angle: 0, color: '#ffa500' },
            { radius: 6, orbitRadius: 65, speed: 0.0015, angle: Math.PI / 2, color: '#d4d4d4' },
            { radius: 4, orbitRadius: 75, speed: 0.001, angle: Math.PI, color: '#a0c0e0' },
            { radius: 5, orbitRadius: 85, speed: 0.0008, angle: Math.PI * 1.5, color: '#c0a080' }
          ]
        },
        // Saturn
        { 
          name: 'Saturn',
          x: 0, y: 0, radius: 35, color: '#f4d59e', 
          orbitRadius: 420, orbitSpeed: 0.0003, angle: Math.random() * Math.PI * 2,
          hasRing: true, ringColor: 'rgba(210, 180, 140, 0.6)',
          texture: { type: 'striped', colors: ['#f4d59e', '#e8c87c', '#dab86c'] },
          moons: [
            { radius: 8, orbitRadius: 60, speed: 0.001, angle: 0, color: '#ffd700' }
          ]
        },
        // Uranus
        { 
          name: 'Uranus',
          x: 0, y: 0, radius: 22, color: '#7fdbda', 
          orbitRadius: 500, orbitSpeed: 0.00025, angle: Math.random() * Math.PI * 2,
          hasRing: true, ringColor: 'rgba(127, 219, 218, 0.3)',
          texture: { type: 'gas', colors: ['#7fdbda', '#6bc9c8', '#5ab9b8'] }
        },
        // Neptune
        { 
          name: 'Neptune',
          x: 0, y: 0, radius: 20, color: '#4169e1', 
          orbitRadius: 570, orbitSpeed: 0.0002, angle: Math.random() * Math.PI * 2,
          texture: { type: 'gas', colors: ['#4169e1', '#3158d0', '#2147bf'] },
          moons: [{ radius: 5, orbitRadius: 35, speed: 0.002, angle: 0, color: '#e0e0ff' }]
        }
      ];

      // Asteroid belt
      asteroidsRef.current = [];
      for (let i = 0; i < 150; i++) {
        asteroidsRef.current.push({
          x: 0,
          y: 0,
          size: Math.random() * 2 + 0.5,
          angle: Math.random() * Math.PI * 2,
          speed: 0.0003 + Math.random() * 0.0002,
          orbitRadius: 260 + Math.random() * 40,
        });
      }

      // Shooting stars
      shootingStarsRef.current = [];
      for (let i = 0; i < 5; i++) {
        shootingStarsRef.current.push({
          x: 0,
          y: 0,
          length: 100 + Math.random() * 100,
          speed: 15 + Math.random() * 10,
          angle: Math.PI / 4 + Math.random() * 0.5,
          opacity: 0,
          active: false,
        });
      }

      // Nebulae
      nebulaeRef.current = [
        { x: 0.15, y: 0.25, radius: 250, color: 'rgba(138, 43, 226, 0.03)', rotation: 0, rotationSpeed: 0.0001 },
        { x: 0.85, y: 0.75, radius: 300, color: 'rgba(0, 212, 170, 0.03)', rotation: 0, rotationSpeed: -0.00015 },
        { x: 0.5, y: 0.1, radius: 200, color: 'rgba(255, 107, 107, 0.02)', rotation: 0, rotationSpeed: 0.00012 },
        { x: 0.9, y: 0.2, radius: 180, color: 'rgba(64, 224, 208, 0.025)', rotation: 0, rotationSpeed: -0.0001 },
      ];
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX - canvas.width / 2) * 0.0002,
        y: (e.clientY - canvas.height / 2) * 0.0002,
      };
    };

    let time = 0;
    const animate = () => {
      time += 16;
      rotationRef.current += 0.0003;
      blackHoleRef.current.rotation += 0.01;
      blackHoleRef.current.pulsePhase += 0.02;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Deep space gradient with more cosmic colors
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height) * 0.8);
      gradient.addColorStop(0, '#0d0d1a');
      gradient.addColorStop(0.2, '#0a0a15');
      gradient.addColorStop(0.5, '#050510');
      gradient.addColorStop(0.8, '#020208');
      gradient.addColorStop(1, '#000003');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulaeRef.current.forEach(nebula => {
        nebula.rotation += nebula.rotationSpeed;
        const nx = canvas.width * nebula.x + Math.sin(time * 0.0003 + nebula.rotation) * 40;
        const ny = canvas.height * nebula.y + Math.cos(time * 0.0003 + nebula.rotation) * 40;
        
        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(nebula.rotation);
        
        // Multi-layered nebula
        for (let layer = 3; layer >= 0; layer--) {
          const nebulaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius * (1 + layer * 0.3));
          nebulaGrad.addColorStop(0, nebula.color.replace('0.0', '0.0' + (4 - layer)));
          nebulaGrad.addColorStop(0.5, nebula.color);
          nebulaGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = nebulaGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, nebula.radius * (1 + layer * 0.3), nebula.radius * 0.6 * (1 + layer * 0.3), 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw stars with 3D rotation and parallax
      ctx.save();
      ctx.translate(centerX, centerY);
      
      starsRef.current.forEach(star => {
        const cosR = Math.cos(rotationRef.current * star.speed);
        const sinR = Math.sin(rotationRef.current * star.speed);
        
        let rotatedX = star.x * cosR - star.y * sinR;
        let rotatedY = star.x * sinR + star.y * cosR;
        
        rotatedX += mouseRef.current.x * star.z * 0.8;
        rotatedY += mouseRef.current.y * star.z * 0.8;

        const perspective = 1200 / (1200 + star.z);
        const screenX = rotatedX * perspective;
        const screenY = rotatedY * perspective;
        const screenSize = star.size * perspective;
        
        const twinkle = Math.sin(time * 0.004 + star.x * 0.01 + star.y * 0.01) * 0.4 + 0.6;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace(')', `, ${star.opacity * twinkle * perspective})`).replace('rgb', 'rgba').replace('#', '');
        
        // Convert hex to rgba for proper opacity
        const hex = star.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity * twinkle * perspective})`;
        ctx.fill();
        
        // Star glow for bigger stars
        if (star.size > 1.8) {
          const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenSize * 4);
          glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 * twinkle})`);
          glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.1 * twinkle})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(screenX, screenY, screenSize * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Draw BLACK HOLE (epic effect!)
      const bhX = centerX - 200;
      const bhY = centerY - 100;
      const bhRadius = 60;
      const bhPulse = Math.sin(blackHoleRef.current.pulsePhase) * 5;

      // Accretion disk
      ctx.save();
      ctx.translate(bhX, bhY);
      ctx.rotate(blackHoleRef.current.rotation);
      
      // Outer glow
      for (let i = 5; i >= 0; i--) {
        const diskGrad = ctx.createRadialGradient(0, 0, bhRadius, 0, 0, bhRadius * 3 + i * 20);
        diskGrad.addColorStop(0, 'transparent');
        diskGrad.addColorStop(0.3, `rgba(255, ${100 + i * 20}, 50, ${0.1 - i * 0.015})`);
        diskGrad.addColorStop(0.6, `rgba(255, ${150 + i * 15}, 100, ${0.08 - i * 0.01})`);
        diskGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhRadius * 3 + i * 20 + bhPulse, (bhRadius * 1.5 + i * 10) * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spinning accretion ring
      for (let ring = 0; ring < 3; ring++) {
        ctx.strokeStyle = `rgba(255, ${180 - ring * 40}, ${100 - ring * 30}, ${0.4 - ring * 0.1})`;
        ctx.lineWidth = 3 - ring;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhRadius * 1.8 + ring * 15, (bhRadius * 0.8 + ring * 8) * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Event horizon (pure black center)
      const eventHorizon = ctx.createRadialGradient(0, 0, 0, 0, 0, bhRadius);
      eventHorizon.addColorStop(0, '#000000');
      eventHorizon.addColorStop(0.7, '#000000');
      eventHorizon.addColorStop(0.9, 'rgba(20, 0, 40, 0.9)');
      eventHorizon.addColorStop(1, 'transparent');
      ctx.fillStyle = eventHorizon;
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
      ctx.fill();

      // Photon ring
      ctx.strokeStyle = `rgba(255, 200, 150, ${0.6 + Math.sin(blackHoleRef.current.pulsePhase * 2) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius + 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Draw SUN at center
      const sunRadius = 50;
      const sunPulse = Math.sin(time * 0.002) * 3;
      
      // Sun corona
      for (let i = 4; i >= 0; i--) {
        const coronaGrad = ctx.createRadialGradient(centerX, centerY, sunRadius, centerX, centerY, sunRadius * 2 + i * 30);
        coronaGrad.addColorStop(0, `rgba(255, 200, 50, ${0.3 - i * 0.05})`);
        coronaGrad.addColorStop(0.5, `rgba(255, 150, 0, ${0.15 - i * 0.02})`);
        coronaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius * 2 + i * 30 + sunPulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun body
      const sunGrad = ctx.createRadialGradient(centerX - sunRadius * 0.3, centerY - sunRadius * 0.3, 0, centerX, centerY, sunRadius + sunPulse);
      sunGrad.addColorStop(0, '#ffffd0');
      sunGrad.addColorStop(0.3, '#ffdd00');
      sunGrad.addColorStop(0.7, '#ff9500');
      sunGrad.addColorStop(1, '#ff5500');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius + sunPulse, 0, Math.PI * 2);
      ctx.fill();

      // Sun spots (animated)
      ctx.fillStyle = 'rgba(200, 100, 0, 0.4)';
      for (let i = 0; i < 3; i++) {
        const spotAngle = time * 0.0005 + i * 2;
        const spotX = centerX + Math.cos(spotAngle) * sunRadius * 0.5;
        const spotY = centerY + Math.sin(spotAngle) * sunRadius * 0.3;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 5 + i * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw orbit paths
      planetsRef.current.forEach(planet => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, planet.orbitRadius, planet.orbitRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw asteroid belt
      asteroidsRef.current.forEach(asteroid => {
        asteroid.angle += asteroid.speed * 16;
        const ax = centerX + Math.cos(asteroid.angle) * asteroid.orbitRadius;
        const ay = centerY + Math.sin(asteroid.angle) * asteroid.orbitRadius * 0.4;
        
        ctx.fillStyle = `rgba(150, 150, 150, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(ax, ay, asteroid.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw planets
      planetsRef.current.forEach(planet => {
        planet.angle += planet.orbitSpeed * 16;
        
        const orbitX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
        const orbitY = centerY + Math.sin(planet.angle) * planet.orbitRadius * 0.4;
        
        // Planet shadow (for depth)
        const depth = Math.sin(planet.angle);
        if (depth < 0) ctx.globalAlpha = 0.7;
        
        // Planet glow
        const planetGlow = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, planet.radius * 2.5);
        planetGlow.addColorStop(0, planet.color + '30');
        planetGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet rings (before planet body for proper layering when behind)
        if (planet.hasRing && planet.ringColor) {
          ctx.save();
          ctx.translate(orbitX, orbitY);
          ctx.rotate(0.4);
          ctx.strokeStyle = planet.ringColor;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.radius * 2, planet.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Inner ring
          ctx.lineWidth = 4;
          ctx.strokeStyle = planet.ringColor.replace('0.6', '0.4').replace('0.3', '0.2');
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.radius * 1.6, planet.radius * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        
        // Planet body with texture
        if (planet.texture) {
          if (planet.texture.type === 'striped') {
            // Gas giant stripes
            const stripeGrad = ctx.createLinearGradient(orbitX, orbitY - planet.radius, orbitX, orbitY + planet.radius);
            planet.texture.colors.forEach((color, i) => {
              stripeGrad.addColorStop(i / (planet.texture!.colors.length - 1), color);
            });
            ctx.fillStyle = stripeGrad;
          } else {
            // Regular planet gradient
            const planetGrad = ctx.createRadialGradient(
              orbitX - planet.radius * 0.3, orbitY - planet.radius * 0.3, 0,
              orbitX, orbitY, planet.radius
            );
            planetGrad.addColorStop(0, planet.texture.colors[0] || planet.color);
            planetGrad.addColorStop(0.5, planet.color);
            planetGrad.addColorStop(1, planet.texture.colors[planet.texture.colors.length - 1] || planet.color);
            ctx.fillStyle = planetGrad;
          }
        } else {
          const planetGrad = ctx.createRadialGradient(
            orbitX - planet.radius * 0.3, orbitY - planet.radius * 0.3, 0,
            orbitX, orbitY, planet.radius
          );
          planetGrad.addColorStop(0, planet.color);
          planetGrad.addColorStop(1, planet.color + '88');
          ctx.fillStyle = planetGrad;
        }
        
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Atmosphere for Earth-like planets
        if (planet.name === 'Earth') {
          ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(orbitX, orbitY, planet.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Draw moons
        if (planet.moons) {
          planet.moons.forEach(moon => {
            moon.angle += moon.speed * 16;
            const moonX = orbitX + Math.cos(moon.angle) * moon.orbitRadius;
            const moonY = orbitY + Math.sin(moon.angle) * moon.orbitRadius * 0.5;
            
            const moonGrad = ctx.createRadialGradient(
              moonX - moon.radius * 0.3, moonY - moon.radius * 0.3, 0,
              moonX, moonY, moon.radius
            );
            moonGrad.addColorStop(0, moon.color);
            moonGrad.addColorStop(1, moon.color + '88');
            ctx.fillStyle = moonGrad;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moon.radius, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        
        ctx.globalAlpha = 1;
      });

      // Shooting stars
      shootingStarsRef.current.forEach(star => {
        if (!star.active && Math.random() < 0.001) {
          star.active = true;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height * 0.5;
          star.opacity = 1;
        }
        
        if (star.active) {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.015;
          
          if (star.opacity <= 0) {
            star.active = false;
          } else {
            const gradient = ctx.createLinearGradient(
              star.x, star.y,
              star.x - Math.cos(star.angle) * star.length,
              star.y - Math.sin(star.angle) * star.length
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
              star.x - Math.cos(star.angle) * star.length,
              star.y - Math.sin(star.angle) * star.length
            );
            ctx.stroke();
          }
        }
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
      style={{ background: '#000003' }}
    />
  );
};
