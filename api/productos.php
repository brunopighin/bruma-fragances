<?php
/* GET público → lista de productos
   POST admin  → crea (sin id) o actualiza (con id) un producto.
                 Solo se pisan los campos presentes en el body (merge parcial),
                 así editar el precio no borra la foto si no se manda "imagen".
   DELETE admin ?id=... → elimina un producto */
require __DIR__ . '/_lib.php';

$metodo = request_method();

if ($metodo === 'GET') {
    json_response(read_data_file('productos.json', []));
}

if ($metodo === 'POST') {
    require_admin();
    $body = read_json_body();

    $nombre = trim((string) ($body['nombre'] ?? ''));
    if ($nombre === '') {
        json_error('El producto necesita un nombre.');
    }

    $productos = read_data_file('productos.json', []);
    $id = isset($body['id']) ? (string) $body['id'] : '';

    $base = [
        'nombre'          => '',
        'marca'           => '',
        'categoria'       => '',
        'categoriaNombre' => '',
        'badge'           => null,
        'precio'          => 0,
        'stock'           => null,
        'descripcion'     => '',
        'volumen'         => null,
        'destacado'       => false,
        'imagen'          => null,
        'imagenTrasera'   => null,
    ];

    $actual = $base;
    if ($id !== '') {
        $existente = null;
        foreach ($productos as $p) {
            if ($p['id'] === $id) { $existente = $p; break; }
        }
        if ($existente === null) {
            json_error('El producto no existe.', 404);
        }
        $actual = $existente;
    }

    // Devuelve el valor transformado del body si la clave vino en el request;
    // si no vino, conserva el valor que ya tenía el producto (o el default).
    $campo = function (string $clave, callable $transform) use ($body, $actual) {
        return array_key_exists($clave, $body) ? $transform($body[$clave]) : $actual[$clave];
    };

    $producto = [
        'nombre'          => $nombre,
        'marca'           => $campo('marca', fn($v) => (string) $v),
        'categoria'       => $campo('categoria', fn($v) => (string) $v),
        'categoriaNombre' => $campo('categoriaNombre', fn($v) => (string) $v),
        'badge'           => $campo('badge', fn($v) => $v !== '' && $v !== null ? $v : null),
        'precio'          => $campo('precio', fn($v) => is_numeric($v) ? (float) $v : 0),
        'stock'           => $campo('stock', fn($v) => ($v !== '' && $v !== null) ? (int) $v : null),
        'descripcion'     => $campo('descripcion', fn($v) => (string) $v),
        'volumen'         => $campo('volumen', fn($v) => (!empty($v) && is_array($v)) ? array_values($v) : null),
        'destacado'       => $campo('destacado', fn($v) => !empty($v)),
        'imagen'          => $campo('imagen', fn($v) => $v !== '' && $v !== null ? $v : null),
        'imagenTrasera'   => $campo('imagenTrasera', fn($v) => $v !== '' && $v !== null ? $v : null),
    ];
    $producto['id'] = $id !== '' ? $id : gen_id('prod');

    if ($id !== '') {
        foreach ($productos as &$p) {
            if ($p['id'] === $id) { $p = $producto; break; }
        }
        unset($p);
    } else {
        $productos[] = $producto;
    }

    write_data_file('productos.json', $productos);
    json_response(['ok' => true, 'producto' => $producto]);
}

if ($metodo === 'DELETE') {
    require_admin();
    $id = (string) ($_GET['id'] ?? '');
    if ($id === '') {
        json_error('Falta el id del producto.');
    }

    $productos = read_data_file('productos.json', []);
    $restantes = array_values(array_filter($productos, fn($p) => $p['id'] !== $id));

    if (count($restantes) === count($productos)) {
        json_error('El producto no existe.', 404);
    }

    write_data_file('productos.json', $restantes);
    json_response(['ok' => true]);
}

json_error('Método no permitido', 405);
