import csurf from "csurf";

const COOKIE_DOMAIN = String(process.env.AUTH_COOKIE_DOMAIN || "").trim() || undefined;
// Render.com sets RENDER=true automatically — use it as a production signal even if NODE_ENV is missing
const IS_PRODUCTION =
  process.env.NODE_ENV === "production" ||
  String(process.env.RENDER || "").toLowerCase() === "true" ||
  String(process.env.AUTH_COOKIE_SECURE || "").trim().toLowerCase() === "true";
const SHOULD_USE_SECURE_COOKIES = IS_PRODUCTION;
const COOKIE_SAME_SITE = SHOULD_USE_SECURE_COOKIES ? "none" : "lax";

const buildCrossSiteCookieOptions = (maxAgeMs, httpOnly) => ({
  httpOnly,
  secure: SHOULD_USE_SECURE_COOKIES,
  sameSite: COOKIE_SAME_SITE,
  path: "/",
  maxAge: maxAgeMs,
  domain: COOKIE_DOMAIN,
});

export const csrfProtection = csurf({
  cookie: {
    key: "_csrf_secret",
    ...buildCrossSiteCookieOptions(24 * 60 * 60 * 1000, true),
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
  value: (req) =>
    String(
      req.headers["x-csrf-token"] ||
        req.headers["x-xsrf-token"] ||
        req.body?._csrf ||
        req.query?._csrf ||
        ""
    ),
});

export const issueCsrfToken = (req, res) => {
  const token = req.csrfToken();

  res.cookie(
    "XSRF-TOKEN",
    token,
    buildCrossSiteCookieOptions(60 * 60 * 1000, false)
  );

  return token;
};