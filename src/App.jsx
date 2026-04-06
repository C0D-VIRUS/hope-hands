// THIS SHOULD BE AT THE VERY TOP (LINE 1):
import { useState, useEffect } from 'react';
import { fetchRequests, createRequest, fetchSession, logoutSession } from './lib/api';
import HopeDonationModal from './components/DonationModal';
import NgoPortalPage from './components/NgoPortalPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import riceWheatImg from "./assets/rice-wheat.jpg";
import blankets from "./assets/blankets.jpg";
import warm from "./assets/warm.jpg";
import lentils from "./assets/lentils.webp";
import books from "./assets/books.jpg";
import laptops from "./assets/laptops.jpg";
import stationery from "./assets/stationery.avif";
import medi from "./assets/medi.avif";
import hmaam from "./assets/hmaam.jpg";
import mep from "./assets/mep.jpeg";


// ============================================================
// MOCK DATA
// ============================================================
const INITIAL_REQUESTS = [
  {
    id: 1,
    itemName: "Rice & Wheat",
    category: "Grains",
    quantity: "200 kg",
    description: "Needed for 50 families in the Pune region. Dry grains only, no perishables.",
    image: riceWheatImg,
    contact: "aid@hopehands.org",
    urgent: true,
  },
  {
    id: 2,
    itemName: "Books",
    category: "Books",
    quantity: "500 books",
    description: "Primary school textbooks and story books for a rural school with 120 students.",
    image: books,
    contact: "edu@hopehands.org",
    urgent: false,
  },
  {
    id: 3,
    itemName: "Winter Blankets",
    category: "Blankets",
    quantity: "150 pieces",
    description: "Thick woolen blankets for homeless families ahead of winter. Clean and undamaged only.",
    image: blankets,
    contact: "relief@hopehands.org",
    urgent: true,
  },
  {
    id: 4,
    itemName: "Used Laptops",
    category: "Electronics",
    quantity: "30 units",
    description: "Working laptops or tablets for a digital literacy program at a community center.",
    image: laptops,
    contact: "tech@hopehands.org",
    urgent: false,
  },
  {
    id: 5,
    itemName: "Warm Clothes",
    category: "Clothes",
    quantity: "300 pieces",
    description: "Gently used winter clothes for all ages. Clean, no tears. Vital for those in need around Pune.",
    image: warm,
    contact: "clothes@hopehands.org",
    urgent: false,
  },
  {
    id: 6,
    itemName: "Stationery Kits",
    category: "Stationery",
    quantity: "200 kits",
    description: "Pens, pencils, notebooks, and geometry sets for underprivileged school children.",
    image: stationery,
    contact: "edu@hopehands.org",
    urgent: false,
  },
  {
    id: 7,
    itemName: "First Aid Supplies",
    category: "Medical",
    quantity: "100 kits",
    description: "Bandages, antiseptics, ORS, and basic medicines.",
    image: medi,
    contact: "medical@hopehands.org",
    urgent: true,
  },
  {
    id: 8,
    itemName: "Lentils & Pulses",
    category: "Grains",
    quantity: "20 kg",
    description: "Dry lentils and chickpeas for a community kitchen serving 200 daily meals.",
    image: lentils,
    contact: "food@hopehands.org",
    urgent: false,
  },
];

const CATEGORIES = ["All", "Grains", "Books", "Clothes", "Electronics", "Stationery", "Blankets", "Medical"];
const QUANTITY_UNITS = ["kg", "grams", "pieces", "books", "kits", "units", "boxes", "packs", "sets"];

