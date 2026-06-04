import React, { useState, useRef } from 'react';
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
  ChevronRight
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
  const pageRef = React.useRef(null);

  const screenshots = [
    { title: "Login Page", file: "Login Page.png" },
    { title: "Table Dashboard", file: "Table Dashboard.png" },
    { title: "Menu Management", file: "Menu Mangement.png" },
    { title: "Room Management", file: "Room Mangement.png" },
    { title: "Credit Management", file: "Credit Mangement.png" },
    { title: "Credit Settlement", file: "Credit Settlement.png" },
    { title: "Inventory Management", file: "Inventory Mangement.png" },
    { title: "Billing History", file: "Billing History.png" },
    { title: "Collection Record", file: "Collection Record.png" },
    { title: "Item Sales Report", file: "Item Sales Report.png" }
  ];

  const faqs = [
    {
      q: "Does BestBill require an internet connection?",
      a: "No! BestBill is a 100% offline-first application. Once installed on your Windows PC or billing terminal, it runs entirely on local database infrastructure, meaning your store operates at full speed even during internet blackouts."
    },
    {
      q: "How does billing and thermal printing work offline?",
      a: "BestBill communicates directly with your POS thermal printer via local driver protocols (ESC/POS). You can set up your printer size (58mm or 80mm) and print bills instantly."
    },
    {
      q: "Can I manage hotel room bookings alongside table orders?",
      a: "Yes! BestBill features a comprehensive lodging module, allowing hotel owners to manage room statuses, track guest ordering, and settle room charges in one unified layout."
    },
    {
      q: "How do I back up my billing data?",
      a: "Since all data is stored locally on your machine, you can configure automatic daily backups to an external USB drive or local backup path within the application settings."
    },
    {
      q: "What are the hardware requirements?",
      a: "BestBill is highly optimized. It runs smoothly on any PC running Windows 10 or 11 with at least 4GB of RAM and standard screen resolutions."
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

  const handleDownloadClick = () => {
    toast.success("Starting BestBill Setup download...", { icon: '🚀' });
    const link = document.createElement('a');
    link.href = 'https://storage.googleapis.com/bestbill-public-logos/BestBill%20Setup%201.0.0.exe';
    link.setAttribute('download', 'BestBill Setup 1.0.0.exe');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
          </div>

          <nav className="nav-menu" style={{ gap: '24px' }}>
            <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>About</a>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Features</a>
            <a href="#gallery" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Gallery</a>
            <a href="#plans" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Plans</a>
            <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Pricing</a>
            <a href="#contact" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#38bdf8'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Contact</a>
          </nav>

          <button 
            onClick={handleDownloadClick}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0ea5e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            <Download size={14} /> Download
          </button>
        </div>
        <style>{`
          .nav-menu {
            display: flex;
            align-items: center;
          }
          @media (max-width: 768px) {
            .nav-menu {
              display: none;
            }
          }
        `}</style>
      </header>

      {/* Hero Section */}
      <section className="hero-section hero-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', top: '10%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(40px)', zIndex: -1 }}></div>

        {/* Free Promotional Banner */}
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '24px', padding: '12px 32px', marginBottom: '32px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' }}>
          <div style={{ fontSize: '28px', fontWeight: 1000, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE TO USE</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#a7f3d0', marginTop: '2px' }}>Free for 1 Month Trial</div>
        </div>

        <h1 style={{ fontSize: '56px', fontWeight: 950, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: '900px', margin: '0 auto 24px', textTransform: 'uppercase' }}>
          Hotel & Restaurant <br/>
          <span style={{ background: 'linear-gradient(to right, #38bdf8, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management Software</span>
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '650px', margin: '0 auto 40px', fontWeight: 500, lineHeight: 1.6 }}>
          Run your billing, kitchen workflows, tables, guest lodging, and stock inventory entirely offline. Get the best hotel billing software and POS terminal operations with a free hotel billing software trial for 1 month.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDownloadClick}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0ea5e9', border: 'none', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            <Download size={20} /> Download BestBill
          </button>
          
          <a 
            href="tel:+919822401802"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', padding: '16px 32px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.borderColor = 'rgba(56,189,248,0.3)'}
            onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
          >
            <Phone size={16} /> Contact Customer Care
          </a>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '20px', color: '#64748b', fontSize: '12px', fontWeight: 700, flexWrap: 'wrap' }}>
          <span>✓ Local Data Safety</span>
          <span>✓ Direct Printer Connection</span>
          <span>✓ Windows 10/11 POS Ready</span>
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
              BestBill is a professional, complete hotel billing software and restaurant management solution. Designed to support high-speed local business operations, it operates as the ultimate free hotel billing software option during your 1-month trial to manage offline registers, tables, order menus, KOT workflow, and customer credits seamlessly.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Billing & Invoicing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Live Table Grids</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> KOT & Kitchen Orders</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Parcel Counters</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Lodging & Rooms</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Stock Inventory</span>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', borderLeft: '4px solid #0ea5e9' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Owner & Licensing Desk</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              BestBill is founded and owned by <strong>Shubham Pilane</strong>. We provide on-premises setup, hardware configuration guidance, and direct customization support.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#e2e8f0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="#38bdf8" /> <strong>Founder & Owner:</strong> Shubham Pilane</span>
              <a href="tel:+919822401802" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none' }}><Phone size={16} color="#38bdf8" /> +91 9822401802</a>
              <a href="mailto:bestbillsolutions@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none' }}><Mail size={16} color="#38bdf8" /> bestbillsolutions@gmail.com</a>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" duration={1} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Key Software Modules</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Powering every aspect of your hospitality or retail venue offline.</p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Restaurant & Hotel Billing */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Restaurant & Hotel Billing</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Fast Billing System</li>
              <li>GST Ready Billing</li>
              <li>Professional Invoice Printing</li>
              <li>58mm & 80mm Printer Support</li>
            </ul>
          </div>

          {/* Table Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Table Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Table-wise Billing</li>
              <li>Section-wise Table Management</li>
              <li>Real-time Table Status</li>
              <li>Occupied / Available Tracking</li>
            </ul>
          </div>

          {/* Parcel Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Parcel Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Dedicated Parcel Counter</li>
              <li>Quick Parcel Billing</li>
              <li>Parcel Order Tracking</li>
            </ul>
          </div>

          {/* KOT Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(20,184,166,0.1)', color: '#14b8a6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coffee size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>KOT Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>KOT Generation</li>
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
              <li>Customer Credit Tracking</li>
              <li>Vendor Credit Tracking</li>
              <li>Outstanding Balance Management</li>
              <li>Credit Settlement Tracking</li>
            </ul>
          </div>

          {/* Inventory Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Inventory Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Stock Management</li>
              <li>Inventory Tracking</li>
              <li>Purchase Management</li>
              <li>Item Consumption Reports</li>
            </ul>
          </div>

          {/* Lodging & Room Management */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Lodging & Room Management</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Room Management</li>
              <li>Guest Check-In</li>
              <li>Guest Check-Out</li>
              <li>Lodging Billing</li>
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
            </ul>
          </div>

          {/* Printer Integration */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Printer Integration</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Counter Printer Support</li>
              <li>Kitchen Printer Support</li>
              <li>Direct Bill & KOT Printing</li>
            </ul>
          </div>

          {/* User Experience */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>User Experience</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Rich & User-Friendly Interface</li>
              <li>Easy to Learn & High Performance</li>
              <li>Minimal Training Required for Staff</li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(20,184,166,0.1)', color: '#14b8a6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartHandshake size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Customer Support</h3>
            <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Lifetime Software Support</li>
              <li>Continuous Software Updates</li>
              <li>Expert Onsite Installation Guidance</li>
            </ul>
          </div>

        </AnimatedSection>
      </section>

      {/* Product Video & Screenshots Gallery */}
      <section id="gallery" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: '#0ea5e9', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em' }}>Visual Guide</span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', textTransform: 'uppercase' }}>Gallery (Screenshots & Videos)</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Take a visual tour of the BestBill interface and product demo video.</p>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          
          {/* Demo Video Player */}
          <AnimatedSection animation="slide-right" className="glass-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <AnimatedSection animation="slide-left" className="glass-card gallery-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Application Screenshot Gallery</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', overflowY: 'auto', maxHeight: '550px', paddingRight: '8px' }} className="custom-scrollbar">
              
              {screenshots.map((ss, idx) => (
                <div key={idx} style={{ backgroundColor: '#090d1f', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ss.title}</span>
                    <span style={{ fontSize: '9px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>STEP {idx + 1}</span>
                  </div>
                  <div style={{ width: '100%', height: '160px', backgroundColor: '#020617', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <img 
                      src={`/screenshots/${ss.file}`} 
                      alt={ss.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s' }} 
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => setSelectedImageIndex(idx)}
                    />
                  </div>
                </div>
              ))}

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
              Access the complete BestBill offline guide. Learn printer port mapping, KOT settings, layout customization, and database backup configurations step by step.
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
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Install the native executable on your local billing desktop station.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Hardware Integrations</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Map local thermal receipt printer ports and configure paper feed size.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Load Categories & Billing</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Populate your food/beverage menus, assign table grids, and start billing offline.</p>
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
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Select the standard plan setup suitable for your business layout.</p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={0.2} style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Basic Plan */}
          <div className="glass-card" style={{ padding: '40px', borderRadius: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended for Cafes & Small Hotels</span>
              <h3 style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px' }}>Basic Plan</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
              Standard suite designed for small hotels, cafes, and local food points to manage offline registers.
            </p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Billing Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Table Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Parcel Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Credit Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Menu Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Billing History & Reports</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Printer Integration</span>
            </div>
          </div>

          {/* Gold Plan */}
          <div className="glass-card" style={{ padding: '40px', borderRadius: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px', border: '2px solid #0ea5e9', boxShadow: '0 20px 40px rgba(14,165,233,0.1)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>All-in-One Enterprise POS</span>
              <h3 style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px' }}>Gold Plan</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>
              A complete, unified terminal solution covering advanced stock flow, lodging books, and kitchen monitors.
            </p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '#10b981', color: '#38bdf8' }}>★ Everything in Basic Plan Plus:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Inventory Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> KOT System & Queue Display</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Direct Kitchen Printing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Waiter Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Lodging & Room Management</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#0ea5e9" /> Advanced Reporting Analytics</span>
            </div>
          </div>

        </AnimatedSection>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Pricing Plans</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Transparent pricing. Select the subscription period that fits your business model.</p>
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

          {/* Lifetime */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Lifetime License</span>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', margin: '12px 0' }}>₹14,999</div>
            <span style={{ color: '#64748b', fontSize: '12px' }}>one-time payment</span>
          </div>

        </AnimatedSection>

        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>For detailed information regarding Basic Plan, Gold Plan, installation, and licensing, please contact customer care.</strong>
          </p>
          <a href="tel:+919822401802" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '18px', fontWeight: 900, textDecoration: 'none' }}>
            <Phone size={18} /> +91 9822401802
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
              <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>Get in touch directly with the BestBill founder for product activation, custom bills, or service desk configuration.</p>
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
                  placeholder="Inquire about pricing, setup, or Gold plan modules..."
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
          <span style={{ fontSize: '18px', fontWeight: 800 }}>BestBill Offline POS</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
          Founder & Owner: <strong>Shubham Pilane</strong> | Phone: +91 9822401802 | Email: bestbillsolutions@gmail.com
        </p>
        <p style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>© {new Date().getFullYear()} BestBill Software. All rights reserved. Windows is a trademark of Microsoft Corporation.</p>
      </footer>

      {/* Image Gallery Modal */}
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
              <span style={{ backgroundColor: '#0ea5e9', padding: '4px 12px', borderRadius: '24px', fontSize: '14px' }}>
                {selectedImageIndex + 1} / {screenshots.length}
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
            style={{ width: '90%', height: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => setSelectedImageIndex(null)}
          >
            <img 
              src={`/screenshots/${screenshots[selectedImageIndex].file}`} 
              alt={screenshots[selectedImageIndex].title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
