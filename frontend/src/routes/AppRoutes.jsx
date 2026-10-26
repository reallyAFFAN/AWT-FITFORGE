
import { Navigate, Route, Routes } from 'react-router';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

import Home from '../pages/user/Home';
import StoreProducts from '../pages/user/Products';
import ProductDetails from '../pages/user/ProductDetails';
import Cart from '../pages/user/Cart';
import Checkout from '../pages/user/Checkout';
import Orders from '../pages/user/Orders';
import Profile from '../pages/user/Profile';

import Dashboard from '../pages/admin/Dashboard';
import AdminOrders from '../pages/admin/Orders';
import AdminProducts from '../pages/admin/Products';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
      </Route>

      {/* Admin routes: authenticated admin only */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Route>

      {/* Customer store */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<StoreProducts />} />
        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />
        <Route path="/cart" element={<Cart />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to="/home" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/home" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
