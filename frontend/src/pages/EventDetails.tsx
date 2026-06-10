import { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, Star, Ticket, X, Lock, PlayCircle, BarChart3, Swords, Music } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { MOCK_EVENTS } from '../data/mockData';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Sports Voting State
  const [homeVotes, setHomeVotes] = useState(0);
  const [awayVotes, setAwayVotes] = useState(0);

  useEffect(() => {
    if (id) {
      const savedVotes = JSON.parse(localStorage.getItem(`votes_${id}`) || '{"home": 0, "away": 0}');
      setHomeVotes(savedVotes.home);
      setAwayVotes(savedVotes.away);
    }
  }, [id]);

  const handleVote = (team: 'home' | 'away') => {
    const newHome = team === 'home' ? homeVotes + 1 : homeVotes;
    const newAway = team === 'away' ? awayVotes + 1 : awayVotes;
    setHomeVotes(newHome);
    setAwayVotes(newAway);
    localStorage.setItem(`votes_${id}`, JSON.stringify({ home: newHome, away: newAway }));
  };

  const totalVotes = homeVotes + awayVotes;
  const homePct = totalVotes === 0 ? 50 : Math.round((homeVotes / totalVotes) * 100);
  const awayPct = 100 - homePct;

  const dynamicEvents = JSON.parse(localStorage.getItem('dynamicEvents') || '[]');
  const allEvents = [...dynamicEvents, ...MOCK_EVENTS];
  
  const event = allEvents.find(e => e.id?.toString() === id?.toString()) || MOCK_EVENTS[0];

  // Dynamic Date & Time Logic for Movies
  const isMovie = event.category === 'Movie';
  
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = useMemo(() => generateDates(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(availableDates[0]);

  // Showtimes: 9 AM, 2 PM, 6 PM, 10 PM
  const showtimes = useMemo(() => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const currentHour = new Date().getHours();
    
    const times = [
      { label: '9:00 AM', hour: 9 },
      { label: '2:00 PM', hour: 14 },
      { label: '6:00 PM', hour: 18 },
      { label: '10:00 PM', hour: 22 }
    ];

    if (isToday) {
      return times.filter(t => t.hour > currentHour);
    }
    return times;
  }, [selectedDate]);

  const [selectedTime, setSelectedTime] = useState<string>(showtimes.length > 0 ? showtimes[0].label : '');

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-[var(--color-dark)]/60 to-transparent z-10"></div>
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="container mx-auto px-6 relative z-20 -mt-40">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Info */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-heading mb-4 leading-tight uppercase drop-shadow-lg">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <p className="text-2xl md:text-3xl text-[var(--color-gold)] font-heading tracking-widest">{event.category === 'Movie' ? 'Now Showing' : event.category === 'Sports' ? 'Live Sports' : 'Live in Concert'}</p>
                {event.category === 'Movie' && event.imdbRating && (
                  <div className="flex items-center gap-2 bg-[#f4c430]/10 border border-[#f4c430]/30 px-4 py-2 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(244,196,48,0.2)]">
                    <Star className="text-[#f4c430] fill-[#f4c430]" size={20} />
                    <span className="text-xl font-bold text-white tracking-wide">{event.imdbRating}</span>
                    <span className="text-sm font-medium text-gray-400">/ 10</span>
                    <span className="text-xs font-bold bg-[#f4c430]/20 text-[#f4c430] px-2 py-0.5 rounded-full ml-2">{event.imdbVotes}</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col gap-4 mb-12"
            >
              <div className="flex items-center gap-4 text-gray-300 glass w-fit px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <Calendar className="text-[var(--color-brand)]" size={28} />
                <span className="text-xl font-bold tracking-wide">{event.date} • {event.time || "7:00 PM"}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300 glass w-fit px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <MapPin className="text-[var(--color-brand)]" size={28} />
                <span className="text-xl font-bold tracking-wide">{event.venue} <button onClick={() => navigate('/events', { state: { viewMode: 'map', selectedMapVenue: event.venue } })} className="text-sm text-[var(--color-brand)] ml-3 underline hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">View Map</button></span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h2 className="text-3xl font-heading mb-6 text-[var(--color-gold)] flex items-center gap-3">
                <Star className="text-[var(--color-brand)]" size={24} /> About the Event
              </h2>
              <p className="text-gray-300 text-xl leading-relaxed mb-12 font-medium">
                {event.description || "Join us for an unforgettable experience! Secure your tickets now before they sell out."}
              </p>
            </motion.div>

            {/* ── Category Specific Upgrades ── */}
            {event.category === 'Sports' && event.teams && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} className="mb-12">
                <h2 className="text-3xl font-heading mb-6 text-white flex items-center gap-3 uppercase tracking-widest">
                  <BarChart3 className="text-[var(--color-brand)]" size={28} /> Match Insights
                </h2>
                <div className="glass-neo p-8 rounded-3xl border border-white/10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center font-bold text-2xl text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">{event.teams.home.name}</div>
                      <span className="text-gray-400 font-bold tracking-wider">HOME</span>
                      <div className="flex gap-1 mt-1">
                        {event.teams.home.form.map((res: string, i: number) => (
                          <span key={i} className={`px-2 rounded font-bold text-xs ${res === 'W' ? 'bg-green-500/20 text-green-400' : res === 'L' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>{res}</span>
                        ))}
                      </div>
                      <button onClick={() => handleVote('home')} className={`mt-4 px-6 py-2 rounded-full font-bold text-sm tracking-widest transition-all bg-[var(--color-brand)]/20 text-white border border-[var(--color-brand)]/50 hover:bg-[var(--color-brand)] hover:shadow-[0_0_15px_rgba(230,57,70,0.5)]`}>VOTE</button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <Swords className="text-gray-500 mb-2" size={32} />
                      <span className="text-[var(--color-gold)] font-bold text-xl font-heading tracking-widest">VS</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-[var(--color-brand)] flex items-center justify-center font-bold text-2xl text-white shadow-[0_0_30px_rgba(230,57,70,0.3)]">{event.teams.away.name}</div>
                      <span className="text-gray-400 font-bold tracking-wider">AWAY</span>
                      <div className="flex gap-1 mt-1">
                        {event.teams.away.form.map((res: string, i: number) => (
                          <span key={i} className={`px-2 rounded font-bold text-xs ${res === 'W' ? 'bg-green-500/20 text-green-400' : res === 'L' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>{res}</span>
                        ))}
                      </div>
                      <button onClick={() => handleVote('away')} className={`mt-4 px-6 py-2 rounded-full font-bold text-sm tracking-widest transition-all bg-[var(--color-brand)]/20 text-white border border-[var(--color-brand)]/50 hover:bg-[var(--color-brand)] hover:shadow-[0_0_15px_rgba(230,57,70,0.5)]`}>VOTE</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-400 tracking-widest mb-1">
                      <span>Live Crowd Support</span>
                      <span className="text-[var(--color-gold)]">{homePct}% - {awayPct}%</span>
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex relative">
                      <motion.div initial={{ width: "45%" }} animate={{ width: `${homePct}%` }} transition={{ duration: 1, type: 'spring', bounce: 0.4 }} className="h-full bg-blue-500"></motion.div>
                      <motion.div initial={{ width: "55%" }} animate={{ width: `${awayPct}%` }} transition={{ duration: 1, type: 'spring', bounce: 0.4 }} className="h-full bg-[var(--color-brand)]"></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {event.category === 'Concert' && event.setlist && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} className="mb-12">
                <h2 className="text-3xl font-heading mb-6 text-white flex items-center gap-3 uppercase tracking-widest">
                  <Music className="text-[var(--color-brand)]" size={28} /> Setlist & Music
                </h2>
                <div className="glass-neo p-6 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand)] blur-[100px] opacity-20"></div>
                  
                  {event.setlist.map((track: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <PlayCircle className="text-gray-400 group-hover:text-[var(--color-brand)] transition-colors" size={28} />
                        <div>
                          <p className="text-white font-bold tracking-wide">{track.title}</p>
                          <p className="text-gray-500 text-sm">{event.title.split(':')[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Fake Equalizer Animation */}
                        <div className="hidden group-hover:flex items-end gap-1 h-4">
                          <motion.div animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-[var(--color-brand)] rounded-full"></motion.div>
                          <motion.div animate={{ height: ["8px", "12px", "8px"] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-[var(--color-brand)] rounded-full"></motion.div>
                          <motion.div animate={{ height: ["16px", "4px", "16px"] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-[var(--color-brand)] rounded-full"></motion.div>
                        </div>
                        <span className="text-gray-400 font-medium">{track.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full md:w-1/3 flex flex-col gap-6"
          >
            <div className="glass p-8 rounded-3xl border-2 border-[var(--color-brand)] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-brand)] rounded-full mix-blend-screen filter blur-[50px] opacity-20"></div>
              <h3 className="text-2xl font-heading mb-6 border-b border-white/10 pb-4">Availability Status</h3>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-300">VIP Lounge</span>
                  <span className="text-[var(--color-brand)] font-bold uppercase tracking-widest">Sold Out</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden shadow-inner">
                  <div className="w-full h-full bg-[var(--color-brand)]"></div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-300">Lower Stands</span>
                  <span className="text-[var(--color-gold)] font-bold uppercase tracking-widest">Fast Filling</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden shadow-inner">
                  <div className="w-[85%] h-full bg-[var(--color-gold)] shadow-[0_0_10px_var(--color-gold)]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-300">Upper Stands</span>
                  <span className="text-green-500 font-bold uppercase tracking-widest">Available</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden shadow-inner">
                  <div className="w-[40%] h-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                </div>
              </div>
            </div>

            {isMovie && (
              <div className="glass p-8 rounded-3xl border-2 border-white/10 shadow-2xl relative overflow-hidden mt-6">
                <h3 className="text-2xl font-heading mb-6 border-b border-white/10 pb-4">Select Show</h3>
                
                {/* Date Picker */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3 font-bold uppercase tracking-widest">Date</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {availableDates.map((date, idx) => {
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(''); // Reset time when date changes
                          }}
                          className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl transition-all duration-300 border ${isSelected ? 'bg-[var(--color-brand)] border-[var(--color-brand)] shadow-[0_0_15px_rgba(230,57,70,0.4)]' : 'bg-black/30 border-white/10 hover:border-white/30 hover:bg-black/50'}`}
                        >
                          <span className={`text-xs font-bold uppercase ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Picker */}
                <div>
                  <p className="text-sm text-gray-400 mb-3 font-bold uppercase tracking-widest">Time</p>
                  <div className="grid grid-cols-2 gap-3">
                    {showtimes.length > 0 ? showtimes.map((time, idx) => {
                      const isSelected = time.label === selectedTime;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedTime(time.label)}
                          className={`py-3 rounded-xl font-bold transition-all duration-300 border ${isSelected ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-[0_0_15px_rgba(230,57,70,0.4)] scale-105' : 'bg-black/30 text-gray-300 border-white/10 hover:border-white/30 hover:bg-black/50'}`}
                        >
                          {time.label}
                        </button>
                      );
                    }) : (
                      <p className="col-span-2 text-red-400 text-sm font-bold p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                        No shows available for today. Please select tomorrow.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedIn) {
                  setShowAuthModal(true);
                  return;
                }

                if (isMovie && !selectedTime) {
                  alert("Please select a show time!");
                  return;
                }
                const queryParams = new URLSearchParams();
                if (isMovie) {
                  queryParams.append('date', selectedDate.toISOString().split('T')[0]);
                  queryParams.append('time', selectedTime);
                }
                window.location.href = `/book/${event.id}?${queryParams.toString()}`;
              }}
              className={`group relative w-full ${isMovie && !selectedTime ? 'bg-gray-600 cursor-not-allowed' : 'bg-[var(--color-brand)] hover:bg-red-600 shadow-[0_0_20px_rgba(230,57,70,0.4)]'} text-white font-bold py-5 rounded-2xl transition-all block text-center mt-6 overflow-hidden border border-white/20 hover:border-transparent`}
            >
              <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-xl">
                <Ticket /> Book Tickets Now
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 pointer-events-none"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: 'rgba(5,5,7,0.8)' }}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 40, rotateX: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative max-w-md w-full rounded-[32px] p-8 pointer-events-auto overflow-hidden text-center shadow-2xl"
              style={{
                background: 'rgba(15,15,20,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.9), inset 0 0 40px rgba(255,255,255,0.05)',
              }}
            >
              {/* Glowing Orb */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--color-brand)] rounded-full mix-blend-screen filter blur-[80px] opacity-30 pointer-events-none"></div>

              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 mx-auto bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/30 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Lock className="text-[var(--color-brand)]" size={32} />
              </div>

              <h2 className="text-2xl font-heading font-bold text-white mb-2 relative z-10">Authentication Required</h2>
              <p className="text-gray-400 font-medium mb-8 leading-relaxed relative z-10">
                You must be securely signed into your account to purchase tickets and reserve seats.
              </p>

              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-colors border border-transparent shadow-[0_0_20px_rgba(230,57,70,0.3)] shimmer group overflow-hidden relative"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand), #c1121f)' }}
                >
                  <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
                  <span className="relative z-10">Sign In</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal section ends */}
    </PageWrapper>
  );
}
