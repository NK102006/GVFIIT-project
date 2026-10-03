import { motion } from 'framer-motion';

const stats = [
  { label: 'Years Experience', value: '8+' },
  { label: 'Global Clients', value: '500+', subtext: 'Ahmedabad, USA, Canada, UK & Australia' },
  { label: 'Training Programs', value: '5+' },
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
              MORE THAN JUST A GYM. <br />A TRAINING SYSTEM BUILT AROUND YOU.
            </h3>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.7)' }}>
              At GV FIIT, we believe great training begins with understanding the individual. Every person comes with different goals, abilities, experience, and needs—and their training should reflect that.
            </p>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.7)' }}>
              Our approach combines strength &amp; conditioning, athletic performance, fitness, injury prevention, movement development, recovery, and individualized programming to create a training experience designed around each client.
            </p>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.7)' }}>
              Whether you're a competitive athlete preparing for your next level, an individual looking to improve your fitness, or someone beginning their training journey, our coaches work with you to understand your goals and build the right path forward.
            </p>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.7)' }}>
              With ASCA-accredited coaches, experience working with district, state, and national-level athletes across multiple sports, comprehensive assessments, structured training plans, and recovery facilities including ice baths, GV FIIT brings performance-focused coaching to everyone.
            </p>

            <div className="mb-10 flex flex-wrap gap-2">
              {[
                "Sports specific training",
                "Functional training",
                "Cross fit",
                "Fat loss",
                "Holistic lifestyle plans",
                "Customised plans",
                "Conditioning plans"
              ].map((program, idx) => (
                <span key={idx} className="px-4 py-2 rounded-sm text-sm font-semibold" style={{ backgroundColor: 'rgba(184, 155, 94, 0.1)', color: '#B89B5E', border: '1px solid rgba(184, 155, 94, 0.3)' }}>
                  {program}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="pl-4" style={{ borderLeft: '2px solid #B89B5E' }}>
                  <div className="text-4xl font-heading font-bold mb-1" style={{ color: '#FAF7F0' }}>{stat.value}</div>
                  <div className="text-sm uppercase tracking-wider font-semibold" style={{ color: 'rgba(250, 247, 240, 0.5)' }}>{stat.label}</div>
                  {stat.subtext && <div className="text-xs mt-1" style={{ color: 'rgba(250, 247, 240, 0.4)' }}>{stat.subtext}</div>}
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
