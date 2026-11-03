# StockFlow: Inventory Management System

Full-stack inventory and sales system built with Next.js 14, PostgreSQL and AWS.

## Features
- Auth: JWT httpOnly cookies, roles (Admin / Manager / Staff), forced password change, login rate limiting, forgot/reset password
- Products: CRUD, categories, search, sort, pagination, low-stock alerts, product detail with stock chart
- Stock: in/out, history, stock take, barcode/QR scan
- Sales: orders with transactional stock deduction, cancel/restore, customers, printable invoices
- Purchasing: suppliers, purchase orders, receive stock
- Reports: dashboard, revenue, top products, CSV export
- Admin: user management, audit log
- UX: responsive glass UI, light/dark theme, Sinhala/English menu, installable PWA

## Tech stack
Next.js 14, React, TypeScript, Tailwind CSS, Recharts, Prisma, PostgreSQL, Zod, bcryptjs, jose, Jest, Docker, GitHub Actions, AWS (EC2, RDS, S3, ECR, ALB, Secrets Manager, CloudWatch).

## Architecture
```
Browser -> middleware (JWT) -> API routes -> Prisma -> PostgreSQL
Production: ALB (HTTPS) -> EC2 (Docker) -> RDS (private) + S3 (images)
CI/CD: GitHub Actions -> test -> build image -> ECR -> deploy via SSM
```

## Getting started
```bash
git clone <repo-url> && cd inventory
npm install
docker compose up -d
npx prisma migrate dev
npx prisma db seed        # admin@demo.com / admin123 (change on first login)
npm run dev               # http://localhost:3000
```

`.env`:
```
DATABASE_URL="postgresql://app:app@localhost:5433/inventory"
JWT_SECRET="long-random-string"
COOKIE_SECURE="false"
APP_URL="http://localhost:3000"
```

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Jest unit tests |
| `npx tsc --noEmit` | Type check |
| `npm run build` | Production build |

## Testing
Jest tests in `tests/` cover CSV export, date ranges, rate limiting and i18n. No database needed.

## Security
bcrypt hashing, httpOnly cookies, role checks in every API, Zod validation, CSV injection guard, audit log, hashed single-use reset tokens, login rate limiting.