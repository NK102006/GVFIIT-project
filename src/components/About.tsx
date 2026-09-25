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
              MORE THAN JUST A GYM. <br />A TRAINING PHILOSOPHY.
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
