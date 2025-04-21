import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core"

// Define the schema for the users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Define the schema for the custodial_wallets table
export const custodialWallets = pgTable("custodial_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  publicKey: text("public_key").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Define the schema for the bots table
export const bots = pgTable("bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  tokenPairs: jsonb("token_pairs").notNull(),
  targetAllocations: jsonb("target_allocations").notNull(),
  frequency: text("frequency").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Define the schema for the transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id")
    .references(() => bots.id)
    .notNull(),
  txSignature: text("tx_signature").notNull(),
  status: text("status").notNull(),
  details: jsonb("details"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
})
