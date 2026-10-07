<?php
// Step 1: the dashboard opens this in a pop-up; send the person to GitHub to sign in.
require __DIR__ . '/config.php';

$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;

header('Location: https://github.com/login/oauth/authorize?' . http_build_query([
    'client_id' => GITHUB_CLIENT_ID,
    'redirect_uri' => REDIRECT_URI,
    'scope' => 'repo,user',
    'state' => $state,
]));
exit;
