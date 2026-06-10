import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Wallet, Landmark, CheckCircle, Download, ArrowRight, Lock, X, AlertCircle, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PageWrapper from '../components/PageWrapper';
import { MOCK_EVENTS } from '../data/mockData';

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Card Details State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // UPI PIN State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'enter' | 'create'>('enter');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const paymentData = location.state || {
    totalAmount: 2400,
    seatCount: 2,
    eventId: "1",
    eventTitle: "Coldplay: Live",
    eventVenue: "Narendra Modi Stadium",
    blockName: "General Admission",
    eventImage: "/coldplay.png"
  };

  const dynamicEvents = JSON.parse(localStorage.getItem('dynamicEvents') || '[]');
  const allEvents = [...dynamicEvents, ...MOCK_EVENTS];
  const matchedEvent = allEvents.find(e => e.id?.toString() === paymentData.eventId?.toString());
  const displayImage = paymentData.eventImage || matchedEvent?.image || "/coldplay.png";

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('walletBalance');
    return saved ? parseInt(saved, 10) : 14500;
  });

  // Coupon System State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [earnedCoupon, setEarnedCoupon] = useState<any>(null);
  const [isCouponRevealed, setIsCouponRevealed] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Discount Calculation variables
  const seatCount = paymentData.seatCount || 1;
  const singleTicketPrice = Math.round(paymentData.totalAmount / seatCount);
  const discountAmount = appliedCoupon 
    ? Math.round((singleTicketPrice * appliedCoupon.discount) / 100)
    : 0;
  const finalTotalAmount = Math.max(0, paymentData.totalAmount - discountAmount);
  
  const formattedDate = paymentData.date && paymentData.time 
    ? `${new Date(paymentData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${paymentData.time}` 
    : "Nov 20, 2026";
  
  const seatsSummary = `${paymentData.blockName} - ${paymentData.seatCount} Seat(s)${appliedCoupon ? ' (Discount Applied)' : ''}`;

  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const handleApplyCoupon = () => {
    setCouponError('');
    const myCoupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
    const globalCoupons = JSON.parse(localStorage.getItem('globalCoupons') || '[]');
    const allCoupons = [...myCoupons, ...globalCoupons];
    const matched = allCoupons.find((c: any) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.status === 'active');
    
    if (matched) {
      setAppliedCoupon(matched);
      setCouponError('');
    } else {
      setCouponError('Invalid, expired, or already used coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  useEffect(() => {
    if (isPinModalOpen) {
      const savedPin = localStorage.getItem('upiPin');
      if (!savedPin) {
        setPinMode('create');
      } else {
        setPinMode('enter');
      }
      setPinInput('');
      setPinConfirm('');
      setPinError('');
    }
  }, [isPinModalOpen]);

  const processPayment = () => {
    setIsProcessing(true);
    
    setTimeout(async () => {
      const qrDataUrl = await QRCode.toDataURL(`TIX-${paymentData.eventId}-CONFIRMED`);
      setQrCodeUrl(qrDataUrl);
      
      if (selectedMethod === 'upi') {
        const newBalance = walletBalance - finalTotalAmount;
        setWalletBalance(newBalance);
        localStorage.setItem('walletBalance', newBalance.toString());
      }

      // Invalidate applied coupon if applicable (only if it's a personal coupon)
      if (appliedCoupon && !JSON.parse(localStorage.getItem('globalCoupons') || '[]').find((gc: any) => gc.code.toUpperCase() === appliedCoupon.code.toUpperCase())) {
        const coupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
        const updatedCoupons = coupons.map((c: any) => 
          c.code.toUpperCase() === appliedCoupon.code.toUpperCase()
            ? { ...c, status: 'used' }
            : c
        );
        localStorage.setItem('myCoupons', JSON.stringify(updatedCoupons));
        
        // Sync isolated userDataMap database
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (currentProfile.email) {
          const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
          if (userFunds[currentProfile.email]) {
            userFunds[currentProfile.email].coupons = JSON.stringify(updatedCoupons);
            localStorage.setItem('userDataMap', JSON.stringify(userFunds));
          }
        }
      }
      
      const savedBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      
      const newBooking = {
        event: paymentData.eventTitle,
        date: formattedDate,
        venue: paymentData.eventVenue,
        seats: seatsSummary,
        price: `₹${finalTotalAmount}`,
        status: "Confirmed"
      };

      // ── API CALL TO BACKEND ──
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              eventTitle: paymentData.eventTitle,
              eventVenue: paymentData.eventVenue,
              eventDate: formattedDate,
              seatsSummary: seatsSummary,
              totalAmount: finalTotalAmount
            })
          });
        }
      } catch (err) {
        console.error("Failed to save booking to backend", err);
      }
      // ──────────────────────────

      const updatedBookings = [newBooking, ...savedBookings];
      localStorage.setItem('myBookings', JSON.stringify(updatedBookings));

      // Global Seat Locking
      if (paymentData.seats && paymentData.seats.length > 0) {
        const globalOccupied = JSON.parse(localStorage.getItem('globalOccupiedSeats') || '{}');
        const lockKeyPrefix = `${paymentData.eventId}-${paymentData.date || 'default'}-${paymentData.time || 'default'}-${paymentData.blockName}`;
        
        if (!globalOccupied[lockKeyPrefix]) globalOccupied[lockKeyPrefix] = [];
        // Add new seats without duplicates
        const updatedSeats = new Set([...globalOccupied[lockKeyPrefix], ...paymentData.seats]);
        globalOccupied[lockKeyPrefix] = Array.from(updatedSeats);
        
        localStorage.setItem('globalOccupiedSeats', JSON.stringify(globalOccupied));
      }

      const savedTransactions = JSON.parse(localStorage.getItem('myTransactions') || '[]');
      const newTx = {
        title: `Ticket Purchase - ${paymentData.eventTitle}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        amount: `-₹${finalTotalAmount}`,
        type: 'debit'
      };
      const updatedTransactions = [newTx, ...savedTransactions];
      localStorage.setItem('myTransactions', JSON.stringify(updatedTransactions));
      
      // SYNC CORE DATA TO userDataMap IMMEDIATELY
      const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (currentProfile.email) {
        const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
        if (!userFunds[currentProfile.email]) userFunds[currentProfile.email] = {};
        
        userFunds[currentProfile.email].balance = selectedMethod === 'upi' ? (walletBalance - finalTotalAmount).toString() : walletBalance.toString();
        userFunds[currentProfile.email].bookings = JSON.stringify(updatedBookings);
        userFunds[currentProfile.email].tx = JSON.stringify(updatedTransactions);
        
        localStorage.setItem('userDataMap', JSON.stringify(userFunds));
      }

      // Lucky coupon generation for buying 3 or more tickets
      if (paymentData.seatCount >= 3) {
        const randomRoll = Math.random();
        let discount = 25;
        if (randomRoll > 0.75) {
          discount = 100; // 25% chance of free ticket
        } else if (randomRoll > 0.40) {
          discount = 50;  // 35% chance of 50% discount
        } // 40% chance of 25% discount
        
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `LUCKY${discount}-${randomHex}`;
        
        const newlyEarnedCoupon = { code, discount, status: 'active' };
        const coupons = JSON.parse(localStorage.getItem('myCoupons') || '[]');
        coupons.unshift(newlyEarnedCoupon);
        localStorage.setItem('myCoupons', JSON.stringify(coupons));

        // Sync isolated userDataMap database
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (currentProfile.email) {
          const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
          if (!userFunds[currentProfile.email]) {
            userFunds[currentProfile.email] = {};
          }
          userFunds[currentProfile.email].coupons = JSON.stringify(coupons);
          localStorage.setItem('userDataMap', JSON.stringify(userFunds));
        }

        setEarnedCoupon(newlyEarnedCoupon);
      }

      setIsProcessing(false);
      setIsPinModalOpen(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handlePaymentClick = () => {
    if (selectedMethod === 'upi') {
      setIsPinModalOpen(true);
    } else {
      processPayment();
    }
  };

  const handlePinSubmit = () => {
    setPinError('');
    if (pinMode === 'create') {
      if (pinInput.length !== 4 || pinConfirm.length !== 4) {
        setPinError('PIN must be 4 digits.');
        return;
      }
      if (pinInput !== pinConfirm) {
        setPinError('PINs do not match.');
        return;
      }
      localStorage.setItem('upiPin', pinInput);
      // Sync isolated userDataMap database immediately
      const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (currentProfile.email) {
        const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
        if (!userFunds[currentProfile.email]) userFunds[currentProfile.email] = {};
        userFunds[currentProfile.email].upiPin = pinInput;
        localStorage.setItem('userDataMap', JSON.stringify(userFunds));
      }
      processPayment();
    } else {
      if (pinInput.length !== 4) {
        setPinError('PIN must be 4 digits.');
        return;
      }
      setIsProcessing(true);
      // Simulate network verification
      setTimeout(() => {
        const savedPin = localStorage.getItem('upiPin');
        if (pinInput === savedPin) {
          processPayment(); // Verification passed, now process payment
        } else {
          setIsProcessing(false);
          setPinError('Incorrect PIN. Payment failed.');
          setPinInput('');
        }
      }, 1000);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById('pdf-ticket-template-success');
    if (!el) return;
    try {
      el.style.display = 'flex';
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#E5E7EB' });
      el.style.display = 'none';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [250, 100] });
      pdf.addImage(imgData, 'PNG', 0, 0, 250, 100);
      pdf.save(`BookYourShow-Pass-${paymentData.eventTitle.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    }
  };

  if (isSuccess) {
    return (
      <PageWrapper>
        {/* Hidden PDF Success Template */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -100 }}>
          <div
            id="pdf-ticket-template-success"
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
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#EAB308' }}>₹{finalTotalAmount}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Included</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '25px', zIndex: 10 }}>
                  <div style={{ flex: 2 }}>
                    <h2 style={{ fontSize: '38px', margin: '0 0 15px 0', fontWeight: 900, lineHeight: 1.1, color: '#111827', textTransform: 'uppercase' }}>{paymentData.eventTitle}</h2>
                    <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 700, color: '#4b5563' }}><MapPin size={18} color="#E63946" style={{ display: 'inline' }} /> {paymentData.eventVenue}</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E63946' }}>{formattedDate}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '25px', borderLeft: '2px solid #f3f4f6' }}>
                    <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Ticket Holder</p><p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#111827', textTransform: 'uppercase' }}>{userProfile.name || 'Premium Member'}</p></div>
                    <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>Section / Seat</p><p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#E63946' }}>{seatsSummary}</p></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', zIndex: 10 }}>
                  <div style={{ width: '280px', height: '40px', background: 'repeating-linear-gradient(90deg, #111827 0, #111827 3px, transparent 3px, transparent 6px, #111827 6px, #111827 8px, transparent 8px, transparent 11px, #111827 11px, #111827 16px, transparent 16px, transparent 19px)', opacity: 0.8 }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', letterSpacing: '3px', fontFamily: 'monospace', fontWeight: 'bold' }}>TIX-{paymentData.eventTitle.substring(0, 3).toUpperCase()}-SUCCESS</p>
                </div>
              </div>
              <div style={{ width: '2px', borderLeft: '4px dashed #d1d5db', position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', background: '#E5E7EB', borderRadius: '50%', position: 'absolute', top: '-20px', left: '-20px', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.1)' }} />
                <div style={{ width: '40px', height: '40px', background: '#E5E7EB', borderRadius: '50%', position: 'absolute', bottom: '-20px', left: '-20px', boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ width: '250px', background: '#f9fafb', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '15px', marginBottom: '20px' }}>
                  {qrCodeUrl ? <img src={qrCodeUrl} alt="QR" style={{ width: '130px', height: '130px' }} /> : <div style={{ width: '130px', height: '130px', background: '#eee' }} />}
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 900, textAlign: 'center', letterSpacing: '2px', color: '#111827' }}>ADMIT ONE</p>
                <div style={{ width: '100%', borderTop: '2px solid #e5e7eb', paddingTop: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Non-Transferable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-32 pb-12 flex justify-center items-center min-h-[calc(100vh-100px)] relative">
          
          {/* Confetti Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: -20, x: Math.random() * window.innerWidth }}
                animate={{ 
                  opacity: 0, 
                  y: window.innerHeight + 20, 
                  x: Math.random() * window.innerWidth,
                  rotate: Math.random() * 360 
                }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                className={`absolute w-3 h-3 ${['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][Math.floor(Math.random() * 4)]}`}
              />
            ))}
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="glass rounded-3xl p-12 max-w-lg w-full text-center flex flex-col items-center relative z-10 shadow-2xl"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-500/30"
            >
              <CheckCircle size={48} className="text-white" />
            </motion.div>
            
            <h1 className="text-5xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-8 font-medium">Your VIP experience has been secured.</p>
            
            <div id="ticket-receipt-content" className="w-full flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <img src={qrCodeUrl} alt="Ticket QR Code" className="w-48 h-48" />
              </div>

              <div className="w-full bg-black/40 rounded-xl p-6 mb-8 text-left border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Event</p>
                <p className="font-bold text-xl mb-4">{paymentData.eventTitle}</p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                    <p className="font-bold text-2xl text-[var(--color-gold)]">₹{finalTotalAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Seats</p>
                    <p className="font-bold">{paymentData.seatCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lucky Coupon Reveal Section */}
            {earnedCoupon && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-full mb-8 relative"
              >
                <div className="glass rounded-3xl p-6 border border-yellow-500/30 bg-gradient-to-br from-black/60 to-yellow-500/5 relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 pointer-events-none" />
                  
                  <h3 className="font-heading text-xl text-yellow-400 mb-2 flex items-center justify-center gap-2">
                    <Sparkles size={18} className="animate-pulse" />
                    LUCKY WINNER!
                  </h3>
                  <p className="text-gray-400 text-xs mb-4">You bought 3+ seats! Click below to reveal your secret discount coupon.</p>
                  
                  <AnimatePresence mode="wait">
                    {!isCouponRevealed ? (
                      <motion.button
                        key="scratch-card"
                        onClick={() => setIsCouponRevealed(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-sm tracking-widest uppercase shadow-lg shadow-yellow-500/30"
                      >
                        REVEAL COUPON CODE
                      </motion.button>
                    ) : (
                      <motion.div
                        key="revealed-card"
                        initial={{ scale: 0.8, rotateY: 90 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 relative"
                      >
                        <div className="text-center">
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {earnedCoupon.discount === 100 ? 'FREE TICKET (100% OFF)' : `${earnedCoupon.discount}% OFF NEXT TICKET`}
                          </span>
                          <h4 className="font-mono text-3xl font-extrabold text-white tracking-widest select-all mt-3 mb-1">
                            {earnedCoupon.code}
                          </h4>
                          <p className="text-[10px] text-gray-500">Applicable on your next ticket booking of any event.</p>
                        </div>
                        
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigator.clipboard.writeText(earnedCoupon.code);
                            setCopiedStatus(true);
                            setTimeout(() => setCopiedStatus(false), 2000);
                          }}
                          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            copiedStatus 
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {copiedStatus ? (
                            <><CheckCircle size={14} /> Copied!</>
                          ) : (
                            <>Copy Code</>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 w-full">
              <button onClick={handleDownloadPDF} className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-xl font-medium flex items-center justify-center gap-2">
                <Download size={18} /> PDF
              </button>
              <Link to="/profile" state={{ activeTab: 'bookings' }} className="flex-[2] bg-[var(--color-brand)] hover:bg-red-600 transition-all py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:shadow-red-500/25">
                View Digital Pass <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-6 pt-32 pb-12 max-w-6xl relative">
        
        {/* PIN Entry Modal Overlay */}
        <AnimatePresence>
          {isPinModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass rounded-3xl p-8 max-w-sm w-full border border-[var(--color-brand)]/50 shadow-[0_0_50px_rgba(230,57,70,0.2)] relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-brand)] rounded-full mix-blend-screen filter blur-[50px] opacity-30"></div>
                
                <button 
                  onClick={() => setIsPinModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  disabled={isProcessing}
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-brand)]/20 flex items-center justify-center mb-6 border border-[var(--color-brand)]/50">
                    <Lock className="text-[var(--color-brand)]" size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-heading mb-2">
                    {pinMode === 'create' ? 'Create UPI PIN' : 'Enter UPI PIN'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-8">
                    {pinMode === 'create' ? 'Set a 4-digit PIN for future quick payments.' : `Enter your 4-digit PIN to pay ₹${paymentData.totalAmount}.`}
                  </p>

                  <div className="w-full space-y-4 mb-8">
                    <div>
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="••••"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] font-mono text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors"
                        disabled={isProcessing}
                      />
                    </div>
                    {pinMode === 'create' && (
                      <div>
                        <input 
                          type="password" 
                          maxLength={4}
                          placeholder="Confirm PIN"
                          value={pinConfirm}
                          onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] font-mono text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors"
                          disabled={isProcessing}
                        />
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {pinError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full mb-6 text-red-500 flex items-center justify-center gap-2 text-sm bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20"
                      >
                        <AlertCircle size={16} /> {pinError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={handlePinSubmit}
                    disabled={isProcessing || pinInput.length !== 4 || (pinMode === 'create' && pinConfirm.length !== 4)}
                    className="w-full bg-[var(--color-brand)] hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(230,57,70,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"></motion.div>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <h1 className="text-5xl font-heading">Secure Checkout</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Payment Details */}
          <div className="flex-[3]">
            
            {/* Payment Method Selector */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 custom-scrollbar">
              {[
                { id: 'card', icon: <CreditCard size={20} />, label: "Credit Card" },
                { id: 'upi', icon: <Wallet size={20} />, label: "Quick UPI" },
                { id: 'net', icon: <Landmark size={20} />, label: "Net Banking" }
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl whitespace-nowrap transition-all border-2 ${selectedMethod === method.id ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white' : 'border-white/10 bg-black/20 text-gray-400 hover:bg-white/5'}`}
                >
                  {method.icon}
                  <span className="font-bold">{method.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedMethod === 'card' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col xl:flex-row gap-8 items-start"
                >
                  {/* The Glassmorphism Credit Card */}
                  <div 
                    className="w-full max-w-[400px] h-[250px] relative perspective-1000"
                    onMouseEnter={() => setIsCardFlipped(true)}
                    onMouseLeave={() => setIsCardFlipped(false)}
                  >
                    <motion.div 
                      className="w-full h-full absolute transition-all duration-700 preserve-3d"
                      animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                    >
                      {/* Front of Card */}
                      <div className="absolute w-full h-full backface-hidden rounded-2xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-brand)] rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                          <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="30" rx="4" fill="#EAB308" opacity="0.8"/>
                            <path d="M 10 0 L 10 30 M 30 0 L 30 30 M 0 15 L 40 15" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
                          </svg>
                          <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="10" r="10" fill="#EB001B" opacity="0.8"/>
                            <circle cx="40" cy="10" r="10" fill="#F79E1B" opacity="0.8"/>
                          </svg>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="font-mono text-2xl tracking-[0.15em] mb-4 text-white drop-shadow-md">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </p>
                          <div className="flex justify-between items-end">
                            <div className="max-w-[70%]">
                              <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">Card Holder</p>
                              <p className="font-bold tracking-wider truncate text-white uppercase drop-shadow-md">{cardName || 'YOUR NAME'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">Expires</p>
                              <p className="font-bold tracking-wider text-white drop-shadow-md">{cardExpiry || 'MM/YY'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="absolute w-full h-full backface-hidden rounded-2xl flex flex-col justify-center overflow-hidden shadow-2xl bg-gray-800 border border-white/10" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="w-full h-12 bg-black absolute top-8"></div>
                        <div className="px-8 w-full mt-4">
                          <div className="w-full h-10 bg-white rounded flex items-center justify-end px-4">
                            <span className="font-mono text-black font-bold italic">{cardCVC || '•••'}</span>
                          </div>
                          <p className="text-right text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Security Code</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Card Input Form */}
                  <div className="flex-1 w-full space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Card Number</label>
                      <input 
                        type="text" 
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors font-mono text-lg shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Card Holder Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors font-bold uppercase shadow-inner"
                      />
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors font-mono text-lg shadow-inner text-center"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">CVC</label>
                        <input 
                          type="text" 
                          maxLength={3}
                          placeholder="123"
                          value={cardCVC}
                          onFocus={() => setIsCardFlipped(true)}
                          onBlur={() => setIsCardFlipped(false)}
                          onChange={(e) => setCardCVC(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors font-mono text-lg shadow-inner text-center"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedMethod === 'upi' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass p-8 rounded-2xl border-2 border-[var(--color-brand)] relative overflow-hidden"
                >
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--color-brand)] rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
                  <h3 className="text-xl font-heading mb-6 flex items-center gap-3">
                    <Wallet className="text-[var(--color-brand)]" /> Quick UPI Wallet
                  </h3>
                  <div className="bg-black/40 p-6 rounded-xl flex justify-between items-center border border-white/5 shadow-inner mb-6">
                    <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Available Balance</span>
                    <span className={`font-heading text-4xl ${walletBalance < finalTotalAmount ? 'text-red-500' : 'text-green-400'}`}>
                      ₹{walletBalance}
                    </span>
                  </div>
                  {walletBalance < finalTotalAmount ? (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-500 font-bold flex items-center justify-center gap-2">
                      Insufficient balance. Please add funds or use another method.
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 font-bold flex items-center justify-center gap-2">
                      <CheckCircle size={20} /> Balance sufficient for this transaction.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          <div className="flex-[2]">
            <div className="glass rounded-3xl p-8 sticky top-24 shadow-2xl border-t border-white/20">
              <h3 className="text-2xl font-heading mb-8 flex items-center justify-between">
                Order Summary
                <span className="text-xs bg-[var(--color-brand)] px-2 py-1 rounded text-white tracking-widest">SECURE</span>
              </h3>
              
              <div className="flex gap-6 mb-8 border-b border-white/10 pb-8">
                <div className="w-24 h-32 rounded-xl bg-gray-800 overflow-hidden shadow-lg flex-shrink-0">
                  <img src={displayImage} alt="Event" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-xl mb-1 leading-tight">{paymentData.eventTitle}</p>
                  <p className="text-sm text-[var(--color-brand)] font-bold mb-2">{paymentData.eventVenue}</p>
                  <p className="text-xs text-gray-400 font-medium">Nov 20, 2026 • 7:00 PM</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">{paymentData.blockName} x {paymentData.seatCount}</span>
                  <span className="font-bold text-lg">₹{paymentData.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Convenience Fee</span>
                  <span className="text-green-400 font-bold">Waived</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taxes & Charges</span>
                  <span className="text-gray-400">Included</span>
                </div>
              </div>

              {/* Promo Code Coupon Area */}
              <div className="border-t border-b border-white/10 py-5 my-5 space-y-3">
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Apply Coupon Code</label>
                <div className="flex gap-2 relative group">
                  <input 
                    type="text" 
                    placeholder="Enter LUCKY code..." 
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError('');
                    }}
                    disabled={!!appliedCoupon}
                    className="flex-1 bg-black/40 border border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 rounded-xl py-3 px-4 text-white focus:outline-none transition-colors text-sm placeholder-gray-600 disabled:opacity-50"
                  />
                  {appliedCoupon ? (
                    <button 
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 px-5 rounded-xl text-xs font-bold transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput}
                      className="bg-white/10 hover:bg-white text-white hover:text-black px-5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  )}
                </div>
                
                {couponError && (
                  <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-green-400 font-semibold flex items-center gap-1 mt-1">
                    ✓ Coupon applied: {appliedCoupon.discount}% off 1 ticket!
                  </p>
                )}
              </div>

              {appliedCoupon && (
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{paymentData.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-400 font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end mb-8 pt-6 border-t border-white/10">
                <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Total Amount</span>
                <span className="text-5xl font-heading text-[var(--color-gold)] drop-shadow-md">₹{finalTotalAmount}</span>
              </div>

              <button 
                onClick={handlePaymentClick}
                disabled={isProcessing || (selectedMethod === 'upi' && walletBalance < finalTotalAmount) || (selectedMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCVC))}
                className="group relative w-full bg-white text-black hover:bg-[var(--color-brand)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold py-5 rounded-2xl transition-all duration-300 overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 w-0 bg-[var(--color-brand)] transition-all duration-500 ease-out group-hover:w-full z-0"></div>
                <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                  {isProcessing && !isPinModalOpen ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-black border-t-transparent rounded-full group-hover:border-white group-hover:border-t-transparent"></motion.div>
                  ) : (
                    <>
                      <Lock size={18} /> Pay ₹{finalTotalAmount} Securely
                    </>
                  )}
                </span>
              </button>
              
              <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">Protected by 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
