export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login
     * - /api/auth (NextAuth routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icon*, /apple-icon* (static assets)
     * - /manifest.json, /robots.txt
     */
    "/((?!login|api/auth|_next|favicon\\.ico|icon|apple-icon|manifest\\.json|robots\\.txt).*)",
  ],
};
