import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import { useSupabaseSiteSettings } from "@/hooks/useSupabaseSiteSettings";

const HeroSection = () => {
  const { settings } = useSupabaseSiteSettings();

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 opacity-50 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 opacity-30 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Dynamic Island Style Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="glass-island px-6 py-2 inline-flex items-center gap-2 mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">{settings.availabilityStatus}</span>
          </motion.div>

          {/* Greeting */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-mono text-sm md:text-base mb-4 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            &lt;Hello World /&gt;
          </motion.p>

          {/* Name */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
          >
            I'm{" "}
            <span className="text-shimmer">{settings.heroName}</span>
          </motion.h1>

          {/* Tagline */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-6"
          >
            {settings.heroTagline}
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8"
          >
            {settings.heroDescription}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button variant="hero" size="xl" asChild className="glass-button hover:scale-105 transition-transform">
              <a href="#projects">View My Work</a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild className="glass-button hover:scale-105 transition-transform">
              <a href="#contact">Get In Touch</a>
            </Button>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-4"
          >
            {[
              { icon: Github, href: settings.githubUrl, label: "GitHub" },
              { icon: Linkedin, href: settings.linkedinUrl, label: "LinkedIn" },
              { icon: Mail, href: `mailto:${settings.email}`, label: "Email" },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target={social.label !== "Email" ? "_blank" : undefined}
                rel={social.label !== "Email" ? "noopener noreferrer" : undefined}
                className="w-12 h-12 glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
                aria-label={social.label}
                whileHover={{ y: -5 }}
              >
                <social.icon size={22} />
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <a
            href="#about"
            className="w-10 h-16 glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-300 rounded-full"
            aria-label="Scroll down"
          >
            <ArrowDown size={24} />
          </a>
        </motion.div>
      </div>

      {/* Decorative Monogram */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[20rem] font-bold text-muted/5 font-mono hidden lg:block select-none pointer-events-none">
        DKS
      </div>
    </section>
  );
};

export default HeroSection;
