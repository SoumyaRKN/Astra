# 🔒 Production Security Guide

**Version:** 1.0  
**Last Updated:** March 23, 2026  
**Status:** Complete Production Security Guidelines

---

## Executive Summary

This guide provides comprehensive security practices for deploying and operating the Personal AI Assistant in production. It covers:

- ✅ Secrets and environment variable management
- ✅ Database security hardening
- ✅ API authentication and authorization
- ✅ Network security (CORS, firewall, TLS)
- ✅ Container security practices
- ✅ Log management and monitoring
- ✅ Incident response procedures

---

## 1. Secrets Management

### 1.1 Secret Hierarchy

**Never expose secrets in:**

- ❌ Source code
- ❌ Docker images
- ❌ Logs
- ❌ Error messages
- ❌ Git history
- ❌ Comments

**Safe secret storage:**

- ✅ Environment variables
- ✅ `.env` files (local development)
- ✅ `.env.production` (production server, never committed)
- ✅ GitHub Secrets (CI/CD)
- ✅ Vault services (AWS, HashiCorp)

### 1.2 Environment Setup

**Development:**

```bash
# .env (local only, add to .gitignore)
DB_PASSWORD=dev_password_123
SECRET_KEY=dev_secret_key
API_KEY=dev_api_key
```

**Production - Never commit to git:**

```bash
# Never commit these files:
.env.production
.env.production.local

# Create safe storage:
# - Manual SFTP upload
# - Docker secrets
# - Cloud secret manager
```

### 1.3 .gitignore Setup

```bash
# Add to .gitignore (if not already present)
.env               # Development secrets
.env.local         # Local overrides
.env.production    # Production secrets
.env.production.local
.env.*.local

# Other sensitive files
*.pem              # Private SSH keys
*.key              # Private keys
client_secret.json # OAuth credentials
```

### 1.4 Secret Rotation

Implement quarterly secret rotation:

```bash
#!/bin/bash
# rotate-secrets.sh

# 1. Generate new secrets
NEW_SECRET_KEY=$(openssl rand -hex 32)
NEW_API_KEY=$(openssl rand -hex 16)

# 2. Update environment
echo "SECRET_KEY=$NEW_SECRET_KEY" >> .env.production
echo "API_KEY=$NEW_API_KEY" >> .env.production

# 3. Redeploy services
docker compose -f docker compose.prod.yml restart backend

# 4. Archive old secrets safely
tar -czf old-secrets-$(date +%Y%m%d).tar.gz old-secrets/
# Store in secure location (encrypted USB, safe deposit box)

# 5. Notify team
echo "Secrets rotated on $(date)" | mail -s "Secret Rotation Complete" team@example.com
```

---

## 2. Database Security

### 2.1 PostgreSQL Hardening

**Strong password policy:**

```sql
-- Connect as postgres user
psql -U postgres -d postgres

-- Create role with strong password
CREATE ROLE personal_ai_user WITH LOGIN PASSWORD 'GENERATE_STRONG_PASSWORD_HERE';

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE personal_assistant TO personal_ai_user;
GRANT USAGE ON SCHEMA public TO personal_ai_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO personal_ai_user;

-- Restrict future table access
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO personal_ai_user;
```

**Generate strong password:**

```bash
# Generate 32-character random password
openssl rand -base64 32
# Example: x7K9mL2pQ5vN8wRtJ3hU6fG1sD4aB9eC7kZ0xY8wL5vM2p
```

### 2.2 Connection Security

**Enforce SSL connections:**

```yaml
# In docker compose.prod.yml
environment:
  POSTGRES_INITDB_ARGS: "-c ssl=on"
  POSTGRES_HOST_AUTH_METHOD: "md5"
```

**Restrict connections to local network:**

```bash
# postgresql.conf
listen_addresses = 'localhost,db'  # Only docker network

# pg_hba.conf
# IPv4 local connections
host    all             all             127.0.0.1/32            md5
host    all             all             db/32                   md5

# IPv6 local connections
host    all             all             ::1/128                 md5
```

