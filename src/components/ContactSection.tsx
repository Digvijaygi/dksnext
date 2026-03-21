import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseContactMessages } from "@/hooks/useSupabaseContactMessages";
import { useSupabaseSiteSettings } from "@/hooks/useSupabaseSiteSettings";
import { Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";

// Input sanitization
const sanitizeInput = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Max length
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
};

// Rate limiting: max 3 messages per 5 minutes
const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000;

const ContactSection = () => {
  const { toast } = useToast();
  const { addMessage } = useSupabaseContactMessages();
  const { settings } = useSupabaseSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimestamps = useRef<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, '')}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: settings.location,
      href: "#",
    },
  ];

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    submitTimestamps.current = submitTimestamps.current.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW
    );
    if (submitTimestamps.current.length >= RATE_LIMIT_COUNT) {
      return false;
    }
    submitTimestamps.current.push(now);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limit check
    if (!checkRateLimit()) {
      toast({
        title: "Too many messages",
        description: "Please wait a few minutes before sending another message.",
        variant: "destructive",
      });
      return;
    }

    // Validate & sanitize
    const sanitized = {
      name: sanitizeInput(formData.name),
      email: formData.email.trim(),
      subject: sanitizeInput(formData.subject),
      message: sanitizeInput(formData.message),
    };

    if (!sanitized.name || sanitized.name.length < 2) {
      toast({ title: "Error", description: "Please enter a valid name (at least 2 characters).", variant: "destructive" });
      return;
    }

    if (!isValidEmail(sanitized.email)) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (!sanitized.subject || sanitized.subject.length < 2) {
      toast({ title: "Error", description: "Please enter a subject.", variant: "destructive" });
      return;
    }

    if (!sanitized.message || sanitized.message.length < 10) {
      toast({ title: "Error", description: "Message must be at least 10 characters.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await addMessage(sanitized);
      toast({
        title: "Message Sent! ✨",
        description: "Thank you for reaching out. I'll get back to you soon!",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="contact" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 opacity-30 blur-3xl" />
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-mono text-sm mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              &lt;Contact /&gt;
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Get In <span className="text-shimmer">Touch</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind? Let's work together to create something amazing.
            </p>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-4" />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">Let's Talk</h3>
                <p className="text-muted-foreground mb-8">
                  I'm always open to discussing new projects, creative ideas, 
                  or opportunities to be part of your vision. Feel free to reach out!
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="group flex items-center gap-4 p-4 glass-card hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                      <info.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      <p className="font-medium group-hover:text-primary transition-colors duration-300">
                        {info.value}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit} 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-8 space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="glass-input h-12"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className="glass-input h-12"
                />
              </div>
              <Input
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                maxLength={200}
                className="glass-input h-12"
              />
              <Textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                maxLength={1000}
                rows={6}
                className="glass-input resize-none"
              />
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 bg-gradient-primary text-primary-foreground font-semibold text-lg rounded-xl hover:scale-[1.02] transition-transform duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </Button>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
