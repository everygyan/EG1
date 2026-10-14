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
            // Also check POST/GET token fallback
            $body = getRequestBody();
            $token = $body['token'] ?? ($_GET['token'] ?? null);
        }

        if (!$token) {
            return false;
        }

        try {
            $stmt = $pdo->prepare(
                "SELECT u.id, u.username, u.email, u.full_name, u.bio, u.avatar_url, u.role, t.expires_at 
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
$body = getRequestBody();
$action = $body['action'] ?? ($_GET['action'] ?? ($method === 'GET' ? 'verify' : ''));

if ($action === 'login') {
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    if (empty($username) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Username and password are required'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT id, username, email, password_hash, full_name, bio, avatar_url, role FROM users WHERE username = :u OR email = :u LIMIT 1");
        $stmt->execute([':u' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonResponse(['success' => false, 'message' => 'Invalid username or password'], 401);
        }

        // Generate token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        $insertToken = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)");
        $insertToken->execute([
            ':user_id' => $user['id'],
            ':token' => $token,
            ':expires_at' => $expiresAt
        ]);

        // Start session if available
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            @session_start();
            $_SESSION['auth_token'] = $token;
            $_SESSION['user_id'] = $user['id'];
        }

        unset($user['password_hash']);

        jsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'bio' => $user['bio'],
                'avatar_url' => $user['avatar_url'],
                'role' => $user['role']
            ]
        ], 200);
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Login error: ' . $e->getMessage()], 500);
    }
} elseif ($action === 'logout') {
    $token = getBearerToken() ?? ($body['token'] ?? null);

    if ($token) {
        try {
            $delStmt = $pdo->prepare("DELETE FROM auth_tokens WHERE token = :token");
            $delStmt->execute([':token' => $token]);
        } catch (PDOException $e) {
            // Ignore token deletion error on logout
        }
    }

    if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
        @session_start();
    }
    if (session_status() === PHP_SESSION_ACTIVE) {
        $_SESSION = [];
        @session_destroy();
    }

    jsonResponse(['success' => true, 'message' => 'Logged out successfully'], 200);
} elseif ($action === 'verify') {
    $user = authenticate($pdo, $config);

    if ($user) {
        jsonResponse([
            'success' => true,
            'user' => [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'bio' => $user['bio'],
                'avatar_url' => $user['avatar_url'],
                'role' => $user['role']
            ]
        ], 200);
    } else {
        jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
    }
} else {
    jsonResponse(['success' => false, 'message' => 'Invalid or missing action'], 400);
}
