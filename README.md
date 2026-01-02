# CourseAI - Admin Dashboard

Dự án quản lý khóa học với backend Go + PostgreSQL và frontend React + TypeScript.

## 🏗️ Kiến Trúc

- **Backend**: Go + Fiber v2 + GORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Database**: PostgreSQL 15 (Docker)

## 📋 Yêu Cầu Hệ Thống

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (qua Docker)

## 🚀 Cài Đặt và Chạy

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Kiểm tra container đã chạy
docker ps
```

### 2. Start Backend Server

```bash
cd backend

# Download Go dependencies
go mod download

# Run server (sẽ tự động migrate và seed data)
go run cmd/server/main.go
```

Backend sẽ chạy tại: **http://localhost:8080**

### 3. Start Frontend Development Server

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

## 🔑 Tài Khoản Mặc Định
- **Role**: Admin (full access)

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

Khi backend khởi động lần đầu, hệ thống sẽ tự động tạo:
2. **Program**: "CourseAI Essential"
3. **Subcourse**: "Beginner Robotics" (age 8-10)
4. **Lesson**: "Introduction to Motors" với đầy đủ:
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
