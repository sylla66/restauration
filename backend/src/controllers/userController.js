const prisma = require("../config/prisma");

async function list(req, res, next) {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function toggleActive(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
    });

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, toggleActive };
