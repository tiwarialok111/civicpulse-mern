import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ReportIssue = lazy(() => import('../pages/ReportIssue'));
const MyComplaints = lazy(() => import('../pages/MyComplaints'));
const ComplaintDetail = lazy(() => import('../pages/ComplaintDetail'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Analytics = lazy(() => import('../pages/Analytics'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ComplaintManagement = lazy(() => import('../pages/admin/ComplaintManagement'));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminRegister = lazy(() => import('../pages/admin/AdminRegister'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />

            {/* Protected citizen routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-complaints" element={<MyComplaints />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>

          {/* Admin auth pages — standalone, no Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/complaints" element={<ComplaintManagement />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
