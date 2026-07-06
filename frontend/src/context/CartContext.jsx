import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  function addItem(item, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) return prev.map((i) => (i.menuItemId === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity }];
    });
  }

  function removeItem(menuItemId) {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  function updateQuantity(menuItemId, quantity) {
    if (quantity <= 0) return removeItem(menuItemId);
    setItems((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)));
  }

  function clear() {
    setItems([]);
    setRestaurantId(null);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, setRestaurantId, addItem, removeItem, updateQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
