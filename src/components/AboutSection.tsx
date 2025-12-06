import { Code, Palette, Rocket } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Clean Code",
    description: "Writing maintainable, scalable, and efficient code following best practices.",
  },
  {
    icon: Palette,
    title: "Creative Design",
    description: "Crafting visually stunning interfaces with attention to every detail.",
  },
  {
    icon: Rocket,
    title: "Fast Delivery",
    description: "Delivering high-quality projects on time without compromising quality.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-primary font-mono text-sm mb-2">&lt;About /&gt;</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Who I <span className="text-gradient">Am</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full" />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                नमस्ते! I'm <span className="text-primary font-semibold">Digvijay Sahni</span>, 
                a passionate Full Stack Developer based in India. With years of experience 
                in web development, I specialize in creating modern, responsive, and 
                user-friendly websites.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I love turning complex problems into simple, beautiful solutions. 
                Whether it's a dynamic web application, an e-commerce platform, 
                or a stunning portfolio site – I bring creativity and technical 
                expertise to every project.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                When I'm not coding, you'll find me exploring new technologies, 
                contributing to open-source projects, or sharing knowledge with 
                the developer community.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 bg-gradient-card rounded-xl border border-border">
                  <div className="text-3xl font-bold text-gradient">50+</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center p-4 bg-gradient-card rounded-xl border border-border">
                  <div className="text-3xl font-bold text-gradient">30+</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div className="text-center p-4 bg-gradient-card rounded-xl border border-border">
                  <div className="text-3xl font-bold text-gradient">5+</div>
                  <div className="text-sm text-muted-foreground">Years</div>
                </div>
              </div>
            </div>

            {/* Right - Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-6 bg-gradient-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
