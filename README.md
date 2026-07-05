# MediGuardian AI

Enterprise-Level AI-Powered Personal & Family Healthcare Assistant

## Overview
MediGuardian AI is a robust healthcare platform that intelligently manages medication adherence, prescription understanding, health monitoring, and family care coordination. 

Built with enterprise software engineering standards, it features AI-powered Digital Twins, predictive health analytics, and seamless real-time notifications.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Supabase) + Redis (BullMQ)
- **AI Integration**: Google Gemini API (with Context Engine)
- **DevOps**: Turborepo, GitHub Actions, Docker Compose

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 8.15.0
- Docker Desktop (for local DB/Redis)

### Installation
1. Clone the repository
2. Run `pnpm install` at the root
3. Copy `.env.example` to `.env` and fill in the necessary keys
4. Start the local database services:
   ```bash
   docker-compose up -d
   ```
5. Run database migrations:
   ```bash
   cd apps/api && pnpm prisma db push
   ```
6. Start the development server:
   ```bash
   pnpm dev
   ```

### Project Structure
- `apps/web`: Next.js 15 frontend application
- `apps/api`: NestJS backend API
- `packages/ui`: Shared shadcn/ui components
- `packages/types`: Shared TypeScript interfaces and types
- `packages/utils`: Shared utilities and formatters
- `packages/config`: Shared configurations (eslint, tsconfig)

## Architecture
MediGuardian uses a monorepo approach managed by Turborepo. The backend is modularized to strictly enforce separation of concerns, and the frontend is built with Server Components by default for optimal performance.

## License
Proprietary
