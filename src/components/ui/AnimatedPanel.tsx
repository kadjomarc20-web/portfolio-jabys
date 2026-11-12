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

  // Courbe de Bézier : les valeurs x (1re et 3e) doivent rester entre 0 et 1
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
            duration: shouldReduceMotion ? 0 : 0.6,
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