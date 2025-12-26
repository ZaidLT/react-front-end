# Eeva React Web

A comprehensive home management platform built with React and Next.js. This project is a complete web conversion of the Eeva Mobile UI React Native application, providing families with tools to organize their lives, manage tasks, track events, store documents, and coordinate household activities.

## 🏠 What is Eeva?

Eeva is a family organization platform that helps households manage their daily lives through:

- **Task Management**: Create, assign, and track tasks with priority levels
- **Calendar Integration**: Comprehensive event management and scheduling
- **Document Storage**: Organize and store family documents by category
- **Family Coordination**: Manage family members and their access levels
- **Property Management**: Track home details, appliances, and utilities
- **Hive System**: Organize family units into manageable "hives"

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18 or higher
- **pnpm**: Version 8 or higher (recommended package manager)

### Installation
```bash
# Clone the repository
git clone https://github.com/eeva-ai/react-web.git
cd react-web

# Install dependencies
pnpm install

# Start development server
pnpm debug
```

The application will be available at `http://localhost:3001`

### Available Scripts
```bash
pnpm debug    # Start development server (recommended)
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
pnpm test     # Run tests
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

### Getting Started
- **[Project Overview](./docs/architecture/project-overview.md)** - High-level project understanding
- **[Development Setup](./docs/development/setup.md)** - Complete setup guide
- **[Development Workflow](./docs/development/workflow.md)** - Best practices and processes

### Architecture & Technical Guides
- **[Component Architecture](./docs/components/architecture.md)** - Component structure and patterns
- **[API Integration](./docs/api/integration.md)** - API design and integration
- **[Authentication System](./docs/api/authentication.md)** - Authentication flow and security

### Features & Functionality
- **[AI Label Scanning](./docs/features/label-scanning.md)** - OpenAI-powered product information extraction
- **[Camera Functionality](./docs/features/camera-functionality.md)** - iOS camera integration for appliance photos and label scanning

### Migration & History
- **[React Native to Web Migration](./docs/migration/react-native-to-web.md)** - Complete migration story
- **[Next.js Migration](./docs/migration/nextjs-migration.md)** - Framework migration details

### Deployment & Operations
- **[Deployment Guide](./docs/deployment/deployment.md)** - Production deployment
- **[Environment Configuration](./docs/deployment/environments.md)** - Environment setup

## 🏗️ Technology Stack

### Core Framework
- **Next.js 15.3.2**: React framework with SSR/SSG capabilities
- **React 18.2.0**: UI library with hooks and modern patterns
- **TypeScript**: Type-safe development environment

### Key Libraries
- **Zustand**: Lightweight state management
- **Axios**: HTTP client for API integration
- **React Calendar**: Calendar component for web
- **Lottie React**: Animation library
- **CSS Modules**: Component-scoped styling

### Development Tools
- **pnpm**: Fast, efficient package manager
- **ESLint**: Code linting and quality
- **Vercel**: Deployment and hosting platform

## ✨ Key Features

### 🏠 Home Management
- **Hive System**: Organize family members into households
- **Property Tracking**: Manage property details, appliances, and utilities
- **Space Organization**: Organize different areas of your home
- **AI Label Scanning**: Automatically extract appliance information from product labels using OpenAI

### 📋 Task & Event Management
- **Smart Task Creation**: Create and assign tasks with priority levels
- **Calendar Integration**: Comprehensive calendar with event management
- **Recurring Items**: Support for recurring tasks and events
- **Family Coordination**: Assign tasks to specific family members

### 📄 Document Management
- **Secure Storage**: Upload and organize family documents
- **Category Organization**: Organize documents by type and hive
- **File Type Support**: Support for multiple file formats

### 👥 Family Features
- **Member Management**: Add and manage family members
- **Access Control**: Role-based access (admin, restricted)
- **Contact Information**: Store and manage contact details

### 🔐 Security & Authentication
- **Multi-provider OAuth**: Google and Apple authentication
- **Email/Password**: Traditional authentication option
- **JWT Security**: Secure token-based authentication
- **Password Recovery**: Secure password reset flow

## 🎯 Project Status

### ✅ Production Ready
- **Complete Migration**: 100+ React Native components successfully converted to React Web
- **Authentication System**: Production OAuth and email/password authentication
- **API Integration**: Full integration with Node.js backend via optimized proxy
- **Next.js Application**: Complete Next.js implementation with SSR/SSG capabilities
- **Responsive Design**: Mobile-first design optimized for all screen sizes
- **Live Deployment**: Production application running on Vercel

### 🚀 Ongoing Enhancements
- Performance monitoring and optimizations
- Enhanced accessibility and PWA features
- Advanced caching and offline capabilities
- Comprehensive testing and documentation

## 🧪 Component Demo

Explore all available components at `/component-demo`:
- Visual reference for all converted components
- Interactive testing environment
- Component props and usage documentation
- Real-time component rendering

## 🌐 Live Application

- **Production**: [react-web-eeva.vercel.app](https://react-web-eeva.vercel.app)
- **Component Demo**: [react-web-eeva.vercel.app/component-demo](https://react-web-eeva.vercel.app/component-demo)

## 🚀 Migration Success Story

This project represents a **completed** comprehensive migration from React Native to React Web:

### Migration Achievements
- **100+ Components**: All React Native components successfully converted and production-ready
- **Visual Consistency**: Exact look and feel preserved from mobile app
- **Feature Parity**: All mobile functionality preserved and enhanced for web
- **Modern Architecture**: Production Next.js application with TypeScript and modern React patterns
- **Performance Optimized**: Web-optimized with SSR, code splitting, and caching

### Key Technology Migrations
| React Native | React Web | Purpose |
|--------------|-----------|---------|
| `react-native` | `react-dom` | Core rendering |
| `expo-router` | `Next.js App Router` | Navigation & routing |
| `react-native-svg` | Direct SVG imports | Icon & graphics |
| `lottie-react-native` | `lottie-react` | Animations |
| `react-native-calendars` | `react-calendar` | Calendar functionality |
| `AsyncStorage` | `localStorage` | Data persistence |

## 🤝 Contributing

We welcome contributions! Please follow our development guidelines:

### Before Contributing
1. **Read the Documentation**: Start with [Project Overview](./docs/architecture/project-overview.md)
2. **Setup Development Environment**: Follow [Development Setup](./docs/development/setup.md)
3. **Understand the Workflow**: Review [Development Workflow](./docs/development/workflow.md)

### Development Process
```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/react-web.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and test
pnpm debug  # Start development server
pnpm test   # Run tests
pnpm lint   # Check code quality

# 4. Submit a pull request
```

### Code Quality Standards
- **TypeScript**: All code must be properly typed
- **Testing**: Include tests for new features
- **Documentation**: Update docs for significant changes
- **Consistency**: Follow existing patterns and conventions

## 📞 Support & Resources

### Documentation
- **[Complete Documentation](./docs/)** - Comprehensive project documentation
- **[API Documentation](./docs/api/)** - API integration guides
- **[Component Guide](./docs/components/)** - Component development guide

### Getting Help
1. **Check Documentation**: Most questions are answered in the docs
2. **Component Demo**: Use `/component-demo` to understand components
3. **Issues**: Create detailed GitHub issues for bugs or feature requests

### Development Resources
- **Component Demo**: `/component-demo` - Interactive component showcase
- **Development Server**: `pnpm debug` - Hot reloading development environment
- **Build Analysis**: `pnpm build` - Production build and optimization analysis

---

**Built with ❤️ by the Eeva team** | **[Documentation](./docs/)** | **[Live Demo](https://react-web-eeva.vercel.app)**