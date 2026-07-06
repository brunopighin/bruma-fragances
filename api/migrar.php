<?php
/* POST admin, uso único → recibe lo que hoy vive en localStorage del navegador
   (productos, settings, consultas) y lo vuelca a los archivos del servidor.
   Las fotos que vengan como base64 (data:image/...) se guardan como archivos reales. */
require __DIR__ . '/_lib.php';

if (request_method() !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

$body = read_json_body();

$productosExistentes = read_data_file('productos.json', []);
if (!empty($productosExistentes)) {
    json_error('Ya hay productos cargados en el servidor. Para evitar duplicados, esta migración solo puede hacerse una vez con el servidor vacío.', 409);
}

function migrar_guardar_imagen_si_es_base64($valor) {
    if (!is_string($valor) || strpos($valor, 'data:image/') !== 0) {
        return $valor; // ya es una URL/ruta normal, o está vacío
    }

    if (!preg_match('/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/', $valor, $m)) {
        return null; // formato de imagen no reconocido, se descarta
    }

    $ext  = $m[1] === 'jpeg' ? 'jpg' : $m[1];
    $data = base64_decode($m[2]);
    if ($data === false) return null;

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0775, true);
    }

    $nombreArchivo = gen_id('img') . '.' . $ext;
    file_put_contents(UPLOAD_DIR . '/' . $nombreArchivo, $data);

    return UPLOAD_URL_BASE . $nombreArchivo;
}

$productosMigrados = [];
foreach ((array) ($body['productos'] ?? []) as $p) {
    if (empty($p['nombre'])) continue;
    $productosMigrados[] = [
        'id'              => (string) ($p['id'] ?? gen_id('prod')),
        'nombre'          => (string) $p['nombre'],
        'marca'           => (string) ($p['marca'] ?? ''),
        'categoria'       => (string) ($p['categoria'] ?? ''),
        'categoriaNombre' => (string) ($p['categoriaNombre'] ?? ''),
        'badge'           => ($p['badge'] ?? null) !== '' ? ($p['badge'] ?? null) : null,
        'precio'          => is_numeric($p['precio'] ?? null) ? (float) $p['precio'] : 0,
        'stock'           => isset($p['stock']) && $p['stock'] !== '' ? (int) $p['stock'] : null,
        'descripcion'     => (string) ($p['descripcion'] ?? ''),
        'volumen'         => !empty($p['volumen']) && is_array($p['volumen']) ? array_values($p['volumen']) : null,
        'destacado'       => !empty($p['destacado']),
        'imagen'          => migrar_guardar_imagen_si_es_base64($p['imagen'] ?? null),
        'imagenTrasera'   => migrar_guardar_imagen_si_es_base64($p['imagenTrasera'] ?? null),
    ];
}
write_data_file('productos.json', $productosMigrados);

if (!empty($body['settings']) && is_array($body['settings'])) {
    write_data_file('settings.json', $body['settings']);
}

if (!empty($body['consultas']) && is_array($body['consultas'])) {
    write_data_file('consultas.json', $body['consultas']);
}

json_response(['ok' => true, 'productos' => count($productosMigrados)]);
