# Project Overview

## What is Eeva?

Eeva is a comprehensive home management platform that helps families organize their lives, manage tasks, track events, store documents, and coordinate household activities. The platform provides a centralized hub for family organization with features like task management, calendar integration, document storage, and family member coordination.

## Project Background

This React Web application is a complete conversion of the original Eeva Mobile UI React Native application. The migration has been successfully completed, bringing the full mobile experience to the web with enhanced capabilities and performance.

### Migration Achievement
- **Original**: React Native mobile application
- **Current**: Production-ready Next.js React Web application
- **Result**: Feature-complete web version with responsive design and enhanced performance

## Core Features

### 🏠 Home Management
- **Hive System**: Organize family members into "hives" (households)
- **Property Management**: Track property details, appliances, and utilities
- **Space Organization**: Manage different areas of the home
- **Camera Integration**: iOS camera functionality for appliance photos and label scanning

### 📋 Task & Event Management
- **Task Creation & Assignment**: Create tasks and assign to family members
- **Calendar Integration**: Comprehensive calendar with event management
- **Priority System**: Color-coded priority levels (blue, green, orange, red)
- **Recurring Items**: Support for recurring tasks and events

### 📄 Document Management
- **Document Upload**: Store and organize family documents
- **File Type Support**: Multiple file formats with type-specific icons
- **Hive-based Organization**: Documents organized by hive/family unit

### 👥 Family Coordination
- **Member Management**: Add and manage family members
- **Role-based Access**: Different access levels (admin, restricted)
- **Contact Information**: Store contact details and relationships

### 🔐 Authentication & Security
- **Multi-provider OAuth**: Google and Apple authentication
- **Email/Password**: Traditional authentication option
- **JWT-based Security**: Secure token-based authentication
- **Password Reset**: Secure password recovery flow

## Technology Stack

### Frontend Framework
- **Next.js 15.3.2**: React framework with SSR/SSG capabilities
- **React 18.2.0**: Core UI library
- **TypeScript**: Type-safe development

### Routing & Navigation
- **Next.js App Router**: Primary file-based routing system
- **Next.js Navigation**: useRouter, usePathname, useSearchParams hooks

### State Management
- **Zustand 4.5.6**: Lightweight state management
- **React Context**: Authentication and language context

### Styling & UI
- **CSS Modules**: Component-scoped styling
- **Custom Design System**: Consistent color palette and typography
- **Responsive Design**: Mobile-first approach with web adaptations

### API & Data
- **Axios**: HTTP client for API requests
- **Node.js Backend**: RESTful API integration
- **JWT Authentication**: Token-based security

### Development Tools
- **pnpm**: Package manager
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## Architecture Patterns

### Component Architecture
- **Atomic Design**: Components organized by complexity
- **Reusable Components**: Shared UI components across features
- **React Native Compatibility**: Maintained design consistency

### API Integration
- **Service Layer**: Abstracted API calls in service modules
- **Error Handling**: Comprehensive error management
- **Loading States**: Consistent loading and skeleton states

### Authentication Flow
- **Context-based**: Authentication state managed via React Context
- **Token Management**: Automatic token refresh and storage
- **Route Protection**: Protected routes with authentication checks

## Project Structure

```
src/
├── app/                    # Next.js app directory (pages)
│   ├── api/               # API routes and proxies
│   ├── [feature]/         # Feature-based page organization
│   └── layout.tsx         # Root layout component
├── components/            # Reusable UI components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── services/             # API services and data layer
├── styles/               # Global styles and design tokens
├── util/                 # Utility functions and helpers
└── assets/               # Static assets (SVGs, images)
```

## Key Differentiators

### From React Native
- **Web-optimized Components**: Adapted for web interaction patterns
- **Responsive Design**: Works across desktop, tablet, and mobile
- **SEO Capabilities**: Server-side rendering for better discoverability

### Design Philosophy
- **Consistency**: Maintains visual and functional consistency with mobile app
- **Accessibility**: Web accessibility standards compliance
- **Performance**: Optimized for web performance metrics

## Current Status

### ✅ Production Ready
- **Complete Migration**: All React Native components successfully converted
- **Authentication System**: Production-ready OAuth and email/password authentication
- **API Integration**: Full integration with Node.js backend
- **Next.js Implementation**: Complete Next.js application with optimized performance
- **Responsive Design**: Mobile-first design working across all devices
- **Live Deployment**: Production application running on Vercel

### 🚀 Ongoing Enhancements
- Performance optimizations and monitoring
- Enhanced accessibility features
- Progressive Web App capabilities
- Advanced caching strategies

## Getting Started

For new developers joining the project:

1. Read the [Development Setup](../development/setup.md) guide
2. Review the [Component Architecture](../components/architecture.md)
3. Understand the [API Integration](../api/integration.md) patterns
4. Follow the [Development Workflow](../development/workflow.md)

---

*This overview provides a high-level understanding of the Eeva React Web project. For detailed technical information, refer to the specific documentation sections.*
