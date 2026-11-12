"use client";
import { useEffect } from 'react';

interface UseScrollRevealOptions {
  selector?: string;
  threshold?: number;
  rootMargin?: string;
}

export function useScrollReveal({
  selector = '.reveal-init',
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
}: UseScrollRevealOptions = {}): void {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[], obs: IntersectionObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const targets = document.querySelectorAll<HTMLElement>(selector);
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [selector, threshold, rootMargin]);
}