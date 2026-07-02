import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/login",
  "/invite",
  "/api/auth/callback",
];

// Role-based route access:
// ADMIN: full access
// BOARD: full access
// MANAGER: no admin pages
// MEMBER: dashboard + tasks + team + settings only
const ADMIN_ONLY_ROUTES = [
  "/admin",
];

// ── Simple in-memory rate limiter for login brute-force protection ──────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export async function proxy(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Rate limit login POST requests
  if (pathname === "/login" && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again in 15 minutes." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) =>
              request.cookies.set(
                name,
                value
              )
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) =>
              response.cookies.set(
                name,
                value,
                options
              )
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic =
    PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

  // Redirect unauthenticated users to login
  if (!user && !isPublic) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Redirect authenticated users away from login
  if (user && pathname === "/login") {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;

    // Admin-only routes
    if (ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
