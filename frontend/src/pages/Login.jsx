import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UtensilsCrossed, LogIn, Mail, Lock, UserPlus, Store, ChevronRight, AlertTriangle, Phone, AtSign, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [blockedInfo, setBlockedInfo] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isRegister ? 'Creating account...' : 'Signing in...');
    try {
      if (isRegister) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('hotelName', hotelName);
        formData.append('phone', phone);
        formData.append('address', address);
        if (logoFile) formData.append('logo', logoFile);
        await api.post('/auth/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Registration successful!', { id: loadingToast });
        setIsRegister(false);
      } else {
        await login(email, password);
        toast.success('Welcome back!', { id: loadingToast });
        navigate('/');
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 403 && (data?.message === 'PLAN_EXPIRED' || data?.message === 'SERVICE_BLOCKED')) {
        toast.dismiss(loadingToast);
        setBlockedInfo({
          type: data.message,
          reason: data.reason,
          phone: data.contact_phone,
          email: data.contact_email
        });
      } else {
        toast.error(data?.message || 'Action failed', { id: loadingToast });
      }
    }
  };

  // --- Blocked / Expired Full-Screen ---
  if (blockedInfo) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#020617', zIndex: 9999, fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', backgroundColor: 'rgba(244, 63, 94, 0.08)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
        </div>
        <div style={{ width: '100%', maxWidth: '480px', padding: '20px', zIndex: 10 }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)',
            borderRadius: '32px', border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '48px', boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.15)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '80px', height: '80px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              borderRadius: '24px', marginBottom: '24px',
              boxShadow: '0 10px 30px rgba(244, 63, 94, 0.4)'
            }}>
              <AlertTriangle style={{ color: 'white' }} size={40} />
            </div>

            <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 900, margin: '0 0 8px 0' }}>
              {blockedInfo.type === 'PLAN_EXPIRED' ? 'Plan Expired' : 'Service Suspended'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, lineHeight: '1.6', margin: '0 0 32px 0' }}>
              {blockedInfo.reason}
            </p>

            <div style={{
              backgroundColor: '#020617', borderRadius: '24px', padding: '28px',
              border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 950, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact Customer Care</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} style={{ color: '#0ea5e9' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Phone</span>
                  <a href={`tel:${blockedInfo.phone}`} style={{ color: 'white', fontWeight: 900, fontSize: '16px', textDecoration: 'none' }}>{blockedInfo.phone}</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AtSign size={20} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Email</span>
                  <a href={`mailto:${blockedInfo.email}`} style={{ color: 'white', fontWeight: 900, fontSize: '14px', textDecoration: 'none' }}>{blockedInfo.email}</a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setBlockedInfo(null)}
              style={{
                width: '100%', marginTop: '28px', padding: '16px', borderRadius: '16px',
                backgroundColor: '#1e293b', color: '#94a3b8', border: 'none',
                fontWeight: 800, fontSize: '15px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxHeight: '85vh',
          overflowY: 'auto'
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', top: '18px', left: '16px', color: '#475569' }} size={18} />
                    <input
                      type="tel"
                      style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '16px', outline: 'none', transition: 'border-color 0.2s', fontSize: '14px', fontWeight: 600 }}
                      placeholder="e.g. 9876543210"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Hotel Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', top: '18px', left: '16px', color: '#475569' }} size={18} />
                    <input
                      type="text"
                      style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '16px 16px 16px 48px', borderRadius: '16px', outline: 'none', transition: 'border-color 0.2s', fontSize: '14px', fontWeight: 600 }}
                      placeholder="e.g. MG Road, Pune"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>Hotel Logo (Optional)</label>
                  <div 
                    onClick={() => document.getElementById('reg-logo-upload').click()}
                    style={{ width: '100%', padding: '20px', borderRadius: '16px', border: '2px dashed #1e293b', backgroundColor: '#020617', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {logoFile ? (
                      <span style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <ImageIcon size={18} /> {logoFile.name}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={18} /> Click to upload logo
                      </span>
                    )}
                  </div>
                  <input id="reg-logo-upload" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} style={{ display: 'none' }} />
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
