import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/menuPlanning(.*)", "/recipe(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { method, url } = request;
  const pathname = new URL(url).pathname;

  // Allow GET requests to /api/calendar, /api/recipes, and /api/combos and subroutes without auth
  if (
    method === "GET" &&
    (/^\/api\/calendar(\/.*)?$/.test(pathname) ||
      /^\/api\/recipes(\/.*)?$/.test(pathname) ||
      /^\/api\/combos(\/.*)?$/.test(pathname))
  ) {
    return;
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
