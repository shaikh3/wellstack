import Hero from "./sections/Hero";
import About from "./sections/About";
import Testimonials from "./sections/Testimonials";
import Team from "./sections/Team";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import Navigation from "./sections/Navigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F5DC]">
      <Navigation />
      <Hero />
      <About />
      <Testimonials />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}
