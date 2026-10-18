import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { Article } from '../types';
import { formatArticleDate, formatReadingTime } from '../utils/formatters';

interface TrendingNowProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const TrendingNow: React.FC<TrendingNowProps> = ({ articles, onSelectArticle }) => {
  // Sort or take top 5 trending articles
  const trendingList = articles
    .filter((a) => a.isTrending || a.trendingRank)
    .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
    .slice(0, 5);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header matching screenshot: Line chart icon + "Trending Now" + Red live dot */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-500 stroke-[2.5]" />
          <h2 className="font-sans font-bold text-slate-900 text-base tracking-tight">
            Trending Now
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        </div>
      </div>

      {/* Ranked List 01 to 05 */}
      <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-between">
        {trendingList.map((article, index) => {
          const rankStr = String(article.trendingRank || index + 1).padStart(2, '0');

          return (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group py-3.5 flex items-start gap-3.5 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-all"
            >
              {/* Distinct Serif Number Counter (01, 02, etc.) */}
              <div className="flex-shrink-0 pt-0.5">
                <span className="font-serif font-black text-xl sm:text-2xl text-slate-300 group-hover:text-cyan-600 transition-colors select-none">
                  {rankStr}
                </span>
              </div>

              {/* Title and metadata */}
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="font-serif-display font-bold text-[13px] sm:text-[14px] leading-snug text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-slate-400">
                  <span>{formatArticleDate(article.date)}</span>
                  <span>•</span>
                  <span>{formatReadingTime(article.readTime)}</span>
                </div>
              </div>

              {/* Thumbnail Image */}
              <div className="flex-shrink-0 relative overflow-hidden rounded-xl w-14 h-14 sm:w-16 sm:h-16 shadow-xs border border-slate-100 bg-slate-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
