# Development Environment Setup - Verification Checklist

## ✅ For New Developers (Copy-Paste Ready)

### Prerequisites Installed?

```bash
# Run these commands in your terminal
docker --version          # Should show Docker version 20.10+
docker-compose --version  # Should show version 2.0+
go version               # Should show go1.21+
node --version           # Should show v18+
npm --version            # Should show 9.x+
```

All should return version numbers. If any fail, install from:

- Docker: https://www.docker.com/products/docker-desktop
- Go: https://go.dev/dl/
- Node.js: https://nodejs.org/

---

## 🚀 ONE-COMMAND STARTUP (Recommended)

### Windows (PowerShell) - 4 Steps

```powershell
# 1. Open PowerShell
# 2. Navigate to repository
cd C:\path\to\CourseAI

# 3. Copy environment file
copy backend\.env.example backend\.env

# 4. Run startup script
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev-all.ps1
```

**Expected Output**:

```
== start-dev-all.ps1: starting development environment ==
1) Docker / Postgres
   Checking Docker daemon...
   Starting Postgres via docker-compose...
   Waiting for Postgres on 127.0.0.1:5433 (timeout 60s)...
   ✓ Postgres is reachable
   Creating database 'courseai_db' if it doesn't exist...
   Database setup complete.

2) Ensure Go toolchain
   ✓ Go 1.21 found

3) Backend: download modules and start server
   Running: go mod download
   Starting backend as background process...
   ✓ Backend is running on http://127.0.0.1:8080

4) Frontend: install deps and start Vite dev server
   Installing frontend dependencies (npm install)...
   ✓ Frontend is running on http://127.0.0.1:5173

== Development environment ready!

Services:
  PostgreSQL:  127.0.0.1:5433 (Adminer: http://127.0.0.1:8082)
  Backend:     http://127.0.0.1:8080/api
  Frontend:    http://127.0.0.1:5173
```

### macOS / Linux (Bash) - 4 Steps

```bash
# 1. Open Terminal
# 2. Navigate to repository
cd /path/to/CourseAI

# 3. Copy environment file
cp backend/.env.example backend/.env

# 4. Run startup script
chmod +x ./scripts/start-dev-all.sh
./scripts/start-dev-all.sh
```

**Expected Output**: Same as Windows

---

## 🌐 Verify Everything Works

Open these in your browser:

| Service  | URL                       | Expected       |
| -------- | ------------------------- | -------------- |
| Frontend | http://localhost:5173     | Login page     |
| Backend  | http://localhost:8080/api | 404 (no route) |
| Adminer  | http://localhost:8082     | Database UI    |

### Login to Application

- **URL**: http://localhost:5173
- **Username**: `admin`
- **Password**: `admin123`

You should see the admin dashboard with sample data (1 Program, 1 Subcourse, 1 Lesson).

---

## 🛑 Stopping Services

### Windows (PowerShell)

```powershell
.\scripts\stop-dev-all.ps1
```

### macOS / Linux (Bash)

```bash
./scripts/stop-dev-all.sh
```

---

## 🧹 Restart with Clean Database

If you need to reset everything:

```bash
# 1. Stop services
.\scripts\stop-dev-all.ps1  # or ./scripts/stop-dev-all.sh on Mac/Linux

# 2. Remove database volume (WARNING: loses all data)
docker-compose down -v

# 3. Restart
.\scripts\start-dev-all.ps1  # or ./scripts/start-dev-all.sh on Mac/Linux
```

---

## 🐛 Troubleshooting Quick Reference

### "Docker daemon not available"

→ Start Docker Desktop and wait 10 seconds, then retry

### "Port 8080 already in use"

→ Run `.\scripts\stop-dev-all.ps1` to stop all services

### "Database does not exist"

→ Script auto-creates it. If issue persists:

```bash
docker logs courseai_postgres
```

### "Cannot reach API from frontend"

→ Verify backend is running:

```bash
curl http://localhost:8080/api/auth/me
```

### "Blank login page"

→ Check frontend logs:

```bash
tail logs/frontend.err.log
```

---

## 📁 Key Files You Need to Know

| File Path                   | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `backend/.env`              | Backend config (auto-created from .env.example) |
| `docker-compose.yml`        | PostgreSQL + Adminer config                     |
| `scripts/start-dev-all.ps1` | Windows startup script                          |
| `scripts/start-dev-all.sh`  | Unix startup script                             |
| `logs/backend.err.log`      | Backend errors                                  |
| `logs/frontend.err.log`     | Frontend errors                                 |

---

## 📊 Development Ports

| Service  | Port | URL                   |
| -------- | ---- | --------------------- |
| Frontend | 5173 | http://localhost:5173 |
| Backend  | 8080 | http://localhost:8080 |
| Postgres | 5433 | 127.0.0.1:5433 (host) |
| Adminer  | 8082 | http://localhost:8082 |

---

## ✨ Success Criteria

You'll know everything is working when:

- [ ] Docker Desktop is running (icon in system tray)
- [ ] Startup script completes with no errors
- [ ] Frontend loads at http://localhost:5173 (login page visible)
- [ ] Backend responds at http://localhost:8080/api/auth/me
- [ ] Can login with `admin` / `admin123`
- [ ] Admin dashboard shows sample data (Programs, Lessons, etc.)
- [ ] Adminer accessible at http://localhost:8082
- [ ] Logs in `logs/` folder contain no ERROR messages

---

## 🚀 Next Steps

1. **Read the full README.md** for API endpoints, architecture, and deployment
2. **Backend development**: Edit files in `backend/internal/` then restart
3. **Frontend development**: Edit files in `frontend/src/` - auto-reloads
4. **Database changes**: Modify models in `backend/internal/models/`, restart backend

---

## 📞 Need Help?

1. **Check logs**: `tail logs/backend.err.log` or `logs/frontend.err.log`
2. **Verify Docker**: `docker ps` should show 2 running containers
3. **Database UI**: Open http://localhost:8082 (Adminer)
4. **Read README.md**: Full documentation with all endpoints and troubleshooting

---

**Last Updated**: January 7, 2026
