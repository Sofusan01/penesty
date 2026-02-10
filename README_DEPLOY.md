# Deployment Guide (Kamatera / VPS)

This guide explains how to deploy the **Web-Summarize-v3** application using Docker on a fresh Ubuntu server.

## 1. VPS Preparation (Ubuntu)

Connect to your VPS:
```bash
ssh root@your_vps_ip
```

Update system and install Docker:
```bash
# Update packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y
```

## 2. Firewall Configuration

Ensure the following ports are open on your VPS (Kamatera Console / `ufw`):
- `22` (SSH)
- `80` (HTTP - required for Let's Encrypt / Reverse Proxy)
- `443` (HTTPS)
- `3000` (Optional - only if you access the app directly without a proxy)

Using `ufw`:
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000
ufw enable
```

## 3. App Deployment

1. **Clone the repository** (or upload files):
   ```bash
   git clone <your-repo-url> /var/www/web-summarize
   cd /var/www/web-summarize
   ```

2. **Configure Environment Variables**:
   Copy the example and fill in real secrets:
   ```bash
   cp .env.example .env
   nano .env
   ```
   **Set at minimum:**
   - `NODE_ENV=production`
   - `SESSION_SECRET=long-random-string`
   - `JWT_SECRET=another-long-random-string`

3. **Prepare Data Directory**:
   ```bash
   mkdir -p data
   chmod 777 data  # Ensure Docker user can write to it
   ```

4. **Launch the Application**:
   ```bash
   docker-compose up -d --build
   ```

## 4. Initial Database Setup

Since database init scripts should be run manually in production:

```bash
# Enter the container
docker exec -it express_app sh

# Initialize tables
node scripts/init_db.js
node scripts/init_owasp.js
node scripts/init_app_functions.js
node scripts/init_system_settings.js

# Create your admin user
# Usage: node scripts/seed_user.js <username> <password> <role>
node scripts/seed_user.js myadmin secure-password123 admin

exit
```

## 5. Security Checklist (Final)
- [ ] SSH root login disabled (use a user with sudo).
- [ ] Secrets in `.env` are truly secret.
- [ ] Ports 3000 is closed if using a reverse proxy (Nginx).
- [ ] `NODE_ENV` is definitely set to `production`.

## 6. Backups
To run a manual backup:
```bash
docker exec express_app node scripts/backup_db.js
```
The backup will be stored in the `./backups` directory on the host.
