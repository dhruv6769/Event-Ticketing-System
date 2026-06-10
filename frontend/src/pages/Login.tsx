import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import AlertToast from '../components/AlertToast';

// ── Slogan Typewriter ──────────────────────────────────────────
const Slogans = [
  "Secure your spot at the greatest stadium concerts in India.",
  "Book front-row tickets for the latest IMAX blockbusters.",
  "Experience IPL cricket finals live in premium box seats.",
  "Get exclusive VIP passes to luxury lounges and theatres.",
];

// ── Password Strength ──────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Good', color: '#f4c430' },
    { label: 'Strong', color: '#22c55e' },
  ];
  return { score, ...levels[score] };
}

// ── Magnetic 3D Tilt Card ──────────────────────────────────────
function MagneticCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 120, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-8deg', '8deg']);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

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

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateY: rotateY, rotateX: rotateX, perspective: 1200 }}
      className={`relative ${className}`}
    >
      {/* Mouse-following halo glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[40px] z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 280px at ${glowPos.x}% ${glowPos.y}%, rgba(230,57,70,0.2), transparent 70%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

// ── Neo Input ──────────────────────────────────────────────────
interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  accentColor?: string;
}

function NeoInput({ label, icon, suffix, accentColor = '#e63946', className = '', ...props }: NeoInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(props.value);

  return (
    <div className="relative group">
      {/* Floating label */}
      <label
        className="pointer-events-none absolute z-20 transition-all duration-300 font-bold"
        style={{
          left: '3rem',
          top: focused || hasValue ? '-11px' : '14px',
          fontSize: focused || hasValue ? '9px' : '14px',
          letterSpacing: focused || hasValue ? '0.2em' : '0',
          textTransform: focused || hasValue ? 'uppercase' : 'none',
          color: focused || hasValue ? accentColor : 'rgba(248,248,255,0.3)',
          backgroundColor: focused || hasValue ? '#0d0d12' : 'transparent',
          padding: focused || hasValue ? '0 6px' : '0',
          borderRadius: '4px',
        }}
      >
        {label}
      </label>

      {/* Icon */}
      <div
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 z-10"
        style={{ color: focused ? accentColor : 'rgba(248,248,255,0.3)' }}
      >
        {icon}
      </div>

      {/* Input */}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={`w-full rounded-2xl py-4 pl-12 pr-12 text-sm text-white transition-all duration-300 focus:outline-none font-body ${className}`}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? `${accentColor}60` : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? `0 0 0 3px ${accentColor}18, inset 0 0 12px rgba(0,0,0,0.3)` : 'inset 0 0 12px rgba(0,0,0,0.2)',
        }}
      />

      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-12 h-[2px] rounded-full transition-all duration-500"
        style={{
          width: focused ? 'calc(100% - 3rem)' : '0',
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />

      {/* Suffix slot (e.g. eye toggle) */}
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          {suffix}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{ show: boolean; type: 'error' | 'success'; message: string }>({
    show: false, type: 'error', message: '',
  });

  // Typewriter
  const [sloganIndex, setSloganIndex] = useState(0);
  const [sloganText, setSloganText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Glitch logo on mount
  const [logoGlitch, setLogoGlitch] = useState(false);

  useEffect(() => {
    setLogoGlitch(true);
    const t = setTimeout(() => setLogoGlitch(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Typewriter effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentSlogan = Slogans[sloganIndex];
    const typingSpeed = isDeleting ? 20 : 55;
    if (!isDeleting && sloganText === currentSlogan) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && sloganText === '') {
      setIsDeleting(false);
      setSloganIndex((prev) => (prev + 1) % Slogans.length);
    } else {
      timer = setTimeout(() => {
        setSloganText((prev) =>
          isDeleting ? prev.slice(0, -1) : currentSlogan.slice(0, prev.length + 1)
        );
      }, typingSpeed);
    }
    return () => clearTimeout(timer);
  }, [sloganText, isDeleting, sloganIndex]);

  const showAlert = (message: string, type: 'error' | 'success' = 'error') => {
    setAlertConfig({ show: true, type, message });
    setTimeout(() => setAlertConfig((prev) => ({ ...prev, show: false })), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    if (!isLogin) {
      if (password !== confirmPassword) { showAlert('Passwords do not match!'); return; }
      
      try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || 'Registration failed'); return; }
        
        // Save user data locally for immediate UI use
        localStorage.setItem('userProfile', JSON.stringify({ name: data.user.name, email: data.user.email, avatar: data.user.avatar || '' }));
        localStorage.setItem('token', data.token);
        localStorage.setItem('walletBalance', data.user.balance?.toString() || '0');
        localStorage.setItem('isLoggedIn', 'true');
        
        // Clear mock data
        localStorage.setItem('myBookings', '[]');
        localStorage.setItem('myTransactions', '[]');
        localStorage.setItem('supportTickets', '[]');
        localStorage.setItem('myNotifications', '[]');
        
      } catch (err) {
        showAlert('Network error. Is backend running?');
        return;
      }
    } else {
      if (email === 'admin@tixindia.com' && password === 'admin123') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        navigate('/admin');
        return;
      }
      
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || 'Login failed'); return; }

        localStorage.setItem('userProfile', JSON.stringify({ name: data.user.name, email: data.user.email, avatar: data.user.avatar || '' }));
        localStorage.setItem('token', data.token);
        localStorage.setItem('walletBalance', data.user.balance?.toString() || '0');
        localStorage.setItem('isLoggedIn', 'true');
        
      } catch (err) {
        showAlert('Network error. Is backend running?');
        return;
      }
    }
    
    window.dispatchEvent(new Event('storage'));
    showAlert(isLogin ? 'Welcome back!' : 'Account created!', 'success');
    setTimeout(() => navigate('/profile'), 800);
  };

  const pwStrength = getPasswordStrength(password);
  const accentColor = isLogin ? '#e63946' : '#3b82f6';
  const accentGradient = isLogin ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)';

  return (
    <div className="min-h-screen w-full relative flex overflow-hidden select-none" style={{ background: '#050507' }}>
      {/* ── Animated Background Orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="orb orb-1 absolute w-[600px] h-[600px] opacity-[0.18]"
          style={{
            background: 'radial-gradient(circle, #e63946 0%, transparent 70%)',
            top: '-200px', left: '-200px',
          }}
        />
        <div
          className="orb orb-2 absolute w-[500px] h-[500px] opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '-150px', right: '-150px',
          }}
        />
        <div
          className="orb orb-3 absolute w-[400px] h-[400px] opacity-[0.10]"
          style={{
            background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)',
            top: '40%', left: '55%',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Main Layout ── */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen">

        {/* ── Left Panel — Visual Showcase ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-[1.1] flex-col justify-between p-16 relative"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentGradient }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span
              className={`text-sm font-bold tracking-[0.3em] text-white/60 glitch ${logoGlitch ? 'glitch-active' : ''}`}
              data-text="BOOKYOURSHOW"
            >
              BOOKYOURSHOW
            </span>
          </div>

          {/* Holographic Ticket Card */}
          <div className="flex flex-col items-center justify-center flex-grow py-12 relative">
            {/* Back radial glow */}
            <div
              className="absolute w-80 h-80 rounded-full blur-[120px] opacity-20 transition-all duration-1000"
              style={{ background: accentColor }}
            />

            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="relative aurora-border"
              style={{ borderRadius: '28px' }}
            >
              <div
                className="relative w-72 h-[420px] rounded-[28px] p-6 flex flex-col justify-between overflow-hidden glass-neo"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Scanlines */}
                <div className="scanlines absolute inset-0 pointer-events-none" />

                {/* Holographic sheen */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-x 6s ease infinite',
                  }}
                />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.3em] text-white/30 uppercase">ACCESS PASS</p>
                      <p className="font-mono text-[10px] text-white/60 mt-0.5">SECURE-992-TIX</p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: `${accentColor}18`,
                        color: accentColor,
                        border: `1px solid ${accentColor}30`,
                      }}
                    >
                      PLATINUM
                    </div>
                  </div>

                  {/* Emblem */}
                  <div className="flex justify-center my-8">
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-2 rounded-full"
                        style={{
                          border: '1px dashed rgba(255,255,255,0.1)',
                        }}
                      />
                      <Sparkles size={36} style={{ color: accentColor }} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.25em] text-white/30 uppercase">OFFICIAL TICKET</p>
                      <h3 className="text-2xl font-heading text-white font-extrabold uppercase mt-1">BookYourShow</h3>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-[8px] tracking-[0.25em] text-white/30 uppercase">TIER</p>
                        <p className="font-bold text-xs text-white">VIP LOUNGE A</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] tracking-[0.25em] text-white/30 uppercase">STATUS</p>
                        <p className="font-bold text-xs" style={{ color: accentColor }}>VERIFIED</p>
                      </div>
                    </div>
                    {/* Barcode */}
                    <div className="h-8 w-full flex items-end gap-0.5 opacity-50">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white flex-shrink-0"
                          style={{
                            width: i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
                            height: `${28 - Math.abs(Math.sin(i * 0.8) * 14)}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Typewriter slogan */}
          <div className="min-h-[48px]">
            <p className="text-white text-lg font-medium leading-relaxed tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              {sloganText}
              <span className="inline-block w-0.5 h-5 ml-1 align-middle animate-pulse" style={{ background: accentColor }} />
            </p>
          </div>
        </motion.div>

        {/* ── Right Panel — Form ── */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 relative">
          <MagneticCard className="w-full max-w-lg">
            {/* Aurora border card */}
            <div className="aurora-border" style={{ borderRadius: '40px' }}>
              <div
                className="glass-neo rounded-[40px] p-8 md:p-12 relative overflow-hidden"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                }}
              >
                {/* Tech corner brackets */}
                {['top-0 left-0 border-t border-l rounded-tl-[40px]',
                  'top-0 right-0 border-t border-r rounded-tr-[40px]',
                  'bottom-0 left-0 border-b border-l rounded-bl-[40px]',
                  'bottom-0 right-0 border-b border-r rounded-br-[40px]',
                ].map((c, i) => (
                  <div key={i} className={`absolute w-10 h-10 ${c} pointer-events-none z-20`}
                    style={{ borderColor: `${accentColor}40` }} />
                ))}

                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="lg:hidden flex items-center justify-center gap-2 mb-4"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentGradient }}>
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <span
                      className={`text-2xl font-heading font-bold tracking-widest glitch ${logoGlitch ? 'glitch-active' : ''}`}
                      data-text="BookYourShow"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, #f4c430)`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      BookYourShow
                    </span>
                  </motion.div>
                  <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-1">
                    {isLogin ? 'System Sign In' : 'Create Account'}
                  </h2>
                  <p className="text-[10px] tracking-[0.25em] font-mono" style={{ color: 'rgba(248,248,255,0.3)' }}>
                    {isLogin ? 'AUTHENTICATE TO ACCESS YOUR ACCOUNT' : 'REGISTER YOUR CREDENTIALS SECURELY'}
                  </p>
                </div>

                {/* Tab Toggle */}
                <div
                  className="flex p-1.5 mb-8 rounded-full relative"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {['Sign In', 'Register'].map((label, i) => {
                    const active = i === 0 ? isLogin : !isLogin;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setIsLogin(i === 0);
                          setName('');
                          setConfirmPassword('');
                        }}
                        className="relative flex-1 py-3 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 z-10"
                        style={{ color: active ? '#fff' : 'rgba(248,248,255,0.3)' }}
                      >
                        {active && (
                          <motion.div
                            layoutId="auth-tab-pill"
                            className="absolute inset-0 rounded-full -z-10"
                            style={{ background: accentGradient }}
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        className="overflow-hidden"
                      >
                        <NeoInput
                          label="Full Name"
                          icon={<User size={17} />}
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                          accentColor="#3b82f6"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <NeoInput
                    label="Email Address"
                    icon={<Mail size={17} />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    accentColor={accentColor}
                  />

                  <NeoInput
                    label="Security Password"
                    icon={<Lock size={17} />}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    accentColor={accentColor}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/30 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    }
                  />

                  {/* Password Strength Meter */}
                  <AnimatePresence>
                    {!isLogin && password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4].map((s) => (
                            <motion.div
                              key={s}
                              className="h-1 flex-1 rounded-full transition-all duration-500"
                              style={{
                                background: s <= pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)',
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] mt-1 font-bold tracking-wider" style={{ color: pwStrength.color }}>
                          {pwStrength.label && `Password Strength: ${pwStrength.label}`}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        key="confirm-field"
                        initial={{ opacity: 0, height: 0, y: 20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.05 }}
                        className="overflow-hidden"
                      >
                        <NeoInput
                          label="Confirm Password"
                          icon={<Lock size={17} />}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required={!isLogin}
                          accentColor="#3b82f6"
                          suffix={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-white/30 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-xs font-bold hover:underline transition-colors"
                        style={{ color: accentColor }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full relative overflow-hidden rounded-2xl py-4 text-white font-bold text-sm uppercase tracking-widest mt-4 group/btn shimmer"
                    style={{
                      background: accentGradient,
                      boxShadow: `0 12px 40px ${accentColor}40`,
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLogin ? 'Access System' : 'Submit Credentials'}
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform" />
                    </span>
                  </motion.button>
                </form>
              </div>
            </div>
          </MagneticCard>
        </div>
      </div>

      {/* Alert Toast */}
      <AlertToast
        show={alertConfig.show}
        type={alertConfig.type}
        message={alertConfig.message}
        title={alertConfig.type === 'success' ? '✓ Success' : '⚠ Error'}
      />
    </div>
  );
}
