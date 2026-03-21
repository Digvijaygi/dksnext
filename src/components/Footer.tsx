import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Twitter, Heart, Instagram } from "lucide-react";
import { useSupabaseSiteSettings } from "@/hooks/useSupabaseSiteSettings";

const Footer = () => {
  const { settings } = useSupabaseSiteSettings();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: settings.githubUrl, label: "GitHub" },
    { icon: Linkedin, href: settings.linkedinUrl, label: "LinkedIn" },
    { icon: Twitter, href: settings.twitterUrl, label: "Twitter" },
    ...(settings.instagramUrl ? [{ icon: Instagram, href: settings.instagramUrl, label: "Instagram" }] : []),
    { icon: Mail, href: `mailto:${settings.email}`, label: "Email" },
  ];

  return (
    <footer className="py-12 border-t border-white/[0.08] relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <motion.a
              href="#home"
              className="text-3xl font-bold text-shimmer font-mono"
              whileHover={{ scale: 1.05 }}
            >
              DKS
            </motion.a>

            <p className="text-muted-foreground text-sm text-center flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500" /> by {settings.footerName}
              <span className="mx-2">•</span>
              © {currentYear} All rights reserved.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300"
                  aria-label={social.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
