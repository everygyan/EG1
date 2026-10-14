import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, Calendar, Bookmark, Share2 } from 'lucide-react';
import type { Article } from '../types';

interface HeroSliderProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  articles,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate slides every 8s
  useEffect(() => {
    if (articles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [articles.length]);

  if (!articles || articles.length === 0) return null;

  const current = articles[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800/80 aspect-[16/11] md:aspect-[16/10] lg:aspect-[16/9.5] flex flex-col justify-end p-6 sm:p-10 cursor-pointer select-none transition-all">
      {/* Background Image with Dark Cinematic Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.1] scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
        />
        {/* Editorial Gradients to match screenshot mood */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/75 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d16]/90 via-[#090d16]/40 to-transparent"></div>
      </div>

      {/* Top badges & Quick Actions */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#2563eb] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
            TOP STORY
          </span>
          <span className="bg-[#1e40af]/80 backdrop-blur-md text-cyan-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-cyan-500/30">
            {current.category}
          </span>
        </div>

        {/* Bookmark & Share buttons */}
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(current.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isBookmarked(current.id)
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-black/40 hover:bg-black/70 text-slate-200 border border-white/20'
            }`}
            title="Bookmark"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({ title: current.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Article link copied to clipboard!');
              }
            }}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-slate-200 border border-white/20 backdrop-blur-md transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left and Right Nav Buttons (styled matching screenshot circular translucent buttons) */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer opacity-80 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer opacity-80 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Content Area */}
      <div
        className="relative z-10 max-w-3xl space-y-3.5 mt-auto"
        onClick={() => onSelectArticle(current)}
      >
        {/* Big Editorial Serif Headline */}
        <h1 className="font-serif-display font-extrabold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight drop-shadow-md group-hover:text-cyan-100 transition-colors">
          {current.title}
        </h1>

        {/* Subtitle / Excerpt */}
        {current.subtitle && (
          <p className="text-slate-300 text-sm sm:text-base font-normal line-clamp-2 drop-shadow">
            {current.subtitle}
          </p>
        )}

        {/* Metadata Row (matches screenshot: STAFF, 3 MIN READ, 6/18/2026) */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-2 tracking-wide">
          <div className="flex items-center gap-1.5 uppercase">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{current.author.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{current.readTime}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{current.date}</span>
          </div>
        </div>

        {/* Pagination Indicator Bars (matches screenshot dashes: active bright cyan, others muted) */}
        <div className="flex items-center gap-2 pt-4">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-9 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                  : 'w-4 bg-slate-600/70 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
