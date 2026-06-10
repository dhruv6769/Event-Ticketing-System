import { useState } from 'react';

interface Props {
  onBlockSelect: (blockName: string, price: number, angle: number) => void;
}

export default function MovieTheaterLayout({ onBlockSelect }: Props) {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const blocks = [
    { id: 'Standard', name: 'Standard', price: 250, y: 320, h: 120, color: '#22c55e' },
    { id: 'Executive', name: 'Executive', price: 400, y: 480, h: 140, color: '#3b82f6' },
    { id: 'Recliners', name: 'Recliners', price: 800, y: 660, h: 180, color: '#a855f7' }
  ];

  return (
    <div className="relative w-full max-w-[800px] aspect-[4/3] flex flex-col items-center justify-center p-4">
      {hoveredBlock && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur border border-[var(--color-brand)] p-4 rounded-xl z-50 pointer-events-none shadow-2xl">
          <p className="text-xl font-heading text-[var(--color-gold)]">{hoveredBlock.split('|')[0]}</p>
          <p className="text-sm font-bold text-white mt-1">Price: ₹{hoveredBlock.split('|')[1]}</p>
        </div>
      )}

      <svg viewBox="0 0 1000 900" className="w-full h-full drop-shadow-2xl">
        {/* Glow behind screen */}
        <path d="M 150 180 Q 500 50 850 180" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="60" filter="blur(20px)" />
        {/* Curved Screen */}
        <path d="M 150 180 Q 500 80 850 180" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        <text x="500" y="110" fill="#ffffff" opacity="0.5" fontSize="24" fontWeight="bold" textAnchor="middle" className="tracking-[1em]">IMAX SCREEN</text>

        {/* Blocks */}
        {blocks.map(b => {
          const hoverId = `${b.name}|${b.price}`;
          const isHovered = hoveredBlock === hoverId;
          return (
            <g 
              key={b.id} 
              onMouseEnter={() => setHoveredBlock(hoverId)}
              onMouseLeave={() => setHoveredBlock(null)}
              onClick={() => onBlockSelect(b.name, b.price, 0)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Left section (Seat rows representation) */}
              <rect x="180" y={b.y} width="280" height={b.h} rx="12" fill={b.color} opacity={isHovered ? 0.4 : 0.15} stroke={b.color} strokeWidth={isHovered ? 3 : 1} />
              {/* Right section */}
              <rect x="540" y={b.y} width="280" height={b.h} rx="12" fill={b.color} opacity={isHovered ? 0.4 : 0.15} stroke={b.color} strokeWidth={isHovered ? 3 : 1} />
              
              <text x="500" y={b.y + b.h / 2} fill={b.color} fontSize="28" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" opacity={isHovered ? 1 : 0.7} className="tracking-wider">{b.name}</text>
              
              {/* Seat Row Mockups */}
              {Array.from({ length: Math.floor(b.h / 30) }).map((_, rIdx) => (
                <g key={`row-${rIdx}`} opacity="0.3">
                  <line x1="200" y1={b.y + 20 + rIdx * 30} x2="440" y2={b.y + 20 + rIdx * 30} stroke={b.color} strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
                  <line x1="560" y1={b.y + 20 + rIdx * 30} x2="800" y2={b.y + 20 + rIdx * 30} stroke={b.color} strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
                </g>
              ))}
            </g>
          )
        })}

        {/* Center Aisle */}
        <path d="M 480 300 L 480 850" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />
        <path d="M 520 300 L 520 850" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />
        <text x="500" y="870" fill="#334155" fontSize="14" fontWeight="bold" textAnchor="middle" className="tracking-widest">ENTRY / EXIT</text>
      </svg>
    </div>
  );
}
