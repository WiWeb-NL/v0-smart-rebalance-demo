"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const frequencyOptions = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
]

// Popular SPL tokens on Solana
const popularTokens = [
  { mint: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana" },
  { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin" },
  { mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", symbol: "USDT", name: "Tether USD" },
  { mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", symbol: "mSOL", name: "Marinade staked SOL" },
  { mint: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", symbol: "stSOL", name: "Lido Staked SOL" },
  { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk" },
]

// Form schema for validation
const formSchema = z.object({
  name: z.string().min(3, { message: "Bot name must be at least 3 characters." }),
  frequency: z.string({
    required_error: "Please select a rebalancing frequency.",
  }),
  tokens: z
    .array(
      z.object({
        mint: z.string(),
        symbol: z.string(),
        name: z.string(),
        allocation: z.number().min(1).max(100),
      }),
    )
    .min(2, { message: "You need at least 2 tokens for rebalancing." }),
})

export default function CreateBotPage() {
  const router = useRouter()
  const [selectedToken, setSelectedToken] = useState("")
  const [allocation, setAllocation] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      frequency: "daily",
      tokens: [],
    },
  })

  const tokens = form.watch("tokens")
  const remainingAllocation = 100 - tokens.reduce((sum, token) => sum + token.allocation, 0)

  // Add token to the form
  function addToken() {
    if (!selectedToken || !allocation) return

    const tokenObj = popularTokens.find((t) => t.mint === selectedToken)
    if (!tokenObj) return

    const allocationNum = Number(allocation)
    if (isNaN(allocationNum) || allocationNum <= 0 || allocationNum > remainingAllocation) {
      toast({
        title: "Invalid allocation",
        description: `Allocation must be between 1 and ${remainingAllocation}%.`,
        variant: "destructive",
      })
      return
    }

    // Check if token already exists
    if (tokens.some((t) => t.mint === selectedToken)) {
      toast({
        title: "Token already added",
        description: "This token is already in your portfolio.",
        variant: "destructive",
      })
      return
    }

    // Add token
    form.setValue("tokens", [
      ...tokens,
      {
        ...tokenObj,
        allocation: allocationNum,
      },
    ])

    // Reset inputs
    setSelectedToken("")
    setAllocation("")
  }

  // Remove token from the form
  function removeToken(mint: string) {
    form.setValue(
      "tokens",
      tokens.filter((t) => t.mint !== mint),
    )
  }

  // Submit form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate that allocations sum to 100%
    const totalAllocation = values.tokens.reduce((sum, token) => sum + token.allocation, 0)
    if (totalAllocation !== 100) {
      toast({
        title: "Invalid allocations",
        description: `Total allocation must be 100%. Current: ${totalAllocation}%`,
        variant: "destructive",
      })
      return
    }

    try {
      // Format data for API
      const formattedTokenPairs = {}
      const formattedAllocations = {}

      values.tokens.forEach((token) => {
        formattedTokenPairs[token.mint] = {
          symbol: token.symbol,
          name: token.name,
        }
        formattedAllocations[token.mint] = token.allocation
      })

      const response = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          frequency: values.frequency,
          tokenPairs: formattedTokenPairs,
          targetAllocations: formattedAllocations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create bot")
      }

      toast({
        title: "Bot created",
        description: "Your rebalancing bot has been created successfully.",
      })

      router.push("/dashboard/bots")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bot. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create Rebalancing Bot</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Bot Configuration</CardTitle>
              <CardDescription>Configure your automated portfolio rebalancing bot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Rebalancing Bot" {...field} />
                    </FormControl>
                    <FormDescription>Give your bot a descriptive name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rebalancing Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>How often should the bot rebalance your portfolio?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Allocation</CardTitle>
              <CardDescription>Select tokens and set target allocation percentages (must total 100%).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokens.length > 0 && (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                      <div className="col-span-5">Token</div>
                      <div className="col-span-5">Allocation</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    {tokens.map((token) => (
                      <div key={token.mint} className="grid grid-cols-12 gap-4 p-4 items-center">
                        <div className="col-span-5 flex items-center">
                          <div className="mr-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {token.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        <div className="col-span-5">
                          <div className="font-medium">{token.allocation}%</div>
                        </div>
                        <div className="col-span-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeToken(token.mint)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-muted/50">
                      <div className="flex justify-between text-sm">
                        <span>Remaining allocation:</span>
                        <span className={remainingAllocation === 0 ? "text-green-500" : ""}>
                          {remainingAllocation}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <Select onValueChange={setSelectedToken} value={selectedToken}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          {popularTokens.map((token) => (
                            <SelectItem
                              key={token.mint}
                              value={token.mint}
                              disabled={tokens.some((t) => t.mint === token.mint)}
                            >
                              {token.symbol} - {token.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-5">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Allocation %"
                          value={allocation}
                          onChange={(e) => setAllocation(e.target.value)}
                          min="1"
                          max={remainingAllocation.toString()}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        onClick={addToken}
                        disabled={!selectedToken || !allocation}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                  </div>

                  <FormMessage>{form.formState.errors.tokens?.message}</FormMessage>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Create Bot</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
