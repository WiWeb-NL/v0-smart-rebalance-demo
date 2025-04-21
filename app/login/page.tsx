"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const { connected, publicKey, signMessage } = useWallet()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Initialize database when the page loads
  useEffect(() => {
    initializeDatabase()
  }, [])

  // Add this function to the LoginPage component
  async function testSimpleInitialization() {
    try {
      console.log("Testing simple database initialization...")
      const response = await fetch("/api/db/init-simple")
      const data = await response.json()

      console.log("Simple initialization result:", data)

      if (!response.ok) {
        throw new Error(data.details || "Failed to initialize test table")
      }

      return true
    } catch (error) {
      console.error("Simple initialization error:", error)
      return false
    }
  }

  // Update the initializeDatabase function to try the simple initialization first
  async function initializeDatabase() {
    try {
      setIsInitializing(true)
      setInitError(null)

      // First try a simple initialization to test the connection
      const simpleInitSuccess = await testSimpleInitialization()

      if (!simpleInitSuccess) {
        throw new Error("Failed to initialize test table. Database connection may be invalid.")
      }

      console.log("Starting full database initialization...")
      const response = await fetch("/api/db/init")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || "Failed to initialize database")
      }

      setIsInitialized(true)
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Database initialization error:", error)
      setInitError(error.message || "Unknown error occurred")
      toast({
        title: "Database Error",
        description: `Failed to initialize the database: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  // Handle authentication when wallet connects
  useEffect(() => {
    if (connected && publicKey && signMessage && isInitialized) {
      handleAuthentication()
    }
  }, [connected, publicKey, signMessage, isInitialized])

  async function handleAuthentication() {
    if (isAuthenticating || !isInitialized) return

    try {
      setIsAuthenticating(true)
      // Create the message to sign
      const message = new TextEncoder().encode("Sign this message to authenticate with Smart Rebalance")

      // Request signature from the wallet
      const signature = await signMessage(message)

      // Send the signature to the server for verification
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: publicKey.toString(),
          signature: Buffer.from(signature).toString("base64"),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Authentication successful",
          description: "You are now logged in",
        })
        router.push("/dashboard")
      } else if (data.code === "DB_NOT_INITIALIZED") {
        // If the database isn't initialized, try to initialize it again
        toast({
          title: "Database not ready",
          description: "Initializing database. Please try again in a moment.",
        })
        await initializeDatabase()
      } else {
        toast({
          title: "Authentication failed",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Authentication error:", error)
      toast({
        title: "Authentication failed",
        description: "Could not sign the message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to SmartRebalance</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Connect your wallet to access your dashboard</p>
        </div>

        {isInitializing ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p>Initializing database...</p>
          </div>
        ) : initError ? (
          <div className="flex flex-col items-center space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Database Initialization Failed</AlertTitle>
              <AlertDescription className="mt-2">{initError}</AlertDescription>
            </Alert>
            <Button onClick={initializeDatabase} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Initialization
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600 !rounded-md !w-full !justify-center" />

            {connected && (
              <Button
                onClick={handleAuthentication}
                disabled={isAuthenticating || !isInitialized}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Authenticate"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