// ============================================================
// CSS STYLES (injected)
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal: #2a7c6f;
    --teal-light: #3a9b8a;
    --teal-pale: #e8f5f2;
    --amber: #d97706;
    --amber-light: #fbbf24;
    --cream: #fdf9f4;
    --sand: #f5ede0;
    --text: #1a2e2b;
    --text-muted: #5a7370;
    --white: #ffffff;
    --card-shadow: 0 4px 24px rgba(42,124,111,0.10);
    --radius: 14px;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--text);
    min-height: 100vh;
  }

  /* ---- NAVBAR ---- */
  .navbar {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(42,124,111,0.12);
    padding: 0 5%;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
    transition: box-shadow 0.3s;
  }
  .navbar.scrolled { box-shadow: 0 2px 20px rgba(42,124,111,0.12); }

  .logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; font-weight: 700;
    color: var(--teal); text-decoration: none;
    cursor: pointer;
  }
  .logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--teal);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.1rem;
  }

  .nav-links {
    display: flex; gap: 8px; list-style: none;
  }
  .nav-links a {
    font-size: 0.92rem; font-weight: 500; padding: 6px 14px;
    border-radius: 8px; cursor: pointer;
    color: var(--text-muted); text-decoration: none;
    transition: all 0.2s;
  }
  .nav-links a:hover, .nav-links a.active { color: var(--teal); background: var(--teal-pale); }

  .nav-cta {
    background: var(--teal); color: white !important;
    padding: 8px 20px !important; border-radius: 10px !important;
    font-weight: 600 !important;
  }
  .nav-cta:hover { background: var(--teal-light) !important; color: white !important; }

  .hamburger {
    display: none; flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 4px;
  }
  .hamburger span { width: 24px; height: 2px; background: var(--teal); border-radius: 2px; transition: all 0.3s; display: block; }

  .mobile-menu {
    display: none; position: fixed; top: 68px; left: 0; right: 0;
    background: white; padding: 20px 5%; border-bottom: 1px solid #eee;
    flex-direction: column; gap: 4px; z-index: 99;
  }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { padding: 12px 16px; border-radius: 10px; color: var(--text); cursor: pointer; font-weight: 500; }
  .mobile-menu a:hover { background: var(--teal-pale); color: var(--teal); }

  @media(max-width: 768px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
  }

  /* ---- BUTTONS ---- */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 12px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: all 0.25s; text-decoration: none;
  }
  .btn-primary { background: var(--teal); color: white; }
  .btn-primary:hover { background: var(--teal-light); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(42,124,111,0.35); }
  .btn-outline { background: transparent; color: var(--teal); border: 2px solid var(--teal); }
  .btn-outline:hover { background: var(--teal); color: white; transform: translateY(-2px); }
  .btn-amber { background: var(--amber); color: white; }
  .btn-amber:hover { background: var(--amber-light); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(217,119,6,0.35); }
  .btn-sm { padding: 8px 18px; font-size: 0.85rem; border-radius: 8px; }

  /* ---- HERO ---- */
  .hero {
    position: relative; min-height: 88vh;
    display: flex; align-items: center; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&h=900&fit=crop') center/cover no-repeat;
  }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(26,46,43,0.82) 0%, rgba(42,124,111,0.55) 60%, transparent 100%);
  }
  .hero-content {
    position: relative; z-index: 2; padding: 0 8% 0 8%;
    max-width: 680px;
    animation: fadeInUp 0.9s ease both;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.25);
    color: white; padding: 6px 16px; border-radius: 50px;
    font-size: 0.82rem; font-weight: 600; letter-spacing: 0.05em;
    margin-bottom: 24px; text-transform: uppercase;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.4rem, 5vw, 3.6rem);
    color: white; line-height: 1.2; margin-bottom: 20px;
  }
  .hero h1 span { color: var(--amber-light); }
  .hero p {
    font-size: 1.08rem; color: rgba(255,255,255,0.85);
    line-height: 1.7; margin-bottom: 36px; max-width: 520px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .hero-stats {
    position: absolute; bottom: 40px; left: 8%; right: 8%; z-index: 2;
    display: flex; gap: 32px;
    animation: fadeInUp 1.1s 0.3s ease both;
  }
  .stat-pill {
    background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 14px 24px; border-radius: 14px; color: white; text-align: center;
  }
  .stat-pill strong { display: block; font-size: 1.6rem; font-family: 'Playfair Display', serif; }
  .stat-pill span { font-size: 0.78rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.04em; }

  @media(max-width: 600px) {
    .hero-stats { gap: 12px; }
    .stat-pill { padding: 10px 16px; }
    .stat-pill strong { font-size: 1.2rem; }
  }

  /* ---- SECTIONS ---- */
  .section { padding: 80px 8%; }
  .section-sm { padding: 60px 8%; }
  .section-alt { background: var(--sand); }
  .section-teal { background: var(--teal); }
  .section-header { text-align: center; margin-bottom: 56px; }
  .section-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3.5vw, 2.4rem);
    color: var(--text); margin-bottom: 12px;
  }
  .section-header p { color: var(--text-muted); font-size: 1rem; max-width: 560px; margin: 0 auto; line-height: 1.7; }
  .section-tag {
    display: inline-block; font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--teal); background: var(--teal-pale);
    padding: 4px 14px; border-radius: 50px; margin-bottom: 14px;
  }

  /* ---- FEATURE CARDS ---- */
  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
  }
  .feature-card {
    background: white; border-radius: var(--radius);
    padding: 32px 24px;
    box-shadow: var(--card-shadow);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid rgba(42,124,111,0.06);
  }
  .feature-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(42,124,111,0.15); }
  .feature-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--teal-pale); display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 1.05rem; font-weight: 600; color: var(--text); margin-bottom: 10px; }
  .feature-card p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.65; }

  /* ---- REQUEST CARDS ---- */
  .requests-controls {
    display: flex; flex-wrap: wrap; gap: 16px;
    align-items: center; justify-content: space-between;
    margin-bottom: 36px;
  }
  .search-bar {
    display: flex; align-items: center; gap: 10px;
    background: white; border: 1.5px solid rgba(42,124,111,0.2);
    border-radius: 12px; padding: 10px 16px; flex: 1; max-width: 340px;
  }
  .search-bar input {
    border: none; outline: none; font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem; color: var(--text); background: transparent; width: 100%;
  }
  .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-tab {
    padding: 7px 16px; border-radius: 10px; border: 1.5px solid rgba(42,124,111,0.2);
    background: white; font-size: 0.82rem; font-weight: 500; color: var(--text-muted);
    cursor: pointer; transition: all 0.2s;
  }
  .filter-tab.active, .filter-tab:hover { background: var(--teal); color: white; border-color: var(--teal); }

  .requests-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  .request-card {
    background: white; border-radius: var(--radius);
    overflow: hidden; box-shadow: var(--card-shadow);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid rgba(42,124,111,0.06);
    display: flex; flex-direction: column;
  }
  .request-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(42,124,111,0.15); }
  .card-img { width: 100%; height: 190px; object-fit: cover; display: block; }
  .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
  .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .card-category {
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--teal); background: var(--teal-pale); padding: 3px 10px; border-radius: 50px;
  }
  .urgent-badge {
    font-size: 0.7rem; font-weight: 700; color: #dc2626;
    background: #fee2e2; padding: 3px 10px; border-radius: 50px;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .card-body h3 { font-size: 1.05rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .card-qty { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px; }
  .card-qty strong { color: var(--teal); }
  .card-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; flex: 1; margin-bottom: 18px; }
  .card-footer { border-top: 1px solid #f0f0f0; padding-top: 14px; }

  /* ---- ADD REQUEST FORM ---- */
  .form-card {
    background: white; border-radius: var(--radius);
    padding: 40px; box-shadow: var(--card-shadow);
    max-width: 720px; margin: 0 auto;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
  .form-group input, .form-group select, .form-group textarea {
    border: 1.5px solid rgba(42,124,111,0.2); border-radius: 10px;
    padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
    color: var(--text); background: var(--cream); outline: none;
    transition: border-color 0.2s;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    border-color: var(--teal); background: white;
  }
  .form-group textarea { resize: vertical; min-height: 100px; }
  .success-msg {
    background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46;
    padding: 16px 20px; border-radius: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 10px; margin-top: 20px;
  }

  @media(max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-card { padding: 24px 20px; }
  }

  /* ---- MODAL ---- */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: white; border-radius: 20px;
    padding: 36px; max-width: 520px; width: 100%;
    max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.3s ease;
    position: relative;
  }
  .modal-close {
    position: absolute; top: 16px; right: 16px;
    background: #f0f0f0; border: none; border-radius: 50%;
    width: 32px; height: 32px; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    color: #666; transition: background 0.2s;
  }
  .modal-close:hover { background: #e0e0e0; }
  .modal-box h2 {
    font-family: 'Playfair Display', serif; font-size: 1.6rem;
    margin-bottom: 6px; color: var(--text);
  }
  .modal-subtitle { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 24px; }

  /* ---- ABOUT ---- */
  .about-split {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .about-img { border-radius: 20px; overflow: hidden; }
  .about-img img { width: 100%; height: 400px; object-fit: cover; display: block; }
  .about-text h2 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 16px; }
  .about-text p { color: var(--text-muted); line-height: 1.75; margin-bottom: 16px; font-size: 0.95rem; }
  .team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
  .team-card {
    background: white; border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--card-shadow); text-align: center; padding-bottom: 20px;
    transition: transform 0.3s;
  }
  .team-card:hover { transform: translateY(-5px); }
  .team-card img { width: 100%; height: 180px; object-fit: cover; }
  .team-card h4 { font-size: 0.95rem; font-weight: 600; margin: 14px 0 4px; }
  .team-card span { font-size: 0.8rem; color: var(--text-muted); }

  @media(max-width: 768px) {
    .about-split { grid-template-columns: 1fr; gap: 32px; }
    .team-grid { grid-template-columns: 1fr 1fr; }
  }
  @media(max-width: 480px) {
    .team-grid { grid-template-columns: 1fr; }
  }

  /* ---- CONTACT ---- */
  .contact-grid {
    display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; align-items: start;
  }
  .contact-info h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 20px; }
  .info-item { display: flex; gap: 14px; margin-bottom: 20px; }
  .info-icon {
    width: 44px; height: 44px; border-radius: 12px; background: var(--teal-pale);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem;
  }
  .info-item h4 { font-size: 0.88rem; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .info-item p { font-size: 0.85rem; color: var(--text-muted); }
  .map-container { border-radius: 16px; overflow: hidden; margin-top: 28px; box-shadow: var(--card-shadow); }
  .map-container iframe { width: 100%; height: 240px; border: none; display: block; }

  @media(max-width: 768px) {
    .contact-grid { grid-template-columns: 1fr; }
  }

  /* ---- FOOTER ---- */
  .footer {
    background: var(--text); color: rgba(255,255,255,0.75);
    padding: 60px 8% 30px;
  }
  .footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: white; }
  .footer-brand p { font-size: 0.88rem; line-height: 1.7; margin-top: 14px; margin-bottom: 20px; }
  .social-links { display: flex; gap: 10px; }
  .social-link {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.7); cursor: pointer; font-size: 0.95rem;
    transition: all 0.2s;
  }
  .social-link:hover { background: var(--teal); color: white; border-color: var(--teal); }
  .footer-col h4 { color: white; font-size: 0.9rem; font-weight: 700; margin-bottom: 16px; letter-spacing: 0.04em; text-transform: uppercase; }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a { font-size: 0.88rem; color: rgba(255,255,255,0.6); cursor: pointer; text-decoration: none; transition: color 0.2s; }
  .footer-col a:hover { color: var(--amber-light); }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 24px; display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  .footer-bottom p { font-size: 0.82rem; }

  @media(max-width: 900px) {
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media(max-width: 500px) {
    .footer-grid { grid-template-columns: 1fr; }
  }

  /* ---- DONATE PAGE ---- */
  .donate-hero {
    background: linear-gradient(135deg, var(--teal) 0%, #1a5c52 100%);
    padding: 80px 8%; text-align: center; color: white;
  }
  .donate-hero h1 { font-family: 'Playfair Display', serif; font-size: 2.4rem; margin-bottom: 12px; }
  .donate-hero p { opacity: 0.85; max-width: 560px; margin: 0 auto; line-height: 1.7; }
  .impact-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 760px; margin: 0 auto; }
  .impact-card {
    background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 14px; padding: 24px; text-align: center; color: white;
  }
  .impact-card .num { font-family: 'Playfair Display', serif; font-size: 2rem; }
  .impact-card p { font-size: 0.8rem; opacity: 0.8; margin-top: 4px; }

  @media(max-width: 600px) {
    .impact-grid { grid-template-columns: 1fr; max-width: 320px; }
  }

  /* ---- ANIMATIONS ---- */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-in { animation: fadeInUp 0.7s ease both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }

  .loader {
    display: flex; align-items: center; justify-content: center;
    padding: 60px;
  }
  .spinner {
    width: 36px; height: 36px; border: 3px solid var(--teal-pale);
    border-top-color: var(--teal); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* ---- MISC ---- */
  .page-hero {
    background: linear-gradient(135deg, var(--teal) 0%, #1a5c52 100%);
    padding: 60px 8%;
    color: white;
  }
  .page-hero h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 10px; }
  .page-hero p { opacity: 0.85; font-size: 1rem; max-width: 500px; }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .empty-state .icon { font-size: 3rem; margin-bottom: 16px; }
  .empty-state h3 { font-size: 1.1rem; margin-bottom: 8px; color: var(--text); }

  .cta-band {
    background: var(--amber); color: white; padding: 60px 8%;
    text-align: center;
  }
  .cta-band h2 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 12px; }
  .cta-band p { opacity: 0.9; margin-bottom: 28px; max-width: 500px; margin-left: auto; margin-right: auto; }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
`;

// ============================================================
// COMPONENTS
// ============================================================

function Navbar({ currentPage, setCurrentPage, ngoSession, adminSession, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Home", key: "home" },
    { label: "About", key: "about" },
    { label: "Requests", key: "requests" },
    { label: "Add Request", key: "add-request" },
    { label: "NGO Portal", key: "ngo-portal" },
    { label: "Admin", key: "admin-dashboard" },
    { label: "Contact", key: "contact" },
  ];

  const nav = (key) => { setCurrentPage(key); setMenuOpen(false); window.scrollTo(0, 0); };

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => nav("home")}>
          <span className="logo-icon">🤝</span>
          HopeHands
        </span>
        <ul className="nav-links">
          {links.map(l => (
            <li key={l.key}>
              <a className={currentPage === l.key ? "active" : ""} onClick={() => nav(l.key)}>{l.label}</a>
            </li>
          ))}
          {(ngoSession || adminSession) && <li><a onClick={onLogout}>Logout</a></li>}
          <li><a className="nav-cta" onClick={() => nav("donate")}>Donate Now</a></li>
        </ul>
        <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {links.map(l => (
          <a key={l.key} className={currentPage === l.key ? "active" : ""} onClick={() => nav(l.key)}>{l.label}</a>
        ))}
        {(ngoSession || adminSession) && <a onClick={onLogout}>Logout</a>}
        <a onClick={() => nav("donate")} style={{ color: "var(--teal)", fontWeight: 700 }}>💝 Donate Now</a>
      </div>
    </>
  );
}

function Footer({ setCurrentPage }) {
  const nav = (key) => { setCurrentPage(key); window.scrollTo(0, 0); };
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="logo">
            <span className="logo-icon" style={{ fontSize: "1rem" }}>🤝</span>
            HopeHands
          </span>
          <p>Connecting generous donors with verified NGO requests across Pune. Every donation drives real change in communities that need it most.</p>
          <div className="social-links">
            {["🐦", "👥", "📸", "▶️", "💼"].map((icon, i) => (
              <span key={i} className="social-link">{icon}</span>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h4>Pages</h4>
          <ul>
            {[["Home","home"],["About","about"],["Requests","requests"],["Add Request","add-request"],["Contact","contact"]].map(([l,k]) => (
              <li key={k}><a onClick={() => nav(k)}>{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            {["Grains","Books","Clothes","Electronics","Stationery","Blankets","Medical"].map(c => (
              <li key={c}><a onClick={() => nav("requests")}>{c}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a>PCCOE, Sector 26, Nigdi, Pune 411044</a></li>
            <li><a>info@hopehands.org</a></li>
            <li><a>+91 9987654321</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 HopeHands NGO. All rights reserved.</p>
        <p>Made with ❤️ for humanity</p>
      </div>
    </footer>
  );
}

const fallbackImage = (label) => `https://placehold.co/400x250/e8f5f2/2a7c6f?text=${encodeURIComponent(label || "HopeHands")}`;

const getRequestImageSrc = (image, itemName) => {
  const trimmed = typeof image === "string" ? image.trim() : "";

  if (!trimmed) {
    return fallbackImage(itemName);
  }

  const lower = trimmed.toLowerCase();
  const looksDirectImage = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].some((ext) => lower.includes(ext));

  if (looksDirectImage || lower.includes("images.unsplash.com") || lower.includes("placehold.co")) {
    return trimmed;
  }

  return `https://image.thum.io/get/width/900/crop/600/noanimate/${trimmed}`;
};

