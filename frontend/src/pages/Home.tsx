import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { motion } from 'framer-motion';
import { Map as MapIcon, Grid, MapPin } from 'lucide-react';
import type { Variants } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { MOCK_EVENTS } from '../data/mockData';

const FEATURED_EVENTS = [
  // Concerts
  {
    id: 1, category: 'Concert',
    title: "Coldplay: Live in Ahmedabad",
    description: "Experience the magic of the Music of the Spheres world tour at the largest stadium on earth.",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    link: "/event/1"
  },
  {
    id: 4, category: 'Concert',
    title: "Dua Lipa: Radical Optimism",
    description: "Pop sensation Dua Lipa brings her Radical Optimism tour to India.",
    image: "https://images.unsplash.com/photo-1540039155732-d6928b1221f4?auto=format&fit=crop&w=2000&q=80",
    link: "/event/4"
  },
  {
    id: 5, category: 'Concert',
    title: "Ed Sheeran: Mathematics Tour",
    description: "Ed Sheeran is back with his biggest stage setup ever.",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=2000&q=80",
    link: "/event/5"
  },
  
  // Sports
  {
    id: 7, category: 'Sports',
    title: "IPL Final: CSK vs MI",
    description: "Witness the ultimate clash of the titans as Chennai Super Kings take on Mumbai Indians for the championship.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    link: "/event/7"
  },
  {
    id: 6, category: 'Sports',
    title: "India vs Australia Test Match",
    description: "The historic rivalry continues in the ultimate test of endurance.",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=2000&q=80",
    link: "/event/6"
  },
  {
    id: 10, category: 'Sports',
    title: "Pro Kabaddi League Finals",
    description: "High octane action reaches its climax.",
    image: "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?auto=format&fit=crop&w=2000&q=80",
    link: "/event/10"
  },

  // Movies
  {
    id: 11, category: 'Movie',
    title: "Kalki 2898 AD",
    description: "Immerse yourself in the dystopian epic that redefines Indian cinema, now showing in stunning IMAX.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    link: "/event/11"
  },
  {
    id: 14, category: 'Movie',
    title: "Dune: Part Two IMAX",
    description: "Return to Arrakis in breathtaking IMAX.",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=2000&q=80",
    link: "/event/14"
  },
  {
    id: 12, category: 'Movie',
    title: "Deadpool & Wolverine",
    description: "The ultimate team-up event of the year.",
    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=2000&q=80",
    link: "/event/12"
  }
];

