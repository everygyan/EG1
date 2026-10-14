<?php
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'your_database_name',
        'user' => 'your_database_user',
        'pass' => 'your_database_password',
        'charset' => 'utf8mb4'
    ],
    'jwt_secret' => 'change-this-to-a-random-secret-key-at-least-32-chars',
    'upload_dir' => __DIR__ . '/../assets/uploads/',
    'upload_url' => '/assets/uploads/',
    'max_upload_size' => 5 * 1024 * 1024, // 5MB
    'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
];
