export const MOCK_EVENTS = [
  // Concerts
  { id: 1, title: "Coldplay: Music of the Spheres", category: "Concert", venue: "Narendra Modi Stadium", date: "Nov 20, 2026", price: "₹6000", image: "/highres/coldplay.jpg", badge: "Selling Fast", setlist: [{ title: "Yellow", duration: "4:26" }, { title: "Viva La Vida", duration: "4:01" }, { title: "A Sky Full of Stars", duration: "4:28" }] },
  { id: 2, title: "Arijit Singh Live", category: "Concert", venue: "Wankhede Stadium", date: "Dec 31, 2026", price: "₹3500", image: "/highres/arijit.jpg", badge: "Almost Full", setlist: [{ title: "Tum Hi Ho", duration: "4:22" }, { title: "Channa Mereya", duration: "4:49" }, { title: "Agar Tum Saath Ho", duration: "5:41" }] },
  { id: 3, title: "Diljit Dosanjh: Dil-Luminati", category: "Concert", venue: "Eden Gardens", date: "Oct 15, 2026", price: "₹4500", image: "/highres/diljit.jpg", badge: "Selling Fast", setlist: [{ title: "Lover", duration: "3:14" }, { title: "Vibe", duration: "2:54" }, { title: "G.O.A.T.", duration: "3:43" }] },
  { id: 4, title: "Dua Lipa: Radical Optimism", category: "Concert", venue: "M. Chinnaswamy Stadium", date: "Jan 10, 2027", price: "₹5500", image: "/highres/dua.jpg", badge: "Available", setlist: [{ title: "Levitating", duration: "3:23" }, { title: "Don't Start Now", duration: "3:03" }, { title: "Houdini", duration: "3:05" }] },
  { id: 5, title: "Ed Sheeran: Mathematics Tour", category: "Concert", venue: "Jio World Convention Centre", date: "Feb 14, 2027", price: "₹7000", image: "/highres/edsheeran.jpg", badge: "Almost Full", setlist: [{ title: "Shape of You", duration: "3:53" }, { title: "Perfect", duration: "4:23" }, { title: "Bad Habits", duration: "3:51" }] },
  
  // Sports
  { id: 6, title: "India vs Australia Test Match", category: "Sports", venue: "Eden Gardens", date: "Jan 05, 2027", price: "₹1200", image: "/highres/ind-aus.png", badge: "Available", teams: { home: { name: 'IND', form: ['W','W','D'] }, away: { name: 'AUS', form: ['W','L','W'] } } },
  { id: 7, title: "IPL Final: CSK vs MI", category: "Sports", venue: "Narendra Modi Stadium", date: "May 28, 2027", price: "₹2500", image: "/highres/csk-mi.jpg", badge: "Selling Fast", teams: { home: { name: 'CSK', form: ['W','W','W'] }, away: { name: 'MI', form: ['L','W','L'] } } },
  { id: 8, title: "RCB vs KKR", category: "Sports", venue: "M. Chinnaswamy Stadium", date: "April 15, 2027", price: "₹1800", image: "/highres/rcb-kkr.jpg", badge: "Selling Fast", teams: { home: { name: 'RCB', form: ['L','L','W'] }, away: { name: 'KKR', form: ['W','W','W'] } } },
  { id: 9, title: "Mumbai Indians vs Delhi Capitals", category: "Sports", venue: "Wankhede Stadium", date: "April 22, 2027", price: "₹1500", image: "/highres/mi-dc.png", badge: "Available", teams: { home: { name: 'MI', form: ['W','L','L'] }, away: { name: 'DC', form: ['L','W','W'] } } },
  { id: 10, title: "Pro Kabaddi League Finals", category: "Sports", venue: "Indira Gandhi Arena", date: "Nov 30, 2026", price: "₹800", image: "/highres/pkl.png", badge: "Available", teams: { home: { name: 'PAT', form: ['W','W','W'] }, away: { name: 'JAI', form: ['W','L','W'] } } },

  // Movies
  { id: 11, title: "Kalki 2898 AD", category: "Movie", venue: "PVR Director's Cut", date: "Daily", price: "₹450", image: "/highres/kalki.png", badge: "Selling Fast", imdbRating: "8.8", imdbVotes: "1.2M" },
  { id: 12, title: "Deadpool & Wolverine", category: "Movie", venue: "PVR Icon", date: "Daily", price: "₹350", image: "/highres/deadpool.jpg", badge: "Available", imdbRating: "8.2", imdbVotes: "450K" },
  { id: 13, title: "Pushpa 2: The Rule", category: "Movie", venue: "PVR Director's Cut", date: "Aug 15, 2026", price: "₹500", image: "/highres/pushpa.jpg", badge: "Almost Full", imdbRating: "9.1", imdbVotes: "2.1M" },
  { id: 14, title: "Dune: Part Two IMAX", category: "Movie", venue: "PVR Icon", date: "Daily", price: "₹600", image: "/highres/dune.jpg", badge: "Available", imdbRating: "8.6", imdbVotes: "890K" },
  { id: 15, title: "Oppenheimer Re-release", category: "Movie", venue: "PVR Director's Cut", date: "Daily", price: "₹400", image: "/highres/oppenheimer.jpg", badge: "Available", imdbRating: "8.9", imdbVotes: "1.5M" }
];