### 2.3 Backup Security

**Encrypted backups:**

```bash
#!/bin/bash
# secure-backup.sh

# Create backup
docker compose exec db pg_dump \
  -U personal_ai_user \
  personal_assistant > /tmp/dump.sql

# Encrypt backup
gpg --symmetric --cipher-algo AES256 /tmp/dump.sql

# Verify encryption
file /tmp/dump.sql.gpg

# Securely delete unencrypted backup
shred -vfz -n 3 /tmp/dump.sql

# Store encrypted backup
cp /tmp/dump.sql.gpg /backups/personal-ai-$(date +%Y%m%d).sql.gpg
```

**Restore from encrypted backup:**

```bash
# Decrypt backup
gpg -d /backups/personal-ai-20260323.sql.gpg | \
  docker compose exec -T db psql -U personal_ai_user personal_assistant
```

### 2.4 Access Audit

```sql
-- View all database users
SELECT usename, usesuper, usecreatedb FROM pg_user;

-- View access permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='conversations';

-- Remove unnecessary users
DROP ROLE IF EXISTS unnecessary_user;

-- Revoke excessive privileges
REVOKE ALL PRIVILEGES ON personal_assistant FROM public;
```

---

## 3. API Security

### 3.1 API Key Management

**Generate secure API key:**

```python
# In Python
import secrets
api_key = secrets.token_urlsafe(32)
print(api_key)  # Example: -rN87_Ks2j-X4pL8qW6vZ3mB5aY9dE1fG0xC2hJ5p
```

**Setup API key authentication:**

```python
# backend/main.py
from fastapi import Header, HTTPException

VALID_API_KEY = os.getenv("API_KEY")

@app.post("/api/chat")
async def chat(message: str, x_api_key: str = Header(...)):
    if x_api_key != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    # Process request
```

**Client usage:**

```javascript
// frontend/services/api.ts
export const chatService = {
  sendMessage: async (message: string) => {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY,
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },
};
```

### 3.2 Rate Limiting

**Prevent brute force and DoS:**

```python
# backend/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/chat")
@limiter.limit("10/minute")  # Max 10 requests per minute
async def chat(request: Request, message: str):
    # Process request
```

**Rate limiting headers:**

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1679950000
```

### 3.3 Input Validation

**Validate all inputs:**

```python
# backend/db/models.py
from pydantic import BaseModel, Field, validator

class ChatMessage(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    user_id: str = Field(..., regex=r'^[a-zA-Z0-9_-]+$')
    
    @validator('content')
    def content_no_sql_injection(cls, v):
        dangerous_keywords = ['DROP', 'DELETE', 'TRUNCATE', '--', '/*', '*/']
        if any(keyword in v.upper() for keyword in dangerous_keywords):
            raise ValueError('Invalid content')
        return v
```

### 3.4 Response Security Headers

```python
# backend/main.py
from fastapi.middleware import CORSMiddleware

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    return response
```

---

## 4. CORS Security

### 4.1 CORS Configuration

**Restrict to trusted domains:**

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

if os.getenv("ENVIRONMENT") == "development":
    ALLOWED_ORIGINS.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=600,  # Cache preflight for 10 minutes
)
```

**Environment setup:**

```env
# .env.production
CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]
ENVIRONMENT=production
```

### 4.2 Preflight Requests

CORS preflight caching:

```
Access-Control-Max-Age: 86400  # Cache for 24 hours
```

---

## 5. Container Security

### 5.1 Run as Non-root

**Backend Dockerfile:**

```dockerfile
# Add non-root user
RUN addgroup --system appuser && adduser --system --group appuser

# Set ownership
COPY --chown=appuser:appuser . /app

# Switch to non-root
USER appuser

# Verify running as non-root
# docker run --rm yourimage whoami  # Outputs: appuser
```

**Frontend Dockerfile:**

```dockerfile
# Node.js container typically runs as node user already
# Verify: docker run --rm node:18 whoami  # Outputs: node
```

### 5.2 Read-only Filesystem

```yaml
# docker compose.prod.yml
backend:
  read_only: true
  tmpfs:
    - /tmp
    - /var/tmp
```

### 5.3 No Privileged Containers

```yaml
# NEVER use:
privileged: true

# Instead use minimal capabilities:
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE
  - SYS_CHROOT

security_opt:
  - no-new-privileges:true
```

### 5.4 Image Scanning

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ghcr.io/yourorg/backend:latest

# Output shows:
# - High severity vulnerabilities
# - Medium severity vulnerabilities
# - Low severity vulnerabilities
```

---

## 6. Network Security

### 6.1 Firewall Rules

```bash
# UFW on Ubuntu/Debian
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port for security)
sudo ufw allow 22/tcp

