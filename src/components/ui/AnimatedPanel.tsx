"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedPanelProps = {
  id: string;
  isOpen: boolean;
  ariaLabel: string;
  children: ReactNode;
};

export function AnimatedPanel({
  id,
  isOpen,
  ariaLabel,
  children,
}: AnimatedPanelProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const ease: [number, number, number, number] = [1, 2, 1.5, 2];

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={id}
          role="region"
          aria-label={ariaLabel}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1,
            ease,
          }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}