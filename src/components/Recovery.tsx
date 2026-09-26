import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Recovery() {
  const [realSlots, setRealSlots] = useState<{startTime: string, fee: number}[]>([]);

  useEffect(() => {
    if (!db?.app) return;
    getDocs(query(collection(db, 'iceBathSlots'), limit(3)))
      .then(snap => {
        const slots = snap.docs.map(d => d.data() as {startTime: string, fee: number});
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setRealSlots(slots);
      })
      .catch(console.error);
  }, []);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  return (
    <section id="recovery" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-black border border-white/5 rounded-sm overflow-hidden flex flex-col lg:flex-row">

          <div className="lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-2">Ice Bath</h2>
              <h3 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                RECOVER LIKE AN ATHLETE
              </h3>

              <p className="text-gray-400 mb-8 leading-relaxed">
                Reduce inflammation, accelerate muscle recovery, and build mental resilience with our premium ice bath sessions. Essential for serious athletes and regular gym-goers alike.
              </p>

              <div className="bg-zinc-900 border border-white/10 p-6 rounded-sm mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-white font-bold font-heading text-lg">15 Minute Recovery Session</div>
                  <div className="text-accent font-black text-xl">₹500</div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Available Sessions</div>

                  {realSlots.length > 0 ? (
                    realSlots.map((slot, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-gray-300 font-mono">{formatTime(slot.startTime)}</span>
                        <span className="text-green-500 text-sm font-bold uppercase tracking-wider">Available</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-mono text-sm">No sessions scheduled</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/dashboard/ice-bath"
                className="inline-block text-center bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
              >
                Book Ice Bath
              </Link>
            </motion.div>
          </div>

          <div className="lg:w-1/2 min-h-[400px] flex items-center justify-center p-4 lg:p-0">
            <img 
              src="/images/Icebath.png" 
              alt="Ice Bath Recovery" 
              className="w-full h-full object-contain object-right"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
