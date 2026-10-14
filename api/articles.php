<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$config = require __DIR__ . '/config.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['db']['host']};dbname={$config['db']['name']};charset={$config['db']['charset']}",
        $config['db']['user'],
        $config['db']['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

if (!function_exists('jsonResponse')) {
    function jsonResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!function_exists('getBearerToken')) {
    function getBearerToken() {
        $header = null;
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $header = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $header = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $headers = array_combine(array_map('ucwords', array_keys($headers)), array_values($headers));
            if (isset($headers['Authorization'])) {
                $header = trim($headers['Authorization']);
            }
        }

        if (!empty($header) && preg_match('/Bearer\s(\S+)/i', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }
}

if (!function_exists('authenticate')) {
    function authenticate($pdo, $config = []) {
        $token = getBearerToken();
        if (!$token) {
            $body = getRequestBody();
            $token = $body['token'] ?? ($_GET['token'] ?? null);
        }

        if (!$token) {
            return false;
        }

        try {
            $stmt = $pdo->prepare(
                "SELECT u.id, u.username, u.email, u.full_name, u.avatar_url, u.role, t.expires_at 
                 FROM auth_tokens t 
                 JOIN users u ON t.user_id = u.id 
                 WHERE t.token = :token AND t.expires_at > NOW() 
                 LIMIT 1"
            );
            $stmt->execute([':token' => $token]);
            $user = $stmt->fetch();
            if ($user) {
                unset($user['expires_at']);
                return $user;
            }
            return false;
        } catch (PDOException $e) {
            return false;
        }
    }
}

if (!function_exists('getRequestBody')) {
    function getRequestBody() {
        $input = file_get_contents('php://input');
        if (!empty($input)) {
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return $_POST;
    }
}

function generateUniqueSlug($title, $pdo, $excludeId = null) {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9-]+/', '-', $slug);
    $slug = trim($slug, '-');
    if (empty($slug)) {
        $slug = 'article-' . time();
    }

    $baseSlug = $slug;
    $counter = 1;
    while (true) {
        $sql = "SELECT id FROM articles WHERE slug = :slug";
        $params = [':slug' => $slug];
        if ($excludeId !== null) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        if (!$stmt->fetch()) {
            break;
        }
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
    return $slug;
}

function formatArticleRow($row, $includeContent = false) {
    $category = null;
    if (!empty($row['category_id']) || !empty($row['category_name'])) {
        $category = [
            'id' => !empty($row['category_id']) ? (int)$row['category_id'] : null,
            'name' => $row['category_name'] ?? '',
            'slug' => $row['category_slug'] ?? '',
            'color' => $row['category_color'] ?? '#6366f1',
            'icon' => $row['category_icon'] ?? 'pen-line'
        ];
    }

    $author = null;
    if (!empty($row['author_id']) || !empty($row['author_name'])) {
        $author = [
            'id' => !empty($row['author_id']) ? (int)$row['author_id'] : null,
            'full_name' => $row['author_name'] ?? 'Devansh',
            'avatar_url' => $row['author_avatar'] ?? null
        ];
    }

    $tags = [];
    if (!empty($row['tags'])) {
        if (is_array($row['tags'])) {
            $tags = $row['tags'];
        } else {
            $decoded = json_decode($row['tags'], true);
            $tags = is_array($decoded) ? $decoded : [];
        }
    }

    $article = [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'excerpt' => $row['excerpt'],
        'cover_image' => $row['cover_image'],
        'category' => $category,
        'author' => $author,
        'status' => $row['status'],
        'featured' => (bool)$row['featured'],
        'tags' => $tags,
        'meta_description' => $row['meta_description'] ?? null,
        'reading_time' => (int)$row['reading_time'],
        'views' => (int)$row['views'],
        'published_at' => $row['published_at'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'] ?? null
    ];

    if ($includeContent) {
        $article['content'] = $row['content'];
    }

    return $article;
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET requests (Single article or List articles)
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;

    // Single article view
    if ($id || $slug) {
        $sql = "SELECT 
                    a.id, a.title, a.slug, a.excerpt, a.content, a.cover_image,
                    a.status, a.featured, a.tags, a.meta_description, a.reading_time,
                    a.views, a.published_at, a.created_at, a.updated_at,
                    c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.color AS category_color, c.icon AS category_icon,
                    u.id AS author_id, u.full_name AS author_name, u.avatar_url AS author_avatar
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE " . ($id ? "a.id = :param" : "a.slug = :param") . " LIMIT 1";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':param' => $id ? $id : $slug]);
        $row = $stmt->fetch();

        if (!$row) {
            jsonResponse(['success' => false, 'message' => 'Article not found'], 404);
        }

        // Increment views if status is published
        if ($row['status'] === 'published') {
            try {
                $upStmt = $pdo->prepare("UPDATE articles SET views = views + 1 WHERE id = :id");
                $upStmt->execute([':id' => $row['id']]);
                $row['views'] = (int)$row['views'] + 1;
            } catch (PDOException $e) {
                // Ignore view increment failure
            }
        }

        jsonResponse([
            'success' => true,
            'data' => formatArticleRow($row, true)
        ], 200);
    }

    // List articles with filters and pagination
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;

    $whereConditions = [];
    $queryParams = [];

    // Auth check for status filtering
    $currentUser = authenticate($pdo, $config);
    $statusParam = isset($_GET['status']) ? trim($_GET['status']) : null;

    if ($statusParam !== null) {
        if ($statusParam === 'all') {
            if (!$currentUser) {
                $whereConditions[] = "a.status = 'published'";
            }
        } else {
            $whereConditions[] = "a.status = :status";
            $queryParams[':status'] = $statusParam;
        }
    } else {
        if (!$currentUser) {
            $whereConditions[] = "a.status = 'published'";
        }
    }

    // Category filter by slug
    if (!empty($_GET['category'])) {
        $whereConditions[] = "c.slug = :category";
        $queryParams[':category'] = trim($_GET['category']);
    }

    // Search query filter (title, content, excerpt)
    if (!empty($_GET['search'])) {
        $searchTerm = '%' . trim($_GET['search']) . '%';
        $whereConditions[] = "(a.title LIKE :search1 OR a.content LIKE :search2 OR a.excerpt LIKE :search3)";
        $queryParams[':search1'] = $searchTerm;
        $queryParams[':search2'] = $searchTerm;
        $queryParams[':search3'] = $searchTerm;
    }

    // Featured filter
    if (isset($_GET['featured'])) {
        $whereConditions[] = "a.featured = :featured";
        $queryParams[':featured'] = (int)$_GET['featured'] ? 1 : 0;
    }

    $whereSql = !empty($whereConditions) ? " WHERE " . implode(" AND ", $whereConditions) : "";

    // Count total matching articles
    $countSql = "SELECT COUNT(*) as total 
                 FROM articles a 
                 LEFT JOIN categories c ON a.category_id = c.id 
                 {$whereSql}";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($queryParams);
    $totalCount = (int)$countStmt->fetchColumn();

    // Query paginated articles
    $articlesSql = "SELECT 
                        a.id, a.title, a.slug, a.excerpt, a.cover_image,
                        a.status, a.featured, a.tags, a.meta_description, a.reading_time,
                        a.views, a.published_at, a.created_at,
                        c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.color AS category_color, c.icon AS category_icon,
                        u.id AS author_id, u.full_name AS author_name, u.avatar_url AS author_avatar
                    FROM articles a
                    LEFT JOIN categories c ON a.category_id = c.id
                    LEFT JOIN users u ON a.author_id = u.id
                    {$whereSql}
                    ORDER BY a.published_at DESC, a.created_at DESC
                    LIMIT {$limit} OFFSET {$offset}";

    $stmt = $pdo->prepare($articlesSql);
    $stmt->execute($queryParams);
    $rows = $stmt->fetchAll();

    $articles = array_map(function ($row) {
        return formatArticleRow($row, false);
    }, $rows);

    $totalPages = $limit > 0 ? (int)ceil($totalCount / $limit) : 1;

    jsonResponse([
        'success' => true,
        'data' => $articles,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalCount,
            'pages' => $totalPages
        ]
    ], 200);
}

// Handle POST request (Create Article - Auth Required)
if ($method === 'POST') {
    $user = authenticate($pdo, $config);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    $body = getRequestBody();
    $title = trim($body['title'] ?? '');
    $content = trim($body['content'] ?? '');
    $excerpt = trim($body['excerpt'] ?? '');
    $coverImage = trim($body['cover_image'] ?? '');
    $categoryId = !empty($body['category_id']) ? (int)$body['category_id'] : null;
    $status = in_array($body['status'] ?? '', ['draft', 'published', 'archived']) ? $body['status'] : 'draft';
    $featured = !empty($body['featured']) ? 1 : 0;
    $metaDescription = trim($body['meta_description'] ?? '');

    if (empty($title)) {
        jsonResponse(['success' => false, 'message' => 'Title is required'], 400);
    }

    // Auto-generate unique slug
    $slug = !empty($body['slug']) ? generateUniqueSlug($body['slug'], $pdo) : generateUniqueSlug($title, $pdo);

    // Auto-calculate reading time
    $words = str_word_count(strip_tags($content));
    $readingTime = isset($body['reading_time']) && (int)$body['reading_time'] > 0 
        ? (int)$body['reading_time'] 
        : max(1, (int)ceil($words / 200));

    // Auto-generate excerpt if missing
    if (empty($excerpt)) {
        $cleanContent = trim(preg_replace('/\s+/', ' ', strip_tags($content)));
        $excerpt = mb_substr($cleanContent, 0, 160) . (mb_strlen($cleanContent) > 160 ? '...' : '');
    }

    // Auto-generate meta description if missing
    if (empty($metaDescription)) {
        $metaDescription = mb_substr($excerpt, 0, 250);
    }

    // Tags JSON
    $tags = [];
    if (isset($body['tags'])) {
        $tags = is_array($body['tags']) ? $body['tags'] : (json_decode($body['tags'], true) ?: []);
    }
    $tagsJson = json_encode(array_values($tags));

    // Published timestamp
    $publishedAt = null;
    if ($status === 'published') {
        $publishedAt = !empty($body['published_at']) ? $body['published_at'] : date('Y-m-d H:i:s');
    }

    try {
        $sql = "INSERT INTO articles (title, slug, excerpt, content, cover_image, category_id, author_id, status, featured, tags, meta_description, reading_time, published_at)
                VALUES (:title, :slug, :excerpt, :content, :cover_image, :category_id, :author_id, :status, :featured, :tags, :meta_description, :reading_time, :published_at)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $title,
            ':slug' => $slug,
            ':excerpt' => $excerpt,
            ':content' => $content,
            ':cover_image' => $coverImage,
            ':category_id' => $categoryId,
            ':author_id' => $user['id'],
            ':status' => $status,
            ':featured' => $featured,
            ':tags' => $tagsJson,
            ':meta_description' => $metaDescription,
            ':reading_time' => $readingTime,
            ':published_at' => $publishedAt
        ]);

        $newId = (int)$pdo->lastInsertId();

        // Fetch newly created article
        $fetchStmt = $pdo->prepare("SELECT a.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color, c.icon AS category_icon, u.full_name AS author_name, u.avatar_url AS author_avatar FROM articles a LEFT JOIN categories c ON a.category_id = c.id LEFT JOIN users u ON a.author_id = u.id WHERE a.id = :id");
        $fetchStmt->execute([':id' => $newId]);
        $newRow = $fetchStmt->fetch();

        jsonResponse([
            'success' => true,
            'message' => 'Article created successfully',
            'data' => formatArticleRow($newRow, true)
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to create article: ' . $e->getMessage()], 500);
    }
}

// Handle PUT request (Update Article - Auth Required)
if ($method === 'PUT') {
    $user = authenticate($pdo, $config);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    $body = getRequestBody();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (!empty($body['id']) ? (int)$body['id'] : null);

    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Article ID is required'], 400);
    }

    // Check existing article
    $checkStmt = $pdo->prepare("SELECT * FROM articles WHERE id = :id LIMIT 1");
    $checkStmt->execute([':id' => $id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        jsonResponse(['success' => false, 'message' => 'Article not found'], 404);
    }

    // Prepare fields to update
    $fields = [];
    $params = [':id' => $id];

    if (isset($body['title'])) {
        $title = trim($body['title']);
        if (empty($title)) {
            jsonResponse(['success' => false, 'message' => 'Title cannot be empty'], 400);
        }
        $fields[] = "title = :title";
        $params[':title'] = $title;

        // Update slug if title changed and slug not explicitly given
        if (!isset($body['slug'])) {
            $newSlug = generateUniqueSlug($title, $pdo, $id);
            $fields[] = "slug = :slug";
            $params[':slug'] = $newSlug;
        }
    }

    if (isset($body['slug'])) {
        $slug = generateUniqueSlug($body['slug'], $pdo, $id);
        $fields[] = "slug = :slug";
        $params[':slug'] = $slug;
    }

    if (isset($body['excerpt'])) {
        $fields[] = "excerpt = :excerpt";
        $params[':excerpt'] = trim($body['excerpt']);
    }

    if (isset($body['content'])) {
        $content = trim($body['content']);
        $fields[] = "content = :content";
        $params[':content'] = $content;

        if (!isset($body['reading_time'])) {
            $words = str_word_count(strip_tags($content));
            $readingTime = max(1, (int)ceil($words / 200));
            $fields[] = "reading_time = :reading_time";
            $params[':reading_time'] = $readingTime;
        }
    }

    if (isset($body['reading_time'])) {
        $fields[] = "reading_time = :reading_time";
        $params[':reading_time'] = (int)$body['reading_time'];
    }

    if (isset($body['cover_image'])) {
        $fields[] = "cover_image = :cover_image";
        $params[':cover_image'] = trim($body['cover_image']);
    }

    if (array_key_exists('category_id', $body)) {
        $fields[] = "category_id = :category_id";
        $params[':category_id'] = !empty($body['category_id']) ? (int)$body['category_id'] : null;
    }

    if (isset($body['status'])) {
        $status = in_array($body['status'], ['draft', 'published', 'archived']) ? $body['status'] : $existing['status'];
        $fields[] = "status = :status";
        $params[':status'] = $status;

        // If newly published and published_at was empty
        if ($status === 'published' && empty($existing['published_at'])) {
            $fields[] = "published_at = :published_at";
            $params[':published_at'] = date('Y-m-d H:i:s');
        }
    }

    if (isset($body['featured'])) {
        $fields[] = "featured = :featured";
        $params[':featured'] = !empty($body['featured']) ? 1 : 0;
    }

    if (isset($body['tags'])) {
        $tags = is_array($body['tags']) ? $body['tags'] : (json_decode($body['tags'], true) ?: []);
        $fields[] = "tags = :tags";
        $params[':tags'] = json_encode(array_values($tags));
    }

    if (isset($body['meta_description'])) {
        $fields[] = "meta_description = :meta_description";
        $params[':meta_description'] = trim($body['meta_description']);
    }

    if (empty($fields)) {
        jsonResponse(['success' => false, 'message' => 'No fields provided to update'], 400);
    }

    try {
        $updateSql = "UPDATE articles SET " . implode(", ", $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($updateSql);
        $stmt->execute($params);

        // Fetch updated record
        $fetchStmt = $pdo->prepare("SELECT a.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color, c.icon AS category_icon, u.full_name AS author_name, u.avatar_url AS author_avatar FROM articles a LEFT JOIN categories c ON a.category_id = c.id LEFT JOIN users u ON a.author_id = u.id WHERE a.id = :id");
        $fetchStmt->execute([':id' => $id]);
        $updatedRow = $fetchStmt->fetch();

        jsonResponse([
            'success' => true,
            'message' => 'Article updated successfully',
            'data' => formatArticleRow($updatedRow, true)
        ], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to update article: ' . $e->getMessage()], 500);
    }
}

// Handle DELETE request (Delete Article - Auth Required)
if ($method === 'DELETE') {
    $user = authenticate($pdo, $config);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    $body = getRequestBody();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (!empty($body['id']) ? (int)$body['id'] : null);

    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Article ID is required'], 400);
    }

    try {
        $checkStmt = $pdo->prepare("SELECT id FROM articles WHERE id = :id LIMIT 1");
        $checkStmt->execute([':id' => $id]);
        if (!$checkStmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'Article not found'], 404);
        }

        $delStmt = $pdo->prepare("DELETE FROM articles WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        jsonResponse([
            'success' => true,
            'message' => 'Article deleted successfully'
        ], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to delete article: ' . $e->getMessage()], 500);
    }
}

jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
