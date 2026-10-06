<?php
// Step 2: GitHub sends the person back here; swap the code for a token and hand it to the dashboard.
require __DIR__ . '/config.php';

$status = 'error';
$payload = ['message' => 'Sign-in failed. Please close this window and try again.'];

$state = $_GET['state'] ?? '';
$expected = $_SESSION['oauth_state'] ?? '';
unset($_SESSION['oauth_state']);

if (!empty($_GET['code']) && $expected !== '' && hash_equals($expected, (string) $state)) {
    $ch = curl_init('https://github.com/login/oauth/access_token');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'User-Agent: cliffordwaldman-dashboard'],
        CURLOPT_POSTFIELDS => http_build_query([
            'client_id' => GITHUB_CLIENT_ID,
            'client_secret' => GITHUB_CLIENT_SECRET,
            'code' => (string) $_GET['code'],
            'redirect_uri' => REDIRECT_URI,
        ]),
    ]);
    $response = json_decode((string) curl_exec($ch), true);
    curl_close($ch);
    if (!empty($response['access_token'])) {
        $status = 'success';
        $payload = ['token' => $response['access_token'], 'provider' => 'github'];
    }
}

$message = json_encode('authorization:github:' . $status . ':' . json_encode($payload), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
$origin = json_encode(SITE_ORIGIN);
header('Content-Type: text/html; charset=utf-8');
?><!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:system-ui,sans-serif;background:#120e16;color:#f6ede1;display:grid;place-items:center;min-height:100vh;margin:0">
<p>Signing you in…</p>
<script>
  (function () {
    var origin = <?= $origin ?>;
    function receive(e) {
      if (e.origin !== origin) return;
      window.opener.postMessage(<?= $message ?>, origin);
      window.removeEventListener('message', receive, false);
      setTimeout(function () { window.close(); }, 300);
    }
    window.addEventListener('message', receive, false);
    if (window.opener) window.opener.postMessage('authorizing:github', origin);
  })();
</script>
</body>
</html>
