import { ExternalLink, Github, Calendar, User } from "lucide-react";
import { Project, categoryLabels, statusConfig } from "@/data/projects";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  viewMode?: "grid" | "list";
}

const ProjectCard = ({ project, viewMode = "grid" }: ProjectCardProps) => {
  if (viewMode === "list") {
    return (
      <div className="group relative glass-card overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-glow">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-72 lg:w-80 aspect-video md:aspect-auto overflow-hidden bg-secondary flex-shrink-0">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Status Badge */}
            <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[project.status].className}`}>
              {statusConfig[project.status].label}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs font-mono text-primary mb-1 block">
                    {categoryLabels[project.category]}
                  </span>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </h3>
                </div>
                {project.featured && (
                  <span className="px-3 py-1 bg-gradient-primary text-primary-foreground text-xs font-semibold rounded-full whitespace-nowrap">
                    Featured
                  </span>
                )}
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {project.longDescription || project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-mono"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 5 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                    +{project.tags.length - 5} more
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {project.completedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {project.completedAt}
                  </span>
                )}
                {project.client && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {project.client}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              {project.liveUrl && (
                <Button variant="hero" size="sm" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button variant="heroOutline" size="sm" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github size={16} />
                    Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="group relative glass-card overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-glow h-full flex flex-col">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {project.liveUrl && (
            <Button variant="hero" size="sm" asChild>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                Live Demo
              </a>
            </Button>
          )}
          {project.githubUrl && (
            <Button variant="heroOutline" size="sm" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github size={16} />
                Code
              </a>
            </Button>
          )}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[project.status].className}`}>
          {statusConfig[project.status].label}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-mono text-primary">
            {categoryLabels[project.category]}
          </span>
          {project.completedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar size={10} />
              {project.completedAt}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-mono"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Featured Badge */}
      {project.featured && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-primary text-primary-foreground text-xs font-semibold rounded-full">
          Featured
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
