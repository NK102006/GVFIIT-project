import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const founder = {
  name: "Gaurav D Vaghela",
  role: "Founder & Head Coach",
  image: "/images/gaurav.jpg",
  bio: [
    "As an Ex-National player and certified ASCA Coach, Gaurav brings a unique blend of athletic excellence and strategic vision to his coaching. Holding a CMA and an MBA in Finance, his disciplined approach translates directly into his training methodologies.",
    "He is a BCCI Level 1 Umpire and the Promoter of the Pooja Institute of Sports Research and Development, an NGO based at Dharoi focused on advancing sports.",
    "A driven sports entrepreneur, Gaurav is the Founder of GV FIIT and the Co-founder of both DNA Sports and GNV Fitness Studio.",
    "\"Dreams become milestones when dedication meets opportunity. 🏆\"",
    "Proud and grateful to have been awarded 1st Prize in the Undergraduate Category – Industry Impact Challenge at the STESSA 2026 International Conference. A milestone to remember. A journey to continue."
  ],
  certs: ["ASCA Associate L2 Strength & Conditioning Coach"]
};

const coaches = [
  {
    name: "Soham Goyal",
    role: "Coach",
    image: "/images/soham.jpg",
    specialization: "Strength & Conditioning",
    experience: [
      "Professional Cricketer | Top-Order Batsman",
      "All-India University Cricketer & Softball Player",
      "Gujarat Cricket Association U-19 Probables",
      "Strength & Conditioning Coach — GV FIIT",
      "Head Strength & Conditioning Coach — Kickora Sports Academy",
      "Athlete Performance & Injury Prevention Specialist"
    ],
    certificates: [
      "ASCA Level 1 Coach"
    ],
    certLink: "/images/Soham_certificate_pages.png",
    certName: "ASCA Certificate"
  }
];

export default function Team() {
  const [selectedCoach, setSelectedCoach] = useState<typeof coaches[0] | null>(null);

  return (
    <section id="coaches" className="py-24" style={{ backgroundColor: '#F3EBDD' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#B89B5E' }}>Our Team</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-bold" style={{ color: '#1E2924' }}>
            TRAIN WITH THE BEST
          </h3>
        </div>

        {/* Founder Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-sm overflow-hidden mb-16"
          style={{ 
            backgroundColor: '#FAF7F0', 
            border: '1px solid rgba(49, 92, 74, 0.1)',
            boxShadow: '0 4px 20px rgba(30, 41, 36, 0.06)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-[400px] md:h-auto">
              <img src={founder.image} alt={founder.name} className="w-full h-full object-cover hover:scale-105 transition-all duration-500" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: '#B89B5E' }}>{founder.role}</div>
              <h4 className="text-3xl font-heading font-bold mb-4" style={{ color: '#1E2924' }}>{founder.name}</h4>
              <div className="mb-6 leading-relaxed space-y-4" style={{ color: '#4A5548' }}>
                {founder.bio.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">{paragraph}</p>
                ))}
              </div>
              <div className="mb-8">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#1E2924' }}>Certifications</div>
                <ul className="space-y-1">
                  {founder.certs.map((cert, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2" style={{ color: '#6F716A' }}>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#B89B5E' }} /> {cert}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <a
                  href="/images/asca-certificate.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
                  style={{ 
                    border: '1px solid rgba(49, 92, 74, 0.3)',
                    color: '#315C4A'
                  }}
                >
                  ASCA Certificate
                </a>
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
              className="group relative overflow-hidden rounded-sm aspect-[4/5]"
              style={{ backgroundColor: '#EDE5D4' }}
            >
              <img src={coach.image} alt={coach.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#B89B5E' }}>{coach.role}</div>
                <h4 className="text-2xl font-heading font-bold mb-2" style={{ color: '#FFFFFF' }}>{coach.name}</h4>
                <p className="text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ color: '#D1D5DB' }}>
                  Specialization: {coach.specialization}
                </p>
                <button 
                  onClick={() => setSelectedCoach(coach)}
                  className="opacity-0 group-hover:opacity-100 text-sm font-bold uppercase tracking-widest pb-1 transition-all duration-500 delay-200"
                  style={{ color: '#FFFFFF', borderBottom: '1px solid #B89B5E' }}
                >
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Coach Profile Modal */}
      <AnimatePresence>
        {selectedCoach && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCoach(null)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(30, 41, 36, 0.7)' }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
              style={{ 
                backgroundColor: '#FAF7F0', 
                border: '1px solid rgba(49, 92, 74, 0.15)' 
              }}
            >
              <button
                onClick={() => setSelectedCoach(null)}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors z-20"
                style={{ color: '#6F716A' }}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                <div className="sm:col-span-2 h-64 sm:h-full relative">
                  <img 
                    src={selectedCoach.image} 
                    alt={selectedCoach.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 sm:bg-gradient-to-r" style={{ background: 'linear-gradient(to top, #FAF7F0, transparent)' }} />
                </div>
                
                <div className="sm:col-span-3 p-6 sm:p-8 sm:pl-0 flex flex-col justify-center">
                  <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: '#B89B5E' }}>
                    {selectedCoach.role}
                  </div>
                  <h3 className="text-3xl font-heading font-bold mb-6" style={{ color: '#1E2924' }}>
                    {selectedCoach.name}
                  </h3>
                  
                  {selectedCoach.experience && selectedCoach.experience.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#1E2924' }}>Experience</h4>
                      <ul className="space-y-2">
                        {selectedCoach.experience.map((exp, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#4A5548' }}>
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#315C4A' }} /> 
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCoach.certificates && selectedCoach.certificates.length > 0 && (
                    <div className={selectedCoach.certLink ? "mb-6" : ""}>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#1E2924' }}>Certifications</h4>
                      <ul className="space-y-2">
                        {selectedCoach.certificates.map((cert, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#4A5548' }}>
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#B89B5E' }} /> 
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCoach.certLink && (
                    <div>
                      <a
                        href={selectedCoach.certLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
                        style={{ 
                          border: '1px solid rgba(49, 92, 74, 0.3)', 
                          color: '#315C4A' 
                        }}
                      >
                        {selectedCoach.certName || "View Certificate"}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
