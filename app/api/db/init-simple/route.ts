import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Test connection with a simple query
    const testResult = await sql`SELECT 1 as test`
    console.log("Connection test successful:", testResult)

    // Create a single table to test table creation
    const createUsersResult = await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `

    return NextResponse.json({
      success: true,
      message: "Test table created successfully",
      testResult,
      createUsersResult,
    })
  } catch (error) {
    console.error("Simple initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize test table",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
