import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import db from "@/lib/db"
import { bots } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth()

    // Get user's bots
    const userBots = await db.query.bots.findMany({
      where: eq(bots.userId, auth.id),
    })

    return NextResponse.json(userBots)
  } catch (error) {
    console.error("Error fetching bots:", error)
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth()

    // Get request body
    const body = await request.json()

    // Validate request
    const { name, frequency, tokenPairs, targetAllocations } = body

    if (!name || !frequency || !tokenPairs || !targetAllocations) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new bot
    const [bot] = await db
      .insert(bots)
      .values({
        userId: auth.id,
        name,
        frequency,
        tokenPairs,
        targetAllocations,
      })
      .returning()

    return NextResponse.json({
      success: true,
      bot,
    })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}
