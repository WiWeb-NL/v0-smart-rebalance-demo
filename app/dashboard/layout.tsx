import type React from "react"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard/dashboard"
import { verifyAuth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const auth = await verifyAuth()

  if (!auth) {
    redirect("/")
  }

  return <Dashboard>{children}</Dashboard>
}
