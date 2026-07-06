<?php
/* ============================================================
   Bruma — api/_lib.php
   Helpers compartidos por todos los endpoints.
   ============================================================ */

declare(strict_types=1);

define('DATA_DIR', __DIR__ . '/../data');
define('UPLOAD_DIR', __DIR__ . '/../img/uploads');
define('UPLOAD_URL_BASE', 'img/uploads/');
define('MAX_UPLOAD_BYTES', 3 * 1024 * 1024);

session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 30,
    'path'     => '/',
    'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');

function json_response($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): void {
    json_response(['error' => $message], $status);
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/* Lee un archivo de datos JSON con lock compartido. Si no existe, devuelve $default. */
function read_data_file(string $name, $default) {
    $path = DATA_DIR . '/' . $name;
    if (!file_exists($path)) return $default;
    $fp = fopen($path, 'r');
    if (!$fp) return $default;
    flock($fp, LOCK_SH);
    $contents = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    if (trim($contents) === '') return $default;
    $data = json_decode($contents, true);
    return $data === null ? $default : $data;
}

/* Escribe un archivo de datos JSON con lock exclusivo. */
function write_data_file(string $name, $data): void {
    $path = DATA_DIR . '/' . $name;
    $fp = fopen($path, 'c+');
    if (!$fp) {
        json_error('No se pudo guardar ' . $name, 500);
    }
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

function is_admin(): bool {
    return !empty($_SESSION['admin']);
}

function require_admin(): void {
    if (!is_admin()) {
        json_error('No autorizado. Iniciá sesión de nuevo.', 401);
    }
}

function gen_id(string $prefix = 'prod'): string {
    return $prefix . '_' . str_replace('.', '', (string) microtime(true)) . '_' . bin2hex(random_bytes(3));
}

function request_method(): string {
    return $_SERVER['REQUEST_METHOD'] ?? 'GET';
}
