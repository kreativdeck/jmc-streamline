<?php
declare(strict_types=1);

namespace Jmc\Contact;

use PHPMailer\PHPMailer\PHPMailer;
use RuntimeException;
use Throwable;

const SENDER = 'contact@jmc-streamline.com';
const COMPANY = 'jmc. | Streamline Processes S.L.';
const TTL = 600;

function validate(array $input): ?array
{
    if (!in_array($input['lang'] ?? null, ['de', 'en'], true)
        || !is_string($input['website'] ?? '') || ($input['website'] ?? '') !== '') return null;
    $fields = ['lang' => $input['lang']];
    foreach (['name' => 200, 'email' => 254, 'phone' => 80, 'message' => 10000] as $name => $limit) {
        $value = $input[$name] ?? null;
        if (!is_string($value) || mb_strlen($value, 'UTF-8') > $limit) return null;
        $fields[$name] = trim($value);
        if ($name !== 'message' && preg_match('/[\r\n\x00]/', $fields[$name])) return null;
    }
    if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL) || $fields['message'] === '') return null;
    return $fields;
}

function messages(array $fields): array
{
    $de = $fields['lang'] === 'de';
    $subject = $de ? 'Neue Anfrage über das Kontaktformular' : 'New enquiry via the contact form';
    $labels = $de ? ['Name', 'E-Mail', 'Telefon', 'Nachricht'] : ['Name', 'Email', 'Phone', 'Message'];
    $rows = [];
    foreach (['name', 'email', 'phone', 'message'] as $index => $field) {
        $rows[] = $labels[$index] . ': ' . ($fields[$field] !== '' ? $fields[$field] : '—');
    }
    $admin = $subject . "\n\n" . implode("\n\n", $rows);
    $greeting = $fields['name'] !== ''
        ? ($de ? 'Vielen Dank, ' : 'Thank you, ') . $fields['name'] . ','
        : ($de ? 'Vielen Dank für Ihre Nachricht,' : 'Thank you for your message,');
    $confirmation = $greeting . "\n\n"
        . ($de ? 'Ihre Nachricht ist angekommen und ich werde mich so schnell wie möglich bei Ihnen melden.'
            : 'Your message has been received and I will get back to you as soon as possible.')
        . "\n\n" . ($de ? 'Beste Grüße,' : 'Best regards,') . "\n" . COMPANY
        . "\nJasmin-Madeleine A. Christensen-Matassa\nGremi des Fusters 33, Local 6\nES-07009 Palma\n\n"
        . $labels[2] . ': +34 699 313750' . "\n" . $labels[1] . ': ' . SENDER;
    $html = static fn(string $text): string => '<div>'
        . str_replace("\n", '<br>', htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')) . '</div>';
    return [
        ['from_name' => $fields['name'] ?: COMPANY, 'to' => SENDER, 'to_name' => COMPANY,
            'reply_to' => $fields['email'], 'reply_name' => $fields['name'],
            'subject' => $subject, 'text' => $admin, 'html' => $html($admin)],
        ['from_name' => COMPANY, 'to' => $fields['email'], 'to_name' => $fields['name'],
            'reply_to' => SENDER, 'reply_name' => COMPANY,
            'subject' => $de ? 'Vielen Dank für Ihre Nachricht' : 'Thank you for your message',
            'text' => $confirmation, 'html' => $html($confirmation)],
    ];
}

function mailer(array $config): PHPMailer
{
    require_once __DIR__ . '/vendor/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/vendor/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/vendor/PHPMailer/src/SMTP.php';
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'] ?? 'mail.jmc-streamline.com';
    $mail->Port = (int) ($config['smtp_port'] ?? 465);
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'] ?? SENDER;
    $mail->Password = $config['smtp_password'] ?? '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPOptions = ['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'allow_self_signed' => false]];
    $mail->SMTPDebug = 0;
    $mail->Timeout = 10;
    $mail->Timelimit = 20;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->XMailer = '';
    return $mail;
}

function sendMessage(array $config, array $message): void
{
    $mail = mailer($config);
    $mail->setFrom(SENDER, $message['from_name']);
    $mail->Sender = SENDER;
    $mail->addAddress($message['to'], $message['to_name']);
    $mail->addReplyTo($message['reply_to'], $message['reply_name']);
    $mail->Subject = $message['subject'];
    $mail->isHTML(true);
    $mail->Body = $message['html'];
    $mail->AltBody = $message['text'];
    if (!$mail->send()) throw new RuntimeException('Mail delivery failed');
}

