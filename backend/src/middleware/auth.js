const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, managedRestaurantId: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Utilisateur inactif ou introuvable" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, managedRestaurantId: true },
    });

    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}

function restrictToOwnRestaurant(req, res, next) {
  if (req.user.role === "GERANT") {
    const paramId = req.params.id || req.params.restaurantId || req.body?.restaurantId;
    if (paramId && paramId !== req.user.managedRestaurantId) {
      return res.status(403).json({ error: "Accès refusé : vous ne gérez pas ce restaurant" });
    }
    req.restaurantId = req.user.managedRestaurantId;
  }
  next();
}

function gerantFilter() {
  return (req, res, next) => {
    if (req.user.role === "GERANT") {
      if (!req.where) req.where = {};
      req.where.restaurantId = req.user.managedRestaurantId;
    }
    next();
  };
}

module.exports = { generateToken, authenticate, optionalAuth, authorize, restrictToOwnRestaurant, gerantFilter };
