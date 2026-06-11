import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ReactNode, useRef, useEffect, useState } from 'react';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'rotate' | 'blur' | 'glitch';
  intensity?: 'subtle' | 'normal' | 'extreme';
  perspective?: boolean;
  magnetic?: boolean;
  parallax?: boolean;
  glowColor?: string;
}

const directionVariants = {
  up: { y: 60, x: 0, scale: 0.8, rotateX: 15 },
  down: { y: -60, x: 0, scale: 0.8, rotateX: -15 },
  left: { x: 60, y: 0, scale: 0.8, rotateY: 15 },
  right: { x: -60, y: 0, scale: 0.8, rotateY: -15 },
  zoom: { scale: 0.3, opacity: 0, y: 0, x: 0 },
  rotate: { rotate: -180, scale: 0.5, opacity: 0 },
  blur: { filter: 'blur(20px)', scale: 0.8, opacity: 0 },
  glitch: { x: -20, y: -10, skewX: 15, opacity: 0 },
};

const intensityValues = {
  subtle: {
    duration: 0.8,
    spring: { stiffness: 100, damping: 20 },
    scale: 0.95,
  },
  normal: {
    duration: 0.7,
    spring: { stiffness: 200, damping: 25 },
    scale: 0.9,
  },
  extreme: {
    duration: 0.6,
    spring: { stiffness: 300, damping: 30 },
    scale: 0.7,
  },
};

