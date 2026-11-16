import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase credentials are placeholders, let user navigate freely in preview/demo
  if (!url || !key || url.includes("placeholder") || key.includes("placeholder")) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Do not run Supabase auth code for static assets or public landing
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/digital-twin") ||
    request.nextUrl.pathname.startsWith("/simulator") ||
    request.nextUrl.pathname.startsWith("/risk-portfolio") ||
    request.nextUrl.pathname.startsWith("/connect") ||
    request.nextUrl.pathname.startsWith("/settings")

  if (isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && !request.cookies.get("fintwin_demo_session")) {
      // Allow unauthenticated demo or redirect to login
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
