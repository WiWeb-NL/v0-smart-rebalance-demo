import { Connection, PublicKey } from "@solana/web3.js"
import db from "../lib/db"
import { bots, custodialWallets, transactions } from "../lib/schema"
import { decryptPrivateKey, getTokenAccounts } from "../lib/solana"
import { eq } from "drizzle-orm"

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com")

// Rebalance a single bot
async function rebalanceBot(botId: string) {
  console.log(`Rebalancing bot ${botId}...`)

  try {
    // Get bot config
    const bot = await db.query.bots.findFirst({
      where: eq(bots.id, botId),
      with: {
        user: true,
      },
    })

    if (!bot) {
      throw new Error("Bot not found")
    }

    // Get custodial wallet
    const wallet = await db.query.custodialWallets.findFirst({
      where: eq(custodialWallets.userId, bot.userId),
    })

    if (!wallet) {
      throw new Error("Custodial wallet not found")
    }

    // Get token balances
    const walletPublicKey = new PublicKey(wallet.publicKey)
    const tokenAccounts = await getTokenAccounts(connection, wallet.publicKey)

    // Get target allocations
    const targetAllocations = bot.targetAllocations as Record<string, number>

    // Calculate current allocations and total value (simplified)
    // In a real app, we would fetch token prices from Jupiter or another price oracle
    const tokensToRebalance = []

    // For each token pair, check if rebalancing is needed
    Object.entries(targetAllocations).forEach(([tokenMint, targetPercentage]) => {
      const tokenAccount = tokenAccounts.find((ta) => ta.mint === tokenMint)

      // If we don't have this token yet but it's in our target, we need to buy it
      if (!tokenAccount && targetPercentage > 0) {
        tokensToRebalance.push({
          mint: tokenMint,
          currentAllocation: 0,
          targetAllocation: targetPercentage,
          action: "buy",
        })
      }

      // If we have too much of a token, sell some
      // If we have too little, buy more
      // This is a simplified calculation - in reality we'd need precise dollar values
      if (tokenAccount) {
        const currentAllocation = 50 // Placeholder - would calculate based on value
        const drift = Math.abs(currentAllocation - targetPercentage)

        if (drift > 5) {
          // Only rebalance if drift is significant (e.g., > 5%)
          tokensToRebalance.push({
            mint: tokenMint,
            currentAllocation,
            targetAllocation: targetPercentage,
            action: currentAllocation > targetPercentage ? "sell" : "buy",
          })
        }
      }
    })

    if (tokensToRebalance.length === 0) {
      console.log("No rebalancing needed")
      return
    }

    // For demo purposes, just log what would happen
    console.log("Tokens to rebalance:", tokensToRebalance)

    // In a real implementation, we would:
    // 1. Decrypt the private key
    // 2. Get swap quotes from Jupiter
    // 3. Execute the swaps
    // 4. Log the transaction

    const keypair = decryptPrivateKey(wallet.encryptedPrivateKey)

    // For each token that needs rebalancing, execute a swap
    for (const token of tokensToRebalance) {
      // In a real app, we would execute the actual swap here
      // For demo, we'll just create a fake transaction record

      await db.insert(transactions).values({
        botId: bot.id,
        txSignature: `mock_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        status: "success",
        details: {
          action: token.action,
          tokenMint: token.mint,
          fromAllocation: token.currentAllocation,
          toAllocation: token.targetAllocation,
        },
      })
    }

    console.log(`Rebalancing complete for bot ${botId}`)
  } catch (error) {
    console.error(`Error rebalancing bot ${botId}:`, error)

    // Log the error
    await db.insert(transactions).values({
      botId,
      txSignature: `error_${Date.now()}`,
      status: "error",
      details: {
        error: error.message,
      },
    })
  }
}

// Find and rebalance all bots that need to be rebalanced
async function rebalanceAllBots() {
  console.log("Starting rebalance job...")

  try {
    const now = new Date()

    // Find hourly bots
    if (now.getMinutes() < 10) {
      // Run at the beginning of each hour
      const hourlyBots = await db.query.bots.findMany({
        where: eq(bots.frequency, "hourly"),
      })

      for (const bot of hourlyBots) {
        await rebalanceBot(bot.id)
      }
    }

    // Find daily bots (run at midnight)
    if (now.getHours() === 0 && now.getMinutes() < 10) {
      const dailyBots = await db.query.bots.findMany({
        where: eq(bots.frequency, "daily"),
      })

      for (const bot of dailyBots) {
        await rebalanceBot(bot.id)
      }
    }

    // Find weekly bots (run on Sunday at midnight)
    if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() < 10) {
      const weeklyBots = await db.query.bots.findMany({
        where: eq(bots.frequency, "weekly"),
      })

      for (const bot of weeklyBots) {
        await rebalanceBot(bot.id)
      }
    }

    console.log("Rebalance job completed")
  } catch (error) {
    console.error("Error in rebalance job:", error)
  }
}

// Execute the job if this script is run directly
if (require.main === module) {
  rebalanceAllBots()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal error:", err)
      process.exit(1)
    })
}
