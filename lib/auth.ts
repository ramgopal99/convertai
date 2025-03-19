import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session } = useSession()
  
  return {
    isAdmin: session?.user?.role === "admin",
    isUser: session?.user?.role === "user",
    role: session?.user?.role,
  }
}