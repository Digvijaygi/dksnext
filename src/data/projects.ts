export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce solution with cart, payments, and admin dashboard.",
    image: "/placeholder.svg",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates and team features.",
    image: "/placeholder.svg",
    tags: ["Next.js", "TypeScript", "Prisma"],
    liveUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: "3",
    title: "Portfolio Website",
    description: "Modern portfolio website with animations and responsive design.",
    image: "/placeholder.svg",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "Real-time weather application with beautiful visualizations.",
    image: "/placeholder.svg",
    tags: ["Vue.js", "Chart.js", "API"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "5",
    title: "Blog Platform",
    description: "Full-stack blog with CMS, markdown support, and SEO optimization.",
    image: "/placeholder.svg",
    tags: ["React", "GraphQL", "PostgreSQL"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "6",
    title: "Social Media Dashboard",
    description: "Analytics dashboard for tracking social media performance.",
    image: "/placeholder.svg",
    tags: ["React", "D3.js", "Firebase"],
    liveUrl: "#",
    githubUrl: "#",
  },
];

// Add new projects to this array
// Example:
// {
//   id: "7",
//   title: "New Project",
//   description: "Description of the new project",
//   image: "/path-to-image.jpg",
//   tags: ["Tech1", "Tech2"],
//   liveUrl: "https://live-url.com",
//   githubUrl: "https://github.com/username/repo",
//   featured: false,
// }
