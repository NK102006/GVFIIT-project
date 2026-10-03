import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: "GROUP TRAINING",
    duration: "3 Months (36 Sessions)",
    price: "₹18500",
    features: [
      "12 sessions a month (36 in a quarter)",
      "Group of not more than 4 in a batch",
      "Personalised plans",
      "No make up sessions",
      "No extensions of plan",
      "One nutrition consultation",
      "One recovery session"
    ],
    highlighted: false
  },
  {
    name: "ONE TO ONE SESSIONS",
    duration: "1 Month (12 Sessions)",
    price: "₹18000",
    features: [
      "12 sessions a month",
      "One to one session",
      "Personalised plan",
      "No make up sessions",
      "No extension in plan",
      "One nutrition consultation",
      "One recovery session"
    ],
    highlighted: true
  },
  {
    name: "HALF YEARLY PACKAGE",
    duration: "6 Months (72 Sessions)",
    price: "₹35000",
    features: [
      "72 sessions in 6 months",
      "+1 month extension (if unable to finish)",
      "Group of not more than 4 in a batch",
      "Personalised plan",
      "No make up sessions",
      "2 nutrition consultations",
      "2 recovery sessions"
    ],
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
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-sm text-xs font-bold uppercase tracking-widest"
                  style={{ backgroundColor: '#FAF7F0', color: '#315C4A', border: '1px solid #315C4A' }}
                >
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

              <Link 
                to="/join"
                className={`block w-full py-4 text-center rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${plan.highlighted ? 'bg-accent text-white hover:bg-accent/90' : 'bg-transparent border border-white/20 text-white hover:border-white'}`}
              >
                Join Now
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