# Allow HTTPS only (no HTTP)
sudo ufw allow 443/tcp

# Allow from specific IPs
sudo ufw allow from 203.0.113.0/24 to any port 443

# Enable firewall
sudo ufw enable

# View rules
sudo ufw status
```

### 6.2 Docker Network Isolation

```yaml
# docker compose.prod.yml
networks:
  personal-ai:
    driver: bridge
    driver_opts:
      # Disable inter-container communication (if needed)
      # --icc=false

services:
  frontend:
    networks:
      - personal-ai
  backend:
    networks:
      - personal-ai
  db:
    networks:
      - personal-ai
```

### 6.3 SSH Security

```bash
# SSH hardening

# 1. Generate strong SSH keys
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# 2. Disable password authentication
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 3. Disable root login
echo "PermitRootLogin no" | sudo tee -a /etc/ssh/sshd_config

# 4. Change default port (optional but recommended)
echo "Port 2222" | sudo tee -a /etc/ssh/sshd_config

# 5. Restart SSH
sudo systemctl restart sshd

# 6. Verify configuration
sudo sshd -t
```

---

## 7. Logging & Monitoring

### 7.1 Centralized Logging

```yaml
# docker compose.prod.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "3"
        labels: "service=backend"
```

**Log rotation:**

```bash
# /etc/logrotate.d/docker-personal-ai
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    delaycompress
    missingok
    copytruncate
}
```

### 7.2 Important Log Files

```bash
# View logs
docker compose logs -f backend      # Backend service
docker compose logs -f frontend     # Frontend service
docker compose logs -f db           # Database
docker compose logs -f ollama       # LLM

# Search for errors
docker compose logs | grep ERROR
docker compose logs | grep Exception

# Export logs
docker compose logs > all-logs.txt
docker compose logs backend > backend-logs.txt
```

### 7.3 Log Monitoring

```bash
#!/bin/bash
# monitor-logs.sh

# Alert on errors
docker compose logs backend | grep -i error && \
  echo "ERROR DETECTED!" | mail -s "Alert: Backend Error" admin@example.com

# Count errors per hour
docker compose logs backend | \
  grep ERROR | \
  awk '{print $1}' | \
  uniq -c | \
  sort -rn
```

---

## 8. Access Control

### 8.1 SSH Key Management

```bash
# Generate per-team-member keys
ssh-keygen -t ed25519 -C "developer@example.com" -f ~/deploy_key

# Authorized keys file
echo "ssh-ed25519 AAAAC3Nza... developer@example.com" >> ~/.ssh/authorized_keys

# Restrict SSH key usage
echo 'command="/usr/bin/restricted-bash",from="203.0.113.5" ssh-ed25519 AAAAC3Nza...' >> ~/.ssh/authorized_keys
```

### 8.2 Sudo Access

```bash
# Restrict sudo access for deployment user
visudo

# Add line:
# deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart docker, /usr/bin/docker compose
```

### 8.3 Audit Log

```bash
# Enable auditd logging
sudo apt-get install auditd

# Monitor Docker daemon
sudo auditctl -w /usr/bin/docker -p x -k docker_execution

