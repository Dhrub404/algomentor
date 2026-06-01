const jwt = require("jsonwebtoken");

const protectAdmin = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token using the admin secret
      const adminSecret = process.env.ADMIN_JWT_SECRET || "adminsecretkey";
      const decoded = jwt.verify(token, adminSecret);

      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Forbidden, not an admin" });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      console.error("Admin JWT verification error:", error.message);
      return res.status(401).json({ message: "Not authorized, admin token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no admin token" });
  }
};

module.exports = protectAdmin;
