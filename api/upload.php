<?php
/* POST admin, multipart/form-data con campo "foto" → guarda la imagen y devuelve { url } */
require __DIR__ . '/_lib.php';

if (request_method() !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

if (empty($_FILES['foto']) || $_FILES['foto']['error'] === UPLOAD_ERR_NO_FILE) {
    json_error('No se recibió ninguna imagen.');
}

$foto = $_FILES['foto'];

if ($foto['error'] !== UPLOAD_ERR_OK) {
    json_error('Error al subir la imagen.');
}

if ($foto['size'] > MAX_UPLOAD_BYTES) {
    json_error('La imagen es demasiado grande. Máximo 3MB.');
}

$tiposPermitidos = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];

$mime = mime_content_type($foto['tmp_name']);
if (!isset($tiposPermitidos[$mime])) {
    json_error('Formato de imagen no soportado. Usá JPG, PNG, WEBP o GIF.');
}

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0775, true);
}

$nombreArchivo = gen_id('img') . '.' . $tiposPermitidos[$mime];
$destino = UPLOAD_DIR . '/' . $nombreArchivo;

if (!move_uploaded_file($foto['tmp_name'], $destino)) {
    json_error('No se pudo guardar la imagen en el servidor.', 500);
}

json_response(['ok' => true, 'url' => UPLOAD_URL_BASE . $nombreArchivo]);
