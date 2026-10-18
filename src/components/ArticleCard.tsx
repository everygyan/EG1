import React from 'react';
import { Bookmark, Clock, MessageSquare, ThumbsUp } from 'lucide-react';
import type { Article } from '../types';
import { formatArticleDate, formatReadingTime } from '../utils/formatters';

interface ArticleCardProps {
  article: Article;
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (articleId: string) => void;
  isBookmarked: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
}) => {
  return (
    <article
      onClick={() => onSelectArticle(article)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-[#0e1628]/85 backdrop-blur-md text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
            {article.category}
          </span>
          {article.subCategory && (
            <span className="bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
              {article.subCategory}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(article.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors ${
            isBookmarked
              ? 'bg-cyan-500 text-white'
              : 'bg-black/30 hover:bg-black/60 text-white'
          }`}
          title="Save Article"
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-2">
            <span>{formatArticleDate(article.date)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatReadingTime(article.readTime)}
            </span>
          </div>

          <h3 className="font-serif-display font-bold text-lg text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug line-clamp-2 mb-2">
            {article.title}
          </h3>

          <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {article.author.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                {article.author.name[0]}
              </div>
            )}
            <span className="font-medium text-slate-700 text-[11px]">
              {article.author.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            {article.claps !== undefined && (
              <span className="flex items-center gap-1 hover:text-slate-600">
                <ThumbsUp className="w-3 h-3" />
                {article.claps}
              </span>
            )}
            {article.commentsCount !== undefined && (
              <span className="flex items-center gap-1 hover:text-slate-600">
                <MessageSquare className="w-3 h-3" />
                {article.commentsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
