import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ConnieSection from "@/components/ConnieSection";
import HowItWorks from "@/components/HowItWorks";
import AdminPreview from "@/components/AdminPreview";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <ConnieSection />
      <HowItWorks />
      <AdminPreview />
      <CtaFinal />
      <Footer />
    </main>
  );
}