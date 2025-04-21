import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Create the neon client
const sql = neon(process.env.DATABASE_URL!)

// Create the drizzle client with the neon driver
const db = drizzle(sql, { schema })

export default db
