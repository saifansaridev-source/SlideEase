'use client';

import { useInView } from '@/hooks/useInView';

/**
 * AnimateIn — Wraps children in a scroll-triggered reveal animation.
 *
 * Props:
 *   variant: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-up' (default: 'fade-up')
 *   delay:   CSS transition delay in ms (default: 0)
 *   duration: CSS transition duration in ms (default: 600)
 *   className: extra class names for the wrapper
 *   as:      HTML tag for the wrapper element (default: 'div')
 *   threshold: IntersectionObserver threshold (default: 0.1)
 *   style:   extra inline styles
 */
export default function AnimateIn({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  as: Tag = 'div',
  threshold = 0.1,
  style = {},
  ...rest
}) {
  const [ref, inView] = useInView({ threshold });

  const baseStyles = {
    transition: `opacity ${duration}ms cubic-bezier(0.25,0.8,0.25,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.25,0.8,0.25,1) ${delay}ms`,
    willChange: 'opacity, transform',
    ...style,
  };

  const variantStyles = {
    'fade-up': {
      initial: { opacity: 0, transform: 'translateY(28px)' },
      visible: { opacity: 1, transform: 'translateY(0)' },
    },
    'fade-in': {
      initial: { opacity: 0, transform: 'none' },
      visible: { opacity: 1, transform: 'none' },
    },
    'fade-left': {
      initial: { opacity: 0, transform: 'translateX(-24px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    'fade-right': {
      initial: { opacity: 0, transform: 'translateX(24px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    'scale-up': {
      initial: { opacity: 0, transform: 'scale(0.94)' },
      visible: { opacity: 1, transform: 'scale(1)' },
    },
  };

  const v = variantStyles[variant] || variantStyles['fade-up'];
  const currentStyle = {
    ...baseStyles,
    ...(inView ? v.visible : v.initial),
  };

  return (
    <Tag ref={ref} className={className} style={currentStyle} {...rest}>
      {children}
    </Tag>
  );
}

