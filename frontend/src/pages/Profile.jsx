import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, ShieldCheck, Save, Eye, EyeOff, LayoutPanelLeft, UserCircle, Wallet, Users, Trash2, UserPlus, Fingerprint, MapPin, Percent, Upload, Image as ImageIcon } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isOwner = user?.role === 'owner';
    const themeColor = isAdmin ? '#10b981' : '#0ea5e9';
    const serverUrl = 'https://bestbill-backend-174132084209.us-central1.run.app';

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const [hotelData, setHotelData] = useState({
        name: user?.hotel_name || '',
        address: user?.hotel_address || '',
        upi_id: user?.upi_id || '',
        gst_percentage: user?.gst_percentage || 5,
        logo_url: ''
    });

    const [staff, setStaff] = useState([]);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '' });
    const [hiring, setHiring] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOwner) {
            fetchStaff();
            fetchHotelDetails();
        }
    }, [isOwner]);

    const fetchHotelDetails = async () => {
        try {
            const res = await api.get('/hotel');
            setHotelData({
                name: res.data.name || '',
                address: res.data.address || '',
                upi_id: res.data.upi_id || '',
                gst_percentage: res.data.gst_percentage || 5,
                logo_url: res.data.logo_url || ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/hotel/waiters');
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleHiring = async (e) => {
        e.preventDefault();
        setHiring(true);
        const t = toast.loading('Onboarding staff member...');
        try {
            await api.post('/hotel/waiters', staffForm);
            toast.success(`${staffForm.name} added to waitstaff!`, { id: t });
            setStaffForm({ name: '', email: '', password: '' });
            fetchStaff();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Hiring failed', { id: t });
        } finally {
            setHiring(false);
        }
    };

    const removeStaff = async (id) => {
        try {
            await api.delete(`/hotel/waiters/${id}`);
            toast.success('Staff access revoked');
            fetchStaff();
        } catch (err) {
            toast.error('Removal failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error('Passcodes do not match!');
        }
        setLoading(true);
        const t = toast.loading('Syncing security updates...');
        try {
            const updatePayload = { name: formData.name, email: formData.email };
            if (formData.password) updatePayload.password = formData.password;
            const res = await api.put('/profile', updatePayload);
            updateUser(res.data.user);
            toast.success('Personal credentials updated!', { id: t });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            toast.error('Failed to update credentials', { id: t });
        } finally {
            setLoading(false);
        }
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const t = toast.loading('Persisting hotel configuration...');
        try {
            const res = await api.put('/hotel', hotelData);
            updateUser({ 
                ...user, 
                hotel_name: res.data.name, 
                hotel_address: res.data.address,
                upi_id: res.data.upi_id, 
                gst_percentage: res.data.gst_percentage 
            });
            toast.success('Hotel configuration persisted!', { id: t });
        } catch (err) {
            console.error(err);
            toast.error('Failed to update hotel settings. Check all fields.', { id: t });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e) => {
        if (!e.target.files[0]) return;
        const formData = new FormData();
        formData.append('logo', e.target.files[0]);
        const loadingToast = toast.loading('Uploading brand logo...');
        try {
            const res = await api.put('/profile/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setHotelData({ ...hotelData, logo_url: res.data.logo_url });
            toast.success('Logo updated successfully!', { id: loadingToast });
        } catch (err) {
            toast.error('Logo upload failed', { id: loadingToast });
        }
    };

    const removeLogo = async () => {
        const loadingToast = toast.loading('Removing brand logo...');
        try {
            await api.put('/profile/logo', { deleteExisting: 'true' });
            setHotelData({ ...hotelData, logo_url: '' });
            toast.success('Logo removed successfully!', { id: loadingToast });
        } catch (err) {
            toast.error('Failed to remove logo', { id: loadingToast });
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '100px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: isOwner ? '1fr 1fr' : '1fr', gap: '48px' }}>
                {/* Personal Section */}
                <div style={{ maxWidth: isOwner ? '100%' : '600px', margin: isOwner ? '0' : '0 auto', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <UserCircle size={32} style={{ color: themeColor }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 950, color: 'white', margin: 0 }}>Security Core</h2>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ fontSize: '11px', fontWeight: 900, color: '#475569' }}>IDENTITY NAME</label>
                              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white', fontWeight: 700 }} />
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ fontSize: '11px', fontWeight: 900, color: '#475569' }}>EMAIL PROTOCOL</label>
                              <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white', fontWeight: 700 }} />
                           </div>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                               <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="New Passcode" style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white' }} />
                               <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm" style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white' }} />
                           </div>
                           <button type="submit" style={{ backgroundColor: themeColor, color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 1000, cursor: 'pointer', border: 'none', boxShadow: `0 10px 20px ${themeColor}20` }}>Update Credentials</button>
                        </form>
                    </div>
                </div>

                {/* Hotel Management (Owner only) */}
                {isOwner && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <LayoutPanelLeft size={32} style={{ color: '#0ea5e9' }} />
                            <h2 style={{ fontSize: '24px', fontWeight: 950, color: 'white', margin: 0 }}>Hotel Profile</h2>
                        </div>
                        <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            
                            {/* Logo Upload Section */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div 
                                    onClick={() => document.getElementById('logo-upload-owner').click()}
                                    style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#020617', border: '2px dashed #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                                    {hotelData.logo_url ? <img src={hotelData.logo_url.startsWith('http') ? hotelData.logo_url : `${serverUrl}${hotelData.logo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon color="#475569" />}
                                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                        <Upload size={20} color="white" />
                                    </div>
                                </div>
                                <input id="logo-upload-owner" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>Hotel Brand Logo</span>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Click icon to upload a high-quality logo.</span>
                                    {hotelData.logo_url && (
                                        <button onClick={removeLogo} style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '11px', fontWeight: 900, cursor: 'pointer', padding: 0, textAlign: 'left', marginTop: '4px' }}>Remove Logo</button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleHotelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 900 }}>HOTEL LEGAL NAME</label>
                                        <input value={hotelData.name} onChange={e => setHotelData({...hotelData, name: e.target.value})} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white', fontWeight: 700 }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 900 }}>GST %</label>
                                        <input type="number" value={hotelData.gst_percentage} onChange={e => setHotelData({...hotelData, gst_percentage: e.target.value})} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: '#10b981', fontWeight: 1000 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 900 }}>PHYSICAL ADDRESS</label>
                                    <input value={hotelData.address} onChange={e => setHotelData({...hotelData, address: e.target.value})} placeholder="Full location address" style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white', fontWeight: 700 }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ color: '#64748b', fontSize: '11px', fontWeight: 900 }}>UPI ID (MERCHANT)</label>
                                    <input value={hotelData.upi_id} onChange={e => setHotelData({...hotelData, upi_id: e.target.value})} placeholder="merchant@bank" style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white', fontWeight: 700 }} />
                                </div>
                                <button type="submit" style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 1000, cursor: 'pointer', border: 'none' }}>Save Profile Settings</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Staff Section */}
            {isOwner && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <Users size={32} style={{ color: '#f59e0b' }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 950, color: 'white', margin: 0 }}>Staff Command</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px' }}>
                        <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 900, color: 'white', marginBottom: '24px' }}>Hire New Staff</h3>
                            <form onSubmit={handleHiring} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input required placeholder="Staff Name" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white' }} />
                                <input required type="email" placeholder="Login Email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white' }} />
                                <input required type="password" placeholder="Initial Passcode" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', color: 'white' }} />
                                <button type="submit" disabled={hiring} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 1000, cursor: 'pointer', border: 'none' }}>Onboard Staff</button>
                            </form>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {staff.length === 0 ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#475569', backgroundColor: '#0f172a', borderRadius: '24px', border: '2px dashed #1e293b' }}>No active waitstaff protocol</div>
                            ) : (
                                staff.map(s => (
                                    <div key={s.id} style={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 900, fontSize: '16px' }}>{s.name}</div>
                                            <div style={{ color: '#475569', fontSize: '13px' }}>{s.email}</div>
                                        </div>
                                        <button onClick={() => removeStaff(s.id)} style={{ color: '#f43f5e', padding: '12px', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={24} /></button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                 <p style={{ color: '#475569', fontSize: '12px', fontWeight: 800 }}>BestBill Identity Protection — Secure Role-Based Access Control Active</p>
            </div>
        </div>
    );
};

export default Profile;
