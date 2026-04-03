import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Receipt, History, IndianRupee, Table, Calendar, Search, Filter, Ban } from 'lucide-react';

const BillingHistory = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchHistory = async () => {
        try {
            const res = await api.get('/bills/history');
            setBills(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredBills = bills.filter(b => 
        b.id.toString().includes(searchTerm) || 
        b.table_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = bills.reduce((acc, b) => acc + parseFloat(b.final_amount), 0);
    const totalGst = bills.reduce((acc, b) => acc + parseFloat(b.gst), 0);

    if (loading) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: '100%', maxWidth: '1400px' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                   <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                      <History style={{ color: '#0ea5e9' }} size={28} />
                      Billing Ledger
                   </h2>
                   <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', margin: 0 }}>Review past transactions and financial performance.</p>
                </div>

                <div style={{ position: 'relative', width: '320px' }}>
                    <Search style={{ position: 'absolute', top: '14px', left: '16px', color: '#475569' }} size={18} />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', backgroundColor: '#0f172a', border: '2px solid #1e293b', color: 'white', padding: '12px 16px 12px 48px', borderRadius: '16px', outline: 'none', fontWeight: 600, fontSize: '14px' }}
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
                <div style={{ backgroundColor: '#0f172a', borderRadius: '28px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
                    <span style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today's Revenue (Last 24h)</span>
                    <h3 style={{ fontSize: '32px', fontWeight: 1000, color: '#10b981', marginTop: '12px', marginBottom: '4px' }}>
                        ₹{bills
                            .filter(b => new Date(b.created_at).toDateString() === new Date().toDateString())
                            .reduce((acc, b) => acc + parseFloat(b.final_amount || 0), 0).toFixed(2)}
                    </h3>
                    
                    {/* Lifetime Revenue Toggle Option */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <button 
                            onClick={() => {
                                const el = document.getElementById('billing-lifetime-rev');
                                el.style.display = el.style.display === 'none' ? 'block' : 'none';
                            }}
                            style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '10px', fontWeight: 900, cursor: 'pointer', padding: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                            View Total Lifetime Revenue
                        </button>
                        <div id="billing-lifetime-rev" style={{ display: 'none', marginTop: '8px' }}>
                            <span style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>₹{totalRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: '#0f172a', borderRadius: '28px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
                    <span style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tax Liability (GST)</span>
                    <h3 style={{ fontSize: '32px', fontWeight: 1000, color: '#f59e0b', marginTop: '12px', marginBottom: '4px' }}>₹{totalGst.toFixed(2)}</h3>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.05)', filter: 'blur(20px)' }}></div>
                </div>
                <div style={{ backgroundColor: '#0f172a', borderRadius: '28px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
                    <span style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processed Invoices</span>
                    <h3 style={{ fontSize: '32px', fontWeight: 1000, color: 'white', marginTop: '12px', marginBottom: '4px' }}>{bills.length} Bills</h3>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', filter: 'blur(20px)' }}></div>
                </div>
            </div>

            {/* List View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Filter size={16} style={{ color: '#475569' }} />
                    <span style={{ fontSize: '12px', fontWeight: 950, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Transaction History List</span>
                </div>

                {filteredBills.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#0f172a', borderRadius: '32px', border: '2px dashed #1e293b' }}>
                        <Ban size={48} style={{ color: '#1e293b', marginBottom: '16px' }} />
                        <p style={{ color: '#64748b', fontWeight: 700, margin: 0 }}>No matching transactions found in your records.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredBills.map(bill => (
                            <div key={bill.id} style={{ backgroundColor: '#0f172a', borderRadius: '24px', padding: '24px 32px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    <div style={{ width: '56px', height: '56px', backgroundColor: '#020617', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1e293b' }}>
                                        <Receipt size={24} style={{ color: '#0ea5e9' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>Invoice #{bill.id} — Table {bill.table_number}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(bill.created_at).toLocaleDateString()}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IndianRupee size={12} /> GST Included: ₹{bill.gst}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <span style={{ display: 'block', fontSize: '20px', fontWeight: 1000, color: '#10b981' }}>₹{parseFloat(bill.final_amount).toFixed(2)}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        {bill.is_paid ? (
                                            <span style={{ fontSize: '10px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '8px', fontWeight: 900, textTransform: 'uppercase' }}>
                                                PAID {bill.payment_method ? `via ${bill.payment_method.toUpperCase()}` : ''}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '4px 8px', borderRadius: '8px', fontWeight: 900, textTransform: 'uppercase' }}>
                                                DUE / UNPAID
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingHistory;
