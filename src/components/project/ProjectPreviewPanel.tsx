import type { Project } from "@/lib/projects";

type ProjectPreviewPanelProps = {
  project: Project;
};

export function ProjectPreviewPanel({ project }: ProjectPreviewPanelProps) {
  return (
    <div className="border-t border-[#D6D1C7] px-4 pb-8 pt-6 sm:px-6 md:px-6 md:pb-10 md:pt-8 dark:border-[#3A352F]">
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        {/* Image d’aperçu */}
        <div className="md:col-span-5">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#D6D1C7] bg-[#E7E2D8] dark:border-[#3A352F] dark:bg-[#221F1C]">
            <div className="flex h-full w-full items-center justify-center p-4 text-center sm:p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6A62] sm:text-xs dark:text-[#A8A196]">
                Image d’aperçu
                <br />
                à intégrer ici
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="md:col-span-6 md:col-start-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6A62] sm:text-xs dark:text-[#A8A196]">
            Aperçu du dossier
          </p>

          <p className="mt-3 text-base leading-relaxed text-[#1F1D1A] sm:text-lg dark:text-[#F3F1EC]">
            {project.summary}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-[#6E6A62] sm:mt-4 sm:text-base dark:text-[#A8A196]">
            {project.intention}
          </p>

          {/* Métadonnées */}
          <dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-[0.2em] sm:mt-8 sm:grid-cols-3 sm:gap-6 sm:text-xs">
            <div>
              <dt className="text-[#6E6A62] dark:text-[#A8A196]">
                Échelle
              </dt>
              <dd className="mt-2 text-[#1F1D1A] dark:text-[#F3F1EC]">
                {project.scale}
              </dd>
            </div>

            <div>
              <dt className="text-[#6E6A62] dark:text-[#A8A196]">
                Outils
              </dt>
              <dd className="mt-2 text-[#1F1D1A] dark:text-[#F3F1EC]">
                {project.tools.join(" / ")}
              </dd>
            </div>

            <div>
              <dt className="text-[#6E6A62] dark:text-[#A8A196]">
                Année
              </dt>
              <dd className="mt-2 text-[#1F1D1A] dark:text-[#F3F1EC]">
                {project.year}
              </dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-5">
            <a
              href={`#${project.id}`}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-3 border border-[#1F1D1A] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#1F1D1A] transition-colors hover:bg-[#1F1D1A] hover:text-[#F3F1EC] active:bg-[#1F1D1A] active:text-[#F3F1EC] sm:w-auto sm:text-xs dark:border-[#F3F1EC] dark:text-[#F3F1EC] dark:hover:bg-[#F3F1EC] dark:hover:text-[#141312] dark:active:bg-[#F3F1EC] dark:active:text-[#141312]"
            >
              Fiche complète
              <span aria-hidden="true">→</span>
            </a>

            <a
              href={project.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-3 border border-[#D6D1C7] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6A62] transition-colors hover:border-[#1F1D1A] hover:text-[#1F1D1A] active:border-[#1F1D1A] active:text-[#1F1D1A] sm:w-auto sm:text-xs dark:border-[#3A352F] dark:text-[#A8A196] dark:hover:border-[#F3F1EC] dark:hover:text-[#F3F1EC] dark:active:border-[#F3F1EC] dark:active:text-[#F3F1EC]"
            >
              Dossier PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}