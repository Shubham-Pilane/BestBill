import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Smartphone, 
  TrendingUp, 
  Activity, 
  Shield, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Laptop, 
  Lock, 
  PieChart, 
  Phone, 
  Mail, 
  Sparkles,
  BarChart3,
  Layers,
  Clock,
  Radio,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AnimatedSection from '../animations/AnimatedSection';

const AdminAppPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const pageRef = useRef(null);

  const adminShowcaseItems = [
    {
      title: "Live Revenue Dashboard",
      subtitle: "Track active outlet session (Hotel Aditya Garden), total net revenue (₹4,930), processed orders, cash collection (70%), and UPI online collection (30%) in real time.",
      image: "/screenshots/admin/admin-dashboard-revenue.jpg",
      tag: "Revenue Dashboard",
      desc: "Live revenue analytics, active session indicator, date range selection, and collection percentages."
    },
    {
      title: "Revenue Analytics & Daily Breakdown",
      subtitle: "Detailed 15-day revenue breakdown (₹7,845 total), total days active, daily cash & online sales log table, and direct PDF report export.",
      image: "/screenshots/admin/admin-analytics-breakdown.jpg",
      tag: "Daily Sales Audit",
      desc: "Comprehensive 15-day sales breakdown table, online collection breakdown, and instant PDF report exports."
    },
    {
      title: "Dine-in vs Parcel & Sales Trends",
      subtitle: "Visual breakdown comparing Dine-In revenue (₹2,790) vs Parcel orders (₹2,140), daily sales trend bar charts, and top-selling dish rankings.",
      image: "/screenshots/admin/admin-sales-trend-dishes.jpg",
      tag: "Sales Trends & Dishes",
      desc: "Dine-in vs parcel comparison, sales trend bar charts, and dish rank analysis."
    }
  ];

  const handleDownloadAdminApk = () => {
    toast.success("Starting BestBill Admin App APK download...", { icon: '📲' });
    const link = document.createElement('a');
    link.href = 'https://storage.googleapis.com/bestbill-public-logos/BestBill%20Admin%201.0.0.apk';
    link.setAttribute('download', 'BestBill Admin 1.0.0.apk');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div ref={pageRef} style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowX: 'hidden', width: '100%' }}>
      
      {/* Header Bar */}
      <header className="glass-effect" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
              <img src="/logo.svg" alt="BestBill Logo" style={{ width: '36px', height: '36px', borderRadius: '9px', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }} />
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em' }}>Best<span style={{ color: '#10b981' }}>Bill</span></span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link 
              to="/" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontWeight: 700, fontSize: '14px', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.target.style.color = '#38bdf8'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >
              <ArrowLeft size={16} /> Back to Main Site
            </Link>

            <button 
              onClick={handleDownloadAdminApk}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', border: 'none', color: 'white', padding: '8px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <Download size={14} /> Download Admin APK
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '70px 24px 50px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)', top: '5%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '100px', padding: '8px 20px', marginBottom: '24px' }}>
            <Globe size={16} color="#34d399" />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>REMOTE POS MONITORING FOR DESKTOP USERS</span>
          </div>

          <h1 style={{ fontSize: '52px', fontWeight: 950, lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: '960px', margin: '0 auto 24px', textTransform: 'uppercase' }}>
            Track Live Sales Data From <br />
            <span style={{ background: 'linear-gradient(to right, #34d399, #10b981, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Anywhere In The World</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '780px', margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 500 }}>
            Using BestBill Desktop Application at your store offline? Now you don't need to be physically present at the billing counter! With <strong>BestBill Admin App</strong>, track live store sales, collection summaries, occupied tables, and item reports remotely from your mobile phone.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownloadAdminApk}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#10b981', border: 'none', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.4)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              <Smartphone size={20} /> Download BestBill Admin App (.APK)
            </button>

            <Link 
              to="/" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '16px 28px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', textDecoration: 'none', transition: 'all 0.2s' }}
            >
              Explore Desktop Software
            </Link>
          </div>

          <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '24px', color: '#64748b', fontSize: '12px', fontWeight: 700, flexWrap: 'wrap' }}>
            <span>✓ Remote Live Sales Stream</span>
            <span>✓ Multi-Outlet Support</span>
            <span>✓ Encrypted Owner Login</span>
            <span>✓ Works on any Android Phone</span>
          </div>
        </div>
      </section>

      {/* Real Screenshots Interactive Showcase */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" className="glass-card" style={{ padding: '36px', borderRadius: '32px', border: '1px solid rgba(16,185,129,0.3)', backgroundColor: 'rgba(15,23,42,0.8)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em' }}>REAL ADMIN APP SCREENSHOTS</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>Inside BestBill Admin Mobile Interface</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '6px' }}>Click through the tabs below to preview actual live screens of the Admin App:</p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
            {adminShowcaseItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: activeTab === idx ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: activeTab === idx ? 'rgba(16,185,129,0.2)' : 'rgba(15,23,42,0.6)',
                  color: activeTab === idx ? '#34d399' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Smartphone size={14} /> {item.tag}
              </button>
            ))}
          </div>

          {/* Display Grid */}
          <div className="admin-showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', alignItems: 'center' }}>
            
            {/* Left Column: Screen details */}
            <div className="admin-showcase-text" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, width: 'fit-content' }}>
                SCREEN {activeTab + 1} OF {adminShowcaseItems.length}
              </div>

              <h3 style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{adminShowcaseItems[activeTab].title}</h3>
              
              <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.7 }}>
                {adminShowcaseItems[activeTab].subtitle}
              </p>

              <div style={{ backgroundColor: '#020617', padding: '18px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> Real-time Store Data Sync
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> One-tap PDF Audit Reports
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> Multi-Outlet Hotel & Outlet Selector
                </span>
              </div>

              <button 
                onClick={() => setSelectedImageIndex(activeTab)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', width: 'fit-content' }}
              >
                🔍 View Full Screen Image
              </button>
            </div>

            {/* Right Column: Phone Frame */}
            <div className="admin-showcase-image" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '300px',
                backgroundColor: '#090d1f',
                borderRadius: '36px',
                padding: '12px',
                border: '4px solid #1e293b',
                boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.3)',
                overflow: 'hidden'
              }}>
                {/* Phone Notch */}
                <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '16px', backgroundColor: '#020617', borderRadius: '8px', zIndex: 10 }}></div>
                
                {/* Image */}
                <div style={{ borderRadius: '26px', overflow: 'hidden', backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img 
                    src={adminShowcaseItems[activeTab].image} 
                    alt={adminShowcaseItems[activeTab].title}
                    style={{ width: '100%', display: 'block', borderRadius: '24px', cursor: 'pointer', transition: 'transform 0.3s' }}
                    onClick={() => setSelectedImageIndex(activeTab)}
                  />
                </div>
              </div>
            </div>

          </div>
        </AnimatedSection>
        <style>{`
          @media (max-width: 768px) {
            .admin-showcase-grid {
              display: flex !important;
              flex-direction: column !important;
            }
            .admin-showcase-image {
              order: 1 !important;
              margin-bottom: 20px !important;
            }
            .admin-showcase-text {
              order: 2 !important;
            }
          }
        `}</style>
      </section>

      {/* Problem vs Solution Section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '50px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" className="glass-card" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(16,185,129,0.25)', backgroundColor: 'rgba(15,23,42,0.6)' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em' }}>WHY BESTBILL ADMIN APP?</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '6px' }}>Never Lose Track of Your Store Revenue</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            
            {/* Before / Problem */}
            <div style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}>
                ❌ Previously Without Admin App
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Locked to Store Computer</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                Since Desktop POS runs offline on your shop PC, you could only check daily sales, cash collection, and table performance when physically present at the shop register.
              </p>
            </div>

            {/* Now / Solution */}
            <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}>
                ✨ Now With BestBill Admin App
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Live Worldwide Monitoring</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
                Your desktop billing data syncs securely to your mobile Admin App. Monitor live sales totals, parcel orders, cash vs online collection, and table occupancy anywhere globally!
              </p>
            </div>

          </div>
        </AnimatedSection>
      </section>

      {/* Core Features */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ color: '#34d399', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em' }}>OWNER CONTROL DESK</span>
          <h2 style={{ fontSize: '34px', fontWeight: 900, marginTop: '6px', textTransform: 'uppercase' }}>Key Admin App Features</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Designed specifically for business owners to stay in control 24/7.</p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Real-time Sales Analytics</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Instant breakdown of total revenue, dine-in collection, parcel orders, cash in register, and online payments updated live.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Live Table Grid Stream</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Check which tables are occupied, view active bill totals, and monitor ongoing KOT order volume from your phone.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Multi-Branch Outlets</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Own more than one restaurant or hotel branch? Switch between different store terminals from a single Admin App login.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(236,72,153,0.15)', color: '#ec4899', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Item Performance Reports</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Identify best-selling dishes, peak dining hours, and itemized sales metrics to make smart business decisions.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Daily & Monthly PDF Export</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Generate and download official PDF audit reports for accounting, Tax/GST filings, and financial reviews anytime.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(20,184,166,0.15)', color: '#14b8a6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Owner Encrypted Access</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Protected by owner-only authentication and biometric security. Only authorized business owners can view financial data.
            </p>
          </div>

        </AnimatedSection>
      </section>

      {/* 3-Step Simple Setup */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em' }}>EASY SETUP</span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '6px' }}>How BestBill Admin App Works</h2>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#10b981', marginBottom: '8px' }}>STEP 1</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Run Desktop POS at Store</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Keep BestBill Desktop Application running on your store counter billing PC for daily fast offline billing.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', borderLeft: '4px solid #38bdf8' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>STEP 2</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Install BestBill Admin APK</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Download and install the **BestBill Admin App APK** on your personal Android smartphone or tablet.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', borderLeft: '4px solid #a855f7' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#a855f7', marginBottom: '8px' }}>STEP 3</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>View Live Sales Anywhere</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Log in securely with your owner credentials and monitor live sales, orders, and reports anywhere in the world!
            </p>
          </div>

        </div>
      </section>

      {/* Download Section Box */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div className="glass-card" style={{ padding: '48px 32px', borderRadius: '32px', textAlign: 'center', border: '2px solid #10b981', boxShadow: '0 20px 50px rgba(16,185,129,0.2)' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Download size={28} />
          </div>
          
          <h2 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase' }}>
            Download BestBill Admin App (.APK)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '12px auto 28px', lineHeight: 1.6 }}>
            Stay connected to your store 24/7. Download the Android APK file directly and pair your desktop store billing counter in minutes.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownloadAdminApk}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.4)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              <Smartphone size={20} /> Download BestBill Admin APK
            </button>

            <a 
              href="tel:+919822401802"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '16px 28px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', textDecoration: 'none' }}
            >
              <Phone size={18} /> Contact Customer Care (+91 9822401802)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#010409', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>BestBill Solutions Private Limited</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
          Founder &amp; Director: <strong>Shubham Pilane</strong> | Phone: +91 9822401802 | Email: bestbillsolutions@gmail.com
        </p>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
          CIN: U62090PN2026PTC262563 • Registered Office: Flat No. 201, B Wing, Karha Vastu, Near Swagat Hotel, Saswad, Purandar, Pune - 412301, Maharashtra
        </p>
        <p style={{ color: '#475569', fontSize: '12px', fontWeight: 600, margin: 0 }}>
          © {new Date().getFullYear()} BestBill Solutions Private Limited. All rights reserved.
        </p>
      </footer>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ backgroundColor: '#10b981', padding: '4px 12px', borderRadius: '24px', fontSize: '13px' }}>
                {selectedImageIndex + 1} / {adminShowcaseItems.length} • Admin App
              </span>
              {adminShowcaseItems[selectedImageIndex].title}
            </div>
            <button 
              onClick={() => setSelectedImageIndex(null)}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '48px', height: '48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => prev === 0 ? adminShowcaseItems.length - 1 : prev - 1);
            }}
            style={{ position: 'absolute', left: '24px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000 }}
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => prev === adminShowcaseItems.length - 1 ? 0 : prev + 1);
            }}
            style={{ position: 'absolute', right: '24px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000 }}
          >
            <ChevronRight size={32} />
          </button>

          <div 
            style={{ width: '90%', height: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}
            onClick={() => setSelectedImageIndex(null)}
          >
            <img 
              src={adminShowcaseItems[selectedImageIndex].image} 
              alt={adminShowcaseItems[selectedImageIndex].title}
              style={{ maxWidth: '100%', maxHeight: '85%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              onClick={e => e.stopPropagation()}
            />
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 600, backgroundColor: 'rgba(15,23,42,0.8)', padding: '8px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
              {adminShowcaseItems[selectedImageIndex].desc}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAppPage;
