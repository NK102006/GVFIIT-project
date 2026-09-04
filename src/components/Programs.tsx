import { motion } from 'framer-motion';

const programs = [
  {
    name: "Strength Training",
    description: "Build strength, improve performance and develop functional fitness with our periodized lifting programs.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Weight Loss",
    description: "A combination of high-intensity intervals and metabolic conditioning to maximize fat loss.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Hypertrophy",
    description: "Dedicated muscle building programs focusing on time-under-tension and progressive overload.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Functional Fitness",
    description: "Improve your everyday movement patterns, mobility, and core stability.",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop",
  }
];

export default function Programs() {
  return (
    <section id="programs" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-2">Our Programs</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-white">
              ENGINEERED FOR RESULTS
            </h3>
          </div>
          <button className="hidden md:block border-b border-accent text-white hover:text-accent pb-1 font-bold tracking-widest uppercase transition-colors">
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
              className="group relative overflow-hidden rounded-sm aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] bg-zinc-900"
            >
              <img src={program.image} alt={program.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h4 className="text-2xl font-heading font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{program.name}</h4>
                <p className="text-gray-300 text-sm mb-6 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 delay-100">
                  {program.description}
                </p>
                <div className="overflow-hidden">
                  <button className="bg-accent text-white px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transform translate-y-[150%] group-hover:translate-y-0 transition-transform duration-500 delay-200">
                    Explore Program
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <button className="border-b border-accent text-white hover:text-accent pb-1 font-bold tracking-widest uppercase transition-colors">
            View All Programs
          </button>
        </div>

      </div>
    </section>
  );
}
