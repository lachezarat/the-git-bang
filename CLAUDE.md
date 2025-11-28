# CLAUDE.md - AI Assistant Guide for "The Git Bang"

> **Last Updated**: 2025-11-27
> **Purpose**: Quick reference for AI assistants working with this codebase

## Project Overview

**The Git Bang** is a cyberpunk-themed 3D visualization platform for exploring Git repositories. Renders 25,000+ particles in WebGL using custom GLSL shaders.

**Core Features**: 3D particle system • Interactive visualization • Cyberpunk HUD • Real-time search • GSAP animations • React + Express stack

**Type**: Full-stack TypeScript SPA based on "Fusion Starter" template, customized for 3D visualization.

---

## Technology Stack

**Frontend**: React 18.3 • TypeScript 5.9 • Vite 7.1 • React Router 6.30 • TailwindCSS 3.4

**3D Rendering**: Three.js 0.176 • React Three Fiber 8.18 • React Three Drei 9.122 • Custom GLSL shaders

**Backend**: Express 5.1 • CORS • serverless-http (Netlify)

**UI**: Radix UI primitives • Shadcn/ui (48+ components) • Lucide icons • Framer Motion • GSAP

**Data**: React Hook Form • Zod • TanStack Query • better-sqlite3 • PapaParse

**Dev Tools**: Vitest • Prettier • pnpm 10.14

---

## Architecture

### System Flow

**Frontend (Port 8080 dev)**:
- React Router SPA: `/` (main app), `*` (404)
- React Three Fiber Canvas: Scene3D orchestrates 3D rendering
  - LightCone: 25k particle system with custom shaders
  - Components: FunnelWireframe, LaserBeam, ParticleInteraction
  - Camera: PerspectiveCamera (fov: 75, z: 150) + OrbitControls
  - Lighting: Ambient + 3 colored point lights
- HUD: SearchBar, StatsPanel, TimelinePanel, ControlsPanel, YearMarker, TargetingReticle
- Effects: BootSequence, ScanlineOverlay, RepoCard, AmbientSound

**Backend (Express)**:
- API Routes: `/api/ping`, `/api/demo`, `/api/repo/:owner/:name`
- Serves SPA from `dist/spa/` in production

**Data Sources**:
- `/public/app_viz_data.json` - Compressed viz data (ids, dates, stars, languages)
- `/public/repositories_details.json` - Full details (descriptions, topics, metrics)
- `server/db/repositories.db` - SQLite database (read-only)

### Data Flow

1. **Load**: BootSequence → Fetch `app_viz_data.json` → Parse → Generate particles → Render
2. **Details**: Click particle → Raycasting → Fetch from `repositories_details.json` cache → Show RepoCard
3. **Search**: Input → Filter repos → Update suggestions → Highlight particles
4. **API**: `/api/repo/:owner/:name` → SQLite query (alternative to JSON)

---

## Directory Structure

```
the-git-bang/
├── client/                     # React SPA
│   ├── components/
│   │   ├── ui/                # 48 shadcn components
│   │   ├── Scene3D.tsx        # 3D orchestrator
│   │   ├── LightCone.tsx      # Particle system
│   │   ├── RepoCard.tsx       # Detail popup
│   │   ├── HUD.tsx            # UI overlay
│   │   └── [13 more UI/3D components]
│   ├── hooks/
│   │   ├── useRepositoryData.ts
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── repositoryData.ts  # Data loading
│   │   └── utils.ts           # cn() utility
│   ├── shaders/               # GLSL files
│   ├── pages/                 # Index, NotFound
│   ├── App.tsx
│   └── global.css             # 478 lines theming
│
├── server/                     # Express backend
│   ├── index.ts
│   ├── db/repositories.db
│   └── routes/                # API handlers
│
├── shared/api.ts              # Shared types
├── public/                    # Static data
├── netlify/functions/         # Serverless
└── [Config files]
```

---

## Development

### Setup

```bash
pnpm install
pnpm dev              # http://localhost:8080
```

### Scripts

```bash
pnpm dev              # Dev server (hot reload)
pnpm build            # Production build
pnpm build:client     # Build SPA → dist/spa/
pnpm build:server     # Build server → dist/server/
pnpm start            # Production server (port 3000)
pnpm test             # Run Vitest
pnpm format.fix       # Prettier
pnpm typecheck        # TypeScript check
```

