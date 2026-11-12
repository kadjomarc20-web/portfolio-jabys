import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectIndexSection } from "@/components/sections/ProjectIndexSection";
import { projects } from "@/lib/projects";
import {ThemeToggle} from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    //dark:bg-[#35312e]
    <main className="min-h-screen bg-[#F3F1EC] text-[#1F1D1A] dark:bg-[#221f1d] dark:text-[#F3F1EC]">
      <ThemeToggle />
      <HeroSection />
      <ProjectIndexSection projects={projects} />
    </main>
  );
}