const getMapSearchLink = (req) => {
  if (req?.ngoMapLink) {
    return req.ngoMapLink;
  }

  if (!req?.ngoLocation) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.ngoLocation)}`;
};

function RequestCard({ req, onDonate }) {
  return (
    <div className="request-card fade-in">
      <img className="card-img" src={getRequestImageSrc(req.image, req.itemName)} alt={req.itemName} loading="lazy" onError={e => e.target.src = fallbackImage(req.itemName)} />
      <div className="card-body">
        <div className="card-meta">
          <span className="card-category">{req.category}</span>
          {req.urgent && <span className="urgent-badge">⚡ Urgent</span>}
        </div>
        <h3>{req.itemName}</h3>
        <p className="card-qty">Needed: <strong>{req.quantity}</strong></p>
        {req.neededQuantityValue !== null && (
          <>
            <p className="card-qty">Received: <strong>{req.receivedQuantityDisplay}</strong></p>
            <p className="card-qty">Remaining: <strong>{req.remainingQuantityDisplay}</strong></p>
          </>
        )}
        <p className="card-desc">{req.description}</p>
        <p className="card-qty"><strong>NGO:</strong> {req.ngoName || "HopeHands Partner NGO"}</p>
        <p className="card-qty"><strong>Location:</strong> {req.ngoLocation || "Pune, Maharashtra"}</p>
        <div className="card-footer">
          {getMapSearchLink(req) && <a className="btn btn-outline btn-sm" style={{ width: "100%", marginBottom: 10, justifyContent: "center" }} href={getMapSearchLink(req)} target="_blank" rel="noreferrer">View NGO Location</a>}
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => onDonate(req)}>
            Donate This
          </button>
        </div>
      </div>
    </div>
  );
}

/* Legacy inline modal kept out of the active bundle after moving the flow to src/components/DonationModal.jsx.
function DonationModal({ request, onClose }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    item: request?.itemName || "",
    quantity: "",
    address: "",
    notes: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [donationResult, setDonationResult] = useState(null);

  const handleChange = (e) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createDonation({
        ...form,
        requestId: request?.id || null,
        requestUuid: request?.requestUuid || null,
      });

      setDonationResult(result);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Unable to submit donation.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        {!submitted ? (
          <>
            <h2>Make a Donation</h2>
            <p className="modal-subtitle">
              {request ? `Donating: ${request.itemName} (${request.category})` : "Fill in your donation details below"}
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} placeholder="" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Phone *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange} placeholder="" />
                </div>
                <div className="form-group">
                  <label>Gmail *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@gmail\\.com$"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Item to Donate *</label>
                <input name="item" required value={form.item} onChange={handleChange} placeholder="e.g. Rice, Books, Blankets..." />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input name="quantity" required value={form.quantity} onChange={handleChange} placeholder="e.g. 10 kg, 5 pieces" />
              </div>
              <div className="form-group">
                <label>Pickup Address *</label>
                <input name="address" required value={form.address} onChange={handleChange} placeholder="Your full address for pickup" />
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Any extra information..." />
              </div>
              {error && (
                <div className="success-msg" style={{ background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
                  {error}
                </div>
              )}
              <button className="btn btn-primary" type="submit" style={{ marginTop: 4 }} disabled={isSubmitting}>
                ✅ Confirm Donation
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
            <h2 style={{ marginBottom: 12 }}>Thank You, {form.name}!</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
              Your donation of <strong>{form.quantity} of {form.item}</strong> has been registered.
              Our team will contact you at <strong>{form.phone}</strong> to arrange pickup within 24–48 hours.
            </p>
            <div className="success-msg" style={{ justifyContent: "center" }}>
              ✅ Donation ID: <strong>HH-{Math.floor(100000 + Math.random() * 900000)}</strong>
            </div>
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
*/

// ============================================================
// PAGES
// ============================================================

function HomePage({ setCurrentPage, requests, onDonate }) {
  const nav = (k) => { setCurrentPage(k); window.scrollTo(0, 0); };
  const features = [
    { icon: "🔍", title: "Full Transparency", desc: "Every request is documented and tracked. Donors can see exactly where their contributions go." },
    { icon: "✅", title: "Verified Requests", desc: "Our team verifies each NGO request before it goes live to ensure authenticity and urgency." },
    { icon: "🌍", title: "Community Impact", desc: "We're just getting started — every donation we facilitate directly reaches a real person in need around Pune, with full transparency from pickup to delivery." },
    { icon: "🔒", title: "Safe & Trusted", desc: "Your donations are handled securely with proper documentation and handover receipts." },
  ];
 
  const filteredRequests = Array.isArray(requests)
    ? requests.filter(req => req.status === 'approved' && req.urgent).slice(0, 3)
    : [];

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">🌱 Making a Difference</div>
          <h1>Donate <span>Hope</span>,<br />Change Lives</h1>
          <p>Connect your generosity with verified NGO requests for grains, books, clothes, blankets, and essential supplies. No perishables. Pure impact.</p>
          <div className="hero-actions">
            <button className="btn btn-amber" onClick={() => nav("donate")}>Donate Now</button>
            <button className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,0.6)" }} onClick={() => nav("requests")}>
              📦 View Requests
            </button>
          </div>
        </div>
        {/* <div className="hero-stats">
          {[["12,400+","Donors"],["8,200+","Families Helped"],["320+","Active Requests"]].map(([n,l]) => (
            <div key={l} className="stat-pill">
              <strong>{n}</strong><span>{l}</span>
            </div>
          ))}
        </div> */}
      </section>

      <section className="section">
        <div className="section-header fade-in">
          <span className="section-tag">Why HopeHands</span>
          <h2>Giving You Can Trust</h2>
          <p>We bridge the gap between kind hearts and communities in need, with full accountability at every step.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className={`feature-card fade-in delay-${i + 1}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-header">
          <span className="section-tag">⚡ Urgent Needs</span>
          <h2>Requests That Can't Wait</h2>
          <p>These communities need your help right now. Every day matters.</p>
        </div>
        <div className="requests-grid">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} req={request} onDonate={onDonate} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button className="btn btn-primary" onClick={() => nav("requests")}>View All Requests →</button>
        </div>
      </section>

      <section style={{ background: "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&h=600&fit=crop') center/cover no-repeat", position: "relative", padding: "100px 8%", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(26,46,43,0.75)" }} />
        <div style={{ position: "relative", zIndex: 2, color: "white", maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", marginBottom: 16 }}>Every Item You Donate Tells a Story of Hope</h2>
          <p style={{ opacity: 0.85, lineHeight: 1.7, marginBottom: 28 }}>Whether it's a book that opens doors to education or a blanket that keeps a child warm — your donation matters profoundly.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-amber" onClick={() => nav("donate")}>Start Donating</button>
            <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "2px solid rgba(255,255,255,0.4)" }} onClick={() => nav("add-request")}>Post a Request</button>
          </div>
        </div>
      </section>
    </>
  );
}

