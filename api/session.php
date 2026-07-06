<?php
/* GET → { loggedIn: bool } */
require __DIR__ . '/_lib.php';

json_response(['loggedIn' => is_admin()]);
