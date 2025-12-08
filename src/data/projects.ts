export type ProjectCategory = 
  | "web-app" 
  | "e-commerce" 
  | "portfolio" 
  | "dashboard" 
  | "mobile" 
  | "api" 
  | "other";

export type ProjectStatus = "completed" | "in-progress" | "planned";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  images?: string[]; // Gallery images
  tags: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  completedAt?: string; // Date string "2024-01"
  client?: string;
  testimonial?: {
    text: string;
    author: string;
    role: string;
  };
}

// Category labels for display
export const categoryLabels: Record<ProjectCategory, string> = {
  "web-app": "Web Application",
  "e-commerce": "E-Commerce",
  "portfolio": "Portfolio",
  "dashboard": "Dashboard",
  "mobile": "Mobile App",
  "api": "API / Backend",
  "other": "Other",
};

// Status labels and colors
export const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  "completed": { label: "Completed", className: "bg-green-500/20 text-green-400" },
  "in-progress": { label: "In Progress", className: "bg-yellow-500/20 text-yellow-400" },
  "planned": { label: "Planned", className: "bg-blue-500/20 text-blue-400" },
};

// ============================================
// 🚀 APNE PROJECTS YAHAN ADD KARO
// ============================================
// 
// Naya project add karne ke liye:
// 1. Neeche diye template ko copy karo
// 2. Apni details fill karo
// 3. Save karo - bas ho gaya!
//
// ============================================

export const projects: Project[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT 1 - E-Commerce Platform
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce solution with cart, payments, and admin dashboard.",
    longDescription: "Complete e-commerce platform built from scratch with modern technologies. Features include product management, shopping cart, secure payment processing with Stripe, order tracking, and a comprehensive admin dashboard.",
    image: "/placeholder.svg",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "e-commerce",
    status: "completed",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/dks",
    featured: true,
    completedAt: "2024-06",
    client: "TechMart Inc.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT 2 - Task Management App
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "task-manager",
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates and team features.",
    longDescription: "A powerful task management application designed for teams with real-time collaboration and drag-and-drop task boards.",
    image: "/placeholder.svg",
    tags: ["Next.js", "TypeScript", "Prisma", "WebSocket"],
    category: "web-app",
    status: "completed",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/dks",
    featured: true,
    completedAt: "2024-05",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT 3 - Portfolio Website
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "portfolio-site",
    title: "Portfolio Website",
    description: "Modern portfolio website with animations and responsive design.",
    image: "/placeholder.svg",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    category: "portfolio",
    status: "completed",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/dks",
    completedAt: "2024-04",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT 4 - Weather Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "weather-dashboard",
    title: "Weather Dashboard",
    description: "Real-time weather application with beautiful visualizations.",
    image: "/placeholder.svg",
    tags: ["Vue.js", "Chart.js", "OpenWeather API"],
    category: "dashboard",
    status: "completed",
    liveUrl: "https://example.com",
    completedAt: "2024-03",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT 5 - Blog Platform
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "blog-platform",
    title: "Blog Platform",
    description: "Full-stack blog with CMS, markdown support, and SEO optimization.",
    image: "/placeholder.svg",
    tags: ["React", "GraphQL", "PostgreSQL"],
    category: "web-app",
    status: "completed",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/dks",
    completedAt: "2024-02",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT 6 - Social Media Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "social-dashboard",
    title: "Social Media Dashboard",
    description: "Analytics dashboard for tracking social media performance.",
    image: "/placeholder.svg",
    tags: ["React", "D3.js", "Firebase"],
    category: "dashboard",
    status: "completed",
    liveUrl: "https://example.com",
    completedAt: "2024-01",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👇 NAYA PROJECT ADD KARNE KE LIYE NEECHE COPY-PASTE KARO 👇
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // TEMPLATE - Isko copy karo aur upar paste karo
  // {
  //   id: "unique-project-id",              // Unique ID (lowercase, no spaces)
  //   title: "Project Ka Naam",             // Project ka naam
  //   description: "Short description",     // Chhoti description (1-2 lines)
  //   longDescription: "Detailed info",     // Lambi description (optional)
  //   image: "/placeholder.svg",            // Image path ya URL
  //   tags: ["React", "Node.js"],           // Technologies used
  //   category: "web-app",                  // Category: web-app, e-commerce, portfolio, dashboard, mobile, api, other
  //   status: "completed",                  // Status: completed, in-progress, planned
  //   liveUrl: "https://...",               // Live website URL (optional)
  //   githubUrl: "https://github.com/...",  // GitHub URL (optional)
  //   featured: true,                       // Homepage pe dikhana hai? (optional)
  //   completedAt: "2024-06",               // Complete hone ki date (optional)
  //   client: "Client Name",                // Client ka naam (optional)
  // },

];

// ============================================
// HELPER FUNCTIONS - Inhe mat chhuo
// ============================================

export const getProjectsByCategory = (category: ProjectCategory): Project[] => {
  return projects.filter(p => p.category === category);
};

export const getFeaturedProjects = (): Project[] => {
  return projects.filter(p => p.featured);
};

export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return projects.filter(p => p.status === status);
};

export const searchProjects = (query: string): Project[] => {
  const lowerQuery = query.toLowerCase();
  return projects.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getAllCategories = (): ProjectCategory[] => {
  return [...new Set(projects.map(p => p.category))];
};

export const getAllTags = (): string[] => {
  const tags = projects.flatMap(p => p.tags);
  return [...new Set(tags)].sort();
};
