import React, { useState } from 'react';
import { X, PenLine, Image as ImageIcon } from 'lucide-react';
import type { Article, Category } from '../types';

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateArticle: (newArticle: Article) => void;
}

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({
  isOpen,
  onClose,
  onCreateArticle,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Category>('TECH');
  const [subCategory, setSubCategory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('Tech, Innovation, Blog');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newArticle: Article = {
      id: `user-article-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      excerpt: excerpt.trim() || content.slice(0, 160) + '...',
      content: content.trim(),
      category,
      subCategory: subCategory.trim() || undefined,
      author: {
        name: authorName.trim() || 'Guest Contributor',
        role: 'Community Author',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
      date: new Date().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }),
      readTime: '3 MIN READ',
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
      claps: 12,
      commentsCount: 0,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    onCreateArticle(newArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-cyan-600" />
            <h2 className="font-bold text-slate-800 text-lg">
              Publish News or Blog Story
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Headline / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The Next Frontier in Clean Tech Innovation..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Subtitle / Deck
            </label>
            <input
              type="text"
              placeholder="e.g. 1,500 watts per GPU, roughly 100 American homes..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
              >
                <option value="TECH">TECH</option>
                <option value="LATEST NEWS">LATEST NEWS</option>
                <option value="HEALTH">HEALTH</option>
                <option value="TRAVEL">TRAVEL</option>
                <option value="SPORTS">SPORTS</option>
                <option value="OPINION">OPINION</option>
                <option value="BUSINESS">BUSINESS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Sub-Category (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. AI, Mobile, Gadgets"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Author Name
              </label>
              <input
                type="text"
                placeholder="Your Name / Pen Name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Image URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Short Summary / Excerpt
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview displayed on card previews..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Full Article Story *
            </label>
            <textarea
              rows={6}
              required
              placeholder="Write your article paragraphs here. Use ### for subheadings..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Technology, AI, CleanEnergy"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              Publish to EveryGyan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
