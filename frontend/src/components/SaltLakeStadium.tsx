import { useState } from 'react';

interface BlockData {
  id: string;
  name: string;
  stand: string;
  startAngle: number;
  endAngle: number;
  rxIn: number;
  ryIn: number;
  rxOut: number;
  ryOut: number;
  color: string;
  price: number;
}

const SALT_LAKE_BLOCKS: BlockData[] = [];

// Helper to add blocks
const addBlock = (
  id: string, name: string, stand: string,
  start: number, end: number,
  rxIn: number, ryIn: number, rxOut: number, ryOut: number,
  color: string, price: number
) => {
  SALT_LAKE_BLOCKS.push({ id, name, stand, startAngle: start, endAngle: end, rxIn, ryIn, rxOut, ryOut, color, price });
};

// --- EAST STAND (C) (315 to 45) ---
// Inner (C1)
addBlock('C1', 'STAND C1', 'East Stand', 315, 360 + 45, 200, 160, 260, 210, '#9ca3af', 400);
// Middle (C2 - 1911 Stand)
addBlock('C2', '1911 STAND (C2)', 'East Stand', 315, 360 + 45, 265, 215, 325, 265, '#ec4899', 800); // Pink
// Outer (C3)
addBlock('C3', 'STAND C3', 'East Stand', 315, 360 + 45, 330, 270, 480, 390, '#0d9488', 300); // Teal

// --- NORTH STAND (B) (225 to 315) ---
// Inner (B1)
addBlock('B1', 'STAND B1', 'North Stand', 225, 315, 200, 160, 260, 210, '#9ca3af', 400);
// Middle (B2 - 1889 Stand)
addBlock('B2', '1889 STAND (B2)', 'North Stand', 225, 315, 265, 215, 325, 265, '#0d9488', 600); // Teal
// Outer (B3)
addBlock('B3', 'STAND B3', 'North Stand', 225, 315, 330, 270, 480, 390, '#9ca3af', 300);

// --- SOUTH STAND (D) (45 to 135) ---
// Inner (D1)
addBlock('D1', 'STAND D1', 'South Stand', 45, 135, 200, 160, 260, 210, '#9ca3af', 400);
// Middle (D2)
addBlock('D2', 'STAND D2', 'South Stand', 45, 135, 265, 215, 325, 265, '#9ca3af', 500);
// Outer (D3)
addBlock('D3', 'STAND D3', 'South Stand', 45, 135, 330, 270, 480, 390, '#9ca3af', 300);

// --- WEST STAND (A) (135 to 225) ---
// Inner Left (A1 Left)
addBlock('A1_LEFT', 'STAND A1 LEFT', 'West Stand', 180, 225, 200, 160, 260, 210, '#9ca3af', 500);
// Inner Right (A1 Right)
addBlock('A1_RIGHT', 'STAND A1 RIGHT', 'West Stand', 135, 180, 200, 160, 260, 210, '#9ca3af', 500);

// Outer Sectors (135 to 225)
// STAND A2 LEFT (205 to 225)
addBlock('A2_LEFT', 'STAND A2 LEFT', 'West Stand', 205, 225, 265, 215, 480, 390, '#9ca3af', 600);
// A2 VIP LEFT (192 to 205)
addBlock('A2_VIP_LEFT', 'A2 VIP LEFT', 'West Stand', 192, 205, 265, 215, 480, 390, '#38bdf8', 1500); // Light Blue
// VVIP (180 to 192)
addBlock('VVIP', 'VVIP', 'West Stand', 180, 192, 265, 215, 480, 390, '#fb923c', 3000); // Orange
// VIP BOX B (168 to 180)
addBlock('VIP_BOX_B', 'VIP BOX B', 'West Stand', 168, 180, 265, 215, 480, 390, '#a855f7', 2500); // Purple
// A2 VIP RIGHT (155 to 168)
addBlock('A2_VIP_RIGHT', 'A2 VIP RIGHT', 'West Stand', 155, 168, 265, 215, 480, 390, '#38bdf8', 1500); // Light Blue
// STAND A2 AWAY TEAM FANS (145 to 155)
addBlock('A2_AWAY', 'A2 AWAY TEAM FANS', 'West Stand', 145, 155, 265, 215, 480, 390, '#ec4899', 800); // Pink
// STAND A2 RIGHT (135 to 145)
addBlock('A2_RIGHT', 'STAND A2 RIGHT', 'West Stand', 135, 145, 265, 215, 480, 390, '#9ca3af', 600);


function polarToElliptical(centerX: number, centerY: number, rx: number, ry: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (rx * Math.cos(angleInRadians)),
    y: centerY + (ry * Math.sin(angleInRadians))
  };
}

