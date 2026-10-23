<?php
declare(strict_types=1);

require_once __DIR__ . '/../contact.php';

function runContactTests(string $directory): array
{
    $results = [];
    $assert = static function (bool $condition, string $message): void {
        if (!$condition) throw new RuntimeException($message);
    };
    $fields = ['lang' => 'de', 'name' => '<JMC Test>', 'email' => 'contact@jmc-streamline.com', 'phone' => '', 'message' => 'Test <b>Nachricht</b>', 'website' => ''];
    $base = ['method' => 'POST', 'origin' => 'https://www.jmc-streamline.com', 'content_type' => 'application/json', 'ip' => 'test', 'key' => 'test-request-000001', 'body' => json_encode($fields)];
    $config = ['origins' => ['https://www.jmc-streamline.com'], 'state_dir' => $directory, 'state_salt' => 'test-only'];
    $test = static function (string $name, callable $run) use (&$results): void {
        try { $run(); $results[] = ['name' => $name, 'passed' => true]; }
        catch (Throwable $error) { $results[] = ['name' => $name, 'passed' => false, 'error' => $error->getMessage()]; }
    };
    $test('DE and EN recipients, signature and escaped message', static function () use ($fields, $assert): void {
        foreach (['de', 'en'] as $lang) {
            $input = array_replace($fields, ['lang' => $lang]);
            [$admin, $confirmation] = Jmc\Contact\messages(Jmc\Contact\validate($input));
            $assert($admin['to'] === Jmc\Contact\SENDER && $admin['reply_to'] === $input['email'], 'Admin recipient/reply');
            $assert($confirmation['to'] === $input['email'] && $confirmation['reply_to'] === Jmc\Contact\SENDER, 'Confirmation recipient/reply');
            $assert(str_contains($confirmation['text'], 'Gremi des Fusters 33, Local 6'), 'Signature');
            $assert(str_contains($admin['html'], '&lt;b&gt;Nachricht&lt;/b&gt;'), 'HTML escaping');
            $assert(str_contains($confirmation['text'], $lang === 'de' ? 'Vielen Dank' : 'Thank you'), 'Language');
        }
    });
    $test('Invalid fields and header injection rejected', static function () use ($fields, $assert): void {
        foreach ([['email' => "a@example.com\r\nBcc:other@example.com"], ['name' => "a\nBcc"], ['website' => 'bot'], ['website' => '0'], ['website' => []], ['lang' => 'fr'], ['message' => ''], ['email' => []]] as $change) {
            $assert(Jmc\Contact\validate(array_replace($fields, $change)) === null, 'Invalid input accepted');
        }
    });
    $test('Unconfigured transport never sends', static function () use ($base, $config, $assert): void {
        $assert(Jmc\Contact\handle($base, $config) === [503, 'not_configured'], 'Missing SMTP result');
    });
    $test('Repeat and changed-payload protection', static function () use ($base, $config, $fields, $assert): void {
        $sent = [];
        $send = static function ($mail) use (&$sent): void { $sent[] = $mail; };
        $assert(Jmc\Contact\handle($base, $config, $send) === [200, 'sent'], 'Initial send');
        $assert(Jmc\Contact\handle($base, $config, $send) === [200, 'sent'], 'Repeat');
        $assert(count($sent) === 2, 'Duplicate email');
        $request = array_replace($base, ['body' => json_encode(array_replace($fields, ['message' => 'Changed']))]);
        $assert(Jmc\Contact\handle($request, $config, $send) === [409, 'invalid_request'], 'Changed payload accepted');
    });
    $test('Partial retry sends only confirmation', static function () use ($base, $config, $assert): void {
        $request = array_replace($base, ['key' => 'partial-request-00001', 'ip' => 'partial']);
        $calls = 0;
        $send = static function ($mail) use (&$calls): void { ++$calls; if ($calls === 2) throw new RuntimeException('Simulated'); };
        $assert(Jmc\Contact\handle($request, $config, $send) === [503, 'confirmation_failed'], 'Partial failure');
        $assert(Jmc\Contact\handle($request, $config, $send) === [200, 'sent'], 'Retry');
        $assert($calls === 3, 'Admin duplicated');
    });
    $test('SMTP failure never reports success', static function () use ($base, $config, $assert): void {
        $request = array_replace($base, ['key' => 'failed-request-000001', 'ip' => 'failure']);
        $send = static function (): void { throw new RuntimeException('Simulated'); };
        $assert(Jmc\Contact\handle($request, $config, $send) === [503, 'send_failed'], 'Failure result');
    });
    $test('Rate limit, method, origin and oversized requests', static function () use ($base, $config, $assert): void {
        $send = static function (): void {};
        $request = array_replace($base, ['key' => 'rate-request-00000001', 'ip' => 'rate']);
        for ($i = 0; $i < 10; ++$i) $assert(Jmc\Contact\handle($request, $config, $send) === [200, 'sent'], 'Early rate limit');
        $assert(Jmc\Contact\handle($request, $config, $send) === [429, 'rate_limited'], 'Missing rate limit');
        foreach ([['method' => 'GET'], ['origin' => 'https://invalid.example'], ['body' => str_repeat('x', 20001)], ['key' => '../invalid']] as $change) {
            $assert(Jmc\Contact\handle(array_replace($base, $change), $config, $send)[0] >= 400, 'Invalid request accepted');
        }
    });
    return $results;
}
