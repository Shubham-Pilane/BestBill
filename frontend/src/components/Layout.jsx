import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  LogOut, 
  UserCircle, 
  History, 
  Wallet, 
  Menu, 
  X, 
  Bed, 
  Bell,
  ShieldCheck
} from 'lucide-react';

const playInternalChime = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const playNote = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.className = "generated-note";
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        const now = audioCtx.currentTime;
        playNote(880, now, 0.4);      
        playNote(1108.73, now + 0.1, 0.4); 
        playNote(1318.51, now + 0.2, 0.6); 
    } catch (e) { console.error("Audio Error:", e); }
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isWaiter = user?.role === 'waiter';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingGuestOrders, setPendingGuestOrders] = useState(0);

  // SIMPLIFIED DETECTION LOGIC
  const prevCount = useRef(-1); 

  const fetchPendingOrders = async () => {
    if (isAdmin || isWaiter || !user) return;
    try {
        const res = await api.get('/rooms/guest-orders-all');
        const activeOrders = res.data.filter(o => !o.is_delivered && o.room_status === 'occupied');
        const currentCount = activeOrders.length;

        // --- AUTOMATIC CHIME TRIGGER ---
        // If count has INCREASED since last check
        if (prevCount.current !== -1 && currentCount > prevCount.current) {
            console.log(`[ORDER DETECTED] Count jumped from ${prevCount.current} to ${currentCount}`);
            if (localStorage.getItem('guest_order_sound') === 'true') {
                playInternalChime();
                toast(`NEW ORDER RECEIVED!`, { 
                    icon: '🔔',
                    style: { borderRadius: '20px', background: '#0ea5e9', color: '#fff', fontWeight: 900 }
                });
            }
        }
        
        prevCount.current = currentCount;
        setPendingGuestOrders(currentCount);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = isAdmin 
    ? [
        { name: 'Admin Dashboard', path: '/', icon: <ShieldCheck size={20} /> },
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
          { name: 'Lodging (Rooms)', path: '/lodging', icon: <Bed size={20} /> },
          { name: 'Guest Orders', path: '/orders', icon: <Bell size={20} /> },
          { name: 'Billing History', path: '/history', icon: <History size={20} /> },
          { name: 'Profile Settings', path: '/profile', icon: <UserCircle size={20} /> },
        ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050a18', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '280px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 100 }} className="sidebar">
        <div style={{ padding: '40px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '54px', height: '54px', backgroundColor: '#0ea5e9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UtensilsCrossed color="white" size={30} /></div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>Best<span style={{ color: '#38bdf8' }}>Bill</span></h1>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderRadius: '14px', textDecoration: 'none', color: location.pathname === item.path ? '#0ea5e9' : '#94a3b8', backgroundColor: location.pathname === item.path ? 'rgba(14, 165, 233, 0.1)' : 'transparent', fontWeight: 700, fontSize: '16px' }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.name}</span>
              {(item.path === '/orders') && pendingGuestOrders > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 900, padding: '2px 8px', borderRadius: '100px' }}>{pendingGuestOrders}</span>
              )}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '24px' }}><button onClick={logout} style={{ width: '100%', padding: '14px', background: 'none', color: '#64748b', borderRadius: '12px', border: '1px solid #1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><LogOut size={18} /> Sign Out</button></div>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="mobile-header" style={{ height: '64px', backgroundColor: '#0f172a', padding: '0 24px', display: 'none', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UtensilsCrossed size={24} color="#0ea5e9" /><h1 style={{ fontSize: '18px', fontWeight: 900 }}>BestBill</h1></div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: '#94a3b8', background: 'none', border: 'none' }}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </header>
        <main style={{ padding: '40px' }}>{children}</main>
      </div>
    </div>
  );
};
export default Layout;
export { playInternalChime };
