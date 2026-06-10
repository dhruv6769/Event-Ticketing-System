import { useState } from 'react';

interface EdenGardensProps {
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

// Calculate text position in the middle of the wedge
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

export default function EdenGardens({ onBlockSelect }: EdenGardensProps) {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const cx = 500;
  const cy = 500;
  const innerR = 180;
  const midR = 300;
  const outerR = 450;
  const gap = 4; // Angular gap between blocks
  const tierGap = 10; // Radial gap between tiers

  // Definition of blocks
  // Top is 0, Right is 90, Bottom is 180, Left is 270
  const blocks = [
    // Club House (Bottom)
    { id: 'Club House Lower', name: 'Club House Lower Tier', start: 155, end: 205, rIn: innerR, rOut: midR, price: 4000 },
    { id: 'Club House Upper', name: 'Club House Upper Tier', start: 155, end: 205, rIn: midR + tierGap, rOut: outerR, price: 2500 },
    
    // Bottom-Left
    { id: 'L Block', name: 'L Block', start: 205 + gap, end: 240, rIn: innerR, rOut: midR, price: 1500 },
    { id: 'L1 Block', name: 'L1 Block', start: 205 + gap, end: 240, rIn: midR + tierGap, rOut: outerR, price: 800 },
    
    // Left
    { id: 'K Block', name: 'K Block', start: 240 + gap, end: 270, rIn: innerR, rOut: midR, price: 1800, highlight: '#06b6d4' }, // Highlighted K block from image
    { id: 'K1 Block', name: 'K1 Block', start: 240 + gap, end: 270, rIn: midR + tierGap, rOut: outerR, price: 900 },
    
    // Top-Left (J block extends across both tiers in image, or maybe J1 exists, let's treat it as one big block)
    { id: 'J Block', name: 'J Block', start: 270 + gap, end: 305, rIn: innerR, rOut: outerR, price: 1200 },
    
    // Top-Left
    { id: 'H Block', name: 'H Block', start: 305 + gap, end: 335, rIn: innerR, rOut: midR, price: 1500 },
    { id: 'H1 Block', name: 'H1 Block', start: 305 + gap, end: 335, rIn: midR + tierGap, rOut: outerR, price: 800 },
    
    // Top
    { id: 'G Block', name: 'G Block', start: 335 + gap, end: 360 - gap/2, rIn: innerR, rOut: midR, price: 1800 },
    { id: 'G1 Block', name: 'G1 Block', start: 335 + gap, end: 360 - gap/2, rIn: midR + tierGap, rOut: outerR, price: 900 },
    
    { id: 'F Block', name: 'F Block', start: 0 + gap/2, end: 25, rIn: innerR, rOut: midR, price: 1800 },
    { id: 'F1 Block', name: 'F1 Block', start: 0 + gap/2, end: 25, rIn: midR + tierGap, rOut: outerR, price: 900 },
    
    // Top-Right (E block extends across both tiers)
    { id: 'E Block', name: 'E Block', start: 25 + gap, end: 60, rIn: innerR, rOut: outerR, price: 1200 },
    
    // Right
    { id: 'D Block', name: 'D Block', start: 60 + gap, end: 95, rIn: innerR, rOut: midR, price: 1800 },
    { id: 'D1 Block', name: 'D1 Block', start: 60 + gap, end: 95, rIn: midR + tierGap, rOut: outerR, price: 900 },
    
    // Bottom-Right
    { id: 'C Block', name: 'C Block', start: 95 + gap, end: 125, rIn: innerR, rOut: midR, price: 1500 },
    { id: 'C1 Block', name: 'C1 Block', start: 95 + gap, end: 125, rIn: midR + tierGap, rOut: outerR, price: 800 },
    
    { id: 'B Block Premium', name: 'B Block Premium', start: 125 + gap, end: 155 - gap, rIn: innerR, rOut: innerR + (midR - innerR)/2, price: 3000 },
    { id: 'B Block', name: 'B Block', start: 125 + gap, end: 155 - gap, rIn: innerR + (midR - innerR)/2 + gap/2, rOut: midR, price: 2000 },
    { id: 'B1 Block', name: 'B1 Block', start: 125 + gap, end: 155 - gap, rIn: midR + tierGap, rOut: outerR, price: 1000 },
  ];

  return (
    <div className="w-full max-w-[800px] aspect-square relative">
      <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl">
        
        {/* Pitch */}
        <circle cx="500" cy="500" r={innerR - 20} fill="#84cc16" opacity="0.9" stroke="#bef264" strokeWidth="2" />
        <rect x="490" y="460" width="20" height="80" fill="#d4a373" rx="2" />
        
        {blocks.map((block) => {
          const path = drawWedge(cx, cy, block.rIn, block.rOut, block.start, block.end);
          const center = getWedgeCenter(cx, cy, block.rIn, block.rOut, block.start, block.end);
          
          const isHovered = hoveredBlock === block.id;
          const fill = isHovered ? '#facc15' : (block.highlight || '#9ca3af');
          
          return (
            <g 
              key={block.id}
              onClick={() => onBlockSelect(block.name, block.price, center.angle)}
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
              className="cursor-pointer transition-all duration-300"
              style={{ transformOrigin: '500px 500px', transform: isHovered ? `scale(1.02)` : 'scale(1)' }}
            >
              <path d={path} fill={fill} stroke="#1f2937" strokeWidth="2" className="transition-colors duration-300" />
              <text 
                x={center.x} 
                y={center.y} 
                fill={isHovered ? '#000' : '#1f2937'} 
                fontSize="12" 
                fontWeight="bold" 
                textAnchor="middle" 
                dominantBaseline="middle"
                transform={`rotate(${center.angle > 90 && center.angle < 270 ? center.angle - 180 : center.angle} ${center.x} ${center.y})`}
                className="pointer-events-none transition-colors duration-300"
              >
                {block.id.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