export default function Home() {
  const { searchQuery, activeCategory } = useSearch();
  const [allEvents, setAllEvents] = useState(MOCK_EVENTS);
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid'|'map'>(location.state?.viewMode || 'grid');
  const [selectedMapVenue, setSelectedMapVenue] = useState<string | null>(location.state?.selectedMapVenue || null);
  
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const currentSlides = activeCategory === 'All' 
    ? FEATURED_EVENTS 
    : FEATURED_EVENTS.filter(e => e.category === activeCategory);

  useEffect(() => {
    sessionStorage.setItem('activeCategory', activeCategory);
    setCurrentSlide(0);
  }, [activeCategory]);

  useEffect(() => {
    const dynamicEvents = JSON.parse(localStorage.getItem('dynamicEvents') || '[]');
    setAllEvents([...dynamicEvents, ...MOCK_EVENTS]);

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  const filteredEvents = allEvents.filter(event => {
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVenue = selectedMapVenue ? event.venue === selectedMapVenue : true;
    return matchesCategory && matchesSearch && matchesVenue;
  });

  const MAP_PINS = [
    { venue: "Narendra Modi Stadium", x: "30%", y: "45%" },
    { venue: "Wankhede Stadium", x: "65%", y: "70%" },
    { venue: "Eden Gardens", x: "85%", y: "30%" },
    { venue: "M. Chinnaswamy Stadium", x: "40%", y: "85%" },
    { venue: "Jio World Convention Centre", x: "60%", y: "65%" },
    { venue: "Indira Gandhi Arena", x: "35%", y: "30%" },
    { venue: "PVR Director's Cut", x: "50%", y: "40%" },
    { venue: "PVR Icon", x: "55%", y: "50%" },
  ];

  const containerVariants: Variants = {
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

      {/* Hero Section Slideshow */}
      <section className="relative h-[70vh] pt-24 flex items-center justify-center overflow-hidden">
        {currentSlides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-[var(--color-dark)]/50 to-transparent z-10"></div>
            
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={index === currentSlide ? { scale: 1 } : { scale: 1.1 }}
              transition={{ duration: 6, ease: "easeOut" }}
              src={slide.image} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
              {index === currentSlide && (
                <>
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-brand)]/20 text-[var(--color-brand)] border border-[var(--color-brand)]/50 text-sm font-bold mb-6 tracking-widest uppercase backdrop-blur-md"
                  >
                    Featured {slide.category}
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-5xl md:text-7xl font-heading text-white font-bold mb-6 drop-shadow-lg leading-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium"
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    <Link to={slide.link} className="bg-[var(--color-brand)] hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 inline-block shadow-[0_0_20px_rgba(230,57,70,0.5)]">
                      Book Tickets Now
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Slideshow Navigation Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-4">
          {currentSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[var(--color-brand)] w-12' : 'bg-white/30 hover:bg-white/60 w-2'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 border-b border-white/10 pb-6 gap-4">
          <h2 className="text-5xl font-heading text-[var(--color-gold)] tracking-wide drop-shadow-md">
            {activeCategory === 'All' ? 'Trending Now' : `${activeCategory === 'Movie' ? 'Movies' : activeCategory === 'Concert' ? 'Concerts' : 'Sports'}`}
          </h2>

          <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl backdrop-blur-md">
            <button 
              onClick={() => { setViewMode('grid'); setSelectedMapVenue(null); }} 
              className={`px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'grid' ? 'bg-[var(--color-brand)] text-white shadow-[0_0_15px_rgba(230,57,70,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Grid size={16} /> Grid
            </button>
            <button 
              onClick={() => setViewMode('map')} 
              className={`px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'map' ? 'bg-[var(--color-brand)] text-white shadow-[0_0_15px_rgba(230,57,70,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <MapIcon size={16} /> Map
            </button>
          </div>
        </div>

        {viewMode === 'map' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-[60vh] rounded-3xl overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-12 bg-[#0a0a0f]">
            {/* Fake stylized 3D Map background using CSS gradients and glowing grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#000_100%)]"></div>
            
            <h3 className="absolute top-8 left-8 text-2xl font-heading text-white bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-10">
              Interactive <span className="text-[var(--color-brand)]">Venue Map</span>
            </h3>

            {MAP_PINS.map((pin, i) => {
              const isSelected = selectedMapVenue === pin.venue;
              return (
                <div key={i} className="absolute z-20 group" style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)' }}>
                  <button 
                    onClick={() => setSelectedMapVenue(isSelected ? null : pin.venue)}
                    className="relative flex flex-col items-center"
                  >
                    <motion.div 
                      animate={{ y: [0, -10, 0] }} 
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border-2 transition-all duration-300 ${isSelected ? 'bg-[var(--color-brand)] border-white scale-125 shadow-[0_0_30px_rgba(230,57,70,0.8)]' : 'bg-black/60 border-[var(--color-brand)] group-hover:scale-110 group-hover:bg-[var(--color-brand)]/50'}`}
                    >
                      <MapPin size={20} className="text-white" />
                    </motion.div>
                    
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 w-full h-full bg-[var(--color-brand)] rounded-full animate-ping opacity-20 pointer-events-none"></div>

                    <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${isSelected ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/60 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-1'}`}>
                      {pin.venue}
                    </div>
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredEvents.length > 0 ? filteredEvents.map(event => (
            <motion.div variants={itemVariants} key={event.id} className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5 hover:border-white/20">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {event.badge && (
                  <span className={`absolute top-4 right-4 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md border ${
                    event.badge === 'Selling Fast' ? 'bg-[var(--color-brand)]/90 text-white border-[var(--color-brand)]' : 
                    event.badge === 'Almost Full' ? 'bg-[var(--color-gold)]/90 text-black border-[var(--color-gold)]' : 
                    'bg-green-500/90 text-white border-green-500'
                  }`}>
                    {event.badge}
                  </span>
                )}
              </div>
              <div className="p-8 relative">
                <p className="text-[var(--color-brand)] font-bold text-sm mb-3 uppercase tracking-widest">{event.date}</p>
                <h3 className="text-3xl font-heading mb-3 group-hover:text-[var(--color-gold)] transition-colors">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex items-center font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] mr-3 animate-pulse"></span>
                  {event.venue}
                </p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Starting from</p>
                    <p className="text-2xl font-bold">{event.price}</p>
                  </div>
                  <Link to={`/event/${event.id}`} className="bg-white/10 hover:bg-[var(--color-brand)] text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 hover:border-transparent group-hover:shadow-[0_0_15px_rgba(230,57,70,0.5)]">
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-24 text-gray-500 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-2xl font-heading">No events found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
