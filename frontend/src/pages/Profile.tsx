import { useState, useEffect, useRef } from 'react';
import {
  User, Wallet, Ticket, Settings, ChevronRight, HelpCircle,
  LogOut, MapPin, Map, Clock, CheckCircle, Download, Smartphone, Camera,
  KeyRound, ArrowRight, X, XCircle, Send, CreditCard, Shield, Sparkles, Copy, Crown, Award, Trophy, Barcode
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PageWrapper from '../components/PageWrapper';
import GlowCard from '../components/GlowCard';
import NeoButton from '../components/NeoButton';
import AlertToast from '../components/AlertToast';

// ── Spring variants ─────────────────────────────────────────────────────────
import type { Variants } from 'framer-motion';

const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};



// ── PIN Dots ────────────────────────────────────────────────────────────────
function PinDots({ value, maxLen = 4 }: { value: string; maxLen?: number }) {
  return (
    <div className="flex gap-3 justify-center py-2">
      {Array.from({ length: maxLen }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: i < value.length ? [1, 1.3, 1] : 1,
            backgroundColor: i < value.length ? '#f4c430' : 'rgba(255,255,255,0.1)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="w-4 h-4 rounded-full border"
          style={{ borderColor: i < value.length ? '#f4c430' : 'rgba(255,255,255,0.15)' }}
        />
      ))}
    </div>
  );
}

