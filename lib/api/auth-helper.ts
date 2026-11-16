import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { cookies } from "next/headers"

export interface SessionUser {
  id: string
  email: string
  isDemo: boolean
}

export async function getAuthUser(): Promise<SessionUser | null> {
  const isConfigured = isSupabaseConfigured()
  const cookieStore = await cookies()

  if (isConfigured) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return {
          id: user.id,
          email: user.email || "",
          isDemo: false,
        }
      }
    } catch (e) {
      console.warn("Failed to get Supabase session user:", e)
    }
  }

  // Fallback to demo user if cookie or dev mode
  const demoCookie = cookieStore.get("fintwin_demo_session")
  if (demoCookie || !isConfigured) {
    return {
      id: "demo-user-fintwin-uuid",
      email: "ayush@fintwin.com",
      isDemo: true,
    }
  }

  return null
}
