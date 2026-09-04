import { motion } from 'framer-motion';

const founder = {
  name: "Gaurav Verma",
  role: "Founder & Head Coach",
  image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1974&auto=format&fit=crop",
  bio: "[Placeholder] With over a decade of experience in strength and conditioning, Gaurav founded GV FIIT to create a space where athletic performance meets premium recovery. He specializes in functional hypertrophy and sports-specific training.",
  certs: ["Certified Strength & Conditioning Specialist (CSCS)", "Precision Nutrition L1"]
};

const coaches = [
  {
    name: "Rahul Sharma",
    role: "Senior Performance Coach",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974&auto=format&fit=crop",
    specialization: "Olympic Weightlifting, Mobility"
  },
  {
    name: "Priya Desai",
    role: "Fitness Specialist",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    specialization: "HIIT, Functional Core"
  }
];

export default function Team() {
  return (
    <section id="coaches" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-2">Our Team</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-bold text-white">
            TRAIN WITH THE BEST
          </h3>
        </div>

        {/* Founder Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900 border border-white/5 rounded-sm overflow-hidden mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-[400px] md:h-auto">
              <img src={founder.image} alt={founder.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="text-accent text-sm font-bold uppercase tracking-widest mb-1">{founder.role}</div>
              <h4 className="text-3xl font-heading font-bold text-white mb-4">{founder.name}</h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {founder.bio}
              </p>
              <div className="mb-8">
                <div className="text-white text-sm font-semibold uppercase tracking-wider mb-2">Certifications</div>
                <ul className="space-y-1">
                  {founder.certs.map((cert, idx) => (
                    <li key={idx} className="text-gray-500 text-sm flex items-center gap-2">
                      <div className="w-1 h-1 bg-accent rounded-full" /> {cert}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button className="border border-white/20 hover:border-accent hover:text-accent text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {coaches.map((coach, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative overflow-hidden rounded-sm aspect-[4/5] bg-zinc-900"
            >
              <img src={coach.image} alt={coach.name} className="w-full h-full object-cover grayscale opacity-70 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="text-accent text-xs font-bold uppercase tracking-widest mb-1">{coach.role}</div>
                <h4 className="text-2xl font-heading font-bold text-white mb-2">{coach.name}</h4>
                <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  Specialization: {coach.specialization}
                </p>
                <button className="opacity-0 group-hover:opacity-100 text-white text-sm font-bold uppercase tracking-widest border-b border-accent pb-1 transition-all duration-500 delay-200 hover:text-accent">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
