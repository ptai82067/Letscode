# CourseAI - Admin Dashboard

A full-stack course management system built with **Go**, **React**, and **PostgreSQL**. Create, manage, and deliver interactive lessons with built-in media handling, RBAC, and quiz components.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                     │
│                    http://localhost:5173                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP (REST API)
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│              Backend (Go + Fiber v2 + GORM)                      │
│                    http://localhost:8080                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ SQL
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│        PostgreSQL 15 (Docker)  + Adminer (DB Inspector)          │
│  Postgres: 127.0.0.1:5433  |  Adminer: 127.0.0.1:8082           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tech Stack

| Layer    | Technology                        | Version |
| -------- | --------------------------------- | ------- |
| Frontend | React + TypeScript + Vite         | 18.x    |
| Backend  | Go + Fiber v2 + GORM              | 1.21+   |
| Database | PostgreSQL + pgx driver           | 15      |
| DevTools | Docker & Docker Compose + Node.js | Latest  |

---

## 🎯 Key Features

- **Full CRUD API** for Programs, Subcourses, Lessons, and all lesson components
- **14 database tables** with polymorphic media handling
- **JWT authentication** with RBAC (Admin/Teacher roles)
- **Auto migrations** and demo data seeding on startup
- **Interactive lesson builder** with 8 component types
- **Adminer UI** for quick database inspection
- **Development-friendly** startup scripts with auto recovery

---

## 📋 System Requirements

