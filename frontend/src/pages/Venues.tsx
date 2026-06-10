import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { X, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { VENUE_DATA, MOCK_EVENTS } from '../data/mockData';

export default function Venues() {
  const [selectedVenue, setSelectedVenue] = useState<any>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-6 pt-32 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-heading text-[var(--color-gold)] mb-6 drop-shadow-md tracking-wide">Iconic Venues</h1>
          <p className="text-gray-400 max-w-2xl mb-12 text-xl font-medium">Browse our curated list of India's premier stadiums, indoor arenas, and theatres.</p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {VENUE_DATA.map((venue) => {
            const venueEventsCount = MOCK_EVENTS.filter(e => e.venue === venue.name).length;
            
            return (
              <motion.div 
                key={venue.id}
                layoutId={`venue-${venue.id}`}
                variants={itemVariants} 
                className="glass rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5 hover:border-[var(--color-brand)]/50 cursor-pointer"
                onClick={() => setSelectedVenue(venue)}
              >
                <motion.div layoutId={`image-${venue.id}`} className="relative aspect-video overflow-hidden">
                  <img 
                    src={venue.image} 
                    alt={venue.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </motion.div>
                <div className="p-8 flex flex-col justify-center flex-1 relative bg-black/40 backdrop-blur-sm">
                  <motion.h3 layoutId={`title-${venue.id}`} className="text-3xl font-heading mb-2 group-hover:text-[var(--color-gold)] transition-colors">{venue.name}</motion.h3>
                  <motion.p layoutId={`location-${venue.id}`} className="text-[var(--color-brand)] font-bold mb-6 flex items-center gap-2">
                    <MapPin size={16} />
                    {venue.location}
                  </motion.p>
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-8 border-t border-white/10 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><Users size={12}/> Capacity</span>
                      <strong className="text-xl text-white mt-1">{venue.capacity}</strong>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 justify-end"><Calendar size={12}/> Events</span>
                      <strong className="text-xl text-[var(--color-brand)] mt-1">{venueEventsCount} Upcoming</strong>
                    </div>
                  </div>
                  <motion.button 
                    layoutId={`button-${venue.id}`}
                    className="w-full mt-auto bg-white/10 group-hover:bg-gradient-to-r group-hover:from-[var(--color-brand)] group-hover:to-red-700 text-white font-bold transition-all py-3 rounded-xl border border-white/10 group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                  >
                    View Venue Details
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedVenue && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl"
          >
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setSelectedVenue(null)}
            />
            
            <motion.div 
              layoutId={`venue-${selectedVenue.id}`}
              className="w-full max-w-6xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col z-10"
            >
              <button 
                onClick={() => setSelectedVenue(null)}
                className="absolute top-6 right-6 z-50 p-3 bg-black/50 hover:bg-red-600 backdrop-blur-md rounded-full text-white transition-all duration-300 border border-white/20 hover:border-transparent group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="overflow-y-auto custom-scrollbar flex-1">
                <motion.div layoutId={`image-${selectedVenue.id}`} className="relative h-[40vh] md:h-[50vh] shrink-0">
                  <img 
                    src={selectedVenue.image} 
                    alt={selectedVenue.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                    <motion.h3 layoutId={`title-${selectedVenue.id}`} className="text-5xl md:text-7xl font-heading text-white mb-4 drop-shadow-lg">{selectedVenue.name}</motion.h3>
                    <motion.p layoutId={`location-${selectedVenue.id}`} className="text-2xl text-[var(--color-brand)] font-bold flex items-center gap-3 drop-shadow-md">
                      <MapPin size={24} />
                      {selectedVenue.location}
                    </motion.p>
                  </div>
                </motion.div>

                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-8">
                      <div>
                        <h4 className="text-[var(--color-gold)] font-heading text-2xl mb-4">About this Venue</h4>
                        <p className="text-gray-300 text-lg leading-relaxed">{selectedVenue.description}</p>
                      </div>
                      
                      <div className="glass p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-[var(--color-brand)]/20 rounded-xl text-[var(--color-brand)]">
                            <Users size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Capacity</p>
                            <p className="text-2xl font-bold text-white">{selectedVenue.capacity}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <h4 className="text-[var(--color-gold)] font-heading text-3xl mb-8 flex items-center gap-3">
                        <Calendar size={28} />
                        Upcoming Events Here
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {MOCK_EVENTS.filter(e => e.venue === selectedVenue.name).map((event, index) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            key={event.id}
                            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[var(--color-brand)]/50 transition-all duration-300 flex hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                          >
                            <div className="w-1/3 shrink-0 relative overflow-hidden">
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute top-2 left-2 bg-[var(--color-brand)] text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider">
                                {event.category}
                              </div>
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-1">
                              <div>
                                <h5 className="font-bold text-lg text-white group-hover:text-[var(--color-brand)] transition-colors line-clamp-1">{event.title}</h5>
                                <p className="text-sm text-gray-400 mt-1">{event.date}</p>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <span className="font-bold text-white">{event.price}</span>
                                <Link 
                                  to={`/event/${event.id}`}
                                  className="text-[var(--color-brand)] text-sm font-bold flex items-center gap-1 group/btn hover:text-red-400 transition-colors"
                                >
                                  Book <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {MOCK_EVENTS.filter(e => e.venue === selectedVenue.name).length === 0 && (
                          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                            <p className="text-gray-500 text-lg">No upcoming events currently scheduled for this venue.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