export const ScrollAnimationWrapper = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  intensity = 'normal',
  perspective = false,
  magnetic = false,
  parallax = false,
  glowColor = '#00ffff',
}: ScrollAnimationWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Advanced scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Dynamic scroll effects
  const scrollScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const scrollRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 10]);
  const scrollBlur = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, 5]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.5]);
  
  // Smooth spring animations
  const smoothScale = useSpring(scrollScale, { stiffness: 100, damping: 30 });
  const smoothRotate = useSpring(scrollRotate, { stiffness: 100, damping: 30 });
  const smoothBlur = useSpring(scrollBlur, { stiffness: 100, damping: 30 });

  // Magnetic effect on mouse move
  useEffect(() => {
    if (!magnetic || !ref.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      
      setMousePosition({ x: x * 20, y: y * 15 });
    };

    const element = ref.current;
    element?.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      element?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [magnetic]);

  // Glitch effect generation
  const getGlitchVariants = () => {
    if (direction !== 'glitch') return {};
    
    return {
      initial: { x: -20, y: -10, skewX: 15, opacity: 0, filter: 'blur(5px)' },
      whileInView: {
        x: 0,
        y: 0,
        skewX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.5,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
      hover: {
        x: [0, -2, 2, -1, 1, 0],
        skewX: [0, -2, 2, -1, 1, 0],
        transition: {
          duration: 0.2,
          repeat: Infinity,
          repeatType: 'mirror' as const,
        },
      },
    };
  };

  const initial = directionVariants[direction];
  const intensityConfig = intensityValues[intensity];

  // Perspective transform for 3D effects
  const perspectiveStyle = perspective
    ? {
        perspective: '1000px',
        transformStyle: 'preserve-3d' as const,
      }
    : {};

  // Parallax mouse tracking
  const mouseParallax = parallax && mousePosition
    ? {
        transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
      }
    : {};

  // Glow effect based on scroll
  const glowIntensity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const boxShadow = useTransform(
    glowIntensity,
    [0, 1],
    [`0 0 0px ${glowColor}`, `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`]
  );

  // Main animation variants for different directions
  const getVariants = () => {
    if (direction === 'zoom') {
      return {
        initial: { scale: 0, opacity: 0, rotate: 0 },
        whileInView: {
          scale: 1,
          opacity: 1,
          rotate: 0,
          transition: {
            duration: intensityConfig.duration,
            delay,
            type: 'spring',
            stiffness: intensityConfig.spring.stiffness,
            damping: intensityConfig.spring.damping,
          },
        },
      };
    }
    
    if (direction === 'rotate') {
      return {
        initial: { rotate: -360, scale: 0, opacity: 0 },
        whileInView: {
          rotate: 0,
          scale: 1,
          opacity: 1,
          transition: {
            duration: 0.8,
            delay,
            type: 'spring',
            stiffness: 120,
            damping: 15,
          },
        },
      };
    }
    
    if (direction === 'blur') {
      return {
        initial: { filter: 'blur(30px)', opacity: 0, scale: 0.7 },
        whileInView: {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.9,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      };
    }
    
    if (direction === 'glitch') {
      return getGlitchVariants();
    }
    
    return {
      initial: { opacity: 0, ...initial },
      whileInView: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        transition: {
          duration: intensityConfig.duration,
          delay,
          type: 'spring',
          stiffness: intensityConfig.spring.stiffness,
          damping: intensityConfig.spring.damping,
        },
      },
    };
  };

  const variants = getVariants();

  // Hover animations for extra flair
  const hoverAnimation = {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      whileInView="whileInView"
      whileHover={direction !== 'glitch' ? hoverAnimation : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      viewport={{ once: true, margin: '-50px', amount: 0.3 }}
      variants={variants}
      style={{
        ...perspectiveStyle,
        ...mouseParallax,
        ...(perspective && {
          transformStyle: 'preserve-3d',
        }),
        ...(direction === 'blur' && {
          filter: isHovered ? 'blur(2px)' : 'blur(0px)',
          transition: 'filter 0.3s ease',
        }),
        ...(glowColor && {
          boxShadow: direction === 'glitch' ? undefined : boxShadow,
        }),
      }}
    >
      {/* Animated gradient border for extreme intensity */}
      {intensity === 'extreme' && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${glowColor}, ${glowColor === '#00ffff' ? '#ff00ff' : glowColor}, ${glowColor})`,
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s linear infinite',
            opacity: 0.3,
            filter: 'blur(10px)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          transition={{ delay: delay + 0.2 }}
        />
      )}
      
      {/* Glitch overlay effect */}
      {direction === 'glitch' && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(90deg, transparent, ${glowColor}20, transparent)`,
              mixBlendMode: 'screen',
            }}
            animate={{
              x: ['-100%', '100%'],
              transition: {
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              },
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}`,
            }}
            animate={{
              opacity: [0, 1, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              },
            }}
          />
        </>
      )}
      
      {/* 3D shadow effect for perspective mode */}
      {perspective && (
        <motion.div
          className="absolute -inset-4 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor}10, transparent)`,
            transform: 'translateZ(-50px)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        />
      )}
      
      {/* Scroll progress indicator line */}
      {parallax && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent"
          style={{
            width: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.5, 0.5, 0]),
          }}
        />
      )}
      
      {children}
    </motion.div>
  );
};

// Additional futuristic animation components

interface ParticleBackgroundProps {
  children: ReactNode;
  className?: string;
  particleCount?: number;
}

export const ParticleBackground = ({
  children,
  className = '',
  particleCount = 20,
}: ParticleBackgroundProps) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      {children}
    </div>
  );
};

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'word' | 'letter' | 'glitch';
}

export const RevealText = ({
  text,
  className = '',
  delay = 0,
  type = 'word',
}: RevealTextProps) => {
  const words = text.split(' ');
  const letters = text.split('');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  const glitchChild = {
    visible: {
      opacity: 1,
      x: 0,
      skewX: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      x: -20,
      skewX: 15,
    },
  };

  if (type === 'glitch') {
    return (
      <motion.div
        className={className}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={glitchChild}
            className="inline-block"
            style={{
              textShadow: `2px 2px 0px #ff00ff, -2px -2px 0px #00ffff`,
            }}
            whileHover={{
              x: [0, -2, 2, -1, 1, 0],
              transition: { duration: 0.2 },
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  const items = type === 'word' ? words : letters;

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ whiteSpace: type === 'word' ? 'pre' : 'normal' }}
        >
          {item}
          {type === 'word' && index !== items.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default ScrollAnimationWrapper;
