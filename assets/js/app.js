/**
 * Everygyan - Main Frontend Application Logic
 * Supports Theme Switcher, Mobile Navigation, API Integration, and Dynamic Article Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initSubscribeAction();
    initHeaderAuth();
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
   6. Newsletter Submissions (Validation, Loading State, Toast & Inline Success)
   -------------------------------------------------------------------------- */
function initNewsletterForms() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    document.querySelectorAll('.newsletter-form, #footerNewsletter').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');

            if (!input) return;

            const email = input.value.trim();

            // 1. Email Validation
            if (!email) {
                showToast('Please enter your email address.', 'error');
                input.classList.add('input-error');
                input.focus();
                setTimeout(() => input.classList.remove('input-error'), 2500);
                return;
            }

            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address (e.g. name@domain.com).', 'error');
                input.classList.add('input-error');
                input.focus();
                setTimeout(() => input.classList.remove('input-error'), 2500);
                return;
            }

            // 2. Loading State
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Subscribe';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-loading');
                submitBtn.innerHTML = `
                    <span class="spinner-sm"></span>
                    <span>Subscribing...</span>
                `;
            }
            input.disabled = true;

            try {
                // Simulate network latency / dispatch subscription
                await new Promise((resolve) => setTimeout(resolve, 750));

                // 3. Success Toast & Inline Confirmation
                showToast('🎉 Thank you for subscribing! Check your inbox soon.', 'success');
                form.reset();

                // Inline success banner
                let successMsg = form.parentElement.querySelector('.newsletter-success-msg');
                if (!successMsg) {
                    successMsg = document.createElement('div');
                    successMsg.className = 'newsletter-success-msg';
                    form.parentElement.appendChild(successMsg);
                }
                successMsg.innerHTML = `
                    <i data-lucide="check-circle" style="width: 16px; height: 16px; color: var(--success); vertical-align: middle; margin-right: 6px;"></i>
                    <span>You're subscribed! A confirmation note was sent to <strong>${escapeHtml(email)}</strong>.</span>
                `;
                successMsg.style.display = 'block';
                renderLucideIcons();

                setTimeout(() => {
                    if (successMsg) {
                        successMsg.style.display = 'none';
                    }
                }, 6000);

            } catch (err) {
                showToast('Subscription failed. Please check your connection and try again.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerHTML = originalBtnHtml;
                    renderLucideIcons();
                }
                input.disabled = false;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   6a. Smooth Scrolling for Newsletter Subscribe Action
   -------------------------------------------------------------------------- */
function initSubscribeAction() {
    const subscribeBtns = document.querySelectorAll('.btn-subscribe, a[href="#newsletter"]');
    subscribeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = document.getElementById('newsletter');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const emailInput = target.querySelector('input[type="email"]');
                if (emailInput) {
                    setTimeout(() => {
                        emailInput.focus();
                        emailInput.classList.add('newsletter-highlight');
                        setTimeout(() => emailInput.classList.remove('newsletter-highlight'), 2200);
                    }, 600);
                }
            }
        });
    });
}

/* --------------------------------------------------------------------------
   6b. Header Authenticated User Menu
   -------------------------------------------------------------------------- */
