import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, UserCheck, XCircle, CheckCircle, ArrowRight, Users, User,
  MessageSquare, Wallet, Calendar, LogOut, Send, Ticket,
  Activity, Eye, Plus, Trash2, Trophy, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Variants } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import GlowCard from '../components/GlowCard';
import NeoButton from '../components/NeoButton';
import AlertToast from '../components/AlertToast';
import MetricCounter from '../components/MetricCounter';

// ── Spring variants ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ── Sidebar items ──────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard', icon: Activity,    label: 'Command Center',    color: '#f43f5e' },
  { id: 'promos',    icon: Ticket,      label: 'Promo Codes',       color: '#10b981' },
  { id: 'broadcast', icon: Send,        label: 'Global Broadcaster',color: '#3b82f6' },
  { id: 'users',    icon: Users,        label: 'All Users',         color: '#00d4ff' },
  { id: 'profiles', icon: UserCheck,    label: 'Profile Requests',  color: '#f4c430' },
  { id: 'support',  icon: MessageSquare,label: 'Support Tickets',   color: '#22c55e' },
  { id: 'wallet',   icon: Wallet,       label: 'Wallet Transfers',  color: '#e63946' },
  { id: 'events',   icon: Calendar,     label: 'Event Manager',     color: '#8b5cf6' },
  { id: 'rewards',  icon: Trophy,       label: 'Leaderboard Rewards', color: '#f4c430' },
];



