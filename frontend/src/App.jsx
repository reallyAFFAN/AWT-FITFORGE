import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import CartProvider from './context/CartContext';
import AuthProvider from './context/AuthContext';
import OrderProvider from './context/OrderContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <ScrollToTop />
          <AppRoutes />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;