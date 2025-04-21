import { type NextRequest, NextResponse } from "next/server"
import { signUserToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicKey, signature } = body

    if (!publicKey || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      // Sign in the user
      const user = await signUserToken(publicKey)
      return NextResponse.json({ success: true, user })
    } catch (dbError) {
      console.error("Database error during authentication:", dbError)

      // Check if this is a "relation does not exist" error
      const errorMessage = dbError.message || String(dbError)
      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        return NextResponse.json(
          {
            error: "Database not initialized. Please try again after initialization.",
            code: "DB_NOT_INITIALIZED",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ error: "Database error. Please try again later.", code: "DB_ERROR" }, { status: 500 })
    }
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
