import { Keypair, PublicKey, type Connection } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import * as bs58 from "bs58"
import { encrypt, decrypt } from "./encryption"

export async function generateCustodialWallet() {
  // Generate a new random keypair
  const keypair = Keypair.generate()

  // Get public and private keys
  const publicKey = keypair.publicKey.toString()
  const privateKey = bs58.default.encode(keypair.secretKey)

  // Encrypt the private key
  const { iv, encryptedData } = encrypt(privateKey)

  // Return the info needed to store in the database
  return {
    publicKey,
    encryptedPrivateKey: `${iv}:${encryptedData}`,
  }
}

export function decryptPrivateKey(encryptedKey: string): Keypair {
  const [iv, encryptedData] = encryptedKey.split(":")
  const privateKeyString = decrypt(iv, encryptedData)
  const secretKey = bs58.default.decode(privateKeyString)
  return Keypair.fromSecretKey(secretKey)
}

export async function getTokenAccounts(connection: Connection, walletAddress: string) {
  const walletPublicKey = new PublicKey(walletAddress)

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { programId: TOKEN_PROGRAM_ID })

  return tokenAccounts.value.map((item) => {
    const accountData = item.account.data.parsed.info
    const mintAddress = accountData.mint
    const tokenBalance = accountData.tokenAmount.uiAmount

    return {
      mint: mintAddress,
      balance: tokenBalance,
      decimals: accountData.tokenAmount.decimals,
    }
  })
}
