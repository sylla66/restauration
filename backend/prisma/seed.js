const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.user.updateMany({ where: { managedRestaurantId: { not: null } }, data: { managedRestaurantId: null } });
  for (const c of ["complaint", "review", "payment", "delivery", "orderItem", "order", "menuItem", "category", "restaurant", "user"]) {
    await prisma[c].deleteMany();
  }

  const hash = await bcrypt.hash("admin123", 10);
  const clientHash = await bcrypt.hash("client123", 10);
  const livreurHash = await bcrypt.hash("livreur123", 10);
  const gerantHash = await bcrypt.hash("gerant123", 10);

  const admin = await prisma.user.create({
    data: { name: "Admin Principal", phone: "7700000001", email: "admin@dakargourmet.sn", passwordHash: hash, role: "ADMIN" },
  });
  console.log(`  ✅ ADMIN: 77 000 00 01 / admin123`);

  const client = await prisma.user.create({
    data: { name: "Mamadou Diop", phone: "7700000002", email: "client@test.sn", passwordHash: clientHash, role: "CLIENT" },
  });
  console.log(`  ✅ CLIENT: 77 000 00 02 / client123`);

  const livreur = await prisma.user.create({
    data: { name: "Pape Ndiaye", phone: "7700000003", email: "livreur@test.sn", passwordHash: livreurHash, role: "LIVREUR" },
  });
  console.log(`  ✅ LIVREUR: 77 000 00 03 / livreur123`);

  const resto1 = await prisma.restaurant.create({
    data: {
      name: "Le Dakar Gourmet", address: "127 Rue Moussé Diop, Dakar", phone: "+221338891234", email: "contact@dakargourmet.sn", logo: "https://placehold.co/200x200/e67e22/white?text=DG", deliveryRadius: 15, deliveryZones: ["Médina", "Plateau", "Gueule Tapée", "Fann", "Point E"], ownerId: admin.id,
    },
  });

  const resto2 = await prisma.restaurant.create({
    data: {
      name: "Chez Mama Africa", address: "45 Rue Sandinier, Dakar", phone: "+221338895678", email: "info@mamaafrica.sn", logo: "https://placehold.co/200x200/2ecc71/white?text=MA", deliveryRadius: 10, deliveryZones: ["Ngor", "Ouakam", "Yoff", "Mermoz", "HLM"], ownerId: admin.id,
    },
  });
  console.log(`  ✅ 2 restaurants créés`);

  const gerant1 = await prisma.user.create({
    data: { name: "Aïssatou Fall", phone: "7700000098", email: "gerant1@dakargourmet.sn", passwordHash: gerantHash, role: "GERANT", managedRestaurantId: resto1.id },
  });

  const gerant2 = await prisma.user.create({
    data: { name: "Modou Niang", phone: "7700000099", email: "gerant2@mamaafrica.sn", passwordHash: gerantHash, role: "GERANT", managedRestaurantId: resto2.id },
  });
  console.log(`  ✅ GERANT 1 (Dakar Gourmet): 77 000 00 98 / gerant123`);
  console.log(`  ✅ GERANT 2 (Mama Africa): 77 000 00 99 / gerant123`);

  const cat1 = await prisma.category.create({ data: { name: "Entrées", sortOrder: 1, restaurantId: resto1.id } });
  const cat2 = await prisma.category.create({ data: { name: "Plats Principaux", sortOrder: 2, restaurantId: resto1.id } });
  const cat3 = await prisma.category.create({ data: { name: "Desserts", sortOrder: 3, restaurantId: resto1.id } });
  const cat4 = await prisma.category.create({ data: { name: "Boissons", sortOrder: 4, restaurantId: resto1.id } });
  const cat5 = await prisma.category.create({ data: { name: "Plats Traditionnels", sortOrder: 1, restaurantId: resto2.id } });
  const cat6 = await prisma.category.create({ data: { name: "Grillades", sortOrder: 2, restaurantId: resto2.id } });
  const cat7 = await prisma.category.create({ data: { name: "Salades", sortOrder: 3, restaurantId: resto2.id } });

  const items1 = await Promise.all([
    prisma.menuItem.create({ data: { name: "Fataya (4 pièces)", description: "Beignets farcis au poisson épicé", price: 1500, stock: 30, categoryId: cat1.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Samoussas (6 pièces)", description: "Rouleaux de printemps farcis viande/legumes", price: 1200, stock: 40, categoryId: cat1.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Accras de morue", description: "Beignets de morue aux herbes", price: 1800, stock: 20, categoryId: cat1.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Thiéboudiène (Riz au poisson)", description: "Plat national sénégalais - riz, poisson, légumes", price: 3500, stock: 15, categoryId: cat2.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Yassa Poulet", description: "Poulet mariné oignons citron, riz blanc", price: 3000, stock: 20, categoryId: cat2.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Mafé", description: "Ragoût de boeuf sauce arachide", price: 3200, stock: 18, categoryId: cat2.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Thiou (Sauce gombo)", description: "Ragoût de viande au gombo", price: 2800, stock: 12, categoryId: cat2.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Thiakry", description: "Semoule de mil au yaourt vanille", price: 1200, stock: 25, categoryId: cat3.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Ngalakh", description: "Crème de mil au beurre de cacahuète et raisins", price: 1500, stock: 15, categoryId: cat3.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Jus de Bissap", description: "Jus d'hibiscus frais (1L)", price: 1000, stock: 50, categoryId: cat4.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Jus de Bouye", description: "Jus de fruit de baobab (1L)", price: 1000, stock: 40, categoryId: cat4.id, restaurantId: resto1.id } }),
    prisma.menuItem.create({ data: { name: "Eau minérale (1L)", description: "Eau de source", price: 500, stock: 100, categoryId: cat4.id, restaurantId: resto1.id } }),
  ]);

  const items2 = await Promise.all([
    prisma.menuItem.create({ data: { name: "Thiébou Guinar", description: "Riz au poulet - spécialité sénégalaise", price: 3200, stock: 15, categoryId: cat5.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Soupe Kandia", description: "Soupe de gombo, poisson fumé et huile rouge", price: 2500, stock: 10, categoryId: cat5.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Couscous Sénégalais", description: "Couscous à la viande et légumes", price: 3000, stock: 12, categoryId: cat5.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Mouton Yassa", description: "Mouton mariné aux oignons confits", price: 4000, stock: 10, categoryId: cat5.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Brochettes de Boeuf", description: "Brochettes grillées sauce épicée (8 pièces)", price: 2500, stock: 30, categoryId: cat6.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Poulet Braisé", description: "Poulet fermier braisé aux épices", price: 3500, stock: 15, categoryId: cat6.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Poisson Grillé (Mérou)", description: "Mérou grillé, riz parfumé, légumes", price: 4500, stock: 8, categoryId: cat6.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Salade Sénégalaise", description: "Laitue, tomate, oignon, concombre, thon", price: 1500, stock: 20, categoryId: cat7.id, restaurantId: resto2.id } }),
    prisma.menuItem.create({ data: { name: "Salade Niçoise", description: "Salade composée aux légumes frais", price: 1800, stock: 15, categoryId: cat7.id, restaurantId: resto2.id } }),
  ]);
  console.log(`  ✅ ${items1.length + items2.length} plats créés`);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "CMD-001", channel: "WEB", subType: "delivery", status: "DELIVERED", userId: client.id, restaurantId: resto1.id, deliveryAddress: "Médina, Rue 12 x 13", deliveryFee: 500, subtotal: 7000, total: 7500, scheduledAt: new Date("2026-07-08T12:00:00Z"),
    },
  });
  await prisma.orderItem.create({ data: { orderId: order1.id, menuItemId: items1[3].id, quantity: 1, unitPrice: 3500, totalPrice: 3500 } });
  await prisma.orderItem.create({ data: { orderId: order1.id, menuItemId: items1[4].id, quantity: 1, unitPrice: 3000, totalPrice: 3000 } });
  await prisma.orderItem.create({ data: { orderId: order1.id, menuItemId: items1[9].id, quantity: 1, unitPrice: 500, totalPrice: 500 } });

  await prisma.payment.create({ data: { orderId: order1.id, amount: 7500, method: "ORANGE_MONEY", status: "COMPLETED", userId: client.id, paidAt: new Date("2026-07-08T12:05:00Z") } });
  await prisma.delivery.create({ data: { orderId: order1.id, deliveryPersonId: livreur.id, status: "delivered", estimatedTime: 30, deliveredAt: new Date("2026-07-08T12:35:00Z") } });
  await prisma.review.create({ data: { orderId: order1.id, userId: client.id, rating: 5, comment: "Excellent repas, livraison rapide !", moderationStatus: "APPROVED" } });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "CMD-002", channel: "WEB", subType: "delivery", status: "IN_PROGRESS", userId: client.id, restaurantId: resto1.id, deliveryAddress: "Plateau, Rue de Thiong", deliveryFee: 500, subtotal: 4300, total: 4800,
    },
  });
  await prisma.orderItem.create({ data: { orderId: order2.id, menuItemId: items1[4].id, quantity: 1, unitPrice: 3000, totalPrice: 3000 } });
  await prisma.orderItem.create({ data: { orderId: order2.id, menuItemId: items1[10].id, quantity: 1, unitPrice: 1000, totalPrice: 1000 } });
  await prisma.orderItem.create({ data: { orderId: order2.id, menuItemId: items1[11].id, quantity: 1, unitPrice: 300, totalPrice: 300 } });
  await prisma.payment.create({ data: { orderId: order2.id, amount: 4800, method: "WAVE", status: "COMPLETED", userId: client.id, paidAt: new Date() } });
  await prisma.delivery.create({ data: { orderId: order2.id, deliveryPersonId: livreur.id, status: "in_progress", estimatedTime: 25 } });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "CMD-003", channel: "WEB", subType: "delivery", status: "PENDING", userId: client.id, restaurantId: resto2.id, deliveryAddress: "Yoff, Cité Millionnaire", deliveryFee: 500, subtotal: 6500, total: 7000,
    },
  });
  await prisma.orderItem.create({ data: { orderId: order3.id, menuItemId: items2[3].id, quantity: 1, unitPrice: 4000, totalPrice: 4000 } });
  await prisma.orderItem.create({ data: { orderId: order3.id, menuItemId: items2[4].id, quantity: 1, unitPrice: 2500, totalPrice: 2500 } });
  await prisma.payment.create({ data: { orderId: order3.id, amount: 7000, method: "FREE_MONEY", status: "PENDING", userId: client.id } });

  const order4 = await prisma.order.create({
    data: {
      orderNumber: "CMD-004", channel: "SUR_PLACE", subType: "on_site", status: "PENDING", userId: client.id, restaurantId: resto1.id, subtotal: 2700, total: 2700,
    },
  });
  await prisma.orderItem.create({ data: { orderId: order4.id, menuItemId: items1[0].id, quantity: 1, unitPrice: 1500, totalPrice: 1500 } });
  await prisma.orderItem.create({ data: { orderId: order4.id, menuItemId: items1[7].id, quantity: 1, unitPrice: 1200, totalPrice: 1200 } });

  const order5 = await prisma.order.create({
    data: {
      orderNumber: "CMD-005", channel: "DELIVERY", subType: "delivery", status: "CONFIRMED", userId: client.id, restaurantId: resto2.id, deliveryAddress: "Ouakam, Cité ASE", deliveryFee: 500, subtotal: 8000, total: 8500,
    },
  });
  await prisma.orderItem.create({ data: { orderId: order5.id, menuItemId: items2[6].id, quantity: 1, unitPrice: 4500, totalPrice: 4500 } });
  await prisma.orderItem.create({ data: { orderId: order5.id, menuItemId: items2[5].id, quantity: 1, unitPrice: 3500, totalPrice: 3500 } });
  await prisma.payment.create({ data: { orderId: order5.id, amount: 8500, method: "ORANGE_MONEY", status: "COMPLETED", userId: client.id, paidAt: new Date() } });

  const order6 = await prisma.order.create({
    data: {
      orderNumber: "CMD-006", channel: "WEB", subType: "delivery", status: "CANCELLED", userId: client.id, restaurantId: resto2.id, deliveryAddress: "Ngor, Rue des Pêcheurs", deliveryFee: 500, subtotal: 3000, total: 3500, notes: "Annulé par le client (délai trop long)",
    },
  });
  await prisma.orderItem.create({ data: { orderId: order6.id, menuItemId: items2[0].id, quantity: 1, unitPrice: 3200, totalPrice: 3200 } });
  await prisma.complaint.create({ data: { orderId: order6.id, userId: client.id, reason: "delay", description: "Attendu plus de 2h, annulé", status: "OPEN" } });

  console.log(`  ✅ ${6} commandes créées`);
  console.log(`\n🎉 Seed terminé !`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
