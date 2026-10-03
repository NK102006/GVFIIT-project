import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

const programs = [
  {
    name: "Group Training",
    description: "Small group sessions designed for maximum energy and results. Train 3 days a week under expert guidance.",
    details: "Our 3-day-a-week group training sessions are perfect for those who thrive in a community setting. You'll get expert coaching on form, intensity, and progression, while pushing alongside like-minded individuals.",
    benefits: ["Small group sizes for personal attention", "Structured 3-day split", "High-energy environment"],
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "One-to-One Sessions",
    description: "Personalized 1-2 hour coaching sessions tailored entirely to your specific goals, biomechanics, and fitness level.",
    details: "Experience the pinnacle of coaching. Every 1-2 hour session is designed specifically around your biomechanics, injury history, and goals. Perfect for those looking for rapid, highly focused progress.",
    benefits: ["100% personalized programming", "In-depth form correction", "Flexible scheduling"],
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Sports Specific Training",
    description: "Elite strength and conditioning programs to physically prepare and improve performance for athletes across a wide range of sports.",
    details: "Tailored for athletes looking to gain a competitive edge. Focuses on explosive power, agility, sport-specific energy systems, and injury prevention under elite ASCA Level 2 protocols.",
    benefits: ["Advanced athletic conditioning", "Sport-specific periodization", "Injury prevention strategies"],
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop",
  },
  {
    name: "Premium Recovery",
    description: "Accelerate your recovery, reduce inflammation, and optimize performance with our dedicated Ice Bath therapy sessions.",
    details: "Recovery is just as important as training. Our ice bath protocols help flush out metabolic waste, reduce delayed onset muscle soreness (DOMS), and prepare your body for the next intense session.",
    benefits: ["Reduced inflammation", "Faster muscle recovery", "Mental resilience building"],
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop",
  }
];

type Program = typeof programs[0];

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  return (
    <section id="programs" className="py-24" style={{ backgroundColor: '#EDE5D4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#B89B5E' }}>Our Programs</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold" style={{ color: '#1E2924' }}>
              ENGINEERED FOR RESULTS
            </h3>
          </div>
          <button className="hidden md:block pb-1 font-bold tracking-widest uppercase transition-colors" style={{ color: '#315C4A', borderBottom: '1px solid #315C4A' }}>
            View All Programs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-sm aspect-square sm:aspect-[4/3] lg:aspect-[16/9]"
              style={{ backgroundColor: '#EDE5D4' }}
            >
              <img src={program.image} alt={program.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                <h4 className="text-2xl font-heading font-bold mb-2 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500" style={{ color: '#FFFFFF' }}>{program.name}</h4>
                <p className="text-sm mb-6 opacity-100 lg:opacity-0 h-auto lg:h-0 lg:group-hover:h-auto lg:group-hover:opacity-100 transition-all duration-500 delay-100" style={{ color: '#D1D5DB' }}>
                  {program.description}
                </p>
                <div className="overflow-hidden">
                  <button 
                    onClick={() => setSelectedProgram(program)}
                    className="px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transform translate-y-0 lg:translate-y-[150%] lg:group-hover:translate-y-0 transition-transform duration-500 delay-200"
                    style={{ backgroundColor: '#315C4A', color: '#FAF7F0' }}
                  >
                    Explore Program
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <button className="pb-1 font-bold tracking-widest uppercase transition-colors" style={{ color: '#315C4A', borderBottom: '1px solid #315C4A' }}>
            View All Programs
          </button>
        </div>

      </div>

      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProgram(null)}
              className="absolute inset-0 backdrop-blur-sm cursor-pointer"
              style={{ backgroundColor: 'rgba(30, 41, 36, 0.7)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-sm overflow-hidden z-10"
              style={{ 
                backgroundColor: '#FAF7F0', 
                border: '1px solid rgba(49, 92, 74, 0.15)' 
              }}
            >
              <div className="h-64 md:h-80 relative">
                <img src={selectedProgram.image} alt={selectedProgram.name} className="w-full h-full object-cover object-top" />
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#FAF7F0] to-transparent pointer-events-none" />
                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                  style={{ backgroundColor: 'rgba(30, 41, 36, 0.5)', color: '#FFFFFF' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 md:p-8 relative -mt-16">
                <h4 className="text-3xl font-heading font-bold mb-4" style={{ color: '#1E2924' }}>{selectedProgram.name}</h4>
                <p className="leading-relaxed mb-6" style={{ color: '#4A5548' }}>
                  {selectedProgram.details}
                </p>
                <div className="space-y-3 mb-8">
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#1E2924' }}>Key Benefits</h5>
                  {selectedProgram.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm" style={{ color: '#4A5548' }}>
                      <CheckCircle size={16} className="shrink-0" style={{ color: '#315C4A' }} />
                      {benefit}
                    </div>
                  ))}
                </div>
                <a 
                  href="#membership" 
                  onClick={() => setSelectedProgram(null)}
                  className="inline-block w-full text-center py-4 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: '#315C4A', color: '#FAF7F0' }}
                >
                  Join This Program
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
