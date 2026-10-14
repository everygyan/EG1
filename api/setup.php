<?php
/**
 * Database Initialization Script
 * Safe to run multiple times (idempotent).
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$configFile = __DIR__ . '/config.php';
$configExampleFile = __DIR__ . '/config.example.php';

$messages = [];
$errors = [];
$success = true;

// 1. Verify Configuration File
if (!file_exists($configFile)) {
    if (file_exists($configExampleFile)) {
        copy($configExampleFile, $configFile);
        $messages[] = ['type' => 'info', 'text' => 'Created api/config.php from config.example.php template.'];
    } else {
        $errors[] = 'Configuration file api/config.php not found and config.example.php is missing.';
        $success = false;
    }
}

$config = null;
if (file_exists($configFile)) {
    $config = require $configFile;
}

$pdo = null;

if ($config && empty($errors)) {
    $dbConfig = $config['db'];
    
    // 2. Connect to MySQL Server (Create database if not exists)
    try {
        $serverDsn = "mysql:host={$dbConfig['host']};charset={$dbConfig['charset']}";
        $serverPdo = new PDO($serverDsn, $dbConfig['user'], $dbConfig['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        $dbName = preg_replace('/[^a-zA-Z0-9_]/', '', $dbConfig['name']);
        $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $messages[] = ['type' => 'success', 'text' => "Database `{$dbName}` verified / created."];
        
        // Reconnect to specific database
        $pdo = new PDO(
            "mysql:host={$dbConfig['host']};dbname={$dbName};charset={$dbConfig['charset']}",
            $dbConfig['user'],
            $dbConfig['pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        $messages[] = ['type' => 'success', 'text' => 'Connected to MySQL database successfully.'];
    } catch (PDOException $e) {
        $errors[] = 'Database connection error: ' . $e->getMessage() . '. Please verify credentials in api/config.php.';
        $success = false;
    }
}

if ($pdo) {
    // 3. Create Tables
    $tableQueries = [
        'users' => "CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            bio TEXT,
            avatar_url VARCHAR(500),
            role ENUM('admin', 'author') DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

        'categories' => "CREATE TABLE IF NOT EXISTS categories (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            slug VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            color VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

        'articles' => "CREATE TABLE IF NOT EXISTS articles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            excerpt TEXT,
            content LONGTEXT,
            cover_image VARCHAR(500),
            category_id INT,
            author_id INT,
            status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
            featured TINYINT(1) DEFAULT 0,
            tags JSON,
            meta_description VARCHAR(300),
            reading_time INT DEFAULT 0,
            views INT DEFAULT 0,
            published_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_status (status),
            INDEX idx_category (category_id),
            INDEX idx_slug (slug),
            INDEX idx_published (published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

        'media' => "CREATE TABLE IF NOT EXISTS media (
            id INT PRIMARY KEY AUTO_INCREMENT,
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255),
            mime_type VARCHAR(100),
            file_size INT,
            url VARCHAR(500) NOT NULL,
            alt_text VARCHAR(255),
            uploaded_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

        'auth_tokens' => "CREATE TABLE IF NOT EXISTS auth_tokens (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            token VARCHAR(64) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_token (token),
            INDEX idx_user_id (user_id),
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    ];

    foreach ($tableQueries as $tableName => $sql) {
        try {
            $pdo->exec($sql);
            $messages[] = ['type' => 'success', 'text' => "Table `{$tableName}` checked / created."];
        } catch (PDOException $e) {
            $errors[] = "Error creating table `{$tableName}`: " . $e->getMessage();
            $success = false;
        }
    }

    // 4. Seed Default Categories
    $defaultCategories = [
        [
            'name' => 'Blog',
            'slug' => 'blog',
            'description' => 'Personal thoughts, stories, and reflections',
            'icon' => 'pen-line',
            'color' => '#6366f1'
        ],
        [
            'name' => 'Travel',
            'slug' => 'travel',
            'description' => 'Adventures, guides, and travel photography',
            'icon' => 'plane',
            'color' => '#06b6d4'
        ],
        [
            'name' => 'Learning',
            'slug' => 'learning',
            'description' => 'Tutorials, courses, and knowledge sharing',
            'icon' => 'graduation-cap',
            'color' => '#10b981'
        ]
    ];

    $categoryMap = [];
    $catStmt = $pdo->prepare("SELECT id, slug FROM categories");
    $catStmt->execute();
    while ($row = $catStmt->fetch()) {
        $categoryMap[$row['slug']] = $row['id'];
    }

    $insertCatStmt = $pdo->prepare("INSERT INTO categories (name, slug, description, icon, color) VALUES (:name, :slug, :description, :icon, :color)");
    foreach ($defaultCategories as $cat) {
        if (!isset($categoryMap[$cat['slug']])) {
            $insertCatStmt->execute([
                ':name' => $cat['name'],
                ':slug' => $cat['slug'],
                ':description' => $cat['description'],
                ':icon' => $cat['icon'],
                ':color' => $cat['color']
            ]);
            $newCatId = $pdo->lastInsertId();
            $categoryMap[$cat['slug']] = $newCatId;
            $messages[] = ['type' => 'success', 'text' => "Seeded category: {$cat['name']}"];
        } else {
            $messages[] = ['type' => 'info', 'text' => "Category `{$cat['name']}` already exists."];
        }
    }

    // 5. Seed Default Admin User
    $adminUser = null;
    $userStmt = $pdo->prepare("SELECT id, username, email FROM users WHERE username = 'admin' OR email = 'admin@example.com' LIMIT 1");
    $userStmt->execute();
    $adminUser = $userStmt->fetch();

    if (!$adminUser) {
        $adminPasswordHash = password_hash('admin123', PASSWORD_BCRYPT);
        $insertAdminStmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url, role) VALUES (:username, :email, :password_hash, :full_name, :bio, :avatar_url, :role)");
        $insertAdminStmt->execute([
            ':username' => 'admin',
            ':email' => 'admin@example.com',
            ':password_hash' => $adminPasswordHash,
            ':full_name' => 'Devansh',
            ':bio' => 'Full-stack developer, explorer, and continuous learner building delightful digital experiences.',
            ':avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            ':role' => 'admin'
        ]);
        $adminId = $pdo->lastInsertId();
        $messages[] = ['type' => 'success', 'text' => "Created default admin user 'admin' (password: admin123)."];
    } else {
        $adminId = $adminUser['id'];
        $messages[] = ['type' => 'info', 'text' => "Default admin user 'admin' already exists (ID: {$adminId})."];
    }

    // 6. Seed Sample Articles
    $sampleArticles = [
        [
            'title' => 'The Art of Slow Living in a Fast-Paced World',
            'slug' => 'the-art-of-slow-living-in-a-fast-paced-world',
            'excerpt' => 'Why intentionally stepping back from relentless hustle culture dramatically elevates mental clarity, personal creativity, and daily happiness.',
            'content' => '<h2>Finding Silence in the Noise</h2><p>In our hyper-connected reality, constant notification pings and calendar alerts have normalized an ambient state of anxiety. The pressure to continually optimize every waking hour often leads to profound mental fatigue rather than meaningful fulfillment.</p><p>Embracing slow living does not mean abandoning ambition or productivity. Instead, it invites us to align our energy with deep intention, creating space for deliberate focus, contemplative walks, and restorative hobbies without an agenda.</p><h2>The Discipline of Saying No</h2><p>True creative work requires uninterrupted stretches of calm. By learning to say no to trivial commitments, we protect our most precious asset: our cognitive bandwidth. When we stop rushing through our days, we start noticing the subtle nuances that make human life rich and inspiring.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
            'category_slug' => 'blog',
            'status' => 'published',
            'featured' => 1,
            'tags' => ['Mindfulness', 'Productivity', 'Lifestyle'],
            'reading_time' => 4,
            'views' => 384,
            'published_at' => '2026-10-02 09:30:00'
        ],
        [
            'title' => 'Why Deep Work is the Superpower of the 21st Century',
            'slug' => 'why-deep-work-is-the-superpower-of-the-21st-century',
            'excerpt' => 'Distraction is the default state of modern knowledge work. Here is how building ruthless focus rituals creates non-linear compounding in your career.',
            'content' => '<h2>The Scarcity of Focused Attention</h2><p>The ability to perform deep, cognitively demanding work without distraction is becoming increasingly rare at the exact time it is becoming most valuable in the modern economy. Those who cultivate this skill thrive in complex technical disciplines.</p><p>Multitasking is a myth; cognitive switching costs erode up to 40 percent of our productive capacity. By establishing hard boundaries around uninterrupted time blocks, creators produce work of extraordinary depth and precision.</p><h2>Designing a Distraction-Free Sanctuary</h2><p>Eliminate notifications, establish clear morning rituals, and embrace boredom as an essential prerequisite for breakthrough ideas. Deep focus is not a personality trait—it is a muscle that strengthens with deliberate daily practice.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800',
            'category_slug' => 'blog',
            'status' => 'published',
            'featured' => 0,
            'tags' => ['Focus', 'Career', 'Habits'],
            'reading_time' => 5,
            'views' => 520,
            'published_at' => '2026-10-05 14:15:00'
        ],
        [
            'title' => 'Building in Public: Lessons from One Year of Open Creation',
            'slug' => 'building-in-public-lessons-from-one-year-of-open-creation',
            'excerpt' => 'Transparent metrics, vulnerable milestones, and the surprising psychological benefits of sharing both wins and catastrophic failures openly.',
            'content' => '<h2>Radical Transparency as a Growth Engine</h2><p>Sharing your journey in public turns customers into loyal collaborators. When you transparently discuss architectural decisions, pricing dilemmas, and revenue milestones, your audience builds authentic trust in what you are building.</p><p>However, building in public demands vulnerability. It means acknowledging when a launch falls flat or when a feature requires complete refactoring. These moments of honesty resonate far more than curated highlights ever could.</p><h2>Fostering Community Over Pure Marketing</h2><p>The goal is never self-aggrandizement; it is knowledge sharing. By documenting your exact process, you give others actionable roadmaps while receiving invaluable early feedback from peers who have walked the path before you.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
            'category_slug' => 'blog',
            'status' => 'published',
            'featured' => 0,
            'tags' => ['IndieHacker', 'Creator', 'Community'],
            'reading_time' => 5,
            'views' => 295,
            'published_at' => '2026-10-07 11:00:00'
        ],
        [
            'title' => 'Into the Dolomites: A Hiker’s Guide to Italy’s Jagged Peaks',
            'slug' => 'into-the-dolomites-a-hikers-guide-to-italys-jagged-peaks',
            'excerpt' => 'Navigating high-altitude via ferratas, alpine rifugios, and golden sunrise vistas across the iconic limestone spires of Northern Italy.',
            'content' => '<h2>The Pale Mountains at Sunrise</h2><p>Few mountain ranges command the soul like the Italian Dolomites. As early morning light strikes the pale dolomite limestone, the rock faces ignite with warm pink and orange hues—a natural phenomenon known locally as <em>enrosadira</em>.</p><p>Whether traversing the high ridgelines around Tre Cime di Lavaredo or descending into the lush green pastures of Alpe di Siusi, every turn reveals breathtaking panoramas shaped by millions of years of geological majesty.</p><h2>Rifugio Culture and Alpine Hospitality</h2><p>One of the great pleasures of trekking in the Dolomites is staying in alpine rifugios. Perched high on mountain shoulders, these refuges offer warm South Tyrolean hospitality, hearty polenta, and unforgettable camaraderie under starry alpine skies.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            'category_slug' => 'travel',
            'status' => 'published',
            'featured' => 1,
            'tags' => ['Dolomites', 'Hiking', 'Italy', 'Adventure'],
            'reading_time' => 6,
            'views' => 740,
            'published_at' => '2026-10-09 16:45:00'
        ],
        [
            'title' => 'Lost in Kyoto: Wandering Ancient Alleys and Bamboo Groves',
            'slug' => 'lost-in-kyoto-wandering-ancient-alleys-and-bamboo-groves',
            'excerpt' => 'Discovering quiet tea houses, hidden moss rock gardens, and peaceful evening lantern walks through Gion away from the crowded tourist trails.',
            'content' => '<h2>Timeless Echoes in Gion</h2><p>Kyoto is a city best explored at dawn. Before the tour buses arrive, the cobblestone alleys of Gion and Higashiyama whisper tales of centuries past. Wooden machiya merchant houses glow softly under paper lanterns, and the scent of cedar and roasted matcha lingers in the cool air.</p><p>Wandering into lesser-known Zen temples like Kennin-ji reveals contemplative dry-landscape gardens designed for quiet meditation. Every raked pebble and moss-covered boulder embodies the philosophy of <em>wabi-sabi</em>—finding sublime beauty in imperfection and impermanence.</p><h2>The Whispering Canes of Arashiyama</h2><p>Beyond the historic center, the soaring bamboo stalks of Arashiyama sway gently with the breeze, creating an organic chime designated by the Ministry of the Environment as one of the 100 Soundscapes of Japan.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
            'category_slug' => 'travel',
            'status' => 'published',
            'featured' => 0,
            'tags' => ['Japan', 'Kyoto', 'Culture', 'Photography'],
            'reading_time' => 5,
            'views' => 615,
            'published_at' => '2026-10-11 13:20:00'
        ],
        [
            'title' => 'Sailing the Norwegian Fjords: Chasing Waterfalls and Solitude',
            'slug' => 'sailing-the-norwegian-fjords-chasing-waterfalls-and-solitude',
            'excerpt' => 'Glacier-carved cliffs, crystal blue waters, and reflections on an unforgettable sailing expedition through Geirangerfjord and Nærøyfjord.',
            'content' => '<h2>Glacial Majesty in Western Norway</h2><p>Navigating the sheer waterways of Geirangerfjord feels like entering another geological era. Cliffs rise over a thousand meters straight out of the sapphire water, with majestic waterfalls like the Seven Sisters cascading down sheer rock faces in roaring torrents of mist.</p><p>Drifting quietly through UNESCO-protected Nærøyfjord—at some points barely 250 meters wide—offers an intimate encounter with silence. Small farming hamlets cling impossibly to steep emerald slopes, accessible only by boat or rugged mountain footpaths.</p><h2>Respecting the Nordic Wild</h2><p>Norway’s tradition of <em>friluftsliv</em>—open-air living—is more than a recreation philosophy; it is a way of being. Kayaking alongside porpoises and anchoring under midnight twilight leaves an indelible imprint on every traveler’s memory.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
            'category_slug' => 'travel',
            'status' => 'published',
            'featured' => 0,
            'tags' => ['Norway', 'Fjords', 'Sailing', 'Wilderness'],
            'reading_time' => 6,
            'views' => 490,
            'published_at' => '2026-10-12 17:50:00'
        ],
        [
            'title' => 'Mastering Modern CSS: Subgrid, Container Queries, and Beyond',
            'slug' => 'mastering-modern-css-subgrid-container-queries-and-beyond',
            'excerpt' => 'A comprehensive breakdown of next-generation layout primitives that eliminate styling hacks and make component-driven layouts intuitive.',
            'content' => '<h2>The Evolution of Web Layouts</h2><p>CSS has experienced a breathtaking renaissance over the past few years. Features that once required intricate JavaScript calculations or brittle CSS hacks—such as nested grid alignment and parent-independent responsive layouts—are now native browser primitives supported everywhere.</p><h2>Unlocking Container Queries</h2><p>For decades, responsive web design relied exclusively on viewport media queries. Container queries revolutionize this paradigm by allowing components to adapt based on the size of their direct container rather than the browser window:</p><pre><code>.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 500px) {\n  .card {\n    display: grid;\n    grid-template-columns: 200px 1fr;\n  }\n}</code></pre><h2>True Nested Alignment with Subgrid</h2><p>CSS Subgrid allows child components to participate directly in the parent grid tracks, ensuring consistent card heights and aligned action footers across varied content without fragile flexbox hacks.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            'category_slug' => 'learning',
            'status' => 'published',
            'featured' => 1,
            'tags' => ['CSS', 'WebDev', 'Frontend', 'Tutorial'],
            'reading_time' => 7,
            'views' => 985,
            'published_at' => '2026-10-13 10:10:00'
        ],
        [
            'title' => 'Demystifying Asynchronous Programming in TypeScript',
            'slug' => 'demystifying-asynchronous-programming-in-typescript',
            'excerpt' => 'Deep dive into the JavaScript Event Loop, Promises, concurrent task orchestration, and robust error handling for production web applications.',
            'content' => '<h2>Understanding the Event Loop Under the Hood</h2><p>JavaScript operates on a single-threaded event loop with a call stack, microtask queue, and macrotask queue. Understanding when Promises resolve relative to UI rendering cycles is essential for eliminating race conditions and avoiding stutter in interactive web apps.</p><h2>Type-Safe Async Patterns</h2><p>TypeScript elevates async workflows by enforcing strict contract types on promise chains. Leveraging helper types like <code>Awaited&lt;T&gt;</code> and orchestrating concurrent network requests via <code>Promise.allSettled</code> ensures your application handles partial network failures gracefully without unhandled rejections.</p><h2>Building Resilient Retry Mechanisms</h2><p>Production applications must expect transient network drops. Implementing exponential backoff with jitter prevents thundering herd problems and provides a seamless, self-healing experience for end users.</p>',
            'cover_image' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
            'category_slug' => 'learning',
            'status' => 'published',
            'featured' => 0,
            'tags' => ['TypeScript', 'JavaScript', 'Architecture', 'Programming'],
            'reading_time' => 8,
            'views' => 860,
            'published_at' => '2026-10-14 08:00:00'
        ]
    ];

    $artCheckStmt = $pdo->prepare("SELECT id FROM articles WHERE slug = :slug LIMIT 1");
    $artInsertStmt = $pdo->prepare("INSERT INTO articles (title, slug, excerpt, content, cover_image, category_id, author_id, status, featured, tags, meta_description, reading_time, views, published_at) VALUES (:title, :slug, :excerpt, :content, :cover_image, :category_id, :author_id, :status, :featured, :tags, :meta_description, :reading_time, :views, :published_at)");

    $seededCount = 0;
    foreach ($sampleArticles as $art) {
        $artCheckStmt->execute([':slug' => $art['slug']]);
        if (!$artCheckStmt->fetch()) {
            $catId = isset($categoryMap[$art['category_slug']]) ? $categoryMap[$art['category_slug']] : null;
            $artInsertStmt->execute([
                ':title' => $art['title'],
                ':slug' => $art['slug'],
                ':excerpt' => $art['excerpt'],
                ':content' => $art['content'],
                ':cover_image' => $art['cover_image'],
                ':category_id' => $catId,
                ':author_id' => $adminId,
                ':status' => $art['status'],
                ':featured' => $art['featured'],
                ':tags' => json_encode($art['tags']),
                ':meta_description' => mb_substr($art['excerpt'], 0, 160),
                ':reading_time' => $art['reading_time'],
                ':views' => $art['views'],
                ':published_at' => $art['published_at']
            ]);
            $seededCount++;
        }
    }

    if ($seededCount > 0) {
        $messages[] = ['type' => 'success', 'text' => "Seeded {$seededCount} sample articles."];
    } else {
        $messages[] = ['type' => 'info', 'text' => 'Sample articles already exist.'];
    }

    // 7. Verify Upload Directory
    $uploadDir = $config['upload_dir'] ?? (__DIR__ . '/../assets/uploads/');
    if (!is_dir($uploadDir)) {
        if (@mkdir($uploadDir, 0755, true)) {
            $messages[] = ['type' => 'success', 'text' => "Created upload directory at `{$uploadDir}`."];
        } else {
            $errors[] = "Failed to create upload directory at `{$uploadDir}`. Please check permissions.";
        }
    } else {
        $messages[] = ['type' => 'info', 'text' => "Upload directory verified at `{$uploadDir}`."];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup — Modern Personal Blog</title>
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg: #0f172a;
            --card-bg: #1e293b;
            --border: #334155;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
            --error: #ef4444;
            --info: #38bdf8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: var(--bg);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }
        .container {
            width: 100%;
            max-width: 680px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            padding: 2rem;
            border-bottom: 1px solid var(--border);
            background: rgba(255, 255, 255, 0.02);
            text-align: center;
        }
        .header h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 0.5rem;
        }
        .header p {
            color: var(--text-muted);
            font-size: 0.925rem;
        }
        .content {
            padding: 2rem;
        }
        .section-title {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 1rem;
            font-weight: 600;
        }
        .list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 2rem;
        }
        .item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.9rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .item.success { border-left: 3px solid var(--success); }
        .item.info { border-left: 3px solid var(--info); }
        .item.error { border-left: 3px solid var(--error); background: rgba(239, 68, 68, 0.1); }
        .icon {
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 1px;
        }
        .item.success .icon { color: var(--success); }
        .item.info .icon { color: var(--info); }
        .item.error .icon { color: var(--error); }
        .card-alert {
            padding: 1.25rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid transparent;
        }
        .card-alert.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
            color: #d1fae5;
        }
        .card-alert.error {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #fee2e2;
        }
        .creds-box {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-family: monospace;
            font-size: 0.9rem;
        }
        .creds-box div { margin: 0.25rem 0; }
        .actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 0.925rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .btn-primary {
            background: var(--primary);
            color: #fff;
            border: none;
        }
        .btn-primary:hover {
            background: var(--primary-hover);
        }
        .btn-secondary {
            background: transparent;
            color: var(--text-main);
            border: 1px solid var(--border);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Database Setup &amp; Initialization</h1>
            <p>Modern Personal Blog &amp; Content Management System</p>
        </div>
        <div class="content">
            <?php if ($success && empty($errors)): ?>
                <div class="card-alert success">
                    <strong>Setup Completed Successfully!</strong>
                    <p style="margin-top: 0.25rem;">Database tables, categories, sample articles, and default credentials have been initialized.</p>
                    <div class="creds-box">
                        <div><strong>Default Admin Credentials:</strong></div>
                        <div>Username: <code>admin</code> (or <code>admin@example.com</code>)</div>
                        <div>Password: <code>admin123</code></div>
                    </div>
                </div>
            <?php else: ?>
                <div class="card-alert error">
                    <strong>Setup Encountered Issues:</strong>
                    <p style="margin-top: 0.25rem;">Please review the error messages below and check <code>api/config.php</code>.</p>
                </div>
            <?php endif; ?>

            <div class="section-title">Setup Progress &amp; Diagnostics</div>
            <ul class="list">
                <?php foreach ($messages as $msg): ?>
                    <li class="item <?= htmlspecialchars($msg['type']) ?>">
                        <span class="icon"><?= $msg['type'] === 'success' ? '✓' : 'ℹ' ?></span>
                        <span><?= htmlspecialchars($msg['text']) ?></span>
                    </li>
                <?php endforeach; ?>

                <?php foreach ($errors as $err): ?>
                    <li class="item error">
                        <span class="icon">✗</span>
                        <span><?= htmlspecialchars($err) ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>

            <div class="actions">
                <a href="../index.html" class="btn btn-primary">Go to Website →</a>
                <a href="setup.php" class="btn btn-secondary">Re-run Setup</a>
            </div>
        </div>
    </div>
</body>
</html>
