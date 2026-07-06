<?php
/* POST → cierra la sesión admin */
require __DIR__ . '/_lib.php';

$_SESSION = [];
session_destroy();

json_response(['ok' => true]);
