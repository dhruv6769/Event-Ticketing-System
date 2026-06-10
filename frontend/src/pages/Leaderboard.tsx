import { useState, useEffect } from 'react';
import { Crown, Star, User, Sparkles, Trophy, Award, Gift, X, Flame, Music, Film, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// Default stunning rewards
const DEFAULT_REWARDS = [
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

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Force update rewards to ensure 10 accurate rewards
    const storedRewards = DEFAULT_REWARDS;
    localStorage.setItem('leaderboardRewards', JSON.stringify(storedRewards));
    setRewards(storedRewards);

    // Calculate Leaderboard
    const allUsersData = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    const allRegistered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    let rankings: any[] = [];
    
    const possibleTags = [
      { text: 'Concert Junkie', icon: Music, color: '#ec4899' },
      { text: 'Movie Buff', icon: Film, color: '#eab308' },
      { text: 'Sports Fanatic', icon: Swords, color: '#3b82f6' },
      { text: 'Super Fan', icon: Flame, color: '#ef4444' }
    ];

    allRegistered.forEach((u: any) => {
      const data = allUsersData[u.email] || {};
      const userBookings = JSON.parse(data.bookings || '[]');
      const points = userBookings.length * 50;
      const tag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
      
      rankings.push({ 
        name: u.profile?.name || u.email.split('@')[0], 
        email: u.email, 
        avatar: u.profile?.avatar || '', 
        points,
        tag
      });
    });
    
    // Add some dummy users if leaderboard is empty for demonstration
    if (rankings.length === 0) {
      rankings = [
        { name: 'Dhruv Rajput', points: 2500, avatar: '', tag: possibleTags[0] },
        { name: 'Jaimin', points: 1200, avatar: '', tag: possibleTags[3] },
        { name: 'Sarah W.', points: 850, avatar: '', tag: possibleTags[2] },
        { name: 'Alex M.', points: 600, avatar: '', tag: possibleTags[1] },
        { name: 'Elena G.', points: 450, avatar: '', tag: possibleTags[0] },
        { name: 'Marcus', points: 300, avatar: '', tag: possibleTags[2] },
      ];
    }

    rankings.sort((a, b) => b.points - a.points);
    setLeaderboard(rankings); 
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getTheme = (rank: number) => {
    if (rank === 1) return { color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)', name: 'Gold Rank' };
    if (rank === 2) return { color: '#E2E8F0', bg: 'rgba(226, 232, 240, 0.15)', name: 'Silver Rank' };
    if (rank === 3) return { color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.15)', name: 'Bronze Rank' };
    return { color: '#00D4FF', bg: 'rgba(0, 212, 255, 0.1)', name: 'Elite Rank' };
  };

  const getTier = (points: number) => {
    if (points >= 2000) return { name: 'Diamond', color: '#00D4FF', icon: Sparkles };
    if (points >= 1000) return { name: 'Gold', color: '#FFD700', icon: Crown };
    if (points >= 500) return { name: 'Silver', color: '#E2E8F0', icon: Award };
    return { name: 'Bronze', color: '#CD7F32', icon: Trophy };
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-[#FFD700] selection:text-black overflow-hidden relative pb-32">
      
      {/* Immersive Background FX */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#FFD700] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-[-10%] w-[600px] h-[600px] bg-[#00D4FF] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#CD7F32] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32 relative z-10">
        
        {/* Epic Hero Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center mb-48 relative">
          <div className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full mb-8 relative group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 via-[#FFD700]/5 to-[#FFD700]/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500" />
            <div className="absolute inset-0 border border-[#FFD700]/30 rounded-full" />
            <Crown size={20} className="text-[#FFD700]" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#FFD700]">The Elite Circle</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black mb-6 tracking-tighter uppercase leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Hall of</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDF5A9] to-[#FFD700] pb-4" style={{ filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.3))' }}>Fame</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            The ultimate battleground. Book tickets, dominate the leaderboard, and claim mind-blowing real-world prizes reserved only for the absolute best.
          </p>
        </motion.div>

        {/* ── 3D ANIMATED TOP-3 PODIUM ── */}
        {top3.length > 0 && (
          <div className="flex flex-col lg:flex-row items-end justify-center gap-4 lg:gap-8 mb-32 relative h-auto lg:h-[600px]">
            
            {/* Display Order: Rank 2 (Left), Rank 1 (Center), Rank 3 (Right) */}
            {[
              { ...top3[1], rank: 2, height: 'h-[400px]', delay: 0.4 },
              { ...top3[0], rank: 1, height: 'h-[500px]', delay: 0.2 },
              { ...top3[2], rank: 3, height: 'h-[350px]', delay: 0.6 }
            ].map((user) => {
              if (!user.name) return null;
              const theme = getTheme(user.rank);
              const tier = getTier(user.points);
              const reward = rewards.find(r => r.position === user.rank);
              const TagIcon = user.tag.icon;
              
              return (
                <motion.div 
                  key={user.rank}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: user.delay, type: 'spring', stiffness: 80, damping: 20 }}
                  className={`relative group cursor-pointer w-full lg:w-1/3 flex flex-col justify-end ${user.rank === 1 ? 'z-20' : 'z-10'}`}
                  onClick={() => setSelectedUser(user)}
                >
                  {/* Floating Avatar & Stats Container */}
                  <motion.div 
                    animate={{ y: [0, -15, 0] }} 
                    transition={{ duration: 4 + user.rank, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center mb-6 relative"
                  >
                    {/* Glowing Rings Behind Avatar */}
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" style={{ background: theme.color, width: '120px', height: '120px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    
                    {/* Avatar */}
                    <div className="relative mb-4">
                      {user.rank === 1 && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                          <Crown size={56} style={{ color: theme.color, filter: `drop-shadow(0 0 20px ${theme.color})` }} />
                        </div>
                      )}
                      
                      <div className={`w-28 h-28 ${user.rank === 1 ? 'md:w-40 md:h-40' : 'md:w-32 md:h-32'} rounded-full p-2 relative z-10 transition-transform duration-500 group-hover:scale-110`} style={{ background: `linear-gradient(135deg, ${theme.color}, transparent)` }}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center border-4 border-[#0C0C12]">
                          {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <User size={48} style={{ color: theme.color }} />
                          )}
                        </div>
                      </div>
                      
                      {/* Tier Badge Pin */}
                      <div className="absolute -bottom-2 -right-2 bg-[#0C0C12] border-2 rounded-full w-10 h-10 flex items-center justify-center z-20" style={{ borderColor: tier.color, color: tier.color, boxShadow: `0 0 15px ${tier.color}40` }}>
                        <tier.icon size={18} />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-1 text-center group-hover:text-[var(--color-gold)] transition-colors">{user.name}</h2>
                    <p className="text-sm font-bold tracking-[0.2em] mb-3" style={{ color: theme.color }}>{user.points.toLocaleString()} PTS</p>
                    
                    {/* Dynamic Tag */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold" style={{ color: user.tag.color }}>
                      <TagIcon size={12} /> {user.tag.text}
                    </div>
                  </motion.div>

                  {/* Physical Podium Base */}
                  <div className={`${user.height} w-full rounded-t-[40px] relative overflow-hidden transition-all duration-500 group-hover:brightness-125 border-t border-x`} style={{ background: `linear-gradient(to bottom, ${theme.bg}, #050507)`, borderColor: `${theme.color}30` }}>
                    {/* Glass Reflection */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    
                    {/* Large Rank Number Inside Podium */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-8xl font-black opacity-10 pointer-events-none" style={{ color: theme.color }}>
                      #{user.rank}
                    </div>

                    {/* Reward Showcased Inside Podium */}
                    {reward && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] text-center">
                         <div className="w-full h-32 mb-4 rounded-2xl overflow-hidden relative border border-white/10 mx-auto">
                            <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-2 left-0 w-full flex justify-center">
                              <Gift size={16} style={{ color: theme.color }} />
                            </div>
                         </div>
                         <h3 className="font-bold text-white text-sm line-clamp-1">{reward.title}</h3>
                      </div>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── THE COMPETITORS ── */}
        {rest.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold mb-8 text-center uppercase tracking-widest text-white/50 flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-white/20" /> The Contenders <span className="w-12 h-px bg-white/20" />
            </h3>
            
            <div className="flex flex-col gap-4">
              {rest.map((user, index) => {
                const rank = index + 4;
                const reward = rewards.find(r => r.position === rank);
                const theme = getTheme(rank);
                const tier = getTier(user.points);
                const TagIcon = user.tag.icon;

                return (
                  <motion.div 
                    key={rank} 
                    variants={fadeUp}
                    onClick={() => setSelectedUser({...user, rank})}
                    className="group relative rounded-[24px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-4 md:p-6 transition-all duration-300 hover:bg-white/5 cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    {/* Hover Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform origin-center" style={{ background: theme.color }} />

                    <div className="flex items-center gap-6 w-full md:w-auto mb-6 md:mb-0">
                      <div className="w-12 h-12 flex items-center justify-center font-heading text-2xl font-black text-white/20 group-hover:text-white transition-colors">
                        {rank}
                      </div>
                      
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 flex items-center justify-center relative border border-white/10 group-hover:border-[#00D4FF] transition-colors">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={24} className="text-white/20" />}
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white mb-1 group-hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                          {user.name}
                        </h4>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: tier.color }}>{tier.name} • {user.points.toLocaleString()} PTS</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dynamic Tag */}
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold mx-4" style={{ color: user.tag.color }}>
                      <TagIcon size={12} /> {user.tag.text}
                    </div>

                    {/* Reward Snippet */}
                    {reward && (
                      <div className="w-full md:w-auto flex items-center gap-4 bg-black/40 rounded-xl p-3 border border-white/5 group-hover:border-[#00D4FF]/30 transition-colors">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] uppercase tracking-widest text-[#00D4FF] mb-1">Locked Reward</p>
                          <p className="font-bold text-sm text-white max-w-[150px] truncate">{reward.title}</p>
                        </div>
                        {reward.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img src={reward.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none" />
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── EXPANDABLE SUPER-FAN PROFILE DRAWER ── */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#0C0C12] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside drawer
            >
              {/* Drawer Header */}
              <div className="h-48 relative w-full bg-gradient-to-br from-[#1a1a24] to-[#050507] overflow-hidden flex-shrink-0">
                <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/40 hover:bg-[var(--color-brand)] rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
                  <X size={20} />
                </button>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                
                {/* Large Avatar */}
                <div className="absolute -bottom-12 left-8 w-28 h-28 rounded-full border-4 border-[#0C0C12] overflow-hidden bg-black z-10 shadow-2xl">
                   {selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full object-cover" /> : <User size={48} className="w-full h-full p-4 text-gray-500" />}
                </div>
              </div>

              {/* Drawer Content */}
              <div className="pt-16 px-8 pb-8 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-3xl font-heading font-black text-white">{selectedUser.name}</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Rank</span>
                    <span className="text-2xl font-black text-[#FFD700]">#{selectedUser.rank || leaderboard.findIndex(u => u.name === selectedUser.name) + 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                   {/* Dynamic Tag */}
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold" style={{ color: selectedUser.tag.color }}>
                      <selectedUser.tag.icon size={12} /> {selectedUser.tag.text}
                   </div>
                   {/* Tier Badge */}
                   {(() => {
                     const tier = getTier(selectedUser.points);
                     const TierIcon = tier.icon;
                     return (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] uppercase tracking-wider font-bold" style={{ borderColor: `${tier.color}50`, color: tier.color, background: `${tier.color}10` }}>
                        <TierIcon size={12} /> {tier.name} Tier
                      </div>
                     )
                   })()}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <Flame className="text-[var(--color-brand)] mb-2" size={24} />
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total XP</p>
                    <p className="text-2xl font-black text-white">{selectedUser.points.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <TicketIcon className="text-[#00D4FF] mb-2" size={24} />
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Tickets Booked</p>
                    <p className="text-2xl font-black text-white">{selectedUser.points / 50}</p>
                  </div>
                </div>

                {/* Trophy Cabinet */}
                <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2"><Trophy className="text-[#FFD700]" size={20}/> Trophy Cabinet</h3>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex gap-4 overflow-x-auto snap-x">
                  {/* Badges based on points */}
                  <div className="min-w-[80px] flex flex-col items-center justify-center opacity-100 snap-center">
                    <div className="w-16 h-16 rounded-full bg-[#CD7F32]/20 border-2 border-[#CD7F32] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(205,127,50,0.3)]">
                      <Star size={24} className="text-[#CD7F32]" />
                    </div>
                    <span className="text-[10px] font-bold text-center text-gray-400">First Booking</span>
                  </div>
                  
                  <div className={`min-w-[80px] flex flex-col items-center justify-center snap-center ${selectedUser.points >= 500 ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                    <div className="w-16 h-16 rounded-full bg-[#E2E8F0]/20 border-2 border-[#E2E8F0] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(226,232,240,0.3)]">
                      <Award size={24} className="text-[#E2E8F0]" />
                    </div>
                    <span className="text-[10px] font-bold text-center text-gray-400">Silver Elite</span>
                  </div>

                  <div className={`min-w-[80px] flex flex-col items-center justify-center snap-center ${selectedUser.points >= 1000 ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                    <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 border-2 border-[#FFD700] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                      <Crown size={24} className="text-[#FFD700]" />
                    </div>
                    <span className="text-[10px] font-bold text-center text-gray-400">Gold Master</span>
                  </div>

                  <div className={`min-w-[80px] flex flex-col items-center justify-center snap-center ${selectedUser.points >= 2000 ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                    <div className="w-16 h-16 rounded-full bg-[#00D4FF]/20 border-2 border-[#00D4FF] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                      <Sparkles size={24} className="text-[#00D4FF]" />
                    </div>
                    <span className="text-[10px] font-bold text-center text-gray-400">Diamond VIP</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Custom simple icon component for Ticket since it's not imported at the top to avoid clutter
function TicketIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
      <path d="M13 5v2"></path>
      <path d="M13 17v2"></path>
      <path d="M13 11v2"></path>
    </svg>
  );
}
