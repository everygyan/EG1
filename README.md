# Devansh.blog — Personal Blog & Content Platform

A modern, responsive personal blog website with an integrated admin dashboard for content management.

## ✨ Features

- **Personal Blog** — Share thoughts, stories, and ideas
- **Travel Diaries** — Visual travel experiences with gallery layouts
- **Learning Hub** — Tutorials, courses, and educational content
- **Admin Dashboard** — Full CMS with rich text editor, media library, and analytics
- **Dark / Light Mode** — Toggle between themes with localStorage persistence
- **Mobile-First** — Fully responsive across all devices
- **SEO Ready** — Semantic HTML, meta tags, and clean URLs

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Custom), Vanilla JavaScript |
| Backend | PHP 8.x |
| Database | MySQL 8.x (Hostinger) |
| Icons | Lucide Icons (CDN) |
| Fonts | Google Fonts — Plus Jakarta Sans, Inter |
| Editor | Quill.js (Rich Text) |
| Hosting | Hostinger Business Plan |

## 🚀 Quick Start

### 1. Database Setup

1. Log in to your **Hostinger hPanel**
2. Go to **Databases → MySQL Databases**
3. Create a new database and note the credentials
4. Copy `api/config.example.php` to `api/config.php`
5. Update database credentials in `api/config.php`
6. Visit `https://yourdomain.com/api/setup.php` to initialize tables and sample data

### 2. Deploy to Hostinger

**Option A — Git Auto-Deploy (Recommended):**

1. Push this repo to GitHub
2. In hPanel → **Advanced → Git**, connect your repository
3. Set the branch to `main` and deploy

**Option B — File Manager / FTP:**

Upload all project files to your `public_html` directory.

### 3. First Login

1. Visit `https://yourdomain.com/admin/login.html`
2. Default credentials: `admin` / `admin123`
3. **⚠️ Change the password immediately after first login!**

## 📁 Project Structure

    .
    ├── index.html              Homepage
    ├── blog.html               Blog articles listing
    ├── travel.html             Travel blog listing
    ├── learning.html           Learning hub listing
    ├── article.html            Single article view
    ├── admin/
    │   ├── login.html          Admin login page
    │   ├── index.html          Admin dashboard
    │   └── editor.html         Article editor (create/edit)
    ├── api/
    │   ├── config.php          Database credentials (gitignored)
    │   ├── config.example.php  Config template
    │   ├── .htaccess           API access rules
    │   ├── setup.php           DB initialization script
    │   ├── auth.php            Authentication endpoints
    │   ├── articles.php        Articles CRUD
    │   ├── categories.php      Category listing
    │   ├── media.php           Media upload/management
    │   └── stats.php           Dashboard statistics
    ├── assets/
    │   ├── css/
    │   │   └── style.css       Complete stylesheet
    │   ├── js/
    │   │   ├── api.js          API client library
    │   │   ├── app.js          Frontend logic
    │   │   └── admin.js        Admin dashboard logic
    │   └── uploads/            User-uploaded media
    ├── .htaccess               Apache config (cache, gzip, security)
    ├── .gitignore
    └── README.md

## 🔗 GitHub Sync

    git init
    git add .
    git commit -m "Initial commit — Devansh.blog"
    git remote add origin https://github.com/YOUR_USERNAME/EG1.git
    git push -u origin main

## 📝 License

MIT — free for personal and commercial use.
