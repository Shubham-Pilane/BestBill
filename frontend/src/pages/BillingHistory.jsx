import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Receipt, History, IndianRupee, Table, Calendar, Search, Filter, Ban, X, CheckCircle, Phone, Printer, MessageCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const BillingHistory = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [customerPhone, setCustomerPhone] = useState('');

    const handleBillClick = async (billId) => {
        try {
             const res = await api.get(`/bills/${billId}`);
             setSelectedBill(res.data);
        } catch (err) {
             toast.error('Failed to load bill details');
        }
    };

    const printBill = () => {
        if (!selectedBill) return;
        
        const existingFrame = document.getElementById('bill-print-frame');
        if (existingFrame) existingFrame.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'bill-print-frame';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        const hName = selectedBill.hotel_name || user?.hotel_name || 'BESTBILL';
        const hPhone = selectedBill.hotel_phone || '';
        const hAddr = selectedBill.hotel_location || '';
        
        const itemsRows = (selectedBill.items || []).map(i => `
        <tr>
            <td style="padding-right: 2px;">${i.name}</td>
            <td style="text-align: center;">${Math.round(i.price)}</td>
            <td style="text-align: center;">${i.quantity}</td>
            <td style="text-align: right;">${Math.round(i.price * i.quantity)}</td>
        </tr>
        `).join('');

        const upiLinkStr = `upi://pay?pa=${user?.upi_id || ''}&pn=${encodeURIComponent(hName)}&am=${selectedBill?.final_amount || 0}&cu=INR`;
        const qrCanvas = document.getElementById('history-qr-canvas');
        const qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLinkStr)}&margin=0`;

        const pageHtml = `
        <html>
            <head>
            <style>
                @media print {
                @page {
                    margin: 0 !important;
                    size: auto;
                }
                body {
                    width: 100%;
                    margin: 0 !important;
                    padding: 0 !important;
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
                margin: 0 !important; 
                padding: 0 !important; 
                background: #fff;
                }
                .bill-wrapper {
                width: 100%;
                max-width: 56mm;
                margin: 0 !important;
                padding: 0 !important;
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
                    <div class="flex-row"><span>Table:</span> <span>${selectedBill.table_number}</span></div>
                    <div class="flex-row"><span>Bill:</span> <span>#${selectedBill.id}</span></div>
                    <div class="flex-row"><span>Date:</span> <span>${new Date(selectedBill.created_at).toLocaleDateString()} ${new Date(selectedBill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                </div>
                <div class="dashed"></div>

                <table class="items-table" style="font-size: 8.5pt;">
                    <thead>
                    <tr>
                        <th width="42%" style="text-align: left;">Item</th>
                        <th width="20%" style="text-align: right;">Price</th>
                        <th width="13%" style="text-align: center;">Qty</th>
                        <th width="25%" style="text-align: right;">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${itemsRows}
                    </tbody>
                </table>

                <div class="dashed"></div>
                <div style="line-height: 1.2;">
                    <div class="flex-row"><span>Subtotal:</span> <span>${Math.round(selectedBill.subtotal || 0)}</span></div>
                    <div class="flex-row"><span>GST (${selectedBill.gst_percentage || 0}%):</span> <span>${Math.round(selectedBill.gst || 0)}</span></div>
                    ${selectedBill.discount_percentage > 0 ? `<div class="flex-row"><span>Disc (${selectedBill.discount_percentage}%):</span> <span>-${Math.round( (parseFloat(selectedBill.subtotal) + parseFloat(selectedBill.gst)) * (selectedBill.discount_percentage / 100) )}</span></div>` : ''}
                    <div class="dashed"></div>
                    <div class="flex-row" style="font-size: 11pt; margin-top: 2px;">
                    <span>TOTAL:</span>
                    <span>${Math.round(selectedBill.final_amount)}</span>
                    </div>
                </div>
                <div class="dashed"></div>

                <div class="center" style="margin-top: 5px;">
                    <div>Thank You for Dining with Us!</div>
                    <div>Visit Again!</div>
                </div>

                ${!selectedBill.is_paid && user?.upi_id ? `
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

    const shareViaWhatsApp = () => {
        if (!selectedBill) return;
        if (!customerPhone) {
        toast.error('Please enter a phone number first');
        return;
        }
        const subVal = parseFloat(selectedBill.subtotal || 0);
        const taxVal = parseFloat(selectedBill.gst || 0);
        const preVal = subVal + taxVal;
        
        let msg = `*--- ${user?.hotel_name?.toUpperCase() || 'BESTBILL'} RECEIPT ---*\n\n`;
        msg += `Table No: ${selectedBill.table_number}\n`;
        msg += `Bill No: #${selectedBill.id}\n`;
        msg += `Date: ${new Date(selectedBill.created_at).toLocaleDateString()} ${new Date(selectedBill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
        msg += `\n*Items:*\n`;
        (selectedBill.items || []).forEach(i => msg += `• ${i.name} x ${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}\n`);
        msg += `\n*------------------------*\n`;
        msg += `*Subtotal:* ₹${subVal.toFixed(2)}\n`;
        msg += `*GST (${selectedBill.gst_percentage || 0}%):* ₹${taxVal.toFixed(2)}\n`;
        if (selectedBill.discount_percentage > 0) msg += `*Discount (${selectedBill.discount_percentage}%):* -₹${(preVal * selectedBill.discount_percentage / 100).toFixed(2)}\n`;
        msg += `*GRAND TOTAL: ₹${parseFloat(selectedBill.final_amount).toFixed(2)}*\n`;
        msg += `\nThank you! Visit again.\n`;
        
        const cleanPhone = customerPhone.replace(/\D/g, '');
        const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

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
                            <div key={bill.id} onClick={() => handleBillClick(bill.id)} className="billing-card" style={{ cursor: 'pointer', backgroundColor: '#0f172a', borderRadius: '24px', padding: '24px 32px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
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

                                <div className="billing-card-right" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            {selectedBill && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(16px)' }}>
                <div style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '40px', overflow: 'hidden', display: 'flex', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
                    <div style={{ flex: 1, padding: '48px', borderRight: '1px solid #f1f5f9', backgroundColor: selectedBill.is_paid ? '#10b981' : 'white', transition: 'all 0.6s', overflowY: 'auto', position: 'relative' }}>
                        {selectedBill.is_paid && (
                        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '50%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                <CheckCircle size={100} color="#10b981" />
                            </div>
                        </div>
                        )}
                        <div style={{ textAlign: 'center', marginBottom: '24px', opacity: selectedBill.is_paid ? 0.3 : 1 }}>
                        <h1 style={{ margin: 0, fontWeight: 950, fontSize: '28px', color: selectedBill.is_paid ? 'white' : '#1e293b' }}>{(selectedBill.hotel_name || user?.hotel_name || 'BESTBILL').toUpperCase()}</h1>
                        <div style={{ color: selectedBill.is_paid ? 'white' : '#64748b', fontWeight: 800, fontSize: '14px', marginTop: '4px' }}>{selectedBill.hotel_location}</div>
                        </div>
                        
                        <div style={{ borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0', padding: '16px 0', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: '#475569' }}>
                            <span>TABLE NO: {selectedBill.table_number}</span>
                            <span>BILL NO: #{selectedBill.id}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>DATE: {new Date(selectedBill.created_at).toLocaleDateString()} {new Date(selectedBill.created_at).toLocaleTimeString()}</div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 100px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 900, color: '#475569' }}>
                            <span>Item</span><span style={{ textAlign: 'right' }}>Price</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Total</span>
                        </div>
                        {(selectedBill.items || []).map((i, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 100px', fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>
                            <span>{i.name}</span><span style={{ textAlign: 'right' }}>₹{Math.round(i.price)}</span><span style={{ textAlign: 'right' }}>{i.quantity}</span><span style={{ textAlign: 'right' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        </div>

                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800 }}><span>SUBTOTAL</span><span>₹{parseFloat(selectedBill.subtotal || 0).toFixed(2)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800 }}><span>GST</span><span>₹{parseFloat(selectedBill.gst).toFixed(2)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '42px', fontWeight: 1000, color: '#10b981', borderTop: '4px double #e2e8f0', marginTop: '12px', paddingTop: '12px' }}><span>TOTAL</span><span>₹{parseFloat(selectedBill.final_amount).toFixed(2)}</span></div>
                        </div>

                        <div style={{ marginTop: '48px' }}>
                        {selectedBill.is_paid && (
                            <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '24px', color: 'white', fontWeight: 950, fontSize: '20px' }}>SUCCESSFULLY SETTLED</div>
                        )}
                        </div>
                    </div>

                    <div style={{ width: '380px', padding: '48px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '24px', borderRadius: '32px' }}>
                        <QRCodeCanvas id="history-qr-canvas" value={`upi://pay?pa=${user?.upi_id || ''}&pn=${encodeURIComponent(selectedBill.hotel_name || user?.hotel_name || 'BESTBILL')}&am=${selectedBill.final_amount}&cu=INR`} size={180} />
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' }}>
                            <Phone size={18} color="#94a3b8" />
                            <input 
                            placeholder="Customer Mobile No" 
                            value={customerPhone} 
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            style={{ border: 'none', width: '100%', outline: 'none', fontWeight: 800, fontSize: '15px', background: 'white', color: '#1e293b' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={printBill} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' }}><Printer size={18} /></button>
                            <button onClick={shareViaWhatsApp} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}><MessageCircle size={18} /></button>
                        </div>
                        <button onClick={() => setSelectedBill(null)} style={{ width: '100%', padding: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 900, cursor: 'pointer' }}>CLOSE</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default BillingHistory;
