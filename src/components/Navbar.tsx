import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#home"
            className="text-2xl md:text-3xl font-bold text-gradient font-mono"
          >
            DKS
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link to="/admin">
              <Button variant="hero" size="sm" className="gap-2">
                <Shield size={16} />
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 glass transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary transition-colors duration-300 py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/admin" onClick={() => setIsOpen(false)}>
            <Button variant="hero" size="sm" className="w-fit gap-2">
              <Shield size={16} />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
