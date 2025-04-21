import Link from "next/link"
import { ArrowRight, DollarSign, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@/components/wallet-multi-button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-8 h-16 flex items-center border-b">
        <div className="flex w-full justify-between">
          <Link href="/" className="flex items-center font-bold text-xl">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              SmartRebalance
            </span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/about">About</Link>
            <WalletMultiButton />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-purple-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Automated Portfolio Rebalancing for Solana
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Set your ideal portfolio allocation and let our bots handle the rest. No more manual swaps or timing
                  the market.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
              <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-slate-800 justify-between">
                <div>
                  <Zap className="h-12 w-12 text-purple-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Automated Rebalancing</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Set your target allocations once and our bots will automatically adjust your portfolio to maintain
                    your strategy.
                  </p>
                </div>
              </div>
              <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-slate-800 justify-between">
                <div>
                  <Shield className="h-12 w-12 text-purple-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Secure and Non-custodial</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your funds remain in your controlled wallet at all times. We never have access to your main wallet.
                  </p>
                </div>
              </div>
              <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-slate-800 justify-between">
                <div>
                  <DollarSign className="h-12 w-12 text-purple-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Efficient Token Swaps</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Powered by Jupiter, our solution finds the most efficient token swaps on Solana to minimize fees and
                    slippage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2023 SmartRebalance. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
