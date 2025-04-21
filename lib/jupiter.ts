// Jupiter API endpoints
const API_QUOTE_URL = "https://quote-api.jup.ag/v6/quote"
const API_SWAP_URL = "https://quote-api.jup.ag/v6/swap"

export async function getQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps = 50,
}: {
  inputMint: string
  outputMint: string
  amount: number
  slippageBps?: number
}) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
  })

  const response = await fetch(`${API_QUOTE_URL}?${params.toString()}`)
  return await response.json()
}

export async function getSwapTransaction({
  quoteResponse,
  userPublicKey,
}: {
  quoteResponse: any
  userPublicKey: string
}) {
  const response = await fetch(API_SWAP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
    }),
  })

  return await response.json()
}
