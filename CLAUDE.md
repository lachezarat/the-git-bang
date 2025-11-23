# CLAUDE.md - AI Assistant Guide for "The Git Bang"

> **Last Updated**: 2025-11-23
> **Purpose**: Comprehensive reference for AI assistants working with this codebase

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Development Workflows](#development-workflows)
6. [Key Conventions](#key-conventions)
7. [Component Patterns](#component-patterns)
8. [3D Rendering System](#3d-rendering-system)
9. [Styling Guidelines](#styling-guidelines)
10. [Data Management](#data-management)
11. [Testing & Quality](#testing--quality)
12. [Deployment](#deployment)
13. [Common Tasks](#common-tasks)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**The Git Bang** is a cyberpunk-themed 3D visualization platform for exploring Git repositories. It renders 25,000+ particles in a WebGL-powered "light cone" that represents repository data in an immersive, interactive environment.

### Core Features

- **3D Particle System**: 25,000 instanced particles using custom GLSL shaders
- **Interactive Visualization**: Click particles to view repository details
- **Cyberpunk UI**: Retro-futuristic HUD with scanline effects, glowing elements
- **Real-time Search**: Filter repositories with live suggestions
- **Smooth Animations**: GSAP-powered transitions and Three.js rendering
- **Full-Stack SPA**: React frontend + Express backend with serverless support

### Project Type

Full-stack TypeScript application based on the "Fusion Starter" template, heavily customized for 3D visualization and cyberpunk aesthetics.

---

## Technology Stack

### Frontend Core

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | 18.3.1 | UI framework with functional components & hooks |
| **TypeScript** | 5.9.2 | Type safety (strict mode: disabled for flexibility) |
| **Vite** | 7.1.2 | Build tool with SWC compilation |
| **React Router** | 6.30.1 | Client-side SPA routing |
| **TailwindCSS** | 3.4.17 | Utility-first CSS framework |

### 3D Rendering

| Package | Version | Purpose |
|---------|---------|---------|
| **Three.js** | 0.176.0 | WebGL 3D rendering engine |
| **React Three Fiber** | 8.18.0 | React renderer for Three.js |
| **React Three Drei** | 9.122.0 | Useful 3D primitives (OrbitControls, etc.) |
| **@react-three/postprocessing** | 3.0.4 | Post-processing effects pipeline |
| **Custom GLSL Shaders** | N/A | Particle vertex/fragment shaders, laser effects |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| **Express** | 5.1.0 | HTTP server framework |
| **CORS** | 2.8.5 | Cross-origin request handling |
| **serverless-http** | 3.2.0 | Netlify Functions wrapper |

### UI Components

- **Radix UI**: All major primitives (Dialog, Dropdown, Select, Tabs, Tooltip, etc.)
- **Shadcn/ui**: 48+ pre-built components in `client/components/ui/`
- **Lucide React**: Icon library (0.539.0)
- **Framer Motion**: Advanced React animations (12.23.12)
- **GSAP**: Animation timeline library (3.13.0)

### Data & Forms

- **React Hook Form** (7.62.0): Form state management
- **Zod** (3.25.76): TypeScript-first schema validation
- **TanStack React Query** (5.84.2): Server state management & caching

### Development Tools

- **Vitest** (3.2.4): Unit testing framework
- **Prettier** (3.6.2): Code formatting
- **pnpm** (10.14.0): Package manager (preferred)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER                              │
├─────────────────────────────────────────────────────────┤
│  React SPA (Port 8080 in dev)                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ React Router 6 (SPA Mode)                         │  │
│  │ - / (Index) → Main 3D visualization               │  │
│  │ - * (NotFound) → 404 page                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ React Three Fiber Canvas                          │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ Scene3D (orchestrator)                      │   │  │
│  │ │ - PerspectiveCamera (fov: 75, z: 150)      │   │  │
│  │ │ - OrbitControls (camera manipulation)       │   │  │
│  │ │ - Lighting (Ambient + 3 Point Lights)       │   │  │
│  │ │                                              │   │  │
│  │ │ LightCone (25,000 particles)                │   │  │
│  │ │ - Custom vertex/fragment shaders            │   │  │
│  │ │ - Instanced geometry for performance        │   │  │
│  │ │ - Mouse interaction raycasting              │   │  │
│  │ │                                              │   │  │
│  │ │ FunnelWireframe (geometric guide)           │   │  │
│  │ │ LaserBeam (targeting effects)               │   │  │
│  │ │ ParticleInteraction (click handler)         │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ HUD (Heads-Up Display)                            │  │
│  │ - SearchBar (cyberpunk-styled, live search)       │  │
│  │ - StatsPanel (repository statistics)              │  │
│  │ - TimelinePanel (temporal navigation)             │  │
│  │ - ControlsPanel (user instructions)               │  │
│  │ - YearMarker (time indicators)                    │  │
│  │ - TargetingReticle (crosshair overlay)            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Overlays & Effects                                │  │
│  │ - BootSequence (startup animation sequence)       │  │
│  │ - ScanlineOverlay (retro CRT effect)              │  │
│  │ - RepoCard (repository detail popup)              │  │
│  │ - AmbientSound (audio feedback system)            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                     ↕ HTTP/API
┌─────────────────────────────────────────────────────────┐
│              EXPRESS BACKEND                             │
├─────────────────────────────────────────────────────────┤
│  API Routes (prefix: /api/)                              │
│  - GET /api/ping → Health check                          │
│  - GET /api/demo → Example endpoint                      │
│                                                           │
│  Static File Serving (Production)                        │
│  - Serves SPA from dist/spa/                             │
│  - Falls back to index.html for SPA routing              │
└─────────────────────────────────────────────────────────┘
                     ↕ File System
┌─────────────────────────────────────────────────────────┐
│              DATA SOURCES                                │
├─────────────────────────────────────────────────────────┤
│  - /public/repositories.json (static repository data)    │
│  - .env (VITE_PUBLIC_BUILDER_KEY, PING_MESSAGE)         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initial Load**: BootSequence animation → Repository data fetch → Particle generation → 3D scene render
2. **Repository Data**: `useRepositoryData()` hook → Fetch `/repositories.json` → In-memory cache → Generate 25,000 particles
3. **User Interaction**: Mouse click → Raycasting → Particle hit detection → RepoCard popup
4. **Search**: Input change → Filter repositories → Update suggestions → Highlight particles

---

## Directory Structure

```
/home/user/the-git-bang/
├── client/                        # React SPA frontend
│   ├── components/                # React components
│   │   ├── ui/                   # 48+ shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (45 more)
│   │   │
│   │   ├── Scene3D.tsx           # 3D canvas orchestration
│   │   ├── LightCone.tsx         # 25,000 particle system
│   │   ├── FunnelWireframe.tsx   # Geometric funnel visualization
│   │   ├── LaserBeam.tsx         # Laser effects with custom shaders
│   │   ├── ParticleInteraction.tsx # Mouse interaction handler
│   │   ├── RepoCard.tsx          # Repository detail popup
│   │   ├── HUD.tsx               # Heads-up display container
│   │   ├── SearchBar.tsx         # Search interface
│   │   ├── BootSequence.tsx      # Startup animation
│   │   ├── ScanlineOverlay.tsx   # CRT scanline effect
│   │   ├── AmbientSound.tsx      # Audio system
│   │   ├── StatsPanel.tsx        # Statistics display
│   │   ├── TimelinePanel.tsx     # Timeline UI
│   │   ├── ControlsPanel.tsx     # User controls
│   │   ├── NavigationControls.tsx # Navigation UI
│   │   ├── TargetingReticle.tsx  # Crosshair overlay
│   │   ├── LaserTargeting.tsx    # Laser targeting system
│   │   └── YearMarker.tsx        # Year indicators
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useRepositoryData.ts  # Data fetching & caching
│   │   └── use-mobile.tsx        # Mobile detection
│   │
│   ├── lib/                      # Utilities & data
│   │   ├── repositoryData.ts     # Data loading & particle generation
│   │   ├── utils.ts              # cn() utility for class names
│   │   └── utils.spec.ts         # Unit tests
│   │
│   ├── shaders/                  # GLSL shader programs
│   │   ├── particleVertex.glsl   # Particle vertex shader
│   │   ├── particleFragment.glsl # Particle fragment shader
│   │   ├── laserVertex.glsl      # Laser vertex shader
│   │   └── laserFragment.glsl    # Laser fragment shader
│   │
│   ├── pages/                    # Route components
│   │   ├── Index.tsx             # Home page (main app)
│   │   └── NotFound.tsx          # 404 page
│   │
│   ├── App.tsx                   # App entry point & routing
│   ├── global.css                # 478 lines of theming & animations
│   └── vite-env.d.ts             # Vite type definitions
│
├── server/                       # Express backend
│   ├── index.ts                  # Express app factory
│   ├── node-build.ts             # Production server entry point
│   └── routes/
│       └── demo.ts               # Example API route handler
│
├── shared/                       # Shared types (client + server)
│   └── api.ts                    # Type definitions (DemoResponse)
│
├── netlify/                      # Netlify Functions deployment
│   └── functions/
│       └── api.ts                # Serverless API handler wrapper
│
├── public/                       # Static assets
│   └── repositories.json         # Repository metadata dataset
│
├── .builder/                     # Builder.io integration
│
├── dist/                         # Build output (gitignored)
│   ├── spa/                      # Client build artifacts
│   └── server/                   # Server build artifacts
│
└── Configuration Files
    ├── package.json              # Dependencies & scripts
    ├── pnpm-lock.yaml            # Lock file (pnpm 10.14.0)
    ├── tsconfig.json             # TypeScript config
    ├── vite.config.ts            # Vite client build
    ├── vite.config.server.ts     # Vite server build
    ├── tailwind.config.ts        # Tailwind theme
    ├── components.json           # shadcn/ui config
    ├── postcss.config.js         # PostCSS pipeline
    ├── netlify.toml              # Netlify deployment
    ├── .npmrc                    # npm/pnpm config
    ├── .prettierrc               # Code formatting
    ├── .gitignore                # Git ignore rules
    ├── .dockerignore             # Docker ignore rules
    ├── .env                      # Environment variables
    ├── index.html                # HTML entry point
    ├── AGENTS.md                 # Project documentation
    └── CLAUDE.md                 # This file
```

---

## Development Workflows

### Setup & Installation

```bash
# Clone repository
git clone <repo-url>
cd the-git-bang

# Install dependencies (use pnpm)
pnpm install

# Start development server
pnpm dev
# Server runs on http://localhost:8080
```

### Available Scripts

```bash
pnpm dev             # Start dev server (client + server, hot reload)
pnpm build           # Production build (client + server)
pnpm build:client    # Build SPA only → dist/spa/
pnpm build:server    # Build server only → dist/server/
pnpm start           # Start production server
pnpm test            # Run Vitest tests
pnpm format.fix      # Auto-format with Prettier
pnpm typecheck       # TypeScript validation (tsc)
```

### Development Server

- **Port**: 8080
- **Hot Reload**: Both client and server code
- **API Proxy**: `/api/*` routes to Express backend
- **3D Preview**: Full WebGL rendering in browser

### Build Process

#### Client Build (`pnpm build:client`)

```bash
vite build
# Input: client/, shared/
# Output: dist/spa/ (minified, optimized)
# Entry: index.html → client/App.tsx
```

#### Server Build (`pnpm build:server`)

```bash
vite build --config vite.config.server.ts
# Input: server/, shared/
# Output: dist/server/production.mjs (ES module)
# Target: Node.js 22
# External deps: express, cors, node built-ins
```

#### Full Build (`pnpm build`)

Runs both client and server builds sequentially.

### Production Server

```bash
pnpm start
# Runs: node dist/server/node-build.mjs
# Serves: dist/spa/ (static files)
# Port: process.env.PORT || 3000
```

---

## Key Conventions

### Code Style

1. **Formatting**: Prettier with 2-space indentation, trailing commas
2. **TypeScript**: Strict mode disabled for flexibility (see tsconfig.json:21-26)
3. **Naming**:
   - Components: PascalCase (`LightCone.tsx`)
   - Hooks: camelCase starting with `use` (`useRepositoryData.ts`)
   - Files: Match component names exactly
   - Types/Interfaces: PascalCase (`Repository`, `RepoCardProps`)

### Import Conventions

```typescript
// Path aliases (configured in tsconfig.json)
import { Component } from '@/components/Component';  // client/
import { DemoResponse } from '@shared/api';          // shared/

// Absolute imports for packages
import { useState } from 'react';
import * as THREE from 'three';

// Relative imports for local files (avoid when possible)
import { util } from './util';
```

### TypeScript Guidelines

- **Strict mode**: Disabled (flexibility for rapid development)
- **Type annotations**: Use for function parameters and return types
- **Interfaces**: Prefer interfaces over types for object shapes
- **Shared types**: Define in `shared/api.ts` for client-server consistency

Example:
```typescript
// shared/api.ts
export interface Repository {
  name: string;
  stars: number;
  // ...
}

// client/components/RepoCard.tsx
import { Repository } from '@shared/api';

interface RepoCardProps {
  repository: Repository;
  onClose: () => void;
}
```

### Component Conventions

1. **Functional Components**: Always use functional components with hooks
2. **Props Interface**: Define props interface for each component
3. **Default Exports**: Use default exports for components
4. **File Organization**:
   ```typescript
   // 1. Imports
   import React from 'react';

   // 2. Type definitions
   interface ComponentProps {
     // ...
   }

   // 3. Component
   export default function Component({ prop }: ComponentProps) {
     // Hooks first
     const [state, setState] = useState();

     // Effects
     useEffect(() => {}, []);

     // Handlers
     const handleClick = () => {};

     // Render
     return <div>...</div>;
   }
   ```

### API Endpoint Conventions

**IMPORTANT**: Only create API endpoints when strictly necessary (private keys, DB operations, server-side logic). Prefer static data or client-side processing.

```typescript
// server/routes/my-route.ts
import { RequestHandler } from 'express';
import { MyResponse } from '@shared/api';

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyResponse = { /* ... */ };
  res.json(response);
};

// server/index.ts
import { handleMyRoute } from './routes/my-route';

app.get('/api/my-endpoint', handleMyRoute);
```

### Git Workflow

1. **Branches**: Feature branches from main
2. **Commits**: Clear, descriptive messages
3. **PRs**: Required for merging to main
4. **Format before commit**: `pnpm format.fix`

---

## Component Patterns

### 3D Components (React Three Fiber)

```typescript
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function My3DComponent() {
  // 1. Refs for Three.js objects
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // 2. Memoized geometry/materials
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 'cyan' }), []);

  // 3. Animation loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // 4. JSX-like syntax for Three.js
  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  );
}
```

**Key Points**:
- Use `useRef()` for Three.js object references
- Use `useMemo()` for expensive geometry/material creation
- Use `useFrame()` for per-frame updates (not `useEffect`)
- Use `<mesh>`, `<group>`, `<points>` JSX elements

### Custom Shader Components

```typescript
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ShaderComponent() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('cyan') }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}
```

### UI Components (Radix + Tailwind)

```typescript
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'default' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({ variant = 'default', children, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        "px-4 py-2 rounded-md transition-colors",
        // Variant styles
        {
          "bg-space-cyan text-space-void": variant === 'default',
          "border border-space-cyan text-space-cyan": variant === 'outline',
        },
        // User overrides
        className
      )}
    >
      {children}
    </button>
  );
}
```

**Key Points**:
- Use `cn()` utility for conditional class names
- Support `className` prop for user overrides
- Use TypeScript for prop validation
- Follow Radix UI composition patterns

### Data Fetching Hooks

```typescript
import { useState, useEffect } from 'react';

export function useRepositoryData() {
  const [data, setData] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch('/repositories.json')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  return { data, loading, error };
}
```

---

## 3D Rendering System

### Particle System Architecture

The core visualization uses an **instanced particle system** for performance:

```typescript
// LightCone.tsx pattern
const particleCount = 25000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const activity = new Float32Array(particleCount);

// Fill arrays with data
for (let i = 0; i < particleCount; i++) {
  const index = i * 3;
  positions[index] = x;
  positions[index + 1] = y;
  positions[index + 2] = z;

  colors[index] = r;
  colors[index + 1] = g;
  colors[index + 2] = b;

  activity[i] = activityLevel;
}

// Create geometry
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('activity', new THREE.BufferAttribute(activity, 1));

// Use Points (not Mesh) for instanced rendering
<points geometry={geometry}>
  <shaderMaterial
    vertexShader={particleVertexShader}
    fragmentShader={particleFragmentShader}
    uniforms={uniforms}
    transparent
    depthWrite={false}
    blending={THREE.AdditiveBlending}
  />
</points>
```

### Shader System

Shaders are stored in `client/shaders/` as `.glsl` files:

**Vertex Shader** (`particleVertex.glsl`):
```glsl
attribute float activity;
uniform float uTime;
varying vec3 vColor;

void main() {
  vColor = color;

  // Pulsing animation based on activity
  float pulse = sin(uTime * 2.0 + activity * 10.0) * 0.5 + 0.5;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (5.0 + pulse * 3.0) * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
```

**Fragment Shader** (`particleFragment.glsl`):
```glsl
varying vec3 vColor;

void main() {
  // Circular particle shape
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  // Glow effect
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  gl_FragColor = vec4(vColor, alpha);
}
```

### Camera Setup

Default camera configuration (Scene3D.tsx):

```typescript
<PerspectiveCamera
  makeDefault
  position={[0, 0, 150]}
  fov={75}
  near={0.1}
  far={1000}
/>

<OrbitControls
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  minDistance={50}
  maxDistance={300}
/>
```

### Lighting Setup

Three-point lighting with colored accents:

```typescript
<ambientLight intensity={0.5} />
<pointLight position={[100, 100, 100]} intensity={1.0} color="cyan" />
<pointLight position={[-100, -100, -100]} intensity={0.5} color="magenta" />
<pointLight position={[0, 100, -100]} intensity={0.3} color="amber" />
```

### Performance Optimization

1. **Instanced Rendering**: Use `THREE.Points` with `BufferGeometry` for 25,000+ particles
2. **Shader-based Animation**: Move animations to GPU (vertex shader)
3. **Memoization**: Use `useMemo()` for expensive geometry/material creation
4. **Additive Blending**: Reduce overdraw with `THREE.AdditiveBlending`
5. **Depth Write**: Disable with `depthWrite: false` for transparent particles
6. **Raycasting Optimization**: Use sparse raycasting (not every frame)

---

## Styling Guidelines

### Cyberpunk Design System

#### Color Palette (defined in `tailwind.config.ts`)

```typescript
colors: {
  'space-void': '#0a0a14',      // Background (deep void)
  'space-cyan': '#00ffff',       // Primary accent
  'space-magenta': '#ff00ff',    // Secondary accent
  'space-amber': '#ffaa00',      // Tertiary accent
  'space-deep': '#1a1a2e',       // Surface dark
}
```

#### Typography

```typescript
fontFamily: {
  display: ['JetBrains Mono', 'monospace'],
  mono: ['Space Mono', 'monospace'],
  data: ['IBM Plex Mono', 'monospace'],
}
```

#### Custom Animations (defined in `tailwind.config.ts`)

```typescript
animation: {
  scanline: 'scanline 8s linear infinite',
  flicker: 'flicker 0.15s infinite',
  typewriter: 'typewriter 2s steps(40) infinite',
}

keyframes: {
  scanline: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(100%)' },
  },
  flicker: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.8' },
  },
  typewriter: {
    '0%': { width: '0' },
    '100%': { width: '100%' },
  },
}
```

### CSS Architecture

#### Global Styles (`client/global.css`)

478 lines of:
- CSS variables for theming (HSL color system)
- Reset styles
- Custom keyframe animations
- Utility classes
- Component-specific styles

#### Component Styling Pattern

```typescript
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-space-void border border-space-cyan">
  {/* Content */}
</div>

// Combine with cn() for conditional styles
<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === 'primary' && "primary-class",
  className  // User override
)}>
  {/* Content */}
</div>
```

#### Cyberpunk UI Patterns

1. **Glowing Text**:
   ```typescript
   className="text-space-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]"
   ```

2. **Liquid Glass Border**:
   ```typescript
   className="border border-space-cyan/30 bg-space-void/80 backdrop-blur-md"
   ```

3. **Scanline Effect**:
   ```typescript
   <div className="absolute inset-0 animate-scanline pointer-events-none">
     <div className="h-1 bg-gradient-to-b from-transparent via-space-cyan/20 to-transparent" />
   </div>
   ```

4. **Trapezoid Clipping**:
   ```typescript
   style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
   ```

---

## Data Management

### Repository Data Structure

Located in `public/repositories.json`:

```typescript
interface Repository {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  createdAt: string;  // ISO date
  updatedAt: string;  // ISO date
  topics: string[];
}
```

### Data Loading Pattern

```typescript
// client/hooks/useRepositoryData.ts
export function useRepositoryData() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/repositories.json')
      .then(res => res.json())
      .then(data => {
        setRepositories(data);
        setLoading(false);
      });
  }, []);

  return { repositories, loading };
}
```

### Particle Generation Algorithm

From `client/lib/repositoryData.ts`:

```typescript
export function generateParticles(repositories: Repository[], count: number = 25000) {
  const particles = [];
  const baseCount = repositories.length;

  // Calculate replication factor
  const replicationFactor = Math.ceil(count / baseCount);

  for (const repo of repositories) {
    // Replicate based on stars (more stars = less replication)
    const starWeight = Math.log10(repo.stars + 1);
    const replicationsForThisRepo = Math.max(1, Math.floor(replicationFactor / starWeight));

    for (let i = 0; i < replicationsForThisRepo; i++) {
      particles.push({
        position: randomPosition(),  // Cylindrical distribution
        color: getColorFromLanguage(repo.language),
        activity: calculateActivity(repo),
        repositoryId: repo.name,
      });
    }
  }

  return particles.slice(0, count);  // Ensure exact count
}
```

### State Management

1. **Component State**: `useState` for local UI state
2. **Data Fetching**: Custom hooks (`useRepositoryData`)
3. **Global State**: React Context (if needed)
4. **Server State**: TanStack Query (for API calls)

Example with TanStack Query:

```typescript
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => fetch('/repositories.json').then(res => res.json()),
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## Testing & Quality

### Unit Testing (Vitest)

Test files: `*.spec.ts` or `*.test.ts`

Example (`client/lib/utils.spec.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('base', 'extra');
    expect(result).toBe('base extra');
  });

  it('handles conditional classes', () => {
    const result = cn('base', { 'active': true, 'disabled': false });
    expect(result).toBe('base active');
  });
});
```

Run tests:
```bash
pnpm test        # Run all tests
pnpm test:watch  # Watch mode (if configured)
```

### Type Checking

```bash
pnpm typecheck   # Run TypeScript compiler (tsc --noEmit)
```

### Code Formatting

```bash
pnpm format.fix  # Auto-format with Prettier
```

Prettier config (`.prettierrc`):
```json
{
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all"
}
```

### Pre-Commit Checklist

Before committing:
1. Run `pnpm format.fix`
2. Run `pnpm typecheck`
3. Run `pnpm test`
4. Verify in browser (`pnpm dev`)

---

## Deployment

### Local Production Build

```bash
# Build client + server
pnpm build

# Start production server
pnpm start
# Server: http://localhost:3000
```

### Netlify Deployment

Configuration (`netlify.toml`):

```toml
[build]
  command = "npm run build:client"
  functions = "netlify/functions"
  publish = "dist/spa"

[functions]
  external_node_modules = ["express"]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true
```

**Steps**:
1. Connect repository to Netlify
2. Build command: `npm run build:client`
3. Publish directory: `dist/spa`
4. Environment variables: Set in Netlify UI
5. Deploy

**Note**: Netlify uses serverless functions (`netlify/functions/api.ts`) to wrap the Express server.

### Environment Variables

Development (`.env`):
```bash
VITE_PUBLIC_BUILDER_KEY=your_builder_key
PING_MESSAGE=ping pong
```

Production:
- Set in Netlify UI (Settings → Environment variables)
- Prefix with `VITE_PUBLIC_` for client-side access

### Binary Deployment

Self-contained executables for Linux, macOS, Windows (mentioned in AGENTS.md):
- Uses a binary packaging tool (e.g., pkg, nexe)
- Bundles Node.js runtime + application
- Single executable file

---

## Common Tasks

### Add a New 3D Component

1. Create component file:
   ```bash
   touch client/components/MyEffect.tsx
   ```

2. Implement component:
   ```typescript
   import { useRef } from 'react';
   import { useFrame } from '@react-three/fiber';

   export default function MyEffect() {
     const ref = useRef();

     useFrame((state, delta) => {
       // Animation logic
     });

     return <mesh ref={ref}>{/* ... */}</mesh>;
   }
   ```

3. Add to Scene3D:
   ```typescript
   import MyEffect from '@/components/MyEffect';

   // In Scene3D component:
   <Canvas>
     <LightCone />
     <MyEffect />  {/* Add here */}
   </Canvas>
   ```

### Add a New UI Component

1. Create component file:
   ```bash
   touch client/components/MyPanel.tsx
   ```

2. Implement with Tailwind:
   ```typescript
   import { cn } from '@/lib/utils';

   interface MyPanelProps {
     title: string;
     className?: string;
   }

   export default function MyPanel({ title, className }: MyPanelProps) {
     return (
       <div className={cn("p-4 border border-space-cyan", className)}>
         <h2 className="text-space-cyan font-display">{title}</h2>
       </div>
     );
   }
   ```

3. Add to HUD or page component

### Add a New API Endpoint

**Important**: Only add if server-side logic is required.

1. Create route handler:
   ```bash
   touch server/routes/my-route.ts
   ```

2. Implement handler:
   ```typescript
   import { RequestHandler } from 'express';
   import { MyResponse } from '@shared/api';

   export const handleMyRoute: RequestHandler = (req, res) => {
     const data: MyResponse = { /* ... */ };
     res.json(data);
   };
   ```

3. Register in `server/index.ts`:
   ```typescript
   import { handleMyRoute } from './routes/my-route';

   app.get('/api/my-endpoint', handleMyRoute);
   ```

4. Use in client:
   ```typescript
   const response = await fetch('/api/my-endpoint');
   const data: MyResponse = await response.json();
   ```

### Add a New Page Route

1. Create page component:
   ```bash
   touch client/pages/MyPage.tsx
   ```

2. Implement page:
   ```typescript
   export default function MyPage() {
     return <div>My Page Content</div>;
   }
   ```

3. Add route in `client/App.tsx`:
   ```typescript
   import MyPage from '@/pages/MyPage';

   <Routes>
     <Route path="/" element={<Index />} />
     <Route path="/my-page" element={<MyPage />} />
     <Route path="*" element={<NotFound />} />
   </Routes>
   ```

### Add Custom Shaders

1. Create shader files:
   ```bash
   touch client/shaders/myVertex.glsl
   touch client/shaders/myFragment.glsl
   ```

2. Write GLSL code:
   ```glsl
   // myVertex.glsl
   varying vec3 vPosition;

   void main() {
     vPosition = position;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
   ```

3. Import and use:
   ```typescript
   import myVertexShader from '@/shaders/myVertex.glsl?raw';
   import myFragmentShader from '@/shaders/myFragment.glsl?raw';

   <shaderMaterial
     vertexShader={myVertexShader}
     fragmentShader={myFragmentShader}
   />
   ```

### Modify Repository Data

1. Edit `public/repositories.json`
2. Follow the `Repository` interface structure
3. No rebuild needed (static file)
4. Refresh browser to see changes

### Update Theme Colors

1. Edit `tailwind.config.ts`:
   ```typescript
   colors: {
     'my-custom-color': '#hexcode',
   }
   ```

2. Use in components:
   ```typescript
   className="text-my-custom-color"
   ```

3. Update CSS variables in `client/global.css` if needed

---

## Troubleshooting

### Common Issues

#### 3D Scene Not Rendering

**Symptoms**: Black screen, no WebGL content

**Solutions**:
1. Check browser console for WebGL errors
2. Verify GPU acceleration is enabled
3. Check if `<Canvas>` component is mounted
4. Ensure camera position is not inside geometry
5. Verify lighting is present

```typescript
// Debug: Add ambient light
<ambientLight intensity={1.0} />
```

#### Particles Not Visible

**Symptoms**: Scene renders but no particles

**Solutions**:
1. Check particle positions are within camera view
2. Verify `gl_PointSize` in vertex shader is not too small
3. Check material transparency/blending settings
4. Ensure particle count > 0

```typescript
// Debug: Log particle count
console.log('Particle count:', geometry.attributes.position.count);
```

#### Performance Issues

**Symptoms**: Low FPS, lag, stuttering

**Solutions**:
1. Reduce particle count (default: 25,000)
2. Optimize shader code (avoid expensive operations)
3. Use `useMemo` for geometry/materials
4. Disable post-processing effects
5. Lower camera `far` plane distance

```typescript
// Reduce particles
const PARTICLE_COUNT = 10000;  // Instead of 25000
```

#### TypeScript Errors

**Symptoms**: Red squiggles, compilation errors

**Solutions**:
1. Run `pnpm typecheck` to see all errors
2. Check import paths (use `@/` and `@shared/`)
3. Verify type definitions exist
4. Remember: strict mode is disabled (some errors are warnings)

#### Hot Reload Not Working

**Symptoms**: Changes don't reflect in browser

**Solutions**:
1. Check Vite dev server is running (`pnpm dev`)
2. Verify file is in watched directories (`client/`, `server/`, `shared/`)
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
4. Restart dev server

#### Build Failures

**Symptoms**: `pnpm build` fails

**Solutions**:
1. Clear `dist/` directory: `rm -rf dist`
2. Clear `node_modules/`: `rm -rf node_modules && pnpm install`
3. Check for TypeScript errors: `pnpm typecheck`
4. Verify all imports are correct
5. Check Vite config files

### Debugging Tips

1. **3D Debugging**:
   ```typescript
   // Use React Three Fiber helpers
   import { Stats, OrbitControls, Grid } from '@react-three/drei';

   <Canvas>
     <Stats />  {/* FPS counter */}
     <Grid />   {/* Visual grid */}
   </Canvas>
   ```

2. **State Debugging**:
   ```typescript
   // Log state changes
   useEffect(() => {
     console.log('State changed:', state);
   }, [state]);
   ```

3. **Network Debugging**:
   ```typescript
   // Check API responses
   fetch('/api/endpoint')
     .then(res => {
       console.log('Response:', res);
       return res.json();
     })
     .then(data => console.log('Data:', data));
   ```

4. **Shader Debugging**:
   ```glsl
   // Output debug values as colors
   gl_FragColor = vec4(vPosition, 1.0);  // Visualize positions
   ```

---

## Additional Resources

### Key Files to Review

- `AGENTS.md`: Project documentation (Fusion Starter template info)
- `package.json`: Dependencies and scripts
- `client/App.tsx`: Routing and app structure
- `client/components/Scene3D.tsx`: 3D scene orchestration
- `client/components/LightCone.tsx`: Particle system implementation
- `tailwind.config.ts`: Theme configuration
- `vite.config.ts`: Build configuration

### External Documentation

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Three.js](https://threejs.org/docs/)
- [React Three Drei](https://github.com/pmndrs/drei)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Vite](https://vitejs.dev/)

### Contributing

When making changes:
1. Follow existing code patterns
2. Maintain cyberpunk aesthetic
3. Test in browser before committing
4. Format code with Prettier
5. Update this file if adding major features

---

## Changelog

### 2025-11-23 - Initial Creation
- Created comprehensive CLAUDE.md
- Documented architecture, patterns, and workflows
- Added 3D rendering system documentation
- Included troubleshooting guide

---

**End of CLAUDE.md**
