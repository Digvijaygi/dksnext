import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
  id: number;
  x: number;
  y: number;
}

export const CursorTrail = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let id = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const newPoint: TrailPoint = {
        id: id++,
        x: e.clientX,
        y: e.clientY,
      };
      
      setTrail(prev => [...prev.slice(-15), newPoint]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.slice(1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Main cursor glow */}
      <motion.div
        className="fixed w-6 h-6 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(175 100% 50% / 0.8) 0%, transparent 70%)',
          boxShadow: '0 0 20px hsl(175 100% 50% / 0.5), 0 0 40px hsl(175 100% 50% / 0.3)',
        }}
        animate={{
          x: mousePos.x - 12,
          y: mousePos.y - 12,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      
      {/* Trail particles */}
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="fixed rounded-full pointer-events-none"
            style={{
              left: point.x,
              top: point.y,
              width: 4 + index * 0.3,
              height: 4 + index * 0.3,
              background: `radial-gradient(circle, hsl(175 100% 60% / ${0.3 + index * 0.03}) 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
