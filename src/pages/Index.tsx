import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { GalaxyBackground } from "@/components/GalaxyBackground";
import { CursorTrail } from "@/components/CursorTrail";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";

const Index = () => {
  return (
    <main className="min-h-screen bg-transparent relative">
      <GalaxyBackground />
      <CursorTrail />
      <Navbar />
      
      <ScrollAnimationWrapper>
        <HeroSection />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={0.1}>
        <AboutSection />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={0.1} direction="left">
        <ProjectsSection />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={0.1} direction="right">
        <SkillsSection />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={0.1}>
        <ContactSection />
      </ScrollAnimationWrapper>
      
      <Footer />
    </main>
  );
};

export default Index;
