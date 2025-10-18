import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Progress Bar
 * Smooth animation from 0 to target percentage
 */
export const AnimatedProgressBar = ({ progress, meets, className = '' }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{
          duration: 1,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.2
        }}
        className={`h-3 rounded-full ${
          meets
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-blue-500 to-purple-500'
        }`}
      />
    </div>
  );
};

/**
 * Animated Number Counter
 * Counts up from 0 to target value
 */
export const AnimatedCounter = ({ value, duration = 1.5, suffix = '', className = '' }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const targetValue = parseFloat(value) || 0;
    const increment = targetValue / (duration * 60); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={className}>
      {Math.round(count)}{suffix}
    </span>
  );
};

/**
 * Animated SVG Circle Progress
 * Circular progress indicator with stroke animation
 */
export const AnimatedCircleProgress = ({ progress, size = 200, strokeWidth = 12, canReclassify = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);
  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={canReclassify ? '#10b981' : '#3b82f6'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl font-bold ${canReclassify ? 'text-green-600' : 'text-blue-600'}`}>
            <AnimatedCounter value={normalizedProgress} suffix="%" />
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Pulse Animation Wrapper
 * Creates pulsing effect for elements
 */
export const PulseWrapper = ({ children, color = 'green' }) => {
  const shadowColor = {
    green: 'rgba(16, 185, 129, 0.4)',
    blue: 'rgba(59, 130, 246, 0.4)',
    purple: 'rgba(168, 85, 247, 0.4)'
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 ${shadowColor[color]}`,
          `0 0 0 10px rgba(16, 185, 129, 0)`,
          `0 0 0 0 rgba(16, 185, 129, 0)`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Bounce Animation
 * Makes element bounce on entry
 */
export const BounceIn = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide Down Animation
 * Slides element down from top
 */
export const SlideDown = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scale on Input Change
 * Subtle scale effect when value changes
 */
export const ScaleOnChange = ({ children, trigger }) => {
  return (
    <motion.div
      key={trigger}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
