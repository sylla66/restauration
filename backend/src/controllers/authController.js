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

    const managedRestaurant = user.managedRestaurantId ? await prisma.restaurant.findUnique({ where: { id: user.managedRestaurantId }, select: { id: true, name: true } }) : null;

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, managedRestaurant: managedRestaurant || undefined },
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
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true, managedRestaurantId: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const managedRestaurant = user.managedRestaurantId ? await prisma.restaurant.findUnique({ where: { id: user.managedRestaurantId }, select: { id: true, name: true } }) : null;

    res.json({ user: { ...user, managedRestaurant: managedRestaurant || undefined } });
  } catch (err) {
    next(err);
  }
}

async function registerStaff(req, res, next) {
  try {
    const { name, email, phone, password, role, restaurantId } = req.body;

    if (!["LIVREUR", "GERANT", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide. Utilisez LIVREUR, GERANT ou ADMIN" });
    }

    if (role === "GERANT" && !restaurantId) {
      return res.status(400).json({ error: "Un restaurant est requis pour le rôle GERANT" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { phone },
      create: {
        name,
        email,
        phone,
        passwordHash,
        role,
        ...(role === "GERANT" ? { managedRestaurantId: restaurantId } : {}),
      },
      update: {
        name,
        email,
        passwordHash,
        role,
        ...(role === "GERANT" ? { managedRestaurantId: restaurantId } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, managedRestaurantId: true },
    });

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const data = {};

    if (name) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone) data.phone = phone;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    if (newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(400).json({ error: "Mot de passe actuel incorrect" });
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (phone && phone !== user.phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return res.status(409).json({ error: "Ce téléphone est déjà utilisé" });
    }
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, registerStaff, updateProfile };
