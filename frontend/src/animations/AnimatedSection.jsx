import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const AnimatedSection = ({ 
  children, 
  className = '', 
  style = {}, 
  animation = 'fade-up', 
  delay = 0,
  stagger = 0,
  duration = 1,
  ease = 'power3.out',
  id = ''
}) => {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Respect user's reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    
    // Initial states (fromVars)
    const animations = {
      'fade-up': { y: 60, opacity: 0 },
      'fade-in': { opacity: 0 },
      'scale-up': { scale: 0.9, opacity: 0 },
      'slide-right': { x: -60, opacity: 0 },
      'slide-left': { x: 60, opacity: 0 }
    };

    const animConfig = animations[animation] || animations['fade-up'];

    const tween = gsap.fromTo(el.children, 
      animConfig, 
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        ease: animation === 'scale-up' ? 'back.out(1.7)' : ease,
        stagger,
        delay
      }
    );

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      animation: tween,
      toggleActions: 'play none none none'
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className} style={{ ...style, willChange: 'transform, opacity' }} id={id}>
      {children}
    </div>
  );
};

export default AnimatedSection;
