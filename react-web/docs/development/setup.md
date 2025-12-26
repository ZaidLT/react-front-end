# Development Setup

## Prerequisites

Before setting up the Eeva React Web project, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **pnpm**: Version 8 or higher (preferred package manager)
  - Install: `npm install -g pnpm`
  - Verify installation: `pnpm --version`
- **Git**: For version control
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Recommended Tools
- **VS Code**: Recommended IDE with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer
- **Chrome DevTools**: For debugging and performance analysis
- **React Developer Tools**: Browser extension for React debugging

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/eeva-ai/react-web.git
cd react-web
```

### 2. Install Dependencies
```bash
# Install all project dependencies
pnpm install
```

### 3. Environment Configuration
Create environment files for different environments:

```bash
# Development environment (optional - uses defaults)
touch .env.local
```

Example `.env.local` configuration:
```env
# Development settings
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ENVIRONMENT=development

# Optional: Override default ports
PORT=3000
```

### 4. Start Development Server
```bash
# Start the Next.js development server
pnpm debug

# Alternative: Standard development command
pnpm dev
```

The application will be available at:
- **Main app**: http://localhost:3001
- **Component demo**: http://localhost:3001/component-demo

## Available Scripts

### Development Scripts
```bash
# Start development server with debugging (kills existing processes)
pnpm debug

# Standard Next.js development server
pnpm dev

# Build the application for production
pnpm build

# Start production server (after build)
pnpm start

# Run linting
pnpm lint

# Run tests
pnpm test

# Copy SVG assets to public directory
pnpm copy-svg
```

### Script Details

#### `pnpm debug`
- Kills any existing processes on port 3001
- Starts Next.js development server on port 3001
- Includes hot reloading and error overlay
- Recommended for daily development

#### `pnpm build`
- Creates optimized production build
- Generates static files in `.next` directory
- Runs TypeScript type checking
- Optimizes assets and bundles

#### `pnpm copy-svg`
- Copies SVG assets from `src/assets` to `public` directory
- Maintains directory structure
- Required for SVG assets to be accessible

## Development Environment

### File Structure Overview
```
react-web/
├── docs/                   # Project documentation
├── public/                 # Static assets
├── src/                    # Source code
│   ├── app/               # Next.js app directory (pages)
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── styles/           # CSS and styling
│   ├── util/             # Utility functions
│   └── assets/           # Source assets (SVGs, images)
├── scripts/              # Build and utility scripts
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project overview
```

### Key Configuration Files

#### `next.config.js`
Next.js configuration for:
- SVG handling with @svgr/webpack
- Asset optimization
- Build settings

#### `tsconfig.json`
TypeScript configuration with:
- Strict type checking
- Path aliases for imports
- Next.js specific settings

#### `package.json`
Project metadata and dependencies:
- Scripts for development and build
- Dependencies and dev dependencies
- ESLint and browserslist configuration

## Development Workflow

### 1. Daily Development
```bash
# Start your development session
pnpm debug

# The server will start on http://localhost:3001
# Hot reloading is enabled - changes will reflect automatically
```

### 2. Working with Components
```bash
# Visit the component demo page to see all components
http://localhost:3001/component-demo

# Test individual components in isolation
# Make changes and see them update in real-time
```

### 3. API Development
```bash
# API requests are proxied through Next.js API routes
# Backend API: https://node-backend-eeva.vercel.app/api
# Frontend proxy: http://localhost:3001/api

# Test API endpoints using the proxy
curl http://localhost:3001/api/auth/login
```

### 4. Asset Management
```bash
# After adding new SVG assets to src/assets/
pnpm copy-svg

# SVGs will be available at /path/to/asset.svg
# Example: /hive-icons/home.svg
```

## IDE Configuration

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "css"
  }
}
```

### VS Code Extensions
Recommended extensions for optimal development experience:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## Debugging

### Browser DevTools
- **React DevTools**: Inspect component hierarchy and props
- **Network Tab**: Monitor API requests and responses
- **Console**: View application logs and errors
- **Sources**: Set breakpoints and debug JavaScript

### Next.js Debugging
```bash
# Enable debug mode
DEBUG=* pnpm dev

# Debug specific modules
DEBUG=next:* pnpm dev
```

### Common Debug Scenarios

#### API Issues
```bash
# Check API proxy logs in terminal
# Verify backend API status
# Test direct API calls with curl or Postman
```

#### Component Issues
```bash
# Use React DevTools to inspect component state
# Check browser console for errors
# Use component demo page for isolated testing
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript errors
pnpm build
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on port 3001
lsof -ti tcp:3001 | xargs kill -9

# Or use the debug script which handles this automatically
pnpm debug
```

#### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Next.js cache
rm -rf .next
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript definitions
pnpm add -D @types/node @types/react @types/react-dom
```

#### SVG Assets Not Loading
```bash
# Run the SVG copy script
pnpm copy-svg

# Check if assets exist in public directory
ls -la public/assets/
```

### Getting Help

1. **Check Documentation**: Review relevant docs sections
2. **Component Demo**: Use `/component-demo` to test components
3. **Browser Console**: Check for JavaScript errors
4. **Network Tab**: Verify API requests are working
5. **React DevTools**: Inspect component state and props

## Next Steps

After completing the setup:

1. **Explore the Application**: Visit different pages and features
2. **Review Component Demo**: Understand available components
3. **Read Architecture Docs**: Understand the codebase structure
4. **Start Development**: Follow the [Development Workflow](./workflow.md) guide

---

*For development workflow and best practices, see [Development Workflow](./workflow.md).*
