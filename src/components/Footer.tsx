import { MapPin, Phone, Mail } from 'lucide-react';
import GVFIITLogo from './GVFIITLogo';

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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);



export default function Footer() {
  return (
    <footer className="bg-black pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">



        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-12 border-t border-white/10">

          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <GVFIITLogo size={48} />
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              Premium fitness facility dedicated to strength, performance, and holistic recovery.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="https://www.instagram.com/iamgauravvaghela" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><InstagramIcon size={24} /></a>
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
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 mb-4">
                <MapPin size={20} className="shrink-0 text-accent mt-0.5" />
                <span>Ahmedabad, Gujarat</span>
              </li>
              
              <li className="text-xs font-bold uppercase tracking-widest text-white">Gaurav Sir</li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={16} className="shrink-0 text-accent" />
                <span className="text-sm">+91 97276 71212</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 pb-2">
                <Mail size={16} className="shrink-0 text-accent" />
                <span className="text-sm">gaurav2841992@gmail.com</span>
              </li>

              <li className="text-xs font-bold uppercase tracking-widest text-white pt-2 border-t border-white/10">Soham Sir</li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={16} className="shrink-0 text-accent" />
                <span className="text-sm">+91 86902 90393</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={16} className="shrink-0 text-accent" />
                <span className="text-sm">Goyalsoham19@gmail.com</span>
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
