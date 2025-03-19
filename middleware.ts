import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin") && (!token || token.role !== "admin")) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // User routes protection
    if (path.startsWith("/dashboard") && (!token || token.role !== "user")) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export function middleware() {
    const response = NextResponse.next();

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
}