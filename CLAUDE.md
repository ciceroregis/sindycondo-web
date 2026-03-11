# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm test           # Run Vitest unit tests
npm run watch      # Dev build in watch mode
```

## Architecture Overview

Angular 21 SPA with standalone components, Angular Signals for state, and Tailwind CSS 4.

**Working directory:** `/media/zurc/Cicero/MY_PROJECTS/PROJETO_CONDOMINIO/sindycondo/frontend/sindycondo/`

**Backend API:** `http://localhost:8000/api` (configured in `src/environments/environment.ts`)

### Directory Structure

```
src/app/
├── core/
│   ├── services/       # AuthService, UsuariosService, CondominiosService, GaragensService
│   ├── guards/         # authGuard, guestGuard, notMoradorGuard
│   ├── interceptors/   # auth.interceptor.ts (adds Bearer token, handles 401)
│   ├── models/         # TypeScript interfaces (index.ts)
│   └── components/     # Shared components (pagination)
├── layout/shell/       # App shell with role-based navigation
├── auth/login/         # Login page
├── dashboard/          # Post-login main page
├── moradores/          # Resident management
├── garagens/           # Garage/parking management
├── configuracoes/      # Settings (admin/sindico only)
├── perfil/             # User profile
├── visitantes/         # Visitors (in development)
└── acessos/            # Access control (in development)
```

### State Management

Uses Angular Signals — no NgRx/Redux. Services expose `signal()` and `computed()` properties for reactive state. Authentication state lives in `AuthService` with signals: `_user`, `isAuthenticated`, `isAdmin`, `isSindico`, `isPorteiro`.

### Authentication Flow

1. Login stores `access_token` and `refresh_token` in localStorage
2. `auth.interceptor.ts` attaches `Authorization: Bearer` header to all requests
3. On 401, interceptor clears tokens and redirects to `/login`
4. `authGuard` checks localStorage for `access_token`

### Role-Based Access

User roles: `admin`, `sindico`, `porteiro`, `morador`

- `notMoradorGuard` redirects `morador` users to `/perfil`
- `guestGuard` redirects authenticated users away from `/login`
- `ShellComponent` filters nav items based on role

### Component Conventions

- All components are **standalone** (no NgModules)
- Uses `@if`, `@for` Angular control flow syntax (not `*ngIf`, `*ngFor`)
- Reactive forms via `FormsModule`
- HTTP calls use Angular `HttpClient` through services only
