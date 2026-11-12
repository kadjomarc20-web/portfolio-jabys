import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/context/ThemeContext";
const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-src",
  display: "swap",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-src",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Samuel Yapo — Portfolio d’architecture",
    template: "%s — Samuel Yapo",
  },
  description:
    "Portfolio d’architecture étudiant : six projets explorant la matière, la lumière, la structure et l’usage. Plans, rendus, maquettes et dossiers PDF.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#F3F1EC",
};
// Exécuté dans <head>, avant le premier affichage : applique le thème
// sombre mémorisé sans flash de la page en clair.
const themeScript = `
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[#F3F1EC] font-sans text-[#1F1D1A] antialiased dark:bg-[#221f1d] dark:text-[#F3F1EC]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}