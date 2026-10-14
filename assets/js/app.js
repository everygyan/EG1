/**
 * Everygyan - Main Frontend Application Logic
 * Supports Theme Switcher, Mobile Navigation, API Integration, and Dynamic Article Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initHeroCarousel();
    initScrollAnimations();
    initNewsletterForms();
    initPageContent();
    renderLucideIcons();
});

/* --------------------------------------------------------------------------
   1. Lucide Icons Helper
   -------------------------------------------------------------------------- */
function renderLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

/* --------------------------------------------------------------------------
   2. Theme Switcher (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            renderLucideIcons();
        });
    }
}

/* --------------------------------------------------------------------------
   3. Navbar Scroll & Mobile Drawer
   -------------------------------------------------------------------------- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Add shadow on scroll
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile nav toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // Dropdown toggle on mobile
        navLinks.querySelectorAll('.nav-link-parent').forEach(parent => {
            parent.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const dropdown = parent.closest('.nav-item-dropdown');
                    if (dropdown) {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                    }
                }
            });
        });

        // Close on link click (only standard links or dropdown items)
        navLinks.querySelectorAll('a:not(.nav-link-parent)').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // Active nav link highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
                link.classList.add('active');
                const parentDropdown = link.closest('.nav-item-dropdown');
                if (parentDropdown) {
                    const parentLink = parentDropdown.querySelector('.nav-link-parent');
                    if (parentLink) parentLink.classList.add('active');
                }
            }
        });
    }
}

/* --------------------------------------------------------------------------
   4. Scroll Animations
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    } else {
        elements.forEach(el => el.classList.add('visible'));
    }
}

/* --------------------------------------------------------------------------
   5. Toast Notification System
   -------------------------------------------------------------------------- */
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info');

    toast.innerHTML = `
        <i data-lucide="${iconName}" style="color:var(--${type === 'error' ? 'danger' : type})"></i>
        <span>${escapeHtml(message)}</span>
        <button class="btn-icon toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);
    renderLucideIcons();

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

/* --------------------------------------------------------------------------
   6. Newsletter Submissions
   -------------------------------------------------------------------------- */
function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form, #footerNewsletter').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                showToast('🎉 Thank you for subscribing! Check your inbox soon.', 'success');
                form.reset();
            }
        });
    });
}

/* --------------------------------------------------------------------------
   7. Page Content Initialization & Routing
   -------------------------------------------------------------------------- */
function initPageContent() {
    const pathname = window.location.pathname;
    const page = pathname.split('/').pop() || 'index.html';

    if (page === 'index.html' || page === '') {
        loadHomepageData();
    } else if (page === 'blog.html') {
        loadListingData('blog');
    } else if (page === 'travel.html') {
        loadListingData('travel');
    } else if (page === 'learning.html') {
        loadListingData('learning');
    } else if (page === 'article.html') {
        loadSingleArticle();
    }
}

/* --------------------------------------------------------------------------
   8. Article Card Template Generator
   -------------------------------------------------------------------------- */
function renderArticleCard(article) {
    const categorySlug = (article.category_slug || (article.category && article.category.slug) || 'blog').toLowerCase();
    const categoryName = article.category_name || (article.category && article.category.name) || 'Blog';
    const coverImage = article.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
    const dateStr = formatDate(article.published_at || article.created_at);
    const readingTime = article.reading_time || Math.max(3, Math.ceil((article.content || '').split(/\s+/).length / 200));

    return `
    <article class="card animate-on-scroll">
        <div class="card-img">
            <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(article.title)}" loading="lazy">
            <div class="card-img-overlay"></div>
        </div>
        <div class="card-body">
            <span class="card-category ${escapeHtml(categorySlug)}">${escapeHtml(categoryName)}</span>
            <h3 class="card-title">
                <a href="article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a>
            </h3>
            <p class="card-excerpt">${escapeHtml(article.excerpt || '')}</p>
            <div class="card-meta">
                <div class="card-meta-left">
                    <span class="card-meta-item">
                        <i data-lucide="calendar"></i> ${dateStr}
                    </span>
                </div>
                <div class="card-meta-right">
                    <span class="card-meta-item">
                        <i data-lucide="clock"></i> ${readingTime} min read
                    </span>
                </div>
            </div>
        </div>
    </article>
    `;
}

/* --------------------------------------------------------------------------
   8B. Hero Magazine Featured Carousel Controller
   -------------------------------------------------------------------------- */
let heroCarouselTimer = null;

function initHeroCarousel() {
    const track = document.getElementById('heroCarouselTrack');
    const container = document.getElementById('heroFeaturedCarousel');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const dotsContainer = document.getElementById('heroCarouselDots');

    if (!track || !container) return;

    let slides = track.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;

    function updateSlide(index) {
        slides = track.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        currentIndex = index;

        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });

        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
    }

    function startAutoPlay() {
        stopAutoPlay();
        heroCarouselTimer = setInterval(() => {
            updateSlide(currentIndex + 1);
        }, 5500);
    }

    function stopAutoPlay() {
        if (heroCarouselTimer) {
            clearInterval(heroCarouselTimer);
            heroCarouselTimer = null;
        }
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            updateSlide(currentIndex - 1);
            startAutoPlay();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            updateSlide(currentIndex + 1);
            startAutoPlay();
        };
    }

    if (dotsContainer) {
        dotsContainer.onclick = (e) => {
            const dot = e.target.closest('.carousel-dot');
            if (dot && dot.dataset.index !== undefined) {
                updateSlide(parseInt(dot.dataset.index, 10));
                startAutoPlay();
            }
        };
    }

    container.onmouseenter = stopAutoPlay;
    container.onmouseleave = startAutoPlay;

    // Mobile Touch Swipe Handling
    let touchStartX = 0;
    container.ontouchstart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    };

    container.ontouchend = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                updateSlide(currentIndex + 1);
            } else {
                updateSlide(currentIndex - 1);
            }
        }
        startAutoPlay();
    };

    startAutoPlay();
}

/* --------------------------------------------------------------------------
   9. Homepage Loader
   -------------------------------------------------------------------------- */
async function loadHomepageData() {
    initHeroCarousel();

    if (typeof API === 'undefined') return;

    try {
        const response = await API.getArticles({ limit: 10, status: 'published' });
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            const articles = response.data;

            // 1. Featured Carousel (articles marked featured, or top 3)
            const featured = articles.filter(a => a.featured == 1 || a.is_featured);
            const carouselArticles = featured.length >= 2 ? featured.slice(0, 4) : articles.slice(0, 3);
            
            const track = document.getElementById('heroCarouselTrack');
            const dots = document.getElementById('heroCarouselDots');
            if (track && carouselArticles.length > 0) {
                track.innerHTML = carouselArticles.map((article, idx) => {
                    const categorySlug = (article.category_slug || (article.category && article.category.slug) || 'blog').toLowerCase();
                    const categoryName = article.category_name || (article.category && article.category.name) || 'Blog';
                    const cover = article.cover_image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200';
                    const dateStr = formatDate(article.published_at || article.created_at);
                    const readTime = article.reading_time || Math.max(3, Math.ceil((article.content || '').split(/\s+/).length / 200));

                    return `
                    <div class="hero-slide ${idx === 0 ? 'active' : ''}">
                      <div class="hero-slide-bg">
                        <img src="${escapeHtml(cover)}" alt="${escapeHtml(article.title)}" loading="${idx === 0 ? 'eager' : 'lazy'}">
                        <div class="hero-slide-overlay"></div>
                      </div>
                      <div class="hero-slide-content">
                        <span class="card-category ${escapeHtml(categorySlug)}">${escapeHtml(categoryName)}</span>
                        <h2 class="hero-slide-title">
                          <a href="article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a>
                        </h2>
                        <p class="hero-slide-excerpt">${escapeHtml(article.excerpt || '')}</p>
                        <div class="hero-slide-meta">
                          <div class="slide-author">
                            <span class="author-avatar-chip">EG</span>
                            <span>Everygyan</span>
                          </div>
                          <span class="meta-dot">•</span>
                          <span>${dateStr}</span>
                          <span class="meta-dot">•</span>
                          <span>${readTime} min read</span>
                          <a href="article.html?slug=${encodeURIComponent(article.slug)}" class="slide-read-btn">
                            Read Story <i data-lucide="arrow-up-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>`;
                }).join('');

                if (dots) {
                    dots.innerHTML = carouselArticles.map((_, idx) => `
                        <button class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
                    `).join('');
                }

                initHeroCarousel();
            }

            // 2. Right Half: Latest Stories List (top 4 latest)
            const latestListContainer = document.getElementById('heroLatestList');
            if (latestListContainer && articles.length > 0) {
                const latestFour = articles.slice(0, 4);
                latestListContainer.innerHTML = latestFour.map(article => {
                    const categorySlug = (article.category_slug || (article.category && article.category.slug) || 'blog').toLowerCase();
                    const categoryName = article.category_name || (article.category && article.category.name) || 'Blog';
                    const cover = article.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300';
                    const dateStr = formatDate(article.published_at || article.created_at);
                    const readTime = article.reading_time || Math.max(3, Math.ceil((article.content || '').split(/\s+/).length / 200));

                    return `
                    <a href="article.html?slug=${encodeURIComponent(article.slug)}" class="latest-feed-item">
                      <div class="latest-feed-thumb">
                        <img src="${escapeHtml(cover)}" alt="${escapeHtml(article.title)}" loading="lazy">
                      </div>
                      <div class="latest-feed-body">
                        <div class="latest-feed-tag-row">
                          <span class="card-category ${escapeHtml(categorySlug)}">${escapeHtml(categoryName)}</span>
                          <span class="latest-feed-time">${dateStr}</span>
                        </div>
                        <h4 class="latest-feed-title">${escapeHtml(article.title)}</h4>
                        <div class="latest-feed-meta">
                          <span><i data-lucide="clock"></i> ${readTime} min read</span>
                        </div>
                      </div>
                    </a>`;
                }).join('');
            }

            // 3. Grid: Latest Articles
            const articlesContainer = document.getElementById('latestArticlesGrid');
            if (articlesContainer) {
                articlesContainer.innerHTML = articles.slice(0, 6).map(renderArticleCard).join('');
            }

            renderLucideIcons();
            initScrollAnimations();
        }
    } catch {
        // Fallback to static cards if server is not configured yet
    }
}

