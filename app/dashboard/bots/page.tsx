import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyAuth } from "@/lib/auth"
import db from "@/lib/db"
import { bots } from "@/lib/schema"
import { eq } from "drizzle-orm"

export default async function BotsPage() {
  const auth = await verifyAuth()

  // Get user's bots
  const userBots = await db.query.bots.findMany({
    where: eq(bots.userId, auth.id),
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Rebalancing Bots</h1>
        <Button asChild>
          <Link href="/dashboard/bots/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Bot
          </Link>
        </Button>
      </div>

      {userBots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h2 className="text-lg font-medium">No Rebalancing Bots Created Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first bot to start automated portfolio rebalancing
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard/bots/new">
                <Plus className="mr-2 h-4 w-4" /> Create Bot
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {userBots.map((bot) => (
            <Link href={`/dashboard/bots/${bot.id}`} key={bot.id}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{bot.name}</CardTitle>
                  <CardDescription>Rebalances {bot.frequency}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tokens:</span>
                      <span>
                        {Array.isArray(bot.tokenPairs)
                          ? bot.tokenPairs.map((t: any) => t.symbol).join(", ")
                          : Object.keys(bot.tokenPairs as object).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target Allocations:</span>
                      <span>
                        {Array.isArray(bot.targetAllocations)
                          ? bot.targetAllocations.map((t: any) => `${t.percentage}%`).join(", ")
                          : Object.entries(bot.targetAllocations as object)
                              .map(([k, v]) => `${k}: ${v}%`)
                              .join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-500">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
