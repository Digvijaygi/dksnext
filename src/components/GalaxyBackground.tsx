import React, { useEffect, useRef, useState } from 'react';

// ============================================
// STAR BACKGROUND COMPONENT (Simplified)
// ============================================
const StarBackground: React.FC<{ opacity: number }> = ({ opacity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: any[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Generate stars
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);
      
      // Draw background
      ctx.fillStyle = '#010105';
      ctx.fillRect(0, 0, width, height);

      // Draw stars with opacity
      ctx.globalAlpha = opacity;
      stars.forEach(star => {
        const twinkle = 0.6 + Math.sin(time * star.twinkleSpeed + star.phase) * 0.4;
        const finalOpacity = star.opacity * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = finalOpacity * opacity;
        ctx.fill();
        
        // Glow for bigger stars
        if (star.radius > 0.6) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.globalAlpha = finalOpacity * 0.3 * opacity;
          ctx.fill();
        }
      });
      
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};

// ============================================
// FLUID BACKGROUND COMPONENT
// ============================================
const FluidBackground: React.FC<{ opacity: number }> = ({ opacity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create cursor glow
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 999;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
      opacity: 0;
    `;
    document.body.appendChild(cursorGlow);

    // WebGL initialization (simplified version)
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Basic fluid simulation setup
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.98,
      VELOCITY_DISSIPATION: 0.9,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.25,
      SPLAT_FORCE: 6000,
      PAUSED: false,
    };

    // Resize canvas
    function resizeCanvas() {
      const width = window.innerWidth * (window.devicePixelRatio || 1);
      const height = window.innerHeight * (window.devicePixelRatio || 1);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    resizeCanvas();

    // Simple vertex and fragment shaders for fluid
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uMouse;
      uniform float uTime;
      
      void main() {
        vec2 uv = vUv;
        vec2 mouse = uMouse;
        float dist = distance(uv, mouse);
        
        // Fluid-like colors
        vec3 color1 = vec3(0.1, 0.2, 0.8);
        vec3 color2 = vec3(0.8, 0.1, 0.3);
        vec3 color3 = vec3(0.1, 0.8, 0.4);
        
        float wave1 = sin(uv.x * 20.0 + uTime) * 0.5 + 0.5;
        float wave2 = cos(uv.y * 20.0 + uTime * 0.7) * 0.5 + 0.5;
        float wave3 = sin((uv.x + uv.y) * 15.0 + uTime * 0.5) * 0.5 + 0.5;
        
        vec3 color = mix(color1, color2, wave1);
        color = mix(color, color3, wave2);
        
        // Mouse interaction
        float influence = exp(-dist * 8.0);
        color += influence * 0.3 * vec3(1.0, 0.8, 0.6);
        
        // Vignette
        float vignette = 1.0 - distance(uv, vec2(0.5)) * 0.5;
        color *= vignette;
        
        gl_FragColor = vec4(color, 0.8);
      }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Setup geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const mouseLocation = gl.getUniformLocation(program, 'uMouse');
    const timeLocation = gl.getUniformLocation(program, 'uTime');

    let mouseX = 0.5;
    let mouseY = 0.5;
    let time = 0;
    let animationId: number;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = 1 - (e.clientY - rect.top) / rect.height;
      
      if (cursorGlow) {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      if (cursorGlow) {
        cursorGlow.style.opacity = '0';
      }
    };

    // Animation loop
    const animate = () => {
      time += 0.01;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.01, 0.01, 0.05, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.uniform2f(mouseLocation, mouseX, mouseY);
      gl.uniform1f(timeLocation, time);
      
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      
      animationId = requestAnimationFrame(animate);
    };

    // Event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (touch.clientX - rect.left) / rect.width;
        mouseY = 1 - (touch.clientY - rect.top) / rect.height;
      }
    });

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (cursorGlow.parentNode) {
        cursorGlow.parentNode.removeChild(cursorGlow);
      }
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: opacity,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
};

// ============================================
// MAIN COMBINED COMPONENT
// ============================================
export const CombinedBackground: React.FC = () => {
  const [isMoving, setIsMoving] = useState(false);
  const [fluidOpacity, setFluidOpacity] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMoving(true);
      setFluidOpacity(1);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout to fade out fluid after 2 seconds of inactivity
      timeoutRef.current = setTimeout(() => {
        setIsMoving(false);
        setFluidOpacity(0);
      }, 2000);
    };

    const handleMouseLeave = () => {
      setIsMoving(false);
      setFluidOpacity(0);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    // For touch devices
    const handleTouchMove = () => {
      setIsMoving(true);
      setFluidOpacity(1);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsMoving(false);
        setFluidOpacity(0);
      }, 2000);
    };

    // Add event listeners to window
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Stars background - always visible */}
      <StarBackground opacity={1} />
      
      {/* Fluid overlay - fades in/out */}
      <FluidBackground opacity={fluidOpacity} />
      
      {/* Info text */}
      <div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs text-center pointer-events-none z-10"
        style={{
          textShadow: '0 0 20px rgba(0,0,0,0.9)',
          background: 'rgba(0,0,0,0.2)',
          padding: '6px 18px',
          borderRadius: '20px',
          backdropFilter: 'blur(5px)',
        }}
      >
        ✨ Move your mouse to create fluid art • Stars fade when you move
      </div>
    </>
  );
};

export default CombinedBackground;
