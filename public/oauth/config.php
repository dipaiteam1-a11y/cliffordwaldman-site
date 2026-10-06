<?php
/**
 * GitHub sign-in for the dashboard (/admin) on PHP hosting such as Hostinger.
 *
 * The secret lives OUTSIDE the website folder, in a file named oauth-secrets.php
 * placed one level above public_html (your hosting home folder):
 *
 *   <?php
 *   const GITHUB_CLIENT_ID     = 'your OAuth app client ID';
 *   const GITHUB_CLIENT_SECRET = 'your OAuth app client secret';
 *
 * Setup steps: README → "Dashboard, Owner and Admin".
 */
declare(strict_types=1);

const SITE_ORIGIN = 'https://cliffordwaldman.com';
const REDIRECT_URI = SITE_ORIGIN . '/oauth/callback.php';

$secrets = [dirname(__DIR__, 2) . '/oauth-secrets.php', dirname(__DIR__, 3) . '/oauth-secrets.php'];
foreach ($secrets as $file) {
    if (is_readable($file)) {
        require_once $file;
        break;
    }
}
if (!defined('GITHUB_CLIENT_ID') || !defined('GITHUB_CLIENT_SECRET')) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Dashboard sign-in isn't set up yet: oauth-secrets.php was not found above the website folder.");
}

header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');
session_set_cookie_params(['lifetime' => 600, 'path' => '/oauth/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();
