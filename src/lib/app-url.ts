// Public origin used to build links in emails. Deliberately not taken from the request's
// Host header, which a client can spoof to make us email out links to their own domain.
export function getAppUrl() {
  const explicit = process.env.APP_URL ?? process.env.AUTH_URL;
  if (explicit) return explicit;

  // Set automatically on Vercel: the production domain for production deployments, and the
  // deployment's own URL for previews.
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";

  // Failing is better than emailing users links to localhost.
  throw new Error("APP_URL is not set; it's required to build links in emails.");
}
