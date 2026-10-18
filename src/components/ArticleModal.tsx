import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  User,
  Bookmark,
  Share2,
  ThumbsUp,
  MessageSquare,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
} from 'lucide-react';
import type { Article, Comment } from '../types';
import { formatArticleDate, formatReadingTime } from '../utils/formatters';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleBookmark: (articleId: string) => void;
  isBookmarked: boolean;
  onAddComment: (articleId: string, commentText: string, authorName: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onToggleBookmark,
  isBookmarked,
  onAddComment,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [claps, setClaps] = useState<number>(article?.claps || 48);
  const [hasClapped, setHasClapped] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');

  if (!article) return null;

  const handleClap = () => {
    setClaps((prev) => prev + 1);
    setHasClapped(true);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(article.id, commentText.trim(), authorName.trim() || 'Reader');
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white text-slate-900 w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200/80">
        {/* Floating Top Reader Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#00adb5] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              {article.category}
            </span>
            {article.subCategory && (
              <span className="text-slate-500 text-xs font-semibold">
                / {article.subCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Save Story"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, text: article.excerpt, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }
              }}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors ml-2"
              title="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-10 lg:p-12 max-w-3xl mx-auto space-y-6">
          {/* Headline */}
          <h1 className="font-serif-display font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 leading-[1.18] tracking-tight">
            {article.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {article.subtitle && (
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed font-sans">
              {article.subtitle}
            </p>
          )}

          {/* Author & Publishing Meta Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-3">
              {article.author.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-500/20"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-bold text-slate-800 text-sm">{article.author.name}</p>
                <p className="text-xs text-slate-400">{article.author.role || 'Staff Writer'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                {formatArticleDate(article.date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                {formatReadingTime(article.readTime)}
              </span>
            </div>
          </div>

          {/* Audio Player Bar Simulation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-9 h-9 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm"
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isPlayingAudio ? 'Playing Audio Summary...' : 'Listen to this article'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Synthesized voice · 2 min 40 sec
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                AI Audio
              </span>
            </div>
          </div>

          {/* Featured Hero Media */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-md border border-slate-100 bg-slate-900">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Text Content */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg space-y-5 pt-2">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={index}
                    className="font-serif-display font-bold text-2xl text-slate-900 pt-4"
                  >
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('"') && paragraph.includes('"')) {
                return (
                  <blockquote
                    key={index}
                    className="border-l-4 border-cyan-500 pl-4 py-1 italic font-serif text-lg text-slate-800 bg-cyan-50/40 rounded-r-lg"
                  >
                    {paragraph}
                  </blockquote>
                );
              }
              return <p key={index}>{paragraph}</p>;
            })}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Interactive Claps / Engagement Bar */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClap}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  hasClapped
                    ? 'bg-rose-500 text-white scale-105 shadow-md'
                    : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-800'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{claps} Claps</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                <span>{article.comments?.length || 0} Comments</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>EveryGyan Original</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-6 space-y-6">
            <h3 className="font-serif-display font-bold text-2xl text-slate-900">
              Discussion ({article.comments?.length || 0})
            </h3>

            {/* Post comment form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                />
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Share your thoughts on this story..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute bottom-3 right-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </form>

            {/* Existing comments */}
            <div className="space-y-3 pt-2">
              {article.comments && article.comments.length > 0 ? (
                article.comments.map((comment: Comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800">
                          {comment.author}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 pl-8">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Be the first to leave a comment on this story.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
