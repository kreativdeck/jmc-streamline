<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
try {
    $private = dirname(__DIR__, 2) . '/.jmc-private';
    require $private . '/app/contact.php';
    $config = is_file($private . '/contact-config.php') ? require $private . '/contact-config.php' : [];
    $config['state_dir'] = $private . '/state';
    [$status, $code] = Jmc\Contact\handle([
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? '',
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? '',
        'key' => $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? '',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'body' => file_get_contents('php://input', false, null, 0, 20001),
    ], $config);
} catch (Throwable) { $status = 503; $code = 'send_failed'; }
http_response_code($status);
echo json_encode(['code' => $code]);
