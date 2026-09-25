import { motion } from 'framer-motion';
import About from '../components/About';
import Team from '../components/Team';
import Programs from '../components/Programs';
import Pricing from '../components/Pricing';
import Recovery from '../components/Recovery';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-heading font-black text-white uppercase tracking-tighter mb-6"
          >
            Train Hard.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">
              Recover Better.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 font-light mb-10 max-w-2xl mx-auto"
          >
            Strength, performance and recovery — built around you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-sm text-lg font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
              Join GV FIIT
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-sm text-lg font-bold uppercase tracking-widest transition-all">
              Book A Session
            </button>
          </motion.div>
        </div>
      </section>

      <About />
      <Team />
      <Programs />
      <Pricing />
      <Recovery />
      <Footer />
    </div>
  );
}
