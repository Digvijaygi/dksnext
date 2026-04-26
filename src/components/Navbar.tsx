import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Home, User, FolderOpen, Code, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home", icon: Home },
  { label: "About", href: "#about", icon: User },
  { label: "Projects", href: "#projects", icon: FolderOpen },
  { label: "Skills", href: "#skills", icon: Code },
  { label: "Contact", href: "#contact", icon: Mail },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = navLinks.map(link => link.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = () => setIsOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      {/* Desktop Navigation - Centered Dynamic Island */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center pt-4 px-4">
        <div
          className={`transition-all duration-500 ease-out glass-island ${
            scrolled ? "px-2 py-2" : "px-3 py-2"
          }`}
          style={{
            background: scrolled 
              ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(10, 10, 20, 0.9) 100%)'
              : 'linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 20, 0.8) 100%)',
            boxShadow: scrolled
              ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 40px rgba(0, 212, 170, 0.1)'
              : '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          }}
        >
          <div className="flex items-center gap-1">
            {/* Logo */}
            <a
              href="#home"
              className="text-lg font-bold text-gradient font-mono px-3 py-1.5 rounded-full hover:bg-white/5 transition-all duration-300"
            >
              DKSNEXT
            </a>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Navigation Links */}
            <div className="flex items-center">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group ${
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                    }`}>
                      {link.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Admin Button */}
            <Link to="/admin">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 rounded-full px-3 py-1.5 h-auto text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Shield size={14} />
                <span className="text-sm">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Fixed Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div 
          className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ${
            scrolled || isOpen
              ? 'bg-black/90 backdrop-blur-xl'
              : 'bg-black/60 backdrop-blur-md'
          }`}
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo */}
          <a href="#home" className="text-lg font-bold text-gradient font-mono">
            DKSNEXT
          </a>

          {/* Menu Button */}
          <button
            className="text-foreground p-2 rounded-full hover:bg-white/10 transition-all duration-300 relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <Menu 
                size={20} 
                className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} 
              />
              <X 
                size={20} 
                className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} 
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-1">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: isOpen ? 'slideUp 0.3s ease-out forwards' : 'none'
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </a>
              );
            })}
            <div className="w-full h-px bg-white/10 my-2" />
            <Link 
              to="/admin" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
            >
              <Shield size={20} />
              <span className="font-medium">Admin Panel</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for mobile to prevent content from going under fixed navbar */}
      <div className="h-14 md:h-0" />
    </>
  );
};

export default Navbar;
