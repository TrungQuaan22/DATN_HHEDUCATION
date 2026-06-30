# HH Education

HH Education là hệ thống quản lý học tập trực tuyến gồm ba ứng dụng chính:

- `frontend`: giao diện Next.js;
- `backend`: REST API Express, Prisma và PostgreSQL;
- `python-ai-service`: dịch vụ AI Tutor sử dụng FastAPI và RAG.

Repository không chứa mật khẩu, API key, dữ liệu production, thư viện đã cài hoặc thư mục build. Hãy tạo các tệp môi trường từ tệp `.env.example` tương ứng trước khi chạy.

## Yêu cầu môi trường

- Node.js 22 và npm;
- Python 3.12;
- PostgreSQL 17 có extension `pgvector`;
- Docker và Docker Compose nếu chạy bằng container.

## Chạy ở môi trường phát triển

### 1. Cơ sở dữ liệu và backend

```powershell
cd backend
Copy-Item .env.example .env
docker compose up -d
npm ci
npx prisma generate --schema=prisma/schema
npx prisma migrate deploy --schema=prisma/schema
npm run dev
```

Backend mặc định chạy tại `http://localhost:4000`. Cập nhật thông tin PostgreSQL, Cloudflare R2, JWT, email, thanh toán và AI Service trong `backend/.env` theo môi trường sử dụng.

### 2. AI Service

Mở một cửa sổ PowerShell khác:

```powershell
cd python-ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Cấu hình cùng PostgreSQL với backend và thêm API key của nhà cung cấp mô hình vào `python-ai-service/.env`.

### 3. Frontend

Mở một cửa sổ PowerShell khác:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Frontend mặc định chạy tại `http://localhost:3000`.

## Chạy kiểm thử và kiểm tra bản build

```powershell
cd backend
npm test
npm run build

cd ..\frontend
npm run lint
npm run build

cd ..\python-ai-service
python -m unittest test_evaluate_rag.py
```

## Triển khai bằng Docker

Sao chép `.env.production.example` thành `.env.production`, điền đầy đủ secret và tên miền rồi chạy:

```powershell
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

Compose khởi tạo PostgreSQL, chạy Prisma migration, sau đó khởi động AI Service, backend, frontend và Caddy. Hướng dẫn cấu hình máy chủ, DNS, sao lưu và phục hồi dữ liệu nằm trong `deployment/DEPLOYMENT.md`.

Trang triển khai thử nghiệm: `https://hheducation.io.vn`.

## Cấu trúc chính

```text
backend/                       API, nghiệp vụ, Prisma schema và migration
frontend/                      Giao diện web Next.js
python-ai-service/             AI Tutor, xử lý tài liệu và đánh giá RAG
deployment/                    Caddy và script sao lưu PostgreSQL
Report_DATN_GiangTrungQuan/    Nguồn LaTeX và bản PDF của báo cáo
docker-compose.production.yml  Cấu hình triển khai production
```
