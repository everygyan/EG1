import { useState, useEffect } from 'react';
import type { Category, Article } from './types';

import { INITIAL_ARTICLES } from './data/mockData';
import { BreakingBar } from './components/BreakingBar';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { TrendingNow } from './components/TrendingNow';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import { CreateArticleModal } from './components/CreateArticleModal';
import { SearchModal } from './components/SearchModal';
import { SubscribeModal } from './components/SubscribeModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { Footer } from './components/Footer';
import { Sparkles, Compass, Flame, PenTool, Mail, ArrowRight } from 'lucide-react';

export function App() {
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('everygyan_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('everygyan_bookmarks');
    return saved ? JSON.parse(saved) : ['trend-01', 'hero-ai-chip'];
  });

  useEffect(() => {
    localStorage.setItem('everygyan_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('everygyan_articles', JSON.stringify(articles));
  }, [articles]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  const handleSelectHeadline = (headlineText: string) => {
    const found = articles.find((a) =>
      a.title.toLowerCase().includes(headlineText.toLowerCase().slice(0, 20))
    );
    if (found) {
      setSelectedArticle(found);
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleSelectCategory = (cat: Category | 'ALL', subCat?: string) => {
    setActiveCategory(cat);
    setActiveSubCategory(subCat);
    setSelectedTag(null);
  };

  const handleCreateArticle = (newArticle: Article) => {
    setArticles((prev) => [newArticle, ...prev]);
    setSelectedArticle(newArticle);
  };

  const handleAddComment = (articleId: string, commentText: string, authorName: string) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const newComments = [
            ...(art.comments || []),
            {
              id: `comment-${Date.now()}`,
              author: authorName,
              avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=120&q=80`,
              timestamp: 'Just now',
              content: commentText,
              likes: 0,
            },
          ];
          return {
            ...art,
            commentsCount: newComments.length,
            comments: newComments,
          };
        }
        return art;
      })
    );

    // Also update selectedArticle if currently viewed
    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle((prev) =>
        prev
          ? {
              ...prev,
              comments: [
                ...(prev.comments || []),
                {
                  id: `comment-${Date.now()}`,
                  author: authorName,
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                  timestamp: 'Just now',
                  content: commentText,
                  likes: 0,
                },
              ],
            }
          : null
      );
    }
  };

  // Filtered stories for magazine grid
  const filteredArticles = articles.filter((a) => {
    if (activeCategory !== 'ALL' && a.category !== activeCategory) {
      return false;
    }
    if (activeSubCategory && a.subCategory?.toLowerCase() !== activeSubCategory.toLowerCase()) {
      return false;
    }
    if (selectedTag && !a.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
      return false;
    }
    return true;
  });

  const heroArticles = articles.filter((a) => a.isTopStory);
  const bookmarkedArticles = articles.filter((a) => bookmarkedIds.includes(a.id));

  // Extract all unique tags
  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags))
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Breaking News Ticker Bar (matches screenshot) */}
      <BreakingBar onSelectHeadline={handleSelectHeadline} />

      {/* 2. Main Navigation Header (matches screenshot with TECH dropdown & search/subscribe/profile) */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarkCount={bookmarkedIds.length}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-12">
        {/* 3. Hero & Trending Section (Exact Layout from Screenshot) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Top Story Carousel Slider (~65% width) */}
          <div className="lg:col-span-8 flex flex-col">
            <HeroSlider
              articles={heroArticles}
              onSelectArticle={(art) => setSelectedArticle(art)}
              onToggleBookmark={toggleBookmark}
              isBookmarked={isBookmarked}
            />
          </div>

          {/* Right Column: Trending Now 01-05 Widget (~35% width) */}
          <div className="lg:col-span-4 flex flex-col">
            <TrendingNow
              articles={articles}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />
          </div>
        </section>

        {/* 4. Section Filter Tabs & Topics Bar */}
        <section className="pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => handleSelectCategory('ALL')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'ALL' && !activeSubCategory && !selectedTag
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Stories
              </button>
              {(['TECH', 'LATEST NEWS', 'HEALTH', 'TRAVEL', 'SPORTS', 'OPINION'] as Category[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#00adb5] text-white shadow-md shadow-cyan-900/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Quick Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Topics:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Magazine Feed Grid (News cum Blog) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-cyan-600" />
              <h2 className="font-serif-display font-bold text-2xl text-slate-900">
                {activeSubCategory
                  ? `${activeCategory} / ${activeSubCategory}`
                  : activeCategory === 'ALL'
                  ? 'Latest Dispatches & Analysis'
                  : `${activeCategory} Stories`}
              </h2>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1.5 cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Contribute a Story</span>
            </button>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <p className="text-slate-500 text-base">
                No stories found for this specific filter.
              </p>
              <button
                onClick={() => handleSelectCategory('ALL')}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onSelectArticle={(art) => setSelectedArticle(art)}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={isBookmarked(article.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 6. Editorial Feature Banner / Deep Dive Showcase */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d1424] to-[#1a2b4a] text-white p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
          </div>
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EVERYGYAN INVESTIGATIONS</span>
            </div>
            <h2 className="font-serif-display font-extrabold text-2xl sm:text-4xl leading-tight">
              Independent Journalism Powered by Reader Support
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We never run sponsored clickbait or programmatic ad trackers. Our longform investigations are made possible through subscribers and community contributors.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Subscribe to Newsletter</span>
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl backdrop-blur transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Write on EveryGyan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
      />

      {/* 8. Modals & Drawers */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onToggleBookmark={toggleBookmark}
        isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : false}
        onAddComment={handleAddComment}
      />

      <CreateArticleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateArticle={handleCreateArticle}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={(art) => setSelectedArticle(art)}
      />

      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedArticles={bookmarkedArticles}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onRemoveBookmark={toggleBookmark}
      />
    </div>
  );
}

export default App;