function describeEllipticalArc(cx: number, cy: number, rxIn: number, ryIn: number, rxOut: number, ryOut: number, startAngle: number, endAngle: number) {
  const startOuter = polarToElliptical(cx, cy, rxOut, ryOut, endAngle);
  const endOuter = polarToElliptical(cx, cy, rxOut, ryOut, startAngle);
  const startInner = polarToElliptical(cx, cy, rxIn, ryIn, endAngle);
  const endInner = polarToElliptical(cx, cy, rxIn, ryIn, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", rxOut, ryOut, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", rxIn, ryIn, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

interface Props {
  onBlockSelect: (blockName: string, price: number, angle: number) => void;
}

export default function SaltLakeStadium({ onBlockSelect }: Props) {
  const [hoveredBlock, setHoveredBlock] = useState<BlockData | null>(null);

  const directionLabels = [
    { name: "EAST (STAND C)", angle: 0, rx: 505, ry: 415 },
    { name: "SOUTH (STAND D)", angle: 90, rx: 505, ry: 415 },
    { name: "WEST (STAND A)", angle: 180, rx: 505, ry: 415 },
    { name: "NORTH (STAND B)", angle: 270, rx: 505, ry: 415 }
  ];

  return (
    <div className="relative w-full max-w-[800px] aspect-square flex items-center justify-center">
      {hoveredBlock && (
        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur border border-blue-500 p-4 rounded-xl z-50 pointer-events-none shadow-2xl">
          <p className="text-2xl font-heading text-blue-400">{hoveredBlock.stand}</p>
          <p className="text-sm font-medium text-gray-300">{hoveredBlock.name}</p>
          <p className="text-xl font-bold text-white mt-2">₹{hoveredBlock.price}</p>
        </div>
      )}

      <svg viewBox="-50 -50 1100 1100" className="w-full h-full drop-shadow-2xl">
        {/* Soft white background */}
        <rect x="-50" y="-50" width="1100" height="1100" fill="#f8fafc" rx="40" />

        {/* Football Pitch */}
        <rect x="380" y="420" width="240" height="160" fill="#22c55e" stroke="#bef264" strokeWidth="2" />
        {/* Center Line */}
        <line x1="500" y1="420" x2="500" y2="580" stroke="#ffffff" strokeWidth="2" />
        {/* Center Circle */}
        <circle cx="500" cy="500" r="30" fill="none" stroke="#ffffff" strokeWidth="2" />
        <circle cx="500" cy="500" r="2" fill="#ffffff" />
        {/* Penalty Area Left */}
        <rect x="380" y="460" width="40" height="80" fill="none" stroke="#ffffff" strokeWidth="2" />
        <rect x="380" y="485" width="15" height="30" fill="none" stroke="#ffffff" strokeWidth="2" />
        {/* Penalty Area Right */}
        <rect x="580" y="460" width="40" height="80" fill="none" stroke="#ffffff" strokeWidth="2" />
        <rect x="605" y="485" width="15" height="30" fill="none" stroke="#ffffff" strokeWidth="2" />
        
        <text x="500" y="395" fill="#15803d" fontSize="12" fontWeight="extrabold" textAnchor="middle" className="tracking-widest">
          SALT LAKE STADIUM (HYBK)
        </text>

        {/* Blocks */}
        {SALT_LAKE_BLOCKS.map(block => {
          let effEnd = block.endAngle;
          if (block.startAngle > block.endAngle) effEnd += 360;
          const pathD = describeEllipticalArc(500, 500, block.rxIn, block.ryIn, block.rxOut, block.ryOut, block.startAngle, effEnd);
          
          const midAngle = (block.startAngle + effEnd) / 2;
          const midRx = (block.rxIn + block.rxOut) / 2;
          const midRy = (block.ryIn + block.ryOut) / 2;
          const labelPos = polarToElliptical(500, 500, midRx, midRy, midAngle);
          
          const isHovered = hoveredBlock?.id === block.id;

          return (
            <g 
              key={block.id}
              onMouseEnter={() => setHoveredBlock(block)}
              onMouseLeave={() => setHoveredBlock(null)}
              onClick={() => onBlockSelect(`${block.stand} - ${block.name}`, block.price, midAngle)}
              className="cursor-pointer transition-all duration-300 origin-center"
              style={{
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: '50% 50%'
              }}
            >
              <path 
                d={pathD} 
                fill={isHovered ? '#fde047' : block.color} 
                stroke="#ffffff" 
                strokeWidth="2"
                className="transition-all duration-300"
                style={{
                  filter: isHovered ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none'
                }}
              />
              <text 
                x={labelPos.x} 
                y={labelPos.y} 
                fill="#1e293b" 
                fontSize={block.rxOut - block.rxIn > 140 ? "9" : "8"} 
                fontWeight="800" 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="pointer-events-none font-sans"
                transform={`rotate(${midAngle > 180 ? midAngle + 90 : midAngle - 90} ${labelPos.x} ${labelPos.y})`}
              >
                {block.id.startsWith('A2_') || block.id === 'VVIP' || block.id === 'VIP_BOX_B' ? block.name.split(' ').pop() : block.name}
              </text>
            </g>
          );
        })}

        {/* Labels outside */}
        {directionLabels.map(lbl => {
          const pos = polarToElliptical(500, 500, lbl.rx, lbl.ry, lbl.angle);
          return (
            <text
              key={lbl.name}
              x={pos.x}
              y={pos.y}
              fill="#475569"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${lbl.angle > 180 ? lbl.angle + 90 : lbl.angle - 90} ${pos.x} ${pos.y})`}
              className="opacity-95 font-sans tracking-wide"
            >
              {lbl.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