// ── Main Component ─────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Alert
  const [alertConfig, setAlertConfig] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string }>({ show: false, type: 'success', title: '', message: '' });
  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertConfig({ show: true, type, title, message });
    setTimeout(() => setAlertConfig((p) => ({ ...p, show: false })), 2000);
  };

  // Data states
  const [pendingUpdate, setPendingUpdate]   = useState<any>(null);
  const [userProfile,   setUserProfile]     = useState<any>(null);
  const [allUsers,      setAllUsers]        = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [replyText,     setReplyText]       = useState<Record<number, string>>({});
  const [transferEmail, setTransferEmail]   = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [fundRequests,  setFundRequests]    = useState<any[]>([]);
  const [selectedUser,  setSelectedUser]    = useState<string | null>(null);
  const [eventTitle,    setEventTitle]      = useState('');
  const [eventCategory, setEventCategory]   = useState('Concert');
  const [eventVenue,    setEventVenue]      = useState('Narendra Modi Stadium');
  const [eventDate,     setEventDate]       = useState('');
  const [eventImage,    setEventImage]      = useState('');
  const [eventBadge,    setEventBadge]      = useState('Available');
  const [eventPrice,    setEventPrice]      = useState('');
  const [eventDesc,     setEventDesc]       = useState('');
  const [homeTeam,      setHomeTeam]        = useState('');
  const [awayTeam,      setAwayTeam]        = useState('');
  const [imdbRating,    setImdbRating]      = useState('');
  const [venuesList,    setVenuesList]      = useState<string[]>([]);
  // Fund transfer step (1=select user, 2=enter amount, 3=confirm)
  const [transferStep, setTransferStep]     = useState(1);

  // Rewards Manager
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [rewardForm, setRewardForm] = useState({ position: '', title: '', description: '', image: '' });
  const rewardImageRef = useRef<HTMLInputElement>(null);

  // Command Center State
  const [dashboardMetrics, setDashboardMetrics] = useState({ revenue: 0, ticketsSold: 0 });
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(10);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  useEffect(() => {
    const isLogged = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isLogged) { navigate('/login'); return; }
    setIsAdminLoggedIn(true);
    setPendingUpdate(JSON.parse(localStorage.getItem('pendingProfileUpdate') || 'null'));
    setUserProfile(JSON.parse(localStorage.getItem('userProfile') || 'null'));
    setAllUsers(JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
    setSupportTickets(JSON.parse(localStorage.getItem('supportTickets') || '[]'));
    setFundRequests(JSON.parse(localStorage.getItem('fundRequests') || '[]'));

    // Calculate metrics
    const usersData = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    let totalRev = 0;
    let totalTix = 0;
    Object.values(usersData).forEach((u: any) => {
      if (u.tx) {
        const txs = JSON.parse(u.tx);
        txs.forEach((t: any) => {
          if (t.type === 'debit') {
            const amt = parseInt(t.amount.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(amt)) totalRev += amt;
          }
        });
      }
      if (u.bookings) {
        const bkgs = JSON.parse(u.bookings);
        bkgs.forEach((b: any) => {
          const match = b.seats?.match(/- (\d+) Seat/);
          if (match && match[1]) totalTix += parseInt(match[1], 10);
        });
      }
    });
    setDashboardMetrics({ revenue: totalRev, ticketsSold: totalTix });

    const allVenues = [
      'Narendra Modi Stadium',
      'Wankhede Stadium',
      'Eden Gardens',
      'M. Chinnaswamy Stadium',
      'Indira Gandhi Arena',
      'PVR Director\'s Cut',
      'PVR Icon',
      'Jio World Convention Centre'
    ];
    setVenuesList(allVenues); 
    setEventVenue(allVenues[0]);
    
    // Initialize Leaderboard Rewards
    const storedRewards = JSON.parse(localStorage.getItem('leaderboardRewards') || 'null');
    if (!storedRewards || storedRewards.length < 10) {
      const defaultRewards = [
        { position: 1, title: 'Free Europe Tour', description: '7 Days All-Expense Paid Trip for Two!', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { position: 2, title: 'Mahindra Thar', description: 'Brand New 4x4 Earth Edition', image: '/thar.png' },
        { position: 3, title: 'iPhone 16 Pro Max', description: '1TB Titanium Edition', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80' },
        { position: 4, title: 'PS5 Pro Console', description: 'Next-Gen Gaming Setup', image: '/ps5.png' },
        { position: 5, title: 'MacBook Air M3', description: 'Supercharged by M3', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
        { position: 6, title: 'Apple Watch Ultra', description: 'Rugged smartwatch for extreme sports', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80' },
        { position: 7, title: 'Sony AirPods Max', description: 'High-fidelity audio headphones', image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80' },
        { position: 8, title: 'GoPro Hero 12', description: 'Action camera for content creators', image: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=800&q=80' },
        { position: 9, title: 'Alienware Monitor', description: '34" Curved OLED Gaming Display', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
        { position: 10, title: '₹50,000 Gift Card', description: 'Premium Amazon Shopping Spree', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80' },
      ];
      localStorage.setItem('leaderboardRewards', JSON.stringify(defaultRewards));
      setRewardsList(defaultRewards);
    } else {
      setRewardsList(storedRewards);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/login');
  };

  const handleRemoveUser = (email: string) => {
    if (!window.confirm(`Are you sure you want to completely remove user ${email}?`)) return;
    
    const updatedUsers = allUsers.filter(u => u.email !== email);
    setAllUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    const userDataMap = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    if (userDataMap[email]) {
      delete userDataMap[email];
      localStorage.setItem('userDataMap', JSON.stringify(userDataMap));
    }
    
    // Also remove any pending profile update if it belongs to this user
    if (pendingUpdate && pendingUpdate.email === email) {
      setPendingUpdate(null);
      localStorage.removeItem('pendingProfileUpdate');
    }
    
    showAlert('User Removed', `Account for ${email} has been deleted.`, 'success');
  };

  const addNotification = (email: string, message: string) => {
    const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    if (!userFunds[email]) userFunds[email] = { balance: '0', tx: '[]', bookings: '[]', tickets: '[]', notifications: '[]' };
    const notifs = JSON.parse(userFunds[email].notifications || '[]');
    const newNotif = { id: Date.now(), message, date: new Date().toLocaleDateString(), read: false };
    notifs.unshift(newNotif);
    userFunds[email].notifications = JSON.stringify(notifs);
    localStorage.setItem('userDataMap', JSON.stringify(userFunds));
    const current = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (current.email === email) {
      const active = JSON.parse(localStorage.getItem('myNotifications') || '[]');
      active.unshift(newNotif);
      localStorage.setItem('myNotifications', JSON.stringify(active));
    }
  };

  const handleApproveProfile = () => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = users.map((u: any) => u.email === pendingUpdate.email ? { ...u, profile: pendingUpdate } : u);
      
      // Free up space before saving to prevent QuotaExceededError
      localStorage.removeItem('pendingProfileUpdate');
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      setAllUsers(updatedUsers);
      addNotification(pendingUpdate.email, 'Your profile update has been approved.');
      setPendingUpdate(null);
      showAlert('Approved', 'Profile update approved and applied.', 'success');
    } catch (err: any) {
      console.error(err);
      showAlert('Error', 'Failed to approve. Image might be too large.', 'error');
    }
  };

  const handleRejectProfile = () => {
    try {
      addNotification(pendingUpdate.email, 'Your profile update was rejected.');
      localStorage.removeItem('pendingProfileUpdate');
      setPendingUpdate(null);
      showAlert('Rejected', 'Profile update rejected.', 'success');
    } catch (err: any) {
      console.error(err);
      showAlert('Error', 'Failed to reject.', 'error');
    }
  };

  const handleReplyTicket = (id: number) => {
    const text = replyText[id]; if (!text) return;
    const ticket = supportTickets.find((t) => t.id === id);
    if (ticket) addNotification(ticket.userEmail, `Admin replied to your ticket: "${ticket.subject}"`);
    const updated = supportTickets.map((t) => t.id === id ? { ...t, status: 'Resolved', reply: text } : t);
    setSupportTickets(updated);
    localStorage.setItem('supportTickets', JSON.stringify(updated));
    setReplyText((p) => ({ ...p, [id]: '' }));
    showAlert('Resolved', 'Reply sent and ticket resolved!');
  };

  const handleRewardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width; let height = img.height;
          if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setRewardForm({ ...rewardForm, image: canvas.toDataURL('image/jpeg', 0.8) });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardForm.position || !rewardForm.title) return;
    const pos = parseInt(rewardForm.position, 10);
    const existing = rewardsList.filter((r) => r.position !== pos);
    const updated = [...existing, { ...rewardForm, position: pos }].sort((a, b) => a.position - b.position);
    setRewardsList(updated);
    localStorage.setItem('leaderboardRewards', JSON.stringify(updated));
    setRewardForm({ position: '', title: '', description: '', image: '' });
    showAlert('Saved', 'Reward updated successfully!', 'success');
  };

  const handleDeleteReward = (pos: number) => {
    const updated = rewardsList.filter((r) => r.position !== pos);
    setRewardsList(updated);
    localStorage.setItem('leaderboardRewards', JSON.stringify(updated));
    showAlert('Deleted', 'Reward removed.', 'success');
  };

  const handleTransferFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail || !transferAmount) return;
    const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    if (!userFunds[transferEmail]) userFunds[transferEmail] = { balance: '0', tx: '[]', bookings: '[]', tickets: '[]', notifications: '[]' };
    userFunds[transferEmail].balance = (parseInt(userFunds[transferEmail].balance || '0') + parseInt(transferAmount)).toString();
    const txs = JSON.parse(userFunds[transferEmail].tx || '[]');
    txs.unshift({ title: 'Funds Added via Admin Transfer', date: new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount: '+₹' + transferAmount, type: 'credit' });
    userFunds[transferEmail].tx = JSON.stringify(txs);
    const notifs = JSON.parse(userFunds[transferEmail].notifications || '[]');
    notifs.unshift({ id: Date.now(), message: `You received ₹${transferAmount} via Admin Transfer`, date: new Date().toLocaleDateString(), read: false });
    userFunds[transferEmail].notifications = JSON.stringify(notifs);
    localStorage.setItem('userDataMap', JSON.stringify(userFunds));
    showAlert('Funds Transferred', `₹${transferAmount} sent to ${transferEmail}`);
    setTransferEmail(''); setTransferAmount(''); setTransferStep(1);
  };

  const handleAcceptFund = (req: any) => {
    const userFunds = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    if (!userFunds[req.userEmail]) userFunds[req.userEmail] = { balance: '0', tx: '[]', bookings: '[]', tickets: '[]', notifications: '[]' };
    userFunds[req.userEmail].balance = (parseInt(userFunds[req.userEmail].balance || '0') + parseInt(req.amount)).toString();
    const txs = JSON.parse(userFunds[req.userEmail].tx || '[]');
    txs.unshift({ title: 'Funds Added via Admin Approval', date: new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount: '+₹' + req.amount, type: 'credit' });
    userFunds[req.userEmail].tx = JSON.stringify(txs);
    const notifs = JSON.parse(userFunds[req.userEmail].notifications || '[]');
    notifs.unshift({ id: Date.now(), message: `Your fund request for ₹${req.amount} was approved!`, date: new Date().toLocaleDateString(), read: false });
    userFunds[req.userEmail].notifications = JSON.stringify(notifs);
    localStorage.setItem('userDataMap', JSON.stringify(userFunds));
    const cur = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (cur.email === req.userEmail) {
      localStorage.setItem('walletBalance', userFunds[req.userEmail].balance);
      localStorage.setItem('myTransactions', userFunds[req.userEmail].tx);
      localStorage.setItem('myNotifications', userFunds[req.userEmail].notifications);
      window.dispatchEvent(new Event('storage'));
    }
    const updated = fundRequests.filter((r) => r.id !== req.id);
    setFundRequests(updated); localStorage.setItem('fundRequests', JSON.stringify(updated));
    showAlert('Funds Approved', `₹${req.amount} approved for ${req.userEmail}`);
  };

  const handleRejectFund = (req: any) => {
    addNotification(req.userEmail, `Your fund request for ₹${req.amount} was rejected.`);
    const cur = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (cur.email === req.userEmail) {
      const uF = JSON.parse(localStorage.getItem('userDataMap') || '{}');
      localStorage.setItem('myNotifications', uF[req.userEmail]?.notifications || '[]');
      window.dispatchEvent(new Event('storage'));
    }
    const updated = fundRequests.filter((r) => r.id !== req.id);
    setFundRequests(updated); localStorage.setItem('fundRequests', JSON.stringify(updated));
    showAlert('Rejected', `Fund request rejected for ${req.userEmail}`, 'error');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = { 
      id: Date.now(), 
      title: eventTitle, 
      description: eventDesc,
      category: eventCategory, 
      venue: eventVenue, 
      date: eventDate, 
      price: eventPrice || 'TBA', 
      image: eventImage, 
      badge: eventBadge,
      ...(eventCategory === 'Sports' && { teams: { home: { name: homeTeam, form: ['-','-','-'] }, away: { name: awayTeam, form: ['-','-','-'] } } }),
      ...(eventCategory === 'Movie' && { imdbRating })
    };
    const dynamic = JSON.parse(localStorage.getItem('dynamicEvents') || '[]');
    dynamic.push(newEvent);
    localStorage.setItem('dynamicEvents', JSON.stringify(dynamic));
    showAlert('Event Created', `"${eventTitle}" is now live on the homepage.`);
    setEventTitle(''); setEventDate(''); setEventImage(''); setEventPrice(''); setEventDesc(''); setHomeTeam(''); setAwayTeam(''); setImdbRating('');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    const globalCoupons = JSON.parse(localStorage.getItem('globalCoupons') || '[]');
    globalCoupons.push({ code: promoCode, discount: promoDiscount, status: 'active' });
    localStorage.setItem('globalCoupons', JSON.stringify(globalCoupons));
    showAlert('Promo Live', `Code ${promoCode} is now active for everyone!`);
    setPromoCode('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    const usersData = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    const newNotif = {
      id: Date.now(),
      title: "Global Update",
      message: broadcastMsg,
      date: new Date().toLocaleDateString(),
      read: false
    };
    
    Object.keys(usersData).forEach(email => {
      if (!usersData[email].notifications) usersData[email].notifications = '[]';
      const notifs = JSON.parse(usersData[email].notifications);
      notifs.unshift(newNotif);
      usersData[email].notifications = JSON.stringify(notifs);
    });
    localStorage.setItem('userDataMap', JSON.stringify(usersData));

    const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (currentProfile.email) {
      const activeNotifs = JSON.parse(localStorage.getItem('myNotifications') || '[]');
      activeNotifs.unshift(newNotif);
      localStorage.setItem('myNotifications', JSON.stringify(activeNotifs));
      window.dispatchEvent(new Event('storage'));
    }

    showAlert('Broadcast Sent', 'Notification pushed to all users.');
    setBroadcastMsg('');
  };
  // Metrics
  const openTickets = supportTickets.filter((t) => t.status === 'Open').length;
  const dynamicEventCount = JSON.parse(localStorage.getItem('dynamicEvents') || '[]').length;

  if (!isAdminLoggedIn) return null;


  return (
    <div className="min-h-screen flex" style={{ background: '#050507' }}>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="orb orb-1 absolute w-[500px] h-[500px] opacity-10" style={{ background: 'radial-gradient(circle, #e63946, transparent 70%)', top: '-200px', left: '-200px' }} />
        <div className="orb orb-2 absolute w-[400px] h-[400px] opacity-8" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', bottom: '-150px', right: '-150px' }} />
      </div>

      {/* ── Collapsible Sidebar ── */}
      <motion.aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        animate={{ width: sidebarExpanded ? 240 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-20 flex-shrink-0 flex flex-col pt-24 pb-6 overflow-hidden"
        style={{
          background: 'rgba(13,13,18,0.95)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Admin badge */}
        <div className="px-3 mb-6">
          <div
            className="flex items-center gap-3 p-3 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.15)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.2)', color: '#e63946' }}>
              <ShieldCheck size={20} />
            </div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="overflow-hidden whitespace-nowrap">
                  <p className="font-bold text-sm text-white">Super Admin</p>
                  <p className="text-[10px]" style={{ color: 'rgba(248,248,255,0.4)' }}>Mission Control</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 px-3 flex-grow">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const hasNotif =
              (item.id === 'profiles' && !!pendingUpdate) ||
              (item.id === 'support' && openTickets > 0) ||
              (item.id === 'wallet' && fundRequests.length > 0);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group overflow-hidden"
                style={{ color: isActive ? item.color : 'rgba(248,248,255,0.4)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-bg"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: `${item.color}14`, borderLeft: `3px solid ${item.color}` }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(255,255,255,0.04)' }} />
                )}
                <div className="relative z-10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} />
                  {hasNotif && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'blob-morph 2s ease infinite' }} />
                  )}
                </div>
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="relative z-10 font-bold text-sm whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="px-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-2xl w-full transition-all duration-200 hover:bg-red-500/10 group"
            style={{ color: '#e63946' }}
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <LogOut size={20} />
            </div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="font-bold text-sm whitespace-nowrap">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* ── Top Metrics Bar ── */}
        <div
          className="pt-20 pb-4 px-6 flex gap-4 flex-wrap"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            { label: 'Total Users',    value: allUsers.length,        icon: Users,        color: '#00d4ff' },
            { label: 'Open Tickets',   value: openTickets,            icon: MessageSquare,color: '#22c55e' },
            { label: 'Pending Funds',  value: fundRequests.length,    icon: Wallet,       color: '#f4c430' },
            { label: 'Live Events',    value: dynamicEventCount,      icon: Calendar,     color: '#8b5cf6' },
          ].map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl flex-shrink-0"
              style={{ background: `${m.color}0d`, border: `1px solid ${m.color}20` }}
            >
              <m.icon size={18} style={{ color: m.color }} />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: `${m.color}aa` }}>{m.label}</p>
                <MetricCounter value={m.value} className="text-xl font-heading" />
              </div>
            </div>
          ))}

          {/* Header banner */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.15)' }}>
              <Activity size={14} style={{ color: '#e63946' }} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#e63946' }}>Mission Control</span>
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">

            {/* ── COMMAND CENTER DASHBOARD ── */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    <Activity size={20} style={{ color: '#f43f5e' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Command Center</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div variants={fadeUp} className="glass-neo p-6 rounded-[28px] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4ff]/10 rounded-full blur-3xl group-hover:bg-[#00d4ff]/20 transition-all"></div>
                    <p className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2">Live Users</p>
                    <h3 className="text-5xl font-heading text-white">{allUsers.length}</h3>
                  </motion.div>
                  <motion.div variants={fadeUp} className="glass-neo p-6 rounded-[28px] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 rounded-full blur-3xl group-hover:bg-[#10b981]/20 transition-all"></div>
                    <p className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2">Total Tickets Sold</p>
                    <h3 className="text-5xl font-heading text-white">{dashboardMetrics.ticketsSold}</h3>
                  </motion.div>
                  <motion.div variants={fadeUp} className="glass-neo p-6 rounded-[28px] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f4c430]/10 rounded-full blur-3xl group-hover:bg-[#f4c430]/20 transition-all"></div>
                    <p className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2">Total Revenue</p>
                    <h3 className="text-5xl font-heading text-[var(--color-gold)]">₹{dashboardMetrics.revenue.toLocaleString()}</h3>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── PROMO CODES ── */}
            {activeTab === 'promos' && (
              <motion.div key="promos" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Ticket size={20} style={{ color: '#10b981' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Promo Code Generator</h2>
                </motion.div>
                <motion.div variants={fadeUp} className="glass-neo rounded-[28px] p-7 max-w-2xl border border-white/10">
                  <form onSubmit={handleCreatePromo} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-gray-400">Coupon Code</label>
                      <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)} required placeholder="e.g. SUMMER50" className="w-full rounded-2xl px-4 py-3.5 text-white bg-white/5 border border-white/10 focus:border-[#10b981] focus:outline-none uppercase" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-gray-400">Discount Percentage (%)</label>
                      <input type="number" min="1" max="100" value={promoDiscount} onChange={e => setPromoDiscount(parseInt(e.target.value))} required className="w-full rounded-2xl px-4 py-3.5 text-white bg-white/5 border border-white/10 focus:border-[#10b981] focus:outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/50 hover:bg-[#10b981] hover:text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all">Generate Global Promo</button>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {/* ── GLOBAL BROADCASTER ── */}
            {activeTab === 'broadcast' && (
              <motion.div key="broadcast" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Send size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Global Broadcaster</h2>
                </motion.div>
                <motion.div variants={fadeUp} className="glass-neo rounded-[28px] p-7 max-w-2xl border border-white/10">
                  <form onSubmit={handleBroadcast} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-gray-400">Broadcast Message</label>
                      <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} required placeholder="Type a message to send to all registered users instantly..." rows={4} className="w-full rounded-2xl px-4 py-3.5 text-white bg-white/5 border border-white/10 focus:border-[#3b82f6] focus:outline-none"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/50 hover:bg-[#3b82f6] hover:text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all">Blast Notification</button>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {/* ── ALL USERS ── */}
            {activeTab === 'users' && (
              <motion.div key="users" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <Users size={20} style={{ color: '#00d4ff' }} />
                  </div>
                  <h2 className="text-3xl font-heading">All Registered Users</h2>
                </motion.div>

                {allUsers.length === 0 ? (
                  <motion.div variants={fadeUp} className="text-center py-20 rounded-[28px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Users size={48} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    <h3 className="text-2xl font-heading mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>No Users Found</h3>
                    <p className="text-sm" style={{ color: 'rgba(248,248,255,0.3)' }}>No registered users in the database yet.</p>
                  </motion.div>
                ) : (
                  <motion.div variants={fadeUp} className="glass-neo rounded-[24px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(248,248,255,0.35)' }}>
                        {allUsers.length} registered accounts
                      </p>
                    </div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {['User', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(248,248,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u: any, idx: number) => {
                          const hue = (idx * 47) % 360;
                          return (
                            <tr
                              key={idx}
                              className="transition-all duration-200 group"
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden" style={{ background: u.profile?.avatar ? 'none' : `hsl(${hue},60%,40%)`, border: u.profile?.avatar ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                    {u.profile?.avatar ? (
                                      <img src={u.profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      u.email[0].toUpperCase()
                                    )}
                                  </div>
                                  <span className="font-medium text-sm text-white">{u.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedUser(u.email)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,248,255,0.6)' }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(248,248,255,0.6)'; }}
                                  >
                                    <Eye size={13} /> View Details
                                  </button>
                                  <button
                                    onClick={() => handleRemoveUser(u.email)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                                    title="Remove User"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── PROFILE REQUESTS ── */}
            {activeTab === 'profiles' && (
              <motion.div key="profiles" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.2)' }}>
                    <UserCheck size={20} style={{ color: '#f4c430' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Pending Profile Updates</h2>
                </motion.div>

                {!pendingUpdate ? (
                  <motion.div variants={fadeUp} className="text-center py-20 rounded-[28px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'rgba(34,197,94,0.4)' }} />
                    <h3 className="text-2xl font-heading mb-2">All Clear!</h3>
                    <p className="text-sm" style={{ color: 'rgba(248,248,255,0.35)' }}>No pending profile update requests.</p>
                  </motion.div>
                ) : (
                  <motion.div variants={fadeUp} className="glass-neo rounded-[28px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="font-bold">
                        Request for <span style={{ color: '#f4c430' }}>{userProfile?.email}</span>
                      </h3>
                    </div>

                    {/* GitHub-style diff view */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
                      {/* Before */}
                      <div className="rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="px-4 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]" style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,248,255,0.5)' }}>
                          <span className="text-red-400">−</span> Current
                        </div>
                        <div className="p-6 flex-1 flex flex-col items-center justify-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                           <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold mb-3" style={{ background: userProfile?.avatar ? 'none' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                             {userProfile?.avatar ? <img src={userProfile.avatar} alt="Current" className="w-full h-full object-cover" /> : <User size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(248,248,255,0.35)' }}>Avatar</span>
                        </div>
                        {['name', 'mobile', 'city'].map((k) => {
                          const changed = userProfile?.[k] !== pendingUpdate[k];
                          return (
                            <div key={k} className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(248,248,255,0.35)' }}>{k}</span>
                              <span className="text-sm font-medium" style={{ color: changed ? 'rgba(239,68,68,0.9)' : 'rgba(248,248,255,0.7)', textDecoration: changed ? 'line-through' : 'none' }}>
                                {userProfile?.[k] || 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center justify-center">
                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                          <ArrowRight size={24} style={{ color: 'rgba(34,197,94,0.5)' }} />
                        </motion.div>
                      </div>

                      {/* After */}
                      <div className="rounded-2xl overflow-hidden flex flex-col relative" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.05), transparent)' }} />
                        <div className="px-4 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] relative z-10" style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.1)', color: 'rgba(34,197,94,0.8)' }}>
                          <span>+</span> Requested
                        </div>
                        <div className="p-6 flex-1 flex flex-col items-center justify-center relative z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                           <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold mb-3 relative" style={{ background: pendingUpdate.avatar ? 'none' : 'rgba(255,255,255,0.05)', border: '2px solid rgba(34,197,94,0.4)', boxShadow: '0 0 15px rgba(34,197,94,0.2)' }}>
                             {pendingUpdate.avatar ? <img src={pendingUpdate.avatar} alt="Requested" className="w-full h-full object-cover" /> : <User size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: userProfile?.avatar !== pendingUpdate.avatar ? '#22c55e' : 'rgba(248,248,255,0.35)' }}>Avatar</span>
                        </div>
                        <div className="relative z-10">
                          {['name', 'mobile', 'city'].map((k) => {
                            const changed = userProfile?.[k] !== pendingUpdate[k];
                            return (
                              <div key={k} className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: changed ? 'rgba(34,197,94,0.05)' : 'transparent' }}>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(248,248,255,0.35)' }}>{k}</span>
                                <span className="text-sm font-bold" style={{ color: changed ? '#22c55e' : 'rgba(248,248,255,0.7)' }}>
                                  {pendingUpdate[k] || 'N/A'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <NeoButton variant="success" onClick={handleApproveProfile} icon={<CheckCircle size={16} />} className="flex-1">
                        Approve Changes
                      </NeoButton>
                      <NeoButton variant="danger" onClick={handleRejectProfile} icon={<XCircle size={16} />} className="flex-1">
                        Reject
                      </NeoButton>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── SUPPORT TICKETS ── */}
            {activeTab === 'support' && (
              <motion.div key="support" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <MessageSquare size={20} style={{ color: '#22c55e' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Support Tickets</h2>
                </motion.div>

                {supportTickets.length === 0 ? (
                  <motion.div variants={fadeUp} className="text-center py-20 rounded-[28px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <MessageSquare size={48} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    <h3 className="text-2xl font-heading mb-2">No Open Tickets</h3>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {supportTickets.map((ticket) => (
                      <motion.div key={ticket.id} variants={fadeUp} className="glass-neo rounded-[24px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="p-5 flex justify-between items-start" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div>
                            <p className="text-xs font-bold mb-0.5" style={{ color: '#e63946' }}>{ticket.userEmail}</p>
                            <h4 className="font-bold text-base text-white">{ticket.subject}</h4>
                            <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(248,248,255,0.3)' }}>{ticket.date}</p>
                          </div>
                          <span
                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
                            style={{
                              background: ticket.status === 'Open' ? 'rgba(244,196,48,0.1)' : 'rgba(34,197,94,0.1)',
                              color: ticket.status === 'Open' ? '#f4c430' : '#22c55e',
                              border: `1px solid ${ticket.status === 'Open' ? 'rgba(244,196,48,0.25)' : 'rgba(34,197,94,0.25)'}`,
                            }}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="rounded-xl p-4 mb-4 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,248,255,0.7)' }}>
                            {ticket.message}
                          </div>
                          {ticket.status === 'Open' ? (
                            <div className="flex gap-3">
                              <textarea
                                placeholder="Type your reply…"
                                value={replyText[ticket.id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                                className="flex-1 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none resize-none min-h-[80px] placeholder:text-white/20"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                              />
                              <NeoButton
                                variant="success"
                                size="sm"
                                icon={<Send size={14} className="rotate-45" />}
                                onClick={() => handleReplyTicket(ticket.id)}
                                className="self-end"
                              >
                                Resolve
                              </NeoButton>
                            </div>
                          ) : (
                            <div className="flex gap-3 items-start p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                              <ShieldCheck size={16} style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <p className="text-xs font-bold mb-1" style={{ color: '#22c55e' }}>Admin Reply:</p>
                                <p className="text-sm" style={{ color: 'rgba(248,248,255,0.7)' }}>{ticket.reply}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── WALLET MANAGEMENT ── */}
            {activeTab === 'wallet' && (
              <motion.div key="wallet" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
                    <Wallet size={20} style={{ color: '#e63946' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Wallet Management</h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fund Requests */}
                  <motion.div variants={fadeUp} className="glass-neo rounded-[28px] p-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                      Pending Requests
                      {fundRequests.length > 0 && (
                        <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: '#e63946', color: '#fff' }}>
                          {fundRequests.length}
                        </span>
                      )}
                    </h3>
                    {fundRequests.length === 0 ? (
                      <div className="text-center py-10 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,248,255,0.35)' }}>
                        No pending fund requests
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {fundRequests.map((req: any) => (
                          <GlowCard key={req.id} className="rounded-2xl" glowColor="rgba(244,196,48,0.2)">
                            <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {/* Diagonal stripe background */}
                              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 8px)' }} />
                              <div className="relative z-10 flex justify-between items-start mb-4">
                                <div>
                                  <p className="text-xs font-mono mb-1" style={{ color: 'rgba(248,248,255,0.45)' }}>{req.userEmail}</p>
                                  <p className="text-3xl font-heading" style={{ color: '#f4c430' }}>₹{req.amount}</p>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(248,248,255,0.3)' }}>{req.date}</span>
                              </div>
                              <div className="relative z-10 flex gap-3">
                                <NeoButton variant="success" size="sm" icon={<CheckCircle size={14} />} onClick={() => handleAcceptFund(req)} className="flex-1">Approve</NeoButton>
                                <NeoButton variant="danger" size="sm" icon={<XCircle size={14} />} onClick={() => handleRejectFund(req)} className="flex-1">Reject</NeoButton>
                              </div>
                            </div>
                          </GlowCard>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Manual Transfer — stepped form */}
                  <motion.div variants={fadeUp} className="glass-neo rounded-[28px] p-6 h-fit" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-bold text-lg mb-2">Manual Transfer</h3>
                    <p className="text-sm mb-6" style={{ color: 'rgba(248,248,255,0.4)' }}>Directly send funds to a user.</p>

                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                            style={{
                              background: transferStep >= s ? '#e63946' : 'rgba(255,255,255,0.08)',
                              color: transferStep >= s ? '#fff' : 'rgba(248,248,255,0.3)',
                            }}
                          >
                            {s}
                          </div>
                          {s < 3 && <div className="flex-1 h-0.5 w-8" style={{ background: transferStep > s ? '#e63946' : 'rgba(255,255,255,0.08)' }} />}
                        </div>
                      ))}
                      <span className="text-xs font-bold ml-2" style={{ color: 'rgba(248,248,255,0.4)' }}>
                        {transferStep === 1 ? 'Select User' : transferStep === 2 ? 'Enter Amount' : 'Confirm'}
                      </span>
                    </div>

                    <form onSubmit={handleTransferFunds} className="space-y-4">
                      <AnimatePresence mode="wait">
                        {transferStep === 1 && (
                          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <select
                              value={transferEmail}
                              onChange={(e) => { setTransferEmail(e.target.value); if (e.target.value) setTransferStep(2); }}
                              className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                              <option value="">Select a user…</option>
                              {allUsers.map((u, i) => <option key={i} value={u.email}>{u.email}</option>)}
                            </select>
                          </motion.div>
                        )}
                        {transferStep === 2 && (
                          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                            <p className="text-xs font-bold" style={{ color: 'rgba(248,248,255,0.4)' }}>
                              Sending to: <span style={{ color: '#00d4ff' }}>{transferEmail}</span>
                            </p>
                            <input
                              type="number" value={transferAmount}
                              onChange={(e) => { setTransferAmount(e.target.value); if (e.target.value) setTransferStep(3); }}
                              placeholder="Amount in ₹"
                              className="w-full rounded-2xl px-4 py-3.5 text-3xl font-heading text-center text-white focus:outline-none"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(230,57,70,0.3)' }}
                            />
                          </motion.div>
                        )}
                        {transferStep === 3 && (
                          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)' }}>
                              <p className="text-xs mb-1" style={{ color: 'rgba(248,248,255,0.4)' }}>Sending to {transferEmail}</p>
                              <p className="text-5xl font-heading" style={{ color: '#f4c430' }}>₹{transferAmount}</p>
                            </div>
                            <div className="flex gap-3">
                              <button type="button" onClick={() => setTransferStep(1)} className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,248,255,0.6)' }}>
                                ← Reset
                              </button>
                              <NeoButton variant="crimson" type="submit" className="flex-1" icon={<ArrowRight size={15} />}>
                                Confirm Transfer
                              </NeoButton>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── EVENT MANAGER ── */}
            {activeTab === 'events' && (
              <motion.div key="events" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Calendar size={20} style={{ color: '#8b5cf6' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Event Manager</h2>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
                  {/* Form */}
                  <motion.div variants={fadeUp} className="glass-neo rounded-[28px] p-7" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <Plus size={18} style={{ color: '#8b5cf6' }} /> Create New Event
                    </h3>
                    <form onSubmit={handleCreateEvent} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Event Title</label>
                          <input
                            type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g. Taylor Swift: The Eras Tour"
                            required
                            className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Category</label>
                          <select value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {['Concert', 'Sports', 'Movie'].map((c) => <option key={c} value={c} className="bg-[#050507] text-white">{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Venue</label>
                          <select value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {venuesList.map((v, i) => <option key={i} value={v} className="bg-[#050507] text-white">{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Date & Time</label>
                          <input
                            type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                            placeholder="e.g. Dec 31, 2026"
                            required
                            className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Image URL</label>
                          <input
                            type="url" value={eventImage} onChange={(e) => setEventImage(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            required
                            className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Ticket Price</label>
                          <input
                            type="text" value={eventPrice} onChange={(e) => setEventPrice(e.target.value)}
                            placeholder="e.g. ₹1500"
                            className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Event Description</label>
                          <textarea
                            value={eventDesc} onChange={(e) => setEventDesc(e.target.value)}
                            placeholder="Describe the event..."
                            rows={3}
                            className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                          />
                        </div>

                        {/* Dynamic Fields */}
                        {eventCategory === 'Sports' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Home Team Name</label>
                              <input
                                type="text" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}
                                placeholder="e.g. CSK"
                                className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Away Team Name</label>
                              <input
                                type="text" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}
                                placeholder="e.g. MI"
                                className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                              />
                            </div>
                          </>
                        )}
                        {eventCategory === 'Movie' && (
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>IMDb Rating</label>
                            <input
                              type="text" value={imdbRating} onChange={(e) => setImdbRating(e.target.value)}
                              placeholder="e.g. 8.5"
                              className="w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,248,255,0.35)' }}>Badge / Status</label>
                          <div className="flex gap-3">
                            {['Available', 'Selling Fast', 'Almost Full'].map((b) => (
                              <button
                                key={b} type="button" onClick={() => setEventBadge(b)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                                style={{
                                  background: eventBadge === b ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${eventBadge === b ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                  color: eventBadge === b ? '#8b5cf6' : 'rgba(248,248,255,0.4)',
                                }}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <NeoButton variant="crimson" type="submit" icon={<CheckCircle size={16} />} className="w-full">
                        Publish Event
                      </NeoButton>
                    </form>
                  </motion.div>

                  {/* Live Preview */}
                  <motion.div variants={fadeUp} className="sticky top-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: 'rgba(248,248,255,0.35)' }}>Live Preview</p>
                    <div className="rounded-[24px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="h-40 relative" style={{ background: eventImage ? `url(${eventImage}) center/cover` : 'rgba(255,255,255,0.04)' }}>
                        {!eventImage && <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">No image URL yet</div>}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(5,5,7,0.9))' }} />
                        <span
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
                        >
                          {eventBadge}
                        </span>
                      </div>
                      <div className="p-5" style={{ background: 'rgba(13,13,18,0.9)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#8b5cf6' }}>{eventCategory}</span>
                        <h4 className="font-heading text-xl text-white mt-1 mb-2 truncate">{eventTitle || 'Event Title…'}</h4>
                        <p className="text-xs" style={{ color: 'rgba(248,248,255,0.45)' }}>{eventVenue}</p>
                        <p className="text-xs mt-0.5 font-bold" style={{ color: '#e63946' }}>{eventDate || 'Date TBD'}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── LEADERBOARD REWARDS ── */}
            {activeTab === 'rewards' && (
              <motion.div key="rewards" variants={stagger} initial="hidden" animate="show" exit="hidden" className="flex flex-col gap-6">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.2)' }}>
                    <Trophy size={20} style={{ color: '#f4c430' }} />
                  </div>
                  <h2 className="text-3xl font-heading">Leaderboard Rewards</h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form */}
                  <motion.div variants={fadeUp} className="lg:col-span-1">
                    <GlowCard className="rounded-[28px]" glowColor="rgba(244,196,48,0.3)">
                      <div className="glass-neo p-6 rounded-[28px]" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="font-heading text-xl mb-6 text-white">Add / Edit Reward</h3>
                        <form onSubmit={handleSaveReward} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Position (Rank)</label>
                            <input
                              type="number" min="1" required
                              value={rewardForm.position} onChange={(e) => setRewardForm({ ...rewardForm, position: e.target.value })}
                              className="w-full bg-transparent pb-2 text-lg font-bold text-white focus:outline-none"
                              style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Reward Title</label>
                            <input
                              type="text" required
                              value={rewardForm.title} onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                              className="w-full bg-transparent pb-2 text-lg font-medium text-white focus:outline-none"
                              style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Description</label>
                            <input
                              type="text"
                              value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                              className="w-full bg-transparent pb-2 text-sm text-white focus:outline-none"
                              style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,248,255,0.35)' }}>Reward Image</label>
                            <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center bg-white/5 flex-shrink-0">
                                {rewardForm.image ? <img src={rewardForm.image} alt="Reward" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-white/20" />}
                              </div>
                              <button type="button" onClick={() => rewardImageRef.current?.click()} className="text-xs font-bold px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                Upload Image
                              </button>
                              <input type="file" ref={rewardImageRef} className="hidden" accept="image/*" onChange={handleRewardImageUpload} />
                            </div>
                          </div>
                          <NeoButton variant="gold" type="submit" className="w-full mt-4" icon={<Plus size={16} />}>Save Reward</NeoButton>
                        </form>
                      </div>
                    </GlowCard>
                  </motion.div>

                  {/* List */}
                  <motion.div variants={fadeUp} className="lg:col-span-2 flex flex-col gap-3">
                    {rewardsList.map((reward, i) => (
                      <div key={i} className="glass-neo p-4 rounded-2xl flex items-center justify-between" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading text-lg font-bold" style={{ background: reward.position <= 3 ? '#f4c430' : 'rgba(255,255,255,0.1)', color: reward.position <= 3 ? '#000' : '#fff' }}>
                            #{reward.position}
                          </div>
                          {reward.image && <img src={reward.image} alt={reward.title} className="w-12 h-12 rounded-lg object-cover border border-white/10" />}
                          <div>
                            <h4 className="font-bold text-white">{reward.title}</h4>
                            <p className="text-[10px] text-white/50 truncate max-w-xs">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setRewardForm(reward)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDeleteReward(reward.position)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {rewardsList.length === 0 && <p className="text-center text-white/40 py-10">No rewards added yet.</p>}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── User Detail Slide-Over ── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200]" style={{ background: 'rgba(5,5,7,0.7)', backdropFilter: 'blur(12px)' }} onClick={() => setSelectedUser(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed top-0 right-0 bottom-0 z-[201] w-full max-w-md overflow-y-auto"
              style={{ background: '#0d0d12', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="p-7">
                <div className="flex justify-between items-center mb-7">
                  <h2 className="text-2xl font-heading flex items-center gap-2">
                    <User size={22} style={{ color: '#e63946' }} /> User Details
                  </h2>
                  <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: 'rgba(248,248,255,0.5)' }}>
                    <XCircle size={20} />
                  </button>
                </div>
                {(() => {
                  const u = allUsers.find((u: any) => u.email === selectedUser);
                  const uF = JSON.parse(localStorage.getItem('userDataMap') || '{}');
                  const data = uF[selectedUser] || {};
                  const profile = u?.profile || { name: 'User', mobile: '', city: '' };
                  const balance = data.balance || '0';
                  const bookings = JSON.parse(data.bookings || '[]');
                  return (
                    <div className="space-y-5">
                      {profile.avatar && (
                        <div className="flex justify-center mb-6">
                          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative" style={{ border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                            <img src={profile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {[{ label: 'Name', value: profile.name }, { label: 'Email', value: selectedUser }, { label: 'Mobile', value: profile.mobile || 'N/A' }, { label: 'City', value: profile.city || 'N/A' }].map((f) => (
                          <div key={f.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(248,248,255,0.35)' }}>{f.label}</p>
                            <p className="font-bold text-sm text-white truncate" title={f.value}>{f.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'rgba(244,196,48,0.08)', border: '1px solid rgba(244,196,48,0.15)' }}>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(244,196,48,0.7)' }}>Wallet Balance</p>
                          <p className="font-heading text-4xl" style={{ color: '#f4c430' }}>₹{balance}</p>
                        </div>
                        <Wallet size={36} style={{ color: 'rgba(244,196,48,0.2)' }} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,248,255,0.35)' }}>Bookings ({bookings.length})</p>
                        {bookings.length === 0 ? (
                          <div className="text-center py-8 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,248,255,0.3)' }}>No bookings yet</div>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                            {bookings.map((b: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div>
                                  <p className="font-bold text-sm text-white">{b.title || b.event}</p>
                                  <p className="text-xs" style={{ color: 'rgba(248,248,255,0.4)' }}>{b.date}</p>
                                </div>
                                <p className="font-bold text-sm" style={{ color: '#e63946' }}>₹{b.total}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AlertToast
        show={alertConfig.show}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </div>
  );
}
