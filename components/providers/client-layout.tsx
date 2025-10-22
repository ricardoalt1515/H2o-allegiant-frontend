"use client"

import { Suspense } from "react"
import { NavBar } from "@/components/shared/layout/navbar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/contexts"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <div className="aqua-page min-h-screen">
          <NavBar />
          <main className="mx-auto w-full max-w-[1600px] px-8 py-10 md:px-12 lg:px-16">
            <div className="flex flex-col gap-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </Suspense>
    </AuthProvider>
  )
}
