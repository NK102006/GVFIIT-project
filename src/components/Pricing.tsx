import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "BASIC",
    duration: "1 Month",
    price: "₹XXXX",
    features: ["Access to gym floor", "1 InBody Assessment", "Locker access", "General gym program"],
    highlighted: false
  },
  {
    name: "STANDARD",
    duration: "3 Months",
    price: "₹XXXX",
    features: ["Access to gym floor", "3 InBody Assessments", "Locker access", "1 Group Class/week", "Nutrition Guidelines"],
    highlighted: true
  },
  {
    name: "PREMIUM",
    duration: "6 Months",
    price: "₹XXXX",
    features: ["Access to gym floor", "Unlimited InBody", "Priority Locker", "Unlimited Group Classes", "Custom Diet Plan", "2 Ice Bath Sessions"],
    highlighted: false
  }
];

export default function Pricing() {
  return (
    <section id="membership" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-2">Memberships</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-bold text-white">
            JOIN THE ELITE
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-zinc-900 rounded-sm border ${plan.highlighted ? 'border-accent shadow-[0_0_30px_rgba(170,59,255,0.15)]' : 'border-white/10'} p-8 flex flex-col`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-sm text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-8">
                <h4 className="text-xl font-heading font-bold text-white mb-2">{plan.name}</h4>
                <div className="text-sm text-gray-400 mb-6 uppercase tracking-wider">{plan.duration}</div>
                <div className="text-5xl font-black font-heading text-white">{plan.price}</div>
              </div>
              
              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check size={18} className="text-accent shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className={`w-full py-4 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${plan.highlighted ? 'bg-accent text-white hover:bg-accent/90' : 'bg-transparent border border-white/20 text-white hover:border-white'}`}>
                Join Now
              </button>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
