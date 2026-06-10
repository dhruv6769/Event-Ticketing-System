import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Ticket, Zap, Shield, Sparkles, MapPin, ArrowRight, Wallet, Globe, Lock, Star, MessageSquare, X } from 'lucide-react';
import { MOCK_EVENTS } from '../data/mockData';

// ── Magnetic 3D Tilt Card ──────────────────────────────────────
function MagneticTiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
      style={{ rotateY, rotateX, perspective: 1200 }}
      className={`relative ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 250px at ${glowPos.x}% ${glowPos.y}%, rgba(230,57,70,0.15), transparent 70%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

// ── Animated Counter ───────────────────────────────────────────
function AnimatedCounter({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div ref={nodeRef} className="flex flex-col items-center justify-center p-6 glass-neo rounded-[32px] border border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <h3 className="text-5xl font-heading font-black text-white mb-2 tracking-tighter" style={{ textShadow: '0 0 20px rgba(230,57,70,0.4)' }}>
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--color-brand)]">{label}</p>
    </div>
  );
}

const DEFAULT_REVIEWS: { name: string; handle: string; text: string; rating?: number }[] = [
  { name: "Rahul S.", handle: "@rahul_codes", text: "Got front row seats to Coldplay in literally 5 seconds. Best UI ever!" },
  { name: "Priya M.", handle: "@priyam", text: "The live seat locking feature is insane. No more 'seat already taken' errors." },
  { name: "Amit K.", handle: "@amitk_sports", text: "I'm #1 on the Kohli leaderboard! Loving the gamification aspect." },
  { name: "Sneha V.", handle: "@snehavlogs", text: "Finally, a ticketing platform that doesn't look like it was built in 1999." },
  { name: "Vikram R.", handle: "@vikram_movies", text: "Booked 10 IMAX tickets. Flawless crypto payment integration." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Dynamic Stats
  const [userCount, setUserCount] = useState(0);
  const [venueCount, setVenueCount] = useState(0);

  // Reviews State
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setUserCount(users.length);

    const dynamicEvents = JSON.parse(localStorage.getItem('dynamicEvents') || '[]');
    const allEvents = [...MOCK_EVENTS, ...dynamicEvents];
    const uniqueVenues = new Set(allEvents.map(e => e.venue).filter(Boolean));
    setVenueCount(uniqueVenues.size);

    const localReviews = JSON.parse(localStorage.getItem('platformReviews') || '[]');
    if (localReviews.length > 0) {
      setReviews([...localReviews, ...DEFAULT_REVIEWS]);
    }
  }, []);

  const handleSubmitFeedback = () => {
    if (!newReviewName.trim() || !newReviewText.trim()) return;
    const newReview = {
      name: newReviewName,
      handle: "@" + newReviewName.toLowerCase().replace(/\s+/g, ''),
      text: newReviewText,
      rating: newReviewRating
    };
    const localReviews = JSON.parse(localStorage.getItem('platformReviews') || '[]');
    const updated = [newReview, ...localReviews];
    localStorage.setItem('platformReviews', JSON.stringify(updated));
    setReviews(updated.concat(DEFAULT_REVIEWS));
    setShowFeedbackModal(false);
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
  };

  // Slogan Typewriter
  const [sloganText, setSloganText] = useState('');
  const fullText = "Experience the ultimate live entertainment platform.";
  
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      if (current <= fullText.length) {
        setSloganText(fullText.slice(0, current));
        current++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] overflow-hidden select-none">
      
      {/* ── 1. Epic Hero Section ── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Parallax */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, backgroundImage: "url('/landing-bg.png')" }}
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/40 via-transparent to-[#050507] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050507_100%)] opacity-80 z-0"></div>
        
        <div className="relative z-10 text-center max-w-5xl px-4 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10 backdrop-blur-md mb-8"
          >
            <Sparkles size={16} className="text-[var(--color-brand)]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand)]">Next Generation Ticketing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
            className="text-6xl md:text-8xl font-heading font-black text-white uppercase tracking-tighter leading-[0.9] mb-6"
          >
            The Future Of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand)] via-[#f4c430] to-[var(--color-brand)] animate-gradient-x" style={{ textShadow: '0 0 40px rgba(230,57,70,0.3)' }}>
              Live Events
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto h-16"
          >
            {sloganText}<span className="animate-pulse text-[var(--color-brand)]">_</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={() => navigate('/events')}
              className="group relative px-8 py-5 rounded-2xl bg-[var(--color-brand)] overflow-hidden font-bold text-white uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(230,57,70,0.5)] transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
              <span className="relative z-10 flex items-center gap-2">Explore Events <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            </button>
            <button 
              onClick={() => navigate('/venues')}
              className="px-8 py-5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all font-bold text-white uppercase tracking-widest text-sm"
            >
              View Venues
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Live Platform Stats ── */}
      <section className="py-20 relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedCounter end={userCount} label="Active Users" suffix="" />
          <AnimatedCounter end={venueCount} label="Partner Venues" suffix="" />
          <AnimatedCounter end={99.9} label="Uptime Guarantee" suffix="%" />
        </div>
      </section>

      {/* ── 3. How It Works (3D Cards) ── */}
      <section className="py-32 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(230,57,70,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-wider mb-4">How It Works</h2>
            <div className="w-24 h-1 bg-[var(--color-brand)] mx-auto rounded-full shadow-[0_0_10px_var(--color-brand)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Ticket, title: "1. Discover", desc: "Browse through hundreds of exclusive movies, concerts, and premium sporting events happening near you." },
              { icon: Zap, title: "2. Instant Booking", desc: "Select your seats from our interactive live map and securely checkout in seconds using our lightning-fast gateway." },
              { icon: Shield, title: "3. Digital Pass", desc: "Receive an unforgeable, cryptographic digital ticket directly to your wallet. Just scan and enter the venue!" }
            ].map((feature, i) => (
              <MagneticTiltCard key={i} className="h-full">
                <div className="h-full p-10 rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(230,57,70,0.3)] transition-all duration-500">
                    <feature.icon size={36} className="text-[var(--color-brand)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </MagneticTiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Trending Now Banner ── */}
      <section className="py-20 relative z-10 bg-[var(--color-brand)]/5 border-y border-[var(--color-brand)]/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand)] mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/3 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tight mb-4">Trending Now</h2>
            <p className="text-gray-300 font-medium text-lg mb-8">Grab your seats before they vanish. The biggest events of the year are selling out fast!</p>
            <button onClick={() => navigate('/events')} className="text-[var(--color-brand)] font-bold uppercase tracking-widest text-sm hover:text-white transition-colors flex items-center gap-2 mx-auto md:mx-0">
              View All Events <ArrowRight size={16} />
            </button>
          </div>

          <div className="md:w-2/3 w-full flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x">
            {MOCK_EVENTS.slice(0, 4).map((event) => (
              <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="min-w-[280px] snap-center cursor-pointer group">
                <div className="relative h-[350px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
                  <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-[var(--color-brand)] text-white rounded-full mb-3 inline-block shadow-[0_0_10px_rgba(230,57,70,0.5)]">
                      {event.badge || event.category}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight mb-2">{event.title}</h3>
                    <p className="text-sm font-bold text-gray-300 flex items-center gap-1"><MapPin size={12} className="text-[var(--color-brand)]" /> {event.venue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4.5. Bento Box Features Grid ── */}
      <section className="py-32 relative z-10 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-wider mb-4">Unmatched Technology</h2>
            <p className="text-xl text-gray-400 font-medium">Built for the future of entertainment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Massive Feature */}
            <div className="md:col-span-2 md:row-span-2 relative glass-neo rounded-[40px] p-10 overflow-hidden group border border-white/10 hover:border-[var(--color-brand)]/50 transition-colors">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--color-brand)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Wallet className="text-[var(--color-brand)] mb-8" size={48} />
              <h3 className="text-3xl font-heading font-bold text-white mb-4">Secure Digital Wallet</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm">Every ticket is cryptographically secured to your account. Say goodbye to fraud and counterfeit tickets forever.</p>
            </div>

            {/* Top Right Feature */}
            <div className="md:col-span-2 md:row-span-1 relative glass-neo rounded-[40px] p-8 overflow-hidden group border border-white/10 hover:border-[#00d4ff]/50 transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d4ff] rounded-full mix-blend-screen filter blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <Globe className="text-[#00d4ff] mb-4" size={32} />
              <h3 className="text-2xl font-bold text-white mb-2">Global Leaderboards</h3>
              <p className="text-gray-400">Compete with millions of fans worldwide to become the ultimate super-fan of your favorite artists and teams.</p>
            </div>

            {/* Bottom Right 1 */}
            <div className="md:col-span-1 md:row-span-1 relative glass-neo rounded-[40px] p-8 overflow-hidden group border border-white/10 hover:border-[#f4c430]/50 transition-colors flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#f4c430]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Star className="text-[#f4c430] mb-4" size={32} />
              <h3 className="text-xl font-bold text-white">VIP Perks</h3>
            </div>

            {/* Bottom Right 2 */}
            <div className="md:col-span-1 md:row-span-1 relative glass-neo rounded-[40px] p-8 overflow-hidden group border border-white/10 hover:border-[#22c55e]/50 transition-colors flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#22c55e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Lock className="text-[#22c55e] mb-4" size={32} />
              <h3 className="text-xl font-bold text-white">Private Sales</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4.6. Testimonials Marquee ── */}
      <section className="py-24 relative z-10 overflow-hidden border-t border-white/5">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050507] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050507] to-transparent z-10"></div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16 relative z-20">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white uppercase tracking-wider mb-0"><MessageSquare className="inline-block mr-3 text-[var(--color-brand)]" size={36} /> Loved by Millions</h2>
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="bg-white/5 hover:bg-[var(--color-brand)] border border-white/20 hover:border-[var(--color-brand)] px-6 py-3 rounded-full text-white font-bold transition-all duration-300 flex items-center gap-2 text-sm uppercase tracking-wide hover:shadow-[0_0_20px_rgba(230,57,70,0.4)]"
          >
            <Star size={16} className="fill-white" /> Share Feedback
          </button>
        </div>

        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-6">
              {reviews.map((review, j) => (
                <div key={j} className="glass-neo p-6 rounded-3xl min-w-[350px] border border-white/5 inline-block whitespace-normal">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand)] to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white leading-tight">{review.name}</h4>
                        <span className="text-sm text-gray-500">{review.handle}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(review.rating || 5)].map((_, starIdx) => (
                        <Star key={starIdx} size={14} className="fill-[#f4c430] text-[#f4c430]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 font-medium leading-relaxed">"{review.text}"</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Final Glowing CTA Footer ── */}
      <section className="py-32 relative z-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,57,70,0.15)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter mb-8">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4c430] to-[var(--color-brand)]">Experience</span>?
          </h2>
          <p className="text-xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto">
            Join thousands of fans already securing the best seats in the house. Your next unforgettable memory is just a click away.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-12 py-6 rounded-full bg-white overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)] to-[#c1121f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 text-black group-hover:text-white font-bold text-lg uppercase tracking-widest transition-colors flex items-center justify-center gap-3">
              Join The Revolution <Sparkles size={20} />
            </span>
          </button>
        </div>
      </section>

      {/* ── Feedback Modal ── */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-heading font-black text-white uppercase mb-6 flex items-center gap-3">
                <Star className="text-[var(--color-gold)] fill-[var(--color-gold)]" size={24} /> Rate Your Experience
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input 
                    type="text" 
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g. Rahul S."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setNewReviewRating(star)}
                        className={`transition-all hover:scale-110 ${newReviewRating >= star ? 'text-[#f4c430]' : 'text-gray-600'}`}
                      >
                        <Star size={32} className={newReviewRating >= star ? 'fill-[#f4c430]' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Your Feedback</label>
                  <textarea 
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Tell everyone what you loved..."
                    rows={4}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-brand)] transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  onClick={handleSubmitFeedback}
                  className="w-full bg-[var(--color-brand)] hover:bg-red-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:shadow-[0_0_30px_rgba(230,57,70,0.5)]"
                >
                  Post Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

