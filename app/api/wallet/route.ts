import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import db from "@/lib/db"
import { custodialWallets } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 })
    }

    // Get user's custodial wallet
    const wallet = await db.query.custodialWallets.findFirst({
      where: eq(custodialWallets.userId, auth.id),
    })

    // Mock token balances for demo
    const tokenBalances = wallet
      ? [
          {
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            symbol: "USDC",
            name: "USD Coin",
            balance: 100 * 10 ** 6,
            decimals: 6,
            uiBalance: "100.00",
          },
          {
            mint: "So11111111111111111111111111111111111111112",
            symbol: "SOL",
            name: "Solana",
            balance: 1.5 * 10 ** 9,
            decimals: 9,
            uiBalance: "1.5",
          },
        ]
      : []

    return NextResponse.json({
      custodialWallet: wallet,
      tokenBalances,
    })
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
  }
}