function initHeaderAuth() {
    const container = document.getElementById('navUserMenuContainer');
    if (!container) return;

    // Check if user is authenticated via API client or localStorage
    const hasToken = (typeof API !== 'undefined' && API.isAuthenticated && API.isAuthenticated()) || !!localStorage.getItem('auth_token');
    const storedUserStr = localStorage.getItem('currentUser');
    let user = null;
    try {
        if (storedUserStr) user = JSON.parse(storedUserStr);
    } catch {
        user = null;
    }

    if (hasToken) {
        const userName = (user && user.name) ? user.name : 'Devansh';
        const userInitial = userName.charAt(0).toUpperCase() || 'D';
        const userRole = (user && user.role) ? user.role : 'Author & Editor';

        container.innerHTML = `
            <div class="user-dropdown-wrapper" id="userDropdownWrapper">
                <button type="button" class="btn-user-profile" id="userMenuBtn" aria-expanded="false" aria-label="Author Profile Menu">
                    <span class="user-avatar-circle">${escapeHtml(userInitial)}</span>
                    <span class="user-display-name">${escapeHtml(userName)}</span>
                    <i data-lucide="chevron-down" style="width: 12px; height: 12px;"></i>
                </button>
                <div class="user-dropdown-panel" id="userDropdownPanel">
                    <div class="user-dropdown-header">
                        <div style="font-weight: 700; color: #ffffff; font-size: 0.8rem;">${escapeHtml(userName)}</div>
                        <div style="font-size: 0.68rem; color: #38BDF8; font-weight: 600;">${escapeHtml(userRole)}</div>
                    </div>
                    <a href="admin/index.html" class="user-dropdown-item">
                        <i data-lucide="layout-dashboard" style="width: 14px; height: 14px;"></i>
                        <span>Author Dashboard</span>
                    </a>
                    <a href="admin/editor.html" class="user-dropdown-item">
                        <i data-lucide="pen-tool" style="width: 14px; height: 14px;"></i>
                        <span>Write Article</span>
                    </a>
                    <div class="user-dropdown-divider"></div>
                    <button type="button" class="user-dropdown-item text-danger" id="userSignOutBtn">
                        <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        `;

        renderLucideIcons();

        const menuBtn = document.getElementById('userMenuBtn');
        const dropdownPanel = document.getElementById('userDropdownPanel');
        const signOutBtn = document.getElementById('userSignOutBtn');

        if (menuBtn && dropdownPanel) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdownPanel.classList.toggle('show');
                menuBtn.setAttribute('aria-expanded', String(isOpen));
            });

            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    dropdownPanel.classList.remove('show');
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    if (typeof API !== 'undefined' && API.logout) {
                        await API.logout();
                    }
                } catch {
                    // Ignore API error on logout
                } finally {
                    if (typeof API !== 'undefined' && API.removeToken) {
                        API.removeToken();
                    }
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('currentUser');
                    showToast('Signed out successfully.', 'info');
                    initHeaderAuth();
                }
            });
        }
    } else {
        // Not authenticated: render standard Login pill link
        container.innerHTML = `
            <a href="admin/login.html" class="btn-login" id="navLoginBtn">
                <i data-lucide="user" style="width: 14px; height: 14px; margin-right: 4px;"></i>
                <span>Login</span>
            </a>
        `;
        renderLucideIcons();
    }
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
    const dateStr = formatDate(article.published_at || article.created_at || article.date);
    const readingTime = formatReadingTime(article.reading_time || article.readTime || article.content);

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
                        <i data-lucide="clock"></i> ${readingTime}
                    </span>
                </div>
            </div>
        </div>
    </article>
    `;
}

/* --------------------------------------------------------------------------
   8B. Hero Magazine / Editorial Top Story Carousel Controller
   -------------------------------------------------------------------------- */
let heroCarouselTimer = null;

function initHeroCarousel() {
    const track = document.getElementById('heroCarouselTrack');
    const container = document.getElementById('heroFeaturedCarousel');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const dashesContainer = document.getElementById('heroCarouselDashes') || document.getElementById('heroCarouselDots');

    if (!track || !container) return;

    let slides = track.querySelectorAll('.top-story-slide, .hero-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;

    function updateSlide(index) {
        slides = track.querySelectorAll('.top-story-slide, .hero-slide');
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

        if (dashesContainer) {
            const dashes = dashesContainer.querySelectorAll('.card-dash, .carousel-dot');
            dashes.forEach((dash, i) => {
                dash.classList.toggle('active', i === currentIndex);
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
        prevBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            updateSlide(currentIndex - 1);
            startAutoPlay();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            updateSlide(currentIndex + 1);
            startAutoPlay();
        };
    }

    if (dashesContainer) {
        dashesContainer.onclick = (e) => {
            const dash = e.target.closest('.card-dash, .carousel-dot');
            if (dash && dash.dataset.index !== undefined) {
                updateSlide(parseInt(dash.dataset.index, 10));
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
        const response = await API.getArticles({ limit: 12, status: 'published' });
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            const articles = response.data;

            // Track rendered article IDs/slugs to prevent duplicates across homepage sections
            const usedKeys = new Set();
            const getArticleKey = (a) => String(a.id || a.slug || a.title);

            // 1. Featured Top Story Carousel (Top 5 stories)
            const featured = articles.filter(a => a.featured == 1 || a.is_featured);
            const poolForCarousel = featured.length >= 3 ? featured : articles;
            const carouselArticles = poolForCarousel.slice(0, 5);
            carouselArticles.forEach(a => usedKeys.add(getArticleKey(a)));
            
            const track = document.getElementById('heroCarouselTrack');
            const dashes = document.getElementById('heroCarouselDashes');
            if (track && carouselArticles.length > 0) {
                track.innerHTML = carouselArticles.map((article, idx) => {
                    const categorySlug = (article.category_slug || (article.category && article.category.slug) || 'tech').toLowerCase();
                    const categoryName = (article.category_name || (article.category && article.category.name) || 'Tech').toUpperCase();
                    const cover = article.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200';
                    const dateStr = formatDate(article.published_at || article.created_at || article.date);
                    const readTime = formatReadingTime(article.reading_time || article.readTime || article.content);
                    const authorName = (article.author && article.author.name) || article.author_name || 'Devansh';

                    return `
                    <div class="top-story-slide ${idx === 0 ? 'active' : ''}">
                      <div class="top-story-bg">
                        <img src="${escapeHtml(cover)}" alt="${escapeHtml(article.title)}" loading="${idx === 0 ? 'eager' : 'lazy'}">
                        <div class="top-story-overlay"></div>
                      </div>
                      
                      <div class="top-story-badges">
                        <span class="badge-top-story">TOP STORY</span>
                        <span class="badge-cat ${escapeHtml(categorySlug)}">${escapeHtml(categoryName)}</span>
                      </div>

                      <div class="top-story-content">
                        <h2 class="top-story-title">
                          <a href="article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a>
                        </h2>
                        <p class="top-story-excerpt">${escapeHtml(article.excerpt || '')}</p>
                        <div class="top-story-meta">
                          <span class="meta-item"><i data-lucide="user"></i> ${escapeHtml(authorName)}</span>
                          <span class="meta-item"><i data-lucide="clock"></i> ${readTime}</span>
                          <span class="meta-item"><i data-lucide="calendar"></i> ${dateStr}</span>
                        </div>
                      </div>
                    </div>`;
                }).join('');

                if (dashes) {
                    dashes.innerHTML = carouselArticles.map((_, idx) => `
                        <button class="card-dash ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
                    `).join('');
                }

                initHeroCarousel();
            }

            // 2. Right Half: Trending Now (5 ranked stories, deduplicated against Carousel)
            const trendingListContainer = document.getElementById('heroTrendingList');
            if (trendingListContainer && articles.length > 0) {
                const trendingPool = articles.filter(a => !usedKeys.has(getArticleKey(a)));
                const trendingFive = (trendingPool.length >= 5 ? trendingPool : articles).slice(0, 5);
                trendingFive.forEach(a => usedKeys.add(getArticleKey(a)));

                trendingListContainer.innerHTML = trendingFive.map((article, idx) => {
                    const cover = article.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=160';
                    const dateStr = formatDate(article.published_at || article.created_at || article.date);
                    const readTime = formatReadingTime(article.reading_time || article.readTime || article.content);
                    const rankStr = String(idx + 1).padStart(2, '0');

                    return `
                    <a href="article.html?slug=${encodeURIComponent(article.slug)}" class="trending-story-row">
                      <span class="trending-story-rank">${rankStr}</span>
                      <div class="trending-story-details">
                        <h4 class="trending-story-headline">${escapeHtml(article.title)}</h4>
                        <span class="trending-story-timestamp">${dateStr} • ${readTime}</span>
                      </div>
                      <div class="trending-story-thumb">
                        <img src="${escapeHtml(cover)}" alt="${escapeHtml(article.title)}" loading="lazy">
                      </div>
                    </a>`;
                }).join('');
            }

            // 3. Grid: Latest Articles (Deduplicated against Carousel & Trending)
            const articlesContainer = document.getElementById('latestArticlesGrid');
            if (articlesContainer) {
                const latestPool = articles.filter(a => !usedKeys.has(getArticleKey(a)));
                const latestArticles = (latestPool.length >= 6 ? latestPool : articles).slice(0, 6);
                articlesContainer.innerHTML = latestArticles.map(renderArticleCard).join('');
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
            if (authorName) authorName.textContent = article.author_name || (article.author && (article.author.full_name || article.author.name)) || 'Devansh';

            const dateEl = document.getElementById('articleDate');
            if (dateEl) dateEl.textContent = formatDate(article.published_at || article.created_at || article.date);

            const readingEl = document.getElementById('articleReadingTime');
            if (readingEl) readingEl.textContent = formatReadingTime(article.reading_time || article.readTime || 5);

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
function formatDate(dateInput) {
    if (!dateInput) return 'Recent';
    if (typeof dateInput === 'string') {
        const trimmed = dateInput.trim();
        if (/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/.test(trimmed)) {
            return trimmed;
        }
    }
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : 'Recent';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return typeof dateInput === 'string' ? dateInput : 'Recent';
    }
}

function formatReadingTime(readTimeInput) {
    if (readTimeInput === undefined || readTimeInput === null || readTimeInput === '') {
        return '3 min read';
    }
    if (typeof readTimeInput === 'number') {
        return `${Math.max(1, Math.round(readTimeInput))} min read`;
    }
    const match = String(readTimeInput).match(/\d+/);
    if (match) {
        return `${match[0]} min read`;
    }
    return '3 min read';
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
