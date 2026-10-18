import React from 'react';
import { Lock } from 'lucide-react';
import type { Category } from '../types';


interface FooterProps {
  onSelectCategory: (cat: Category | 'ALL') => void;
  onOpenSubscribe: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenSubscribe }) => {
  return (
    <footer className="bg-[#0b101b] text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00adb5] flex items-center justify-center shadow-md">
                <span className="font-serif font-bold text-white text-xl">E</span>
              </div>
              <span className="font-sans font-bold text-2xl tracking-tight text-white">
                Every<span className="text-cyan-400">Gyan</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              EveryGyan is an independent digital news and longform publishing platform delivering critical investigative reporting, technology breakthroughs, wellness essays, and cultural perspectives.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenSubscribe}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition"
              >
                Join 140,000+ Readers
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
              Sections
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory('LATEST NEWS')}
                  className="hover:text-cyan-400 transition"
                >
                  Latest News
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('TECH')}
                  className="hover:text-cyan-400 transition"
                >
                  Technology & AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('HEALTH')}
                  className="hover:text-cyan-400 transition"
                >
                  Health & Longevity
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('TRAVEL')}
                  className="hover:text-cyan-400 transition"
                >
                  Travel & Culture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('SPORTS')}
                  className="hover:text-cyan-400 transition"
                >
                  Sports Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('OPINION')}
                  className="hover:text-cyan-400 transition"
                >
                  Opinion & Essays
                </button>
              </li>
            </ul>
          </div>

          {/* Editorial & Company */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
              Editorial
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="hover:text-cyan-400 transition cursor-pointer">About EveryGyan</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Masthead & Ethics</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Fact-Checking Policy</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Corrections & Redactions</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Press & Syndication</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Careers</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
              Connect & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="hover:text-cyan-400 transition cursor-pointer">Privacy Charter</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Terms of Service</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Do Not Sell My Info</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">RSS Feeds</li>
              <li className="hover:text-cyan-400 transition cursor-pointer">Contact Newsroom</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} EveryGyan Media Group. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <a
              href="admin/login.html"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition"
              title="Author Dashboard Login"
            >
              <Lock className="w-3 h-3" />
              <span>Author Dashboard</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Twitter / X</span>
            <span className="hover:text-slate-300 cursor-pointer">LinkedIn</span>
            <span className="hover:text-slate-300 cursor-pointer">YouTube</span>
            <span className="hover:text-slate-300 cursor-pointer">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
