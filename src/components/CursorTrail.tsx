import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export const CursorTrail = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="fixed w-6 h-6 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(175 100% 50% / 0.6) 0%, transparent 70%)',
          boxShadow: '0 0 15px hsl(175 100% 50% / 0.4)',
        }}
        animate={{
          x: mousePos.x - 12,
          y: mousePos.y - 12,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
};
