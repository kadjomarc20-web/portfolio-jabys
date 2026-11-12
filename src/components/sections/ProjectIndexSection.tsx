"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/projects";
import { ProjectPreviewPanel } from "@/components/project/ProjectPreviewPanel";
import { AnimatedPanel } from "@/components/ui/AnimatedPanel";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ProjectIndexSectionProps = {
  projects: Project[];
};

export function ProjectIndexSection({ projects }: ProjectIndexSectionProps) {
  useScrollReveal();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleProject = (id: string) => {
    setOpenId((currentId) => (currentId === id ? null : id));
  };

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Scroll automatique vers l’aperçu ouvert
  useEffect(() => {
    if (!openId) return;

    const panelId = `preview-${openId}`;

    const timer = window.setTimeout(() => {
      const panel = document.getElementById(panelId);

      if (!panel) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      panel.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [openId]);

  return (
    <section
      id="index"
      className="reveal-init border-b border-[#D6D1C7] px-4 py-16 sm:px-6 md:px-16 md:py-28 dark:border-[#3A352F]"
    >
      <div className="reveal-init mb-8 flex items-end justify-between border-b border-[#D6D1C7] pb-5 md:mb-12 md:pb-6 dark:border-[#3A352F]">
        <h2 className="reveal-item delay-200 font-display text-3xl font-light sm:text-4xl md:text-6xl">
          Index
        </h2>

        <p className="reveal-item delay-300 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6A62] sm:text-xs dark:text-[#A8A196]">
          {projects.length} projets
        </p>
      </div>

      <ul className="divide-y divide-[#D6D1C7] border-y border-[#D6D1C7] dark:divide-[#3A352F] dark:border-[#3A352F]">
        {projects.map((project,index) => {
          const isOpen = openId === project.id;
          const panelId = `preview-${project.id}`;

          return (
            <li key={project.id} className="relative reveal-item"
              style={{ transitionDelay: `${index * 400}ms` }}>
              <h3 className="sr-only">{project.title}</h3>

              <button
                type="button"
                onClick={() => toggleProject(project.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={[
                  "group grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-0 py-5 text-left transition-colors sm:gap-4 md:grid-cols-12 md:items-baseline md:gap-4 md:px-4 md:py-6",
                  isOpen
                    ? "bg-[#E7E2D8] dark:bg-[#221F1C]"
                    : "hover:bg-[#E7E2D8] active:bg-[#E7E2D8] dark:hover:bg-[#221F1C] dark:active:bg-[#221F1C]",
                ].join(" ")}
              >
                {/* Numéro */}
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#6E6A62] md:col-span-1 dark:text-[#A8A196]">
                  {project.number}
                </span>

                {/* Titre + métadonnées mobiles */}
                <span className="md:col-span-5">
                  <span className="block font-display text-xl font-light leading-tight text-[#1F1D1A] sm:text-2xl md:text-3xl dark:text-[#F3F1EC]">
                    {project.title}
                  </span>

                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E6A62] md:hidden dark:text-[#A8A196]">
                    {project.year} — {project.location} · {project.typology}
                  </span>
                </span>

                {/* Année / lieu desktop */}
                <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-[#6E6A62] md:col-span-3 md:block dark:text-[#A8A196]">
                  {project.year} — {project.location}
                </span>

                {/* Typologie desktop */}
                <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-[#6E6A62] md:col-span-2 md:block md:text-right dark:text-[#A8A196]">
                  {project.typology}
                </span>

                {/* Bouton texte Aperçu / Fermer */}
                <span className="self-center font-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6A62] transition-colors group-hover:text-[#1F1D1A] group-active:text-[#1F1D1A] md:col-span-1 md:self-auto md:text-right dark:text-[#A8A196] dark:group-hover:text-[#F3F1EC] dark:group-active:text-[#F3F1EC]">
                  {isOpen ? "Fermer" : "Aperçu"}
                </span>
              </button>

              <AnimatedPanel
                id={panelId}
                isOpen={isOpen}
                ariaLabel={`Aperçu du projet ${project.title}`}
              >
                <ProjectPreviewPanel project={project} />
              </AnimatedPanel>
            </li>
          );
        })}
      </ul>
    </section>
  );
}