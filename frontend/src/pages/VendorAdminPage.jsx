import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Shield, 
  LayoutDashboard, 
  Smartphone, 
  Monitor, 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Power, 
  RefreshCw, 
  LogOut, 
  Lock, 
  Mail, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SUPABASE_URL = 'https://vejvxpjswlmcsbfiqywp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlanZ4cGpzd2xtY3NiZmlxeXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MzI3NTMsImV4cCI6MjEwMDEwODc1M30.oliBQIW9k8TL_d5q73bza7tt-CSK34yY-prJrYTfcBI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function VendorAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Filters & Pagination State
  const [platformTab, setPlatformTab] = useState('all'); // 'all' | 'mobile' | 'desktop'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'revoked'
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileData, setMobileData] = useState([]);
  const [desktopData, setDesktopData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusToast, setStatusToast] = useState('');

  // Date Filter State
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'last_15_days', 'last_month', 'current_month', 'last_3_months', 'last_6_months', 'this_year', 'custom', 'specific'
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [specificDate, setSpecificDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllLicenses();
    }
  }, [isLoggedIn]);

  const [hotelsData, setHotelsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [snapshotsData, setSnapshotsData] = useState([]);
  const [tableError, setTableError] = useState('');

  const formatPlanLabel = (plan) => {
    if (!plan || plan === 'registered') return 'FREE TRIAL';
    const p = String(plan).toLowerCase();
    if (p === 'monthly') return 'MONTHLY';
    if (p === 'yearly') return 'YEARLY';
    if (p === 'permanent' || p === 'lifetime') return 'PERMANENT';
    return 'FREE TRIAL';
  };

  const getPlanBadgeStyle = (plan) => {
    const p = String(plan).toLowerCase();
    if (p === 'monthly') return { bg: '#e0e7ff', color: '#3730a3' }; // Indigo
    if (p === 'yearly') return { bg: '#fef3c7', color: '#92400e' };  // Amber
    if (p === 'permanent' || p === 'lifetime') return { bg: '#dcfce7', color: '#166534' }; // Green
    return { bg: '#f3e8ff', color: '#7e22ce' }; // Purple for Trial
  };

  const fetchAllLicenses = async () => {
    setLoading(true);
    setTableError('');
    try {
      console.log('[VENDOR ADMIN] Refreshing licenses, hotels, and users from Supabase...');
      const [mRes, dRes, hRes, uRes, aRes] = await Promise.all([
        supabase.from('mobile_licenses').select('*').order('registration_date', { ascending: false }),
        supabase.from('desktop_licenses').select('*').order('registration_date', { ascending: false }),
        supabase.from('hotels').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*'),
        supabase.from('analytics_snapshots').select('hotel_code, created_at')
      ]);

      setMobileData(mRes.data || []);
      setDesktopData(dRes.data || []);
      setHotelsData(hRes.data || []);
      setUsersData(uRes.data || []);
      setSnapshotsData(aRes.data || []);

      if (hRes.error) {
        setTableError(`Supabase query warning on 'hotels': ${hRes.error.message}. Ensure RLS select policy is enabled in Supabase.`);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setTableError('Exception fetching Supabase data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === 'shubhampilane143@pilane.com' && password.trim() === 'BestBilll@Shubh#18') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Admin Email or Password!');
    }
  };

  const handleToggleStatus = async (item, platform) => {
    const newStatus = !item.is_active;

    try {
      if (item.is_from_hotels_table || item.is_from_snapshots) {
        await Promise.all([
          supabase.from('hotels').update({ is_active: newStatus, is_service_stopped: !newStatus }).eq('id', item.id).then(() => {}),
          supabase.from('desktop_licenses').upsert({
            device_uuid: item.device_uuid || item.id,
            hotel_name: item.hotel_name,
            owner_name: item.owner_name,
            mobile_number: item.mobile_number,
            address: item.address,
            is_active: newStatus,
            plan: 'trial'
          }, { onConflict: 'device_uuid' }),
          supabase.from('mobile_licenses').upsert({
            device_uuid: item.device_uuid || item.id,
            hotel_name: item.hotel_name,
            owner_name: item.owner_name,
            mobile_number: item.mobile_number,
            address: item.address,
            is_active: newStatus,
            plan: 'trial'
          }, { onConflict: 'device_uuid' })
        ]);
      } else {
        const table = platform === 'mobile' ? 'mobile_licenses' : 'desktop_licenses';
        const { error } = await supabase
          .from(table)
          .update({ is_active: newStatus, updated_at: new Date().toISOString() })
          .eq('id', item.id);

        if (error) {
          alert('Failed to update status: ' + error.message);
          return;
        }
      }

      setStatusToast(`Device license ${newStatus ? 'ACTIVATED' : 'REVOKED'} for ${item.hotel_name || item.owner_name}`);
      setTimeout(() => setStatusToast(''), 4000);
      fetchAllLicenses();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  // Build list of known hotel names and hardware UUIDs present in mobile or desktop licenses
  const registeredNames = new Set([
    ...mobileData.map(m => (m.hotel_name || '').toLowerCase().trim()),
    ...desktopData.map(d => (d.hotel_name || '').toLowerCase().trim())
  ]);

  const registeredUuids = new Set([
    ...mobileData.map(m => (m.device_uuid || '').toLowerCase().trim()),
    ...desktopData.map(d => (d.device_uuid || '').toLowerCase().trim())
  ]);

  // Map entries from public.hotels table only if not already represented in mobile_licenses or desktop_licenses
  const cloudHotelsList = hotelsData
    .filter(h => {
      if (!h.hotel_name) return false;
      const code = (h.hotel_code || h.id || '').toLowerCase().trim();
      const hName = (h.hotel_name || '').toLowerCase().trim();
      if (registeredUuids.has(code) || registeredNames.has(hName)) return false;
      if (desktopData.length > 0 || mobileData.length > 0) return false;
      return true;
    })
    .map(h => {
      const matchedUser = (usersData || []).find(u => u.id === h.owner_id || u.hotel_id === h.id || u.role === 'owner');
      const realOwnerName = matchedUser?.name || (h.owner_name && !h.owner_name.startsWith('HOTEL_') ? h.owner_name : 'Hotel Owner');
      const realOwnerEmail = matchedUser?.email || (h.email && !h.email.includes('@bestbill.com') ? h.email : 'N/A');

      return {
        id: h.id,
        hotel_name: h.hotel_name,
        owner_name: realOwnerName,
        email: realOwnerEmail,
        mobile_number: h.phone || matchedUser?.phone || 'N/A',
        address: h.location || 'Location Address',
        device_uuid: h.hotel_code || h.id,
        plan: 'trial',
        is_active: h.is_active !== false && h.is_service_stopped !== true,
        registration_date: h.created_at || new Date().toISOString(),
        last_ping_at: h.created_at || new Date().toISOString(),
        platform: 'desktop',
        is_from_hotels_table: true
      };
    });

  // Fallback: Map distinct hotel codes from analytics_snapshots if hotelsData was blocked by RLS
  const snapshotsHotelsList = Array.from(new Set(snapshotsData.map(s => s.hotel_code)))
    .filter(code => {
      if (!code) return false;
      const c = code.toLowerCase().trim();
      if (registeredUuids.has(c)) return false;
      if (desktopData.length > 0 || mobileData.length > 0) return false;
      return true;
    })
    .map(code => ({
      id: code,
      hotel_name: `Hotel (${code})`,
      owner_name: code,
      email: 'N/A',
      mobile_number: 'N/A',
      address: 'Location Address',
      device_uuid: code,
      plan: 'trial',
      is_active: true,
      registration_date: new Date().toISOString(),
      last_ping_at: new Date().toISOString(),
      platform: 'desktop',
      is_from_snapshots: true
    }));

  // Combine and Filter Data with smart deduplication
  const rawCombined = [
    ...mobileData.map(i => ({ ...i, platform: 'mobile' })),
    ...desktopData.map(i => ({ ...i, platform: 'desktop' })),
    ...cloudHotelsList,
    ...snapshotsHotelsList
  ];

  // Deduplicate by platform + owner contact (keeps the most recent ping entry and filters obsolete test rows)
  const deduplicatedMap = new Map();
  const sortedCombined = [...rawCombined].sort((a, b) => new Date(a.last_ping_at || 0) - new Date(b.last_ping_at || 0));
  for (const item of sortedCombined) {
    if (item.hotel_name && item.hotel_name.toUpperCase().includes('OBSOLETE')) {
      continue;
    }
    const ownerKey = (item.email && !item.email.includes('example.com')) 
      ? item.email.toLowerCase().trim() 
      : (item.mobile_number || item.owner_name || 'owner').toLowerCase().trim();
    const key = `${item.platform}_${ownerKey}`;
    deduplicatedMap.set(key, item);
  }
  const combinedList = Array.from(deduplicatedMap.values());

  const filteredData = combinedList.filter(item => {
    if (platformTab === 'mobile' && item.platform !== 'mobile') return false;
    if (platformTab === 'desktop' && item.platform !== 'desktop') return false;

    if (statusFilter === 'active' && !item.is_active) return false;
    if (statusFilter === 'revoked' && item.is_active) return false;

    if (dateFilter !== 'all') {
      if (!item.registration_date) return false;
      const regDate = new Date(item.registration_date);
      const now = new Date();
      
      if (dateFilter === 'last_15_days') {
        const past15 = new Date();
        past15.setDate(now.getDate() - 15);
        if (regDate < past15) return false;
      } else if (dateFilter === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (regDate < lastMonth || regDate >= thisMonth) return false;
      } else if (dateFilter === 'current_month') {
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (regDate < thisMonth) return false;
      } else if (dateFilter === 'last_3_months') {
        const past3 = new Date();
        past3.setMonth(now.getMonth() - 3);
        if (regDate < past3) return false;
      } else if (dateFilter === 'last_6_months') {
        const past6 = new Date();
        past6.setMonth(now.getMonth() - 6);
        if (regDate < past6) return false;
      } else if (dateFilter === 'this_year') {
        const thisYear = new Date(now.getFullYear(), 0, 1);
        if (regDate < thisYear) return false;
      } else if (dateFilter === 'custom') {
        if (customFromDate) {
          const from = new Date(customFromDate);
          if (regDate < from) return false;
        }
        if (customToDate) {
          const to = new Date(customToDate);
          to.setHours(23, 59, 59, 999);
          if (regDate > to) return false;
        }
      } else if (dateFilter === 'specific') {
        if (specificDate) {
          const spec = new Date(specificDate);
          if (regDate.toDateString() !== spec.toDateString()) return false;
        }
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHotel = (item.hotel_name || '').toLowerCase().includes(q);
      const matchOwner = (item.owner_name || '').toLowerCase().includes(q);
      const matchPhone = (item.mobile_number || item.phone || '').includes(q);
      const matchEmail = (item.email || '').toLowerCase().includes(q);
      const matchUuid = (item.device_uuid || '').toLowerCase().includes(q);
      return matchHotel || matchOwner || matchPhone || matchEmail || matchUuid;
    }

    return true;
  });

  // Calculate Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', color: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', marginBottom: '16px' }}>
              <Shield size={36} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Vendor Portal Login</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>BestBill Software License Management System</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', color: '#f43f5e', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Email Address</label>
              <div style={{ position: 'relative', marginTop: '8px' }}>
                <Mail size={18} style={{ position: 'absolute', top: '15px', left: '14px', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shubhampilane143@pilane.com"
                  style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 14px 14px 44px', color: '#ffffff', outline: 'none', fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative', marginTop: '8px' }}>
                <Lock size={18} style={{ position: 'absolute', top: '15px', left: '14px', color: '#64748b' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 14px 14px 44px', color: '#ffffff', outline: 'none', fontSize: '14px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#0ea5e9', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)' }}
            >
              Sign In to Master Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a' }}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#ffffff', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '4px 0 20px rgba(15, 23, 42, 0.4)' }}>
        <div>
          {/* Logo Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#0ea5e9', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px' }}>
              B
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', display: 'block' }}>ADMINTORY</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Control Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => { setPlatformTab('all'); setCurrentPage(1); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: platformTab === 'all' ? 'rgba(14, 165, 233, 0.15)' : 'transparent', color: platformTab === 'all' ? '#38bdf8' : '#cbd5e1', fontWeight: 800, fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <LayoutDashboard size={20} /> All Registered Hotels
            </button>
            <button
              onClick={() => { setPlatformTab('mobile'); setCurrentPage(1); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: platformTab === 'mobile' ? 'rgba(14, 165, 233, 0.15)' : 'transparent', color: platformTab === 'mobile' ? '#38bdf8' : '#cbd5e1', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <Smartphone size={20} /> Mobile App Licenses ({mobileData.length})
            </button>
            <button
              onClick={() => { setPlatformTab('desktop'); setCurrentPage(1); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: platformTab === 'desktop' ? 'rgba(14, 165, 233, 0.15)' : 'transparent', color: platformTab === 'desktop' ? '#38bdf8' : '#cbd5e1', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <Monitor size={20} /> Desktop App Licenses ({desktopData.length})
            </button>
          </nav>
        </div>

        {/* Admin Profile & Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 900, display: 'block' }}>Shubham Pilane</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Super Vendor Admin</span>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            title="Log Out"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <style>{`
        @keyframes spinIcon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        {/* Breadcrumb & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dashboards &gt; Hardware Licenses</span>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '4px 0 0 0', color: '#0f172a' }}>Hotel Hardware Licenses</h1>
          </div>

          <button
            onClick={() => {
              setStatusToast('Refreshing hardware license records from Supabase...');
              fetchAllLicenses().then(() => {
                setTimeout(() => setStatusToast(''), 3000);
              });
            }}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#3b82f6', fontWeight: 800, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spinIcon 0.8s linear infinite' : 'none' }} /> {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {statusToast && (
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '14px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} /> {statusToast}
          </div>
        )}

        {tableError && (
          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '14px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} /> {tableError}
          </div>
        )}

        {/* TOP FILTER BAR CARD */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            
            {/* Search Input */}
            <div style={{ flex: 2, minWidth: '280px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>What are you looking for?</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', top: '13px', left: '14px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by hotel name, owner, phone, email, or device UUID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a' }}
                />
              </div>
            </div>

            {/* Platform Filter */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>Category Platform</label>
              <select
                value={platformTab}
                onChange={(e) => { setPlatformTab(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 700 }}
              >
                <option value="all">All Platforms ({combinedList.length})</option>
                <option value="mobile">Mobile Apps ({mobileData.length})</option>
                <option value="desktop">Desktop Apps ({desktopData.length})</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>License Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 700 }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="revoked">Revoked Only</option>
              </select>
            </div>

          </div>

          {/* Date Filter Row */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>Registration Date Filter</label>
              <select
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 700 }}
              >
                <option value="all">All Time</option>
                <option value="last_15_days">Last 15 Days</option>
                <option value="last_month">Last Month</option>
                <option value="current_month">Current Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Date Range</option>
                <option value="specific">Specific Date</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>From Date</label>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => { setCustomFromDate(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>To Date</label>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => { setCustomToDate(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
              </>
            )}

            {dateFilter === 'specific' && (
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>Select Date</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => { setSpecificDate(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', color: '#0f172a' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* MAIN DATA TABLE CARD */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          {/* Table Action & Pagination Sub-header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0f172a' }}>
              Hardware Licenses Summary <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>({filteredData.length} records found)</span>
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Rows Per Page */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
                <span>SHOW:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value={10}>10 COLUMNS</option>
                  <option value={25}>25 COLUMNS</option>
                  <option value={50}>50 COLUMNS</option>
                  <option value={100}>100 COLUMNS</option>
                </select>
              </div>

              {/* Page Number Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 800 }}
                >
                  &lt;
                </button>

                <span style={{ fontSize: '13px', fontWeight: 900, padding: '0 8px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 800 }}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* TABLE DATA */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 12px' }}>Platform</th>
                  <th style={{ padding: '10px 12px' }}>Hotel Name</th>
                  <th style={{ padding: '10px 12px' }}>Owner Details</th>
                  <th style={{ padding: '10px 12px' }}>Device UUID</th>
                  <th style={{ padding: '10px 12px' }}>Plan</th>
                  <th style={{ padding: '10px 12px' }}>Registration Date</th>
                  <th style={{ padding: '10px 12px' }}>Last Ping</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>
                      {loading ? 'Loading hardware records from Supabase...' : 'No registered hotels found matching your search.'}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr key={`${item.platform}-${item.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 6px', borderRadius: '4px', backgroundColor: item.platform === 'mobile' ? '#e0f2fe' : '#fef3c7', color: item.platform === 'mobile' ? '#0369a1' : '#b45309', whiteSpace: 'nowrap' }}>
                          {item.platform === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ whiteSpace: 'nowrap' }}>{item.hotel_name || 'N/A'}</div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }} title={item.address}>{item.address || 'No location address'}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {item.owner_name && !item.owner_name.startsWith('HOTEL_') ? item.owner_name : 'Hotel Owner'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>📞 {item.mobile_number || item.phone || 'N/A'}</div>
                        <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>✉️ {item.email && !item.email.includes('@bestbill.com') ? item.email : 'N/A'}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <code style={{ fontSize: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                          {item.device_uuid}
                        </code>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', backgroundColor: getPlanBadgeStyle(item.plan).bg, color: getPlanBadgeStyle(item.plan).color, whiteSpace: 'nowrap' }}>
                          {formatPlanLabel(item.plan)}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        <div style={{ whiteSpace: 'nowrap' }}>{item.registration_date ? new Date(item.registration_date).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        <div style={{ whiteSpace: 'nowrap' }}>{item.last_ping_at ? new Date(item.last_ping_at).toLocaleDateString() : 'Never'}</div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleStatus(item, item.platform)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            backgroundColor: item.is_active ? '#dcfce7' : '#ffe4e6',
                            color: item.is_active ? '#15803d' : '#be123c',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Power size={12} /> {item.is_active ? 'ACTIVE' : 'REVOKED'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER PAGINATION INFO */}
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <div>
              Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} registered hotel entries
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 800 }}
              >
                Previous
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 800 }}
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
