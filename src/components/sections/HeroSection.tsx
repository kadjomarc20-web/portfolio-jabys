"use client";
import Image from "next/image";
import { profile } from "@/lib/profile";
import {useScrollReveal} from "@/hooks/useScrollReveal";

export function HeroSection() {
   useScrollReveal();

  return (
    <section
      id="accueil"
      className="reveal-init relative min-h-[90vh] overflow-hidden border-b border-[#D6D1C7] px-6 py-24 md:px-16 md:py-32 dark:border-[#3A352F]"
    >
      {/*
        Grille technique très discrète.
        Elle s’adapte automatiquement au mode dark via globals.css.
      */}
      <div
        aria-hidden="true"
        className="hero-subtle-grid pointer-events-none absolute inset-0"
      />

      <div className="reveal-init relative z-10 grid gap-12 md:grid-cols-12 md:items-start">
        {/* Bloc 1 + Bloc 2 : identité + accroche */}
        <div className="md:col-span-7 md:row-start-1">
          <p className="reveal-item delay-300 font-mono text-xs uppercase tracking-[0.25em] text-[#6E6A62] dark:text-[#A8A196]">
            {profile.name}
          </p>

          <p className="reveal-item delay-400 mt-2 font-mono text-xs uppercase tracking-[0.25em] text-[#6E6A62] dark:text-[#A8A196]">
            {profile.role} — {profile.period}
          </p>

          <h1 className="reveal-item delay-500 mt-10 font-display text-5xl font-light leading-[0.95] text-[#1F1D1A] md:mt-14 md:text-7xl lg:text-8xl dark:text-[#F3F1EC]">
            {profile.headline}
          </h1>
        </div>

        {/* Colonne visuelle : portrait ou image de travail */}
        <div className=" md:col-span-4 md:col-start-9 md:row-span-2 md:self-center">
          <figure>
            <div className="reveal-item delay-800 aspect-[4/5] w-full border border-[#D6D1C7] bg-[#E7E2D8] dark:border-[#3A352F] dark:bg-[#221F1C]">
              {
                

                <Image
                  src={profile.portraitPath}
                  alt={profile.portraitAlt}
                  width={500}
                  height={500}
                  priority
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="h-full w-full object-cover dark:brightness-90"
                />
              }

            </div>

            <figcaption className="reveal-item delay-900 mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6A62] md:text-xs dark:text-[#A8A196]">
              {profile.portraitCaption}
            </figcaption>
          </figure>
        </div>

        {/* Bloc 3 + Bloc 4 : introduction, actions, métadonnées */}
        <div className="md:col-span-7 md:row-start-2">
          <p className="reveal-item delay-1000 max-w-2xl text-base leading-relaxed text-[#6E6A62] md:text-lg dark:text-[#A8A196]">
            {profile.introduction}
          </p>

          <div className="reveal-item delay-1100 mt-10 flex flex-wrap items-center gap-6 md:mt-12">
            <a
              href="#index"
              className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#1F1D1A] dark:text-[#F3F1EC]"
            >
              <span className="reveal-item delay-1200 border-b border-[#1F1D1A] pb-1 transition-colors group-hover:border-[#8C6D46] group-hover:text-[#8C6D46] dark:border-[#F3F1EC] dark:group-hover:border-[#B0895A] dark:group-hover:text-[#B0895A]">
                Voir les projets
              </span>

              <span
                aria-hidden="true"
                className="reveal-item delay-1300 transition-transform group-hover:translate-y-1"
              >
                ↓
              </span>
            </a>

            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal-item delay-1400 inline-flex items-center gap-3 border border-[#D6D1C7] px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-[#6E6A62] transition-colors hover:border-[#1F1D1A] hover:text-[#1F1D1A] dark:border-[#3A352F] dark:text-[#A8A196] dark:hover:border-[#F3F1EC] dark:hover:text-[#F3F1EC]"
            >
              Télécharger le CV
            </a>
          </div>

          <div className="mt-14 grid gap-6 border-t border-[#D6D1C7] pt-8 font-mono text-xs uppercase tracking-[0.25em] text-[#6E6A62] sm:grid-cols-3 md:mt-16 dark:border-[#3A352F] dark:text-[#A8A196]">
            {profile.meta.map((item,index) => (
              <span key={item} className="reveal-item"
                style={{ transitionDelay: `${index * 400}ms` }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}