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

const SkillBar = ({ name, level }: { name: string; level: number }) => (
  <div className="group">
    <div className="flex justify-between mb-2">
      <span className="font-medium group-hover:text-primary transition-colors duration-300">
        {name}
      </span>
      <span className="text-muted-foreground font-mono text-sm">{level}%</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${level}%` }}
      />
    </div>
  </div>
);

const SkillsSection = () => {
  return (
    <section id="skills" className="py-20 md:py-32 relative bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-primary font-mono text-sm mb-2">&lt;Skills /&gt;</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              My <span className="text-gradient">Expertise</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Technologies and tools I use to bring ideas to life.
            </p>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-4" />
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend */}
            <div className="p-6 bg-gradient-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-6 text-center">
                <span className="text-gradient">Frontend</span>
              </h3>
              <div className="space-y-4">
                {skills.frontend.map((skill) => (
                  <SkillBar key={skill.name} {...skill} />
                ))}
              </div>
            </div>

            {/* Backend */}
            <div className="p-6 bg-gradient-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-6 text-center">
                <span className="text-gradient">Backend</span>
              </h3>
              <div className="space-y-4">
                {skills.backend.map((skill) => (
                  <SkillBar key={skill.name} {...skill} />
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="p-6 bg-gradient-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-6 text-center">
                <span className="text-gradient">Tools</span>
              </h3>
              <div className="space-y-4">
                {skills.tools.map((skill) => (
                  <SkillBar key={skill.name} {...skill} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
