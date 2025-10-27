# CLAUDE.md - Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js frontend.

## Frontend Architecture

**Tech Stack**: Next.js 15 (React 19), TypeScript, shadcn/ui (Radix UI), TailwindCSS 4, Zustand, React Hook Form + Zod

**Key Design**: App Router with Server Components, feature-based component structure, type-safe API integration

## Directory Structure

```
frontend/
├── app/                            # Next.js App Router (file-based routing)
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── login/page.tsx             # Authentication
│   ├── register/page.tsx
│   ├── dashboard/page.tsx         # Projects list
│   ├── project/[id]/page.tsx      # Project detail (tabs)
│   └── project/[id]/proposals/[proposalId]/page.tsx  # Proposal viewer
├── components/
│   ├── features/                   # Feature-specific components
│   │   ├── auth/                  # Login, register forms
│   │   ├── dashboard/             # Project cards, filters
│   │   ├── projects/              # Project CRUD
│   │   ├── proposals/             # Proposal viewer, charts
│   │   └── technical-data/        # Dynamic form builder
│   ├── shared/                     # Reusable components
│   │   ├── common/                # Layout, headers
│   │   └── ui/                    # Base UI components
│   ├── providers/                  # Context providers
│   └── ui/                         # shadcn/ui components
├── lib/                            # Utilities and business logic
│   ├── api/                        # API service classes
│   │   ├── client.ts              # Fetch wrapper with auth
│   │   ├── auth.ts                # AuthAPI
│   │   ├── projects.ts            # ProjectsAPI
│   │   ├── proposals.ts           # ProposalsAPI
│   │   └── project-data.ts        # ProjectDataAPI
│   ├── stores/                     # Zustand state management
│   │   ├── project-store.ts       # Project state
│   │   └── technical-data-store.ts # Form state
│   ├── types/                      # TypeScript interfaces
│   ├── hooks/                      # Custom React hooks
│   ├── contexts/                   # React contexts
│   ├── utils/                      # Helper functions
│   └── validation/                 # Zod schemas
├── public/                         # Static assets
├── styles/                         # Global CSS
├── next.config.mjs                 # Next.js configuration
├── tailwind.config.ts              # TailwindCSS + shadcn
├── tsconfig.json                   # TypeScript strict mode
├── biome.json                      # Code formatting
└── package.json                    # Dependencies
```

## Development Commands

### Development Server

```bash
# Start dev server with Turbopack (hot reload)
npm run dev

# Dev server will run at http://localhost:3000
```

### Build & Production

```bash
# Type-check and build for production
npm run build

# Start production server
npm start

# Preview production build locally
npm run build && npm start
```

### Code Quality

```bash
# Run Biome lint and format checks
npm run check

# Fix lint issues automatically
npm run lint:fix

# Format code
npm run format

# CI mode (strict, no auto-fix)
npm run check:ci
```

### Type Checking

```bash
# Check TypeScript types (without build)
npx tsc --noEmit

# Watch mode for type checking
npx tsc --noEmit --watch
```

## Core Architecture Patterns

### 1. App Router with Server Components

```typescript
// app/dashboard/page.tsx
// Server Component by default
export default async function DashboardPage() {
  // Can fetch data directly
  return <DashboardClient />
}

// components/features/dashboard/DashboardClient.tsx
"use client"  // Client Component for interactivity

export function DashboardClient() {
  const [projects, setProjects] = useState([])
  // Interactive features
}
```

### 2. API Integration Pattern

```typescript
// lib/api/projects.ts
import { apiClient } from './client'

export class ProjectsAPI {
  static async list(params: ListParams): Promise<PaginatedResponse<ProjectSummary>> {
    return apiClient.get('/projects', { params })
  }

  static async create(data: ProjectCreate): Promise<ProjectDetail> {
    return apiClient.post('/projects', data)
  }
}

// In component
"use client"
import { ProjectsAPI } from '@/lib/api/projects'

const projects = await ProjectsAPI.list({ page: 1, page_size: 10 })
```

### 3. Zustand State Management

```typescript
// lib/stores/project-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProjectStore {
  projects: ProjectSummary[]
  currentProject: ProjectDetail | null

  loadProjects: () => Promise<void>
  createProject: (data: ProjectCreate) => Promise<ProjectDetail>
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,

      loadProjects: async () => {
        const data = await ProjectsAPI.list()
        set({ projects: data.items })
      },

      createProject: async (data) => {
        const project = await ProjectsAPI.create(data)
        set({ projects: [...get().projects, project] })
        return project
      }
    }),
    {
      name: 'project-store',  // localStorage key
      partialize: (state) => ({ projects: state.projects })  // Only persist projects
    }
  )
)

// In component
const { projects, loadProjects } = useProjectStore()
```

