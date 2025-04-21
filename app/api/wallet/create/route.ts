import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import db from "@/lib/db"
import { custodialWallets } from "@/lib/schema"
import { generateCustodialWallet } from "@/lib/solana"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth()

    // Check if user already has a custodial wallet
    const existingWallet = await db.query.custodialWallets.findFirst({
      where: eq(custodialWallets.userId, auth.id),
    })

    if (existingWallet) {
      return NextResponse.json({ error: "User already has a custodial wallet" }, { status: 400 })
    }

    // Generate new custodial wallet
    const { publicKey, encryptedPrivateKey } = await generateCustodialWallet()

    // Save to database
    const [wallet] = await db
      .insert(custodialWallets)
      .values({
        userId: auth.id,
        publicKey,
        encryptedPrivateKey,
      })
      .returning()

    return NextResponse.json({
      success: true,
      publicKey: wallet.publicKey,
    })
  } catch (error) {
    console.error("Error creating wallet:", error)
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 })
  }
}
