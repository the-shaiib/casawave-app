import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Admin from './pages/Admin/Admin';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AllProducts from './pages/AllProducts/AllProducts';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Home from './pages/Home/Home';
import Orders from './pages/Orders/Orders';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import ThankYou from './pages/ThankYou/ThankYou';

function AppRoutes() {
  const location = useLocation();

  return (
    <main>
      <div key={location.pathname} className="route-fade">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <AppRoutes />
      <Footer />
    </Router>
  );
}

export default App;
