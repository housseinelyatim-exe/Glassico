<?php
// =============================================================
//  Glassico — API: Image Upload (admin only)
//  POST multipart/form-data with field "image"
//  → uploads to Cloudinary → returns secure_url
// =============================================================

require_once '../includes/cors.php';
require_once '../includes/db.php';
require_once '../includes/cloudinary.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
    exit;
}

require_admin();

// Validate upload
if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit.',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit.',
        UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the upload.',
    ];

    $errCode = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
    $errMsg  = $uploadErrors[$errCode] ?? 'Unknown upload error.';

    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => $errMsg]);
    exit;
}

$file     = $_FILES['image'];
$tmpPath  = $file['tmp_name'];
$origName = $file['name'];
$mimeType = mime_content_type($tmpPath);

// Allow only common image types
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $allowedMimes, true)) {
    http_response_code(415);
    echo json_encode([
        'success' => false,
        'data'    => null,
        'error'   => 'Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF.',
    ]);
    exit;
}

// 10 MB max
$maxBytes = 10 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(413);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'File exceeds 10 MB limit.']);
    exit;
}

$folder       = $_POST['folder'] ?? CLOUDINARY_FOLDER_PRODUCTS;
$cloudErr     = '';
$secureUrl    = upload_to_cloudinary($tmpPath, $folder, $cloudErr);

if (!$secureUrl) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data'    => null,
        'error'   => $cloudErr ?: 'Image upload to Cloudinary failed.',
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'data'    => ['url' => $secureUrl],
    'error'   => '',
]);
