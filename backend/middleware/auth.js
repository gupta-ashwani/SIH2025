// Role-based authorization middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  // Check if it's an API request (for JSON responses)
  const isApiRequest =
    req.originalUrl.startsWith("/api/") ||
    req.path.startsWith("/api/") ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"]?.includes("application/json");

  if (isApiRequest) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // For web pages, redirect to login
  res.redirect("/login");
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      // Check if it's an API request
      const isApiRequest =
        req.originalUrl.startsWith("/api/") ||
        req.path.startsWith("/api/") ||
        req.headers.accept?.includes("application/json") ||
        req.headers["content-type"]?.includes("application/json");

      if (isApiRequest) {
        return res.status(401).json({ error: "Authentication required" });
      }
      return res.redirect("/login");
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check if it's an API request
    const isApiRequest =
      req.originalUrl.startsWith("/api/") ||
      req.path.startsWith("/api/") ||
      req.headers.accept?.includes("application/json") ||
      req.headers["content-type"]?.includes("application/json");

    if (isApiRequest) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    res.status(403).render("error", {
      err: { statusCode: 403, message: "Insufficient permissions" },
    });
  };
};

module.exports = { requireAuth, requireRole };
