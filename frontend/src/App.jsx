import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import AdminAppPage from './pages/AdminAppPage';
import VendorAdminPage from './pages/VendorAdminPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-app" element={<AdminAppPage />} />
        <Route path="/admin" element={<VendorAdminPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
