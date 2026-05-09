import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(
  async (auth, request) => {
    const { userId } = await auth()
    const isHandshake = request.nextUrl.searchParams.has('__clerk_status')

    // Protect dashboard routes, but skip during Clerk's internal handshake
    if (isProtectedRoute(request) && !isHandshake) {
      await auth.protect()
    }

    // Redirect signed-in users away from auth pages and home page after handshake completes
    if (userId && !isHandshake && ['/sign-in', '/sign-up', '/'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
)

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
