import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import BillingHistory from './pages/BillingHistory';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import Lodging from './pages/Lodging';
import Layout from './components/Layout';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #1e293b', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite' }}></div><style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Home = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <Dashboard />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const OwnerRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'owner') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/menu" element={
            <ProtectedRoute>
              <OwnerRoute>
                <Layout>
                  <MenuManagement />
                </Layout>
              </OwnerRoute>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <OwnerRoute>
                <Layout>
                  <BillingHistory />
                </Layout>
              </OwnerRoute>
            </ProtectedRoute>
          } />
          <Route path="/lodging" element={
            <ProtectedRoute>
              <OwnerRoute>
                <Layout>
                  <Lodging />
                </Layout>
              </OwnerRoute>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <Subscriptions />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>

  );
}

export default App;
