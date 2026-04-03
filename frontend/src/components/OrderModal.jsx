import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { X, Plus, Minus, Receipt, Send, MessageSquare, MessageCircle, Utensils, Trash2, ChevronRight, IndianRupee, Clock, CheckCircle, Phone, ArrowLeft, RefreshCcw, Wallet, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const OrderModal = ({ table, onClose }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemsRes, orderRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu/items'),
          table.active_order_id ? api.get(`/tables/${table.id}/order`) : Promise.resolve({ data: { items: [] } })
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
        setOrderItems(orderRes.data.items || []);
        setLoading(false);
      } catch (err) {
        toast.error('Initialization failed');
      }
    };
    fetchData();
  }, [table]);

  const addToOrder = async (item) => {
    try {
      const res = await api.post(`/tables/${table.id}/order`, {
        menuItemId: item.id,
        quantity: 1
      });
      setOrderItems(res.data.items);
      toast.success(`+ ${item.name}`, { icon: '🍽️' });
    } catch (err) {
      toast.error('Add failed');
    }
  };

  const updateQuantity = async (itemId, change) => {
    const item = orderItems.find(i => i.id === itemId);
    const newQty = item.quantity + change;
    if (newQty < 1) return removeFromOrder(itemId);
    
    try {
      const res = await api.put(`/tables/${table.id}/order/items/${itemId}`, { quantity: newQty });
      setOrderItems(res.data.items);
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const removeFromOrder = async (itemId) => {
    try {
      const res = await api.delete(`/tables/${table.id}/order/items/${itemId}`);
      setOrderItems(res.data.items);
    } catch (err) {
      toast.error('Removal failed');
    }
  };

  const generateBill = async () => {
    try {
      const res = await api.post(`/tables/${table.id}/bill`, { discount_percentage: discount });
      setBillData(res.data);
      setShowBill(true);
      toast.success('Bill finalized!', {
        icon: '🧾',
        style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontWeight: 900 }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Billing failed');
    }
  };

  const printBill = () => {
    if (!billData) return;
    const sub = parseFloat(billData.subtotal || 0);
    const tax = parseFloat(billData.gst || 0);
    const pre = sub + tax;
    const disc = pre * (billData.discount_percentage / 100);
    const p = window.open('', '_blank');
    p.document.write(`
      <html><body onload="window.print();window.close()"><div style="font-family:monospace;width:300px;padding:20px;color:black">
      <div style="text-align:center;border-bottom:1px solid #000;padding-bottom:10px">
      <h2 style="margin:0">${user?.hotel_name?.toUpperCase()}</h2><p style="margin:5px 0">Bill #${billData.id} | ${new Date().toLocaleDateString()}</p>
      </div><div style="padding:10px 0;border-bottom:1px solid #000">
      ${(billData.items || []).map(i => `<div style="display:flex;justify-content:space-between"><span>${i.name} x${i.quantity}</span><span>${(i.price*i.quantity).toFixed(2)}</span></div>`).join('')}
      </div><div style="padding:10px 0;line-height:1.6">
      <div style="display:flex;justify-content:space-between"><span>Subtotal:</span><span>₹${sub.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between"><span>GST (${billData.gst_percentage}%):</span><span>₹${tax.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px dashed #ccc"><span>Order Total:</span><span>₹${pre.toFixed(2)}</span></div>
      ${billData.discount_percentage > 0 ? `<div style="display:flex;justify-content:space-between"><span>Discount (${billData.discount_percentage}%):</span><span>-₹${disc.toFixed(2)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.2em;border-top:1px solid #000;margin-top:5px;padding-top:5px"><span>GRAND TOTAL:</span><span>₹${parseFloat(billData.final_amount).toFixed(2)}</span></div>
      </div><div style="text-align:center;margin-top:20px;font-size:0.8em">POWERED BY BESTBILL<br>THANK YOU FOR VISITING!</div>
      </div></body></html>
    `);
  };

  const rollbackBill = async () => {
    if (billData?.is_paid) return toast.error('Paid invoices cannot be rolled back');
    try {
      await api.delete(`/tables/${table.id}/bill/${billData.id}`);
      setShowBill(false);
      setBillData(null);
      toast.success('Bill cancelled. Returning to order.');
    } catch (err) {
      toast.error('Rollback failed');
    }
  };

  const confirmPayment = async (method = 'upi') => {
    try {
       await api.put(`/tables/bill/${billData.id}/pay`, { method });
       setBillData(prev => ({ ...prev, is_paid: true }));
       toast.success('Payment protocol verified!');
    } catch (err) {
       toast.error('Confirmation failed');
    }
  };

  const sendNotification = async (method) => {
    if (!customerPhone || customerPhone.length < 10) {
      return toast.error('Enter a valid mobile number');
    }
    try {
      await api.post(`/tables/${table.id}/bill/send`, { 
        method, 
        customerPhone,
        billId: billData.id
      });
      toast.success(`Invoice dispatched via ${method.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Transmission failed');
    }
  };

  const shareViaWhatsApp = () => {
    if (!customerPhone) {
      toast.error('Please enter a phone number first');
      return;
    }
    const sub = parseFloat(billData.subtotal);
    const tax = parseFloat(billData.gst);
    const pre = sub + tax;
    const disc = pre * (billData.discount_percentage / 100);
    
    let msg = `*--- ${user?.hotel_name?.toUpperCase()} RECEIPT ---*\n\n`;
    (billData.items || []).forEach(i => msg += `• ${i.name} x ${i.quantity} = ₹${i.price * i.quantity}\n`);
    msg += `\n*------------------------*\n`;
    msg += `*Subtotal:* ₹${sub.toFixed(2)}\n`;
    msg += `*GST (${billData.gst_percentage}%):* ₹${tax.toFixed(2)}\n`;
    msg += `*Order Total:* ₹${pre.toFixed(2)}\n`;
    if (billData.discount_percentage > 0) msg += `*Discount (${billData.discount_percentage}%):* -₹${disc.toFixed(2)}\n`;
    msg += `*GRAND TOTAL: ₹${parseFloat(billData.final_amount).toFixed(2)}*\n`;
    msg += `*------------------------*\n\nThank you! Visit again.`;
    
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // UPI Deep Link Generation
  const upiId = user?.upi_id || '';
  const hname = user?.hotel_name || 'BestBill';
  const amount = billData?.final_amount || 0;
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(hname)}&am=${amount}&cu=INR`;

  if (loading) return null;

  // Breakdown for Modal display logic
  const sub = billData ? parseFloat(billData.subtotal || 0) : 0;
  const tax = billData ? parseFloat(billData.gst || 0) : 0;
  const pre = sub + tax;
  const disc = billData ? pre * (billData.discount_percentage / 100) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '1440px', height: '90vh', backgroundColor: '#0f172a', borderRadius: '40px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Header */}
        <div style={{ padding: '32px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: table.active_order_id ? '#f43f5e' : '#10b981', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '28px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
              {table.table_number}
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Position Summary</h2>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dynamic Order Protocol</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1e293b', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Menu Restored with Plus Sign */}
          <div style={{ flex: 1, borderRight: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 48px', display: 'flex', gap: '10px', overflowX: 'auto', backgroundColor: '#020617' }}>
              <button onClick={() => setSelectedCategory('all')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', backgroundColor: selectedCategory === 'all' ? '#0ea5e9' : '#1e293b', color: 'white', fontSize: '12px' }}>ALL ITEMS</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', backgroundColor: selectedCategory === cat.id ? '#0ea5e9' : '#1e293b', color: 'white', fontSize: '12px', textTransform: 'uppercase' }}>{cat.name}</button>
              ))}
            </div>
            
            <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', alignContent: 'start' }}>
              {items.filter(i => selectedCategory === 'all' || i.category_id === selectedCategory).map(item => (
                <div key={item.id} onClick={() => addToOrder(item)} style={{ backgroundColor: '#020617', border: '2px solid #1e293b', padding: '24px', borderRadius: '24px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 950, color: 'white', marginBottom: '12px', fontSize: '15px' }}>
                    <span>{item.name}</span>
                    <span style={{ color: '#10b981' }}>₹{item.price}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 16px 0' }}>{item.description || 'Standard culinary selection'}</p>
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 5px 15px rgba(14, 165, 233, 0.4)' }}>
                    <Plus size={16} strokeWidth={4} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: '420px', backgroundColor: '#020617', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #1e293b' }}>
               <Receipt color="#0ea5e9" size={24} />
               <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Active Selection</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderItems.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.1, color: 'white' }}>
                   <Utensils size={64} />
                   <span style={{ fontWeight: 900, marginTop: '20px' }}>CARTS EMPTY</span>
                </div>
              ) : (
                orderItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div><div style={{ color: 'white', fontWeight: 900 }}>{item.name}</div><div style={{ color: '#10b981', fontSize: '13px', fontWeight: 800 }}>₹{item.price * item.quantity}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ cursor: 'pointer', border: 'none', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white' }}><Minus size={14} /></button>
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '14px' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ cursor: 'pointer', border: 'none', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white' }}><Plus size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '32px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }}>
              <div style={{ marginBottom: '20px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '11px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>
                   <span>Loyalty Discount (%)</span>
                   <input type="number" value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, e.target.value)))} style={{ width: '50px', background: 'none', border: 'none', borderBottom: '2px solid #0ea5e9', color: 'white', textAlign: 'center', fontWeight: 900, outline: 'none' }} />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 1000, fontSize: '28px' }}>
                   <span>Final Due</span>
                   <span style={{ color: '#10b981' }}>₹{((orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 1.05) * (1 - discount/100)).toFixed(2)}</span>
                 </div>
              </div>
              <button disabled={orderItems.length === 0} onClick={generateBill} style={{ width: '100%', padding: '20px', borderRadius: '20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', fontWeight: 1000, fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 40px -10px rgba(14, 165, 233, 0.5)', transition: 'all 0.2s', opacity: orderItems.length === 0 ? 0.3 : 1 }}>SETTLE TRANSACTION</button>
            </div>
          </div>
        </div>
      </div>

      {showBill && billData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '40px', overflow: 'hidden', display: 'flex', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
            <div style={{ flex: 1, padding: '48px', borderRight: '1px solid #f1f5f9', backgroundColor: billData.is_paid ? '#f0fdf4' : 'white', transition: 'all 0.5s' }}>
               <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '50%', backgroundColor: billData.is_paid ? '#10b981' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: billData.is_paid ? 'scale(1.2)' : 'scale(1)', transition: '0.5s' }}>
                    <CheckCircle color={billData.is_paid ? "white" : "#10b981"} size={32} />
                  </div>
                  <h3 style={{ margin: 0, fontWeight: 950, fontSize: '24px' }}>{billData.is_paid ? 'Payment Confirmed' : 'Invoice Details'}</h3>
                  <p style={{ color: '#64748b', fontWeight: 700, margin: '8px 0 0' }}>Order ID: #{billData.id}</p>
               </div>
               
               <div style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                    {(billData.items || []).map((i, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>
                        <span>{i.name} x{i.quantity}</span>
                        <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}><span>NET SUBTOTAL</span><span style={{ fontWeight: 900 }}>₹{sub.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}><span>GST (${billData.gst_percentage}%)</span><span style={{ fontWeight: 900 }}>₹{tax.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: '#1e293b', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}><span>ORDER TOTAL</span><span>₹{pre.toFixed(2)}</span></div>
                    {billData.discount_percentage > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0ea5e9', fontSize: '14px', fontWeight: 900, backgroundColor: 'rgba(14, 165, 233, 0.05)', padding: '8px 12px', borderRadius: '12px' }}>
                        <span>DISCOUNT (${billData.discount_percentage}%)</span>
                        <span>-₹{disc.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '32px', fontWeight: 1000, color: '#10b981', marginTop: '12px' }}>
                      <span>TOTAL</span>
                      <span>₹{parseFloat(billData.final_amount).toFixed(2)}</span>
                    </div>
                  </div>
               </div>
               {!billData.is_paid ? (
                 <button onClick={rollbackBill} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                   <RefreshCcw size={18} /> Modify / Rollback Invoice
                 </button>
               ) : (
                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '20px', color: '#166534', fontWeight: 950 }}>TRANSACTION COMPLETED</div>
               )}
            </div>

            <div style={{ width: '380px', padding: '48px', backgroundColor: billData.is_paid ? '#f0fdf4' : '#fafafa', display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '24px', borderRadius: '32px', border: '3px solid', borderColor: billData.is_paid ? '#10b981' : '#f1f5f9', position: 'relative', transition: '0.4s' }}>
                  <span style={{ fontSize: '12px', fontWeight: 950, color: '#1e293b', display: 'block', marginBottom: '16px' }}>SCAN TO PAY VIA UPI</span>
                  <div style={{ padding: '16px', backgroundColor: 'white', display: 'inline-block', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative' }}>
                    <QRCodeCanvas value={upiLink} size={180} level="H" style={{ opacity: billData.is_paid ? 0.05 : 1 }} />
                    {billData.is_paid && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><CheckCircle size={100} /></div>}
                  </div>
                  {!billData.is_paid && (
                    <button onClick={() => confirmPayment()} style={{ width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 1000, cursor: 'pointer', boxShadow: '0 10px 20px rgba(14, 165, 233, 0.3)' }}>RECIEVED PAYMENT</button>
                  )}
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <input placeholder="Mobile Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '14px', border: '2px solid #f1f5f9', fontWeight: 800, fontSize: '15px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={printBill} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: 900, cursor: 'pointer' }}><Printer size={18} /></button>
                    <button onClick={() => sendNotification('sms')} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontWeight: 900, cursor: 'pointer' }}>SMS</button>
                    <button onClick={shareViaWhatsApp} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 900, cursor: 'pointer' }}><MessageCircle size={18} /></button>
                  </div>
                  <button onClick={onClose} style={{ width: '100%', padding: '18px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>FINISH PROCESS</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderModal;
