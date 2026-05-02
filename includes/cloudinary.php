<?php
// =============================================================
//  Glassico — Cloudinary Upload Helper
//  Manual signed upload — no SDK required.
// =============================================================

require_once __DIR__ . '/config.php';

/**
 * Upload a local file to Cloudinary and return the secure URL.
 *
 * @param  string      $tmp_path  Absolute path to the temporary file (e.g. $_FILES['image']['tmp_name'])
 * @param  string      $folder    Cloudinary folder, e.g. 'glassico/products'
 * @return string|null            secure_url on success, null on failure
 */
function upload_to_cloudinary(string $tmp_path, string $folder, ?string &$error_message = null): ?string
{
    if (!file_exists($tmp_path) || !is_readable($tmp_path)) {
        $error_message = 'File not found or not readable.';
        error_log('[Cloudinary] ' . $error_message . ' Path: ' . $tmp_path);
        return null;
    }

    $cloud_name = CLOUDINARY_CLOUD_NAME;
    $api_key    = CLOUDINARY_API_KEY;
    $api_secret = CLOUDINARY_API_SECRET;

    // Build signature
    $timestamp       = time();
    $params_to_sign  = 'folder=' . $folder . '&timestamp=' . $timestamp;
    $signature       = sha1($params_to_sign . $api_secret);

    $endpoint = 'https://api.cloudinary.com/v1_1/' . $cloud_name . '/image/upload';

    // Build multipart POST fields
    $post_fields = [
        'file'      => new CURLFile($tmp_path),
        'api_key'   => $api_key,
        'timestamp' => $timestamp,
        'signature' => $signature,
        'folder'    => $folder,
    ];

    $ch = curl_init();
    $curl_options = [
        CURLOPT_URL            => $endpoint,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $post_fields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ];

    // XAMPP/Windows often needs an explicit CA bundle path for HTTPS verification.
    $ca_candidates = [];
    $curl_cainfo   = ini_get('curl.cainfo');
    $openssl_cafile = ini_get('openssl.cafile');
    if ($curl_cainfo) {
        $ca_candidates[] = $curl_cainfo;
    }
    if ($openssl_cafile) {
        $ca_candidates[] = $openssl_cafile;
    }
    if (defined('PHP_BINARY') && PHP_BINARY) {
        $php_dir = dirname(PHP_BINARY);
        $ca_candidates[] = $php_dir . DIRECTORY_SEPARATOR . 'extras' . DIRECTORY_SEPARATOR . 'ssl' . DIRECTORY_SEPARATOR . 'cacert.pem';
        $ca_candidates[] = dirname($php_dir) . DIRECTORY_SEPARATOR . 'apache' . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'curl-ca-bundle.crt';
    }
    foreach ($ca_candidates as $ca_file) {
        if (is_string($ca_file) && $ca_file !== '' && file_exists($ca_file)) {
            $curl_options[CURLOPT_CAINFO] = $ca_file;
            break;
        }
    }

    curl_setopt_array($ch, $curl_options);

    $response_raw = curl_exec($ch);
    $curl_error   = curl_error($ch);
    $http_code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curl_error) {
        $error_message = 'Cloudinary connection error: ' . $curl_error;
        error_log('[Cloudinary] cURL error: ' . $curl_error);
        return null;
    }

    $response = json_decode($response_raw, true);

    if ($http_code !== 200 || empty($response['secure_url'])) {
        $detail = $response['error']['message'] ?? $response_raw;
        $error_message = 'Cloudinary upload failed: ' . $detail;
        error_log('[Cloudinary] Upload failed (HTTP ' . $http_code . '): ' . $detail);
        return null;
    }

    return $response['secure_url'];
}

/**
 * Delete an asset from Cloudinary by public_id.
 * Useful when replacing or removing a product image.
 *
 * @param  string $public_id  e.g. 'glassico/products/abc123'
 * @return bool
 */
function delete_from_cloudinary(string $public_id): bool
{
    $cloud_name = CLOUDINARY_CLOUD_NAME;
    $api_key    = CLOUDINARY_API_KEY;
    $api_secret = CLOUDINARY_API_SECRET;

    $timestamp      = time();
    $params_to_sign = 'public_id=' . $public_id . '&timestamp=' . $timestamp;
    $signature      = sha1($params_to_sign . $api_secret);

    $endpoint = 'https://api.cloudinary.com/v1_1/' . $cloud_name . '/image/destroy';

    $post_fields = [
        'public_id' => $public_id,
        'api_key'   => $api_key,
        'timestamp' => $timestamp,
        'signature' => $signature,
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $endpoint,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($post_fields),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response_raw = curl_exec($ch);
    $curl_error   = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        error_log('[Cloudinary] Delete cURL error: ' . $curl_error);
        return false;
    }

    $response = json_decode($response_raw, true);
    return ($response['result'] ?? '') === 'ok';
}