---

## Key Conventions

### Code Style

- **Formatting**: Prettier, 2-space indent, trailing commas
- **TypeScript**: Strict mode disabled for flexibility
- **Naming**: PascalCase components, camelCase hooks (`useXxx`), match filenames

### Imports

```typescript
import { Component } from '@/components/Component';  // client/ alias
import { DemoResponse } from '@shared/api';          // shared/ alias
import { useState } from 'react';                    // absolute
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types
interface Props { }

// 3. Component
export default function Component({ }: Props) {
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

### API Endpoints

**IMPORTANT**: Only create when necessary (DB, secrets, server logic). Prefer static data.

```typescript
// server/routes/my-route.ts
export const handleMyRoute: RequestHandler = (req, res) => {
  res.json({ data });
};

// server/index.ts
app.get('/api/endpoint', handleMyRoute);
```

---

## Component Patterns

### 3D Components (React Three Fiber)

```typescript
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function My3D() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta;
  });

  return <mesh ref={ref} geometry={geometry} />;
}
```

**Key Points**: Use `useRef()` for Three objects, `useMemo()` for geometry/materials, `useFrame()` for animation (not `useEffect`).

### Shader Components

```typescript
const uniforms = useMemo(() => ({
  uTime: { value: 0 },
  uColor: { value: new THREE.Color('cyan') }
}), []);

useFrame((state) => {
  materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
});

return (
  <points>
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
    />
  </points>
);
```

### UI Components

```typescript
import { cn } from '@/lib/utils';

export default function Button({ variant, className }: Props) {
  return (
    <button className={cn(
      "px-4 py-2 rounded-md",
      variant === 'default' && "bg-space-cyan",
      className  // User override
    )}>
      {children}
    </button>
  );
}
```

---

## 3D Rendering

### Particle System

Uses **instanced rendering** for 25k particles:

```typescript
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

<points geometry={geometry}>
  <shaderMaterial
    transparent
    depthWrite={false}
    blending={THREE.AdditiveBlending}
  />