function RequestsPage({ requests, onDonate }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  const filtered = Array.isArray(requests)
    ? requests.filter((req) => {
        const matchesCategory = category === "All" || req.category === category;
        const query = search.trim().toLowerCase();
        const haystack = [req.itemName, req.category, req.description, req.quantity]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesCategory && (!query || haystack.includes(query));
      })
    : [];
  return (
    <>
      <div className="page-hero">
        <h1>📦 Donation Requests</h1>
        <p>Browse verified requests from NGOs across Pune. Find what you can donate and make a difference today.</p>
      </div>
      <section className="section">
        <div className="requests-controls">
          <div className="search-bar">
            <span>🔍</span>
            <input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <span style={{ cursor: "pointer", color: "#999" }} onClick={() => setSearch("")}>✕</span>}
          </div>
          <div className="filter-tabs">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-tab${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No matching requests found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filtered.map(r => <RequestCard key={r.id} req={r} onDonate={onDonate} />)}
          </div>
        )}
      </section>
    </>
  );
}

function AddRequestPage({ onAdd, ngoSession, setCurrentPage }) {
  const [form, setForm] = useState({
    ngoName: ngoSession?.ngo?.ngoName || "",
    ngoLocation: ngoSession?.ngo?.ngoLocation || "",
    ngoMapLink: ngoSession?.ngo?.ngoMapLink || "",
    itemName: "",
    category: "Grains",
    quantityValue: "",
    quantityUnit: "kg",
    description: "",
    image: "",
    contact: ngoSession?.ngo?.email || "",
    urgent: false
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAdd({
        ...form,
        quantity: `${form.quantityValue} ${form.quantityUnit}`.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Request submission failed:", error);
    }
  };

  const handleAnother = () => {
    setForm({ ngoName: "", ngoLocation: "", ngoMapLink: "", itemName: "", category: "Grains", quantityValue: "", quantityUnit: "kg", description: "", image: "", contact: "", urgent: false });
    setSubmitted(false);
  };

  return (
    <>
      <div className="page-hero">
        <h1>➕ Add Donation Request</h1>
        <p>NGOs can post verified requests for non-perishable goods. Please ensure your request is genuine and the organization is registered.</p>
      </div>
      <section className="section">
        <div className="form-card">
          {!ngoSession ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>NGO login required</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
                Only verified NGOs can post requests. Please register or log in through the NGO portal first.
              </p>
              <button className="btn btn-primary" onClick={() => setCurrentPage("ngo-portal")}>Open NGO Portal</button>
            </div>
          ) : ngoSession.ngo?.status !== "approved" ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Approval pending</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
                Your NGO account has not been approved by the admin yet, so posting is currently locked.
              </p>
              <button className="btn btn-outline" onClick={() => setCurrentPage("ngo-portal")}>Back to NGO Portal</button>
            </div>
          ) : !submitted ? (
            <>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: 6 }}>New Request Form</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 28 }}>⚠️ No perishable or food items that can spoil. Dry goods and non-food items only.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>NGO Name *</label>
                    <input name="ngoName" required value={form.ngoName} onChange={handleChange} placeholder="e.g. Helping Hands Foundation" />
                  </div>
                  <div className="form-group">
                    <label>NGO Location *</label>
                    <input name="ngoLocation" required value={form.ngoLocation} onChange={handleChange} placeholder="e.g. Nigdi, Pune" />
                  </div>
                  <div className="form-group full">
                    <label>Google Maps Link (optional but recommended)</label>
                    <input name="ngoMapLink" value={form.ngoMapLink} onChange={handleChange} placeholder="Paste the NGO location link from Google Maps" />
                  </div>
                  {form.ngoLocation && (
                    <div className="form-group full">
                      <label>Location Preview</label>
                      <div className="map-container" style={{ marginTop: 0 }}>
                        <iframe
                          title="NGO Location Preview"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(form.ngoLocation)}&z=15&output=embed`}
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input name="itemName" required value={form.itemName} onChange={handleChange} placeholder="e.g. Wheat" />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity Needed *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                      <input name="quantityValue" type="number" min="1" step="0.01" required value={form.quantityValue} onChange={handleChange} placeholder="e.g. 50" />
                      <select name="quantityUnit" value={form.quantityUnit} onChange={handleChange}>
                        {QUANTITY_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contact Email *</label>
                    <input
                      name="contact"
                      type="email"
                      required
                      pattern="^[a-zA-Z0-9._%+-]+@gmail\\.com$"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="ngo@gmail.com"
                      readOnly={Boolean(ngoSession?.ngo?.email)}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Description *</label>
                    <textarea name="description" required value={form.description} onChange={handleChange} placeholder="Describe the need, target beneficiaries, location, and any specifications..." rows={4} />
                  </div>
                  <div className="form-group full">
                    <label>Image URL (optional)</label>
                    <input name="image" value={form.image} onChange={handleChange} placeholder="Paste a direct image link or page URL" />
                    <small style={{ color: "var(--text-muted)" }}>
                      Tip: direct image links work best. If you paste a normal webpage URL, the app will try to generate a preview automatically.
                    </small>
                  </div>
                  <div className="form-group full">
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexDirection: "row" }}>
                      <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} style={{ width: 18, height: 18, cursor: "pointer" }} />
                      <span>Mark as Urgent Request</span>
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 14 }}>
                  <button type="submit" className="btn btn-primary">📤 Submit Request</button>
                  <button type="reset" className="btn btn-outline" onClick={() => setForm({ ngoName: "", ngoLocation: "", ngoMapLink: "", itemName: "", category: "Grains", quantityValue: "", quantityUnit: "kg", description: "", image: "", contact: "", urgent: false })}>
                    Reset
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Request Submitted!</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                Your request for <strong>{form.itemName}</strong> has been added to the requests board. Our team will review it within 24 hours.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={handleAnother}>+ Add Another</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function DonatePage({ onDonate }) {
  const cats = [
    { emoji: "🌾", label: "Grains", desc: "Rice, wheat, lentils, pulses" },
    { emoji: "📚", label: "Books", desc: "Textbooks, storybooks, educational material" },
    { emoji: "👕", label: "Clothes", desc: "Clean, gently used clothing" },
    { emoji: "💻", label: "Electronics", desc: "Laptops, tablets, phones,gadgets" },
    { emoji: "✏️", label: "Stationery", desc: "Pens, notebooks, art supplies" },
    { emoji: "🛏", label: "Blankets", desc: "Warm blankets and bedding" },
    { emoji: "💊", label: "Medical", desc: "First aid, ORS, bandages,medicines" },
  ];

  return (
    <>
      <div className="donate-hero">
        <h1>Donate Today</h1>
        <p style={{ marginBottom: 40 }}>Choose what you'd like to donate. Every contribution creates a ripple of change.</p>
        <div className="impact-grid">
          {[["Become","The Hope They Need"],["Believe","In Every Good Deed"],["Rise","Together, Stronger"]].map(([n,l]) => (
            <div key={l} className="impact-card"><div className="num">{n}</div><p>{l}</p></div>
          ))}
        </div>
      </div>
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Choose Category</span>
          <h2>What Would You Like to Donate?</h2>
          <p>Select a category to open the donation form for that type of item. We do not accept perishable food.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {cats.map(c => (
            <div key={c.label} className="feature-card" style={{ cursor: "pointer", textAlign: "center" }} onClick={() => onDonate({ itemName: c.label, category: c.label })}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{c.emoji}</div>
              <h3>{c.label}</h3>
              <p>{c.desc}</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16, width: "100%" }}>Donate {c.label}</button>
            </div>
          ))}
        </div>
      </section>
      <div className="cta-band">
        <h2>Not sure what to donate?</h2>
        <p>Browse our active requests to see exactly what communities need right now.</p>
        <button className="btn" style={{ background: "white", color: "var(--amber)" }} onClick={() => { window.scrollTo(0,0); }}>
          Browse Requests
        </button>
      </div>
    </>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => { e.preventDefault(); setSent(true); };

  return (
    <>
      <div className="page-hero">
        <h1>📞 Contact Us</h1>
        <p>Have questions about donations or want to partner with us? We'd love to hear from you.</p>
      </div>
      <section className="section">
        <div className="contact-grid">
          <div>
            <div className="contact-info">
              <h3>Get in Touch</h3>
              {[
                { icon: "📍", title: "Our Office", text: "PCCOE, Sector No. 26, Pradhikaran, Nigdi, Pune, Maharashtra 411044" },
                { icon: "📧", title: "Email Us", text: "info@hopehands.org | donations@hopehands.org" },
                { icon: "📱", title: "Call Us", text: "+91 9987654321" },
                // { icon: "🕐", title: "Working Hours", text: "Monday to Saturday: 9:00 AM – 6:00 PM" },
              ].map(item => (
                <div key={item.title} className="info-item">
                  <div className="info-icon">{item.icon}</div>
                  <div><h4>{item.title}</h4><p>{item.text}</p></div>
                </div>
              ))}
            </div>
            <div className="map-container">
              <iframe
                title="Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.534046970218!2d73.76263507495738!3d18.652974682493917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b00839f36b5f%3A0xcce7609e64f8c888!2sPimpri%20Chinchwad%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1708000000000!5m2!1sen!2sin"
                allowFullScreen loading="lazy"
              />
            </div>
          </div>
          <div className="form-card" style={{ margin: 0 }}>
            {!sent ? (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: 20 }}>Send a Message</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      pattern="^[a-zA-Z0-9._%+-]+@gmail\\.com$"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@gmail.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input name="subject" required value={form.subject} onChange={handleChange} placeholder="How can we help?" />
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea name="message" rows={5} required value={form.message} onChange={handleChange} placeholder="Write your message here..." />
                  </div>
                  <button className="btn btn-primary" type="submit">Send Message →</button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>✉️</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Message Sent!</h2>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>Thank you, {form.name}. We'll get back to you at {form.email} within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage({ setCurrentPage }) {
  const nav = k => { setCurrentPage(k); window.scrollTo(0, 0); };
  return (
    <>
      <div className="page-hero">
        <h1>🌿 About HopeHands</h1>
        <p>Driven by compassion, guided by transparency, and powered by community since 2026.</p>
      </div>
      <section className="section">
        <div className="about-split">
          <div className="about-img">
            <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=700&h=450&fit=crop" alt="Volunteers working" />
          </div>
          <div className="about-text">
            <span className="section-tag">Our Story</span>
            <h2>Born from a Desire to Help</h2>
            <p>HopeHands,founded in 2026 by a passionate group of students and Dr.Harsha Bhute Ma'am from PCCOE, Pune, who noticed a disconnect between generous donors and communities in need. NGOs were struggling to communicate their needs, and donors had no reliable platform to contribute non-monetary items.</p>
            <p>Today, we are growing across Pune, connecting verified NGOs with donors who contribute grains, clothes, books, blankets, electronics, stationery, and essential medical supplies.</p>
            <p>We operate on a strict <strong>no-perishables policy</strong> to ensure all donations can be stored, transported, and distributed safely — maximizing impact and minimizing waste.</p>
            <button className="btn btn-primary" onClick={() => nav("requests")} style={{ marginTop: 8 }}>Explore Requests</button>
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="section-header">
          <span className="section-tag">Our Values</span>
          <h2>What We Stand For</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: "🤝", title: "Accountability", desc: "Every request is verified by our team before publishing. We maintain records of all donations." },
            { icon: "💚", title: "Compassion", desc: "We believe in human dignity. Donations are delivered respectfully to all beneficiaries." },
            { icon: "🌍", title: "Inclusivity", desc: "We serve all communities regardless of ethnicity, religion, or region." },
            { icon: "♻️", title: "Sustainability", desc: "We prioritize durable goods that provide lasting benefit — not quick fixes." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
  <div className="section-header">
    <span className="section-tag">Our Team</span>
    <h2>The People Behind HopeHands</h2>
  </div>

  <div className="team-grid">
  {[
    {
      name: "Dr Harsha Bhute",
      role: "Associate Professor",
      img: hmaam,
      desc: "Dr. Harsha A. Bhute is an Associate Professor in the Department of Information Technology with 22+ years of teaching experience. She has a Ph.D. in Computer Science and Engineering, specializing in mobility management in heterogeneous wireless networks.",
    },
    {
      name: "Matruseva Sevabhavi Sanstha",
      role: "Community Partnership",
      img: mep,
      desc: "Our team with Mr. Suhas Uddhav Godse, Founder of Matruseva Sevabhavi Sanstha, who has 20+ years of nursing experience and a strong dedication to community service.",
    },
      ].map(m => (
    <div
      key={m.name}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
        background: "#f3f3f3",
      }}
    >
      <img
        src={m.img}
        alt={m.name}
        style={{
          width: "100%",
          height: "280px",
          objectFit: "cover",
          display: "block"
        }}
      />

      <div style={{ padding: "24px", background: "#f3f3f3" }}>
        <h4 style={{ margin: "0 0 6px 0" }}>{m.name}</h4>
        <span style={{ color: "#6b6b6b" }}>{m.role}</span>
        {m.desc && (
          <p style={{ color: "#6b6b6b", fontSize: "0.88rem", lineHeight: 1.6, marginTop: 12 }}>
            {m.desc}
          </p>
        )}
      </div>
    </div>
  ))}
</div>

</section>

    </>
  );
}
// ============================================================
// APP
// ============================================================

export default function App() {
  // 1. STATE
  const [page, setPage] = useState("home");
  const [requests, setRequests] = useState([]);
  const [donateTarget, setDonateTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ngoSession, setNgoSession] = useState(null);
  const [adminSession, setAdminSession] = useState(null);

  const refreshRequests = async () => {
    try {
      const data = await fetchRequests();
      setRequests(data);
      return data;
    } catch (err) {
      console.error("Failed to load requests:", err);
      throw err;
    }
  };

  // 2. FETCH DATA ON LOAD
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshRequests();
      } catch {
        // Logged in refreshRequests.
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("hopehandsToken");
      if (!token) {
        return;
      }

      try {
        const session = await fetchSession(token);

        if (session.role === "ngo") {
          setNgoSession(session);
          setAdminSession(null);
        } else if (session.role === "admin") {
          setAdminSession(session);
          setNgoSession(null);
        }
      } catch {
        localStorage.removeItem("hopehandsToken");
      }
    };

    restoreSession();
  }, []);

  // 3. HANDLERS
  const handleDonate = (req) => { 
    setDonateTarget(req); 
    setShowModal(true); 
  };

  const handleDonationSuccess = async () => {
    try {
      await refreshRequests();
    } catch (error) {
      console.error("Failed to refresh requests after donation:", error);
    }
  };

  const handleAuthSuccess = (session) => {
    localStorage.setItem("hopehandsToken", session.token);
    if (session.role === "ngo") {
      setNgoSession(session);
      setAdminSession(null);
      setPage("add-request");
    } else {
      setAdminSession(session);
      setNgoSession(null);
      setPage("admin-dashboard");
    }
  };

  const handleLogout = async () => {
    const token = ngoSession?.token || adminSession?.token;

    try {
      if (token) {
        await logoutSession(token);
      }
    } catch {
      // Ignore logout cleanup errors and clear local state anyway.
    }

    localStorage.removeItem("hopehandsToken");
    setNgoSession(null);
    setAdminSession(null);
    setPage("home");
  };

  const handleAddRequest = async (newReq) => {
    try {
      await createRequest(newReq, ngoSession?.token);

      await refreshRequests();

      setPage("requests");
      alert("Success! Request added to the database.");
      return true;
    } catch (err) {
      console.error("Add Request Error:", err);
      alert("Error: " + err.message);
      throw err;
    }
  };

  // 4. ROUTING LOGIC
  const renderPage = () => {
    switch (page) {
      case "home": 
        return <HomePage setCurrentPage={setPage} requests={requests} onDonate={handleDonate} />;
      case "about": 
        return <AboutPage setCurrentPage={setPage} />;
      case "requests": 
        return <RequestsPage requests={requests} onDonate={handleDonate} />;
      case "add-request": 
        return <AddRequestPage onAdd={handleAddRequest} ngoSession={ngoSession} setCurrentPage={setPage} />;
      case "ngo-portal":
        return <NgoPortalPage ngoSession={ngoSession} onAuthSuccess={handleAuthSuccess} token={ngoSession?.token} />;
      case "admin-dashboard":
        return <AdminDashboardPage adminSession={adminSession} token={adminSession?.token} onAuthSuccess={handleAuthSuccess} onDataChange={refreshRequests} />;
      case "donate": 
        return <DonatePage onDonate={handleDonate} />;
      case "contact": 
        return <ContactPage />;
      default: 
        return <HomePage setCurrentPage={setPage} requests={requests} onDonate={handleDonate} />;
    }
  };

  // 5. RENDER
  return (
    <>
      <style>{styles}</style>
      <Navbar currentPage={page} setCurrentPage={setPage} ngoSession={ngoSession} adminSession={adminSession} onLogout={handleLogout} />
      
      <main>
        {renderPage()}
      </main>

      <Footer setCurrentPage={setPage} />

      {showModal && (
        <HopeDonationModal 
          request={donateTarget} 
          onSuccess={handleDonationSuccess}
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
