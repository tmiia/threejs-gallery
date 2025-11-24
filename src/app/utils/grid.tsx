'use client';

import { useEffect, useState } from 'react';
import { motion } from "motion/react";

const DURATION = 0.8;
const STAGGERDELAY = 0.02;
const EASE = 'circOut';

export const Grid = () => {
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [isHelperVisible, setIsHelperVisible] = useState(true);
  const [columns, setColumns] = useState(4);

  const cols = {
    hidden: { scaleY: 0, originY: 1 },
    show: { scaleY: 1, originY: 0 },
  };

  const helper = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  useEffect(() => {
    const updateColumns = () => {
      const cols = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-columns')
        .trim();
      setColumns(Number(cols) || 4);
    };

    updateColumns();

    window.addEventListener('resize', updateColumns);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setIsGridVisible((prevState) => !prevState);
        setIsHelperVisible(true);
      }
      else if (e.key.toLowerCase() === 'h') {
        setIsHelperVisible((prevState) => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', updateColumns);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <motion.div
        className="container-grid h-full" 
      >
        {Array.from({ length: columns }, (_, i) => (
          <motion.div
            key={i}
            className={`col-span-1 bg-red-500/20 border border-red-500/50 border-t-0 border-b-0 h-full`}
            variants={cols}
            initial="hidden"
            animate={ isGridVisible ? "show" : "hidden" }
            transition={{ delay: i * STAGGERDELAY, duration: DURATION, ease: EASE }}
          />
        ))}
      </motion.div>

      {isHelperVisible && (
        <motion.div
          className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm pointer-events-auto"
          variants={helper}
          initial='hidden'
          animate={isGridVisible ? 'show' : 'hidden'}
          >
          <div className="flex items-center gap-2">
            <span className="text-red-500">●</span>
            <span>{columns} colonnes</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Appuyez sur G pour masquer</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
