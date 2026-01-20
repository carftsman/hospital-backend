const role = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied. Role missing",
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions",
      });
    }

    next();
  };
};

export { role };
