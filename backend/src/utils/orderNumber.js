function generateOrderNumber(channel) {
  const prefix = channel === "ON_SITE" ? "ONS" : "CMD";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${rand}`;
}

module.exports = { generateOrderNumber };