// ── Credit Card UI ──────────────────────────────────────────────────────────
function WalletCard({ balance, onRequest }: { balance: number; onRequest: () => void }) {
  const [tilted, setTilted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    setRot({ x: -y, y: x });
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      onMouseMove={onMove}
      onMouseEnter={() => setTilted(true)}
      onMouseLeave={() => { setTilted(false); setRot({ x: 0, y: 0 }); }}
      animate={{ rotateX: tilted ? rot.x : 0, rotateY: tilted ? rot.y : 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className="relative rounded-[28px] overflow-hidden cursor-pointer"
      aria-label="Wallet balance card"
    >
      <div
        className="relative p-8 md:p-10"
        style={{
          background: 'linear-gradient(135deg, #111118 0%, #1c1c28 50%, #0d0d16 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Holographic sheen */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background: `radial-gradient(circle 200px at ${glowPos.x}% ${glowPos.y}%, rgba(244,196,48,0.15), transparent 70%)`,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start mb-8">
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] mb-1" style={{ color: 'rgba(244,196,48,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>AVAILABLE BALANCE</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-heading text-white tracking-tight">₹{balance.toLocaleString()}</span>
              <span className="text-2xl font-heading" style={{ color: 'rgba(255,255,255,0.2)' }}>.00</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <CreditCard size={28} style={{ color: 'rgba(244,196,48,0.5)' }} />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'status-pulse 2s ease infinite' }}
            />
          </div>
        </div>

        {/* Chip */}
        <div
          className="w-10 h-7 rounded-md mb-6 relative z-10"
          style={{
            background: 'linear-gradient(135deg, #c9960b, #f4c430)',
            boxShadow: '0 2px 8px rgba(244,196,48,0.3)',
          }}
        >
          <div className="absolute inset-0.5 rounded-sm grid grid-cols-3 gap-px p-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[1px]" style={{ background: 'rgba(0,0,0,0.25)' }} />
            ))}
          </div>
        </div>

        {/* Card number mock */}
        <p className="relative z-10 font-mono text-xs tracking-[0.25em] mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          •••• •••• •••• 4291
        </p>

        {/* Bottom row */}
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-[8px] tracking-[0.2em] mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>CARD HOLDER</p>
            <p className="text-sm font-bold text-white tracking-wider">PREMIUM MEMBER</p>
          </div>
          <NeoButton variant="gold" size="sm" onClick={onRequest} iconRight={<ArrowRight size={14} />}>
            Add Funds
          </NeoButton>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState((location.state as any)?.activeTab || 'wallet');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) return JSON.parse(saved);
    const d = { name: 'Virat Kohli', email: 'virat@ticketapp.com', mobile: '9876543210', city: 'Mumbai', avatar: '' };
    localStorage.setItem('userProfile', JSON.stringify(d));
    return d;
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('walletBalance');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [bookings,      setBookings]      = useState<any[]>([]);
  const [transactions,  setTransactions]  = useState<any[]>([]);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketSubject,   setTicketSubject]  = useState('');
  const [ticketMessage,   setTicketMessage]  = useState('');
  const [editForm,        setEditForm]        = useState({ ...userProfile });
  const [qrCodes,         setQrCodes]         = useState<Record<number, string>>({});
  const [myCoupons,       setMyCoupons]       = useState<any[]>([]);
  const [copiedCoupon,    setCopiedCoupon]    = useState<string | null>(null);

  // PIN
  const [hasPin,       setHasPin]       = useState(() => !!localStorage.getItem('upiPin'));
  const [oldPin,       setOldPin]       = useState('');
  const [newPin,       setNewPin]       = useState('');
  const [confirmPin,   setConfirmPin]   = useState('');
  const [pinMessage,   setPinMessage]   = useState({ text: '', type: '' });

  // PDF
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);

  // Fund request
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount,    setFundAmount]    = useState('');

  // Alert
  const [alertConfig, setAlertConfig] = useState<{ show: boolean; type: 'error' | 'success'; message: string }>({
    show: false, type: 'success', message: '',
  });
  const showAlert = (message: string, type: 'error' | 'success' = 'success') => {
    setAlertConfig({ show: true, type, message });
    setTimeout(() => setAlertConfig((prev) => ({ ...prev, show: false })), 1800);
  };

  // Ticket flip state
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const toggleFlip = (i: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const [bookingViewMode, setBookingViewMode] = useState<'list' | 'scrapbook'>('list');

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') { navigate('/login'); return; }
    if (userProfile?.role === 'ADMIN') { navigate('/admin'); return; }
    
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const res = await fetch(`${API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            
            // update balance visually
            if (data.quick_upi_balance !== undefined) {
              setWalletBalance(data.quick_upi_balance);
            }
            
            // update profile from DB and lookup approved mock fields in registeredUsers
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const matchedUser = registeredUsers.find((u: any) => u.email === data.email);
            const approvedProfile = matchedUser?.profile || {};

            const updatedProfile = {
              name: data.name,
              email: data.email,
              avatar: data.avatar_url || '',
              mobile: approvedProfile.mobile || (localStorage.getItem('userProfile') ? (JSON.parse(localStorage.getItem('userProfile')!).mobile || '9876543210') : '9876543210'),
              city: approvedProfile.city || (localStorage.getItem('userProfile') ? (JSON.parse(localStorage.getItem('userProfile')!).city || 'Mumbai') : 'Mumbai')
            };
            setUserProfile(updatedProfile);
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

            if (data.bookings) {
              const mappedBookings = data.bookings.map((b: any) => ({
                event: b.event_title,
                date: b.event_date,
                venue: b.event_venue,
                seats: b.seats_summary,
                price: `₹${b.total_amount}`,
                status: b.payment_status === 'SUCCESS' || b.status === 'CONFIRMED' ? 'Confirmed' : 'Confirmed'
              }));
              setBookings(mappedBookings);
              
              mappedBookings.forEach(async (b: any, idx: number) => {
                const url = await QRCode.toDataURL(`TIX-${b.event}-${idx}`);
                setQrCodes((prev) => ({ ...prev, [idx]: url }));
              });
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
      
      // Fallback
      const savedBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      setBookings(savedBookings);
      savedBookings.forEach(async (b: any, idx: number) => {
        const url = await QRCode.toDataURL(`TIX-${b.event}-${idx}`);
        setQrCodes((prev) => ({ ...prev, [idx]: url }));
      });
    };
    
    fetchProfile();
    setTransactions(JSON.parse(localStorage.getItem('myTransactions') || '[]'));
    setPendingUpdate(JSON.parse(localStorage.getItem('pendingProfileUpdate') || 'null'));
    setSupportTickets(JSON.parse(localStorage.getItem('supportTickets') || '[]'));
    setMyCoupons(JSON.parse(localStorage.getItem('myCoupons') || '[]'));
    
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    } else {
      setActiveTab('wallet');
    }
  }, [navigate, location.state]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('userProfile');
      if (saved) setUserProfile(JSON.parse(saved));
      const bal = localStorage.getItem('walletBalance');
      if (bal) setWalletBalance(parseInt(bal, 10));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (currentProfile.email) {
      const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
      userFunds[currentProfile.email] = {
        ...(userFunds[currentProfile.email] || {}),
        balance: localStorage.getItem('walletBalance'),
        tx: localStorage.getItem('myTransactions'),
        bookings: localStorage.getItem('myBookings'),
        tickets: localStorage.getItem('supportTickets'),
        notifications: localStorage.getItem('myNotifications'),
        coupons: localStorage.getItem('myCoupons'),
        upiPin: localStorage.getItem('upiPin') || null,
      };
      localStorage.setItem('userDataMap', JSON.stringify(userFunds));
    }
    
    localStorage.removeItem('userProfile');
    localStorage.removeItem('walletBalance');
    localStorage.removeItem('myTransactions');
    localStorage.removeItem('myBookings');
    localStorage.removeItem('supportTickets');
    localStorage.removeItem('myNotifications');
    localStorage.removeItem('upiPin');
    localStorage.removeItem('myCoupons');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdminLoggedIn');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pendingProfileUpdate', JSON.stringify(editForm));
    setPendingUpdate(editForm);
    showAlert('Profile update submitted for admin review!', 'success');
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = {
      id: Date.now(), userEmail: userProfile.email, subject: ticketSubject,
      message: ticketMessage, status: 'Open', reply: null, date: new Date().toLocaleDateString(),
    };
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem('supportTickets', JSON.stringify(updated));
    setTicketSubject(''); setTicketMessage('');
    showAlert('Support ticket submitted!', 'success');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setEditForm({ ...editForm, avatar: compressedBase64 });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) return;
    const newRequest = { id: Date.now(), userEmail: userProfile.email, amount: fundAmount, status: 'Pending', date: new Date().toLocaleDateString() };
    const requests = JSON.parse(localStorage.getItem('fundRequests') || '[]');
    requests.unshift(newRequest);
    localStorage.setItem('fundRequests', JSON.stringify(requests));
    setShowFundModal(false); setFundAmount('');
    showAlert('Fund request sent to Admin!', 'success');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = localStorage.getItem('upiPin');
    if (hasPin && currentPin !== oldPin) { setPinMessage({ text: 'Old PIN is incorrect.', type: 'error' }); return; }
    if (newPin.length !== 4 || confirmPin.length !== 4) { setPinMessage({ text: 'PIN must be exactly 4 digits.', type: 'error' }); return; }
    if (newPin !== confirmPin) { setPinMessage({ text: 'New PINs do not match.', type: 'error' }); return; }
    localStorage.setItem('upiPin', newPin);
    
    // Sync to userDataMap immediately
    const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (currentProfile.email) {
      const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
      if (!userFunds[currentProfile.email]) userFunds[currentProfile.email] = {};
      userFunds[currentProfile.email].upiPin = newPin;
      localStorage.setItem('userDataMap', JSON.stringify(userFunds));
    }
    
    setHasPin(true); setOldPin(''); setNewPin(''); setConfirmPin('');
    setPinMessage({ text: hasPin ? 'PIN changed!' : 'PIN created!', type: 'success' });
    setTimeout(() => setPinMessage({ text: '', type: '' }), 3000);
  };

  const handleDownloadPDF = async (booking: any, index: number) => {
    setDownloadingIdx(index);
    const el = document.getElementById(`pdf-ticket-template-${index}`);
    if (!el) { setDownloadingIdx(null); return; }
    try {
      el.style.display = 'flex';
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#E5E7EB' });
      el.style.display = 'none';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [250, 100] });
      pdf.addImage(imgData, 'PNG', 0, 0, 250, 100);
      pdf.save(`BookYourShow-Pass-${booking.event.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      showAlert('PDF generation failed.', 'error');
    } finally { setDownloadingIdx(null); }
  };

  const tabs = [
    { id: 'wallet',   icon: Wallet,      label: 'Quick Wallet',      color: '#f4c430' },
    { id: 'bookings', icon: Ticket,       label: 'Digital Passes',    color: '#e63946' },
    { id: 'journey',  icon: Map,          label: 'Journey Map',       color: '#f59e0b' },
    { id: 'coupons',  icon: Sparkles,     label: 'My Coupons',        color: '#8b5cf6' },
    { id: 'settings', icon: Settings,     label: 'Account Settings',  color: '#3b82f6' },
    { id: 'support',  icon: HelpCircle,   label: 'Support Center',    color: '#22c55e' },
  ];
  const activeColor = tabs.find((t) => t.id === activeTab)?.color || '#e63946';



  return (
    <PageWrapper>
      {/* Hidden PDF Templates */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -100 }}>
        {bookings.map((booking, i) => (
          <div
            key={`pdf-tpl-${i}`}
            id={`pdf-ticket-template-${i}`}
            style={{ width: '1000px', height: '400px', background: '#E5E7EB', display: 'none', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          >
            <div style={{ width: '900px', height: '320px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', overflow: 'hidden', position: 'relative', color: '#1f2937', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div style={{ width: '20px', background: '#E63946', height: '100%' }} />
              <div style={{ flex: '1', padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundImage: 'radial-gradient(circle at 100% 100%, #f9fafb 0%, #ffffff 100%)' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', fontSize: '120px', color: 'rgba(230,57,70,0.03)', fontWeight: 900, whiteSpace: 'nowrap', pointerEvents: 'none' }}>VIP ACCESS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px', zIndex: 10 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#E63946', letterSpacing: '2px', textTransform: 'uppercase' }}>BookYourShow<span style={{ color: '#1f2937' }}>.</span></h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#6b7280', letterSpacing: '2px', fontWeight: 'bold' }}>OFFICIAL ADMISSION TICKET</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#EAB308' }}>{booking.price}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Included</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '25px', zIndex: 10 }}>
                  <div style={{ flex: 2 }}>
                    <h2 style={{ fontSize: '38px', margin: '0 0 15px 0', fontWeight: 900, lineHeight: 1.1, color: '#111827', textTransform: 'uppercase' }}>{booking.event}</h2>
                    <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 700, color: '#4b5563' }}><MapPin size={18} color="#E63946" style={{ display: 'inline' }} /> {booking.venue}</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E63946' }}>{booking.date}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '25px', borderLeft: '2px solid #f3f4f6' }}>
                    <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Ticket Holder</p><p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#111827', textTransform: 'uppercase' }}>{userProfile.name}</p></div>
                    <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Section / Seat</p><p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#E63946' }}>{booking.seats}</p></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', zIndex: 10 }}>
                  <div style={{ width: '280px', height: '40px', background: 'repeating-linear-gradient(90deg, #111827 0, #111827 3px, transparent 3px, transparent 6px, #111827 6px, #111827 8px, transparent 8px, transparent 11px, #111827 11px, #111827 16px, transparent 16px, transparent 19px)', opacity: 0.8 }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', letterSpacing: '3px', fontFamily: 'monospace', fontWeight: 'bold' }}>TIX-{booking.event.substring(0, 3).toUpperCase()}-{i}0{i}1</p>
                </div>
              </div>
              <div style={{ width: '2px', borderLeft: '4px dashed #d1d5db', position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', background: '#E5E7EB', borderRadius: '50%', position: 'absolute', top: '-20px', left: '-20px', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.1)' }} />
                <div style={{ width: '40px', height: '40px', background: '#E5E7EB', borderRadius: '50%', position: 'absolute', bottom: '-20px', left: '-20px', boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ width: '250px', background: '#f9fafb', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '15px', marginBottom: '20px' }}>
                  {qrCodes[i] ? <img src={qrCodes[i]} alt="QR" style={{ width: '130px', height: '130px' }} /> : <div style={{ width: '130px', height: '130px', background: '#eee' }} />}
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 900, textAlign: 'center', letterSpacing: '2px', color: '#111827' }}>ADMIT ONE</p>
                <div style={{ width: '100%', borderTop: '2px solid #e5e7eb', paddingTop: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Non-Transferable</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dynamic Ambient Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ background: `radial-gradient(circle at 70% 20%, ${activeColor}1a 0%, transparent 55%)` }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        />
        <motion.div
          animate={{ background: `radial-gradient(circle at 20% 80%, ${activeColor}0d 0%, transparent 45%)` }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-28 pb-12 flex flex-col xl:flex-row gap-8 relative z-10 min-h-[80vh]">

        {/* ── Sidebar ── */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0"
        >
          {/* Profile card */}
          <GlowCard
            className="rounded-[28px] overflow-hidden"
            glowColor="rgba(230,57,70,0.3)"
          >
            <div
              className="glass-neo rounded-[28px] p-7 flex flex-col items-center gap-5 relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Avatar */}
              {(() => {
                const userXP = Math.max(1500, bookings.length * 50);
                const getTier = (points: number) => {
                  if (points >= 2000) return { name: 'Diamond', color: '#00D4FF', icon: Sparkles };
                  if (points >= 1000) return { name: 'Gold', color: '#FFD700', icon: Crown };
                  if (points >= 500) return { name: 'Silver', color: '#E2E8F0', icon: Award };
                  return { name: 'Bronze', color: '#CD7F32', icon: Trophy };
                };
                const tier = getTier(userXP);
                const TierIcon = tier.icon;

                return (
                  <div className="relative group/av mb-2">
                    {/* Holographic glowing ring based on tier */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-2 rounded-full pointer-events-none"
                      style={{
                        background: `conic-gradient(from 0deg, transparent, ${tier.color}, transparent)`,
                        opacity: 0.8,
                        borderRadius: '50%',
                        filter: 'blur(4px)',
                      }}
                    />
                    <div
                      className="absolute -inset-1 rounded-full pointer-events-none"
                      style={{ background: '#0d0d12', borderRadius: '50%' }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden z-10"
                      style={{
                        background: userProfile.avatar ? 'none' : `linear-gradient(135deg, #1c1c28, ${tier.color}40)`,
                        border: `3px solid ${tier.color}`,
                        boxShadow: `0 0 20px ${tier.color}40`
                      }}
                    >
                      {userProfile.avatar
                        ? <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        : <span className="font-heading">{userProfile.name.split(' ').map((n: string) => n[0]).join('')}</span>
                      }
                    </motion.div>
                    
                    {/* Tier Badge Pin */}
                    <div className="absolute -bottom-2 -right-2 bg-[#0C0C12] border-2 rounded-full w-10 h-10 flex items-center justify-center z-20" style={{ borderColor: tier.color, color: tier.color, boxShadow: `0 0 15px ${tier.color}40` }}>
                      <TierIcon size={18} />
                    </div>
                  </div>
                );
              })()}

              <div className="text-center">
                <h2 className="text-2xl font-heading tracking-wider text-white">{userProfile.name}</h2>
                <p className="text-sm mt-0.5 font-mono" style={{ color: 'rgba(248,248,255,0.4)', letterSpacing: '0.05em' }}>{userProfile.email}</p>
                {/* Online badge */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="status-dot" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: '#22c55e' }}>Online</span>
                </div>
              </div>
            </div>
          </GlowCard>

          {/* Nav tabs */}
          <div
            className="glass-neo rounded-[28px] p-3 flex flex-col gap-1"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group overflow-hidden"
                  style={{ color: isActive ? '#fff' : 'rgba(248,248,255,0.4)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="profile-tab-bg"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: `${tab.color}18`, border: `1px solid ${tab.color}30` }}
                      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    />
                  )}
                  <motion.div
                    animate={{ color: isActive ? tab.color : 'rgba(248,248,255,0.3)' }}
                    className="relative z-10 p-2 rounded-xl"
                    style={{ background: isActive ? `${tab.color}18` : 'transparent' }}
                  >
                    <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span className="relative z-10 font-bold text-sm">{tab.label}</span>
                  <ChevronRight
                    size={15}
                    className="ml-auto relative z-10 transition-all duration-300"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateX(0)' : 'translateX(-8px)',
                      color: tab.color,
                    }}
                  />
                </button>
              );
            })}

            <div className="h-px mx-4 my-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-red-500/10 group"
              style={{ color: '#e63946' }}
            >
              <div className="p-2 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <LogOut size={20} />
              </div>
              <span className="font-bold text-sm">Secure Logout</span>
            </button>
          </div>
        </motion.div>

        {/* ── Main Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 min-w-0"
        >
          <AnimatePresence mode="wait">

            {/* ── WALLET TAB ── */}
            {activeTab === 'wallet' && (
              <motion.div key="wallet" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(244,196,48,0.12)', border: '1px solid rgba(244,196,48,0.2)' }}>
                    <Wallet size={24} style={{ color: '#f4c430' }} />
                  </div>
                  <h2 className="text-4xl font-heading tracking-wider">Quick Wallet</h2>
                </motion.div>

                <WalletCard balance={walletBalance} onRequest={() => setShowFundModal(true)} />

                {/* Transaction Timeline */}
                <motion.div variants={fadeUp}>
                  <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-5 flex items-center gap-2" style={{ color: 'rgba(248,248,255,0.4)' }}>
                    <Clock size={14} /> Recent Activity
                  </h3>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Wallet size={40} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
                      <p className="text-sm font-medium" style={{ color: 'rgba(248,248,255,0.3)' }}>No transactions yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {transactions.map((tx, i) => (
                        <motion.div
                          key={i}
                          variants={fadeUp}
                          className="flex justify-between items-center p-5 rounded-2xl transition-all duration-300 group hover-lift"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{
                                background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${tx.type === 'credit' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: tx.type === 'credit' ? '#22c55e' : '#ef4444',
                              }}
                            >
                              <ChevronRight size={22} style={{ transform: tx.type === 'credit' ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                            </div>
                            <div>
                              <p className="font-bold text-sm mb-0.5 text-white">{tx.title}</p>
                              <p className="text-xs font-mono" style={{ color: 'rgba(248,248,255,0.35)', letterSpacing: '0.05em' }}>{tx.date}</p>
                            </div>
                          </div>
                          <span
                            className="font-heading text-2xl tracking-wide"
                            style={{ color: tx.type === 'credit' ? '#22c55e' : '#fff' }}
                          >
                            {tx.amount}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ── BOOKINGS TAB ── */}
            {activeTab === 'bookings' && (
              <motion.div key="bookings" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl" style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.2)' }}>
                      <Ticket size={24} style={{ color: '#e63946' }} />
                    </div>
                    <h2 className="text-4xl font-heading tracking-wider">Digital Passes</h2>
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex bg-[#0C0C12] p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setBookingViewMode('list')}
                      className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      style={{ background: bookingViewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent', color: bookingViewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    >
                      List View
                    </button>
                    <button 
                      onClick={() => setBookingViewMode('scrapbook')}
                      className="px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                      style={{ background: bookingViewMode === 'scrapbook' ? 'rgba(230,57,70,0.2)' : 'transparent', color: bookingViewMode === 'scrapbook' ? '#e63946' : 'rgba(255,255,255,0.4)' }}
                    >
                      <Sparkles size={14} /> Scrapbook
                    </button>
                  </div>
                </motion.div>

                {bookings.length === 0 ? (
                  <motion.div variants={fadeUp} className="text-center py-24 rounded-[32px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Ticket size={64} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
                    <h3 className="text-2xl font-heading tracking-wider" style={{ color: 'rgba(248,248,255,0.3)' }}>No Passes Yet</h3>
                    <p className="text-sm mt-2" style={{ color: 'rgba(248,248,255,0.2)' }}>Book an event to see your tickets here</p>
                  </motion.div>
                ) : (
                  bookingViewMode === 'list' ? (
                    <div className="flex flex-col gap-6">
                      {bookings.map((booking, i) => (
                        <motion.div key={i} variants={fadeUp}>
                          {/* 3D Flip Card */}
                          <div
                            className="relative cursor-pointer"
                            style={{ perspective: '1000px', height: '280px' }}
                            onClick={() => toggleFlip(i)}
                          >
                            <motion.div
                              animate={{ rotateY: flippedCards.has(i) ? 180 : 0 }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
                            >
                              {/* Front */}
                              <div
                                className="absolute inset-0 rounded-[28px] overflow-hidden"
                                style={{ backfaceVisibility: 'hidden', background: 'rgba(18,18,25,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                              >
                                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: 'linear-gradient(180deg, #e63946, #c1121f)' }} />
                                <div className="p-8 h-full flex flex-col justify-between">
                                  <div className="flex justify-between items-start">
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                                      {booking.status}
                                    </span>
                                    <div className="text-right">
                                      <p className="text-xs font-mono" style={{ color: 'rgba(248,248,255,0.35)' }}>{booking.date}</p>
                                      <p className="text-[10px] mt-1" style={{ color: 'rgba(248,248,255,0.25)' }}>Tap to flip ↩</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-4xl font-heading text-white mb-2">{booking.event}</h3>
                                    <p className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(248,248,255,0.55)' }}>
                                      <MapPin size={16} style={{ color: '#e63946' }} /> {booking.venue}
                                    </p>
                                  </div>
                                  <div className="flex gap-8 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div>
                                      <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(248,248,255,0.3)' }}>Section / Seat</p>
                                      <p className="font-heading text-2xl text-white">{booking.seats}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(248,248,255,0.3)' }}>Total Paid</p>
                                      <p className="font-heading text-2xl" style={{ color: '#f4c430' }}>{booking.price}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Back */}
                              <div
                                className="absolute inset-0 rounded-[28px] overflow-hidden"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(12,12,18,0.95)', border: '1px solid rgba(230,57,70,0.2)' }}
                              >
                                <div className="h-full flex flex-col md:flex-row items-center justify-center gap-8 p-8">
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-3 rounded-2xl shadow-2xl">
                                      {qrCodes[i]
                                        ? <img src={qrCodes[i]} alt="QR" className="w-32 h-32" />
                                        : <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-xl" />
                                      }
                                    </div>
                                    <p className="font-mono text-xs tracking-[0.2em]" style={{ color: 'rgba(248,248,255,0.4)' }}>
                                      TIX-{booking.event.substring(0, 3).toUpperCase()}-{i}0{i}1
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-3 w-full max-w-[200px]">
                                    <NeoButton variant="ghost" size="sm" icon={<Smartphone size={15} />} className="w-full">
                                      Apple Wallet
                                    </NeoButton>
                                    <NeoButton
                                      variant="crimson"
                                      size="sm"
                                      icon={<Download size={15} />}
                                      onClick={(e) => { e.stopPropagation(); handleDownloadPDF(booking, i); }}
                                      loading={downloadingIdx === i}
                                      className="w-full"
                                    >
                                      {downloadingIdx === i ? 'Generating…' : 'Download PDF'}
                                    </NeoButton>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Holographic Scrapbook View */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 perspective-[1500px]">
                      {bookings.map((booking, i) => (
                        <motion.div 
                          key={`scrap-${i}`} 
                          variants={fadeUp}
                          whileHover={{ rotateY: 5, rotateX: 5, scale: 1.02, zIndex: 10 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="relative h-[320px] rounded-[24px] overflow-hidden group cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #1f1f2e, #0C0C12)',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                            transformStyle: 'preserve-3d',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {/* Holographic Foil Overlay */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none mix-blend-color-dodge" 
                               style={{ background: 'linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.8) 40%, rgba(255,0,128,0.5) 50%, rgba(0,255,255,0.5) 60%, transparent 80%)', backgroundSize: '200% 200%', animation: 'holographic-shine 3s linear infinite' }} 
                          />
                          
                          <div className="flex h-full">
                            {/* Main Stub */}
                            <div className="flex-1 p-6 flex flex-col justify-between relative border-r border-dashed border-white/20">
                               <div className="absolute -right-3 top-10 w-6 h-6 bg-[#050507] rounded-full" />
                               <div className="absolute -right-3 bottom-10 w-6 h-6 bg-[#050507] rounded-full" />
                               
                               <div>
                                 <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#e63946] mb-1">BookYourShow / Admit One</p>
                                 <h3 className="text-3xl font-heading font-black text-white leading-tight uppercase line-clamp-2 mb-2">{booking.event}</h3>
                                 <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={14}/> {booking.venue}</p>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                 <div>
                                   <p className="text-[9px] tracking-widest text-gray-500 uppercase">Date & Time</p>
                                   <p className="font-bold text-sm text-white">{booking.date}</p>
                                 </div>
                                 <div>
                                   <p className="text-[9px] tracking-widest text-gray-500 uppercase">Seat Info</p>
                                   <p className="font-bold text-sm text-[#f4c430]">{booking.seats}</p>
                                 </div>
                               </div>
                            </div>

                            {/* Tear-off Stub */}
                            <div className="w-[120px] bg-black/20 flex flex-col items-center justify-between py-6 px-3 relative">
                               <Barcode size={64} className="rotate-90 text-white/40 mt-8" strokeWidth={1} />
                               <p className="text-[8px] font-mono tracking-widest text-gray-500 -rotate-90 whitespace-nowrap mb-8">TIX-{booking.event.substring(0,3).toUpperCase()}-00{i}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            )}
            {/* ── JOURNEY MAP TAB ── */}
            {activeTab === 'journey' && (
              <motion.div key="journey" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Map size={24} style={{ color: '#f59e0b' }} />
                  </div>
                  <h2 className="text-4xl font-heading tracking-wider">Live Event Journey</h2>
                </motion.div>

                {bookings.length === 0 ? (
                  <motion.div variants={fadeUp} className="text-center py-24 rounded-[32px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <MapPin size={64} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
                    <h3 className="text-2xl font-heading tracking-wider" style={{ color: 'rgba(248,248,255,0.3)' }}>No Journeys Yet</h3>
                    <p className="text-sm mt-2" style={{ color: 'rgba(248,248,255,0.2)' }}>Book an event to start your live event tour</p>
                  </motion.div>
                ) : (
                  <motion.div variants={fadeUp} className="rounded-[32px] overflow-hidden relative border border-white/10 bg-[#0C0C12] h-[500px]">
                    {/* Simulated Dark Map Background */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0C0C12]/80 to-[#0C0C12]" />
                    
                    {/* Map Interface Content */}
                    <div className="absolute inset-0 p-8 flex flex-col md:flex-row gap-8 z-10">
                      
                      {/* Interactive Map Area (Simulated for this implementation) */}
                      <div className="flex-1 relative rounded-[24px] bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                         
                         {/* Map Pins */}
                         {bookings.map((booking, i) => (
                           <motion.div 
                             key={`pin-${i}`}
                             initial={{ scale: 0, y: 20 }}
                             animate={{ scale: 1, y: 0 }}
                             transition={{ delay: i * 0.2, type: 'spring' }}
                             className="absolute flex flex-col items-center group cursor-pointer"
                             style={{ 
                               top: `${20 + (i * 15) % 60}%`, 
                               left: `${20 + (i * 25) % 60}%` 
                             }}
                           >
                             <div className="bg-[#0C0C12] text-xs font-bold px-3 py-1.5 rounded-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap z-20">
                               {booking.venue}
                             </div>
                             <div className="relative">
                               <div className="absolute inset-0 bg-[#f59e0b] rounded-full blur-md opacity-50 animate-ping" />
                               <div className="w-4 h-4 bg-[#f59e0b] rounded-full border-2 border-white relative z-10 shadow-[0_0_15px_#f59e0b]" />
                               <div className="w-0.5 h-6 bg-gradient-to-b from-[#f59e0b] to-transparent mx-auto" />
                             </div>
                           </motion.div>
                         ))}
                      </div>

                      {/* Timeline Panel */}
                      <div className="w-full md:w-80 flex flex-col h-full bg-black/40 rounded-[24px] border border-white/5 p-6 overflow-y-auto">
                        <h3 className="text-xl font-heading font-bold mb-6 text-white/80">Tour History</h3>
                        <div className="flex flex-col gap-6 relative">
                          {/* Timeline Line */}
                          <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
                          
                          {bookings.map((booking, i) => (
                            <div key={`timeline-${i}`} className="flex gap-4 relative z-10">
                              <div className="w-6 h-6 rounded-full bg-[#0C0C12] border-2 border-[#f59e0b] flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-gray-500 mb-1">{booking.date}</p>
                                <p className="text-sm font-bold text-white mb-0.5 line-clamp-1">{booking.event}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {booking.venue}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── COUPONS TAB ── */}
            {activeTab === 'coupons' && (
              <motion.div key="coupons" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                  </div>
                  <h2 className="text-4xl font-heading tracking-wider">My Coupons</h2>
                </motion.div>

                {myCoupons.length === 0 ? (
                  <motion.div variants={fadeUp} className="text-center py-24 rounded-[32px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Sparkles size={64} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
                    <h3 className="text-2xl font-heading tracking-wider" style={{ color: 'rgba(248,248,255,0.3)' }}>No Coupons Yet</h3>
                    <p className="text-sm mt-2" style={{ color: 'rgba(248,248,255,0.2)' }}>Book 3+ seats in one order to earn a lucky discount coupon!</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myCoupons.map((coupon: any, i: number) => (
                      <motion.div
                        key={i}
                        variants={fadeUp}
                        className="relative rounded-[24px] overflow-hidden"
                        style={{
                          background: coupon.status === 'used'
                            ? 'rgba(255,255,255,0.03)'
                            : 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(244,196,48,0.06))',
                          border: coupon.status === 'used'
                            ? '1px solid rgba(255,255,255,0.06)'
                            : '1px solid rgba(139,92,246,0.3)',
                          opacity: coupon.status === 'used' ? 0.6 : 1,
                        }}
                      >
                        {/* Perforated left edge */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: coupon.status === 'used' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(180deg, #8b5cf6, #f4c430)' }} />

                        {/* Status badge */}
                        <div className="absolute top-4 right-4">
                          <span
                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                            style={{
                              background: coupon.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                              color: coupon.status === 'active' ? '#22c55e' : 'rgba(248,248,255,0.3)',
                              border: `1px solid ${coupon.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`,
                            }}
                          >
                            {coupon.status === 'active' ? 'Active' : 'Used'}
                          </span>
                        </div>

                        <div className="p-6 pl-7">
                          {/* Discount badge */}
                          <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles size={16} style={{ color: coupon.discount === 100 ? '#f4c430' : '#8b5cf6' }} />
                            <span
                              className="text-sm font-bold"
                              style={{ color: coupon.discount === 100 ? '#f4c430' : '#8b5cf6' }}
                            >
                              {coupon.discount === 100 ? 'FREE TICKET' : `${coupon.discount}% OFF`}
                            </span>
                          </div>

                          {/* Code */}
                          <div
                            className="font-mono text-2xl font-extrabold tracking-[0.15em] mb-4"
                            style={{ color: coupon.status === 'used' ? 'rgba(248,248,255,0.3)' : '#fff' }}
                          >
                            {coupon.code}
                          </div>

                          <p className="text-xs mb-5" style={{ color: 'rgba(248,248,255,0.4)' }}>
                            {coupon.discount === 100
                              ? 'Applicable on your next single ticket booking.'
                              : `${coupon.discount}% off on your next ticket booking.`}
                          </p>

                          {coupon.status === 'active' && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                setCopiedCoupon(coupon.code);
                                setTimeout(() => setCopiedCoupon(null), 2000);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                              style={{
                                background: copiedCoupon === coupon.code ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.12)',
                                border: `1px solid ${copiedCoupon === coupon.code ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.25)'}`,
                                color: copiedCoupon === coupon.code ? '#22c55e' : '#8b5cf6',
                              }}
                            >
                              {copiedCoupon === coupon.code
                                ? <><CheckCircle size={13} /> Copied!</>
                                : <><Copy size={13} /> Copy Code</>
                              }
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6 max-w-3xl">
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Settings size={24} style={{ color: '#3b82f6' }} />
                  </div>
                  <h2 className="text-4xl font-heading tracking-wider">Account Settings</h2>
                </motion.div>

                {/* Personal Identity */}
                <GlowCard className="rounded-[28px]" glowColor="rgba(59,130,246,0.3)">
                  <motion.div
                    variants={fadeUp}
                    className="glass-neo rounded-[28px] p-8 relative overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[28px]" style={{ background: 'linear-gradient(90deg, #3b82f6, transparent)' }} />
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                      <User size={20} style={{ color: '#3b82f6' }} /> Personal Identity
                    </h3>

                    {pendingUpdate ? (
                      <div className="text-center py-10">
                        <User size={48} className="mx-auto mb-4" style={{ color: 'rgba(59,130,246,0.5)' }} />
                        <h4 className="text-xl font-heading mb-2">Review Pending</h4>
                        <p className="text-sm" style={{ color: 'rgba(248,248,255,0.45)' }}>Admin is reviewing your profile update request.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSettingsSubmit} className="space-y-6">
                        {/* Avatar Request */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(248,248,255,0.35)' }}>Profile Picture</label>
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold bg-white/5 border border-white/10 flex-shrink-0" style={{ background: editForm.avatar ? 'none' : 'rgba(255,255,255,0.05)' }}>
                              {editForm.avatar ? (
                                <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <User size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:bg-white/10"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                <Camera size={14} /> Change Photo
                              </button>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                              <p className="text-[10px] mt-2" style={{ color: 'rgba(248,248,255,0.3)' }}>Format: JPG, PNG. Max size: 2MB.<br />Changes require admin approval.</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {['name', 'mobile', 'city'].map((key) => (
                          <div key={key} className="relative group/field">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2 transition-colors group-focus-within/field:text-blue-400" style={{ color: 'rgba(248,248,255,0.35)' }}>
                              {key === 'name' ? 'Full Name' : key === 'mobile' ? 'Mobile Number' : 'City'}
                            </label>
                            <input
                              type="text"
                              value={editForm[key as keyof typeof editForm]}
                              onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                              disabled={pendingUpdate !== null}
                              required
                              className="w-full bg-transparent pb-3 text-lg font-medium text-white focus:outline-none transition-all duration-300 disabled:opacity-40"
                              style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
                              onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#3b82f6'; }}
                              onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)'; }}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Email (Locked)</label>
                          <input type="email" value={editForm.email} disabled className="w-full bg-transparent pb-3 text-lg font-medium focus:outline-none cursor-not-allowed" style={{ color: 'rgba(248,248,255,0.25)', borderBottom: '2px solid rgba(255,255,255,0.05)' }} />
                        </div>
                      </div>
                      {!pendingUpdate && (
                        <NeoButton variant="electric" type="submit" iconRight={<ArrowRight size={16} />}>
                          Submit for Review
                        </NeoButton>
                      )}
                    </form>
                    )}
                  </motion.div>
                </GlowCard>

                {/* Security PIN */}
                <GlowCard className="rounded-[28px]" glowColor="rgba(244,196,48,0.3)">
                  <motion.div
                    variants={fadeUp}
                    className="glass-neo rounded-[28px] p-8 relative overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[28px]" style={{ background: 'linear-gradient(90deg, #f4c430, transparent)' }} />
                    <h3 className="font-bold text-xl mb-2 flex items-center gap-3">
                      <KeyRound size={20} style={{ color: '#f4c430' }} /> Security PIN
                    </h3>
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(248,248,255,0.45)' }}>
                      {hasPin ? 'Update your 4-digit UPI security PIN.' : 'Create a 4-digit PIN for instant payments.'}
                    </p>

                    <form onSubmit={handlePinSubmit} className="space-y-6">
                      {hasPin && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,248,255,0.35)' }}>Current PIN</label>
                          <PinDots value={oldPin} />
                          <input
                            type="password" maxLength={4}
                            value={oldPin} onChange={(e) => setOldPin(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full text-center text-3xl tracking-[1em] font-mono mt-2 rounded-2xl py-3 focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f4c430' }}
                            required
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { label: 'New PIN', val: newPin, set: setNewPin },
                          { label: 'Confirm PIN', val: confirmPin, set: setConfirmPin },
                        ].map(({ label, val, set }) => (
                          <div key={label}>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,248,255,0.35)' }}>{label}</label>
                            <PinDots value={val} />
                            <input
                              type="password" maxLength={4}
                              value={val} onChange={(e) => set(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full text-center text-3xl tracking-[1em] font-mono mt-2 rounded-2xl py-3 focus:outline-none"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f4c430' }}
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <AnimatePresence>
                        {pinMessage.text && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 text-sm font-bold px-5 py-3 rounded-2xl"
                            style={{
                              background: pinMessage.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                              border: `1px solid ${pinMessage.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                              color: pinMessage.type === 'error' ? '#ef4444' : '#22c55e',
                            }}
                          >
                            {pinMessage.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            {pinMessage.text}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <NeoButton variant="gold" type="submit" icon={<Shield size={16} />}>
                        {hasPin ? 'Rotate PIN' : 'Initialize PIN'}
                      </NeoButton>
                    </form>
                  </motion.div>
                </GlowCard>
              </motion.div>
            )}

            {/* ── SUPPORT TAB ── */}
            {activeTab === 'support' && (
              <motion.div key="support" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6 max-w-4xl">
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <HelpCircle size={24} style={{ color: '#22c55e' }} />
                  </div>
                  <h2 className="text-4xl font-heading tracking-wider">Support Center</h2>
                </motion.div>

                {/* New Ticket Form */}
                <GlowCard className="rounded-[28px]" glowColor="rgba(34,197,94,0.25)">
                  <motion.div variants={fadeUp} className="glass-neo rounded-[28px] p-8" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-bold text-lg mb-6">Initiate Support Request</h3>
                    <form onSubmit={handleSupportSubmit} className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Subject</label>
                        <input
                          type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="Brief description of the issue"
                          required
                          className="w-full bg-transparent pb-3 text-lg font-medium text-white focus:outline-none placeholder:text-white/20"
                          style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
                          onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#22c55e'; }}
                          onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)'; }}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,248,255,0.35)' }}>Detailed Description</label>
                        <textarea
                          value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)}
                          placeholder="Provide all relevant details..."
                          required
                          className="w-full rounded-2xl p-5 text-white focus:outline-none min-h-[160px] resize-y placeholder:text-white/20 text-sm"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        />
                      </div>
                      <NeoButton variant="success" type="submit" iconRight={<Send size={15} />}>
                        Transmit Request
                      </NeoButton>
                    </form>
                  </motion.div>
                </GlowCard>

                {/* Chat-style ticket list */}
                {supportTickets.filter((t) => t.userEmail === userProfile.email).length > 0 && (
                  <motion.div variants={fadeUp}>
                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(248,248,255,0.35)' }}>Active Transmissions</h3>
                    <div className="flex flex-col gap-4">
                      {supportTickets
                        .filter((t) => t.userEmail === userProfile.email)
                        .map((ticket) => (
                          <div key={ticket.id} className="glass-neo rounded-[24px] p-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex justify-between items-start mb-5">
                              <div>
                                <h4 className="font-bold text-base text-white">{ticket.subject}</h4>
                                <p className="text-xs mt-1 font-mono" style={{ color: 'rgba(248,248,255,0.3)' }}>{ticket.date}</p>
                              </div>
                              <span
                                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                                style={{
                                  background: ticket.status === 'Open' ? 'rgba(244,196,48,0.1)' : 'rgba(34,197,94,0.1)',
                                  color: ticket.status === 'Open' ? '#f4c430' : '#22c55e',
                                  border: `1px solid ${ticket.status === 'Open' ? 'rgba(244,196,48,0.25)' : 'rgba(34,197,94,0.25)'}`,
                                }}
                              >
                                {ticket.status}
                              </span>
                            </div>

                            {/* User message (left) */}
                            <div className="flex gap-3 mb-4">
                              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
                                {userProfile.name[0]}
                              </div>
                              <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[80%]" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.15)', color: '#fff' }}>
                                {ticket.message}
                              </div>
                            </div>

                            {/* Admin reply (right) */}
                            {ticket.reply && (
                              <div className="flex gap-3 justify-end">
                                <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%]" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.15)', color: '#fff' }}>
                                  <p className="text-[10px] font-bold mb-1.5" style={{ color: '#22c55e' }}>Admin Reply</p>
                                  {ticket.reply}
                                </div>
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                                  <Shield size={14} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Fund Request Modal ── */}
      <AnimatePresence>
        {showFundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,7,0.8)', backdropFilter: 'blur(16px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowFundModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 32, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 32, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="glass-neo rounded-[32px] p-8 w-full max-w-md relative"
              style={{ border: '1px solid rgba(244,196,48,0.2)' }}
            >
              <button onClick={() => setShowFundModal(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: 'rgba(248,248,255,0.4)' }}>
                <X size={18} />
              </button>
              <div className="text-center mb-7">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.2)' }}>
                  <Wallet size={28} style={{ color: '#f4c430' }} />
                </div>
                <h3 className="text-2xl font-heading">Request Funds</h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(248,248,255,0.45)' }}>Admin will review and approve your request</p>
              </div>
              <form onSubmit={handleFundSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: 'rgba(248,248,255,0.4)' }}>Amount (₹)</label>
                  <input
                    type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                    className="w-full rounded-2xl px-5 py-4 text-2xl font-heading text-white focus:outline-none text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,196,48,0.25)', boxShadow: '0 0 0 0 rgba(244,196,48,0)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(244,196,48,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(244,196,48,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(244,196,48,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <NeoButton variant="gold" type="submit" className="w-full" iconRight={<ArrowRight size={16} />}>
                  Submit Request
                </NeoButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertToast
        show={alertConfig.show}
        type={alertConfig.type}
        message={alertConfig.message}
        title={alertConfig.type === 'success' ? '✓ Done' : '⚠ Error'}
      />
    </PageWrapper>
  );
}
