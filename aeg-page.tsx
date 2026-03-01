"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Linkedin,
  Facebook,
  ChevronDown,
  Quote
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#C4A77D]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-serif font-bold text-[#3D3D3D] tracking-wide"
            >
              NZK Realtor
            </motion.div>
            <div className="hidden md:flex items-center gap-8">
              {["About", "Team", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-[#3D3D3D] hover:text-[#B87333] transition-colors duration-300 text-sm uppercase tracking-widest font-medium"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full width background with overlay */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Bay Area Home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#3D3D3D]/60 via-[#3D3D3D]/40 to-[#3D3D3D]/70"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#E8D5B5] text-sm uppercase tracking-[0.4em] font-medium"
            >
              Proudly affiliated with AEG
            </motion.p>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight">
              Nigaar Z. Khan
            </h1>
            
            <p className="text-xl md:text-2xl text-[#E8D5B5] font-light italic">
              Your Bay Area Real Estate Expert
            </p>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Guiding you home with expertise, integrity, and a personal touch. 
              Your dream property awaits in the beautiful Bay Area.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button 
                className="bg-[#B87333] hover:bg-[#A0632A] text-white px-8 py-6 text-base rounded-none"
              >
                Work With Nigaar
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#quote" className="text-white animate-bounce">
            <ChevronDown size={32} />
          </a>
        </motion.div>
      </section>

      {/* Featured Quote Section */}
      <section id="quote" className="py-24 bg-[#C4A77D]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Quote className="w-16 h-16 text-[#C4A77D] mx-auto mb-8" />
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#3D3D3D] leading-tight mb-8">
              Nigaar did not just help us buy a house, she helped us find our home. Her warmth and expertise made all the difference.
            </blockquote>
            <cite className="text-lg text-[#3D3D3D]/70 not-italic">
              — Sarah and Michael Chen, Palo Alto
            </cite>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-full overflow-hidden shadow-2xl max-w-md mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Nigaar Z. Khan"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <p className="text-[#B87333] text-sm uppercase tracking-[0.3em] font-medium">
                About Nigaar
              </p>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3D3D3D]">
                Your Partner in Finding Home
              </h2>
              
              <div className="space-y-4 text-[#3D3D3D]/80 leading-relaxed">
                <p>
                  With over 15 years of experience in the Bay Area real estate market, 
                  I have dedicated my career to helping families find their perfect homes 
                  and investors discover opportunities that build lasting wealth.
                </p>
                
                <p>
                  Having called the Bay Area home for two decades, I understand the unique 
                  character of each neighborhood. This local expertise, combined with my 
                  affiliation with AEG, ensures my clients receive unparalleled service.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold text-[#B87333]">500+</p>
                  <p className="text-sm text-[#3D3D3D]/70">Homes Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold text-[#B87333]">$300M+</p>
                  <p className="text-sm text-[#3D3D3D]/70">Sales Volume</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold text-[#B87333]">98%</p>
                  <p className="text-sm text-[#3D3D3D]/70">Client Satisfaction</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#B87333] text-sm uppercase tracking-[0.3em] font-medium mb-4">
              Our Team
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3D3D3D]">
              Meet the Experts
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                name: "Nigaar Z. Khan",
                title: "Lead Realtor & Founder",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "David Martinez",
                title: "Buyer's Specialist",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Amanda Foster",
                title: "Listing Specialist",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
              }
            ].map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-xl border-4 border-[#C4A77D]/30">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#3D3D3D] mb-2">{agent.name}</h3>
                <p className="text-[#B87333] font-medium">{agent.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <p className="text-[#B87333] text-sm uppercase tracking-[0.3em] font-medium">
                Get in Touch
              </p>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3D3D3D]">
                Lets Connect
              </h2>
              
              <p className="text-lg text-[#3D3D3D]/70 leading-relaxed">
                Ready to start your real estate journey? I would love to hear from you. 
                Reach out today and let us discuss how I can help you achieve your goals.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#B87333]/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#B87333]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D3D3D]/60">Phone</p>
                    <p className="text-lg text-[#3D3D3D] font-medium">(415) 555-0123</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#B87333]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#B87333]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D3D3D]/60">Email</p>
                    <p className="text-lg text-[#3D3D3D] font-medium">nigaar@aeg.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#B87333]/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#B87333]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#3D3D3D]/60">Office</p>
                    <p className="text-lg text-[#3D3D3D] font-medium">123 Market St, San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-[#B87333] rounded-full flex items-center justify-center hover:bg-[#A0632A] transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#B87333] rounded-full flex items-center justify-center hover:bg-[#A0632A] transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#B87333] rounded-full flex items-center justify-center hover:bg-[#A0632A] transition-colors">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-[#F5F0E8] border-[#C4A77D]/20">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" className="bg-white border-[#C4A77D]/30 focus:border-[#B87333]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" className="bg-white border-[#C4A77D]/30 focus:border-[#B87333]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" className="bg-white border-[#C4A77D]/30 focus:border-[#B87333]" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="(415) 555-0123" className="bg-white border-[#C4A77D]/30 focus:border-[#B87333]" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell me about your real estate goals..."
                        rows={4}
                        className="bg-white border-[#C4A77D]/30 focus:border-[#B87333]"
                      />
                    </div>

                    <Button className="w-full bg-[#B87333] hover:bg-[#A0632A] text-white py-6">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D3D3D] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-serif font-bold text-[#F5F0E8] mb-4">NZK Realtor</h3>
              <p className="text-[#F5F0E8]/70 mb-4 max-w-md">
                Your trusted partner in Bay Area real estate. Proudly affiliated with AEG, 
                delivering exceptional service and results since 2009.
              </p>
              <p className="text-[#C4A77D]">Proudly affiliated with AEG</p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#F5F0E8] mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["About", "Team", "Contact"].map((item) => (
                  <li key={item}>
                    <a 
                      href={`#${item.toLowerCase()}`}
                      className="text-[#F5F0E8]/70 hover:text-[#C4A77D] transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#F5F0E8] mb-4">Service Areas</h4>
              <ul className="space-y-2">
                <li className="text-[#F5F0E8]/70">San Francisco</li>
                <li className="text-[#F5F0E8]/70">Palo Alto</li>
                <li className="text-[#F5F0E8]/70">Mountain View</li>
                <li className="text-[#F5F0E8]/70">San Jose</li>
                <li className="text-[#F5F0E8]/70">Oakland & East Bay</li>
              </ul>
            </div>
          </div>

          <Separator className="bg-[#F5F0E8]/20" />

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#F5F0E8]/60 text-sm">
              © 2024 Nigaar Z. Khan. All rights reserved.
            </p>
            <p className="text-[#F5F0E8]/60 text-sm">
              Licensed California Real Estate Agent | DRE #01234567
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
