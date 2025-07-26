# Classroom Seating Chart Builder

## Overview

This is a modern web application for creating classroom seating charts with drag-and-drop functionality. The app allows teachers to layout desks on a canvas, import student lists, set seating constraints, and generate optimized seating arrangements with PDF export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 26, 2025
- Fixed desk dragging functionality - desks now properly drag and snap to grid without jumping
- Resolved button visibility issues - all buttons now display correctly without hover requirement
- Implemented responsive design for mobile and tablet devices
- Updated door icon to minimal floorplan style with opening arc
- Changed student list ordering - new students appear at top for easy verification
- Improved desk text handling with fixed dimensions and proper overflow management
- Added reset button to clear all data (students, desks, constraints) with confirmation dialog
- Implemented quick desk arrangement layouts (rows, groups, pairs) for common classroom setups
- Removed round table option and made teacher desk draggable with grid snapping
- Added classroom furniture items (bookshelf, cabinet, counter, closet, refrigerator, printer)
- Implemented JSON export/import functionality for complete layout save/load without database
- Tightened spacing in desk groupings for more realistic classroom arrangements

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with local state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **Architecture Pattern**: RESTful API design (currently minimal implementation)
- **Development**: Hot-reload development server with Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Local Storage**: Browser localStorage for persisting seating layouts locally
- **Session Management**: In-memory storage with planned PostgreSQL integration
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Core Features
1. **Student Management**: Add/remove students, bulk import from text
2. **Desk Layout**: Drag-and-drop desk placement with grid snapping
3. **Constraint System**: Define seating rules (hard seats, keep apart, distance requirements)
4. **Seating Algorithm**: Optimized assignment algorithm with constraint validation
5. **PDF Export**: Generate downloadable seating charts using html2canvas and jsPDF
6. **Auto-save**: Automatic layout persistence to localStorage

### UI Components
- **Draggable Canvas**: Interactive workspace with grid background and desk elements
- **Student List Manager**: Interface for adding and managing student rosters
- **Constraints Builder**: Tools for defining seating rules and restrictions
- **Responsive Design**: Mobile-friendly interface with collapsible panels

### External Libraries
- **interact.js**: Provides drag-and-drop functionality for desk elements
- **html2canvas**: Converts canvas to image for PDF generation
- **jsPDF**: Creates downloadable PDF documents
- **Radix UI**: Accessible component primitives for the UI system

## Data Flow

1. **Student Input**: Users add students via individual input or bulk text import
2. **Desk Placement**: Teachers drag desks onto the canvas with automatic grid alignment
3. **Constraint Definition**: Optional rules are set for specific seating requirements
4. **Algorithm Processing**: The seating algorithm processes constraints and generates assignments
5. **Layout Persistence**: Current state is automatically saved to localStorage
6. **PDF Generation**: Final seating charts can be exported as PDF documents

## External Dependencies

### Runtime Dependencies
- **Database**: Neon serverless PostgreSQL for cloud database hosting
- **CDN Libraries**: External scripts loaded for interact.js, html2canvas, and jsPDF
- **UI Components**: Comprehensive Radix UI component library for accessibility

### Development Dependencies
- **TypeScript**: Type safety across the entire application
- **ESLint/Prettier**: Code quality and formatting tools
- **Vite Plugins**: Development enhancement plugins including error overlay

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static assets and external scripts served from CDN

### Environment Configuration
- **Development**: Hot-reload development server with Vite middleware
- **Production**: Express server serves static files and API routes
- **Database**: Environment-based PostgreSQL connection via DATABASE_URL

### Hosting Considerations
- **Static Assets**: Can be served from CDN for better performance
- **Database**: Requires PostgreSQL instance (currently configured for Neon)
- **Server**: Node.js environment with Express for API and static file serving

The application follows a monorepo structure with shared TypeScript types and clean separation between client and server code. The architecture prioritizes developer experience with hot-reload, type safety, and modern tooling while maintaining production readiness with optimized builds and proper error handling.