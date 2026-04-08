import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { X, Plus, Minus, Receipt, Send, MessageSquare, MessageCircle, Utensils, Trash2, ChevronRight, IndianRupee, Clock, CheckCircle, Phone, ArrowLeft, RefreshCcw, Wallet, Printer, Search } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import SwapModal from './SwapModal';

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
  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [allTables, setAllTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemsRes, orderRes, tablesRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu/items'),
          table.active_order_id ? api.get(`/tables/${table.id}/order`) : Promise.resolve({ data: { items: [] } }),
          api.get('/tables')
        ]);
        setCategories(catRes.data || []);
        setItems(itemsRes.data || []);
        setOrderItems(orderRes.data.items || []);
        setAllTables(tablesRes.data || []);
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
    
    // Refresh IFRAME
    const existingFrame = document.getElementById('bill-print-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'bill-print-frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const hName = billData.hotel_name || user?.hotel_name || 'BESTBILL';
    const hPhone = billData.hotel_phone || '';
    const hAddr = billData.hotel_location || '';
    
    const itemsRows = (billData.items || []).map(i => `
      <tr>
        <td style="padding-right: 2px;">${i.name}</td>
        <td style="text-align: center;">${Math.round(i.price)}</td>
        <td style="text-align: center;">${i.quantity}</td>
        <td style="text-align: right;">${Math.round(i.price * i.quantity)}</td>
      </tr>
    `).join('');

    const upiLinkStr = `upi://pay?pa=${user?.upi_id || ''}&pn=${encodeURIComponent(hName)}&am=${billData?.final_amount || 0}&cu=INR`;
    const qrCanvas = document.getElementById('upi-qr-canvas');
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLinkStr)}&margin=0`;

    const pageHtml = `
      <html>
        <head>
          <style>
            @media print {
              @page {
                margin: 0;
                size: 58mm auto;
              }
              body {
                width: 58mm;
                margin: 0;
                padding: 0;
              }
            }
            * {
              color: #000 !important;
              font-family: 'Courier New', Courier, monospace !important;
              font-weight: bold !important;
              font-size: 8.5pt;
              box-sizing: border-box;
            }
            body { 
              margin: 0; 
              padding: 0; 
              background: #fff;
            }
            .bill-wrapper {
              width: 46mm;
              margin: 0 auto;
              padding: 0;
              overflow: hidden;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .dashed { border-top: 1px dashed #000; margin: 4px 0; }
            .header-large { font-size: 11pt; margin: 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 4px 0; table-layout: fixed; }
            .items-table th { border-bottom: 1px dashed #000; padding: 2px 0; }
            .items-table td { padding: 2px 0; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
            .flex-row { display: flex; justify-content: space-between; align-items: flex-start; margin: 1px 0; gap: 2px; }
            .flex-row span:first-child { flex: 1; text-align: left; word-break: break-word; }
            .flex-row span:last-child { text-align: right; }
            .qr-container { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 10px; margin-bottom: 5px; }
            .qr-container img { width: 70px; height: 70px; margin-bottom: 2px; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.parent.document.getElementById('bill-print-frame').remove(); }, 1000)">
          <div class="bill-wrapper">
            <div class="center">
              <div class="header-large">${hName.toUpperCase()}</div>
              ${hAddr ? `<div>${hAddr}</div>` : ''}
              ${hPhone ? `<div>Phone: ${hPhone}</div>` : ''}
            </div>
            
            <div class="dashed"></div>
            <div class="center" style="font-size: 10pt; margin: 2px 0;">INVOICE</div>
            <div style="margin: 2px 0;">
              <div class="flex-row"><span>Table:</span> <span>${table.table_numberByFloor || table.table_number}</span></div>
              <div class="flex-row"><span>Bill:</span> <span>#${billData.id}</span></div>
              <div class="flex-row"><span>Date:</span> <span>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
            <div class="dashed"></div>

            <table class="items-table" style="font-size: 8.5pt;">
              <thead>
                <tr>
                  <th width="40%" style="text-align: left;">Item</th>
                  <th width="20%" style="text-align: center;">Price</th>
                  <th width="15%" style="text-align: center;">Qty</th>
                  <th width="25%" style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

          <div class="dashed"></div>
          <div style="line-height: 1.2;">
            <div class="flex-row"><span>Subtotal:</span> <span>${Math.round(billData.subtotal || 0)}</span></div>
            <div class="flex-row"><span>GST (${billData.gst_percentage}%):</span> <span>${Math.round(billData.gst || 0)}</span></div>
            ${billData.discount_percentage > 0 ? `<div class="flex-row"><span>Disc (${billData.discount_percentage}%):</span> <span>-${Math.round( (parseFloat(billData.subtotal) + parseFloat(billData.gst)) * (billData.discount_percentage / 100) )}</span></div>` : ''}
            <div class="dashed"></div>
            <div class="flex-row" style="font-size: 11pt; margin-top: 2px;">
              <span>TOTAL:</span>
              <span>${Math.round(billData.final_amount)}</span>
            </div>
          </div>
          <div class="dashed"></div>

          <div class="center" style="margin-top: 5px;">
            <div>Thank You for Dining with Us!</div>
            <div>Visit Again!</div>
          </div>

          ${!billData.is_paid && user?.upi_id ? `
          <div class="qr-container">
            <img src="${qrDataUrl}" />
            <div style="font-size: 8pt;">Scan to Pay</div>
          </div>
          ` : ''}
          <div style="height: 15mm;"></div>
          </div>
        </body>
      </html>
    `;

    doc.write(pageHtml);
    doc.close();
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
       toast.success('Transaction Completed');
       
       // Automatically return to dashboard after short delay
       setTimeout(() => {
          onClose(); // Triggers the reveal of the table dashboard
       }, 1500);
    } catch (err) {
       toast.error('Payment verification failed');
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
      toast.error(err.response?.data?.message || 'Transmission failed');
    }
  };

  const handleSwapTable = async (targetTableId) => {
    try {
      await api.post(`/tables/${table.id}/swap`, { targetTableId });
      toast.success('Table migration successful');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Swap protocol failed');
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const matched = items.filter(i => 
        i.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  const shareViaWhatsApp = () => {
    if (!customerPhone) {
      toast.error('Please enter a phone number first');
      return;
    }
    const subVal = parseFloat(billData.subtotal);
    const taxVal = parseFloat(billData.gst);
    const preVal = subVal + taxVal;
    
    let msg = `*--- ${user?.hotel_name?.toUpperCase() || 'BESTBILL'} RECEIPT ---*\n\n`;
    msg += `Table No: ${table.table_numberByFloor || table.table_number}\n`;
    msg += `Bill No: #${billData.id}\n`;
    msg += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    msg += `\n*Items:*\n`;
    (billData.items || []).forEach(i => msg += `• ${i.name} x ${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}\n`);
    msg += `\n*------------------------*\n`;
    msg += `*Subtotal:* ₹${subVal.toFixed(2)}\n`;
    msg += `*GST (${billData.gst_percentage}%):* ₹${taxVal.toFixed(2)}\n`;
    if (billData.discount_percentage > 0) msg += `*Discount (${billData.discount_percentage}%):* -₹${(preVal * billData.discount_percentage / 100).toFixed(2)}\n`;
    msg += `*GRAND TOTAL: ₹${parseFloat(billData.final_amount).toFixed(2)}*\n`;
    msg += `\nThank you! Visit again.\n`;
    
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const upiId = user?.upi_id || '';
  const hname = user?.hotel_name || 'BestBill';
  const amountVal = billData?.final_amount || 0;
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(hname)}&am=${amountVal}&cu=INR`;

  if (loading) return null;

  return (
    <div className="order-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(32px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }}>
      <div className="order-modal-container" style={{ width: '100%', maxWidth: '1440px', height: '90vh', backgroundColor: '#0f172a', borderRadius: '40px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Header */}
        <div className="order-modal-header" style={{ padding: '32px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: table.active_order_id ? '#f43f5e' : '#10b981', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '28px' }}>
              {table.table_number}
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Position Summary</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>BestBill POS</span>
                 {table.active_order_id && !showBill && (
                    <button onClick={() => setSwapModalOpen(true)} style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', border: '1px solid #0ea5e9', color: '#0ea5e9', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>SWAP TABLE</button>
                 )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1e293b', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
        </div>

        <div className="order-modal-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Menu */}
          <div className="order-modal-menu" style={{ flex: 1, borderRight: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 48px', display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#020617', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="category-bar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', flex: 1 }}>
                <button onClick={() => setSelectedCategory('all')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', backgroundColor: selectedCategory === 'all' ? '#0ea5e9' : '#1e293b', color: 'white', fontSize: '12px', whiteSpace: 'nowrap' }}>ALL ITEMS</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', backgroundColor: selectedCategory === cat.id ? '#0ea5e9' : '#1e293b', color: 'white', fontSize: '12px', whiteSpace: 'nowrap' }}>{cat.name.toUpperCase()}</button>
                ))}
              </div>

              <div className="search-bar-container" style={{ position: 'relative', width: '300px' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <Search size={18} />
                </div>
                <input 
                   type="text" 
                   placeholder="Search Menu..."
                   value={searchQuery}
                   onChange={handleSearchChange}
                   style={{ width: '100%', padding: '14px 44px 14px 48px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', fontWeight: 700, outline: 'none', fontSize: '14px' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <X size={16} />
                  </button>
                )}
                {suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#0f172a', borderRadius: '16px', marginTop: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 100, border: '1px solid #1e293b', overflow: 'hidden' }}>
                    {suggestions.map(s => (
                      <div key={s.id} onClick={() => { addToOrder(s); setSearchQuery(''); setSuggestions([]); }} style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #1e293b', color: 'white', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Plus size={14} color="#0ea5e9" />
                          <span>{s.name}</span>
                        </div>
                        <span style={{ color: '#10b981' }}>₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', alignContent: 'start' }}>
              {items.filter(i => 
                (selectedCategory === 'all' || i.category_id === selectedCategory) &&
                (i.name.toLowerCase().includes(searchQuery.toLowerCase()))
              ).map(item => (
                <div key={item.id} onClick={() => addToOrder(item)} style={{ backgroundColor: '#020617', border: '2px solid #1e293b', padding: '20px', borderRadius: '24px', cursor: 'pointer', position: 'relative', transition: '0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 950, color: 'white', marginBottom: '8px', fontSize: '15px' }}>
                    <span>{item.name}</span>
                    <span style={{ color: '#10b981' }}>₹{item.price}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 40px 0', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description || 'Standard culinary selection'}</p>
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Plus size={16} strokeWidth={4} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="order-modal-cart" style={{ width: '420px', backgroundColor: '#020617', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Receipt size={20} color="#0ea5e9" />
               <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Active Selection</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#0f172a', borderRadius: '20px' }}>
                  <div><div style={{ color: 'white', fontWeight: 900 }}>{item.name}</div><div style={{ color: '#10b981', fontSize: '13px' }}>₹{item.price * item.quantity}</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ cursor: 'pointer', border: 'none', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white' }}><Minus size={14} /></button>
                    <span style={{ color: 'white', fontWeight: 900 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ cursor: 'pointer', border: 'none', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white' }}><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '32px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }}>
              <div style={{ marginBottom: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '11px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   <span>Loyalty Discount (%)</span>
                   <input 
                      type="number" 
                      value={discount} 
                      onChange={e => setDiscount(Math.max(0, Math.min(100, e.target.value)))} 
                      style={{ width: '50px', background: 'none', border: 'none', borderBottom: '2px solid #0ea5e9', color: 'white', textAlign: 'center', fontWeight: 900, outline: 'none' }} 
                   />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                   <span style={{ fontSize: '32px', fontWeight: 1000 }}>Final Due</span>
                   <span style={{ color: '#10b981', fontSize: '32px', fontWeight: 1000 }}>₹{((orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 1.05) * (1 - discount/100)).toFixed(2)}</span>
                 </div>
              </div>
              <button disabled={orderItems.length === 0} onClick={generateBill} style={{ width: '100%', padding: '20px', borderRadius: '20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', fontWeight: 1000, fontSize: '18px', cursor: 'pointer', scale: orderItems.length === 0 ? '1' : '1.02', transition: '0.2s', opacity: orderItems.length === 0 ? 0.3 : 1 }}>SETTLE TRANSACTION</button>
            </div>
          </div>
        </div>
      </div>

      {showBill && billData && (
        <div className="bill-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(16px)' }}>
          <div className="bill-container" style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '40px', overflow: 'hidden', display: 'flex', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
             <div style={{ flex: 1, padding: '48px', borderRight: '1px solid #f1f5f9', backgroundColor: billData.is_paid ? '#10b981' : 'white', transition: 'all 0.6s', overflowY: 'auto', position: 'relative' }}>
                {billData.is_paid && (
                   <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '50%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                         <CheckCircle size={100} color="#10b981" />
                      </div>
                   </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: '24px', opacity: billData.is_paid ? 0.3 : 1 }}>
                   <h1 style={{ margin: 0, fontWeight: 950, fontSize: '28px', color: billData.is_paid ? 'white' : '#1e293b' }}>{(billData.hotel_name || user?.hotel_name || 'BESTBILL').toUpperCase()}</h1>
                   <div style={{ color: billData.is_paid ? 'white' : '#64748b', fontWeight: 800, fontSize: '14px', marginTop: '4px' }}>{billData.hotel_location}</div>
                </div>
                
                <div style={{ borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0', padding: '16px 0', marginBottom: '24px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: '#475569' }}>
                      <span>TABLE NO: {table.table_numberByFloor || table.table_number}</span>
                      <span>BILL NO: #{billData.id}</span>
                   </div>
                   <div style={{ fontSize: '13px', color: '#94a3b8' }}>DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 100px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 900, color: '#475569' }}>
                      <span>Item</span><span style={{ textAlign: 'right' }}>Price</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Total</span>
                   </div>
                   {billData.items.map((i, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 100px', fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>
                        <span>{i.name}</span><span style={{ textAlign: 'right' }}>₹{Math.round(i.price)}</span><span style={{ textAlign: 'right' }}>{i.quantity}</span><span style={{ textAlign: 'right' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                   ))}
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800 }}><span>SUBTOTAL</span><span>₹{parseFloat(billData.subtotal).toFixed(2)}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800 }}><span>GST</span><span>₹{parseFloat(billData.gst).toFixed(2)}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '42px', fontWeight: 1000, color: '#10b981', borderTop: '4px double #e2e8f0', marginTop: '12px', paddingTop: '12px' }}><span>TOTAL</span><span>₹{parseFloat(billData.final_amount).toFixed(2)}</span></div>
                </div>

                <div style={{ marginTop: '48px' }}>
                   {!billData.is_paid ? (
                     <button onClick={rollbackBill} style={{ width: '100%', padding: '20px', borderRadius: '24px', border: '2px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 900, cursor: 'pointer' }}>MODIFY INVOICE</button>
                   ) : (
                     <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '24px', color: 'white', fontWeight: 950, fontSize: '20px' }}>SUCCESSFULLY SETTLED</div>
                   )}
                </div>
             </div>

             <div style={{ width: '380px', padding: '48px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '24px', borderRadius: '32px' }}>
                   <QRCodeCanvas id="upi-qr-canvas" value={upiLink} size={180} />
                   {!billData.is_paid && <button onClick={() => confirmPayment()} style={{ width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 1000 }}>MARK PAID</button>}
                </div>
                 <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' }}>
                    <Phone size={18} color="#94a3b8" />
                    <input 
                       placeholder="Enter Mobile No" 
                       value={customerPhone} 
                       onChange={(e) => setCustomerPhone(e.target.value)}
                       style={{ border: 'none', width: '100%', outline: 'none', fontWeight: 800, fontSize: '15px', background: 'white', color: '#1e293b' }}
                    />
                 </div>

                 <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={printBill} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' }}><Printer size={18} /></button>
                    <button onClick={shareViaWhatsApp} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}><MessageCircle size={18} /></button>
                 </div>
                 <button onClick={onClose} style={{ width: '100%', padding: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 900, cursor: 'pointer' }}>CLOSE</button>
             </div>
          </div>
        </div>
      )}
      <SwapModal isOpen={isSwapModalOpen} onClose={() => setSwapModalOpen(false)} tables={allTables} onSwap={handleSwapTable} currentTable={table} />
    </div>
  );
};

export default OrderModal;
