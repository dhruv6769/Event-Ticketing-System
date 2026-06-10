import { useState } from 'react';

interface ChinnaswamyProps {
  onBlockSelect: (blockName: string, price: number, angle: number) => void;
}

const drawWedge = (cx: number, cy: number, rIn: number, rOut: number, startAngle: number, endAngle: number) => {
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;

  const x1 = cx + rIn * Math.cos(startRad);
  const y1 = cy + rIn * Math.sin(startRad);
  const x2 = cx + rOut * Math.cos(startRad);
  const y2 = cy + rOut * Math.sin(startRad);
  const x3 = cx + rOut * Math.cos(endRad);
  const y3 = cy + rOut * Math.sin(endRad);
  const x4 = cx + rIn * Math.cos(endRad);
  const y4 = cy + rIn * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1} ${y1} Z`;
};

const getWedgeCenter = (cx: number, cy: number, rIn: number, rOut: number, startAngle: number, endAngle: number) => {
  const midAngle = (startAngle + endAngle) / 2;
  const midRad = (midAngle - 90) * Math.PI / 180;
  const midR = (rIn + rOut) / 2;
  return {
    x: cx + midR * Math.cos(midRad),
    y: cy + midR * Math.sin(midRad),
    angle: midAngle
  };
};

export default function ChinnaswamyStadium({ onBlockSelect }: ChinnaswamyProps) {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const cx = 500;
  const cy = 500;
  const innerR = 190;
  const midR = 320;
  const outerR = 470;
  const gap = 5; 
  const tierGap = 12;

  // Bottom is 180, Left is 270, Top is 0/360, Right is 90
  const blocks = [
    // Bottom Pavilion
    { id: 'QA P1', name: 'Qatar Airways P1', start: 160, end: 200, rIn: innerR, rOut: innerR + 40, price: 5000, highlight: '#d1d5db' },
    { id: 'QA P2', name: 'Qatar Airways P2', start: 160, end: 200, rIn: innerR + 45, rOut: innerR + 85, price: 4000, highlight: '#fbcfe8' }, // Pinkish
    { id: 'Happilo Pav', name: 'Happilo Pavilion Terrace', start: 160, end: 200, rIn: innerR + 90, rOut: midR, price: 3000, highlight: '#9ca3af' },
    { id: 'KEI P Corp', name: 'KEI Wires P Corporate', start: 160, end: 200, rIn: midR + tierGap, rOut: outerR, price: 2000, highlight: '#67e8f9' }, // Cyan
    
    // Bottom-Left
    { id: 'QA P1 Annex', name: 'Qatar Airways P1 Annex', start: 200 + gap, end: 240, rIn: innerR, rOut: midR, price: 1500 },
    { id: 'QA P3', name: 'Qatar Airways P3', start: 200 + gap, end: 240, rIn: midR + tierGap, rOut: outerR, price: 800 },
    
    // Left
    { id: 'QA Exec Lounge', name: 'Qatar Airways Executive Lounge', start: 240 + gap, end: 270, rIn: innerR, rOut: midR, price: 3500 },
    { id: 'JIO P3 Annex', name: 'JIO P3 Annex', start: 240 + gap, end: 270, rIn: midR + tierGap, rOut: outerR, price: 1000 },
    
    // Top-Left
    { id: 'Hindware D', name: 'Hindware D Corporate', start: 270 + gap, end: 320, rIn: innerR, rOut: midR, price: 1800 },
    { id: 'KEI A Stand', name: 'KEI Wires A Stand', start: 270 + gap, end: 320, rIn: midR + tierGap, rOut: outerR, price: 900 },
    
    // Top
    { id: 'PUMA B', name: 'PUMA B Stand', start: 320 + gap, end: 360 + 15, rIn: innerR, rOut: midR, price: 1500 },
    { id: 'QA Fan Terr', name: 'Qatar Airways Fan Terrace N', start: 320 + gap, end: 360 + 15, rIn: midR + tierGap, rOut: outerR, price: 800 },
    
    // Top-Right
    { id: 'Boat C', name: 'Boat C Stand', start: 15 + gap, end: 60, rIn: innerR, rOut: midR, price: 1500 },
    { id: 'Happilo Grand', name: 'Happilo Grand Terrace', start: 15 + gap, end: 60, rIn: midR + tierGap, rOut: outerR, price: 1000 },
    
    // Right
    { id: 'Happilo H1', name: 'Happilo H Stand Lower 1', start: 60 + gap, end: 90, rIn: innerR, rOut: innerR + 60, price: 2000 },
    { id: 'Happilo H2', name: 'Happilo H Stand Lower 2', start: 60 + gap, end: 90, rIn: innerR + 65, rOut: midR, price: 1800 },
    { id: 'Happilo Upper', name: 'Happilo H Stand Upper', start: 60 + gap, end: 90, rIn: midR + tierGap, rOut: outerR, price: 900 },
    
    // Bottom-Right Upper
    { id: 'Nippon M4', name: 'Nippon M4', start: 90 + gap, end: 125, rIn: innerR, rOut: midR, price: 1200 },
    { id: 'JIO M3', name: 'JIO M3', start: 90 + gap, end: 125, rIn: midR + tierGap, rOut: outerR, price: 800 },

    // Bottom-Right Lower
    { id: 'KEI M1', name: 'KEI Wires M1', start: 125 + gap, end: 160 - gap, rIn: innerR, rOut: midR, price: 1200 },
    { id: 'JIO M2', name: 'JIO M2', start: 125 + gap, end: 160 - gap, rIn: midR + tierGap, rOut: outerR, price: 800 },
  ];

  return (
    <div className="w-full max-w-[800px] aspect-square relative">
      <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl">
        
        {/* Pitch */}
        <circle cx="500" cy="500" r={innerR - 20} fill="#84cc16" opacity="0.9" stroke="#bef264" strokeWidth="2" />
        <rect x="490" y="460" width="20" height="80" fill="#facc15" rx="2" />
        
        {blocks.map((block) => {
          const path = drawWedge(cx, cy, block.rIn, block.rOut, block.start, block.end);
          const center = getWedgeCenter(cx, cy, block.rIn, block.rOut, block.start, block.end);
          
          const isHovered = hoveredBlock === block.id;
          const fill = isHovered ? '#fde047' : (block.highlight || '#9ca3af');
          
          // Split name into multiple lines for better fitting if needed, or just use ID
          const labelParts = block.id.split(' ');
          
          return (
            <g 
              key={block.id}
              onClick={() => onBlockSelect(block.name, block.price, center.angle)}
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
              className="cursor-pointer transition-all duration-300"
              style={{ transformOrigin: '500px 500px', transform: isHovered ? `scale(1.02)` : 'scale(1)' }}
            >
              <path d={path} fill={fill} stroke="#374151" strokeWidth="2" className="transition-colors duration-300" />
              
              <text 
                x={center.x} 
                y={center.y} 
                fill={isHovered ? '#000' : '#1f2937'} 
                fontSize="11" 
                fontWeight="bold" 
                textAnchor="middle" 
                dominantBaseline="middle"
                transform={`rotate(${center.angle > 90 && center.angle < 270 ? center.angle - 180 : center.angle} ${center.x} ${center.y})`}
                className="pointer-events-none transition-colors duration-300"
              >
                {labelParts.map((part, i) => (
                  <tspan x={center.x} dy={i === 0 ? `-${(labelParts.length - 1) * 6}` : '12'} key={i}>{part}</tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
