import { motion } from 'framer-motion';

const stats = [
  { label: 'Years Experience', value: '10+' },
  { label: 'Members', value: '500+' },
  { label: 'Training Programs', value: '10+' },
  { label: 'Expert Coaches', value: '5+' },
];

export default function About() {
  return (
    <section 
      id="about" 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: '#1B4332' }}
    >
      {/* Background accent glow */}
      <div className="absolute top-0 right-0 w-1/2 h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(111, 143, 104, 0.12)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#B89B5E' }}>About GV FIIT</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold mb-6" style={{ color: '#FAF7F0' }}>
              MORE THAN JUST A GYM. <br />A TRAINING PHILOSOPHY.
            </h3>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.7)' }}>
              At GV FIIT, we believe in a holistic approach to fitness. Our facility is designed for those who are serious about their progress, combining elite strength training equipment with state-of-the-art recovery tools.
            </p>
            <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.7)' }}>
              Whether you are an athlete looking to improve performance or someone beginning their fitness journey, our expert coaches provide the guidance, programming, and environment you need to succeed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="pl-4" style={{ borderLeft: '2px solid #B89B5E' }}>
                  <div className="text-4xl font-heading font-bold mb-1" style={{ color: '#FAF7F0' }}>{stat.value}</div>
                  <div className="text-sm uppercase tracking-wider font-semibold" style={{ color: 'rgba(250, 247, 240, 0.5)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <img 
              src="/images/About_section.png" 
              alt="About GV FIIT" 
              className="w-full h-auto rounded-sm shadow-2xl"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
