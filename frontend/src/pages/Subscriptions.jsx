import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Wallet, CheckCircle, Clock, Hotel, ArrowRightLeft, Calendar, Building2 } from 'lucide-react';

const Subscriptions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const themeColor = '#10b981';

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/admin/subscriptions');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1440px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <Wallet style={{ color: themeColor }} size={28} />
          Subscription & Revenue Gateway
        </h2>
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', margin: 0 }}>Monitor hotel onboarding fees, active validity, and historic renewals.</p>
      </div>

      {/* Hero Analytics Card */}
      <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', backgroundColor: `${themeColor}20`, borderRadius: '50%', filter: 'blur(50px)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColor }}>
            <span style={{ fontSize: '32px', fontWeight: 900 }}>₹</span>
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
              Today's Earnings (Last 24h)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                {data.history
                  .filter(h => new Date(h.created_at).toDateString() === new Date().toDateString())
                  .reduce((acc, h) => acc + parseFloat(h.amount || 0), 0).toFixed(2)}
              </span>
            </div>
            
            {/* Lifetime Revenue Toggle Option */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <button 
                onClick={() => {
                  const el = document.getElementById('admin-lifetime-rev');
                  el.style.display = el.style.display === 'none' ? 'block' : 'none';
                }}
                style={{ background: 'none', border: 'none', color: themeColor, fontSize: '11px', fontWeight: 900, cursor: 'pointer', padding: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                View Total Lifetime Booking Revenue
              </button>
              <div id="admin-lifetime-rev" style={{ display: 'none', marginTop: '12px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>₹{data.total_collected.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        
        {/* Active Plans Module */}
        <div style={{ flex: 1, backgroundColor: '#0f172a', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Building2 size={24} color={themeColor} />
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Active Hotel Plans</h3>
          </div>
          <div style={{ padding: '0 32px' }}>
            {data.active_plans.map((plan, idx) => {
              const daysLeft = Math.ceil((new Date(plan.subscription_valid_until) - new Date()) / (1000 * 60 * 60 * 24));
              const isEndingSoon = daysLeft <= 5;
              return (
                <div key={idx} style={{ padding: '24px 0', borderBottom: idx === data.active_plans.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{plan.hotel_name}</span>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> Ends: {new Date(plan.subscription_valid_until).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: themeColor }}>₹{plan.subscription_amount}</span>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, backgroundColor: isEndingSoon ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: isEndingSoon ? '#f43f5e' : '#10b981' }}>
                      {daysLeft > 0 ? `${daysLeft} Days Left` : 'EXPIRED'}
                    </span>
                  </div>
                </div>
              );
            })}
            {data.active_plans.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: 600 }}>No active plans currently in the ecosystem.</p>
            )}
          </div>
        </div>

        {/* Historic Renewals Log */}
        <div style={{ flex: 1, backgroundColor: '#0f172a', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
           <div style={{ padding: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ArrowRightLeft size={24} color="#0ea5e9" />
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Transaction & Renewal History</h3>
          </div>
          <div style={{ padding: '0 32px' }}>
            {data.history.map((record, idx) => (
              <div key={idx} style={{ padding: '24px 0', borderBottom: idx === data.history.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={18} color="#0ea5e9" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>{record.hotel_name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Renewed for {record.months_added} month(s)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                   <span style={{ fontSize: '15px', fontWeight: 900, color: 'white' }}>+ ₹{record.amount}</span>
                   <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>{new Date(record.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {data.history.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: 600 }}>No transaction logs available.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Subscriptions;
