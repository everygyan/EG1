/**
 * Modern Personal Blog API Client
 * Provides complete frontend & admin abstraction for the PHP backend.
 */

const API = {
    /**
     * Dynamically resolve API base URL based on execution context
     */
    baseUrl: (() => {
        if (typeof window !== 'undefined' && window.location) {
            const pathname = window.location.pathname;
            if (pathname.includes('/admin/')) {
                return '../api';
            }
            return './api';
        }
        return './api';
    })(),

    /**
     * Override base URL if needed
     * @param {string} url 
     */
    setBaseUrl(url) {
        this.baseUrl = url.replace(/\/+$/, '');
    },

    /**
     * Retrieve stored auth token from localStorage
     * @returns {string|null}
     */
    getToken() {
        try {
            return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        } catch {
            return null;
        }
    },

    /**
     * Store auth token in localStorage
     * @param {string} token 
     */
    setToken(token) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('auth_token', token);
            }
        } catch (e) {
            console.warn('Unable to persist auth_token in localStorage:', e);
        }
    },

    /**
     * Remove auth token from localStorage
     */
    removeToken() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('auth_token');
            }
        } catch (e) {
            console.warn('Unable to clear auth_token from localStorage:', e);
        }
    },

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Core HTTP request handler
     * @param {string} endpoint 
     * @param {RequestInit} options 
     * @returns {Promise<any>}
     */
    async request(endpoint, options = {}) {
        const cleanEndpoint = endpoint.replace(/^\/+/, '');
        const url = `${this.baseUrl}/${cleanEndpoint}`;
        const headers = {};

        // Auto-set Content-Type for JSON payloads; do NOT set for FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    ...(options.headers || {})
                }
            });

            let data;
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { success: response.ok, message: text };
                }
            }

            if (!response.ok) {
                const errorMsg = (data && data.message) ? data.message : `HTTP error ${response.status}`;
                const err = new Error(errorMsg);
                err.status = response.status;
                err.data = data;
                throw err;
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError') {
                throw new Error('Network error — API may be unavailable or CORS blocked');
            }
            throw error;
        }
    },

    // ==========================================
    // Authentication Endpoints
    // ==========================================

    /**
     * Login with username/email and password
     * @param {string} username 
     * @param {string} password 
     */
    async login(username, password) {
        const data = await this.request('auth.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username, password })
        });
        if (data && data.success && data.token) {
            this.setToken(data.token);
        }
        return data;
    },

    /**
     * Logout and invalidate token
     */
    async logout() {
        try {
            const data = await this.request('auth.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'logout' })
            });
            return data;
        } finally {
            this.removeToken();
        }
    },

    /**
     * Verify current session/token
     */
    async verifyAuth() {
        return await this.request('auth.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'verify' })
        });
    },

    // ==========================================
    // Articles Endpoints
    // ==========================================

    /**
     * Fetch paginated articles with optional filters
     * @param {Object} params { page, limit, category, status, search, featured, tag }
     */
    async getArticles(params = {}) {
        const queryParams = new URLSearchParams();
        for (const [key, val] of Object.entries(params)) {
            if (val !== undefined && val !== null && val !== '') {
                queryParams.append(key, String(val));
            }
        }
        const queryString = queryParams.toString();
        const endpoint = queryString ? `articles.php?${queryString}` : 'articles.php';
        return await this.request(endpoint);
    },

    /**
     * Fetch a single article by ID or slug
     * @param {string|number} idOrSlug 
     */
    async getArticle(idOrSlug) {
        const isNumeric = typeof idOrSlug === 'number' || (/^\d+$/).test(String(idOrSlug).trim());
        const param = isNumeric ? 'id' : 'slug';
        return await this.request(`articles.php?${param}=${encodeURIComponent(idOrSlug)}`);
    },

    /**
     * Create a new article (Auth required)
     * @param {Object} articleData 
     */
    async createArticle(articleData) {
        return await this.request('articles.php', {
            method: 'POST',
            body: JSON.stringify(articleData)
        });
    },

    /**
     * Update an existing article by ID (Auth required)
     * @param {number|string} id 
     * @param {Object} articleData 
     */
    async updateArticle(id, articleData) {
        return await this.request(`articles.php?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(articleData)
        });
    },

    /**
     * Delete an article by ID (Auth required)
     * @param {number|string} id 
     */
    async deleteArticle(id) {
        return await this.request(`articles.php?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    },

    // ==========================================
    // Categories Endpoints
    // ==========================================

    /**
     * Get list of categories with article count
     */
    async getCategories() {
        return await this.request('categories.php');
    },

    /**
     * Create a new category (Auth required)
     * @param {Object} categoryData { name, slug, description, icon, color }
     */
    async createCategory(categoryData) {
        return await this.request('categories.php', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    /**
     * Update a category (Auth required)
     * @param {number|string} id 
     * @param {Object} categoryData 
     */
    async updateCategory(id, categoryData) {
        return await this.request(`categories.php?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    },

    /**
     * Delete a category (Auth required)
     * @param {number|string} id 
     */
    async deleteCategory(id) {
        return await this.request(`categories.php?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    },

    // ==========================================
    // Media Endpoints
    // ==========================================

    /**
     * Upload a media file (Auth required)
     * Accepts either a FormData instance or a File/Blob object
     * @param {FormData|File} fileOrFormData 
     * @param {string} [altText]
     */
    async uploadMedia(fileOrFormData, altText = '') {
        let formData;
        if (fileOrFormData instanceof FormData) {
            formData = fileOrFormData;
        } else if (fileOrFormData instanceof Blob || (typeof File !== 'undefined' && fileOrFormData instanceof File)) {
            formData = new FormData();
            formData.append('file', fileOrFormData);
            if (altText) {
                formData.append('alt_text', altText);
            }
        } else {
            throw new Error('uploadMedia expects a FormData or File/Blob object');
        }

        return await this.request('media.php', {
            method: 'POST',
            body: formData
        });
    },

    /**
     * Get all uploaded media files (Auth required)
     */
    async getMedia() {
        return await this.request('media.php');
    },

    /**
     * Delete a media file by ID (Auth required)
     * @param {number|string} id 
     */
    async deleteMedia(id) {
        return await this.request(`media.php?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    },

    // ==========================================
    // Dashboard Stats Endpoints
    // ==========================================

    /**
     * Get dashboard statistics (Auth required)
     */
    async getStats() {
        return await this.request('stats.php');
    }
};

// Expose globally to window
if (typeof window !== 'undefined') {
    window.API = API;
}

// Support CommonJS / Node environments if required
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
