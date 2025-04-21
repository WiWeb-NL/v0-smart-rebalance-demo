import crypto from "crypto"

// The encryption key should be stored in an environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "32_CHARACTER_ENCRYPTION_KEY_CHANGE_ME"

// Use AES-256-CBC for encryption
export function encrypt(text: string): { iv: string; encryptedData: string } {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  }
}

export function decrypt(iv: string, encryptedData: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, "hex"))
  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"))
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
