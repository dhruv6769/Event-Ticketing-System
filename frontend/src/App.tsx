import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/AnimatedRoutes';
import Navbar from './components/Navbar';
import { SearchProvider } from './context/SearchContext';

const USERS_TO_SEED = [
  { name: 'Vedant Rathavi', tickets: 20 },
  { name: 'Pratik Jaiswal', tickets: 18 },
  { name: 'Maulik Rathod', tickets: 15 },
  { name: 'Jay Mojitra', tickets: 12 },
  { name: 'Jayesh Raval', tickets: 10 },
  { name: 'Raj Joshi', tickets: 8 },
  { name: 'Hitesh Chaudhari', tickets: 5 }
];

function App() {
  useEffect(() => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userDataMap = JSON.parse(localStorage.getItem('userDataMap') || '{}');
    
    let hasChanges = false;

    USERS_TO_SEED.forEach((userData) => {
      const firstName = userData.name.split(' ')[0].toLowerCase();
      const email = `${firstName}@gmail.com`;
      const password = `${firstName}123s`;

      if (!registeredUsers.find((u: any) => u.email === email)) {
        hasChanges = true;
        // Add to registered users
        registeredUsers.push({
          email,
          password,
          profile: { name: userData.name, email, mobile: '', city: '' }
        });

        // Add bookings to userDataMap
        const userBookings = Array(userData.tickets).fill({
          event: "Coldplay: Live",
          date: "Nov 20, 2026",
          venue: "Narendra Modi Stadium",
          seats: "General Admission - 1 Seat(s)",
          price: "₹1200",
          status: "Confirmed"
        });

        userDataMap[email] = {
          balance: "10000",
          tx: "[]",
          bookings: JSON.stringify(userBookings),
          tickets: "[]",
          notifications: "[]",
          coupons: "[]",
          upiPin: "1234"
        };
      }
    });

    // Explicitly make Dhruv Rajput rank 1
    const dhruvUser = registeredUsers.find((u: any) => u.email.toLowerCase().includes('dhruv') || (u.profile && u.profile.name && u.profile.name.toLowerCase().includes('dhruv')));
    if (dhruvUser) {
      const email = dhruvUser.email;
      if (!userDataMap[email]) userDataMap[email] = {};
      const currentBookings = JSON.parse(userDataMap[email].bookings || '[]');
      if (currentBookings.length < 25) {
        hasChanges = true;
        const newBookings = Array(25).fill({
          event: "Coldplay: Live",
          date: "Nov 20, 2026",
          venue: "Narendra Modi Stadium",
          seats: "VIP Box - 1 Seat(s)",
          price: "₹50000",
          status: "Confirmed"
        });
        userDataMap[email].bookings = JSON.stringify(newBookings);
        
        // Sync to active session if logged in
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (currentProfile.email === email) {
          localStorage.setItem('myBookings', JSON.stringify(newBookings));
        }
      }
    }

    if (hasChanges) {
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      localStorage.setItem('userDataMap', JSON.stringify(userDataMap));
      // Dispatch storage event so Leaderboard updates instantly if open
      window.dispatchEvent(new Event('storage'));
    }
  }, []);

  return (
    <SearchProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
