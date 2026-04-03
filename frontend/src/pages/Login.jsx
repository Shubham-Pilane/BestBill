import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UtensilsCrossed, LogIn, Mail, Lock, UserPlus, Store, ChevronRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [hotelName, setHotelName] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isRegister ? 'Creating account...' : 'Signing in...');
    try {
      if (isRegister) {
        await api.post('/auth/register', { name, email, password, hotelName });
        toast.success('Registration successful!', { id: loadingToast });
        setIsRegister(false);
      } else {
        await login(email, password);
        toast.success('Welcome back!', { id: loadingToast });
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed', { id: loadingToast });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#020617',
      zIndex: 9999,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '20px',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              borderRadius: '24px',
              marginBottom: '20px',
              boxShadow: '0 10px 20px rgba(14, 165, 233, 0.3)'
            }}>
               <UtensilsCrossed style={{ color: 'white' }} size={36} />
            </div>
            <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 900, letterSpacing: '-0.05em', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
              Best<span style={{ color: '#38bdf8' }}>Bill</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              {isRegister ? 'New Business Registration' : 'Hotel Owner Login'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isRegister && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Owner Name</label>
                  <div style={{ position: 'relative' }}>
                    <LogIn style={{ position: 'absolute', top: '18px', left: '16px', color: '#475569' }} size={18} />
                    <input
                      type="text"
                      style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '16px', outline: 'none', transition: 'border-color 0.2s', fontSize: '14px', fontWeight: 600 }}
                      placeholder="e.g. John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Hotel Name</label>
                  <div style={{ position: 'relative' }}>
                    <Store style={{ position: 'absolute', top: '18px', left: '16px', color: '#475569' }} size={18} />
                    <input
                      type="text"
                      style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '16px', outline: 'none', transition: 'border-color 0.2s', fontSize: '14px', fontWeight: 600 }}
                      placeholder="e.g. Grand Plaza"
                      required
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', top: '18px', left: '16px', color: '#475569' }} size={18} />
                <input
                  type="email"
                  style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '16px', outline: 'none', transition: 'border-color 0.2s', fontSize: '14px', fontWeight: 600 }}
                  placeholder="owner@hotel.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', top: '18px', left: '16px', color: '#475569' }} size={18} />
                <input
                  type="password"
                  style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '16px', outline: 'none', transition: 'border-color 0.2s', fontSize: '14px', fontWeight: 600 }}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              style={{
                width: '100%',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isRegister ? <><UserPlus size={22} /> Register</> : <><LogIn size={22} /> Login</>}
               <ChevronRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>
              {isRegister ? 'Already have an account?' : "Don't have a hotel account?"}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                style={{ color: '#38bdf8', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, textDecoration: 'underline', paddingLeft: '4px' }}
              >
                {isRegister ? 'Login now' : 'Register here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
