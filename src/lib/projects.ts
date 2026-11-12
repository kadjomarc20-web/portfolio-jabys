export type Project = {
  id: string;
  number: string;
  title: string;
  year: number;
  location: string;
  typology: string;
  scale: string;
  tools: string[];
  summary: string;
  intention: string;
  pdfUrl: string;
  layout: "image-left" | "image-right" | "full-width";
};

export const projects: Project[] = [
  {
    id: "projet-01",
    number: "01",
    title: "Maison Lumière",
    year: 2025,
    location: "Lyon",
    typology: "Habitat individuel",
    scale: "120 m²",
    tools: ["Rhino", "V-Ray", "AutoCAD"],
    summary:
      "Exploration des seuils entre ombre, lumière et matière.",
    intention:
      "Ce projet travaille la maison comme un filtre lumineux. Les ouvertures ne sont pas de simples vides dans la paroi, mais des instruments de mesure de la lumière.",
    pdfUrl: "/pdf/projet-01.pdf",
    layout: "image-left",
  },
  {
    id: "projet-02",
    number: "02",
    title: "Pavillon Concret",
    year: 2024,
    location: "Marseille",
    typology: "Équipement culturel",
    scale: "350 m²",
    tools: ["Revit", "Lumion", "Photoshop"],
    summary:
      "Un volume brut ouvert sur la lumière méditerranéenne.",
    intention:
      "Le pavillon se présente comme un objet simple posé dans le paysage. Sa masse apparente contraste avec la légèreté des espaces intérieurs.",
    pdfUrl: "/pdf/projet-02.pdf",
    layout: "image-right",
  },
  {
    id: "projet-03",
    number: "03",
    title: "Atelier Bois",
    year: 2023,
    location: "Strasbourg",
    typology: "Espace de travail",
    scale: "80 m²",
    tools: ["SketchUp", "Enscape", "Illustrator"],
    summary:
      "Structure légère, matière chaude, spatialité artisanale.",
    intention:
      "L’atelier est conçu comme un espace de fabrication où la structure participe directement à l’usage.",
    pdfUrl: "/pdf/projet-03.pdf",
    layout: "full-width",
  },
  {
    id: "projet-04",
    number: "04",
    title: "Seuil Urbain",
    year: 2025,
    location: "Nantes",
    typology: "Espace public",
    scale: "1 200 m²",
    tools: ["AutoCAD", "Rhino", "InDesign"],
    summary:
      "Requalifier une lisière urbaine par la marche et le regard.",
    intention:
      "Ce projet interroge la frontière entre quartier, parc et infrastructure. Le seuil devient un espace intermédiaire.",
    pdfUrl: "/pdf/projet-04.pdf",
    layout: "image-left",
  },
  {
    id: "projet-05",
    number: "05",
    title: "Habitation Légère",
    year: 2024,
    location: "Bordeaux",
    typology: "Logement collectif",
    scale: "6 logements",
    tools: ["Revit", "V-Ray", "Photoshop"],
    summary:
      "Un immeuble bas, perméable, organisé autour de patios.",
    intention:
      "L’habitation collective est pensée comme un petit village vertical. Chaque logement dispose d’un patio planté.",
    pdfUrl: "/pdf/projet-05.pdf",
    layout: "image-right",
  },
  {
    id: "projet-06",
    number: "06",
    title: "Résonances",
    year: 2026,
    location: "Paris",
    typology: "Installation temporaire",
    scale: "200 m²",
    tools: ["Grasshopper", "Rhino", "After Effects"],
    summary:
      "Une installation qui traduit le mouvement en matière.",
    intention:
      "Résonances explore la relation entre son, lumière et paroi. L’installation devient un paysage intérieur instable.",
    pdfUrl: "/pdf/projet-06.pdf",
    layout: "full-width",
  },
];