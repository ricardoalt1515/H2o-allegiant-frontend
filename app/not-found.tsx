import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * 404 Not Found Page
 *
 * This page is shown when a user navigates to a route that doesn't exist.
 * Next.js will automatically use this component for any 404 errors.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">404</p>
            <CardTitle className="text-2xl">Página no encontrada</CardTitle>
            <CardDescription className="mt-2">
              La página que estás buscando no existe o ha sido movida.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver atrás
              </Link>
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              ¿Necesitas ayuda?{" "}
              <Link href="/dashboard" className="text-primary hover:underline">
                Contacta a soporte
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
