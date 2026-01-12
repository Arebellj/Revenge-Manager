# Revenge Tracker

## Overview

A dark-themed "revenge tracker" web application that allows users to create and track "targets" with progress bars, log entries, and completion status. The app features a dramatic dark mode UI with aggressive red accents ("Revenge Red" theme). Users can add targets with names, reasons, and plans, then track their progress and add activity logs over time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom dark theme variables
- **UI Components**: shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with React plugin

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Dashboard, 404)
- Reusable components in `client/src/components/`
- UI primitives from shadcn in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod for input validation
- **API Structure**: RESTful endpoints defined in `shared/routes.ts`

The backend uses a simple storage pattern:
- `server/storage.ts` provides the `IStorage` interface and `DatabaseStorage` implementation
- `server/routes.ts` registers all API endpoints
- `server/db.ts` manages PostgreSQL connection pool

### Data Model
Two main entities with a one-to-many relationship:
- **Targets**: id, name, reason, plan, progress (0-100), isComplete, createdAt
- **Logs**: id, targetId, description, createdAt

### API Design
Routes are defined in `shared/routes.ts` with full type safety:
- `GET/POST /api/targets` - List and create targets
- `GET/PATCH/DELETE /api/targets/:id` - Individual target operations
- `GET/POST /api/targets/:id/logs` - Log operations nested under targets
- `DELETE /api/targets` - Delete all data

### Build & Development
- Development: `npm run dev` runs tsx with hot reload
- Production: `npm run build` uses esbuild for server and Vite for client
- Database migrations: `npm run db:push` via Drizzle Kit

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available but not actively used)

### UI Libraries
- **Radix UI**: Accessible primitives for dialogs, sliders, toasts, etc.
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality
- **date-fns**: Date formatting utilities

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Full type checking across client/server/shared
- **Drizzle Kit**: Database migration tooling