| Tool           | Minimum Version | Installation                                                     |
| -------------- | --------------- | ---------------------------------------------------------------- |
| Docker         | 20.10+          | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Docker Compose | 2.0+            | Included with Docker Desktop                                     |
| Go             | 1.21+           | [golang.org](https://go.dev/dl/)                                 |
| Node.js        | 18+             | [nodejs.org](https://nodejs.org/)                                |
| Git            | Any             | [git-scm.com](https://git-scm.com/)                              |

**Note**: Docker is _required_. Backend and Frontend run locally but use Docker for PostgreSQL.

---

## 🚀 Getting Started in 5 Minutes

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd CourseAI
```

### Step 2: Verify Prerequisites

**Windows (PowerShell)**:

```powershell
docker --version
docker-compose --version
go version
node --version
npm --version
```

**macOS / Linux (Bash)**:

```bash
docker --version
docker-compose --version
go version
node --version
npm --version
```

All commands should display version numbers. If any fail, install missing tools using the links above.

### Step 3: Create Environment File

Copy the example to create `.env`:

```bash
# From repository root
cp backend/.env.example backend/.env
```

**Important**: The `.env` file is already configured for local development. Do NOT commit it to git.

### Step 4: Start Everything (ONE Command)

````MỞ APP DOCKER TRƯỚC KHI CHẠY
**Windows (PowerShell)**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev-all.ps1
````

ví dụ PS D:\CousreAI> powershell -ExecutionPolicy Bypass -File .\scripts\start-dev-all.ps1

**macOS / Linux (Bash)**:

```bash
chmod +x ./scripts/start-dev-all.sh
./scripts/start-dev-all.sh
```

**What the script does**:

1. ✅ Starts PostgreSQL & Adminer via Docker
2. ✅ Automatically creates the `courseai_db` database
3. ✅ Downloads Go dependencies
4. ✅ Starts the backend server
5. ✅ Installs Node.js dependencies (if needed)
6. ✅ Starts the Vite dev server

### Step 5: Verify Everything is Running

Open your browser:

| Service  | URL                                 | Status                           |
| -------- | ----------------------------------- | -------------------------------- |
| Frontend | http://localhost:5173               | React app                        |
| Backend  | http://localhost:8080/api/auth/me   | Should return 401 (no login yet) |
| Adminer  | http://localhost:8082               | Database UI                      |
| Postgres | 127.0.0.1:5433 (from host terminal) | Running                          |

### Step 6: Login to the Application

- **URL**: http://localhost:5173
- **Username**: `admin`
- **Password**: `admin123`

You'll be logged in as Admin with full access.

---

## 📂 Folder Structure

```
CourseAI/
├── backend/                          # Go backend (Fiber framework)
│   ├── cmd/server/main.go            # Application entry point
│   ├── internal/
│   │   ├── config/config.go          # Config loading and validation
│   │   ├── database/                 # Database migrations & seeding
│   │   ├── handlers/                 # HTTP request handlers (CRUD)
│   │   ├── middleware/               # Auth & CORS middleware
│   │   ├── models/                   # GORM models (14 tables)
│   │   └── utils/                    # JWT and utilities
│   ├── uploads/                      # Media file uploads (runtime)
│   ├── .env                          # Environment variables (local dev)
│   ├── .env.example                  # Environment template
│   ├── Dockerfile                    # Production Docker image
│   ├── go.mod & go.sum               # Dependency management
│   └── README.md                     # Backend-specific docs
│
├── frontend/                         # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API client (api.ts)
│   │   ├── contexts/                 # React contexts (auth)
│   │   └── types/                    # TypeScript types
│   ├── vite.config.ts                # Vite configuration
│   ├── package.json                  # Node.js dependencies
│   └── tailwind.config.js            # Tailwind CSS config
│
├── scripts/                          # Helper scripts
│   ├── start-dev-all.ps1             # Windows startup script
│   ├── start-dev-all.sh              # Unix startup script
│   ├── stop-dev-all.ps1              # Windows stop script
│   └── stop-dev-all.sh               # Unix stop script
│
├── docker-compose.yml                # PostgreSQL + Adminer services
├── README.md                         # This file
└── logs/                             # Runtime logs (created at startup)
    ├── backend.out.log
    ├── backend.err.log
    ├── frontend.out.log
    └── frontend.err.log
```

---

## 🗄️ Database Schema

The system uses **14 tables** organized into 3 groups:

### Core Tables

- `users` - Admin and Teacher accounts
- `programs` - Top-level courses
- `subcourses` - Sub-courses within programs
- `lessons` - Individual lessons
- `media` - Polymorphic media files

### Lesson Components (8 tables)

- `lesson_objectives` - Learning objectives (knowledge, thinking, skills, attitude)
- `lesson_models` - Instructional models
- `lesson_preparations` - Lesson preparation materials
- `lesson_builds` - Presentation slides (PDF/Images)
- `lesson_content_blocks` - Detailed content
- `lesson_attachments` - Downloadable files
- `lesson_challenges` - Interactive challenges
- `lesson_quizzes` - Assessment questions

### RBAC Tables

- `teacher_assignments` - Role assignments
- `teacher_assignment_logs` - Audit trail

**Auto-seed on startup**: System creates demo data with 1 Program → 1 Subcourse → 1 full-featured Lesson.

---

## 🌐 API Endpoints

### Authentication

```http
POST   /api/auth/login              # Login (returns JWT token)
GET    /api/auth/me                 # Current user info (requires auth)
```

### Programs

```http
GET    /api/admin/programs          # List all programs
POST   /api/admin/programs          # Create program
GET    /api/admin/programs/:id      # Get program by ID
PUT    /api/admin/programs/:id      # Update program
DELETE /api/admin/programs/:id      # Delete program
```

### Lessons

```http
GET    /api/admin/lessons           # List all lessons
POST   /api/admin/lessons           # Create lesson (with all components)
GET    /api/admin/lessons/:id       # Get lesson (full detail)
PUT    /api/admin/lessons/:id       # Update lesson (with all components)
DELETE /api/admin/lessons/:id       # Delete lesson (cascade)
```

### Subcourses

```http
GET    /api/admin/subcourses        # List all subcourses
GET    /api/admin/programs/:programId/subcourses  # By program
GET    /api/admin/subcourses/:id    # Get by ID
PUT    /api/admin/subcourses/:id    # Update
```

---

## 🔧 Environment Variables

The `.env` file configures local development. **Do not commit this file.**

```dotenv
# Database (Docker Postgres on 127.0.0.1:5433)
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=courseai_db
DB_SSLMODE=disable

# Server
PORT=8080
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=dev_secret_change_in_production
JWT_EXPIRE_HOURS=24

# Runtime
ENV=development
```

**For production deployment** (Render.com, etc.), set:

- `DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require`
- `JWT_SECRET=<generate-with: openssl-rand-hex-32>`
- Other variables per deployment platform

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

This will:

- Stop backend and frontend processes
- Stop Docker containers (but keep data)
- Display status summary

---

## 🧹 Reset Database

To completely reset the database (lose all data):

```bash
# Stop services first
# Then:
docker-compose down -v
docker-compose up -d

# Restart backend to re-seed
```

---

## 🐛 Troubleshooting

### Docker is not running

```
Error: Docker daemon not available
```

**Fix**: Start Docker Desktop and wait 10 seconds, then retry.

### Port already in use (8080 or 5173)

```
Error: Port 8080 is currently in use
```

**Fix**:

```bash
# Find and kill process on port 8080
# Windows:
netstat -ano | findstr :8080  # Note PID
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8080 | xargs kill -9
```

### Backend fails to connect to database

```
Failed to connect to database: database "courseai_db" does not exist
```

**Fix**:

- Ensure PostgreSQL container is running: `docker ps`
- Check Docker logs: `docker logs courseai_postgres`
- Restart containers: `docker-compose restart`

### Frontend shows "Cannot reach API"

```
Error: Network request failed at http://localhost:8080/api
```

**Fix**:

- Ensure backend is running: `curl http://localhost:8080/api/auth/me`
- Check backend logs: `tail logs/backend.err.log`
- Verify port 8080 is not blocked

### Git LFS issues (media files)

```
Error: pointer file instead of actual content
```

**Fix**:

```bash
git lfs install
git lfs pull
```

### TypeScript errors in frontend

```
Type errors in VS Code
```

**Fix**:

```bash
cd frontend
npm install
# Restart VS Code TypeScript server (Cmd+Shift+P → "Restart TS Server")
```

---

## 📊 Logs and Debugging

Logs are written to the `logs/` folder:

| File               | Purpose                    |
| ------------------ | -------------------------- |
| `backend.out.log`  | Backend stdout (info logs) |
| `backend.err.log`  | Backend stderr (errors)    |
| `frontend.out.log` | Frontend dev server logs   |
| `frontend.err.log` | Frontend errors            |
| `backend.pid`      | Backend process ID         |
| `frontend.pid`     | Frontend process ID        |

**View logs in real-time**:

```bash
# Windows PowerShell
Get-Content logs/backend.err.log -Wait

# macOS/Linux
tail -f logs/backend.err.log
```

---

## 🚀 Development Workflow

### 1. Make Backend Changes

- Edit files in `backend/internal/`
- Backend auto-reloads? ❌ No, you must restart
- Kill process: `.\scripts\stop-dev-all.ps1`
- Restart: `.\scripts\start-dev-all.ps1`

### 2. Make Frontend Changes

- Edit files in `frontend/src/`
- Vite auto-reloads: ✅ Yes, instant
- Refresh browser to see changes

### 3. Modify Database Schema

- Edit models in `backend/internal/models/`
- Edit seed data in `backend/internal/database/seed.go`
- Restart backend (triggers auto-migration)

### 4. Add Dependencies

**Go**:

```bash
cd backend
go get github.com/username/module
go mod tidy
```

**Node.js**:

```bash
cd frontend
npm install package-name
```

---

## 📦 Deployment

This project supports **two deployment modes**:

### Mode 1: Full Docker Stack (Production)

- All services in Docker
- Command: `docker-compose --profile full-stack up`
- Use cases: Cloud platforms (Render, Fly.io, etc.)

### Mode 2: Hybrid (Local Frontend + Docker Backend)

- Backend in Docker, Frontend runs locally
- Command: `./scripts/start-dev-all.sh`
- Use cases: Development, testing

---

## 🔐 Security Considerations

⚠️ **Development Only**: This setup is for local development. For production:

1. **Change JWT secret**:

   ```bash
   openssl rand -hex 32
   ```

   Set the output in your production `JWT_SECRET` env var

2. **Use DATABASE_URL** for managed databases (Neon, Supabase)
3. **Enable HTTPS** in production (CORS expects https://)
4. **Restrict CORS** to your actual frontend domain
5. **Use environment-specific configs** per deployment

---

## 📞 Support

If you encounter issues:

1. **Check logs**: `tail -f logs/backend.err.log`
2. **Inspect database**: Open Adminer at http://127.0.0.1:8082
3. **Check Docker**: `docker ps` and `docker logs courseai_postgres`
4. **Browser DevTools**: Network tab to see API calls

---

## 📚 Learn More

- [Go Documentation](https://golang.org/doc/)
- [Fiber Framework](https://docs.gofiber.io/)
- [GORM ORM](https://gorm.io/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

---

## 📄 License

[Add your license here]

---

**Happy coding!** 🚀

Hệ thống bao gồm 14 bảng:

### Core Tables

- `users` - Người dùng (admin, teacher)
- `programs` - Chương trình lớn
- `subcourses` - Khóa con (thuộc Program)
- `lessons` - Bài học (thuộc Subcourse)
- `media` - Media files (polymorphic)

### Lesson Components (8 bảng)

- `lesson_objectives` - Mục tiêu (knowledge, thinking, skills, attitude)
- `lesson_models` - Models
- `lesson_preparations` - Chuẩn bị
- `lesson_builds` - PDF/Image slides
- `lesson_content_blocks` - Nội dung chi tiết
- `lesson_attachments` - File đính kèm
- `lesson_challenges` - Thử thách
- `lesson_quizzes` - Câu hỏi
- `lesson_quiz_options` - Đáp án

### RBAC Tables

- `teacher_assignments` - Phân quyền teacher
- `teacher_assignment_logs` - Audit logs

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user

### Programs

- `GET /api/admin/programs` - List programs
- `POST /api/admin/programs` - Create program
- `GET /api/admin/programs/:id` - Get program
- `PUT /api/admin/programs/:id` - Update program
- `DELETE /api/admin/programs/:id` - Delete program

### Subcourses

- `GET /api/admin/subcourses` - List subcourses
- `GET /api/admin/programs/:programId/subcourses` - Get by program
- `GET /api/admin/subcourses/:id` - Get subcourse
- `PUT /api/admin/subcourses/:id` - Update subcourse
- `POST /api/admin/lessons` - Create lesson (with all components)
- `GET /api/admin/lessons/:id` - Get lesson (full detail)
- `PUT /api/admin/lessons/:id` - Update lesson (with all components)
- `DELETE /api/admin/lessons/:id` - Delete lesson (cascade)

## 📂 Cấu Trúc Thư Mục

```
CourseAI/
├── backend/
│   ├── cmd/server/main.go          # Entry point
│   ├── internal/
│   │   ├── config/                 # Configuration
│   │   ├── database/               # DB connection & migrations
│   │   ├── models/                 # GORM models (14 tables)
│   │   ├── handlers/               # HTTP handlers (CRUD)
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── contexts/               # Auth context
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API calls
│   │   ├── types/                  # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml              # PostgreSQL container
└── README.md
```

Khi backend khởi động lần đầu, hệ thống sẽ tự động tạo: 2. **Program**: "CourseAI Essential" 3. **Subcourse**: "Beginner Robotics" (age 8-10) 4. **Lesson**: "Introduction to Motors" với đầy đủ:

- Objectives (4 mục tiêu)
- 2 Models với media
- Preparation với notes & media
- 2 Builds (1 PDF, 1 Image slides)
- 2 Content blocks
- 2 Attachments (PDF, SB3)
- 1 Challenge
- 2 Quizzes (single choice & multiple choice)

## 🎯 Tính Năng Chính

### Đã Hoàn Thành ✅

- ✅ Backend API hoàn chỉnh với CRUD đầy đủ
- ✅ Database schema với 14 bảng
- ✅ Auto migration & seed data
- ✅ JWT authentication
- ✅ RBAC structure (Admin/Teacher)
- ✅ Polymorphic media handling
- ✅ Full lesson component support
- ✅ Frontend project setup với React + TypeScript
- ✅ API service layer
- ✅ Authentication context

### Đang Phát Triển 🚧

- 🚧 Frontend UI components (Programs, Subcourses, Lessons)
- 🚧 Lesson form với all components (tabs interface)
- 🚧 Media preview components

## 🛠️ Development Commands

### Backend

```bash
# Run server
go run cmd/server/main.go

# Build
go build -o server cmd/server/main.go

# Tidy dependencies
go mod tidy
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Database

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# Remove data (reset database)
docker-compose down -v
```

## 🐛 Troubleshooting

### Backend không kết nối được database

- Kiểm tra PostgreSQL container đang chạy: `docker ps`
- Kiểm tra logs: `docker logs courseai_postgres`
- Restart container: `docker-compose restart`

### Frontend không gọi được API

- Kiểm tra backend đang chạy tại http://localhost:8080
- Kiểm tra CORS settings trong backend
- Xem browser console để biết lỗi chi tiết

### TypeScript errors trong frontend

- Run: `cd frontend && npm install`
- Restart VSCode TypeScript server

## 📄 Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=courseai_db
DB_SSLMODE=disable

JWT_SECRET=CHANGE_ME_IN_PRODUCTION
JWT_EXPIRE_HOURS=24

PORT=8080
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env - optional)

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Backend logs (terminal chạy `go run`)
2. Frontend console (browser DevTools)
3. PostgreSQL logs (`docker logs courseai_postgres`)
4. API responses (Network tab trong DevTools)

## 🎓 Sử Dụng

1. Truy cập http://localhost:5173
2. Login với `admin123` / `admin123`
3. Quản lý Programs, Subcourses, và Lessons
4. Tạo, sửa, xóa content
5. Xem dữ liệu mẫu đã được seed

---

**Note**: Đây là môi trường development. Đối với production, cần:

- Thay đổi JWT secret
- Enable HTTPS
- Configure proper CORS
- Set up proper database backups
- Use environment-specific configs

## Dev helper scripts

If you want a one-command dev startup (on your machine with Docker & Go installed), run the provided script from repository root.

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
```

Unix/macOS:

```bash
./scripts/start-dev.sh
```

The script will:

- check Docker is running and start Postgres via `docker-compose.yml`
- attempt to start backend if `go` is available
- install frontend deps (if needed) and start Vite dev server

Note: I could not start Docker or Go in the current environment, so please run the script locally. The frontend dev server can still be started independently with `cd frontend && npm run dev`.

## Optional: Setup prerequisites (Windows)

To install recommended VS Code extensions (Docker, Go) and optionally install Docker Desktop & Go via `winget`, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-prereqs.ps1
# or to attempt winget installs (requires admin):
powershell -ExecutionPolicy Bypass -File .\scripts\setup-prereqs.ps1 -InstallWithWinget
```

The script will:

- install VS Code extensions `ms-azuretools.vscode-docker` and `golang.go` if the `code` CLI is available.
- optionally attempt to install Docker Desktop and Go using `winget` when run with `-InstallWithWinget` (requires admin/UAC).

If `winget` is not available or you prefer manual installs, see:

- Docker Desktop: https://www.docker.com/get-started
- Go: https://go.dev/dl/
