<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
$private = dirname(__DIR__) . '/.jmc-private';
if (!hash_equals(trim(file_get_contents($private . '/operations.key')), $_SERVER['HTTP_X_JMC_KEY'] ?? '')) {
    http_response_code(404); exit('{}');
}
try {
    $action = $_GET['action'] ?? '';
    if ($action === 'test') {
        require $private . '/app/test/contact.php';
        $results = runContactTests($private . '/test-state-' . bin2hex(random_bytes(8)));
        $config = require $private . '/contact-config.php';
        $mail = Jmc\Contact\mailer($config);
        $smtp = $mail->smtpConnect();
        $mail->smtpClose();
        echo json_encode(['tests' => $results, 'smtp_authenticated' => $smtp]);
    } elseif ($action === 'backup') {
        set_time_limit(300);
        define('SHORTINIT', true);
        define('DISABLE_WP_CRON', true);
        require __DIR__ . '/wp-load.php';
        global $wpdb;
        $db = $wpdb->dbh;
        if (!$db instanceof mysqli) throw new RuntimeException('Database unavailable');
        $directory = $private . '/backups';
        if (!is_dir($directory)) mkdir($directory, 0700, true);
        $path = $directory . '/wordpress-' . gmdate('Ymd-His') . '.sql';
        $file = fopen($path, 'x');
        if (!$file) throw new RuntimeException('Backup unavailable');
        chmod($path, 0600);
        fwrite($file, "-- JMC WordPress backup\nSET NAMES utf8mb4;\nSET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\nSET FOREIGN_KEY_CHECKS=0;\n");
        $tables = $db->query('SHOW FULL TABLES WHERE Table_type = \'BASE TABLE\'')->fetch_all(MYSQLI_NUM);
        $db->query('START TRANSACTION WITH CONSISTENT SNAPSHOT');
        foreach ($tables as [$table]) {
            $quoted = '`' . str_replace('`', '``', $table) . '`';
            $create = $db->query('SHOW CREATE TABLE ' . $quoted)->fetch_row()[1];
            fwrite($file, "\nDROP TABLE IF EXISTS $quoted;\n$create;\n");
            $rows = $db->query('SELECT * FROM ' . $quoted, MYSQLI_USE_RESULT);
            while ($row = $rows->fetch_assoc()) {
                $values = array_map(static fn($value) => $value === null ? 'NULL' : "'" . $db->real_escape_string((string)$value) . "'", array_values($row));
                fwrite($file, 'INSERT INTO ' . $quoted . ' VALUES (' . implode(',', $values) . ");\n");
            }
            $rows->free();
        }
        $db->commit();
        fwrite($file, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($file);
        echo json_encode(['backup' => basename($path), 'bytes' => filesize($path), 'tables' => count($tables), 'sha256' => hash_file('sha256', $path)]);
    } else { http_response_code(400); echo '{}'; }
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Operation failed', 'type' => get_class($error), 'line' => $error->getLine(), 'file' => basename($error->getFile())]);
}
