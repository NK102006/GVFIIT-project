import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-black pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Instagram Section Placeholder */}
        <div className="mb-24 text-center">
          <h3 className="text-2xl font-heading font-bold text-white mb-2">LATEST FROM GV FIIT</h3>
          <p className="text-gray-400 mb-8">Follow @GVFIIT for updates, tips, and motivation.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square bg-zinc-900 border border-white/5 relative group cursor-pointer overflow-hidden rounded-sm">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 z-10">
                  <InstagramIcon size={32} className="text-white" />
                </div>
                <img 
                  src={`https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop&sig=${item}`} 
                  alt="Instagram Post" 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                />
              </div>
            ))}
          </div>
          
          <button className="border border-white/20 hover:border-accent hover:text-accent text-white px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-widest flex items-center gap-2 mx-auto transition-all">
            <InstagramIcon size={18} />
            Follow on Instagram
          </button>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-12 border-t border-white/10">
          
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-heading font-black tracking-tighter text-white mb-4">
              GV<span className="text-accent">FIIT</span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              Premium fitness facility dedicated to strength, performance, and holistic recovery.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-accent transition-colors"><InstagramIcon size={24} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-400 hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#programs" className="text-gray-400 hover:text-accent transition-colors">Programs</a></li>
              <li><a href="#membership" className="text-gray-400 hover:text-accent transition-colors">Memberships</a></li>
              <li><a href="#recovery" className="text-gray-400 hover:text-accent transition-colors">Recovery</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="shrink-0 text-accent mt-0.5" />
                <span>123 Elite Fitness Ave,<br/>Mumbai, MH 400001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={20} className="shrink-0 text-accent" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={20} className="shrink-0 text-accent" />
                <span>info@gvfiit.com</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="text-center pt-12 mt-12 border-t border-white/5 text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} GV FIIT. All rights reserved.
        </div>
        
      </div>
    </footer>
  );
}
