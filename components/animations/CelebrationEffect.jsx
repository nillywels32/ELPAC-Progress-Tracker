import React from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Sparkles } from 'lucide-react';

/**
 * Celebration Effect
 * Shows confetti and success message when student qualifies
 */
export const CelebrationEffect = ({ show, onComplete }) => {
  const [showConfetti, setShowConfetti] = React.useState(show);
  const [dimensions, setDimensions] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  React.useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        if (onComplete) onComplete();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence>
      {showConfetti && (
        <>
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-green-400 max-w-md mx-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2
                }}
                className="flex justify-center mb-4"
              >
                <Trophy className="text-yellow-500" size={64} />
              </motion.div>
              <h2 className="text-3xl font-bold text-green-600 text-center mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-lg text-gray-700 text-center">
                You're ready for reclassification!
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Star className="text-yellow-500" size={24} />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Award className="text-green-500" size={24} />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="text-purple-500" size={24} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Success Badge Animation
 * Shows animated checkmark when requirement is met
 */
export const SuccessBadge = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
            <span className="font-semibold">Requirement Met!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Sparkle Effect
 * Adds sparkle animation around elements
 */
export const SparkleEffect = ({ children }) => {
  return (
    <div className="relative inline-block">
      {children}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1
        }}
      >
        <Sparkles className="text-yellow-500" size={16} />
      </motion.div>
    </div>
  );
};

export default CelebrationEffect;
