import { useState } from "react";
import { Search, Filter, X, Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ProjectCategory, 
  ProjectStatus, 
  categoryLabels, 
  statusConfig,
  getAllCategories,
  getAllTags 
} from "@/data/projects";

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ProjectCategory | "all";
  onCategoryChange: (category: ProjectCategory | "all") => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedStatus: ProjectStatus | "all";
  onStatusChange: (status: ProjectStatus | "all") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalResults: number;
}

const ProjectFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  totalResults,
}: ProjectFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const categories = getAllCategories();
  const allTags = getAllTags();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onTagsChange([]);
    onStatusChange("all");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedTags.length > 0 || selectedStatus !== "all";

  return (
    <div className="space-y-4 mb-8">
      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* View Mode & Filter Toggle */}
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "hero" : "heroOutline"}
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </Button>

          <div className="flex border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-3 transition-colors ${
                viewMode === "grid" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-3 transition-colors ${
                viewMode === "list" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-6 bg-gradient-card border border-border rounded-xl animate-scale-in space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Category</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Status</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStatusChange("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedStatus === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                All Status
              </button>
              {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedStatus === status
                      ? statusConfig[status].className
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {statusConfig[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300 ${
                    selectedTags.includes(tag)
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Showing {totalResults} project{totalResults !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive hover:text-destructive">
                <X size={16} className="mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
              "{searchQuery}"
              <button onClick={() => onSearchChange("")}><X size={12} /></button>
            </span>
          )}
          {selectedCategory !== "all" && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
              {categoryLabels[selectedCategory]}
              <button onClick={() => onCategoryChange("all")}><X size={12} /></button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
              {tag}
              <button onClick={() => toggleTag(tag)}><X size={12} /></button>
            </span>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            ({totalResults} result{totalResults !== 1 ? "s" : ""})
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;
