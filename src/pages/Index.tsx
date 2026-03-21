import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { GalaxyBackground } from "@/components/GalaxyBackground";
import { CursorTrail } from "@/components/CursorTrail";
import { BannerCarousel } from "@/components/BannerCarousel";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <main className="min-h-screen bg-transparent relative">
      <GalaxyBackground />
      <CursorTrail />
      <ThemeToggle />
      <Navbar />
      <HeroSection />
      <BannerCarousel />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
