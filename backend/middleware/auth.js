// Role-based authorization middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).render("error", {
      err: { statusCode: 403, message: "Insufficient permissions" },
    });
  };
};

module.exports = { requireAuth, requireRole };
