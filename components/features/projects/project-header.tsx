"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Share, MoreHorizontal, Edit, FileText, Download, ChevronRight, Home, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProjectActions, useTechnicalSections } from "@/lib/stores"
import { overallCompletion } from "@/lib/technical-sheet-data"
import { toast } from "sonner"
import { routes, ProjectTab } from "@/lib/routes"

interface Project {
  id: string
  name: string
  client: string
  status: string
  type: string
  progress: number
  updatedAt: string
}

interface ProjectHeaderProps {
  project: Project
}

const statusColors = {
  "En Desarrollo": "bg-secondary text-secondary-foreground",
  Propuesta: "bg-muted text-muted-foreground",
  Completado: "bg-primary text-primary-foreground",
  Pausado: "bg-destructive text-destructive-foreground",
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter()
  const { deleteProject } = useProjectActions()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ✅ Calculate progress dynamically from technical sections (same as body)
  const sections = useTechnicalSections(project.id)
  const completion = overallCompletion(sections)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      toast.success("Proyecto eliminado", {
        description: `"${project.name}" ha sido eliminado correctamente`
      })
      router.push(routes.dashboard)
    } catch (error) {
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el proyecto. Intenta nuevamente."
      })
      setIsDeleting(false)
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-4 text-sm" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">
            {project.name}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" title="Volver al Dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge className={statusColors[project.status as keyof typeof statusColors]}>{project.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Client: {project.client}</span>
                <span>•</span>
                <span>Tipe: {project.type}</span>
                <span>•</span>
                <span>Progress: {completion.percentage}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(routes.project.proposals(project.id))}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Proposal
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => {
                    e.preventDefault()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete <strong>{project.name}</strong>. This action cannot be undone.
              All technical data, proposals and associated files will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
