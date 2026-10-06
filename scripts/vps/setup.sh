#!/usr/bin/env bash
# =============================================================================
#  One-command server setup for cliffordwaldman.com (Ubuntu 22.04 / 24.04)
#
#  Run once as root on a fresh VPS:
#    curl -fsSL https://raw.githubusercontent.com/dipaiteam1-a11y/cliffordwaldman-site/main/scripts/vps/setup.sh | bash
#
#  It installs and configures:
#    - Nginx serving the site from /var/www/cliffordwaldman (clean URLs, 404 page, caching)
#    - PHP-FPM only for the dashboard sign-in helper in /oauth
#    - Free HTTPS certificates from Let's Encrypt (renew automatically)
#    - Firewall (only SSH, HTTP, HTTPS), fail2ban, automatic security updates
#    - A "deploy" user that GitHub Actions uses to upload new versions of the site,
#      locked to the website folder only
#  Safe to run again; it skips what is already done.
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-cliffordwaldman.com}"
WEBROOT="/var/www/cliffordwaldman"
DEPLOY_USER="deploy"
EMAIL="${EMAIL:-admin@${DOMAIN}}"

say() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
ok() { printf '\033[1;32m    ✓ %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Please run as root (or with sudo)."; exit 1; }

say "Updating the system and installing software (this takes a few minutes)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get -y -qq upgrade
apt-get -y -qq install nginx php-fpm php-curl certbot python3-certbot-nginx ufw fail2ban unattended-upgrades rsync dnsutils curl >/dev/null
ok "Software installed"

say "Turning on automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true
ok "Security updates will install themselves"

say "Setting up the firewall"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
systemctl enable --now fail2ban >/dev/null 2>&1 || true
ok "Only SSH, HTTP and HTTPS are open; repeated bad logins get blocked"

say "Creating the website folder and the deploy user"
id "$DEPLOY_USER" >/dev/null 2>&1 || adduser --disabled-password --gecos "" "$DEPLOY_USER" >/dev/null
mkdir -p "$WEBROOT"
if [ ! -f "$WEBROOT/index.html" ]; then
  cat > "$WEBROOT/index.html" <<HTML
<!doctype html><meta charset="utf-8"><title>The Gathering Place</title>
<body style="font-family:Georgia,serif;background:#120e16;color:#f6ede1;display:grid;place-items:center;min-height:100vh;margin:0">
<p>The Gathering Place is on its way.</p></body>
HTML
fi
chown -R "$DEPLOY_USER":www-data "$WEBROOT"
chmod 2775 "$WEBROOT"

# The deploy key is created here on the server, so the private key never travels through chat or email.
SSH_DIR="/home/$DEPLOY_USER/.ssh"
KEY="/root/deploy_key"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$SSH_DIR"
if [ ! -f "$KEY" ]; then
  ssh-keygen -q -t ed25519 -N "" -C "github-actions-deploy@$DOMAIN" -f "$KEY"
fi
RRSYNC="$(command -v rrsync || true)"
if [ -z "$RRSYNC" ] && [ -f /usr/share/doc/rsync/scripts/rrsync.gz ]; then   # Ubuntu 22.04 ships it compressed
  gunzip -c /usr/share/doc/rsync/scripts/rrsync.gz > /usr/local/bin/rrsync && chmod 755 /usr/local/bin/rrsync
  RRSYNC=/usr/local/bin/rrsync
fi
[ -n "$RRSYNC" ] || { echo "rrsync not found"; exit 1; }
# This key may only upload into the website folder (no shell, no other files).
echo "command=\"$RRSYNC $WEBROOT\",restrict $(cat "$KEY.pub")" > "$SSH_DIR/authorized_keys"
chown "$DEPLOY_USER":"$DEPLOY_USER" "$SSH_DIR/authorized_keys"
chmod 600 "$SSH_DIR/authorized_keys"
ok "Deploy user ready (uploads only, website folder only)"

say "Configuring Nginx and PHP"
PHP_SOCK="$(ls /run/php/php*-fpm.sock 2>/dev/null | head -n1)"
[ -n "$PHP_SOCK" ] || PHP_SOCK="/run/php/php-fpm.sock"
cat > /etc/nginx/sites-available/cliffordwaldman <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $WEBROOT;
    index index.html;
    charset utf-8;

    # www -> bare domain
    if (\$host = www.$DOMAIN) { return 301 https://$DOMAIN\$request_uri; }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/xml application/xml;

    location / {
        try_files \$uri \$uri/index.html \$uri/ =404;
    }

    # Fingerprinted build files never change
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Dashboard sign-in helper: only these two PHP files can run
    location = /oauth/auth.php     { include snippets/fastcgi-php.conf; fastcgi_pass unix:$PHP_SOCK; }
    location = /oauth/callback.php { include snippets/fastcgi-php.conf; fastcgi_pass unix:$PHP_SOCK; }
    location ~ \.php$ { return 404; }
    location ~ /\. { deny all; }

    error_page 404 /404.html;
    client_max_body_size 50m;
}
NGINX
ln -sf /etc/nginx/sites-available/cliffordwaldman /etc/nginx/sites-enabled/cliffordwaldman
rm -f /etc/nginx/sites-enabled/default
nginx -t >/dev/null 2>&1 && systemctl reload nginx
systemctl enable --now "$(basename "$PHP_SOCK" .sock)" >/dev/null 2>&1 || true
ok "Nginx is serving $DOMAIN"

say "HTTPS certificate"
SERVER_IP="$(curl -fsS4 https://ifconfig.me || hostname -I | awk '{print $1}')"
DNS_IP="$(dig +short A "$DOMAIN" | tail -n1)"
if [ -n "$DNS_IP" ] && [ "$DNS_IP" = "$SERVER_IP" ]; then
  WWW_ARG=""
  [ "$(dig +short A "www.$DOMAIN" | tail -n1)" = "$SERVER_IP" ] && WWW_ARG="-d www.$DOMAIN"
  certbot --nginx --non-interactive --agree-tos --redirect -m "$EMAIL" -d "$DOMAIN" $WWW_ARG >/dev/null && ok "HTTPS is on and renews itself"
else
  echo "    The domain doesn't point to this server yet (domain: ${DNS_IP:-none}, server: $SERVER_IP)."
  echo "    Once DNS is updated, run:  bash /root/ssl.sh"
fi
cat > /root/ssl.sh <<SSL
#!/usr/bin/env bash
certbot --nginx --non-interactive --agree-tos --redirect -m "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN"
SSL
chmod +x /root/ssl.sh

say "All done. Two values for GitHub (Settings → Secrets and variables → Actions → New repository secret):"
echo
echo "  Name:  VPS_HOST"
echo "  Value: $SERVER_IP"
echo
echo "  Name:  VPS_SSH_KEY"
echo "  Value: (copy everything between the lines below, including BEGIN and END)"
echo "-----------------------------------------------------------------------"
cat "$KEY"
echo "-----------------------------------------------------------------------"
echo
echo "Dashboard sign-in: when you have the GitHub OAuth app, run:  bash /root/oauth.sh"

cat > /root/oauth.sh <<'OAUTH'
#!/usr/bin/env bash
# Stores the dashboard's GitHub sign-in keys outside the website folder.
set -euo pipefail
read -rp "GitHub OAuth Client ID: " CID
read -rsp "GitHub OAuth Client secret (hidden): " CSECRET; echo
umask 027
cat > /var/www/oauth-secrets.php <<PHP
<?php
const GITHUB_CLIENT_ID = '${CID}';
const GITHUB_CLIENT_SECRET = '${CSECRET}';
PHP
chown root:www-data /var/www/oauth-secrets.php
chmod 640 /var/www/oauth-secrets.php
echo "Saved. The dashboard sign-in is ready."
OAUTH
chmod 700 /root/oauth.sh
