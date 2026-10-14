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

$user = authenticate($pdo, $config);
if (!$user) {
    jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

try {
    // Total articles
    $totalArticles = (int)$pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn();

    // Total views
    $totalViews = (int)$pdo->query("SELECT COALESCE(SUM(views), 0) FROM articles")->fetchColumn();

    // Published articles count
    $publishedCount = (int)$pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'published'")->fetchColumn();

    // Drafts count
    $draftsCount = (int)$pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'draft'")->fetchColumn();

    // Top 5 recent articles
    $recentStmt = $pdo->query(
        "SELECT a.id, a.title, a.slug, a.status, a.views, a.published_at, a.created_at, 
                c.name AS category_name, c.color AS category_color 
         FROM articles a 
         LEFT JOIN categories c ON a.category_id = c.id 
         ORDER BY a.created_at DESC 
         LIMIT 5"
    );
    $recentArticles = $recentStmt->fetchAll();
    $formattedRecent = array_map(function ($row) {
        return [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'status' => $row['status'],
            'views' => (int)$row['views'],
            'category_name' => $row['category_name'],
            'category_color' => $row['category_color'],
            'published_at' => $row['published_at'],
            'created_at' => $row['created_at']
        ];
    }, $recentArticles);

    // Top 5 popular articles by views
    $popularStmt = $pdo->query(
        "SELECT a.id, a.title, a.slug, a.status, a.views, a.published_at, 
                c.name AS category_name, c.color AS category_color 
         FROM articles a 
         LEFT JOIN categories c ON a.category_id = c.id 
         ORDER BY a.views DESC 
         LIMIT 5"
    );
    $popularArticles = $popularStmt->fetchAll();
    $formattedPopular = array_map(function ($row) {
        return [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'status' => $row['status'],
            'views' => (int)$row['views'],
            'category_name' => $row['category_name'],
            'category_color' => $row['category_color'],
            'published_at' => $row['published_at']
        ];
    }, $popularArticles);

    // Category breakdown
    $categoryStmt = $pdo->query(
        "SELECT c.name, COUNT(a.id) AS count 
         FROM categories c 
         LEFT JOIN articles a ON a.category_id = c.id 
         GROUP BY c.id, c.name 
         ORDER BY count DESC"
    );
    $categoryStats = $categoryStmt->fetchAll();
    $formattedCategoryStats = array_map(function ($row) {
        return [
            'name' => $row['name'],
            'count' => (int)$row['count']
        ];
    }, $categoryStats);

    jsonResponse([
        'success' => true,
        'data' => [
            'total_articles' => $totalArticles,
            'total_views' => $totalViews,
            'published' => $publishedCount,
            'drafts' => $draftsCount,
            'recent_articles' => $formattedRecent,
            'popular_articles' => $formattedPopular,
            'category_stats' => $formattedCategoryStats
        ]
    ], 200);
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'message' => 'Failed to calculate stats: ' . $e->getMessage()], 500);
}