export const VENUE_DATA = [
  {
    id: "narendra-modi",
    name: "Narendra Modi Stadium",
    location: "Ahmedabad, Gujarat",
    capacity: "132,000",
    image: "/venue_narendra.png",
    description: "The largest stadium in the world, featuring state-of-the-art facilities and a massive seating capacity.",
    videoUrl: "https://www.youtube.com/embed/V78y0g9W_yQ?autoplay=1&mute=1&controls=0&loop=1&playlist=V78y0g9W_yQ&playsinline=1"
  },
  {
    id: "wankhede",
    name: "Wankhede Stadium",
    location: "Mumbai, Maharashtra",
    capacity: "33,108",
    image: "/venue_wankhede.png",
    description: "An iconic cricket stadium situated near the Marine Drive, famous for the 2011 Cricket World Cup Final.",
    videoUrl: "https://www.youtube.com/embed/a-n70MMN5iM?autoplay=1&mute=1&controls=0&loop=1&playlist=a-n70MMN5iM&playsinline=1"
  },
  {
    id: "eden-gardens",
    name: "Eden Gardens",
    location: "Kolkata, West Bengal",
    capacity: "66,000",
    image: "/venue_eden.png",
    description: "One of the oldest and most historic cricket stadiums in India, known for its passionate crowds.",
    videoUrl: "https://www.youtube.com/embed/HAZDIMBiplY?autoplay=1&mute=1&controls=0&loop=1&playlist=HAZDIMBiplY&playsinline=1"
  },
  {
    id: "m-chinnaswamy",
    name: "M. Chinnaswamy Stadium",
    location: "Bengaluru, Karnataka",
    capacity: "33,800",
    image: "/venue_chinnaswamy.png",
    description: "Located in the heart of Bengaluru, known for its electric atmosphere during IPL matches and concerts.",
    videoUrl: "https://www.youtube.com/embed/j8OZeyvTZyc?autoplay=1&mute=1&controls=0&loop=1&playlist=j8OZeyvTZyc&playsinline=1"
  },
  {
    id: "pvr-directors-cut",
    name: "PVR Director's Cut",
    location: "Vasant Kunj, Delhi",
    capacity: "350 (Luxury)",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "A premium luxury cinema offering reclining seats, gourmet food, and the ultimate movie experience.",
    videoUrl: "https://www.youtube.com/embed/8wJdp7ekEEA?autoplay=1&mute=1&controls=0&loop=1&playlist=8wJdp7ekEEA&playsinline=1"
  },
  {
    id: "pvr-icon",
    name: "PVR Icon",
    location: "Andheri West, Mumbai",
    capacity: "1,200",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "A modern multiplex featuring IMAX screens and Dolby Atmos sound for an immersive experience.",
    videoUrl: "https://www.youtube.com/embed/kAV3I9Qiobo?autoplay=1&mute=1&controls=0&loop=1&playlist=kAV3I9Qiobo&playsinline=1"
  }
];
