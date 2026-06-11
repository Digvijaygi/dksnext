import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  color: string;
  temperature: number; // Kelvin
  layer: 'background' | 'midground' | 'foreground';
  flickerSpeed: number;
  flickerPhase: number;
}

interface NebulaLayer {
  type: 'emission' | 'reflection' | 'dark' | 'planetary';
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  colors: string[];
  opacity: number;
  turbulence: number;
  stars: { x: number; y: number; size: number }[];
}

interface PlanetDetail {
  name: string;
  radius: number;
  distance: number;
  angle: number;
  angularSpeed: number;
  color: string;
  atmosphereColor: string;
  atmosphereHeight: number;
  hasRings: boolean;
  ringColor: string;
  ringInnerColor: string;
  ringTilt: number;
  textureNoise: number;
  specularHighlight: boolean;
  shadowSoftness: number;
  orbitalInclination: number;
  axialTilt: number;
  moons: MoonDetail[];
}

interface MoonDetail {
  radius: number;
  distance: number;
  angle: number;
  speed: number;
  color: string;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  parallax: number;
}

interface LensFlare {
  x: number;
  y: number;
  elements: { size: number; intensity: number; color: string; offset: number }[];
}

export const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<NebulaLayer[]>([]);
  const planetsRef = useRef<PlanetDetail[]>([]);
  const dustRef = useRef<DustParticle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const lensFlareRef = useRef<LensFlare | null>(null);

  // Generate procedural starfield based on real star distribution
  const generateStarfield = (width: number, height: number) => {
    const stars: Star[] = [];
    
    // Realistic star color based on temperature
    const getStarColor = (temperature: number) => {
      if (temperature > 30000) return { r: 160, g: 180, b: 255 }; // O-type - Blue
      if (temperature > 10000) return { r: 200, g: 210, b: 255 }; // B-type - Blue-white
      if (temperature > 7500) return { r: 255, g: 240, b: 210 }; // A-type - White
      if (temperature > 6000) return { r: 255, g: 235, b: 180 }; // F-type - Yellow-white
      if (temperature > 5200) return { r: 255, g: 220, b: 150 }; // G-type - Yellow (like Sun)
      if (temperature > 3700) return { r: 255, g: 180, b: 110 }; // K-type - Orange
      return { r: 255, g: 140, b: 80 }; // M-type - Red
    };
    
    // Background stars (very faint, numerous)
    for (let i = 0; i < 6000; i++) {
      const temp = 2000 + Math.random() * 28000;
      const color = getStarColor(temp);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.3 + Math.random() * 0.7,
        brightness: 0.1 + Math.random() * 0.3,
        color: `rgb(${color.r}, ${color.g}, ${color.b})`,
        temperature: temp,
        layer: 'background',
        flickerSpeed: 0.5 + Math.random() * 2,
        flickerPhase: Math.random() * Math.PI * 2,
      });
    }
    
    // Midground stars
    for (let i = 0; i < 2000; i++) {
      const temp = 2500 + Math.random() * 30000;
      const color = getStarColor(temp);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.7 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.5,
        color: `rgb(${color.r}, ${color.g}, ${color.b})`,
        temperature: temp,
        layer: 'midground',
        flickerSpeed: 0.8 + Math.random() * 3,
        flickerPhase: Math.random() * Math.PI * 2,
      });
    }
    
    // Foreground bright stars with diffraction spikes
    for (let i = 0; i < 300; i++) {
      const temp = 3000 + Math.random() * 35000;
      const color = getStarColor(temp);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 3.5,
        brightness: 0.6 + Math.random() * 0.4,
        color: `rgb(${color.r}, ${color.g}, ${color.b})`,
        temperature: temp,
        layer: 'foreground',
        flickerSpeed: 0.3 + Math.random() * 1.5,
        flickerPhase: Math.random() * Math.PI * 2,
      });
    }
    
    return stars;
  };

  // Generate realistic nebulae (based on Hubble images)
  const generateNebulae = (width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    return [
      {
        type: 'emission' as const,
        position: { x: centerX - 200, y: centerY - 150 },
        scale: { x: 400, y: 300 },
        rotation: 0.3,
        colors: ['rgba(200, 80, 100, 0.15)', 'rgba(180, 60, 120, 0.1)', 'rgba(150, 40, 100, 0.08)', 'transparent'],
        opacity: 0.6,
        turbulence: 0.4,
        stars: [],
      },
      {
        type: 'emission' as const,
        position: { x: centerX + 300, y: centerY - 100 },
        scale: { x: 350, y: 280 },
        rotation: -0.2,
        colors: ['rgba(80, 100, 200, 0.12)', 'rgba(60, 80, 180, 0.08)', 'rgba(40, 60, 150, 0.06)', 'transparent'],
        opacity: 0.5,
        turbulence: 0.3,
        stars: [],
      },
      {
        type: 'reflection' as const,
        position: { x: centerX - 100, y: centerY + 200 },
        scale: { x: 250, y: 200 },
        rotation: 0.5,
        colors: ['rgba(100, 120, 200, 0.1)', 'rgba(80, 100, 180, 0.07)', 'rgba(60, 80, 150, 0.05)', 'transparent'],
        opacity: 0.4,
        turbulence: 0.2,
        stars: [],
      },
      {
        type: 'planetary' as const,
        position: { x: centerX - 350, y: centerY + 100 },
        scale: { x: 180, y: 180 },
        rotation: 0,
        colors: ['rgba(80, 180, 140, 0.12)', 'rgba(60, 150, 110, 0.08)', 'rgba(40, 120, 80, 0.05)', 'transparent'],
        opacity: 0.45,
        turbulence: 0.15,
        stars: [],
      },
    ];
  };

  // Generate dust particles for zodiacal light effect
  const generateDust = (width: number, height: number) => {
    const dust: DustParticle[] = [];
    for (let i = 0; i < 3000; i++) {
      dust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 2,
        opacity: 0.03 + Math.random() * 0.07,
        parallax: 0.5 + Math.random() * 1.5,
      });
    }
    return dust;
  };

  // Draw realistic planet with atmosphere and shadows
  const drawPlanet = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    planet: PlanetDetail,
    lightX: number,
    lightY: number,
    time: number
  ) => {
    ctx.save();
    ctx.shadowBlur = 0;
    
    // Calculate light direction (from Sun at center)
    const dx = x - lightX;
    const dy = y - lightY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const lightAngle = Math.atan2(dy, dx);
    
    // Illumination factor (0 = dark side, 1 = fully lit)
    const illumination = Math.max(0, Math.cos(lightAngle - planet.axialTilt) * 0.8 + 0.5);
    
    // Planet shadow gradient (realistic terminator)
    const shadowGradient = ctx.createLinearGradient(
      x - radius * 0.7, y - radius * 0.3,
      x + radius * 0.8, y + radius * 0.5
    );
    
    // Color variation based on illumination
    const darkenColor = (color: string, factor: number) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return color;
      return `rgb(${parseInt(rgb[0]) * factor}, ${parseInt(rgb[1]) * factor}, ${parseInt(rgb[2]) * factor})`;
    };
    
    shadowGradient.addColorStop(0, planet.color);
    shadowGradient.addColorStop(0.5, planet.color);
    shadowGradient.addColorStop(0.85, darkenColor(planet.color, 0.4));
    shadowGradient.addColorStop(1, darkenColor(planet.color, 0.15));
    
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add surface texture noise (procedural)
    if (planet.textureNoise > 0) {
      const imageData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * planet.textureNoise * 40;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
      }
      
      ctx.putImageData(imageData, x - radius, y - radius);
    }
    
    // Atmosphere glow
    if (planet.atmosphereHeight > 0) {
      const atmGradient = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius + planet.atmosphereHeight);
      atmGradient.addColorStop(0, 'transparent');
      atmGradient.addColorStop(0.6, planet.atmosphereColor);
      atmGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = atmGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + planet.atmosphereHeight, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright rim on the lit side
      const rimGradient = ctx.createLinearGradient(
        x + Math.cos(lightAngle) * radius * 0.7,
        y + Math.sin(lightAngle) * radius * 0.7,
        x - Math.cos(lightAngle) * radius,
        y - Math.sin(lightAngle) * radius
      );
      rimGradient.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
      rimGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = rimGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Specular highlight (sun reflection)
    if (planet.specularHighlight && illumination > 0.5) {
      const highlightX = x + Math.cos(lightAngle) * radius * 0.4;
      const highlightY = y + Math.sin(lightAngle) * radius * 0.4;
      const highlightGrad = ctx.createRadialGradient(highlightX, highlightY, 0, highlightX, highlightY, radius * 0.3);
      highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * illumination})`);
      highlightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = highlightGrad;
      ctx.beginPath();
      ctx.arc(highlightX, highlightY, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  // Draw realistic rings
  const drawRings = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    ringColor: string,
    ringInnerColor: string,
    tilt: number,
    time: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.shadowBlur = 0;
    
    // Multiple ring layers for realism
    const ringLayers = [
      { inner: radius * 1.1, outer: radius * 1.9, opacity: 0.5, color: ringColor },
      { inner: radius * 1.25, outer: radius * 1.7, opacity: 0.7, color: ringInnerColor },
      { inner: radius * 1.35, outer: radius * 1.55, opacity: 0.4, color: 'rgba(180, 150, 100, 0.6)' },
      { inner: radius * 1.8, outer: radius * 2.1, opacity: 0.3, color: 'rgba(140, 110, 70, 0.4)' },
    ];
    
    for (const layer of ringLayers) {
      const gradient = ctx.createLinearGradient(-layer.outer, 0, layer.outer, 0);
      gradient.addColorStop(0, `rgba(0,0,0,0)`);
      gradient.addColorStop(0.3, layer.color);
      gradient.addColorStop(0.5, `rgba(255,255,255,0.15)`);
      gradient.addColorStop(0.7, layer.color);
      gradient.addColorStop(1, `rgba(0,0,0,0)`);
      
      ctx.beginPath();
      ctx.ellipse(0, 0, layer.outer, layer.outer * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.ellipse(0, 0, layer.inner, layer.inner * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.restore();
  };

  // Draw diffraction spikes for bright stars
  const drawDiffractionSpikes = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    brightness: number,
    angle: number
  ) => {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    const spikeLength = size * 8;
    const spikeWidth = size * 0.8;
    
    for (let i = 0; i < 4; i++) {
      const rot = (i * Math.PI) / 4;
      ctx.save();
      ctx.rotate(rot);
      
      const gradient = ctx.createLinearGradient(0, 0, spikeLength, 0);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.6})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.moveTo(0, -spikeWidth / 2);
      ctx.lineTo(spikeLength, 0);
      ctx.lineTo(0, spikeWidth / 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.restore();
    }
    
    ctx.restore();
  };

  // Draw lens flare
  const drawLensFlare = (
    ctx: CanvasRenderingContext2D,
    flare: LensFlare,
    centerX: number,
    centerY: number,
    mouseX: number,
    mouseY: number
  ) => {
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    for (const element of flare.elements) {
      const offsetX = Math.cos(angle) * element.offset * distance;
      const offsetY = Math.sin(angle) * element.offset * distance;
      const x = centerX + offsetX;
      const y = centerY + offsetY;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, element.size);
      gradient.addColorStop(0, element.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, element.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  // Draw realistic nebula with turbulence
  const drawNebula = (
    ctx: CanvasRenderingContext2D,
    nebula: NebulaLayer,
    time: number
  ) => {
    ctx.save();
    ctx.translate(nebula.position.x, nebula.position.y);
    ctx.rotate(nebula.rotation);
    ctx.scale(nebula.scale.x, nebula.scale.y);
    ctx.globalAlpha = nebula.opacity * (0.8 + Math.sin(time * 0.001) * 0.1);
    
    // Create turbulent gradient
    const gradient = ctx.createLinearGradient(-1, -1, 1, 1);
    nebula.colors.forEach((color, idx) => {
      gradient.addColorStop(idx / (nebula.colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    
    // Draw organic shape using multiple overlapping ellipses
    for (let i = 0; i < 5; i++) {
      const turbulence = nebula.turbulence * (0.5 + Math.sin(time * 0.002 + i) * 0.3);
      ctx.beginPath();
      ctx.ellipse(
        Math.sin(time * 0.0005 + i) * turbulence,
        Math.cos(time * 0.0007 + i) * turbulence,
        1, 0.7 + Math.sin(time * 0.001 + i) * 0.1,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const initGalaxy = () => {
      width = canvas.width;
      height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      starsRef.current = generateStarfield(width, height);
      nebulaeRef.current = generateNebulae(width, height);
      dustRef.current = generateDust(width, height);
      
      // Realistic Solar System planets
      const baseDistance = Math.min(width, height) * 0.045;
      planetsRef.current = [
        {
          name: 'Mercury',
          radius: 3.5,
          distance: baseDistance,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.012,
          color: 'rgb(180, 150, 120)',
          atmosphereColor: 'rgba(200, 170, 130, 0.1)',
          atmosphereHeight: 0,
          hasRings: false,
          ringColor: '',
          ringInnerColor: '',
          ringTilt: 0,
          textureNoise: 0.3,
          specularHighlight: true,
          shadowSoftness: 0.5,
          orbitalInclination: 0.07,
          axialTilt: 0.03,
          moons: [],
        },
        {
          name: 'Venus',
          radius: 5,
          distance: baseDistance * 1.45,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.008,
          color: 'rgb(230, 190, 130)',
          atmosphereColor: 'rgba(255, 200, 100, 0.25)',
          atmosphereHeight: 2.5,
          hasRings: false,
          ringColor: '',
          ringInnerColor: '',
          ringTilt: 0,
          textureNoise: 0.15,
          specularHighlight: true,
          shadowSoftness: 0.6,
          orbitalInclination: 0.03,
          axialTilt: 0.17,
          moons: [],
        },
        {
          name: 'Earth',
          radius: 5.5,
          distance: baseDistance * 1.95,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.0065,
          color: 'rgb(80, 140, 200)',
          atmosphereColor: 'rgba(100, 180, 255, 0.2)',
          atmosphereHeight: 2,
          hasRings: false,
          ringColor: '',
          ringInnerColor: '',
          ringTilt: 0,
          textureNoise: 0.25,
          specularHighlight: true,
          shadowSoftness: 0.55,
          orbitalInclination: 0,
          axialTilt: 0.41,
          moons: [
            { radius: 1.5, distance: 12, angle: 0, speed: 0.015, color: 'rgb(180, 180, 180)' }
          ],
        },
        {
          name: 'Mars',
          radius: 4,
          distance: baseDistance * 2.55,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.005,
          color: 'rgb(200, 100, 70)',
          atmosphereColor: 'rgba(200, 120, 80, 0.12)',
          atmosphereHeight: 1,
          hasRings: false,
          ringColor: '',
          ringInnerColor: '',
          ringTilt: 0,
          textureNoise: 0.35,
          specularHighlight: true,
          shadowSoftness: 0.5,
          orbitalInclination: 0.03,
          axialTilt: 0.44,
          moons: [
            { radius: 0.8, distance: 8, angle: 0, speed: 0.02, color: 'rgb(150, 140, 130)' },
            { radius: 0.7, distance: 12, angle: Math.PI, speed: 0.018, color: 'rgb(140, 130, 120)' },
          ],
        },
        {
          name: 'Jupiter',
          radius: 12,
          distance: baseDistance * 3.5,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.003,
          color: 'rgb(200, 170, 130)',
          atmosphereColor: 'rgba(200, 170, 130, 0.15)',
          atmosphereHeight: 4,
          hasRings: false,
          ringColor: '',
          ringInnerColor: '',
          ringTilt: 0,
          textureNoise: 0.4,
          specularHighlight: true,
          shadowSoftness: 0.7,
          orbitalInclination: 0.02,
          axialTilt: 0.05,
          moons: [
            { radius: 2.5, distance: 28, angle: 0, speed: 0.008, color: 'rgb(200, 180, 150)' },
            { radius: 2, distance: 35, angle: Math.PI / 2, speed: 0.006, color: 'rgb(180, 170, 140)' },
            { radius: 2.2, distance: 42, angle: Math.PI, speed: 0.005, color: 'rgb(190, 175, 145)' },
            { radius: 1.8, distance: 48, angle: 1.5, speed: 0.0045, color: 'rgb(170, 160, 130)' },
          ],
        },
        {
          name: 'Saturn',
          radius: 10.5,
          distance: baseDistance * 4.3,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.0022,
          color: 'rgb(220, 190, 140)',
          atmosphereColor: 'rgba(220, 190, 140, 0.12)',
          atmosphereHeight: 3.5,
          hasRings: true,
          ringColor: 'rgba(200, 170, 120, 0.6)',
          ringInnerColor: 'rgba(170, 140, 100, 0.5)',
          ringTilt: 0.4,
          textureNoise: 0.3,
          specularHighlight: true,
          shadowSoftness: 0.65,
          orbitalInclination: 0.04,
          axialTilt: 0.47,
          moons: [
            { radius: 2, distance: 24, angle: 0, speed: 0.009, color: 'rgb(190, 170, 140)' },
            { radius: 1.5, distance: 30, angle: Math.PI / 3, speed: 0.007, color: 'rgb(180, 160, 130)' },
            { radius: 1.8, distance: 36, angle: 2, speed: 0.006, color: 'rgb(185, 165, 135)' },
          ],
        },
        {
          name: 'Uranus',
          radius: 7.5,
          distance: baseDistance * 5.1,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.0015,
          color: 'rgb(160, 210, 210)',
          atmosphereColor: 'rgba(160, 210, 210, 0.15)',
          atmosphereHeight: 2.5,
          hasRings: true,
          ringColor: 'rgba(140, 190, 190, 0.4)',
          ringInnerColor: 'rgba(120, 170, 170, 0.3)',
          ringTilt: 0.8,
          textureNoise: 0.2,
          specularHighlight: true,
          shadowSoftness: 0.5,
          orbitalInclination: 0.05,
          axialTilt: 0.97,
          moons: [
            { radius: 1.2, distance: 18, angle: 0, speed: 0.01, color: 'rgb(170, 200, 200)' },
            { radius: 1, distance: 22, angle: Math.PI / 2, speed: 0.008, color: 'rgb(160, 190, 190)' },
          ],
        },
        {
          name: 'Neptune',
          radius: 7,
          distance: baseDistance * 5.9,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: 0.0012,
          color: 'rgb(80, 120, 200)',
          atmosphereColor: 'rgba(80, 120, 200, 0.12)',
          atmosphereHeight: 2,
          hasRings: false,
          ringColor: '',
          ringInnerColor: '',
          ringTilt: 0,
          textureNoise: 0.25,
          specularHighlight: true,
          shadowSoftness: 0.52,
          orbitalInclination: 0.03,
          axialTilt: 0.52,
          moons: [
            { radius: 1.3, distance: 20, angle: 0, speed: 0.009, color: 'rgb(150, 170, 210)' },
          ],
        },
      ];
      
      // Lens flare configuration
      lensFlareRef.current = {
        x: centerX,
        y: centerY,
        elements: [
          { size: 80, intensity: 0.3, color: 'rgba(255, 200, 100, 0.15)', offset: 0 },
          { size: 40, intensity: 0.5, color: 'rgba(255, 150, 50, 0.2)', offset: 0.3 },
          { size: 25, intensity: 0.7, color: 'rgba(255, 100, 50, 0.25)', offset: 0.6 },
          { size: 15, intensity: 0.9, color: 'rgba(255, 255, 200, 0.3)', offset: 0.9 },
          { size: 8, intensity: 1, color: 'rgba(255, 255, 255, 0.4)', offset: 1.2 },
        ],
      };
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGalaxy();
    };
    
    let lastFrameTime = 0;
    
    const renderFrame = (timestamp: number) => {
      if (!canvas || !ctx) return;
      
      const delta = Math.min(32, timestamp - lastFrameTime);
      lastFrameTime = timestamp;
      timeRef.current += delta;
      const time = timeRef.current;
      
      width = canvas.width;
      height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Deep space background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#020208');
      bgGradient.addColorStop(0.3, '#03030c');
      bgGradient.addColorStop(0.7, '#010106');
      bgGradient.addColorStop(1, '#000003');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw nebulae (behind everything)
      for (const nebula of nebulaeRef.current) {
        drawNebula(ctx, nebula, time);
      }
      
      // Draw dust particles (zodiacal light)
      ctx.globalCompositeOperation = 'lighter';
      for (const dust of dustRef.current) {
        const parallaxX = dust.x + mouseRef.current.x * 0.001 * dust.parallax;
        const parallaxY = dust.y + mouseRef.current.y * 0.001 * dust.parallax;
        
        ctx.fillStyle = `rgba(180, 160, 120, ${dust.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(parallaxX, parallaxY, dust.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw background stars
      for (const star of starsRef.current) {
        if (star.layer !== 'background') continue;
        
        const flicker = 0.7 + Math.sin(time * 0.001 * star.flickerSpeed + star.flickerPhase) * 0.3;
        const brightness = star.brightness * flicker;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = brightness * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw midground stars
      for (const star of starsRef.current) {
        if (star.layer !== 'midground') continue;
        
        const flicker = 0.8 + Math.sin(time * 0.002 * star.flickerSpeed + star.flickerPhase) * 0.2;
        const brightness = star.brightness * flicker;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = brightness * 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Small glow
        ctx.globalAlpha = brightness * 0.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw foreground stars with diffraction spikes
      for (const star of starsRef.current) {
        if (star.layer !== 'foreground') continue;
        
        const flicker = 0.85 + Math.sin(time * 0.0005 * star.flickerSpeed + star.flickerPhase) * 0.15;
        const brightness = star.brightness * flicker;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright core
        ctx.fillStyle = 'white';
        ctx.globalAlpha = brightness * 0.6;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Diffraction spikes for brighter stars
        if (star.size > 2) {
          drawDiffractionSpikes(ctx, star.x, star.y, star.size, brightness, time * 0.001);
        }
      }
      
      ctx.globalAlpha = 1;
      
      // Draw Milky Way band (subtle)
      const milkyWayGradient = ctx.createLinearGradient(0, height * 0.3, width, height * 0.7);
      milkyWayGradient.addColorStop(0, 'rgba(80, 70, 100, 0.05)');
      milkyWayGradient.addColorStop(0.5, 'rgba(120, 100, 130, 0.08)');
      milkyWayGradient.addColorStop(1, 'rgba(80, 70, 100, 0.05)');
      ctx.fillStyle = milkyWayGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw Sun (center)
      const sunRadius = Math.min(width, height) * 0.025;
      const sunPulse = Math.sin(time * 0.002) * 1.2;
      
      // Solar corona
      for (let i = 0; i < 5; i++) {
        const coronaSize = sunRadius * (1.5 + i * 0.4);
        const coronaGrad = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.8, centerX, centerY, coronaSize);
        coronaGrad.addColorStop(0, `rgba(255, 220, 100, ${0.12 - i * 0.02})`);
        coronaGrad.addColorStop(0.7, `rgba(255, 120, 50, ${0.06 - i * 0.01})`);
        coronaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coronaSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(centerX - sunRadius * 0.2, centerY - sunRadius * 0.2, 0, centerX, centerY, sunRadius + sunPulse);
      sunGrad.addColorStop(0, '#fff8e0');
      sunGrad.addColorStop(0.3, '#ffe88a');
      sunGrad.addColorStop(0.7, '#ffa840');
      sunGrad.addColorStop(1, '#ff6020');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius + sunPulse * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun spots
      ctx.fillStyle = 'rgba(80, 40, 10, 0.25)';
      ctx.beginPath();
      ctx.ellipse(centerX + sunRadius * 0.25, centerY - sunRadius * 0.15, sunRadius * 0.18, sunRadius * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX - sunRadius * 0.1, centerY + sunRadius * 0.2, sunRadius * 0.14, sunRadius * 0.1, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw orbit paths
      ctx.setLineDash([3, 6]);
      ctx.lineWidth = 0.5;
      for (const planet of planetsRef.current) {
        ctx.strokeStyle = `rgba(100, 120, 160, ${0.08 + Math.sin(planet.angle) * 0.02})`;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, planet.distance, planet.distance * (1 - planet.orbitalInclination), planet.orbitalInclination, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Draw planets
      for (const planet of planetsRef.current) {
        // Update orbital position
        planet.angle += planet.angularSpeed * (delta / 16);
        
        const orbitX = centerX + Math.cos(planet.angle) * planet.distance;
        const orbitY = centerY + Math.sin(planet.angle) * planet.distance * (1 - planet.orbitalInclination);
        
        // Draw planet
        drawPlanet(ctx, orbitX, orbitY, planet.radius, planet, centerX, centerY, time);
        
        // Draw rings if present
        if (planet.hasRings) {
          drawRings(ctx, orbitX, orbitY, planet.radius, planet.ringColor, planet.ringInnerColor, planet.ringTilt, time);
        }
        
        // Draw moons
        for (const moon of planet.moons) {
          moon.angle += moon.speed * (delta / 16);
          const moonX = orbitX + Math.cos(moon.angle) * moon.distance;
          const moonY = orbitY + Math.sin(moon.angle) * moon.distance;
          
          ctx.fillStyle = moon.color;
          ctx.shadowBlur = 2;
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          ctx.arc(moonX, moonY, moon.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Moon highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(moonX - moon.radius * 0.25, moonY - moon.radius * 0.25, moon.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.shadowBlur = 0;
      
      // Draw lens flare (based on mouse position relative to Sun)
      if (lensFlareRef.current) {
        drawLensFlare(ctx, lensFlareRef.current, centerX, centerY, mouseRef.current.x, mouseRef.current.y);
      }
      
      // Draw shooting stars (occasional)
      if (Math.random() < 0.002 && timeRef.current > 1000) {
        const startX = Math.random() * width;
        const startY = Math.random() * height * 0.3;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        const length = 80 + Math.random() * 120;
        const speed = 10 + Math.random() * 15;
        let progress = 0;
        
        const animateShootingStar = () => {
          progress += speed;
          if (progress >= length) return;
          
          const x = startX + Math.cos(angle) * progress;
          const y = startY + Math.sin(angle) * progress;
          const opacity = 1 - progress / length;
          
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          
          // Tail gradient
          for (let i = 0; i < 10; i++) {
            const t = i / 10;
            const tailX = x - Math.cos(angle) * (progress * t);
            const tailY = y - Math.sin(angle) * (progress * t);
            const tailOpacity = opacity * (1 - t);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = `rgba(255, 220, 180, ${tailOpacity * 0.8})`;
            ctx.lineWidth = 3 * (1 - t);
            ctx.stroke();
          }
          
          // Head
          ctx.fillStyle = `rgba(255, 240, 200, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
          
          requestAnimationFrame(animateShootingStar);
        };
        
        requestAnimationFrame(animateShootingStar);
      }
      
      animationRef.current = requestAnimationFrame(renderFrame);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    renderFrame(0);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        background: '#000003',
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default GalaxyBackground;
