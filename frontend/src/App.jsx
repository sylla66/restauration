import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import AdminRestaurants from "@/pages/admin/AdminRestaurants";
import AdminRestaurantForm from "@/pages/admin/AdminRestaurantForm";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminStaff from "@/pages/admin/AdminStaff";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminComplaints from "@/pages/admin/AdminComplaints";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminDeliveries from "@/pages/admin/AdminDeliveries";
import Payments from "@/pages/Payments";
import DeliveryList from "@/pages/delivery/DeliveryList";
import DeliveryDetail from "@/pages/delivery/DeliveryDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <SocketProvider>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="menu" element={<Menu />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="delivery" element={<DeliveryList />} />
                  <Route path="delivery/:id" element={<DeliveryDetail />} />
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="restaurants" element={<AdminRestaurants />} />
                  <Route path="restaurants/:id" element={<AdminRestaurantForm />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="deliveries" element={<AdminDeliveries />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
              </Routes>
            </SocketProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
