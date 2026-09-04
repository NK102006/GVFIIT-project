import { motion } from 'framer-motion';

const stats = [
  { label: 'Years Experience', value: '10+' },
  { label: 'Members', value: '500+' },
  { label: 'Training Programs', value: '10+' },
  { label: 'Expert Coaches', value: '5+' },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-2">About GV FIIT</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              MORE THAN JUST A GYM. <br/>A TRAINING PHILOSOPHY.
            </h3>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              At GV FIIT, we believe in a holistic approach to fitness. Our facility is designed for those who are serious about their progress, combining elite strength training equipment with state-of-the-art recovery tools.
            </p>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Whether you are an athlete looking to improve performance or someone beginning their fitness journey, our expert coaches provide the guidance, programming, and environment you need to succeed.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="border-l-2 border-accent pl-4">
                  <div className="text-4xl font-heading font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-sm overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
                alt="GV FIIT Facility" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-8 -left-8 bg-zinc-900 p-6 rounded-sm border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold font-heading text-xl">Elite Facility</div>
                  <div className="text-gray-400 text-sm">Premium Equipment</div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
