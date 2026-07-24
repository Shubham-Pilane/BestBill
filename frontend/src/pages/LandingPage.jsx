import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Cpu, 
  Layers, 
  Printer, 
  Key, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle,
  FileText,
  User,
  Coffee,
  Grid,
  TrendingUp,
  Truck,
  HeartHandshake,
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Tablet,
  Laptop,
  Zap,
  Sparkles,
  CheckCircle2,
  DownloadCloud,
  Gift,
  Bluetooth,
  Globe,
  Menu
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedSection from '../animations/AnimatedSection';
import api from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('all'); // 'all' | 'desktop' | 'mobile'
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageRef = useRef(null);

  const screenshots = [
    // Desktop Screenshots
    { title: "Desktop Login Page", file: "Login Page.png", category: "desktop", platform: "Windows PC", desc: "Secure POS login & local session management." },
    { title: "Desktop Table Dashboard", file: "Table Dashboard.png", category: "desktop", platform: "Windows PC", desc: "Visual floor grid, table statuses, parcel & token counters." },
    { title: "Desktop Menu Management", file: "Menu Mangement.png", category: "desktop", platform: "Windows PC", desc: "Quick category, pricing, and item configuration." },
    { title: "Desktop Room Management", file: "Room Mangement.png", category: "desktop", platform: "Windows PC", desc: "Hotel lodging, room tariffs, check-ins & guest billing." },
    { title: "Desktop Credit Management", file: "Credit Mangement.png", category: "desktop", platform: "Windows PC", desc: "Customer balance tracking, credit limits & payment logs." },
    { title: "Desktop Credit Settlement", file: "Credit Settlement.png", category: "desktop", platform: "Windows PC", desc: "Instant debt recovery and transaction settlement." },
    { title: "Desktop Inventory Management", file: "Inventory Mangement.png", category: "desktop", platform: "Windows PC", desc: "Raw ingredients stock, stock value & recipe BOM audit." },
    { title: "Desktop Billing History", file: "Billing History.png", category: "desktop", platform: "Windows PC", desc: "Complete invoicing logs with search & PDF exports." },
    { title: "Desktop Collection Record", file: "Collection Record.png", category: "desktop", platform: "Windows PC", desc: "Cash vs online payment collection breakdown." },
    { title: "Desktop Item Sales Report", file: "Item Sales Report.png", category: "desktop", platform: "Windows PC", desc: "Detailed sales analytics and item popularity matrix." },

    // Android Mobile Screenshots
    { title: "Mobile Live Floor & Tables", file: "mobile/mobile-table-dashboard.jpg", category: "mobile", platform: "Android App", desc: "Real-time floor tables, parcel counter, active session on mobile." },
    { title: "Mobile Sales & Analytics", file: "mobile/mobile-sales-analytics.jpg", category: "mobile", platform: "Android App", desc: "Collection breakdown, revenue analytics & PDF exports on phone." },
    { title: "Mobile Stock & Inventory", file: "mobile/mobile-inventory-management.jpg", category: "mobile", platform: "Android App", desc: "Raw materials tracking, low stock alerts & ₹3,45,000 inventory value." },
    { title: "Mobile POS Billing & Settlement", file: "mobile/mobile-order-settlement.jpg", category: "mobile", platform: "Android App", desc: "Fast table ordering (Masala Puri, SPDP), discounts & bill settlement." },
    { title: "Mobile Quick Search & Tokens", file: "mobile/mobile-token-counter.jpg", category: "mobile", platform: "Android App", desc: "Instant item search, token summary & quick ordering on mobile." },

    // Admin Remote App Screenshots
    { title: "Admin Live Revenue Dashboard", file: "admin/admin-dashboard-revenue.jpg", category: "admin", platform: "Admin App", desc: "Live store net revenue (₹4,930), cash (70%) vs online (30%) collection breakdown." },
    { title: "Admin Revenue Analytics & 15-Day Log", file: "admin/admin-analytics-breakdown.jpg", category: "admin", platform: "Admin App", desc: "Multi-day revenue audit table (₹7,845 total) and instant PDF reports." },
    { title: "Admin Sales Trends & Top Dishes", file: "admin/admin-sales-trend-dishes.jpg", category: "admin", platform: "Admin App", desc: "Dine-in vs parcel comparison, sales trend bar charts & dish rankings." }
  ];

  const mobileShowcaseItems = [
    {
      title: "Live Floor & Table Grid",
      subtitle: "Manage tables, floor grids, parcel counters, and active customer sessions directly from your phone screen.",
      image: "/screenshots/mobile/mobile-table-dashboard.jpg",
      tag: "Floor Management"
    },
    {
      title: "Sales & Performance Analytics",
      subtitle: "Track dine-in vs parcel revenue, total daily collection, cash vs online breakdown, and export PDF reports.",
      image: "/screenshots/mobile/mobile-sales-analytics.jpg",
      tag: "Real-time Reports"
    },
    {
      title: "Stock & Inventory Management",
      subtitle: "Audit total ingredients, monitor low stock warnings, add raw materials, and track current stock value (₹3,45,000+).",
      image: "/screenshots/mobile/mobile-inventory-management.jpg",
      tag: "Stock Valuation"
    },
    {
      title: "Mobile POS Bill Settlement",
      subtitle: "Take orders fast, add items (Masala Puri, Sev Puri, SPDP), apply loyalty discounts, and settle bills in seconds.",
      image: "/screenshots/mobile/mobile-order-settlement.jpg",
      tag: "Fast POS Invoicing"
    },
    {
      title: "Token Counter & Item Search",
      subtitle: "Instant item search bar with price list, token counter order management, and one-tap food item addition.",
      image: "/screenshots/mobile/mobile-token-counter.jpg",
      tag: "Token POS Counter"
    }
  ];

  const faqs = [
    {
      q: "Do I need a PC or laptop to use BestBill?",
      a: "No! BestBill is now available as a full-featured Android App. You don't need a PC or laptop at all. You can print bills, manage inventory, handle credit records, and view live sales analytics right from your Android mobile phone or tablet."
    },
    {
      q: "How does thermal printing work on the BestBill Android App?",
      a: "The BestBill Android App connects seamlessly to ESC/POS thermal printers via Bluetooth or Wi-Fi. You can configure your receipt printer size (58mm or 80mm) and print bills or KOTs instantly from your phone."
    },
    {
      q: "Does BestBill require an internet connection?",
      a: "No! BestBill is a 100% offline-first application for both Windows PC and Android. Your billing counter, kitchen orders, inventory, and customer credits run smoothly even during internet outages."
    },
    {
      q: "What features are available on the BestBill Android App?",
      a: "From the Android app, you get complete functionality: table grid management, parcel counter, fast order billing, inventory stock control, credit tracking & settlement, daily collection reports, and Bluetooth printing."
    },
    {
      q: "Can I manage hotel room bookings alongside table orders?",
      a: "Yes! BestBill features a comprehensive lodging module, allowing hotel owners to manage room statuses, track guest ordering, and settle room charges in one unified layout."
    },
    {
      q: "How do I back up my billing data?",
      a: "Since all data is stored locally on your device, you can easily export and save automatic daily backups to local storage, SD card, or external drive."
    },
    {
      q: "What are the hardware requirements?",
      a: "BestBill is highly optimized. For Windows PC, it runs on Windows 10 or 11 with 4GB RAM. For Android, it runs smoothly on any Android smartphone or tablet running Android 8.0 or above."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      return toast.error("Please fill in all fields.");
    }
    setIsSubmitting(true);
    try {
      const response = await api.post('/contact', formData);
      if (response.data && response.data.success) {
        toast.success(response.data.message || "Message sent! Shubham Pilane will get back to you shortly.");
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadWindows = () => {
    toast.success("Starting BestBill Windows PC Setup download...", { icon: '💻' });
    const link = document.createElement('a');
    link.href = 'https://storage.googleapis.com/bestbill-public-logos/BestBill%20Setup%201.0.0.exe';
    link.setAttribute('download', 'BestBill Setup 1.0.0.exe');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowDownloadModal(false);
  };

  const handleDownloadAndroid = () => {
    toast.success("Starting BestBill Android APK download...", { icon: '📱' });
    const link = document.createElement('a');
    link.href = 'https://storage.googleapis.com/bestbill-public-logos/BestBill%20Setup%201.0.0.apk';
    link.setAttribute('download', 'BestBill Setup 1.0.0.apk');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowDownloadModal(false);
  };

  const handleDownloadAdminApk = () => {
    toast.success("Starting BestBill Admin App APK download...", { icon: '📲' });
    const link = document.createElement('a');
    link.href = 'https://storage.googleapis.com/bestbill-public-logos/BestBill%20Admin%201.0.0.apk';
    link.setAttribute('download', 'BestBill Admin 1.0.0.apk');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowDownloadModal(false);
  };

  const filteredScreenshots = screenshots.filter(s => {
    if (galleryFilter === 'all') return true;
    return s.category === galleryFilter;
  });

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Hero Section Animations
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    
    // Header comes down
    tl.fromTo('.hero-header', 
      { y: -50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1 }, 
      0
    );
    
    // Background glow pulses
    gsap.fromTo('.hero-glow', 
      { scale: 1, opacity: 0.2 },
      { scale: 1.2, opacity: 0.8, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' }
    );

    // Hero content staggers up
    tl.fromTo('.hero-content > *', 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, ease: 'power3.out' }, 
      0.2
    );

    // Parallax background on scroll
    gsap.to('.hero-glow', {
      y: 200,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

  }, { scope: pageRef });

  return (
    <div ref={pageRef} style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowX: 'hidden', width: '100%' }}>
      
      {/* Navigation Header */}
      <header className="glass-effect hero-header" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.svg" alt="BestBill Logo" style={{ width: '36px', height: '36px', boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)', borderRadius: '9px' }} />
            <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em' }}>Best<span style={{ color: '#38bdf8' }}>Bill</span><sup style={{ fontSize: '12px', fontWeight: 'bold' }}>&trade;</sup></span>
            <span className="hidden sm:inline-block" style={{ fontSize: '9px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>OFFLINE v2.4</span>
            <span className="hidden md:inline-block" style={{ fontSize: '9px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>ANDROID READY</span>
          </div>

          <nav className="nav-menu" style={{ gap: '24px' }}>
            <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>About</a>
            <a href="#android" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Android App</a>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Features</a>
            <a href="#gallery" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Gallery</a>
            <a href="#plans" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Plans</a>
            <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Pricing</a>
            <a href="#contact" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Contact</a>
            <Link to="/admin-app" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>BestBill Admin App</Link>
          </nav>

          {/* Mobile Header Quick Actions */}
          <div className="mobile-only-header" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
            <Link 
              to="/admin-app" 
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Globe size={13} /> Admin App
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: '#090d1f', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>About</a>
            <a href="#android" onClick={() => setMobileMenuOpen(false)} style={{ color: '#34d399', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={16} /> Android App</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>Features</a>
            <a href="#gallery" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>Gallery</a>
            <a href="#plans" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>Plans</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>Pricing</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>Contact</a>
            <Link to="/admin-app" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}><Globe size={16} /> BestBill Admin App</Link>
          </div>
        )}

        <style>{`
          .nav-menu {
            display: flex;
            align-items: center;
          }
          .mobile-only-header {
            display: none;
          }
          @media (max-width: 768px) {
            .nav-menu {
              display: none !important;
            }
            .mobile-only-header {
              display: flex !important;
            }
            .showcase-grid {
              display: flex !important;
              flex-direction: column !important;
            }
            .showcase-image-container {
              order: 1 !important;
              margin-bottom: 20px !important;
            }
            .showcase-text-container {
              order: 2 !important;
            }
            .gallery-grid {
              display: flex !important;
              flex-direction: column !important;
            }
            .gallery-photos-card {
              order: 1 !important;
            }
            .gallery-video-card {
              order: 2 !important;
              margin-top: 24px !important;
            }
          }
        `}</style>
      </header>

      {/* Hero Section */}
      <section className="hero-section hero-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', top: '10%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(40px)', zIndex: -1 }}></div>

        {/* Free Promotional & Platform Banner */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '24px', padding: '10px 24px', marginBottom: '32px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' }}>
          <div style={{ fontSize: '22px', fontWeight: 1000, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#10b981" /> FREE TO USE (1 Month Trial)
          </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(16,185,129,0.4)' }} className="hidden sm:block"></div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Laptop size={15} /> Windows PC &nbsp;•&nbsp; <Smartphone size={15} /> Android Mobile App
          </div>
        </div>

        <h1 style={{ fontSize: '56px', fontWeight: 950, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: '950px', margin: '0 auto 24px', textTransform: 'uppercase' }}>
          Hotel & Restaurant <br/>
          <span style={{ background: 'linear-gradient(to right, #38bdf8, #0ea5e9, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management Software</span>
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '750px', margin: '0 auto 40px', fontWeight: 500, lineHeight: 1.6 }}>
          Run your billing, thermal receipt printing, table grids, stock inventory, credit ledger, and sales reports 100% offline. Now available on <strong>Windows PC</strong> and <strong>Android App</strong> — <em>No PC or Laptop required if you want to use the Android mobile setup!</em>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDownloadWindows}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0ea5e9', border: 'none', color: 'white', padding: '16px 28px', borderRadius: '16px', fontWeight: 900, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            <Laptop size={18} /> Download Desktop App (.EXE)
          </button>

          <button 
            onClick={handleDownloadAndroid}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#059669', border: '1px solid #10b981', color: 'white', padding: '16px 28px', borderRadius: '16px', fontWeight: 900, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            <Smartphone size={18} /> Download Android App (.APK)
          </button>
          
          <a 
            href="tel:+919822401802"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', padding: '16px 28px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.borderColor = 'rgba(56,189,248,0.3)'}
            onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
          >
            <Phone size={16} /> Contact Customer Care
          </a>
        </div>

        <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '20px', color: '#64748b', fontSize: '12px', fontWeight: 700, flexWrap: 'wrap' }}>
          <span>✓ 100% Mobile Ready (No Laptop Needed)</span>
          <span>✓ Bluetooth & Wi-Fi Thermal Printing</span>
          <span>✓ Windows 10/11 POS Ready</span>
          <span>✓ Local Data Safety</span>
          <span>✓ Founder: Shubham Pilane</span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" duration={1.2} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#0ea5e9', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em' }}>Complete POS Solution</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>About BestBill</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '24px' }}>
              BestBill is a professional, complete hotel billing software and restaurant management solution. Designed to support high-speed local business operations, it operates as the ultimate free hotel billing software option during your 1-month trial to manage offline registers, tables, order menus, KOT workflow, customer credits, and inventory seamlessly across PC and Android mobile devices.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Billing & Invoicing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Android App POS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Live Table Grids</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> KOT & Kitchen Orders</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Parcel Counters</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Lodging & Rooms</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Stock Inventory</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Credit Management</span>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', borderLeft: '4px solid #0ea5e9' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Owner & Licensing Desk</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              BestBill is founded and owned by <strong>Shubham Pilane</strong>. We provide on-premises setup, hardware configuration guidance, Android APK installation, and direct customization support.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#e2e8f0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="#38bdf8" /> <strong>Founder & Owner:</strong> Shubham Pilane</span>
              <a href="tel:+919822401802" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none' }}><Phone size={16} color="#38bdf8" /> +91 9822401802</a>
              <a href="mailto:bestbillsolutions@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none' }}><Mail size={16} color="#38bdf8" /> bestbillsolutions@gmail.com</a>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* NEW FEATURE: BestBill Android App Showcase Section */}
      <section id="android" style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>
        
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Smartphone size={14} /> NEW FEATURE • NOW ON ANDROID MOBILE
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: 950, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            No PC or Laptop Needed — <span style={{ color: '#10b981' }}>Run 100% On Android</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '17px', maxWidth: '750px', margin: '12px auto 0', lineHeight: 1.6 }}>
            Turn your smartphone or tablet into a fully functional POS terminal! From printing bills to managing raw material stock and customer credit ledgers, experience complete control anywhere.
          </p>
        </AnimatedSection>

        {/* 4 Feature Highlights Grid */}
        <AnimatedSection animation="fade-up" stagger={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          
          <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', borderTop: '3px solid #10b981', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Mobile Bill & KOT Printing</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Print instant thermal receipts and kitchen order tickets directly from your mobile device via Bluetooth or Wi-Fi printers (58mm & 80mm).
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', borderTop: '3px solid #38bdf8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Full Stock & Inventory</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Add raw ingredients, manage recipe mappings, track physical stock levels, and check real-time stock valuation right from mobile.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', borderTop: '3px solid #ec4899', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(236,72,153,0.15)', color: '#ec4899', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Credit Management</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Keep digital ledger accounts for regular customers and vendors. Track outstanding balances and record settlements instantly on your phone.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', borderTop: '3px solid #a855f7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Sales & Analytics Reports</h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Get detailed performance analytics: total dine-in orders, parcel collection summary, cash vs online totals, and export PDF reports easily.
            </p>
          </div>

        </AnimatedSection>

        {/* Special Lifetime Bundle & Gift Printer Banner */}
        <AnimatedSection animation="fade-up" className="glass-card" style={{ padding: '36px', borderRadius: '28px', border: '2px solid #10b981', boxShadow: '0 20px 50px rgba(16, 185, 129, 0.15)', marginBottom: '60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '22px', right: '-34px', backgroundColor: '#ef4444', color: 'white', padding: '10px 50px', transform: 'rotate(25deg)', fontWeight: 950, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.12em', boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)', zIndex: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
            🎁 FREE GIFT
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* Left Column: Image of Thermal Printer wrapped in Gift Ribbon */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', position: 'relative' }}>
                <img 
                  src="/free_thermal_printer_gift.png" 
                  alt="Free Wireless Thermal Receipt Printer Gift" 
                  style={{ width: '100%', maxWidth: '380px', height: 'auto', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }} 
                />
                <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontWeight: 900, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(239,68,68,0.5)' }}>
                  <Gift size={16} /> FREE Wireless Thermal Printer
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Wireless Bluetooth Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, width: 'fit-content' }}>
                <Sparkles size={16} /> LIMITED TIME ANDROID BUNDLE
              </div>
              
              <h3 style={{ fontSize: '32px', fontWeight: 950, color: 'white', lineHeight: 1.2 }}>
                BestBill Android App Lifetime License — <span style={{ color: '#10b981' }}>₹12,000</span>
              </h3>

              <p style={{ color: '#cbd5e1', fontSize: '15.5px', lineHeight: 1.6 }}>
                Get the complete BestBill Android POS Mobile App for a <strong>one-time payment of ₹12,000</strong> (No monthly subscription fees!) and get a <strong>High-Speed Wireless Thermal Receipt Printer FREE</strong> included in the box!
              </p>

              {/* Bluetooth Printing Workflow */}
              <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bluetooth size={16} color="#38bdf8" /> How Wireless Bluetooth Printing Works:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Smartphone size={20} color="#10b981" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>1. Mobile POS App</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Punch order / bill</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.3)' }}>
                    <Bluetooth size={20} color="#38bdf8" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>2. Bluetooth Signal</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Instant wireless pair</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <Printer size={20} color="#ef4444" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>3. Gift Printer</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Prints bill receipt</div>
                  </div>
                </div>
              </div>

              {/* Perks List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} color="#10b981" /> Lifetime License (₹12,000)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} color="#10b981" /> FREE Gift Receipt Printer</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} color="#10b981" /> Zero Monthly Subscription</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} color="#10b981" /> Direct Bluetooth POS Printing</span>
              </div>

              {/* Offer Badge & Phone Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <div 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: 900, fontSize: '15px', width: 'fit-content', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', userSelect: 'none' }}
                >
                  <Sparkles size={18} /> Special Offer: ₹12,000 Lifetime Plan + Free Printer
                </div>

                <a 
                  href="tel:+919822401802" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 900, fontSize: '16px', textDecoration: 'none', transition: 'color 0.2s', width: 'fit-content' }}
                  onMouseEnter={e => e.target.style.color = '#7dd3fc'}
                  onMouseLeave={e => e.target.style.color = '#38bdf8'}
                >
                  <Phone size={18} color="#38bdf8" /> Call / WhatsApp to Order: +91 9822401802
                </a>
              </div>

            </div>

          </div>
        </AnimatedSection>

        {/* Interactive Mobile Screenshots Showcase */}
        <AnimatedSection animation="fade-up" className="glass-card" style={{ padding: '36px', borderRadius: '28px', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em' }}>LIVE MOBILE APP INTERFACE</span>
            <h3 style={{ fontSize: '24px', fontWeight: 900, marginTop: '4px' }}>Explore BestBill Mobile App Screens</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>Click any feature tab below to preview the actual Android interface in action:</p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {mobileShowcaseItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMobileTab(idx)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: activeMobileTab === idx ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: activeMobileTab === idx ? 'rgba(16,185,129,0.2)' : 'rgba(15,23,42,0.6)',
                  color: activeMobileTab === idx ? '#34d399' : '#94a3b8',
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

          {/* Active Screen Display Area */}
          <div className="showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
            
            {/* Screen Details */}
            <div className="showcase-text-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, width: 'fit-content' }}>
                SCREEN {activeMobileTab + 1} OF {mobileShowcaseItems.length}
              </div>
              <h4 style={{ fontSize: '26px', fontWeight: 900, color: 'white' }}>{mobileShowcaseItems[activeMobileTab].title}</h4>
              <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.7 }}>
                {mobileShowcaseItems[activeMobileTab].subtitle}
              </p>
              
              <div style={{ backgroundColor: '#020617', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} /> 100% Touch Optimized Navigation</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} /> Instant ESC/POS Printer Pairing</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} /> Works Completely Offline</span>
              </div>

              <button 
                onClick={handleDownloadAndroid}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#059669', color: 'white', padding: '14px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', border: 'none', marginTop: '12px', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <DownloadCloud size={18} /> Download Android App (.APK)
              </button>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="showcase-image-container" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '300px',
                backgroundColor: '#090d1f',
                borderRadius: '36px',
                padding: '12px',
                border: '4px solid #1e293b',
                boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
                overflow: 'hidden'
              }}>
                {/* Phone Notch */}
                <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '16px', backgroundColor: '#020617', borderRadius: '8px', zIndex: 10 }}></div>
                
                {/* Image */}
                <div style={{ borderRadius: '26px', overflow: 'hidden', backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img 
                    src={mobileShowcaseItems[activeMobileTab].image} 
                    alt={mobileShowcaseItems[activeMobileTab].title}
                    style={{ width: '100%', display: 'block', borderRadius: '24px', cursor: 'pointer', transition: 'transform 0.3s' }}
                    onClick={() => {
                      const idx = screenshots.findIndex(s => s.file === mobileShowcaseItems[activeMobileTab].image.replace('/screenshots/', ''));
                      if (idx !== -1) setSelectedImageIndex(idx);
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </AnimatedSection>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" duration={1} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Key Software Modules</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Powering every aspect of your hospitality or retail venue offline on Desktop & Mobile.</p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Restaurant & Hotel Billing */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Restaurant & Hotel Billing</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Fast Invoicing System</li>
              <li>GST Ready Billing</li>
              <li>Professional Invoice Printing</li>
              <li>58mm & 80mm Thermal Printer Support</li>
              <li>Android Bluetooth Thermal Printing</li>
            </ul>
          </div>

          {/* Table Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Table & Floor Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Table-wise Billing</li>
              <li>Section-wise Floor Grids</li>
              <li>Real-time Occupied / Available Status</li>
              <li>Mobile Table Ordering</li>
            </ul>
          </div>

          {/* Parcel Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Parcel & Token Counter</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Dedicated Parcel Counter</li>
              <li>Quick Parcel Billing</li>
              <li>Fast Food Token Counter</li>
              <li>Mobile Quick Search</li>
            </ul>
          </div>

          {/* KOT Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(20,184,166,0.1)', color: '#14b8a6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coffee size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>KOT Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>KOT Ticket Generation</li>
              <li>Direct Kitchen Printing</li>
              <li>Kitchen Order Tracking</li>
              <li>Waiter Order Management</li>
            </ul>
          </div>

          {/* Credit Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Credit Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Customer Credit Ledger</li>
              <li>Vendor Credit Tracking</li>
              <li>Outstanding Balance Audit</li>
              <li>Mobile Credit Settlement</li>
            </ul>
          </div>

          {/* Inventory Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Inventory Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Raw Material Stock Tracking</li>
              <li>Low Stock Warnings</li>
              <li>Total Stock Valuation Audit</li>
              <li>Mobile Inventory Audit</li>
            </ul>
          </div>

          {/* Lodging & Room Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Lodging & Room Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Room Management & Tariffs</li>
              <li>Guest Check-In & Check-Out</li>
              <li>Lodging Invoicing</li>
            </ul>
          </div>

          {/* Billing History & Reports */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Billing History & Reports</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Detailed Billing History</li>
              <li>Daily, Monthly & Yearly Reports</li>
              <li>PDF Export capabilities</li>
              <li>Mobile Sales Breakdown</li>
            </ul>
          </div>

          {/* User Experience */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>User Experience</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Rich & Modern Dark Theme</li>
              <li>Easy to Learn & High Speed</li>
              <li>Zero PC Requirement on Mobile</li>
            </ul>
          </div>

        </AnimatedSection>
      </section>

      {/* Product Video & Screenshots Gallery */}
      <section id="gallery" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#0ea5e9', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em' }}>Visual Tour</span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', textTransform: 'uppercase' }}>Gallery (Screenshots & Video)</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Inspect the full interface of BestBill on Desktop PC and Android Mobile.</p>
        </AnimatedSection>

        {/* Gallery Filter Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <button
            onClick={() => setGalleryFilter('all')}
            style={{ padding: '8px 20px', borderRadius: '100px', border: galleryFilter === 'all' ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)', backgroundColor: galleryFilter === 'all' ? '#0ea5e9' : 'rgba(30,41,59,0.5)', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            All ({screenshots.length})
          </button>
          <button
            onClick={() => setGalleryFilter('desktop')}
            style={{ padding: '8px 20px', borderRadius: '100px', border: galleryFilter === 'desktop' ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)', backgroundColor: galleryFilter === 'desktop' ? '#0ea5e9' : 'rgba(30,41,59,0.5)', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Laptop size={14} /> Desktop PC (10)
          </button>
          <button
            onClick={() => setGalleryFilter('mobile')}
            style={{ padding: '8px 20px', borderRadius: '100px', border: galleryFilter === 'mobile' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', backgroundColor: galleryFilter === 'mobile' ? '#10b981' : 'rgba(30,41,59,0.5)', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Smartphone size={14} /> Android POS (5)
          </button>
          <button
            onClick={() => setGalleryFilter('admin')}
            style={{ padding: '8px 20px', borderRadius: '100px', border: galleryFilter === 'admin' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', backgroundColor: galleryFilter === 'admin' ? '#38bdf8' : 'rgba(30,41,59,0.5)', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={14} /> Admin App (3)
          </button>
        </div>

        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          
          {/* Demo Video Player */}
          <AnimatedSection animation="slide-right" className="glass-card gallery-video-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Product Walkthrough Video</h3>
            <div style={{ width: '100%', backgroundColor: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <iframe 
                src="https://www.youtube.com/embed/X3W4eDhLImU"
                title="BestBill KOT Workflow Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: '100%', aspectRatio: '9/16', maxHeight: '500px', display: 'block' }}
              ></iframe>
            </div>
          </AnimatedSection>

          {/* Screenshots Gallery */}
          <AnimatedSection animation="slide-left" className="glass-card gallery-card gallery-photos-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Application Screenshot Gallery</span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Click any image to enlarge</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', overflowY: 'auto', maxHeight: '550px', paddingRight: '8px' }} className="custom-scrollbar">
              
              {filteredScreenshots.map((ss, idx) => {
                const globalIndex = screenshots.findIndex(s => s.file === ss.file);
                return (
                  <div key={idx} style={{ backgroundColor: '#090d1f', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = ss.category === 'mobile' ? '#10b981' : '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: ss.category === 'mobile' ? '#34d399' : '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{ss.title}</span>
                      <span style={{ fontSize: '9px', backgroundColor: ss.category === 'mobile' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.1)', color: ss.category === 'mobile' ? '#34d399' : '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        {ss.platform}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '160px', backgroundColor: '#020617', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)', position: 'relative' }}>
                      <img 
                        src={`/screenshots/${ss.file}`} 
                        alt={ss.title} 
                        style={{ width: '100%', height: '100%', objectFit: ss.category === 'mobile' ? 'contain' : 'cover', cursor: 'pointer', transition: 'transform 0.3s' }} 
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onClick={() => setSelectedImageIndex(globalIndex)}
                      />
                    </div>
                  </div>
                );
              })}

            </div>
          </AnimatedSection>

        </div>
      </section>

      {/* User Manual & Documents */}
      <AnimatedSection id="manual" animation="fade-up" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', borderLeft: '4px solid #38bdf8' }}>
            <span style={{ color: '#38bdf8', fontWeight: 900, textTransform: 'uppercase', fontSize: '11px' }}>User Manuals & Docs</span>
            <h3 style={{ fontSize: '24px', fontWeight: 900, marginTop: '8px', marginBottom: '16px' }}>Documentation Guide</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Access the complete BestBill offline guide. Learn printer port mapping, Bluetooth mobile thermal setup, KOT settings, layout customization, and database backup configurations step by step.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  toast.success("Starting User Manual PDF download...");
                  window.location.href = '/downloads/BestBill_User_Manual.pdf';
                }}
                style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={16} /> User Manual PDF
              </button>
            </div>
          </div>
          <div>
            <span style={{ color: '#0ea5e9', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em' }}>Operation Guide</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>Workflow Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Quick Installation</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Install executable on Windows PC or APK on any Android mobile phone / tablet.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Hardware & Thermal Printer Setup</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Pair Bluetooth or USB thermal receipt printer (58mm or 80mm paper size).</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Load Categories & Start Billing</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Populate food menus, floor tables, raw material stock, and start billing offline.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Plans Section */}
      <section id="plans" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Software Packages</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Select the package setup suitable for your business layout.</p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.2} style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Basic Plan */}
          <div className="glass-card" style={{ padding: '40px', borderRadius: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended for Cafes & Small Outlets</span>
              <h3 style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px' }}>Basic Plan</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
              Standard suite designed for small hotels, cafes, and food points to manage billing registers on PC or Android.
            </p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Windows PC & Android App</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Fast Billing & Invoicing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Table & Floor Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Parcel Counter & Token POS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Credit Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Menu Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Billing Reports & Exports</span>
            </div>
          </div>

          {/* Gold Plan */}
          <div className="glass-card" style={{ padding: '40px', borderRadius: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px', border: '2px solid #0ea5e9', boxShadow: '0 20px 40px rgba(14,165,233,0.1)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>All-in-One Enterprise POS</span>
              <h3 style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px' }}>Gold Plan</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
              A complete, unified solution covering advanced stock inventory, lodging books, and kitchen monitors across PC & Mobile.
            </p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>★ Everything in Basic Plan Plus:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Advanced Raw Material Inventory</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> KOT Queue & Direct Kitchen Print</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Bluetooth Mobile Printing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Waiter Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Lodging & Room Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Advanced Analytics & PDF Export</span>
            </div>
          </div>

        </AnimatedSection>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Pricing Plans</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Transparent pricing for PC & Android setup. Select your subscription period.</p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.15} style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
          
          {/* Monthly */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Monthly Plan</span>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', margin: '12px 0' }}>₹499</div>
            <span style={{ color: '#64748b', fontSize: '12px' }}>billed monthly</span>
          </div>

          {/* Yearly */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', border: '1px solid rgba(56,189,248,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>Yearly Plan</span>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8', margin: '12px 0' }}>₹5,999</div>
            <span style={{ color: '#64748b', fontSize: '12px' }}>billed annually</span>
          </div>

          {/* Android Lifetime Combo Offer */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', border: '2px solid #10b981', boxShadow: '0 12px 30px rgba(16,185,129,0.15)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '100px' }}>🎁 Android Combo Offer</span>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#34d399', margin: '12px 0 4px' }}>₹12,000</div>
            <div style={{ color: '#a7f3d0', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Lifetime License + FREE Printer</div>
            <span style={{ color: '#64748b', fontSize: '11px' }}>One-time payment • Zero monthly fee</span>
          </div>

          {/* Desktop Lifetime */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Desktop Lifetime</span>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', margin: '12px 0' }}>₹14,999</div>
            <span style={{ color: '#64748b', fontSize: '12px' }}>one-time PC license</span>
          </div>

        </AnimatedSection>

        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>For detailed information regarding Basic Plan, Gold Plan, Android APK setup, and licensing, please contact customer care.</strong>
          </p>
          <a href="tel:+919822401802" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '18px', fontWeight: 900, textDecoration: 'none' }}>
            <Phone size={18} /> +91 9822401802
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ maxWidth: '850px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Frequently Asked Questions</h2>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.1} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              style={{ backgroundColor: 'rgba(30,41,59,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                <span>{faq.q}</span>
                {activeFaq === index ? <ChevronUp size={18} color="#0ea5e9" /> : <ChevronDown size={18} color="#94a3b8" />}
              </div>
              
              {activeFaq === index && (
                <div style={{ padding: '0 24px 20px', color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '16px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </AnimatedSection>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 100px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
          
          <AnimatedSection animation="slide-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Contact Us</h2>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>Get in touch directly with the BestBill founder for product activation, Android APK setup, custom bills, or service desk configuration.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#cbd5e1', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={16} color="#0ea5e9" />
                <span><strong>Founder & Owner:</strong> Shubham Pilane</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={16} color="#0ea5e9" />
                <a href="tel:+919822401802" style={{ color: '#cbd5e1', textDecoration: 'none' }}>+91 9822401802</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={16} color="#0ea5e9" />
                <a href="mailto:bestbillsolutions@gmail.com" style={{ color: '#cbd5e1', textDecoration: 'none' }}>bestbillsolutions@gmail.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={16} color="#0ea5e9" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slide-left" className="glass-card" style={{ padding: '36px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Inquiry Form</h3>
            
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 600 }}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 600 }}
                  placeholder="e.g. rahul@example.com"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Mobile Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 600 }}
                  placeholder="e.g. +91 9822401802"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Message / Requirements</label>
                <textarea 
                  name="message" 
                  rows={3} 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#020617', color: 'white', outline: 'none', fontWeight: 600, resize: 'none' }}
                  placeholder="Inquire about pricing, Android APK setup, or Gold plan modules..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ width: '100%', padding: '14px', backgroundColor: '#0ea5e9', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}
                onMouseEnter={e => e.target.style.backgroundColor = '#0284c7'}
                onMouseLeave={e => e.target.style.backgroundColor = '#0ea5e9'}
              >
                {isSubmitting ? "Sending..." : "Submit Inquiry"} <ArrowRight size={14} />
              </button>
            </form>
          </AnimatedSection>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#010409', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img src="/logo.svg" alt="BestBill Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <span style={{ fontSize: '18px', fontWeight: 800 }}>BestBill Offline POS (Windows & Android)</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
          Founder & Owner: <strong>Shubham Pilane</strong> | Phone: +91 9822401802 | Email: bestbillsolutions@gmail.com
        </p>
        <p style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>© {new Date().getFullYear()} BestBill Software. All rights reserved.</p>
      </footer>

      {/* Download Choice Modal */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.9)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(10px)', padding: '24px'
        }}
        onClick={() => setShowDownloadModal(false)}
        >
          <div style={{
            backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '28px', maxWidth: '850px', width: '100%', padding: '36px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', position: 'relative'
          }}
          onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowDownloadModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', width: '36px', height: '36px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(14,165,233,0.15)', color: '#0ea5e9', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Download size={24} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 900 }}>Select Download Platform</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>Choose the edition of BestBill you want to download:</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              
              {/* Windows Option */}
              <div 
                onClick={handleDownloadWindows}
                style={{ backgroundColor: '#020617', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '20px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s', textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', borderRadius: '10px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Laptop size={20} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800 }}>Windows PC Edition</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>
                  BestBill Setup 1.0.0.exe for Windows 10 & 11 POS billing stations.
                </p>
                <button style={{ width: '100%', marginTop: 'auto', padding: '10px', backgroundColor: '#0ea5e9', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Download size={14} /> Download .EXE
                </button>
              </div>

              {/* Android Option */}
              <div 
                onClick={handleDownloadAndroid}
                style={{ backgroundColor: '#020617', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s', textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '10px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={20} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800 }}>Android Mobile Edition</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>
                  BestBill Mobile POS APK for Android phones & tablets (No PC needed).
                </p>
                <button style={{ width: '100%', marginTop: 'auto', padding: '10px', backgroundColor: '#059669', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Download size={14} /> Download .APK
                </button>
              </div>

              {/* Admin Remote App Option */}
              <div 
                onClick={handleDownloadAdminApk}
                style={{ backgroundColor: '#020617', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '20px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s', textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: '10px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800 }}>Admin Remote App</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>
                  Monitor store live sales & analytics remotely from anywhere in the world.
                </p>
                <button style={{ width: '100%', marginTop: 'auto', padding: '10px', backgroundColor: '#0284c7', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Download size={14} /> Download Admin APK
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ backgroundColor: screenshots[selectedImageIndex].category === 'mobile' ? '#10b981' : '#0ea5e9', padding: '4px 12px', borderRadius: '24px', fontSize: '13px' }}>
                {selectedImageIndex + 1} / {screenshots.length} • {screenshots[selectedImageIndex].platform}
              </span>
              {screenshots[selectedImageIndex].title}
            </div>
            <button 
              onClick={() => setSelectedImageIndex(null)}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '48px', height: '48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <X size={24} />
            </button>
          </div>

          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => prev === 0 ? screenshots.length - 1 : prev - 1);
            }}
            style={{ position: 'absolute', left: '24px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => prev === screenshots.length - 1 ? 0 : prev + 1);
            }}
            style={{ position: 'absolute', right: '24px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            <ChevronRight size={32} />
          </button>

          {/* Image Container */}
          <div 
            style={{ width: '90%', height: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}
            onClick={() => setSelectedImageIndex(null)}
          >
            <img 
              src={`/screenshots/${screenshots[selectedImageIndex].file}`} 
              alt={screenshots[selectedImageIndex].title}
              style={{ maxWidth: '100%', maxHeight: '85%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              onClick={e => e.stopPropagation()}
            />
            {screenshots[selectedImageIndex].desc && (
              <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 600, backgroundColor: 'rgba(15,23,42,0.8)', padding: '8px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                {screenshots[selectedImageIndex].desc}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
