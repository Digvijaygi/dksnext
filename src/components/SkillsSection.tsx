import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const skills = {
  frontend: [
    { name: "React", level: 95 },
    { name: "Next.js", level: 90 },
    { name: "TypeScript", level: 88 },
    { name: "Tailwind CSS", level: 95 },
    { name: "JavaScript", level: 92 },
    { name: "HTML/CSS", level: 98 },
  ],
  backend: [
    { name: "Node.js", level: 85 },
    { name: "Express.js", level: 82 },
    { name: "MongoDB", level: 80 },
    { name: "PostgreSQL", level: 78 },
    { name: "REST APIs", level: 90 },
    { name: "GraphQL", level: 75 },
  ],
  tools: [
    { name: "Git/GitHub", level: 92 },
    { name: "VS Code", level: 95 },
    { name: "Figma", level: 85 },
    { name: "Docker", level: 70 },
    { name: "Vercel", level: 88 },
    { name: "AWS", level: 65 },
  ],
};

const SkillBar = ({ name, level, delay }: { name: string; level: number; delay: number }) => (
  <motion.div 
    className="group"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="flex justify-between mb-2">
      <span className="font-medium group-hover:text-primary transition-colors duration-300">
        {name}
      </span>
      <span className="text-muted-foreground font-mono text-sm">{level}%</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden glass-input">
      <motion.div
        className="h-full bg-gradient-primary rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

const SkillsSection = () => {
  return (
    <section id="skills" className="py-20 md:py-32 relative bg-gradient-subtle overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-breathe" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-mono text-sm mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              &lt;Skills /&gt;
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              My <span className="text-shimmer">Expertise</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Technologies and tools I use to bring ideas to life.
            </p>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-4" />
          </motion.div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 glass-card glass-shine"
            >
              <h3 className="text-xl font-bold mb-6 text-center">
                <span className="text-shimmer">Frontend</span>
              </h3>
              <div className="space-y-4">
                {skills.frontend.map((skill, index) => (
                  <SkillBar key={skill.name} {...skill} delay={0.2 + index * 0.05} />
                ))}
              </div>
            </motion.div>

            {/* Backend */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 glass-card glass-shine"
            >
              <h3 className="text-xl font-bold mb-6 text-center">
                <span className="text-shimmer">Backend</span>
              </h3>
              <div className="space-y-4">
                {skills.backend.map((skill, index) => (
                  <SkillBar key={skill.name} {...skill} delay={0.3 + index * 0.05} />
                ))}
              </div>
            </motion.div>

            {/* Tools */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 glass-card glass-shine"
            >
              <h3 className="text-xl font-bold mb-6 text-center">
                <span className="text-shimmer">Tools</span>
              </h3>
              <div className="space-y-4">
                {skills.tools.map((skill, index) => (
                  <SkillBar key={skill.name} {...skill} delay={0.4 + index * 0.05} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