/* --------------------------------------------------------------------------
   10. Category Listing Loader (Blog / Travel / Learning)
   -------------------------------------------------------------------------- */
async function loadListingData(categorySlug) {
    const grid = document.getElementById('articlesGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const paginationContainer = document.getElementById('pagination');

    let currentPage = 1;
    let currentFilter = 'all';
    let searchQuery = '';
    let debounceTimer = null;

    async function fetchAndRender() {
        if (typeof API === 'undefined') return;

        try {
            const params = {
                category: categorySlug,
                page: currentPage,
                limit: 9,
                status: 'published'
            };

            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            if (currentFilter && currentFilter !== 'all') {
                params.tag = currentFilter;
            }

            const res = await API.getArticles(params);
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0 && grid) {
                grid.innerHTML = res.data.map(renderArticleCard).join('');
                renderLucideIcons();
                initScrollAnimations();

                if (res.pagination && paginationContainer) {
                    renderPagination(res.pagination, (newPage) => {
                        currentPage = newPage;
                        fetchAndRender();
                        window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
                    });
                }
            } else if (res && res.success && res.data.length === 0 && grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                        <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">No articles found</h3>
                        <p style="color: var(--text-secondary);">Try adjusting your search terms or filters.</p>
                    </div>
                `;
                renderLucideIcons();
                if (paginationContainer) paginationContainer.innerHTML = '';
            }
        } catch {
            // Keep default static cards if API is unreachable
        }
    }

    // Attach search event
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                currentPage = 1;
                fetchAndRender();
            }, 300);
        });
    }

    // Attach filter buttons event
    if (filterButtons.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter') || 'all';
                currentPage = 1;
                fetchAndRender();
            });
        });
    }

    fetchAndRender();
}

/* --------------------------------------------------------------------------
   11. Single Article Loader
   -------------------------------------------------------------------------- */
async function loadSingleArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const id = urlParams.get('id');

    // Share buttons handling
    initShareButtons();

    if (!slug && !id) return;
    if (typeof API === 'undefined') return;

    try {
        const res = await API.getArticle(slug || id);
        if (res && res.success && res.data) {
            const article = res.data;
            document.title = `${article.title} — Everygyan`;

            // Breadcrumb & Category
            const categorySlug = (article.category_slug || (article.category && article.category.slug) || 'blog').toLowerCase();
            const categoryName = article.category_name || (article.category && article.category.name) || 'Blog';

            const breadcrumbCat = document.getElementById('breadcrumbCategory');
            if (breadcrumbCat) {
                breadcrumbCat.textContent = categoryName;
                breadcrumbCat.href = `${categorySlug}.html`;
            }

            const breadcrumbTitle = document.getElementById('breadcrumbTitle');
            if (breadcrumbTitle) breadcrumbTitle.textContent = article.title;

            const categoryBadge = document.getElementById('articleCategoryBadge');
            if (categoryBadge) {
                categoryBadge.textContent = categoryName;
                categoryBadge.className = `card-category ${categorySlug}`;
            }

            // Title & Meta
            const titleEl = document.getElementById('articleTitle');
            if (titleEl) titleEl.textContent = article.title;

            const authorName = document.getElementById('articleAuthor');
            if (authorName) authorName.textContent = article.author_name || (article.author && article.author.full_name) || 'Devansh';

            const dateEl = document.getElementById('articleDate');
            if (dateEl) dateEl.textContent = formatDate(article.published_at || article.created_at);

            const readingEl = document.getElementById('articleReadingTime');
            if (readingEl) readingEl.textContent = `${article.reading_time || 5} min read`;

            const viewsEl = document.getElementById('articleViews');
            if (viewsEl) viewsEl.textContent = `${article.views || 1} views`;

            // Cover Image
            const coverEl = document.getElementById('articleCoverImage');
            if (coverEl && article.cover_image) {
                coverEl.src = article.cover_image;
                coverEl.alt = article.title;
            }

            // Article Content (HTML)
            const contentEl = document.getElementById('articleContent');
            if (contentEl) {
                contentEl.innerHTML = article.content || '<p>No content provided.</p>';
            }

            // Tags
            const tagsContainer = document.getElementById('articleTags');
            if (tagsContainer && Array.isArray(article.tags)) {
                tagsContainer.innerHTML = article.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
            }

            renderLucideIcons();
        }
    } catch {
        // Fallback to static article content
    }
}

/* --------------------------------------------------------------------------
   12. Social Sharing
   -------------------------------------------------------------------------- */
function initShareButtons() {
    const copyBtn = document.getElementById('copyLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('🔗 Link copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Unable to copy link', 'error');
            });
        });
    }

    const twitterBtn = document.getElementById('shareTwitterBtn');
    if (twitterBtn) {
        twitterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(document.title);
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
        });
    }

    const linkedinBtn = document.getElementById('shareLinkedInBtn');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500');
        });
    }
}

/* --------------------------------------------------------------------------
   13. Pagination Renderer Helper
   -------------------------------------------------------------------------- */
function renderPagination(pagination, onPageChange) {
    const container = document.getElementById('pagination');
    if (!container || pagination.pages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';
    const { page, pages } = pagination;

    // Previous
    html += `
        <button class="page-btn ${page <= 1 ? 'disabled' : ''}" data-page="${page - 1}" aria-label="Previous page">
            <i data-lucide="chevron-left"></i>
        </button>
    `;

    // Pages
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
            html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
            html += `<span class="page-btn disabled">...</span>`;
        }
    }

    // Next
    html += `
        <button class="page-btn ${page >= pages ? 'disabled' : ''}" data-page="${page + 1}" aria-label="Next page">
            <i data-lucide="chevron-right"></i>
        </button>
    `;

    container.innerHTML = html;
    renderLucideIcons();

    container.querySelectorAll('.page-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = parseInt(btn.getAttribute('data-page'), 10);
            if (targetPage && targetPage !== page) {
                onPageChange(targetPage);
            }
        });
    });
}

/* --------------------------------------------------------------------------
   14. Format Helpers
   -------------------------------------------------------------------------- */
function formatDate(dateStr) {
    if (!dateStr) return 'Recent';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
