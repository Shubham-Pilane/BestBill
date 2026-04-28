import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Store, Plus, Trash2, Mail, User, ShieldCheck, Hotel, Search, ListFilter, IndianRupee, Table, X, ChevronRight, Activity, Receipt, ListOrdered, BarChart3, Phone, MapPin, Image as ImageIcon, Upload, Power } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHotelData, setSelectedHotelData] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [subUpdateModal, setSubUpdateModal] = useState({ isOpen: false, amount: '', validityDate: '' });
  const themeColor = '#10b981';
  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://bestbill-backend-174132084209.us-central1.run.app';
  
  const [formData, setFormData] = useState({
    hotelName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    subscriptionAmount: '',
    subscriptionValidity: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [masterItems, setMasterItems] = useState([]);
  const [hotelCategories, setHotelCategories] = useState([]);
  const [showAttachModal, setShowAttachModal] = useState({ isOpen: false, item: null });
  const [attachData, setAttachData] = useState({ price: '', category_id: '', isCreatingCategory: false, newCategoryName: '' });
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterItem, setNewMasterItem] = useState({ name: '', category_name: '', description: '' });
  const [searchMasterQuery, setSearchMasterQuery] = useState('');

  const fetchHotels = async () => {
    try {
      const res = await api.get('/admin/hotels');
      setHotels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load ecosystem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchMasterItems();
  }, []);

  const fetchMasterItems = async () => {
    try {
      const res = await api.get('/master-menu');
      setMasterItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openHotelInspector = async (hotelId) => {
    const loadingToast = toast.loading('Synchronizing hotel data...');
    try {
      const [statsRes, catRes] = await Promise.all([
        api.get(`/admin/hotels/${hotelId}/stats`),
        api.get(`/admin/hotels/${hotelId}/categories`)
      ]);
      
      setSelectedHotelData(statsRes.data);
      setHotelCategories(catRes.data || []);
      toast.dismiss(loadingToast);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const failedUrl = err.config?.url || 'unknown';
      toast.error(`Sync failed (${failedUrl}): ${msg}`, { id: loadingToast });
      console.error('Inspector Error:', err);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Onboarding hotel account...');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (logoFile) data.append('logo', logoFile);

      await api.post('/admin/onboard', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`${formData.hotelName} onboarded successfully!`, { id: loadingToast });
      setShowAddModal(false);
      setFormData({ hotelName: '', ownerName: '', email: '', password: '', phone: '', location: '', subscriptionAmount: '', subscriptionValidity: '' });
      setLogoFile(null);
      fetchHotels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Onboarding failed', { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/hotels/${confirmModal.id}`);
      toast.success('Hotel and Owner account purged');
      setConfirmModal({ isOpen: false, id: null });
      fetchHotels();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const toggleService = async (hotelId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.put(`/admin/hotels/${hotelId}/toggle-service`);
      toast.success(res.data.message);
      fetchHotels();
      // If inspector is open for this hotel, refresh it
      if (selectedHotelData && selectedHotelData.hotel.id === hotelId) {
        openHotelInspector(hotelId);
      }
    } catch (err) {
      toast.error('Failed to toggle service');
    }
  };

  const updateSubscription = async (e) => {
    e.preventDefault();
    if (!subUpdateModal.amount || !subUpdateModal.validityDate) return toast.error('Please enter valid data');

    try {
      await api.put(`/admin/hotels/${selectedHotelData.hotel.id}/subscription`, {
        amount: subUpdateModal.amount,
        validityDate: subUpdateModal.validityDate
      });
      toast.success('Subscription plan updated successfully!');
      setSubUpdateModal({ isOpen: false, amount: '', validityDate: '' });
      openHotelInspector(selectedHotelData.hotel.id);
    } catch (err) {
      toast.error('Failed to update subscription plan');
    }
  };

  const handleAttachItem = async (e) => {
    e.preventDefault();
    if (!attachData.price) return toast.error('Please enter a price');
    if (!attachData.isCreatingCategory && !attachData.category_id) return toast.error('Please select a category');
    if (attachData.isCreatingCategory && !attachData.newCategoryName) return toast.error('Please enter a category name');

    const l = toast.loading('Linking item to hotel menu...');
    try {
      let finalCategoryId = attachData.category_id;

      // Create category if needed
      if (attachData.isCreatingCategory) {
        const catRes = await api.post(`/admin/hotels/${selectedHotelData.hotel.id}/categories`, {
          name: attachData.newCategoryName
        });
        finalCategoryId = catRes.data.id;
      }

      await api.post('/master-menu/attach', {
        hotel_id: selectedHotelData.hotel.id,
        master_id: showAttachModal.item.id,
        price: attachData.price,
        category_id: finalCategoryId
      });

      toast.success('Item linked successfully', { id: l });
      setShowAttachModal({ isOpen: false, item: null });
      setAttachData({ price: '', category_id: '', isCreatingCategory: false, newCategoryName: '' });
      openHotelInspector(selectedHotelData.hotel.id); // Refresh hotel data
    } catch (err) {
      toast.error('Linking failed', { id: l });
    }
  };

  const handleAddMasterItem = async (e) => {
    e.preventDefault();
    const l = toast.loading('Registering global menu item...');
    try {
      await api.post('/master-menu', newMasterItem);
      toast.success('Global item registered', { id: l });
      setShowAddMasterModal(false);
      setNewMasterItem({ name: '', category_name: '', description: '' });
      fetchMasterItems();
    } catch (err) {
      toast.error('Registration failed', { id: l });
    }
  };

  if (loading) return null;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: '100%', maxWidth: '1440px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <ShieldCheck style={{ color: themeColor }} size={28} />
            Ecosystem Authority
          </h2>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', margin: 0 }}>Onboard hotels and audit their performance data.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: themeColor, color: 'white', padding: '14px 28px', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: `0 8px 16px rgba(16, 185, 129, 0.2)` }}
        >
          <Plus size={20} /> Onboard New Hotel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '32px' }}>
        {hotels.map(h => (
          <div 
            key={h.id} 
            onClick={() => openHotelInspector(h.id)}
            style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px', border: '2px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: `${themeColor}20`, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {h.logo_url ? <img src={h.logo_url.startsWith('http') ? h.logo_url : `${serverUrl}${h.logo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Hotel style={{ color: themeColor }} size={32} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => toggleService(h.id, e)}
                    title={h.is_service_stopped ? 'Resume Service' : 'Stop Service'}
                    style={{ 
                      color: h.is_service_stopped ? '#f43f5e' : '#10b981', 
                      background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '12px', 
                      backgroundColor: h.is_service_stopped ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)' 
                    }}>
                    <Power size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: h.id }); }}
                    style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(244, 63, 94, 0.05)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>

             <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: '0 0 8px 0' }}>{h.name}</h3>
             <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <MapPin size={14} /> {h.location || 'Location Not Set'}
             </p>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                   <User size={16} /> {h.owner_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '14px', fontWeight: 700 }}>
                   <Phone size={16} /> {h.phone || 'No Contact'}
                </div>
             </div>

             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColor, fontSize: '14px', fontWeight: 900 }}>
                      <Table size={16} /> {h.total_tables} Tables
                   </div>
                   <span style={{ 
                     fontSize: '10px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em',
                     padding: '4px 10px', borderRadius: '8px',
                     color: h.is_service_stopped ? '#f43f5e' : '#10b981',
                     backgroundColor: h.is_service_stopped ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)'
                   }}>
                     {h.is_service_stopped ? 'SERVICE OFF' : 'ACTIVE'}
                   </span>
                </div>
                <ChevronRight size={20} style={{ color: '#1e293b' }} />
             </div>
          </div>
        ))}
      </div>

      {/* Hotel Detail Inspector */}
      {selectedHotelData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.98)', backdropFilter: 'blur(32px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 7000, padding: '40px', overflowY: 'auto' }}>
           <div style={{ width: '100%', maxWidth: '1200px', backgroundColor: '#0f172a', borderRadius: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 100px 200px -40px rgba(0,0,0,1)', marginBottom: '40px' }}>
              
              <div style={{ padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: `linear-gradient(180deg, ${themeColor}10 0%, transparent 100%)`, borderRadius: '48px 48px 0 0' }}>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                     <div 
                        onClick={() => document.getElementById('inspect-logo-upload').click()}
                        style={{ width: '100px', height: '100px', backgroundColor: themeColor, borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: `3px solid ${themeColor}` }}
                     >
                        {selectedHotelData.hotel.logo_url ? <img src={selectedHotelData.hotel.logo_url.startsWith('http') ? selectedHotelData.hotel.logo_url : `${serverUrl}${selectedHotelData.hotel.logo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Activity size={48} />}
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                           <Upload size={24} />
                        </div>
                     </div>
                     <input id="inspect-logo-upload" type="file" accept="image/*" style={{ display: 'none' }} 
                        onChange={async (e) => {
                           if (!e.target.files[0]) return;
                           const formData = new FormData();
                           formData.append('logo', e.target.files[0]);
                           const l = toast.loading('Syncing brand visuals...');
                           try {
                              const res = await api.put(`/admin/hotels/${selectedHotelData.hotel.id}/logo`, formData, {
                                 headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              setSelectedHotelData({ ...selectedHotelData, hotel: { ...selectedHotelData.hotel, logo_url: res.data.logo_url } });
                              fetchHotels();
                              toast.success('Visuals updated', { id: l });
                           } catch (err) {
                              toast.error('Sync failed', { id: l });
                           }
                        }} 
                     />
                     <div>
                        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>{selectedHotelData.hotel.name}</h2>
                        <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '14px', fontWeight: 700 }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> {selectedHotelData.hotel.phone || 'N/A'}</span>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                           {selectedHotelData.hotel.logo_url && (
                             <button 
                                onClick={async () => {
                                   const l = toast.loading('Removing brand assets...');
                                   try {
                                      await api.put(`/admin/hotels/${selectedHotelData.hotel.id}/logo`, { deleteExisting: 'true' });
                                      setSelectedHotelData({ ...selectedHotelData, hotel: { ...selectedHotelData.hotel, logo_url: null } });
                                      fetchHotels();
                                      toast.success('Brand assets removed', { id: l });
                                   } catch (err) {
                                      toast.error('Removal failed', { id: l });
                                   }
                                }}
                                style={{ padding: '6px 12px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '8px', fontSize: '12px', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                             >
                                Remove Logo
                             </button>
                           )}
                           <span style={{ padding: '6px 12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>
                              Valid Until: {selectedHotelData.hotel.subscription_valid_until ? new Date(selectedHotelData.hotel.subscription_valid_until).toLocaleDateString() : 'N/A'}
                           </span>
                           {selectedHotelData.hotel.subscription_valid_until && (() => { const d = Math.ceil((new Date(selectedHotelData.hotel.subscription_valid_until) - new Date()) / (1000*60*60*24)); return (
                              <span style={{ padding: '6px 12px', backgroundColor: d > 5 ? 'rgba(14,165,233,0.1)' : 'rgba(244,63,94,0.15)', color: d > 5 ? '#0ea5e9' : '#f43f5e', borderRadius: '8px', fontSize: '12px', fontWeight: 900 }}>
                                 {d > 0 ? `${d} Days Left` : 'EXPIRED'}
                              </span>
                           ); })()}
                           <button onClick={() => setSubUpdateModal({ isOpen: true, amount: selectedHotelData.hotel.subscription_amount || '', validityDate: selectedHotelData.hotel.subscription_valid_until ? new Date(selectedHotelData.hotel.subscription_valid_until).toISOString().split('T')[0] : '' })} style={{ padding: '6px 12px', backgroundColor: '#1e293b', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                              Renew / Change Plan
                           </button>
                           <button
                              onClick={() => toggleService(selectedHotelData.hotel.id)}
                              style={{ 
                                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, border: 'none', cursor: 'pointer',
                                backgroundColor: selectedHotelData.hotel.is_service_stopped ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                                color: selectedHotelData.hotel.is_service_stopped ? '#f43f5e' : '#10b981',
                                display: 'flex', alignItems: 'center', gap: '6px'
                              }}
                           >
                              <Power size={14} />
                              {selectedHotelData.hotel.is_service_stopped ? 'SERVICE STOPPED' : 'SERVICE ACTIVE'}
                           </button>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedHotelData(null)} style={{ width: '56px', height: '56px', borderRadius: '20px', backgroundColor: '#1e293b', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <X size={28} />
                  </button>
              </div>

              {/* Inspector Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', padding: '0 48px 48px' }}>
                 <div style={{ backgroundColor: '#020617', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '11px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Today's Revenue (Set to zero after 24h)
                       </span>
                       <h4 style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', margin: '8px 0 0 0' }}>
                          ₹{(selectedHotelData.bills || [])
                             .filter(b => new Date(b.created_at).toDateString() === new Date().toDateString())
                             .reduce((acc, b) => acc + parseFloat(b.final_amount || 0), 0).toFixed(2)}
                       </h4>
                       
                       {/* Lifetime Revenue Toggle Option */}
                       <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                          <button 
                             onClick={() => {
                                const el = document.getElementById('lifetime-rev');
                                el.style.display = el.style.display === 'none' ? 'block' : 'none';
                             }}
                             style={{ background: 'none', border: 'none', color: themeColor, fontSize: '10px', fontWeight: 900, cursor: 'pointer', padding: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                          >
                             View Total Lifetime Revenue
                          </button>
                          <div id="lifetime-rev" style={{ display: 'none', marginTop: '8px' }}>
                             <span style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>₹{selectedHotelData.financials.total_revenue.toFixed(2)}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div style={{ backgroundColor: '#020617', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tax Collected (GST)</span>
                    <h4 style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', margin: '8px 0 0 0' }}>₹{selectedHotelData.financials.total_gst.toFixed(2)}</h4>
                 </div>
                 <div style={{ backgroundColor: '#020617', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recipes</span>
                    <h4 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: '8px 0 0 0' }}>{selectedHotelData.menu.length} Items</h4>
                 </div>
                 <div style={{ backgroundColor: '#020617', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inventory</span>
                    <h4 style={{ fontSize: '24px', fontWeight: 900, color: '#0ea5e9', margin: '8px 0 0 0' }}>{selectedHotelData.tables.length} Tables</h4>
                 </div>
              </div>

              {/* Detail Tabs */}
               <div style={{ padding: '0 48px', display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                 <button onClick={() => setActiveTab('menu')} style={{ padding: '0 8px 24px', background: 'none', border: 'none', color: activeTab === 'menu' ? themeColor : '#64748b', fontSize: '14px', fontWeight: 800, cursor: 'pointer', position: 'relative' }}>MENU INVENTORY {activeTab === 'menu' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: themeColor, borderRadius: '3px 3px 0 0' }}></div>}</button>
                 <button onClick={() => setActiveTab('master')} style={{ padding: '0 8px 24px', background: 'none', border: 'none', color: activeTab === 'master' ? themeColor : '#64748b', fontSize: '14px', fontWeight: 800, cursor: 'pointer', position: 'relative' }}>MASTER CATALOG {activeTab === 'master' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: themeColor, borderRadius: '3px 3px 0 0' }}></div>}</button>
                 <button onClick={() => setActiveTab('history')} style={{ padding: '0 8px 24px', background: 'none', border: 'none', color: activeTab === 'history' ? themeColor : '#64748b', fontSize: '14px', fontWeight: 800, cursor: 'pointer', position: 'relative' }}>BILLING HISTORY {activeTab === 'history' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: themeColor, borderRadius: '3px 3px 0 0' }}></div>}</button>
              </div>

              <div style={{ padding: '48px', minHeight: '400px' }}>
                  {activeTab === 'menu' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                       {selectedHotelData.menu.map(item => (
                         <div key={item.id} style={{ backgroundColor: '#020617', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.category_name}</span>
                            <h5 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: '8px 0' }}>{item.name}</h5>
                            <span style={{ fontWeight: 950, color: '#10b981' }}>₹{item.price}</span>
                         </div>
                       ))}
                    </div>
                  ) : activeTab === 'master' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
                          <div>
                             <h4 style={{ color: 'white', fontWeight: 800, margin: 0 }}>Global Master Catalog</h4>
                             <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Select items to link to {selectedHotelData.hotel.name}</p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                             <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                               <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                               <input 
                                 value={searchMasterQuery}
                                 onChange={e => setSearchMasterQuery(e.target.value)}
                                 placeholder="Search items or categories..."
                                 style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontSize: '13px', fontWeight: 600 }}
                               />
                             </div>

                             <button 
                                onClick={() => setShowAddMasterModal(true)}
                                style={{ backgroundColor: `${themeColor}20`, color: themeColor, padding: '12px 20px', borderRadius: '14px', border: `1px solid ${themeColor}`, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                             >
                                <Plus size={18} /> Add New
                             </button>
                          </div>
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                          {masterItems.filter(item => item.name.toLowerCase().includes(searchMasterQuery.toLowerCase()) || item.category_name.toLowerCase().includes(searchMasterQuery.toLowerCase())).map(item => {
                             const isLinked = selectedHotelData.menu.some(m => m.master_id === item.id);
                             return (
                               <div key={item.id} style={{ backgroundColor: '#020617', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                     <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>{item.category_name}</span>
                                     <h5 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: '4px 0' }}>{item.name}</h5>
                                  </div>
                                  <button 
                                     disabled={isLinked}
                                     onClick={() => {
                                       const existingCat = hotelCategories.find(c => c.name.toLowerCase() === item.category_name.toLowerCase());
                                       setShowAttachModal({ isOpen: true, item });
                                       setAttachData({
                                         ...attachData,
                                         category_id: existingCat ? existingCat.id : '',
                                         isCreatingCategory: !existingCat,
                                         newCategoryName: !existingCat ? item.category_name : ''
                                       });
                                     }}
                                     style={{ 
                                       padding: '8px 16px', 
                                       borderRadius: '12px', 
                                       fontSize: '12px', 
                                       fontWeight: 900, 
                                       border: 'none', 
                                       cursor: isLinked ? 'default' : 'pointer',
                                       backgroundColor: isLinked ? 'rgba(255,255,255,0.05)' : themeColor,
                                       color: isLinked ? '#475569' : 'white'
                                     }}
                                  >
                                     {isLinked ? 'LINKED' : 'LINK ITEM'}
                                  </button>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       {selectedHotelData.bills.map(bill => (
                         <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', backgroundColor: '#020617', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                               <Receipt size={24} style={{ color: themeColor }} />
                               <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ color: 'white', fontWeight: 800 }}>Bill #{bill.id} — Table {bill.table_number}</span>
                                  <span style={{ color: '#475569', fontSize: '12px' }}>{new Date(bill.created_at).toLocaleString()}</span>
                               </div>
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 1000, color: '#10b981' }}>₹{bill.final_amount}</span>
                         </div>
                       ))}
                    </div>
                  )}
              </div>
           </div>
        </div>
      )}

      {/* Expanded Onboarding Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000, padding: '24px' }}>
           <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#0f172a', borderRadius: '48px', padding: '56px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 50px 100px rgba(0,0,0,0.8)', overflowY: 'auto', maxHeight: '90vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                 <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: 0 }}>Onboard New Hotel</h2>
                 <button onClick={() => setShowAddModal(false)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
              </div>

              <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Hotel Name</label>
                        <input autoFocus required value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Contact Number</label>
                        <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Street Location / Address</label>
                    <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Subscription Fee (₹)</label>
                        <input type="number" required value={formData.subscriptionAmount} onChange={e => setFormData({...formData, subscriptionAmount: e.target.value})} placeholder="e.g. 1500" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #0ea5e9', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Initial Validity (Months)</label>
                        <input type="number" required value={formData.subscriptionValidity} onChange={e => setFormData({...formData, subscriptionValidity: e.target.value})} placeholder="e.g. 1" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #0ea5e9', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Brand Logo (Attachment)</label>
                    <div 
                      onClick={() => document.getElementById('logo-upload').click()}
                      style={{ width: '100%', padding: '32px', borderRadius: '24px', border: '2px dashed #1e293b', backgroundColor: '#020617', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                       {logoFile ? (
                         <div style={{ color: themeColor, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ImageIcon size={20} /> Attachment: {logoFile.name}
                         </div>
                       ) : (
                         <>
                            <Upload size={32} />
                            <span style={{ fontWeight: 800, fontSize: '13px' }}>Click to Browse Files</span>
                         </>
                       )}
                    </div>
                    <input id="logo-upload" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} style={{ display: 'none' }} />
                 </div>

                 <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Login ID (Email)</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Proprietor Name</label>
                        <input required value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Deployment Passcode</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                 </div>

                 <button type="submit" style={{ width: '100%', backgroundColor: themeColor, color: 'white', padding: '18px', borderRadius: '20px', fontSize: '16px', fontWeight: 900, border: 'none', cursor: 'pointer' }}>
                    Deploy Hotel Account
                 </button>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Purge Hotel Ecosystem?"
        message="This action will permanently delete the hotel profile and proprietor account. This cannot be reversed."
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />

      {/* Subscription Update Modal */}
      {subUpdateModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8000, padding: '24px' }}>
           <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#0f172a', borderRadius: '40px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Renew Subscription</h3>
                 <button onClick={() => setSubUpdateModal({ isOpen: false, amount: '', validityDate: '' })} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}><X size={28} /></button>
              </div>

              <form onSubmit={updateSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>New Subscription Amount (₹)</label>
                    <input type="number" required value={subUpdateModal.amount} onChange={e => setSubUpdateModal({...subUpdateModal, amount: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} placeholder="e.g. 1500" />
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Extension Validity (Until Date)</label>
                    <input type="date" required value={subUpdateModal.validityDate} onChange={e => setSubUpdateModal({...subUpdateModal, validityDate: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} />
                 </div>

                 <button type="submit" style={{ width: '100%', backgroundColor: themeColor, color: 'white', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '12px' }}>
                    Deploy Plan Changes
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>

      {/* Attach Master Item Modal */}
      {showAttachModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '24px' }}>
           <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#0f172a', borderRadius: '40px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Link to {selectedHotelData.hotel.name}</h3>
                 <button onClick={() => setShowAttachModal({ isOpen: false, item: null })} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}><X size={28} /></button>
              </div>

              <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#020617', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>{showAttachModal.item.category_name}</span>
                 <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '4px 0' }}>{showAttachModal.item.name}</h4>
              </div>

              <form onSubmit={handleAttachItem} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Hotel Specific Price (₹)</label>
                    <input type="number" required value={attachData.price} onChange={e => setAttachData({...attachData, price: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} placeholder="Enter price for this hotel" />
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Select Category</label>
                      <button 
                        type="button"
                        onClick={() => setAttachData({ ...attachData, isCreatingCategory: !attachData.isCreatingCategory, category_id: '', newCategoryName: '' })}
                        style={{ fontSize: '11px', fontWeight: 800, color: themeColor, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {attachData.isCreatingCategory ? 'Show Existing' : '+ Create New'}
                      </button>
                    </div>

                    {attachData.isCreatingCategory ? (
                      <input 
                        value={attachData.newCategoryName} 
                        onChange={e => setAttachData({...attachData, newCategoryName: e.target.value})} 
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: `2px solid ${themeColor}40`, backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} 
                        placeholder="Enter new category name" 
                      />
                    ) : (
                      <select required value={attachData.category_id} onChange={e => setAttachData({...attachData, category_id: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }}>
                        <option value="">Select a category</option>
                        {hotelCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                 <button type="submit" style={{ width: '100%', backgroundColor: themeColor, color: 'white', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '12px' }}>
                    Confirm Link
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Add New Master Item Modal */}
      {showAddMasterModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9500, padding: '24px' }}>
           <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#0f172a', borderRadius: '40px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Add Global Item</h3>
                 <button onClick={() => setShowAddMasterModal(false)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}><X size={28} /></button>
              </div>

              <form onSubmit={handleAddMasterItem} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Item Name</label>
                    <input required value={newMasterItem.name} onChange={e => setNewMasterItem({...newMasterItem, name: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} placeholder="e.g. Paneer Masala" />
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Global Category Name</label>
                    <input required value={newMasterItem.category_name} onChange={e => setNewMasterItem({...newMasterItem, category_name: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800 }} placeholder="e.g. Main Course" />
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Description (Optional)</label>
                    <textarea value={newMasterItem.description} onChange={e => setNewMasterItem({...newMasterItem, description: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 800, minHeight: '80px', resize: 'none' }} placeholder="Briefly describe the item" />
                 </div>

                 <button type="submit" style={{ width: '100%', backgroundColor: themeColor, color: 'white', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '12px' }}>
                    Register Item
                 </button>
              </form>
           </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
