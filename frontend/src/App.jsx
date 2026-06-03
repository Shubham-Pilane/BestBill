import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<LandingPage />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
