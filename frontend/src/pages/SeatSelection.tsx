import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, X, XCircle, CheckCircle } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NarendraModiStadium from '../components/NarendraModiStadium';
import WankhedeStadium from '../components/WankhedeStadium';
import EdenGardens from '../components/EdenGardens';
import ChinnaswamyStadium from '../components/ChinnaswamyStadium';
import ChepaukStadium from '../components/ChepaukStadium';
import SaltLakeStadium from '../components/SaltLakeStadium';
import JawaharlalNehruKochiStadium from '../components/JawaharlalNehruKochiStadium';
import MovieTheaterLayout from '../components/MovieTheaterLayout';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { MOCK_EVENTS } from '../data/mockData';

type LayoutType = 'narendra' | 'wankhede' | 'eden' | 'chinnaswamy' | 'velodrome' | 'theatre' | 'chepauk' | 'saltlake' | 'kochi';

export default function SeatSelection() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [lockedSeats, setLockedSeats] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timeout

  const [alertConfig, setAlertConfig] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false, message: '', type: 'success'
  });

  const showAlert = (message: string, type: 'error' | 'success' = 'error') => {
    setAlertConfig({ show: true, type, message });
    setTimeout(() => {
      setAlertConfig(prev => ({ ...prev, show: false }));
    }, 1500);
  };
  
  const EVENT_ID = eventId || "event-1";
  const socketRef = useRef<Socket | null>(null);
  
  // Include dynamic events from localStorage so newly added events work
  const dynamicEvents = JSON.parse(localStorage.getItem('dynamicEvents') || '[]');
  const allEvents = [...dynamicEvents, ...MOCK_EVENTS];
  
  const eventData = allEvents.find(e => e.id?.toString() === eventId?.toString()) || MOCK_EVENTS[0];
  
  // Set layout based on the event's venue with safer includes() checks
  const venueName = (eventData.venue || '').toLowerCase();
  const initialLayout: LayoutType = venueName.includes('wankhede') ? 'wankhede' 
    : venueName.includes('narendra') ? 'narendra' 
    : venueName.includes('eden') ? 'eden'
    : venueName.includes('chinnaswamy') ? 'chinnaswamy'
    : venueName.includes('chidambaram') || venueName.includes('chepauk') ? 'chepauk'
    : venueName.includes('salt lake') || venueName.includes('saltlake') ? 'saltlake'
    : venueName.includes('nehru') || venueName.includes('kochi') ? 'kochi'
    : venueName.includes('pvr') ? 'theatre'
    : 'velodrome';

  const [activeLayout, setActiveLayout] = useState<LayoutType>(initialLayout);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedBlockAngle, setSelectedBlockAngle] = useState<number>(0);
  const [blockPrice, setBlockPrice] = useState<number>(1200);

  // Keep active layout in sync if event ID changes without unmounting
  useEffect(() => {
    setActiveLayout(initialLayout);
    setSelectedBlock(null);
  }, [initialLayout]);

  const MOCK_USER_ID = "user-123";

  // Session Timeout Timer
  useEffect(() => {
    let timer: any;
    if (selectedSeats.length > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            showAlert("Session Timeout! Seats released.", "error");
            setSelectedSeats([]);
            setSelectedBlock(null);
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(600);
    }
    return () => clearInterval(timer);
  }, [selectedSeats.length]);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("seat_locked", (data: { seatId: string, eventId: string, userId: string }) => {
      if (data.eventId === EVENT_ID) {
        setLockedSeats(prev => ({ ...prev, [data.seatId]: data.userId }));
      }
    });

    const lockKeyPrefix = `${EVENT_ID}-${selectedDate || 'default'}-${selectedTime || 'default'}-${selectedBlock}`;
    
    // Initial load of globally occupied seats
    const globalOccupied = JSON.parse(localStorage.getItem('globalOccupiedSeats') || '{}');
    const globalLockedSeats: { [key: string]: string } = {};
    if (globalOccupied[lockKeyPrefix]) {
      globalOccupied[lockKeyPrefix].forEach((seatId: string) => {
        globalLockedSeats[seatId] = 'occupied';
      });
    }
    
    setLockedSeats(globalLockedSeats);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [selectedBlock, activeLayout, selectedSeats, EVENT_ID]);

  const toggleSeat = (seatId: string) => {
    if (lockedSeats[seatId] && lockedSeats[seatId] !== MOCK_USER_ID) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 10) return showAlert("Maximum 10 seats allowed.");
      setSelectedSeats(prev => [...prev, seatId]);
      socket?.emit("lock_seat", { seatId, userId: MOCK_USER_ID, eventId: EVENT_ID });
    }
  };

  const renderRealisticSeat = (
    x: number,
    y: number,
    seatId: string,
    isLocked: any,
    isSelected: boolean,
    rectW: number,
    rectH: number
  ) => {
    let fillUrl = 'url(#seat-available)';
    let borderStroke = 'rgba(255,255,255,0.15)';
    
    if (isLocked) {
      fillUrl = 'url(#seat-locked)';
      borderStroke = 'rgba(255,255,255,0.08)';
    } else if (isSelected) {
      fillUrl = 'url(#seat-selected)';
      borderStroke = 'rgba(255,255,255,0.35)';
    }

    return (
      <g 
        key={seatId} 
        onClick={() => !isLocked && toggleSeat(seatId)}
        className={`transition-all duration-150 cursor-pointer group ${isLocked ? 'cursor-not-allowed opacity-35' : 'hover:scale-[1.8] hover:filter hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]'}`}
        style={{ transformOrigin: `${x}px ${y}px` }}
      >
        {/* Metal bracket legs */}
        <line x1={x - 2} y1={y + rectH/2} x2={x - 2} y2={y + rectH/2 + 2} stroke="#0f172a" strokeWidth="1" />
        <line x1={x + 2} y1={y + rectH/2} x2={x + 2} y2={y + rectH/2 + 2} stroke="#0f172a" strokeWidth="1" />
        <line x1={x - 3} y1={y + rectH/2 + 2} x2={x + 3} y2={y + rectH/2 + 2} stroke="#0f172a" strokeWidth="0.8" />

        {/* Armrests */}
        <rect x={x - rectW/2 - 1.2} y={y - rectH/2 + 1} width="1.0" height={rectH - 1} fill="#1e293b" rx="0.3" />
        <rect x={x + rectW/2 + 0.2} y={y - rectH/2 + 1} width="1.0" height={rectH - 1} fill="#1e293b" rx="0.3" />

        {/* Backrest with ergonomic ridges */}
        <rect 
          x={x - rectW/2} 
          y={y - rectH/2 - 1} 
          width={rectW} 
          height={rectH/2 + 1} 
          fill={fillUrl} 
          rx="1.2" 
          stroke={borderStroke} 
          strokeWidth="0.5" 
          style={{ filter: isSelected ? 'url(#glow-selected)' : 'none' }}
        />
        <line x1={x - rectW/4} y1={y - rectH/2} x2={x - rectW/4} y2={y} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        <line x1={x} y1={y - rectH/2} x2={x} y2={y} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        <line x1={x + rectW/4} y1={y - rectH/2} x2={x + rectW/4} y2={y} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />

        {/* Seat cushion pan */}
        <rect 
          x={x - rectW/2} 
          y={y + 1} 
          width={rectW} 
          height={rectH/2 + 1} 
          fill={fillUrl} 
          rx="1.5" 
          stroke={borderStroke} 
          strokeWidth="0.5" 
          style={{ filter: isSelected ? 'url(#glow-selected)' : 'none' }}
        />
        <path 
          d={`M ${x - rectW/2 + 1.5} ${y + 2.5} Q ${x} ${y + 4.5} ${x + rectW/2 - 1.5} ${y + 2.5}`} 
          fill="none" 
          stroke="rgba(255,255,255,0.15)" 
          strokeWidth="0.5" 
        />

        {/* Crease line */}
        <line x1={x - rectW/2 + 1} y1={y + 0.5} x2={x + rectW/2 - 1} y2={y + 0.5} stroke="rgba(0,0,0,0.35)" strokeWidth="0.6" />
      </g>
    );
  };



  // MACRO VIEWS
  const renderNarendraModi = () => {
    return (
      <NarendraModiStadium 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderWankhede = () => {
    return (
      <WankhedeStadium 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderEdenGardens = () => {
    return (
      <EdenGardens 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderChinnaswamy = () => {
    return (
      <ChinnaswamyStadium 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderChepauk = () => {
    return (
      <ChepaukStadium 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderSaltLake = () => {
    return (
      <SaltLakeStadium 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderKochi = () => {
    return (
      <JawaharlalNehruKochiStadium 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }} 
      />
    );
  };

  const renderVelodrome = () => {
    return (
      <div className="relative w-[500px] h-80 flex items-center justify-center">
        {/* Track */}
        <div className="absolute w-[400px] h-56 rounded-full bg-cyan-500/20 border-8 border-cyan-500/40 flex items-center justify-center text-cyan-500/50 font-bold tracking-widest text-2xl">
          VELODROME
        </div>
        
        {/* North Stand */}
        <div onClick={() => setSelectedBlock("North Track Stand")} className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-12 bg-yellow-500/20 border border-yellow-500/50 rounded-t-3xl cursor-pointer hover:bg-yellow-500/40 flex items-center justify-center text-xs font-bold">
          North Track Stand
        </div>
        
        {/* South Stand */}
        <div onClick={() => setSelectedBlock("South Track Stand")} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-12 bg-yellow-500/20 border border-yellow-500/50 rounded-b-3xl cursor-pointer hover:bg-yellow-500/40 flex items-center justify-center text-xs font-bold">
          South Track Stand
        </div>

        {/* East Curve */}
        <div onClick={() => setSelectedBlock("East Curve")} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-40 bg-orange-500/20 border border-orange-500/50 rounded-r-full cursor-pointer hover:bg-orange-500/40 flex items-center justify-center text-xs font-bold writing-vertical-rl rotate-180">
          EAST CURVE
        </div>

        {/* West Curve */}
        <div onClick={() => setSelectedBlock("West Curve")} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-40 bg-orange-500/20 border border-orange-500/50 rounded-l-full cursor-pointer hover:bg-orange-500/40 flex items-center justify-center text-xs font-bold writing-vertical-rl">
          WEST CURVE
        </div>
      </div>
    );
  };

  const renderTheatre = () => {
    return (
      <MovieTheaterLayout 
        onBlockSelect={(blockName, price, angle) => {
          setSelectedBlock(blockName);
          setBlockPrice(price);
          setSelectedBlockAngle(angle);
        }}
      />
    );
  }

  // MICRO VIEW (Seat Grid)
  const renderSeatGrid = () => {
    if (activeLayout === 'theatre') {
      const rows = selectedBlock === 'Recliners' ? 4 : selectedBlock === 'Executive' ? 6 : 8;
      const seatsPerRow = selectedBlock === 'Recliners' ? 12 : 16;
      const seats = [];

      // Rectangular grid
      const seatSize = 24;
      const gap = 8;
      const gridWidth = seatsPerRow * (seatSize + gap);
      const gridHeight = rows * (seatSize + gap);
      
      const startX = -gridWidth / 2;
      const startY = -gridHeight / 2;

      for (let rIdx = 0; rIdx < rows; rIdx++) {
        for (let sIdx = 0; sIdx < seatsPerRow; sIdx++) {
          const seatId = `${String.fromCharCode(65 + rIdx)}${sIdx + 1}`;
          const isLocked = lockedSeats[seatId];
          const isSelected = selectedSeats.includes(seatId);

          let fill = '#334155'; // default empty
          if (isLocked) fill = '#ef4444'; // locked
          if (isSelected) fill = '#22c55e'; // selected

          const x = startX + sIdx * (seatSize + gap);
          const y = startY + rIdx * (seatSize + gap);

          seats.push(
            <g 
              key={seatId} 
              onClick={() => !isLocked && toggleSeat(seatId)}
              className={`transition-all duration-100 cursor-pointer ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-[1.2]'}`}
              style={{ transformOrigin: `${x + seatSize/2}px ${y + seatSize/2}px` }}
            >
              <rect x={x} y={y} width={seatSize} height={seatSize} fill={fill} rx={4} />
              <path 
                d={`M ${x + 4} ${y + seatSize - 4} L ${x + seatSize - 4} ${y + seatSize - 4}`} 
                stroke="rgba(255,255,255,0.5)" 
                strokeWidth="2" 
                opacity={isSelected ? 1 : 0} 
              />
            </g>
          );
        }
      }

      return (
        <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
          <div className="absolute top-6 left-6 z-50">
            <button 
              onClick={() => setSelectedBlock(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white bg-black/60 hover:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg shadow-black/50"
            >
              <ArrowLeft size={20} /> Back to Theatre
            </button>
          </div>

          <div className="text-center mt-2 z-10">
            <h2 className="text-4xl font-heading mb-2 text-white">{selectedBlock}</h2>
            <p className="text-[var(--color-gold)] font-medium">Screen is facing you</p>
          </div>

          <div className="flex-1 w-full h-full flex flex-col items-center justify-center -mt-10 relative">
            <div className="w-full max-w-[800px] h-4 bg-gradient-to-b from-white/40 to-transparent rounded-t-full mb-16 relative shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              <p className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold tracking-[0.5em] text-white/50">SCREEN</p>
            </div>
            <div className="w-full max-w-[750px] flex items-center justify-center">
              <svg 
                viewBox="-400 -200 800 400" 
                className="w-full h-full drop-shadow-2xl transition-all duration-[500ms]"
              >
                {seats}
              </svg>
            </div>
          </div>

        </div>
      );
    }

    const isWankhede = activeLayout === 'wankhede';
    const isFootball = activeLayout === 'saltlake' || activeLayout === 'kochi';
    const isStraight = isFootball;
    const totalRows = activeLayout === 'narendra' ? 40 : activeLayout === 'eden' ? 30 : 22;
    const seats = [];
    const cx = 500;
    const cy = 1300; // Pitch center is far below
    const rIn = 950; // Front row radius
    const rOut = 1450; // Back row radius
    const baseAngleSpan = 50;

    if (isStraight) {
      for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        const seatsInThisRow = 20 + Math.floor((rIdx / totalRows) * 12);
        const seatWidth = 14;
        const rowHeight = 16;
        const startY = 500; 
        
        const y = startY - rIdx * rowHeight;
        const startX = cx - ((seatsInThisRow - 1) * seatWidth) / 2;

        for (let sIdx = 0; sIdx < seatsInThisRow; sIdx++) {
          const x = startX + sIdx * seatWidth;
          
          const seatId = `${String.fromCharCode(65 + Math.floor(rIdx/2))}${sIdx + 1}-${rIdx}`;
          const isLocked = lockedSeats[seatId];
          const isSelected = selectedSeats.includes(seatId);

          const rectW = 10;
          const rectH = 8;

          seats.push(
            renderRealisticSeat(x, y, seatId, isLocked, isSelected, rectW, rectH)
          );
        }
      }
    } else {
      for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        const rowRadius = rIn + (rIdx / (totalRows - 1)) * (rOut - rIn);
        const seatsInThisRow = isWankhede 
          ? 15 + Math.floor((rIdx / totalRows) * 30) 
          : 30 + Math.floor((rIdx / totalRows) * 60); 
        
        const angleStep = baseAngleSpan / (seatsInThisRow - 1);
        const startAngle = 270 - (baseAngleSpan / 2);

        for (let sIdx = 0; sIdx < seatsInThisRow; sIdx++) {
          const angleDeg = startAngle + sIdx * angleStep;
          const angleRad = angleDeg * (Math.PI / 180);
          
          const x = cx + rowRadius * Math.cos(angleRad);
          const y = cy + rowRadius * Math.sin(angleRad);
          
          const seatId = `${String.fromCharCode(65 + Math.floor(rIdx/2))}${sIdx + 1}-${rIdx}`;
          const isLocked = lockedSeats[seatId];
          const isSelected = selectedSeats.includes(seatId);

          const rectW = isWankhede ? 10 : 8;
          const rectH = isWankhede ? 8 : 6;

          seats.push(
            renderRealisticSeat(x, y, seatId, isLocked, isSelected, rectW, rectH)
          );
        }
      }
    }

    return (
      <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => setSelectedBlock(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} /> Back to Stadium
          </button>
        </div>

        <div className="text-center mt-2 z-10">
          <h2 className="text-4xl font-heading mb-2 text-white">{selectedBlock}</h2>
          <p className="text-[var(--color-gold)] font-medium">Perspective aligned with stadium block</p>
        </div>

        <div className="flex-1 w-full h-full flex items-center justify-center -mt-10 relative">
          <div className="w-full max-w-[750px] max-h-[750px] aspect-square relative">
            <svg 
              viewBox="-450 -150 1900 1900" 
              className="w-full h-full drop-shadow-2xl"
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComponentTransfer in="blur" result="glow">
                    <feFuncA type="linear" slope="0.8"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Seat Color Gradients */}
                <linearGradient id="seat-available" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="60%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="seat-selected" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="60%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="seat-locked" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="60%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>

                {/* Football Pitch Gradients */}
                <linearGradient id="grass-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#115e59" />
                  <stop offset="100%" stopColor="#134e4a" />
                </linearGradient>
                <linearGradient id="grass-light" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <radialGradient id="pitch-center-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>

                {/* Floodlight Beam Radial Gradients */}
                <radialGradient id="light-top-left" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
                <radialGradient id="light-top-right" cx="100%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
                <radialGradient id="light-bottom-left" cx="0%" cy="100%" r="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
                <radialGradient id="light-bottom-right" cx="100%" cy="100%" r="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
              </defs>

              {/* Corner Ambient Floodlights */}
              <circle cx="-150" cy="-150" r="450" fill="url(#light-top-left)" pointerEvents="none" />
              <circle cx="1150" cy="-150" r="450" fill="url(#light-top-right)" pointerEvents="none" />
              <circle cx="-150" cy="1150" r="450" fill="url(#light-bottom-left)" pointerEvents="none" />
              <circle cx="1150" cy="1150" r="450" fill="url(#light-bottom-right)" pointerEvents="none" />

              {/* Smooth rotating container centered exactly on pitch center (500, 800) */}
              <g>
                {isFootball ? (
                  // Football Pitch
                  <g 
                    style={{ 
                      transform: `rotate(${270 - selectedBlockAngle}deg)`,
                      transformOrigin: '500px 800px',
                      transformBox: 'view-box',
                      transition: 'transform 1200ms ease-in-out'
                    }}
                  >
                    {/* Turf Base */}
                    <rect x="300" y="750" width="400" height="150" fill="#065f46" rx="8" />
                    {/* Grass stripes */}
                    <rect x="300" y="750" width="40" height="150" fill="url(#grass-dark)" opacity="0.4" />
                    <rect x="340" y="750" width="40" height="150" fill="url(#grass-light)" opacity="0.4" />
                    <rect x="380" y="750" width="40" height="150" fill="url(#grass-dark)" opacity="0.4" />
                    <rect x="420" y="750" width="40" height="150" fill="url(#grass-light)" opacity="0.4" />
                    <rect x="460" y="750" width="40" height="150" fill="url(#grass-dark)" opacity="0.4" />
                    <rect x="500" y="750" width="40" height="150" fill="url(#grass-light)" opacity="0.4" />
                    <rect x="540" y="750" width="40" height="150" fill="url(#grass-dark)" opacity="0.4" />
                    <rect x="580" y="750" width="40" height="150" fill="url(#grass-light)" opacity="0.4" />
                    <rect x="620" y="750" width="40" height="150" fill="url(#grass-dark)" opacity="0.4" />
                    <rect x="660" y="750" width="40" height="150" fill="url(#grass-light)" opacity="0.4" />

                    {/* Pitch boundaries & chalk markings */}
                    <rect x="310" y="760" width="380" height="130" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <line x1="500" y1="760" x2="500" y2="890" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <circle cx="500" cy="825" r="25" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <circle cx="500" cy="825" r="2" fill="rgba(255,255,255,0.9)" />
                    
                    {/* Penalty areas */}
                    <rect x="310" y="792" width="45" height="66" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <rect x="310" y="807" width="15" height="36" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <circle cx="340" cy="825" r="1.5" fill="#ffffff" />
                    <path d="M 355 813 A 25 25 0 0 1 355 837" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />

                    <rect x="645" y="792" width="45" height="66" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <rect x="675" y="807" width="15" height="36" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <circle cx="660" cy="825" r="1.5" fill="#ffffff" />
                    <path d="M 645 813 A 25 25 0 0 0 645 837" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />

                    {/* Corner Arcs */}
                    <path d="M 310 765 A 5 5 0 0 1 315 760" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                    <path d="M 315 890 A 5 5 0 0 1 310 885" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                    <path d="M 685 760 A 5 5 0 0 1 690 765" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                    <path d="M 690 885 A 5 5 0 0 1 685 890" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />

                    {/* Goalposts & Nets */}
                    <polygon points="295,807 310,810 310,840 295,843" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                    <path d="M 295 807 L 310 810 M 295 843 L 310 840 M 295 807 L 295 843" stroke="#ffffff" strokeWidth="1.5" fill="none" />
                    
                    <polygon points="705,807 690,810 690,840 705,843" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                    <path d="M 705 807 L 690 810 M 705 843 L 690 840 M 705 807 L 705 843" stroke="#ffffff" strokeWidth="1.5" fill="none" />

                    <rect x="300" y="750" width="400" height="150" fill="url(#pitch-center-glow)" pointerEvents="none" />
                  </g>
                ) : (
                  // Cricket Pitch
                  <g 
                    style={{ 
                      transform: `rotate(${270 - selectedBlockAngle}deg)`,
                      transformOrigin: '500px 800px',
                      transformBox: 'view-box',
                      transition: 'transform 1200ms ease-in-out'
                    }}
                  >
                    {/* Outfield concentric grass cutting */}
                    <ellipse cx="500" cy="800" rx="280" ry="110" fill="#1b5e20" stroke="#2e7d32" strokeWidth="1.5" />
                    <ellipse cx="500" cy="800" rx="242" ry="95" fill="#2e7d32" opacity="0.95" />
                    <ellipse cx="500" cy="800" rx="204" ry="80" fill="#388e3c" opacity="0.95" />
                    <ellipse cx="500" cy="800" rx="166" ry="65" fill="#4caf50" opacity="0.95" />
                    <ellipse cx="500" cy="800" rx="128" ry="50" fill="#81c784" opacity="0.85" />

                    {/* 30-Yard Circle */}
                    <ellipse cx="500" cy="800" rx="140" ry="55" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeDasharray="4,4" />

                    {/* Boundary Rope */}
                    <ellipse cx="500" cy="800" rx="276" ry="108" fill="none" stroke="#f1f5f9" strokeWidth="2.5" opacity="0.95" />

                    {/* Wicket Pitch Strip */}
                    <rect x="488" y="775" width="24" height="50" fill="#d7ccc8" stroke="#8d6e63" strokeWidth="1.5" rx="1" />
                    <line x1="488" y1="782" x2="512" y2="782" stroke="#ffffff" strokeWidth="1" />
                    <line x1="484" y1="785" x2="516" y2="785" stroke="#ffffff" strokeWidth="1" />
                    <line x1="488" y1="818" x2="512" y2="818" stroke="#ffffff" strokeWidth="1" />
                    <line x1="484" y1="815" x2="516" y2="815" stroke="#ffffff" strokeWidth="1" />

                    {/* Wickets (Stumps & Bails) */}
                    <line x1="496" y1="781" x2="496" y2="782" stroke="#d7a15c" strokeWidth="1.5" />
                    <line x1="500" y1="781" x2="500" y2="782" stroke="#d7a15c" strokeWidth="1.5" />
                    <line x1="504" y1="781" x2="504" y2="782" stroke="#d7a15c" strokeWidth="1.5" />
                    <line x1="495" y1="781" x2="505" y2="781" stroke="#d7a15c" strokeWidth="1" />

                    <line x1="496" y1="818" x2="496" y2="819" stroke="#d7a15c" strokeWidth="1.5" />
                    <line x1="500" y1="818" x2="500" y2="819" stroke="#d7a15c" strokeWidth="1.5" />
                    <line x1="504" y1="818" x2="504" y2="819" stroke="#d7a15c" strokeWidth="1.5" />
                    <line x1="495" y1="819" x2="505" y2="819" stroke="#d7a15c" strokeWidth="1" />
                  </g>
                )}
                
                {seats}
              </g>
            </svg>
          </div>
        </div>


      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-6 pt-28 pb-8 flex flex-col lg:flex-row gap-8 h-screen">
        
        {/* Dynamic Layout Area */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 glass rounded-3xl p-8 flex flex-col items-center overflow-auto relative border border-white/5"
        >
          <div className="w-full flex justify-between items-center mb-8">
            <h2 className="text-4xl font-heading text-[var(--color-gold)] drop-shadow-md">
              {activeLayout === 'narendra' && 'Narendra Modi Stadium'}
              {activeLayout === 'wankhede' && 'Wankhede Stadium'}
              {activeLayout === 'eden' && 'Eden Gardens'}
              {activeLayout === 'chinnaswamy' && 'M. Chinnaswamy Stadium'}
              {activeLayout === 'chepauk' && 'M.A. Chidambaram Stadium'}
              {activeLayout === 'saltlake' && 'Salt Lake Stadium'}
              {activeLayout === 'kochi' && 'Jawaharlal Nehru Stadium (Kochi)'}
              {activeLayout === 'velodrome' && 'NSCI Velodrome'}
              {activeLayout === 'theatre' && 'Movie Theatre'}
            </h2>
            <select 
              className="bg-black/50 border border-white/10 rounded-xl px-6 py-3 text-sm outline-none font-medium hover:border-[var(--color-brand)] transition-colors focus:ring-2 focus:ring-[var(--color-brand)]/50"
              value={activeLayout}
              onChange={(e) => {
                setActiveLayout(e.target.value as LayoutType);
                setSelectedBlock(null);
              }}
            >
              <option value="narendra">Narendra Modi Stadium</option>
              <option value="wankhede">Wankhede Stadium</option>
              <option value="eden">Eden Gardens</option>
              <option value="chinnaswamy">M. Chinnaswamy Stadium</option>
              <option value="chepauk">M.A. Chidambaram Stadium</option>
              <option value="saltlake">Salt Lake Stadium</option>
              <option value="kochi">Jawaharlal Nehru Stadium (Kochi)</option>
              <option value="velodrome">NSCI Velodrome</option>
              <option value="theatre">Movie Theatre</option>
            </select>
          </div>

          <div className="flex-1 w-full flex items-center justify-center relative">
            {!selectedBlock ? (
              <>
                {activeLayout === 'narendra' && renderNarendraModi()}
                {activeLayout === 'wankhede' && renderWankhede()}
                {activeLayout === 'eden' && renderEdenGardens()}
                {activeLayout === 'chinnaswamy' && renderChinnaswamy()}
                {activeLayout === 'chepauk' && renderChepauk()}
                {activeLayout === 'saltlake' && renderSaltLake()}
                {activeLayout === 'kochi' && renderKochi()}
                {activeLayout === 'velodrome' && renderVelodrome()}
                {activeLayout === 'theatre' && renderTheatre()}
              </>
            ) : (
              renderSeatGrid()
            )}
          </div>

          <div className="flex gap-6 mt-8 text-sm font-medium bg-black/40 px-8 py-4 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-slate-700 rounded-sm"></div> <span className="text-gray-300">Available</span></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_#ef4444]"></div> <span className="text-white">Locked</span></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-green-500 rounded-sm shadow-[0_0_10px_#22c55e]"></div> <span className="text-white">Selected</span></div>
          </div>
        </motion.div>

        {/* Checkout Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-96 glass rounded-3xl p-8 flex flex-col h-full sticky top-24 border border-white/5"
        >
          <h3 className="text-3xl font-heading mb-6 border-b border-white/10 pb-4">Booking Summary</h3>
          
          {selectedSeats.length > 0 ? (
            <>
              <div className="flex justify-between items-center text-sm mb-4 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                <span className="text-[var(--color-gold)] font-bold">Time Remaining:</span>
                <span className={`font-mono font-bold text-xl ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex-1 overflow-auto mt-2 pr-2 custom-scrollbar">
                {selectedSeats.map(seat => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={seat} 
                    className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl mb-3 group hover:border-white/20 transition-all"
                  >
                    <div>
                      <p className="font-bold text-lg">{seat}</p>
                      <p className="text-xs text-[var(--color-brand)] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-pulse"></span>
                        Live Lock active
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-xl">₹{blockPrice}</span>
                      <button 
                        onClick={() => toggleSeat(seat)} 
                        className="text-gray-500 hover:text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10 transition-all p-2 rounded-full"
                        title="Remove seat"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-gray-400 font-medium">Total ({selectedSeats.length} seats)</span>
                  <span className="text-4xl font-heading text-[var(--color-gold)] drop-shadow-[0_0_10px_rgba(235,178,47,0.3)]">₹{selectedSeats.length * blockPrice}</span>
                </div>
                <button 
                  onClick={() => {
                    navigate('/payment', { 
                      state: { 
                        totalAmount: selectedSeats.length * blockPrice,
                        seatCount: selectedSeats.length,
                        eventId: EVENT_ID,
                        eventTitle: eventData.title,
                        eventVenue: eventData.venue,
                        blockName: selectedBlock,
                        eventImage: eventData.image,
                        date: selectedDate,
                        time: selectedTime,
                        seats: selectedSeats
                      } 
                    });
                  }} 
                  className="w-full bg-[var(--color-brand)] hover:bg-red-600 text-white font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(230,57,70,0.4)] text-lg"
                >
                  Proceed to Payment
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 mb-6 flex items-center justify-center opacity-50">
                <span className="text-3xl">+</span>
              </div>
              <p className="text-xl font-heading text-gray-400 mb-2">No seats selected.</p>
              <p className="text-sm max-w-[200px] mx-auto">First select a block, then select your specific seats from the layout.</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {alertConfig.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 30, rotateX: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative max-w-sm w-full bg-black/90 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-center pointer-events-auto"
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${alertConfig.type === 'success' ? 'from-green-500 to-green-300' : 'from-red-500 to-red-300'}`}></div>
              
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-[60px] opacity-20 ${alertConfig.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, damping: 15 }}
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white/5 relative z-10 shadow-inner ${alertConfig.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
              >
                {alertConfig.type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
              </motion.div>
              
              <p className="text-gray-200 text-lg relative z-10 font-bold tracking-wide">
                {alertConfig.message}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageWrapper>
  );
}
