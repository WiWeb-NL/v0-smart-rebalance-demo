"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, RefreshCw, ExternalLink } from "lucide-react"

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com")

interface TokenBalance {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  uiBalance: string
}

export default function WalletPage() {
  const { publicKey, connected } = useWallet()
  const [loading, setLoading] = useState(true)
  const [solBalance, setSolBalance] = useState(0)
  const [hasCustodialWallet, setHasCustodialWallet] = useState(false)
  const [custodialPublicKey, setCustodialPublicKey] = useState<string | null>(null)
  const [custodialSolBalance, setCustodialSolBalance] = useState(0)
  const [custodialTokens, setCustodialTokens] = useState<TokenBalance[]>([])

  // Fetch data on load and when wallet connects
  useEffect(() => {
    if (!connected || !publicKey) return

    async function fetchData() {
      setLoading(true)
      try {
        // Get user's SOL balance
        const balance = await connection.getBalance(publicKey)
        setSolBalance(balance / LAMPORTS_PER_SOL)

        // Check if user has a custodial wallet
        const response = await fetch(`/api/wallet?address=${publicKey.toString()}`)
        const data = await response.json()

        if (data.custodialWallet) {
          setHasCustodialWallet(true)
          setCustodialPublicKey(data.custodialWallet.publicKey)

          // Get custodial wallet balance
          const custPubKey = new PublicKey(data.custodialWallet.publicKey)
          const custBalance = await connection.getBalance(custPubKey)
          setCustodialSolBalance(custBalance / LAMPORTS_PER_SOL)

          // Get token balances (we'd normally use real token metadata here)
          if (data.tokenBalances) {
            setCustodialTokens(data.tokenBalances)
          }
        } else {
          setHasCustodialWallet(false)
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [publicKey, connected])

  // Create custodial wallet
  async function createCustodialWallet() {
    if (!connected || !publicKey) return

    try {
      setLoading(true)
      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userWallet: publicKey.toString() }),
      })

      if (!response.ok) {
        throw new Error("Failed to create custodial wallet")
      }

      const data = await response.json()
      setHasCustodialWallet(true)
      setCustodialPublicKey(data.publicKey)
      setCustodialSolBalance(0)
    } catch (error) {
      console.error("Error creating custodial wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fund custodial wallet
  async function fundCustodialWallet() {
    // This would normally open a dialog to send SOL to the custodial wallet
    // For simplicity, we're just showing a link to the wallet on explorer
    if (custodialPublicKey) {
      window.open(`https://explorer.solana.com/address/${custodialPublicKey}?cluster=devnet`, "_blank")
    }
  }

  if (!connected) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Wallet</h1>
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertTitle>Not connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your balances and manage your custodial wallet.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <Button variant="outline" onClick={() => window.location.reload()} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Wallet</CardTitle>
            <CardDescription>Your connected Solana wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address:</span>
                <span className="text-sm font-mono">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SOL Balance:</span>
                {loading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="text-sm font-medium">{solBalance.toFixed(4)} SOL</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  window.open(`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=devnet`, "_blank")
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custodial Wallet</CardTitle>
            <CardDescription>Used by rebalancing bots to execute trades</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !hasCustodialWallet ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don't have a custodial wallet yet. Create one to use with rebalancing bots.
                </p>
                <Button className="w-full" onClick={createCustodialWallet}>
                  Create Custodial Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <span className="text-sm font-mono">
                    {custodialPublicKey?.slice(0, 4)}...{custodialPublicKey?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SOL Balance:</span>
                  <span className="text-sm font-medium">{custodialSolBalance.toFixed(4)} SOL</span>
                </div>

                {custodialSolBalance < 0.01 && (
                  <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 mt-4">
                    <AlertTitle>Low balance</AlertTitle>
                    <AlertDescription>Your custodial wallet needs SOL to pay for transaction fees.</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button className="w-full" onClick={fundCustodialWallet} disabled={!custodialPublicKey}>
                    Fund Wallet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(`https://explorer.solana.com/address/${custodialPublicKey}?cluster=devnet`, "_blank")
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </Button>
                </div>

                {custodialTokens.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Token Balances</h3>
                    <div className="space-y-2">
                      {custodialTokens.map((token) => (
                        <div key={token.mint} className="flex items-center justify-between">
                          <span className="text-sm">{token.symbol}</span>
                          <span className="text-sm font-medium">{token.uiBalance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
