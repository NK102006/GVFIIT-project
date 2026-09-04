import { motion } from 'framer-motion';

export default function Recovery() {
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
                  <div className="text-accent font-black text-xl">₹XXX</div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Available Sessions</div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-mono">05:00 PM</span>
                    <span className="text-green-500 text-sm font-bold uppercase tracking-wider">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-mono">06:00 PM</span>
                    <span className="text-gray-600 text-sm font-bold uppercase tracking-wider">Booked</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-mono">07:00 PM</span>
                    <span className="text-green-500 text-sm font-bold uppercase tracking-wider">Available</span>
                  </div>
                </div>
              </div>
              
              <button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 w-full md:w-auto">
                Book Ice Bath
              </button>
            </motion.div>
          </div>
          
          <div className="lg:w-1/2 min-h-[400px] relative">
            <img 
              src="https://images.unsplash.com/photo-1519750058479-70fb98a0eb1b?q=80&w=2074&auto=format&fit=crop" 
              alt="Ice Bath Recovery" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:hidden" />
          </div>
          
        </div>
        
      </div>
    </section>
  );
}
