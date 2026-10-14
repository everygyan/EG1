import React from 'react';
import { X, Bookmark, Trash2 } from 'lucide-react';
import type { Article } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (articleId: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedArticles,
  onSelectArticle,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-600 fill-current" />
            <h2 className="font-bold text-slate-800 text-lg">
              Saved Stories ({bookmarkedArticles.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedArticles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bookmark className="w-12 h-12 stroke-[1.5] text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">No saved stories yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any card or top story to save it for reading later.
              </p>
            </div>
          ) : (
            bookmarkedArticles.map((article) => (
              <div
                key={article.id}
                className="group relative flex gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-cyan-300 transition"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                >
                  <span className="text-[10px] font-bold text-cyan-600 uppercase">
                    {article.category}
                  </span>
                  <h4 className="font-serif-display font-bold text-xs text-slate-800 group-hover:text-cyan-700 line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {article.date} · {article.readTime}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(article.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition self-start"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