</points>
```

### Shaders

Located in `client/shaders/*.glsl`:

```glsl
// Vertex shader - pulsing animation
float pulse = sin(uTime * 2.0 + activity * 10.0) * 0.5 + 0.5;
gl_PointSize = (5.0 + pulse * 3.0) * (300.0 / -mvPosition.z);

// Fragment shader - circular glow
float dist = length(gl_PointCoord - vec2(0.5));
if (dist > 0.5) discard;
float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
```

### Performance

1. Instanced rendering with `THREE.Points`
2. GPU animations in vertex shaders
3. `useMemo()` for expensive objects
4. `THREE.AdditiveBlending` + `depthWrite: false`
5. Sparse raycasting (not per-frame)

---

## Styling

### Cyberpunk Theme

**Colors** (`tailwind.config.ts`):
```typescript
'space-void': '#0a0a14',      // Background
'space-cyan': '#00ffff',       // Primary
'space-magenta': '#ff00ff',    // Secondary
'space-amber': '#ffaa00',      // Tertiary
```

**Fonts**: JetBrains Mono (display), Space Mono (mono), IBM Plex Mono (data)

**Animations**: scanline, flicker, typewriter (see `tailwind.config.ts`)

### UI Patterns

```typescript
// Glowing text
className="text-space-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]"

// Glass border
className="border border-space-cyan/30 bg-space-void/80 backdrop-blur-md"

// Scanline effect
<div className="animate-scanline">
  <div className="h-1 bg-gradient-to-b via-space-cyan/20" />
</div>

// Trapezoid clipping
style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
```

---

## Data Management

### Repository Data Types

```typescript
// Compressed format (app_viz_data.json)
interface CompressedData {
  ids: string[];           // ["owner/repo", ...]
  dates: string[];         // ISO dates
  stars: number[];
  lang_ids: number[];      // Indexes into legend
  legend: Record<string, string>;
}

// Core data (repositoryData.ts)
interface Repository {
  id: string;              // "owner/name"
  name: string;
  owner: string;
  stars: number;
  createdAt: number;       // Unix timestamp
  primaryLanguage: string;
  color: number;           // Hex color
}

// Details (repositories_details.json)
interface RepositoryDetails {
  id: string;
  description: string;
  topics: string[];
  languages: string[];
  forks: number;
  commits: number;
  watchers: number;
  openPrs: number;
  contributors: number;
}
```

### Data Loading

**Two-tier loading**:

1. **Compressed data** (fast, for 3D): `loadRepositories()` → fetch `app_viz_data.json` → parse → cache in memory
2. **Details** (lazy): `fetchRepositoryDetails(id)` → fetch `repositories_details.json` once → cache in Map → O(1) lookup

**Module-level caching**:
```typescript
let cachedData: RepositoryDataset | null = null;
let cachedDetails: Map<string, RepositoryDetails> | null = null;

export async function loadRepositories() {
  if (cachedData) return cachedData;  // Return cached
  // ... fetch and cache
}
```

**SQLite API** (alternative):
```typescript
// GET /api/repo/:owner/:name
const stmt = db.prepare("SELECT * FROM repositories WHERE id = ?");
const result = stmt.get(`${owner}/${name}`);
```

### Data Sources

- `public/app_viz_data.json` - Compressed (ids, dates, stars, langs)
- `public/repositories_details.json` - Full details
- `server/db/repositories.db` - SQLite (read-only)
- **Update**: Modify data generation pipeline, not JSON directly

---

## Testing & Quality

```bash
pnpm test        # Vitest (*.spec.ts, *.test.ts)
pnpm typecheck   # TypeScript check
pnpm format.fix  # Prettier
```

**Pre-commit**: format.fix → typecheck → test → verify in browser

---

## Deployment

### Local Production

```bash
pnpm build
pnpm start  # Port 3000
```

### Netlify

**Config** (`netlify.toml`):
- Build: `npm run build:client`
- Publish: `dist/spa`
- Functions: `netlify/functions`
- Redirects: `/api/*` → `/.netlify/functions/api/:splat`

**Env vars**: Set in Netlify UI, prefix `VITE_PUBLIC_` for client access

---

## Quick Reference

### Add 3D Component

1. Create `client/components/MyEffect.tsx`
2. Implement with `useRef()`, `useFrame()`, `useMemo()`
3. Add to `Scene3D.tsx`: `<MyEffect />`

### Add UI Component

1. Create `client/components/MyPanel.tsx`
2. Use `cn()` for styling, support `className` prop
3. Add to HUD or page

### Add API Route

1. Create handler in `server/routes/`
2. Register in `server/index.ts`
3. Use in client with `fetch('/api/endpoint')`

### Add Shader

1. Create `client/shaders/myVertex.glsl`, `myFragment.glsl`
2. Import: `import shader from '@/shaders/myVertex.glsl?raw'`
3. Use: `<shaderMaterial vertexShader={shader} />`

### Update Theme

Edit `tailwind.config.ts` colors, use as `text-my-color`

---

## Troubleshooting

**3D not rendering**: Check console for WebGL errors, verify GPU acceleration, ensure camera not inside geometry, add `<ambientLight />`

**Particles invisible**: Check positions in camera view, verify `gl_PointSize` in shader, check blending settings

**Performance**: Reduce particle count, optimize shaders, use `useMemo()`, disable post-processing

**TypeScript errors**: Run `pnpm typecheck`, check import paths (`@/`, `@shared/`), strict mode is disabled

**Hot reload broken**: Restart dev server, hard refresh (Cmd+Shift+R), check file in watched dirs

**Build fails**: Clear `dist/` and `node_modules/`, run `pnpm typecheck`, verify imports

### Debug Tools

```typescript
// 3D: <Stats />, <Grid /> from drei
// State: useEffect(() => console.log(state), [state])
// Network: console.log in fetch().then()
// Shaders: gl_FragColor = vec4(vPosition, 1.0);
```

---

## Resources

**Key Files**: `package.json`, `client/App.tsx`, `client/components/Scene3D.tsx`, `tailwind.config.ts`

**Docs**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) • [Three.js](https://threejs.org/docs/) • [TailwindCSS](https://tailwindcss.com/docs) • [Radix UI](https://www.radix-ui.com/)

**Contributing**: Follow patterns, maintain cyberpunk aesthetic, test before commit, format with Prettier

---

**End of CLAUDE.md**
