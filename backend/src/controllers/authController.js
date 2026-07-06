const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { generateToken } = require("../middleware/auth");

async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }].filter((c) => c.email || c.phone),
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Cet email ou téléphone est déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "CLIENT" },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, phone, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }].filter((c) => c.email || c.phone),
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Compte désactivé" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = generateToken(user);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function registerStaff(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!["LIVREUR", "GERANT"].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide. Utilisez LIVREUR ou GERANT" });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }].filter((c) => c.email || c.phone),
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Cet email ou téléphone est déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, registerStaff };
