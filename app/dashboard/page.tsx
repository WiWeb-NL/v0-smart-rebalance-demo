import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, DollarSign, ArrowUpDown } from "lucide-react"
import { verifyAuth } from "@/lib/auth"
import db from "@/lib/db"
import { bots, transactions } from "@/lib/schema"
import { eq, count } from "drizzle-orm"

export default async function DashboardPage() {
  const auth = await verifyAuth()

  // Get user's bots
  const userBots = await db.query.bots.findMany({
    where: eq(bots.userId, auth.id),
  })

  // Count total transactions
  const [transactionStats] = await db
    .select({ count: count() })
    .from(transactions)
    .innerJoin(bots, eq(transactions.botId, bots.id))
    .where(eq(bots.userId, auth.id))

  const totalTransactions = transactionStats?.count || 0

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Smart Rebalance dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBots.length}</div>
            <p className="text-xs text-muted-foreground">Automated rebalancing bots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Rebalancing swaps executed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Connect wallet to view</p>
          </CardContent>
        </Card>
      </div>

      {userBots.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h2 className="text-lg font-medium">No Rebalancing Bots Created Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first rebalancing bot</p>
          <div className="mt-4">
            <a
              href="/dashboard/bots/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Create Bot
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Your Rebalancing Bots</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {userBots.map((bot) => (
              <Card key={bot.id}>
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
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-500">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
