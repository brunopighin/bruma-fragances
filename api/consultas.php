<?php
/* POST público          → nueva consulta (la usa el formulario de contacto)
   GET/PATCH/DELETE admin → panel admin */
require __DIR__ . '/_lib.php';

$metodo = request_method();

if ($metodo === 'POST') {
    $body = read_json_body();

    $nombre  = trim((string) ($body['nombre'] ?? ''));
    $email   = trim((string) ($body['email'] ?? ''));
    $mensaje = trim((string) ($body['mensaje'] ?? ''));

    if ($nombre === '' || $email === '' || $mensaje === '') {
        json_error('Faltan datos obligatorios.');
    }

    $consulta = [
        'id'       => gen_id('c'),
        'fecha'    => date('c'),
        'nombre'   => $nombre,
        'email'    => $email,
        'telefono' => trim((string) ($body['telefono'] ?? '')),
        'mensaje'  => $mensaje,
        'leida'    => false,
    ];

    $consultas = read_data_file('consultas.json', []);
    array_unshift($consultas, $consulta);
    write_data_file('consultas.json', $consultas);

    json_response(['ok' => true]);
}

if ($metodo === 'GET') {
    require_admin();
    json_response(read_data_file('consultas.json', []));
}

if ($metodo === 'PATCH') {
    require_admin();
    $id = (string) ($_GET['id'] ?? '');
    if ($id === '') {
        json_error('Falta el id de la consulta.');
    }

    $consultas = read_data_file('consultas.json', []);
    $encontrada = false;
    foreach ($consultas as &$c) {
        if ($c['id'] === $id) {
            $c['leida'] = true;
            $encontrada = true;
            break;
        }
    }
    unset($c);

    if (!$encontrada) {
        json_error('La consulta no existe.', 404);
    }

    write_data_file('consultas.json', $consultas);
    json_response(['ok' => true]);
}

if ($metodo === 'DELETE') {
    require_admin();
    $id = (string) ($_GET['id'] ?? '');

    $consultas = read_data_file('consultas.json', []);

    if ($id === '') {
        // Sin id: borra todas (lo usa el botón "Borrar todas" del admin).
        write_data_file('consultas.json', []);
        json_response(['ok' => true]);
    }

    $restantes = array_values(array_filter($consultas, fn($c) => $c['id'] !== $id));
    if (count($restantes) === count($consultas)) {
        json_error('La consulta no existe.', 404);
    }

    write_data_file('consultas.json', $restantes);
    json_response(['ok' => true]);
}

json_error('Método no permitido', 405);
