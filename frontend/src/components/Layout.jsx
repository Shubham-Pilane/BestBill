import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UtensilsCrossed, LogOut, User, Store, ShieldCheck, Building2, Settings, UserCircle, History, Wallet } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const themeColor = isAdmin ? '#10b981' : '#0ea5e9';

  const getDaysLeft = () => {
    if (!user?.subscription_valid_until) return 0;
    const end = new Date(user.subscription_valid_until);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const daysLeft = getDaysLeft();
  const isWaiter = user?.role === 'waiter';

  const navItems = isAdmin 
    ? [
        { name: 'Onboarding Dashboard', path: '/', icon: <ShieldCheck size={20} /> },
        { name: 'Subscriptions', path: '/subscriptions', icon: <Wallet size={20} /> },
        { name: 'Profile Settings', path: '/profile', icon: <UserCircle size={20} /> },
      ]
    : isWaiter 
      ? [
          { name: 'Table Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
          { name: 'Profile Settings', path: '/profile', icon: <UserCircle size={20} /> },
        ]
      : [
          { name: 'Table Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
          { name: 'Manage Menu', path: '/menu', icon: <UtensilsCrossed size={20} /> },
          { name: 'Billing History', path: '/history', icon: <History size={20} /> },
          { name: 'Profile Settings', path: '/profile', icon: <UserCircle size={20} /> },
        ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      width: '100%'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: '#0f172a',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 20px',
        position: 'fixed',
        height: '100vh',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px', padding: '0 12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: themeColor,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 16px ${isAdmin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)'}`
          }}>
            {isAdmin ? <ShieldCheck style={{ color: 'white' }} size={24} /> : <UtensilsCrossed style={{ color: 'white' }} size={24} />}
          </div>
          <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Best<span style={{ color: themeColor }}>{isAdmin ? 'Admin' : 'Bill'}</span>
          </span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: location.pathname === item.path ? `${themeColor}20` : 'transparent',
                color: location.pathname === item.path ? themeColor : '#94a3b8',
                border: location.pathname === item.path ? `1px solid ${themeColor}40` : '1px solid transparent',
                fontWeight: 600,
                fontSize: '15px'
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: isAdmin ? 'rgba(244,63,94,0.03)' : 'transparent', borderRadius: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isAdmin ? '1px solid #f43f5e' : '1px solid #334155'
            }}>
              {isAdmin ? <ShieldCheck size={20} style={{ color: '#f43f5e' }} /> : <User size={20} style={{ color: '#64748b' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</span>
              <span style={{ fontSize: '10px', color: isAdmin ? '#f43f5e' : (isWaiter ? '#f59e0b' : '#64748b'), fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isAdmin ? 'System Authority' : (isWaiter ? 'Waitstaff' : 'Proprietor')}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 63, 94, 0.05)',
              color: '#f43f5e',
              border: '1px solid rgba(244, 63, 94, 0.1)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={20} />
            Logout System
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '280px', padding: '48px', position: 'relative' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isAdmin ? <Building2 style={{ color: '#f43f5e' }} size={32} /> : <Store style={{ color: '#0ea5e9' }} size={32} />}
              {isAdmin ? 'BestBill Ecosystem Control' : user?.hotel_name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600, margin: 0 }}>
              {isAdmin ? `Administrator: ${user?.name}` : `Proprietor: ${user?.name} | Active Session`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {!isAdmin && (
              <div style={{ padding: '12px 20px', backgroundColor: daysLeft > 5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', borderRadius: '16px', border: `1px solid ${daysLeft > 5 ? 'rgba(16, 185, 129, 0.3)' : '#f43f5e'}`, textAlign: 'right' }}>
                 <span style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: daysLeft > 5 ? '#10b981' : '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Validity</span>
                 <span style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Plan Expired'}</span>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>CURRENT DATE</span>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>
        
        {/* Child Content Container */}
        <section style={{ position: 'relative', width: '100%' }}>
          {children}
        </section>
      </div>
    </div>
  );
};

export default Layout;
