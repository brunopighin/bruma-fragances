<?php
/* GET público → { whatsapp, email, direccion, instagram }
   POST admin  → actualiza esos datos y, opcionalmente, la contraseña admin */
require __DIR__ . '/_lib.php';

$metodo = request_method();

$defaults = [
    'whatsapp'  => '',
    'email'     => '',
    'direccion' => '',
    'instagram' => '',
];

if ($metodo === 'GET') {
    $settings = read_data_file('settings.json', $defaults);
    json_response(array_merge($defaults, $settings));
}

if ($metodo === 'POST') {
    require_admin();
    $body = read_json_body();

    $settings = read_data_file('settings.json', $defaults);

    foreach (['whatsapp', 'email', 'direccion', 'instagram'] as $campo) {
        if (isset($body[$campo]) && trim((string) $body[$campo]) !== '') {
            $settings[$campo] = trim((string) $body[$campo]);
        }
    }

    write_data_file('settings.json', $settings);

    $nuevaPassword = trim((string) ($body['newPassword'] ?? ''));
    if ($nuevaPassword !== '') {
        if (strlen($nuevaPassword) < 6) {
            json_error('La contraseña debe tener al menos 6 caracteres.');
        }
        write_data_file('admin.json', ['passwordHash' => password_hash($nuevaPassword, PASSWORD_DEFAULT)]);
    }

    json_response(['ok' => true, 'settings' => $settings]);
}

json_error('Método no permitido', 405);
