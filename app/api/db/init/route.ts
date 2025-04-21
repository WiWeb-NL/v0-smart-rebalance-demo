import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // First, test the connection with a simple query
    console.log("Testing database connection...")
    const testResult = await sql`SELECT 1 as test`
    console.log("Connection test result:", testResult)

    // Create tables one by one with detailed error handling
    try {
      console.log("Creating users table...")
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          wallet_address TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `
      console.log("Users table created successfully")
    } catch (error) {
      console.error("Error creating users table:", error)
      throw new Error(`Failed to create users table: ${error.message}`)
    }

    try {
      console.log("Creating custodial_wallets table...")
      await sql`
        CREATE TABLE IF NOT EXISTS custodial_wallets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          public_key TEXT NOT NULL,
          encrypted_private_key TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `
      console.log("Custodial wallets table created successfully")
    } catch (error) {
      console.error("Error creating custodial_wallets table:", error)
      throw new Error(`Failed to create custodial_wallets table: ${error.message}`)
    }

    try {
      console.log("Creating bots table...")
      await sql`
        CREATE TABLE IF NOT EXISTS bots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          name TEXT NOT NULL,
          token_pairs JSONB NOT NULL,
          target_allocations JSONB NOT NULL,
          frequency TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `
      console.log("Bots table created successfully")
    } catch (error) {
      console.error("Error creating bots table:", error)
      throw new Error(`Failed to create bots table: ${error.message}`)
    }

    try {
      console.log("Creating transactions table...")
      await sql`
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bot_id UUID NOT NULL,
          tx_signature TEXT NOT NULL,
          status TEXT NOT NULL,
          details JSONB,
          executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY (bot_id) REFERENCES bots(id)
        )
      `
      console.log("Transactions table created successfully")
    } catch (error) {
      console.error("Error creating transactions table:", error)
      throw new Error(`Failed to create transactions table: ${error.message}`)
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
