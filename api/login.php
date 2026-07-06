<?php
/* POST { password } → inicia sesión si la contraseña es correcta */
require __DIR__ . '/_lib.php';

if (request_method() !== 'POST') {
    json_error('Método no permitido', 405);
}

$body     = read_json_body();
$password = (string) ($body['password'] ?? '');

if ($password === '') {
    json_error('Ingresá la contraseña.');
}

$admin = read_data_file('admin.json', null);

// Primer uso: si no existe admin.json, se crea con la contraseña por defecto.
if ($admin === null || empty($admin['passwordHash'])) {
    $admin = ['passwordHash' => password_hash('Admin123', PASSWORD_DEFAULT)];
    write_data_file('admin.json', $admin);
}

if (!password_verify($password, $admin['passwordHash'])) {
    json_error('Contraseña incorrecta', 401);
}

$_SESSION['admin'] = true;
json_response(['ok' => true]);
