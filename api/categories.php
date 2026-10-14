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

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET: List all categories with article count
if ($method === 'GET') {
    try {
        $sql = "SELECT 
                    c.id, 
                    c.name, 
                    c.slug, 
                    c.description, 
                    c.icon, 
                    c.color, 
                    c.created_at,
                    COUNT(CASE WHEN a.status = 'published' THEN 1 END) AS article_count
                FROM categories c
                LEFT JOIN articles a ON a.category_id = c.id
                GROUP BY c.id
                ORDER BY c.name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $categories = $stmt->fetchAll();

        $formatted = array_map(function ($cat) {
            return [
                'id' => (int)$cat['id'],
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'description' => $cat['description'],
                'icon' => $cat['icon'],
                'color' => $cat['color'],
                'article_count' => (int)$cat['article_count'],
                'created_at' => $cat['created_at']
            ];
        }, $categories);

        jsonResponse([
            'success' => true,
            'data' => $formatted
        ], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to fetch categories: ' . $e->getMessage()], 500);
    }
}

// Handle POST: Create new category (Auth required)
if ($method === 'POST') {
    $user = authenticate($pdo, $config);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    $body = getRequestBody();
    $name = trim($body['name'] ?? '');
    $slug = trim($body['slug'] ?? '');
    $description = trim($body['description'] ?? '');
    $icon = trim($body['icon'] ?? 'folder');
    $color = trim($body['color'] ?? '#6366f1');

    if (empty($name)) {
        jsonResponse(['success' => false, 'message' => 'Category name is required'], 400);
    }

    if (empty($slug)) {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9-]+/', '-', $name));
        $slug = trim($slug, '-');
    }

    try {
        // Check uniqueness of slug
        $checkStmt = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug LIMIT 1");
        $checkStmt->execute([':slug' => $slug]);
        if ($checkStmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'Category slug already exists'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description, icon, color) VALUES (:name, :slug, :description, :icon, :color)");
        $stmt->execute([
            ':name' => $name,
            ':slug' => $slug,
            ':description' => $description,
            ':icon' => $icon,
            ':color' => $color
        ]);

        $newId = (int)$pdo->lastInsertId();

        jsonResponse([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => [
                'id' => $newId,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'icon' => $icon,
                'color' => $color,
                'article_count' => 0
            ]
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to create category: ' . $e->getMessage()], 500);
    }
}

// Handle PUT: Update category (Auth required)
if ($method === 'PUT') {
    $user = authenticate($pdo, $config);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    $body = getRequestBody();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (!empty($body['id']) ? (int)$body['id'] : null);

    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Category ID is required'], 400);
    }

    try {
        $checkStmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id LIMIT 1");
        $checkStmt->execute([':id' => $id]);
        $existing = $checkStmt->fetch();

        if (!$existing) {
            jsonResponse(['success' => false, 'message' => 'Category not found'], 404);
        }

        $name = isset($body['name']) ? trim($body['name']) : $existing['name'];
        $slug = isset($body['slug']) ? trim($body['slug']) : $existing['slug'];
        $description = isset($body['description']) ? trim($body['description']) : $existing['description'];
        $icon = isset($body['icon']) ? trim($body['icon']) : $existing['icon'];
        $color = isset($body['color']) ? trim($body['color']) : $existing['color'];

        if ($slug !== $existing['slug']) {
            $slugCheck = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug AND id != :id LIMIT 1");
            $slugCheck->execute([':slug' => $slug, ':id' => $id]);
            if ($slugCheck->fetch()) {
                jsonResponse(['success' => false, 'message' => 'Slug already taken'], 400);
            }
        }

        $updateStmt = $pdo->prepare("UPDATE categories SET name = :name, slug = :slug, description = :description, icon = :icon, color = :color WHERE id = :id");
        $updateStmt->execute([
            ':name' => $name,
            ':slug' => $slug,
            ':description' => $description,
            ':icon' => $icon,
            ':color' => $color,
            ':id' => $id
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => [
                'id' => $id,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'icon' => $icon,
                'color' => $color
            ]
        ], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to update category: ' . $e->getMessage()], 500);
    }
}

// Handle DELETE: Delete category (Auth required)
if ($method === 'DELETE') {
    $user = authenticate($pdo, $config);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }

    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        $body = getRequestBody();
        $id = !empty($body['id']) ? (int)$body['id'] : null;
    }

    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Category ID is required'], 400);
    }

    try {
        $delStmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Category deleted successfully'], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to delete category: ' . $e->getMessage()], 500);
    }
}

jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