function lockedState(string $file, callable $callback): mixed
{
    // Serialize opening and pruning so a waiting request never holds an unlinked inode.
    $gate = fopen(dirname($file) . '/.mutex', 'c+');
    if ($gate === false || !flock($gate, LOCK_EX)) throw new RuntimeException('State lock unavailable');
    try {
        $handle = fopen($file, 'c+');
        if ($handle === false) throw new RuntimeException('State unavailable');
        chmod($file, 0600);
        if (!flock($handle, LOCK_EX)) { fclose($handle); throw new RuntimeException('State lock unavailable'); }
    } finally { flock($gate, LOCK_UN); fclose($gate); }
    try {
        $stored = stream_get_contents($handle);
        $state = $stored !== '' ? json_decode($stored, true, 512, JSON_THROW_ON_ERROR) : [];
        $save = static function (array $value) use ($handle): void {
            $encoded = json_encode($value, JSON_THROW_ON_ERROR);
            rewind($handle);
            if (!ftruncate($handle, 0) || fwrite($handle, $encoded) !== strlen($encoded) || !fflush($handle)) {
                throw new RuntimeException('State write failed');
            }
        };
        return $callback($state, $save);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/** Returns [HTTP status, public result code]. No submitted messages are stored. */
function handle(array $request, array $config, ?callable $send = null): array
{
    if (($request['method'] ?? '') !== 'POST') return [405, 'method_not_allowed'];
    if (!in_array($request['origin'] ?? '', $config['origins'] ?? [], true)) return [403, 'forbidden'];
    if (strtolower(trim(explode(';', $request['content_type'] ?? '')[0])) !== 'application/json') return [415, 'invalid_request'];
    $body = $request['body'] ?? '';
    if (!is_string($body) || strlen($body) > 20000) return [413, 'invalid_request'];
    $key = $request['key'] ?? '';
    if (!is_string($key) || !preg_match('/\A[a-zA-Z0-9-]{16,80}\z/', $key)) return [400, 'invalid_request'];
    try { $input = json_decode($body, true, 512, JSON_THROW_ON_ERROR); }
    catch (Throwable) { return [400, 'invalid_request']; }
    $fields = is_array($input) ? validate($input) : null;
    if ($fields === null) return [400, 'invalid_request'];
    if ($send === null && empty($config['smtp_password'])) return [503, 'not_configured'];
    try {
        $directory = $config['state_dir'];
        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) throw new RuntimeException('State unavailable');
        // Private state contains counters and hashes only, never the enquiry or email address.
        $now = time();
        $ipHash = hash_hmac('sha256', $request['ip'] ?? '', $config['state_salt']);
        if (!is_file($directory . '/ip-' . $ipHash . '.json')
            && count(array_filter(glob($directory . '/*.json') ?: [],
                static fn($file) => filemtime($file) >= $now - TTL)) >= 2000) return [429, 'rate_limited'];
        $allowed = lockedState($directory . '/ip-' . $ipHash . '.json', static function ($state, $save) use ($now): bool {
            if (($state['expires'] ?? 0) <= $now) $state = ['count' => 0, 'expires' => $now + TTL];
            ++$state['count'];
            $save($state);
            return $state['count'] <= 10;
        });
        if (!$allowed) return [429, 'rate_limited'];
        // Remove expired, unlocked files. Limit disk use before accepting a new delivery ID.
        $gate = fopen($directory . '/.mutex', 'c+');
        if ($gate === false || !flock($gate, LOCK_EX)) throw new RuntimeException('State lock unavailable');
        try {
            foreach (glob($directory . '/*.json') ?: [] as $file) {
                if (filemtime($file) >= $now - TTL) continue;
                $handle = fopen($file, 'r+');
                if ($handle !== false) {
                    if (flock($handle, LOCK_EX | LOCK_NB)) {
                        $stored = json_decode(stream_get_contents($handle), true);
                        if (($stored['expires'] ?? 0) <= $now) unlink($file);
                        flock($handle, LOCK_UN);
                    }
                    fclose($handle);
                }
            }
        } finally { flock($gate, LOCK_UN); fclose($gate); }
        $file = $directory . '/send-' . hash('sha256', $key) . '.json';
        if (!is_file($file) && count(glob($directory . '/*.json') ?: []) >= 2000) return [429, 'rate_limited'];
        $fingerprint = hash_hmac('sha256', json_encode($fields, JSON_THROW_ON_ERROR), $config['state_salt']);
        $send ??= static fn(array $message) => sendMessage($config, $message);
        return lockedState($file, static function ($state, $save) use ($now, $fingerprint, $fields, $send): array {
            if (($state['expires'] ?? 0) <= $now) $state = ['expires' => $now + TTL, 'fingerprint' => $fingerprint, 'admin' => false, 'confirmation' => false];
            if (($state['fingerprint'] ?? '') !== $fingerprint) return [409, 'invalid_request'];
            $save($state);
            try {
                [$admin, $confirmation] = messages($fields);
                if (!$state['admin']) { $send($admin); $state['admin'] = true; $save($state); }
                if (!$state['confirmation']) { $send($confirmation); $state['confirmation'] = true; $save($state); }
                return [200, 'sent'];
            } catch (Throwable) {
                return [503, $state['admin'] ? 'confirmation_failed' : 'send_failed'];
            }
        });
    } catch (Throwable) { return [503, 'send_failed']; }
}
