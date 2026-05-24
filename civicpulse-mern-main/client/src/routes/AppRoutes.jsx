import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ReportIssue from '../pages/ReportIssue';
import MyComplaints from '../pages/MyComplaints';
import ComplaintDetail from '../pages/ComplaintDetail';
import AdminRoute from '../components/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ComplaintManagement from '../pages/admin/ComplaintManagement';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminRegister from '../pages/admin/AdminRegister';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Protected routes — must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/complaints/:id" element={<ComplaintDetail />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<ComplaintManagement />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
