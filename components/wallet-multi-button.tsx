"use client"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton as SolanaWalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function WalletMultiButton() {
  const { connected } = useWallet()
  const router = useRouter()

  // If connected, show the dashboard button instead
  if (connected) {
    return (
      <Button
        onClick={() => router.push("/login")}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        Login
      </Button>
    )
  }

  // Otherwise show the connect wallet button
  return (
    <SolanaWalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600 !rounded-md" />
  )
}