### 4. Form Validation with Zod + React Hook Form

```typescript
// lib/validation/project-schema.ts
import { z } from 'zod'

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  client: z.string().min(1, "Client is required"),
  sector: z.enum(['municipal', 'industrial', 'mining']),
  budget: z.number().positive().optional()
})

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>

// In component
"use client"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm<ProjectCreateInput>({
  resolver: zodResolver(projectCreateSchema)
})

const onSubmit = async (data: ProjectCreateInput) => {
  await ProjectsAPI.create(data)
}
```

### 5. shadcn/ui Component Usage

```typescript
// components/features/projects/CreateProjectDialog.tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>
          <Button type="submit">Create Project</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Working with the API

### Authentication Flow

```typescript
// lib/api/auth.ts
export class AuthAPI {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/jwt/login', credentials)

    // Store token
    apiClient.setAuthToken(response.access_token)
    localStorage.setItem('auth_token', response.access_token)

    return response
  }

  static async logout() {
    apiClient.clearAuthToken()
    localStorage.removeItem('auth_token')
  }
}

// In component
const handleLogin = async (credentials) => {
  try {
    const response = await AuthAPI.login(credentials)
    router.push('/dashboard')
  } catch (error) {
    setError('Invalid credentials')
  }
}
```

### Handling API Errors

```typescript
// lib/api/client.ts
class APIClient {
  async request<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...options.headers
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new APIError(error.detail || 'Request failed', response.status)
      }

      return response.json()
    } catch (error) {
      if (error instanceof APIError) throw error
      throw new APIError('Network error', 500)
    }
  }
}

// In component
try {
  await ProjectsAPI.create(data)
} catch (error) {
  if (error instanceof APIError) {
    toast.error(error.message)
  }
}
```

### Polling for Async Jobs (Proposal Generation)

```typescript
// lib/api/proposals.ts
export class ProposalsAPI {
  static async pollJobStatus(jobId: string): Promise<ProposalJobStatus> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const status = await apiClient.get(`/ai/proposals/jobs/${jobId}`)

          if (status.status === 'completed') {
            clearInterval(interval)
            resolve(status)
          } else if (status.status === 'failed') {
            clearInterval(interval)
            reject(new Error(status.error))
          }
          // Continue polling if status is 'processing'
        } catch (error) {
          clearInterval(interval)
          reject(error)
        }
      }, 2000)  // Poll every 2 seconds
    })
  }
}

// In component
const handleGenerate = async () => {
  const { job_id } = await ProposalsAPI.generate(projectId)
  setIsGenerating(true)

  try {
    const result = await ProposalsAPI.pollJobStatus(job_id)
    toast.success('Proposal generated!')
    router.push(`/project/${projectId}/proposals/${result.proposal_id}`)
  } catch (error) {
    toast.error('Generation failed')
  } finally {
    setIsGenerating(false)
  }
}
```

## Component Patterns

### Feature Component Structure

```
components/features/projects/
├── ProjectCard.tsx          # Reusable project card
├── ProjectList.tsx          # List with pagination
├── ProjectDetail.tsx        # Tabbed detail view
├── CreateProjectDialog.tsx  # Creation form
├── EditProjectDialog.tsx    # Edit form
└── DeleteProjectDialog.tsx  # Confirmation dialog
```

### Compound Component Pattern

```typescript
// components/features/projects/ProjectDetail.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ProjectDetail({ project }: Props) {
  return (
    <div className="container mx-auto py-8">
      <ProjectHeader project={project} />

      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Technical Data</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <TechnicalDataEditor projectId={project.id} />
        </TabsContent>

        <TabsContent value="proposals">
          <ProposalsList projectId={project.id} />
        </TabsContent>

        <TabsContent value="files">
          <FilesList projectId={project.id} />
        </TabsContent>

        <TabsContent value="history">
          <Timeline projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Custom Hooks Pattern

```typescript
// lib/hooks/useProject.ts
import { useEffect, useState } from 'react'
import { ProjectsAPI } from '@/lib/api/projects'

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProject = async () => {
      try {
        setLoading(true)
        const data = await ProjectsAPI.get(projectId)
        if (!cancelled) {
          setProject(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      cancelled = true
    }
  }, [projectId])

  return { project, loading, error }
}

// Usage in component
const { project, loading, error } = useProject(params.id)
```

## Styling with TailwindCSS

### Utility-First Approach

```typescript
// Good: Utility classes
<div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>

// Use shadcn/ui variants
import { buttonVariants } from '@/components/ui/button'

<Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
  Dashboard
</Link>
```

### Responsive Design

```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {projects.map(project => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
```

### Custom CSS (Avoid unless necessary)

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
}
```

## Adding New Features

### 1. Create New Page

```typescript
// app/new-feature/page.tsx
import { NewFeatureClient } from '@/components/features/new-feature/NewFeatureClient'

