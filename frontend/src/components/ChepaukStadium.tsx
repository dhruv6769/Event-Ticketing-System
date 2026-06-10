import { useState } from 'react';

interface BlockData {
  id: string;
  name: string;
  stand: string;
  startAngle: number;
  endAngle: number;
  rIn: number;
  rOut: number;
  color: string;
  price: number;
}

const CHEPAUK_BLOCKS: BlockData[] = [];

const sectors = [
  { prefix: 'G', label: 'ETIHAD AIRWAYS - G', start: 343.6, end: 376.3, lowerName: 'G LOWER', hospName: 'G HOSPITALITY BOX', upperName: 'G UPPER' },
  { prefix: 'F', label: 'ETIHAD AIRWAYS - F', start: 16.3, end: 49.1, lowerName: 'F LOWER', hospName: 'F HOSPITALITY BOX', upperName: 'F UPPER' },
  { prefix: 'E', label: 'BRITISH EMPIRE - E', start: 49.1, end: 81.8, lowerName: 'E LOWER', hospName: 'E HOSPITALITY BOX', upperName: 'E UPPER' },
  { prefix: 'D', label: 'EQUITAS BANK - D', start: 81.8, end: 114.5, lowerName: 'D LOWER STAND', hospName: 'D HOSPITALITY BOX', upperName: 'D UPPER' },
  { prefix: 'C', label: 'ASTRAL PIPES - C', start: 114.5, end: 147.3, lowerName: 'C LOWER', hospName: 'C HOSPITALITY BOX', upperName: 'C UPPER' },
  { prefix: 'KMK', label: 'FEDEX - KMK', start: 147.3, end: 180, lowerName: 'KMK (LOWER)', hospName: 'KMK BOX LEVEL 3', upperName: 'KMK (TERRACE)' },
  { prefix: 'MCC', label: 'MCC', start: 180, end: 212.7, lowerName: 'MCC LOUNGE', hospName: 'MCC BOX LEVEL 3', upperName: 'MCC TERRACE' },
  { prefix: 'K', label: 'RAYZON SOLAR - K', start: 212.7, end: 245.5, lowerName: 'K LOWER', hospName: 'K HOSPITALITY BOX', upperName: 'K UPPER' },
  { prefix: 'J', label: 'ETIHAD AIRWAYS - J', start: 245.5, end: 278.2, lowerName: 'J LOWER', hospName: 'J HOSPITALITY BOX', upperName: 'J UPPER' },
  { prefix: 'I', label: 'FEDEX - I', start: 278.2, end: 310.9, lowerName: 'I LOWER', hospName: 'I HOSPITALITY BOX', upperName: 'I UPPER' },
  { prefix: 'H', label: 'GULF PRIDE - H', start: 310.9, end: 343.6, lowerName: 'H LOWER', hospName: 'H HOSPITALITY BOX', upperName: 'H UPPER' }
];

sectors.forEach(s => {
  // Lower Stand (Pink)
  CHEPAUK_BLOCKS.push({
    id: `${s.prefix}_LOWER`,
    name: s.lowerName,
    stand: s.label,
    startAngle: s.start,
    endAngle: s.end,
    rIn: 180,
    rOut: 260,
    color: '#f472b6',
    price: 1500
  });
  // Hospitality Box (Orange/Yellow)
  CHEPAUK_BLOCKS.push({
    id: `${s.prefix}_HOSP`,
    name: s.hospName,
    stand: s.label,
    startAngle: s.start,
    endAngle: s.end,
    rIn: 265,
    rOut: 320,
    color: '#fb923c',
    price: 4000
  });
  // Upper Stand (Light Blue)
  CHEPAUK_BLOCKS.push({
    id: `${s.prefix}_UPPER`,
    name: s.upperName,
    stand: s.label,
    startAngle: s.start,
    endAngle: s.end,
    rIn: 325,
    rOut: 480,
    color: '#38bdf8',
    price: 1000
  });
});

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerR, outerR, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerR, innerR, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

interface Props {
  onBlockSelect: (blockName: string, price: number, angle: number) => void;
}

export default function ChepaukStadium({ onBlockSelect }: Props) {
  const [hoveredBlock, setHoveredBlock] = useState<BlockData | null>(null);

  const labels = [
    { name: "G STAND", angle: 0 },
    { name: "F STAND", angle: 32.7 },
    { name: "E STAND", angle: 65.4 },
    { name: "D STAND", angle: 98.1 },
    { name: "C STAND", angle: 130.8 },
    { name: "KMK STAND", angle: 163.5 },
    { name: "MCC STAND", angle: 196.2 },
    { name: "K STAND", angle: 228.9 },
    { name: "J STAND", angle: 261.6 },
    { name: "I STAND", angle: 294.3 },
    { name: "H STAND", angle: 327.0 },
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

        {/* Pitch */}
        <circle cx="500" cy="500" r="160" fill="#d9f99d" />
        <rect x="492" y="460" width="16" height="80" fill="#fef08a" opacity="0.9" rx="2" stroke="#d97706" strokeWidth="1" />
        <text x="500" y="500" fill="#a3e635" fontSize="16" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform="rotate(90 500 500)" className="tracking-[0.5em]">
          CRICKET PITCH
        </text>

        {/* Blocks */}
        {CHEPAUK_BLOCKS.map(block => {
          let effEnd = block.endAngle;
          if (block.startAngle > block.endAngle) effEnd += 360;
          const pathD = describeArc(500, 500, block.rIn, block.rOut, block.startAngle, effEnd);
          
          const midAngle = (block.startAngle + effEnd) / 2;
          const midRadius = (block.rIn + block.rOut) / 2;
          const labelPos = polarToCartesian(500, 500, midRadius, midAngle);
          
          const isHovered = hoveredBlock?.id === block.id;
          const label = block.id.split('_').pop() || '';

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
                fontSize={block.rOut - block.rIn > 80 ? "11" : "9"} 
                fontWeight="700" 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="pointer-events-none font-sans"
                transform={`rotate(${midAngle > 180 ? midAngle + 90 : midAngle - 90} ${labelPos.x} ${labelPos.y})`}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Labels outside */}
        {labels.map(lbl => {
          const pos = polarToCartesian(500, 500, 510, lbl.angle);
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
