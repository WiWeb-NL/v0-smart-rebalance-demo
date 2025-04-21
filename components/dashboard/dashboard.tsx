"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Wallet, History, LogOut, PieChart } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
// Import the server action at the top of the file
import { signOutAction } from "@/app/actions"

export function Dashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="border-r">
          <SidebarHeader className="flex items-center justify-center p-4">
            <Link href="/dashboard" className="text-lg font-bold">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                SmartRebalance
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <PieChart className="w-4 h-4 mr-2" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/wallet"}>
                  <Link href="/dashboard/wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    <span>Wallet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/bots" || pathname?.startsWith("/dashboard/bots/")}
                >
                  <Link href="/dashboard/bots">
                    <Bot className="w-4 h-4 mr-2" />
                    <span>Rebalance Bots</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/history"}>
                  <Link href="/dashboard/history">
                    <History className="w-4 h-4 mr-2" />
                    <span>Transaction History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <form action={signOutAction}>
              <Button variant="outline" className="w-full" type="submit">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </Button>
            </form>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </SidebarProvider>
  )
}
