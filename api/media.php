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

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET: List all media files
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, filename, original_name, mime_type, file_size, url, alt_text, created_at FROM media ORDER BY created_at DESC");
        $stmt->execute();
        $mediaList = $stmt->fetchAll();

        $formatted = array_map(function ($item) {
            return [
                'id' => (int)$item['id'],
                'filename' => $item['filename'],
                'original_name' => $item['original_name'],
                'url' => $item['url'],
                'mime_type' => $item['mime_type'],
                'file_size' => (int)$item['file_size'],
                'alt_text' => $item['alt_text'],
                'created_at' => $item['created_at']
            ];
        }, $mediaList);

        jsonResponse([
            'success' => true,
            'data' => $formatted
        ], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to retrieve media: ' . $e->getMessage()], 500);
    }
}

// Handle POST: Upload media file (multipart/form-data)
if ($method === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
        jsonResponse(['success' => false, 'message' => 'No file was uploaded in the "file" field'], 400);
    }

    $uploadedFile = $_FILES['file'];

    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive in form',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
        ];
        $msg = $errorMessages[$uploadedFile['error']] ?? 'Unknown upload error occurred';
        jsonResponse(['success' => false, 'message' => $msg], 400);
    }

    // Check size limit
    $maxSize = $config['max_upload_size'] ?? (5 * 1024 * 1024);
    if ($uploadedFile['size'] > $maxSize) {
        $maxMB = round($maxSize / (1024 * 1024), 1);
        jsonResponse(['success' => false, 'message' => "File size exceeds the allowed limit of {$maxMB}MB"], 400);
    }

    // Validate MIME type
    $allowedTypes = $config['allowed_types'] ?? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    $mimeType = $uploadedFile['type'];
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_file($finfo, $uploadedFile['tmp_name']);
            finfo_close($finfo);
            if (!empty($detected)) {
                $mimeType = $detected;
            }
        }
    }

    // Handle SVG detection edge case
    if ($mimeType === 'text/plain' || $mimeType === 'image/svg') {
        $ext = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
        if ($ext === 'svg') {
            $mimeType = 'image/svg+xml';
        }
    }

    if (!in_array($mimeType, $allowedTypes, true)) {
        jsonResponse(['success' => false, 'message' => 'Invalid file type: ' . htmlspecialchars($mimeType) . '. Allowed types: JPG, PNG, GIF, WebP, SVG'], 400);
    }

    // Sanitize original filename and generate safe unique name
    $originalName = basename($uploadedFile['name']);
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    
    // Ensure extension is safe
    $safeExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (!in_array($extension, $safeExtensions, true)) {
        jsonResponse(['success' => false, 'message' => 'Unsafe file extension.'], 400);
    }

    $sanitizedOriginal = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($originalName, PATHINFO_FILENAME));
    if (empty($sanitizedOriginal)) {
        $sanitizedOriginal = 'upload';
    }

    $uniqueFilename = uniqid('media_', true) . '_' . substr($sanitizedOriginal, 0, 30) . '.' . $extension;

    // Upload directory resolution
    $uploadDir = rtrim($config['upload_dir'] ?? (__DIR__ . '/../assets/uploads/'), '/\\') . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir)) {
        if (!@mkdir($uploadDir, 0755, true)) {
            jsonResponse(['success' => false, 'message' => 'Failed to create upload directory on server'], 500);
        }
    }

    $targetPath = $uploadDir . $uniqueFilename;
    if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        jsonResponse(['success' => false, 'message' => 'Failed to move uploaded file to destination folder'], 500);
    }

    // Construct URL
    $uploadUrl = rtrim($config['upload_url'] ?? '/assets/uploads/', '/') . '/';
    $fileUrl = $uploadUrl . $uniqueFilename;

    $altText = trim($_POST['alt_text'] ?? pathinfo($originalName, PATHINFO_FILENAME));

    try {
        $insertStmt = $pdo->prepare("INSERT INTO media (filename, original_name, mime_type, file_size, url, alt_text, uploaded_by) VALUES (:filename, :original_name, :mime_type, :file_size, :url, :alt_text, :uploaded_by)");
        $insertStmt->execute([
            ':filename' => $uniqueFilename,
            ':original_name' => $originalName,
            ':mime_type' => $mimeType,
            ':file_size' => (int)$uploadedFile['size'],
            ':url' => $fileUrl,
            ':alt_text' => $altText,
            ':uploaded_by' => $user['id']
        ]);

        $newId = (int)$pdo->lastInsertId();

        jsonResponse([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => [
                'id' => $newId,
                'url' => $fileUrl,
                'filename' => $uniqueFilename,
                'original_name' => $originalName,
                'file_size' => (int)$uploadedFile['size'],
                'mime_type' => $mimeType,
                'alt_text' => $altText
            ]
        ], 201);
    } catch (PDOException $e) {
        // If DB insertion fails, remove uploaded file to avoid orphaned files
        if (file_exists($targetPath)) {
            @unlink($targetPath);
        }
        jsonResponse(['success' => false, 'message' => 'Failed to save media metadata: ' . $e->getMessage()], 500);
    }
}

// Handle DELETE: Remove media file
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        $body = getRequestBody();
        $id = !empty($body['id']) ? (int)$body['id'] : null;
    }

    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Media ID is required'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM media WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $media = $stmt->fetch();

        if (!$media) {
            jsonResponse(['success' => false, 'message' => 'Media not found'], 404);
        }

        // Delete physical file if present
        $uploadDir = rtrim($config['upload_dir'] ?? (__DIR__ . '/../assets/uploads/'), '/\\') . DIRECTORY_SEPARATOR;
        $realUploadDir = realpath($uploadDir);
        $filePath = $uploadDir . $media['filename'];
        $realFilePath = realpath($filePath);

        if ($realFilePath && $realUploadDir && strpos($realFilePath, $realUploadDir) === 0 && file_exists($realFilePath)) {
            @unlink($realFilePath);
        }

        $delStmt = $pdo->prepare("DELETE FROM media WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        jsonResponse([
            'success' => true,
            'message' => 'Media deleted successfully'
        ], 200);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Failed to delete media: ' . $e->getMessage()], 500);
    }
}

jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
