import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Employees from './pages/Employees';
import Reports from './pages/Reports';

/** The route table: URL -> page. Everything inside <Layout> requires login. */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        {/* admin-only pages */}
        <Route path="/employees" element={<ProtectedRoute adminOnly><Employees /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
