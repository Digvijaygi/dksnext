import { useState, useMemo } from "react";
import { ProjectCategory, ProjectStatus } from "@/data/projects";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import ProjectFilters from "@/components/ProjectFilters";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

const ProjectsSection = () => {
  const { projects, isLoading } = useProjects();
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter(p => p.status === selectedStatus);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      result = result.filter(p => 
        selectedTags.every(tag => p.tags.includes(tag))
      );
    }

    return result;
  }, [projects, searchQuery, selectedCategory, selectedStatus, selectedTags]);

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);
  const hasFilters = searchQuery || selectedCategory !== "all" || selectedTags.length > 0 || selectedStatus !== "all";

  return (
    <section id="projects" className="py-20 md:py-32 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-glow opacity-30 blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-primary font-mono text-sm mb-2">&lt;Projects /&gt;</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              My <span className="text-gradient">Work</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Here are some of the projects I've worked on. Each project represents my 
              dedication to creating quality web solutions.
            </p>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-4" />
          </div>

          {/* Filters */}
          <ProjectFilters
            projects={projects}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalResults={filteredProjects.length}
          />

          {/* Projects Grid/List */}
          {filteredProjects.length > 0 ? (
            <>
              <div className={
                viewMode === "grid" 
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                  : "flex flex-col gap-6 mb-12"
              }>
                {displayedProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-scale-in opacity-0"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <ProjectCard project={project} viewMode={viewMode} />
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {filteredProjects.length > 6 && (
                <div className="text-center">
                  <Button
                    variant="heroOutline"
                    size="lg"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Show Less" : `Show All (${filteredProjects.length})`}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <FolderOpen className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                {hasFilters 
                  ? "Try adjusting your filters to see more projects."
                  : "Projects will appear here once added."}
              </p>
              {hasFilters && (
                <Button
                  variant="heroOutline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedTags([]);
                    setSelectedStatus("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-card rounded-xl border border-border">
              <div className="text-3xl font-bold text-gradient mb-1">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="text-center p-6 bg-gradient-card rounded-xl border border-border">
              <div className="text-3xl font-bold text-gradient mb-1">
                {projects.filter(p => p.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-6 bg-gradient-card rounded-xl border border-border">
              <div className="text-3xl font-bold text-gradient mb-1">
                {projects.filter(p => p.featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </div>
            <div className="text-center p-6 bg-gradient-card rounded-xl border border-border">
              <div className="text-3xl font-bold text-gradient mb-1">
                {new Set(projects.flatMap(p => p.tags)).size}
              </div>
              <div className="text-sm text-muted-foreground">Technologies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
