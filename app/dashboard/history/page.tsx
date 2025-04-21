import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyAuth } from "@/lib/auth"
import db from "@/lib/db"
import { transactions } from "@/lib/schema"
import { desc, eq, and } from "drizzle-orm"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function HistoryPage() {
  const auth = await verifyAuth()

  // Get user's transactions
  const txHistory = await db.query.transactions.findMany({
    orderBy: [desc(transactions.executedAt)],
    with: {
      bot: true,
    },
    limit: 50,
    where: and(eq(transactions.bot.userId, auth.id)),
  })

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Transaction History</h1>

      {txHistory.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No transactions yet</CardTitle>
            <CardDescription>Transactions will appear here once your bots start rebalancing.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Make sure you have created at least one rebalancing bot and funded your custodial wallet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Bot</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Transaction</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {txHistory.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-sm">{format(new Date(tx.executedAt), "MMM d, yyyy HH:mm")}</td>
                  <td className="p-3 text-sm">
                    <Link href={`/dashboard/bots/${tx.botId}`} className="text-blue-500 hover:underline">
                      {tx.bot.name}
                    </Link>
                  </td>
                  <td className="p-3 text-sm font-mono">
                    <Link
                      href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                      target="_blank"
                      className="hover:underline"
                    >
                      {tx.txSignature.slice(0, 8)}...{tx.txSignature.slice(-8)}
                    </Link>
                  </td>
                  <td className="p-3 text-sm">
                    <Badge
                      variant={
                        tx.status === "success" ? "default" : tx.status === "pending" ? "outline" : "destructive"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    {tx.details
                      ? JSON.stringify(tx.details).length > 50
                        ? JSON.stringify(tx.details).substring(0, 50) + "..."
                        : JSON.stringify(tx.details)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
