import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Bell, Sun, Moon, CheckCircle, Trash2, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

const NAV_LINKS = [
  { label: 'Home',     category: null,      path: '/' },
  { label: 'Movies',   category: 'Movie',   path: '/events' },
  { label: 'Concerts', category: 'Concert', path: '/events' },
  { label: 'Sports',   category: 'Sports',  path: '/events' },
  { label: 'Venues',   category: null,      path: '/venues' },
  { label: 'Leaderboard', category: null,   path: '/leaderboard' },
];

export default function Navbar() {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useSearch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  const notifRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Glitch logo on mount
  const [logoGlitch, setLogoGlitch] = useState(false);
  useEffect(() => {
    setLogoGlitch(true);
    const t = setTimeout(() => setLogoGlitch(false), 600);
    return () => clearTimeout(t);
  }, []);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    if (isLightMode) { document.documentElement.classList.add('light'); localStorage.setItem('theme', 'light'); }
    else { document.documentElement.classList.remove('light'); localStorage.setItem('theme', 'dark'); }
  }, [isLightMode]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifs = () => setNotifications(JSON.parse(localStorage.getItem('myNotifications') || '[]'));
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      const saved = localStorage.getItem('userProfile');
      if (saved) setUserProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Open search on Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0) {
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      localStorage.setItem('myNotifications', JSON.stringify(updated));
    }
  };

  const getIsActive = (link: typeof NAV_LINKS[0]) => {
    if (link.path === '/') return location.pathname === '/';
    if (link.category) return location.pathname === '/events' && activeCategory === link.category;
    return location.pathname === link.path;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500`}
        style={{
          background: isScrolled ? 'rgba(5,5,7,0.88)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
          boxShadow: isScrolled ? '0 8px 32px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 md:px-8 py-4">

          {/* ── Logo ── */}
          <Link to="/" className="relative group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5"
            >
              {/* Monogram */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg flex-shrink-0 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(230,57,70,0.6)]"
                style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}
              >
                B
              </div>
              <span
                className={`text-xl font-heading font-bold tracking-wider hidden sm:block glitch ${logoGlitch ? 'glitch-active' : ''}`}
                data-text="BookYourShow"
                style={{
                  background: 'linear-gradient(135deg, #e63946 0%, #f4c430 50%, #e63946 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'gradient-x 5s ease infinite',
                }}
              >
                BookYourShow
              </span>
            </motion.div>
            {/* Hover glow */}
            <div className="absolute -inset-2 rounded-2xl bg-red-600/0 group-hover:bg-red-600/10 blur-xl transition-all duration-500 -z-10" />
          </Link>

          {/* ── Desktop Nav Links (underline style) ── */}
          {!isAdminRoute && (
            <div className="hidden md:flex items-center gap-1 ml-10">
              {NAV_LINKS.map((link) => {
                const isActive = getIsActive(link);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => link.category && setActiveCategory(link.category)}
                    className="relative px-4 py-2 text-sm font-bold tracking-wide transition-colors duration-200 group"
                    style={{ 
                      color: isActive ? (link.label === 'Leaderboard' ? '#f4c430' : '#fff') : (link.label === 'Leaderboard' ? 'rgba(244,196,48,0.7)' : 'rgba(248,248,255,0.45)'),
                      textShadow: link.label === 'Leaderboard' && isActive ? '0 0 10px rgba(244,196,48,0.5)' : 'none'
                    }}
                  >
                    {link.label}
                    {/* Underline indicator */}
                    <motion.div
                      className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                      animate={{
                        scaleX: isActive ? 1 : 0,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      style={{
                        background: 'linear-gradient(90deg, #e63946, #f4c430)',
                        transformOrigin: 'left',
                      }}
                    />
                    {/* Hover underline */}
                    {!isActive && (
                      <div
                        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex-1" />

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Search — expanding */}
            {!isAdminRoute && (
              <div className="relative">
                <AnimatePresence>
                  {searchOpen ? (
                    <motion.div
                      initial={{ width: 36, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 36, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className="flex items-center rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(230,57,70,0.4)', boxShadow: '0 0 20px rgba(230,57,70,0.15)' }}
                    >
                      <Search size={16} className="ml-3 flex-shrink-0" style={{ color: '#e63946' }} />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search events, artists…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                      <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="mr-2 p-1 rounded-full hover:bg-white/10 transition-colors" style={{ color: 'rgba(248,248,255,0.4)' }}>
                        <X size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,248,255,0.6)' }}
                      title="Search (Ctrl+K)"
                    >
                      <Search size={16} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 20 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLightMode(!isLightMode)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shimmer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              title={isLightMode ? 'Dark Mode' : 'Light Mode'}
            >
              {isLightMode
                ? <Moon size={16} style={{ color: 'rgba(100,100,140,0.9)' }} />
                : <Sun size={16} style={{ color: '#f4c430' }} />
              }
            </motion.button>

            {/* Logged in actions */}
            {!isAdminRoute && isLoggedIn && (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={handleNotifClick}
                    className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: unreadCount > 0 ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${unreadCount > 0 ? 'rgba(230,57,70,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: unreadCount > 0 ? '#e63946' : 'rgba(248,248,255,0.6)',
                    }}
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full" style={{ background: '#e63946', animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-black" style={{ background: '#e63946' }} />
                      </>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        className="absolute right-0 mt-3 w-88 rounded-3xl overflow-hidden z-50"
                        style={{
                          background: 'rgba(13,13,18,0.97)',
                          backdropFilter: 'blur(40px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
                          minWidth: '340px',
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex items-center gap-2">
                            <Bell size={15} style={{ color: '#e63946' }} />
                            <h3 className="font-bold text-sm tracking-[0.15em] uppercase text-white">Notifications</h3>
                          </div>
                          {notifications.length > 0 && (
                            <button
                              onClick={() => { setNotifications([]); localStorage.setItem('myNotifications', '[]'); }}
                              className="flex items-center gap-1 text-xs font-bold transition-colors"
                              style={{ color: 'rgba(230,57,70,0.7)' }}
                            >
                              <Trash2 size={12} /> Clear
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center py-12 text-center">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <Bell size={24} style={{ color: 'rgba(248,248,255,0.2)' }} />
                              </div>
                              <p className="text-sm font-medium" style={{ color: 'rgba(248,248,255,0.35)' }}>All caught up!</p>
                            </div>
                          ) : (
                            <div className="flex flex-col p-2 gap-1">
                              {notifications.map((n, i) => (
                                <motion.div
                                  key={n.id}
                                  initial={{ opacity: 0, x: 16 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
                                  className="flex gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden group"
                                  style={{
                                    background: !n.read ? 'rgba(230,57,70,0.07)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${!n.read ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                  }}
                                >
                                  {!n.read && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ background: '#e63946' }} />}
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: !n.read ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.06)', color: !n.read ? '#e63946' : 'rgba(248,248,255,0.4)' }}>
                                    {!n.read ? <Bell size={14} /> : <CheckCircle size={14} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug" style={{ color: !n.read ? '#fff' : 'rgba(248,248,255,0.6)', fontWeight: !n.read ? 600 : 400 }}>{n.message}</p>
                                    <p className="text-[10px] mt-1.5 font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(248,248,255,0.3)' }}>{n.date}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Avatar */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/profile"
                    className="group relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
                    style={{
                      border: '2px solid rgba(255,255,255,0.1)',
                      background: userProfile?.avatar ? 'none' : 'linear-gradient(135deg, #1c1c28, #0d0d12)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = '#e63946';
                      el.style.boxShadow = '0 0 16px rgba(230,57,70,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(255,255,255,0.1)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    {userProfile?.avatar
                      ? <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      : <User size={17} style={{ color: 'rgba(248,248,255,0.6)' }} />
                    }
                  </Link>
                </motion.div>
              </>
            )}

            {/* Not logged in */}
            {!isAdminRoute && !isLoggedIn && (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="relative hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white overflow-hidden shimmer transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #e63946, #c1121f)',
                    boxShadow: '0 4px 20px rgba(230,57,70,0.4)',
                  }}
                >
                  <User size={15} />
                  <span className="tracking-wide">Sign In</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile hamburger */}
            {!isAdminRoute && (
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,248,255,0.7)' }}
              >
                <Menu size={18} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150]"
              style={{ background: 'rgba(5,5,7,0.7)', backdropFilter: 'blur(12px)' }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-[151] rounded-t-[32px] p-6 pb-10"
              style={{
                background: 'rgba(13,13,18,0.98)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
              }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.15)' }} />

              {/* Mobile search */}
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search size={16} style={{ color: 'rgba(248,248,255,0.4)' }} />
                <input
                  type="text" placeholder="Search events…"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              {/* Links */}
              <div className="flex flex-col gap-2 mb-6">
                {NAV_LINKS.map((link) => {
                  const isActive = getIsActive(link);
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={() => { if (link.category) setActiveCategory(link.category); setMobileMenuOpen(false); }}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all duration-200"
                      style={{
                        background: isActive ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isActive ? 'rgba(230,57,70,0.25)' : 'rgba(255,255,255,0.06)'}`,
                        color: isActive ? '#e63946' : 'rgba(248,248,255,0.7)',
                      }}
                    >
                      {link.label}
                      {isActive && <div className="w-2 h-2 rounded-full" style={{ background: '#e63946' }} />}
                    </Link>
                  );
                })}
              </div>

              {/* Auth CTA */}
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white shimmer"
                  style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)', boxShadow: '0 8px 24px rgba(230,57,70,0.35)' }}
                >
                  <User size={18} /> Sign In to Your Account
                </Link>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl font-bold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  {userProfile?.avatar
                    ? <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}>{userProfile?.name?.[0]}</div>
                  }
                  <div>
                    <p className="text-sm">{userProfile?.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(248,248,255,0.4)' }}>View Profile</p>
                  </div>
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
