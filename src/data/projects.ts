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

export const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce solution with cart, payments, and admin dashboard.",
    longDescription: "Complete e-commerce platform built from scratch with modern technologies. Features include product management, shopping cart, secure payment processing with Stripe, order tracking, and a comprehensive admin dashboard for managing products, orders, and customers.",
    image: "/placeholder.svg",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "e-commerce",
    status: "completed",
    liveUrl: "#",
    githubUrl: "#",
    featured: true,
    completedAt: "2024-06",
    client: "TechMart Inc.",
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates and team features.",
    longDescription: "A powerful task management application designed for teams. Includes real-time collaboration, drag-and-drop task boards, project timelines, team chat, and detailed analytics to track productivity.",
    image: "/placeholder.svg",
    tags: ["Next.js", "TypeScript", "Prisma", "WebSocket"],
    category: "web-app",
    status: "completed",
    liveUrl: "#",
    githubUrl: "#",
    featured: true,
    completedAt: "2024-05",
  },
  {
    id: "3",
    title: "Portfolio Website",
    description: "Modern portfolio website with animations and responsive design.",
    image: "/placeholder.svg",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    category: "portfolio",
    status: "completed",
    liveUrl: "#",
    githubUrl: "#",
    completedAt: "2024-04",
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "Real-time weather application with beautiful visualizations.",
    image: "/placeholder.svg",
    tags: ["Vue.js", "Chart.js", "OpenWeather API"],
    category: "dashboard",
    status: "completed",
    liveUrl: "#",
    githubUrl: "#",
    completedAt: "2024-03",
  },
  {
    id: "5",
    title: "Blog Platform",
    description: "Full-stack blog with CMS, markdown support, and SEO optimization.",
    image: "/placeholder.svg",
    tags: ["React", "GraphQL", "PostgreSQL"],
    category: "web-app",
    status: "completed",
    liveUrl: "#",
    githubUrl: "#",
    completedAt: "2024-02",
  },
  {
    id: "6",
    title: "Social Media Dashboard",
    description: "Analytics dashboard for tracking social media performance.",
    image: "/placeholder.svg",
    tags: ["React", "D3.js", "Firebase"],
    category: "dashboard",
    status: "completed",
    liveUrl: "#",
    githubUrl: "#",
    completedAt: "2024-01",
  },
];

// ============================================
// HOW TO ADD NEW PROJECTS
// ============================================
// 
// Simply add a new object to the projects array above.
// Copy this template and fill in your project details:
//
// {
//   id: "unique-id",           // Unique identifier
//   title: "Project Name",      // Display name
//   description: "Short description shown on card",
//   longDescription: "Detailed description for project page (optional)",
//   image: "/path/to/image.jpg", // Main project image
//   images: ["/img1.jpg", "/img2.jpg"], // Gallery images (optional)
//   tags: ["React", "Node.js"], // Technologies used
//   category: "web-app",        // One of: web-app, e-commerce, portfolio, dashboard, mobile, api, other
//   status: "completed",        // One of: completed, in-progress, planned
//   liveUrl: "https://...",     // Live demo URL (optional)
//   githubUrl: "https://...",   // GitHub repo URL (optional)
//   featured: true,             // Show in featured section (optional)
//   completedAt: "2024-06",     // Completion date (optional)
//   client: "Client Name",      // Client name (optional)
//   testimonial: {              // Client testimonial (optional)
//     text: "Great work!",
//     author: "John Doe",
//     role: "CEO at Company"
//   }
// }
//
// ============================================

// Helper functions for filtering
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
