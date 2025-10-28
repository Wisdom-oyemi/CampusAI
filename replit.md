# Campus AI Assistant

## Overview

Campus AI Assistant is a student productivity web application that provides AI-powered answers about campus events, tutoring sessions, deadlines, and class information. Built with React and Express, it leverages NVIDIA's Nemotron AI model to deliver intelligent, context-aware responses to student queries.

The application features a clean, utility-focused design with a chat-first interface, allowing students to quickly access campus information through natural language conversations. It includes pre-seeded data about campus events, deadlines, and tutoring sessions, with the AI assistant providing personalized, conversational responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component System**
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design System**: Material Design + Linear influences optimized for information density and clarity
- Custom CSS variables for theming with light/dark mode support

**State Management**
- Server state managed through React Query with optimistic updates
- Local UI state handled via React hooks
- No global state management library (Redux/Zustand) needed due to simple state requirements

**Typography & Visual Hierarchy**
- Primary font: Inter (Google Fonts)
- Monospace font: JetBrains Mono for timestamps and course codes
- Consistent spacing primitives using Tailwind units (2, 4, 8, 12, 16)

### Backend Architecture

**Runtime & Framework**
- **Node.js** with Express for the HTTP server
- **TypeScript** compiled via `tsx` for development and `esbuild` for production builds
- ES modules throughout (package.json has `"type": "module"`)

**API Structure**
- RESTful API endpoints under `/api` prefix
- Chat message endpoints for conversation history and new message creation
- Data endpoints for events, deadlines, and tutoring sessions
- Request/response logging middleware for API monitoring

**AI Integration**
- NVIDIA Nemotron AI (llama-3.3-nemotron-super-49b-v1.5) via NVIDIA API
- Context-aware responses using campus data (events, deadlines, tutoring)
- System prompts constructed dynamically based on available campus information

**Storage Architecture**
- Abstract `IStorage` interface for data persistence layer
- In-memory storage implementation (`MemStorage`) with pre-seeded mock data
- Schema validation using Zod with Drizzle integration
- Database-ready with Drizzle ORM configured for PostgreSQL (currently using in-memory storage, but architected for easy database migration)

### Data Storage

**ORM & Schema Definition**
- **Drizzle ORM** configured with PostgreSQL dialect
- Schema defined in `shared/schema.ts` using Drizzle's type-safe table definitions
- **Neon Database** driver (@neondatabase/serverless) for PostgreSQL connectivity
- Zod schema validation integrated with Drizzle via `drizzle-zod`

**Data Models**
- `chatMessages`: Stores conversation history with AI/user designation
- `events`: Campus events with categorization (Academic, Social, Career, Sports, Arts)
- `deadlines`: Assignment/exam deadlines with urgency levels
- `tutoringSessions`: Tutor availability with subject and location details

**Current Implementation**
- In-memory storage with pre-seeded mock data for development
- Storage abstraction layer allows seamless transition to database persistence
- UUID-based primary keys via `gen_random_uuid()`

### External Dependencies

**AI Services**
- **NVIDIA AI API** (integrate.api.nvidia.com) for natural language processing
- Model: llama-3.3-nemotron-super-49b-v1.5
- Requires `NVIDIA_API_KEY` environment variable

**Database**
- **PostgreSQL** via Neon Database serverless driver
- Requires `DATABASE_URL` environment variable for production
- Drizzle Kit for schema migrations

**UI Libraries**
- **Radix UI** primitives for accessible components (accordion, dialog, dropdown, etc.)
- **Lucide React** for icon system
- **cmdk** for command palette functionality
- **embla-carousel-react** for carousel components
- **vaul** for drawer components
- **react-day-picker** for calendar/date selection

**Utilities**
- **class-variance-authority** for variant-based component styling
- **clsx** and **tailwind-merge** for conditional class composition
- **date-fns** for date manipulation and formatting
- **nanoid** for unique ID generation

**Development Tools**
- **Replit** integration plugins (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)
- **PostCSS** with Tailwind and Autoprefixer
- **ESBuild** for production bundling

**Fonts**
- Google Fonts CDN: Inter (variable weight) and JetBrains Mono