export default function NewFeaturePage() {
  return <NewFeatureClient />
}
```

### 2. Create Feature Components

```typescript
// components/features/new-feature/NewFeatureClient.tsx
"use client"

export function NewFeatureClient() {
  // Component logic
  return (
    <div className="container mx-auto py-8">
      {/* UI */}
    </div>
  )
}
```

### 3. Add API Service

```typescript
// lib/api/new-feature.ts
import { apiClient } from './client'

export class NewFeatureAPI {
  static async list(): Promise<Item[]> {
    return apiClient.get('/new-feature')
  }

  static async create(data: CreateData): Promise<Item> {
    return apiClient.post('/new-feature', data)
  }
}
```

### 4. Add Types

```typescript
// lib/types/new-feature.ts
export interface Item {
  id: string
  name: string
  created_at: string
}

export interface CreateData {
  name: string
}
```

### 5. Add Zustand Store (if needed)

```typescript
// lib/stores/new-feature-store.ts
import { create } from 'zustand'
import { NewFeatureAPI } from '@/lib/api/new-feature'

interface NewFeatureStore {
  items: Item[]
  loadItems: () => Promise<void>
}

export const useNewFeatureStore = create<NewFeatureStore>((set) => ({
  items: [],

  loadItems: async () => {
    const items = await NewFeatureAPI.list()
    set({ items })
  }
}))
```

## Adding shadcn/ui Components

```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# Components are added to components/ui/
```

## TypeScript Best Practices

### Type Safety

```typescript
// Define types for all API responses
export interface ProjectDetail {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'  // Use literal types
  created_at: string
}

// Use type inference where possible
const projects = await ProjectsAPI.list()  // TypeScript infers type

// Avoid 'any' - use 'unknown' if type is truly unknown
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

### Generic Components

```typescript
// lib/types/common.ts
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// lib/api/client.ts
class APIClient {
  async get<T>(url: string): Promise<T> {
    // Implementation
  }
}

// Usage
const projects = await apiClient.get<PaginatedResponse<ProjectSummary>>('/projects')
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const ProposalViewer = dynamic(
  () => import('@/components/features/proposals/ProposalViewer'),
  { loading: () => <LoadingSpinner /> }
)
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react'

const sortedProjects = useMemo(
  () => projects.sort((a, b) => a.created_at.localeCompare(b.created_at)),
  [projects]
)

const handleDelete = useCallback(
  (id: string) => {
    ProjectsAPI.delete(id)
  },
  []
)
```

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority  // For above-the-fold images
/>
```

## Environment Variables

### Configuration

```bash
# .env.local (not committed)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_URL=https://api.h2oallegiant.com
```

### Usage

```typescript
// Can only access NEXT_PUBLIC_* variables in client components
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Server components can access all env vars
const secret = process.env.SECRET_KEY  // Only on server
```

## Common Issues & Solutions

### "Module not found"
```bash
# Clear .next cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Type Errors
```bash
# Check TypeScript without build
npx tsc --noEmit

# Common fix: restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Hydration Errors
```typescript
// Ensure server and client render the same initially
// Avoid using Date.now() or random values in SSR

// Use useEffect for client-only code
useEffect(() => {
  // Client-only logic
}, [])
```

### State Not Persisting
```typescript
// Check Zustand persist config
persist(
  (set) => ({...}),
  {
    name: 'store-name',  // localStorage key
    partialize: (state) => ({ field: state.field })  // What to persist
  }
)
```

## Deployment

### Vercel/Amplify Deployment

```bash
# Ensure build succeeds locally
npm run build

# Check for type errors
npm run check:ci

# Environment variables set in Vercel/Amplify dashboard:
# NEXT_PUBLIC_API_URL=https://api.h2oallegiant.com
```

### Build Optimization

```javascript
// next.config.mjs
export default {
  output: 'standalone',  // Optimize for deployment
  compress: true,
  swcMinify: true,

  images: {
    domains: ['h2o-allegiant-production.s3.amazonaws.com']
  }
}
```

## Testing (Future)

### Recommended Setup

```bash
# Install Jest + Testing Library
npm install -D jest @testing-library/react @testing-library/jest-dom

# Install Playwright for E2E
npm install -D @playwright/test
```

### Example Test

```typescript
// __tests__/ProjectCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '@/components/features/projects/ProjectCard'

describe('ProjectCard', () => {
  it('renders project name', () => {
    const project = { id: '1', name: 'Test Project', ... }
    render(<ProjectCard project={project} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })
})
```
