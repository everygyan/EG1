import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, PenSquare, Bookmark, ChevronRight } from 'lucide-react';
import type { Category } from '../types';
import { NAV_DROPDOWNS } from '../data/mockData';

interface NavbarProps {
  activeCategory: Category | 'ALL';
  onSelectCategory: (cat: Category | 'ALL', subCat?: string) => void;
  onOpenSearch: () => void;
  onOpenSubscribe: () => void;
  onOpenCreate: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenSubscribe,
  onOpenCreate,
  onOpenBookmarks,
  bookmarkCount,
}) => {
  const [hoveredNav, setHoveredNav] = useState<string | null>('TECH'); // Default open or active like in screenshot
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // keep hover interaction intuitive
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { label: string; cat: Category | 'ALL' }[] = [
    { label: 'LATEST NEWS', cat: 'LATEST NEWS' },
    { label: 'TECH', cat: 'TECH' },
    { label: 'HEALTH', cat: 'HEALTH' },
    { label: 'TRAVEL', cat: 'TRAVEL' },
    { label: 'SPORTS', cat: 'SPORTS' },
  ];

  return (
    <header className="bg-[#0e1628] text-white border-b border-slate-800/80 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between relative">
        {/* Brand Logo */}
        <div
          onClick={() => {
            onSelectCategory('ALL');
            setHoveredNav(null);
          }}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-full bg-[#00adb5] flex items-center justify-center shadow-md shadow-cyan-900/40 group-hover:scale-105 transition-transform">
            <span className="font-serif font-bold text-white text-xl leading-none">E</span>
          </div>
          <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            Every<span className="text-cyan-400">Gyan</span>
          </span>
        </div>

        {/* Center Nav Links with Dropdown Menu Trigger */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider relative" ref={dropdownRef}>
          {navItems.map((item) => {
            const isActive = activeCategory === item.cat;
            const isHovered = hoveredNav === item.cat;
            const hasDropdown = NAV_DROPDOWNS[item.cat];

            return (
              <div
                key={item.label}
                className="relative py-6"
                onMouseEnter={() => setHoveredNav(item.cat)}
                onMouseLeave={() => {
                  // Keep TECH open initially or close on leave
                  // We can close or allow keeping
                }}
              >
                <button
                  onClick={() => {
                    onSelectCategory(item.cat);
                    setHoveredNav(item.cat === hoveredNav ? null : item.cat);
                  }}
                  className={`cursor-pointer transition-colors uppercase tracking-wider relative py-1 ${
                    isActive || isHovered
                      ? 'text-cyan-400 font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* Active underline indicator */}
                  {(isActive || (hoveredNav === item.cat && item.cat === 'TECH')) && (
                    <span className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-cyan-400 rounded-full"></span>
                  )}
                </button>

                {/* Dropdown Menu Card (matches exact style in screenshot for TECH) */}
                {isHovered && hasDropdown && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-[#121c2e] border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-sm z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                    onMouseEnter={() => setHoveredNav(item.cat)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    {/* 2-column layout */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                      {/* Column 1 */}
                      <div className="space-y-2.5">
                        {hasDropdown.col1.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              onSelectCategory(item.cat, sub);
                              setHoveredNav(null);
                            }}
                            className="block text-left text-slate-300 hover:text-cyan-400 hover:translate-x-1 transition-all text-xs font-semibold py-1 w-full"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2.5">
                        {hasDropdown.col2.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              onSelectCategory(item.cat, sub);
                              setHoveredNav(null);
                            }}
                            className="block text-left text-slate-300 hover:text-cyan-400 hover:translate-x-1 transition-all text-xs font-semibold py-1 w-full"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-700/60 pt-3">
                      <button
                        onClick={() => {
                          onSelectCategory(hasDropdown.linkCat as Category);
                          setHoveredNav(null);
                        }}
                        className="text-[11px] font-bold tracking-wider text-cyan-400 hover:text-cyan-300 flex items-center justify-between w-full group/link uppercase"
                      >
                        <span>{hasDropdown.linkText}</span>
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            aria-label="Search Articles"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Bookmarks Counter */}
          <button
            onClick={onOpenBookmarks}
            aria-label="Saved Articles"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors relative cursor-pointer"
            title="Saved Articles"
          >
            <Bookmark className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {bookmarkCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
            </button>

            {/* Notifications drop menu */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#121c2e] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-2 mb-2 flex justify-between items-center">
                  <span>Notifications</span>
                  <span className="text-[10px] text-cyan-400">3 new</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="p-2 bg-slate-800/40 rounded hover:bg-slate-800 transition">
                    <p className="font-medium text-white">Breaking Tech Alert</p>
                    <p className="text-[11px] text-slate-400">AI accelerators energy demands hit new record.</p>
                  </div>
                  <div className="p-2 bg-slate-800/40 rounded hover:bg-slate-800 transition">
                    <p className="font-medium text-white">Trending in Sports</p>
                    <p className="text-[11px] text-slate-400">Faf du Plessis tactical masterclass published.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subscribe Pill Button (matches screenshot) */}
          <button
            onClick={onOpenSubscribe}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-sm hover:shadow-blue-900/50 transition-all cursor-pointer"
          >
            Subscribe
          </button>

          {/* Profile Pill Button (matches screenshot) */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-1.5 border border-slate-600 hover:border-slate-400 text-slate-200 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          {/* Write Blog Post CTA */}
          <button
            onClick={onOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hidden md:flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Write Blog Post"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
        </div>
      </div>
    </header>
  );
};
