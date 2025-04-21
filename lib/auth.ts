import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"
import db from "./db"
import { users } from "./schema"
import { eq } from "drizzle-orm"

// Secret key for JWT signing - should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "MY_JWT_SECRET_CHANGE_ME"
const secretKey = new TextEncoder().encode(JWT_SECRET)

export async function signUserToken(walletAddress: string) {
  // Find or create user
  let user = await db.query.users.findFirst({
    where: eq(users.walletAddress, walletAddress),
  })

  if (!user) {
    // Create new user
    const [newUser] = await db.insert(users).values({ walletAddress }).returning()
    user = newUser
  }

  // Create JWT token
  const token = await new SignJWT({
    id: user.id,
    walletAddress: user.walletAddress,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey)

  // Set as cookie
  cookies().set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })

  return user
}

export async function verifyAuth() {
  const token = cookies().get("authToken")?.value

  if (!token) {
    redirect("/login")
  }

  try {
    const verified = await jwtVerify(token, secretKey)
    return verified.payload as {
      id: string
      walletAddress: string
    }
  } catch (err) {
    // Invalid token
    cookies().delete("authToken")
    redirect("/login")
  }
}

export async function signOut() {
  cookies().delete("authToken")
}
