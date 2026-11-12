import type { Metadata } from "next";
import "@/components/archi/archi.css";
import BuildingDraw from "@/components/archi/BuildingDraw";
import CadCursor from "@/components/archi/CadCursor";
import Crane from "@/components/archi/Crane";
import DimensionCard from "@/components/archi/DimensionCard";
import FloorsLoader from "@/components/archi/FloorsLoader";
import HouseScroll from "@/components/archi/HouseScroll";
import ScrollLevel from "@/components/archi/ScrollLevel";

export const metadata: Metadata = {
  title: "Animations — génie civil & architecture",
  description: "Démonstration des animations disponibles pour le portfolio.",
};

function Idea({
  n,
  title,
  usage,
  children,
}: {
  n: string;
  title: string;
  usage: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-2">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0b3d91]">
          Idée {n}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 leading-relaxed text-zinc-600">{usage}</p>
      </div>
      <div className="flex min-h-64 items-center justify-center">{children}</div>
    </section>
  );
}

export default function AnimationsPage() {
  return (
    <main className="bg-[#efeae0] text-zinc-900">
      <ScrollLevel />

      {/* Hero : plan bleu + façade qui se dessine */}
      <header className="blueprint flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-70">
          Portfolio · Génie civil
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Du plan à l&apos;ouvrage
        </h1>
        <BuildingDraw className="w-full max-w-xl" />
        <p className="font-mono text-xs opacity-70">↓ Faites défiler</p>
      </header>

      {/* Maison 3D pilotée par le scroll */}
      <HouseScroll />

      <Idea
        n="03"
        title="La grue de chantier"
        usage="Pour une section « Projets en cours », une page 404 ou un coin du hero. 100 % CSS, très léger."
      >
        <Crane className="w-full max-w-sm text-zinc-800" />
      </Idea>

      <Idea
        n="04"
        title="Les lignes de cote"
        usage="Au survol d'une carte projet, les cotes se déploient comme sur un plan. Survolez la carte."
      >
        <DimensionCard width="12.00 m" height="8.00 m" className="w-64 text-[#0b3d91]">
          <div className="border border-zinc-900/15 bg-white p-6 text-zinc-900 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Projet 01
            </p>
            <p className="mt-1 text-lg font-semibold">Villa de plain-pied</p>
            <p className="mt-1 text-sm text-zinc-600">96 m² · Béton armé</p>
          </div>
        </DimensionCard>
      </Idea>

      <Idea
        n="05"
        title="L'immeuble qui se construit"
        usage="Un loader : pendant le chargement d'une page ou d'une image, les étages s'empilent."
      >
        <div className="pt-24 text-zinc-800">
          <FloorsLoader />
        </div>
      </Idea>

      <Idea
        n="06"
        title="Le réticule de DAO"
        usage="Sur une zone (ex. : la galerie de plans), le curseur devient celui d'AutoCAD, avec les coordonnées. Passez la souris sur le plan."
      >
        <CadCursor className="blueprint h-64 w-full rounded-sm">
          <p className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-widest opacity-70">
            Plan masse · 1/100
          </p>
        </CadCursor>
      </Idea>

      <footer className="px-6 pb-16 pt-8 text-center font-mono text-xs text-zinc-500">
        Idée 07 : la mire de niveau à droite de l&apos;écran suit le scroll.
      </footer>
    </main>
  );
}