# View audit logs
sudo ausearch -k docker_execution
```

---

## 9. SSL/TLS Configuration

### 9.1 Certificate Setup

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate from Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal service
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
```

### 9.2 HTTPS Redirect

Using Nginx reverse proxy:

```nginx
# /etc/nginx/sites-available/personal-ai
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Strong TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
    }
}
```

---

## 10. Incident Response

### 10.1 Security Incident Checklist

**If breach suspected:**

1. ✅ Take affected service offline immediately

   ```bash
   docker compose-f docker compose.prod.yml stop backend
   ```

2. ✅ Preserve logs for analysis

   ```bash
   docker compose logs > incident-logs-$(date +%Y%m%d-%H%M%S).txt
   ```

3. ✅ Rotate all secrets immediately

   ```bash
   bash scripts/rotate-secrets.sh
   ```

4. ✅ Change database password

   ```sql
   ALTER ROLE personal_ai_user WITH PASSWORD 'NEW_STRONG_PASSWORD';
   ```

5. ✅ Review recent access

   ```bash
   docker compose logs backend | tail -100 > access-review.txt
   ```

6. ✅ Notify stakeholders

   ```bash
   echo "Incident report" | mail -s "Security Incident - Action Required" team@example.com
   ```

### 10.2 Post-Incident Analysis

```bash
# 1. Timeline of events
grep "TIMESTAMP" incident-logs.txt | head -20

# 2. Identify suspicious activity
grep "401\|403\|500" incident-logs.txt

# 3. Check for unauthorized access
docker compose logs db | grep "authentication failed"

# 4. Document findings
cat > incident-report.md << EOF
## Security Incident Report
- **Date:** $(date)
- **Severity:** High
- **Impact:** Database backup compromised
- **Root Cause:** Weak SSH password
- **Action Taken:** Keys rotated, password changed
- **Prevention:** SSH keys required, 2FA enabled
EOF
```

---

## 11. Security Checklist

### Pre-Production

- [ ] All secrets moved to `.env.production`
- [ ] Database password changed from default
- [ ] SSL/TLS certificate installed
- [ ] Firewall rules configured
- [ ] API key generated and stored securely
- [ ] CORS origins restricted to allowed domains
- [ ] Container running as non-root user
- [ ] Read-only filesystem enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] Backup encryption tested

### Ongoing

- [ ] Weekly log review
- [ ] Monthly security updates
- [ ] Quarterly secret rotation
- [ ] Quarterly security audit
- [ ] Backup restoration test quarterly
- [ ] Vulnerability scanning monthly
- [ ] Access control review quarterly
- [ ] Incident response plan tested annually

---

## 12. Security Resources

### Best Practices

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework/)

### Vulnerability Scanning

- [Trivy](https://github.com/aquasecurity/trivy) - Container vulnerability scanner
- [Snyk](https://snyk.io/) - Dependency vulnerability scanner
- [Docker Scout](https://docs.docker.com/scout/) - Docker supply chain security

### Tools

- [HashiCorp Vault](https://www.vaultproject.io/) - Secrets management
- [Fail2Ban](https://www.fail2ban.org/) - Intrusion prevention
- [UFW](https://help.ubuntu.com/community/UFW) - Firewall management

---

## Summary

A production-deployed Personal AI Assistant requires:

✅ **Secrets Management** - Environment variables, encrypted backups  
✅ **Database Security** - Strong passwords, SSL, encrypted backups  
✅ **API Security** - API keys, rate limiting, input validation  
✅ **Network Security** - Firewall, SSH hardening, CORS restrictions  
✅ **Container Security** - Non-root users, read-only filesystem  
✅ **Logging & Monitoring** - Centralized logs, error alerts, audit trails  
✅ **SSL/TLS** - HTTPS only, strong ciphers, certificate management  
✅ **Incident Response** - Procedures, documentation, recovery plans  

---

**All systems GO! 🚀 Your Personal AI Assistant is secured and production-ready.**
