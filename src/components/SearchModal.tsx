import React, { useState } from 'react';
import { Search, X, Clock } from 'lucide-react';
import type { Article } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim()
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : articles.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 pt-20 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-100 p-4 flex items-center">
          <Search className="w-5 h-5 text-cyan-600 ml-2" />
          <input
            type="text"
            autoFocus
            placeholder="Search news, topics, authors, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-base text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          <div className="px-2 py-1 text-xs font-bold uppercase text-slate-400 tracking-wider">
            {query.trim() ? `Search Results (${filtered.length})` : 'Popular Articles'}
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No matching stories found for "{query}".
            </div>
          ) : (
            filtered.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-cyan-600 font-bold uppercase mb-0.5">
                    <span>{article.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400 font-normal flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {article.readTime}
                    </span>
                  </div>
                  <h4 className="font-serif-display font-bold text-sm text-slate-800 group-hover:text-cyan-700 line-clamp-1">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{article.excerpt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
