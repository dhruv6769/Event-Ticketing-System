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

const WANKHEDE_BLOCKS: BlockData[] = [];

function generateBlocks(
  standName: string, prefix: string, 
  labels: string[], 
  startDeg: number, endDeg: number, 
  rIn: number, rOut: number, 
  color: string, price: number
) {
  const count = labels.length;
  const step = (endDeg - startDeg) / count;
  labels.forEach((label, i) => {
    WANKHEDE_BLOCKS.push({
      id: `${prefix}${label}`,
      name: `Block ${label.replace('W1', '').replace('W2', '').replace('W3', '')}`, // hide W labels
      stand: standName,
      startAngle: startDeg + i * step,
      endAngle: startDeg + (i + 1) * step,
      rIn,
      rOut,
      color,
      price
    });
  });
}

// Exact Colors from User Image
const CYAN = '#38bdf8';
const TEAL = '#5eead4';
const PINK = '#f472b6';
const PEACH = '#fdba74';
const PURPLE = '#c084fc';
const WHITE = '#e5e7eb'; // Off-white for contrast

// 🟢 NORTH STAND (-5 to 45)
generateBlocks('North Stand', 'NS_T1_W_', ['W','X'], -5, 20, 180, 240, WHITE, 2000);
generateBlocks('North Stand', 'NS_T1_C_', ['Y'], 20, 45, 180, 240, CYAN, 2500);
generateBlocks('North Stand', 'NS_T2_', ['W1','W2'], -5, 45, 240, 300, WHITE, 2000);
generateBlocks('North Stand', 'NS_T3_W_', ['W3'], -5, 15, 300, 380, WHITE, 2000);
generateBlocks('North Stand', 'NS_T3_C_', ['M','L'], 15, 45, 300, 380, CYAN, 3000);
generateBlocks('North Stand', 'NS_T4_C_', ['G','H'], -5, 15, 380, 480, CYAN, 2500);
generateBlocks('North Stand', 'NS_T4_P_', ['I','J','K'], 15, 45, 380, 480, PINK, 3500);

// 🔵 SUNIL GAVASKAR STAND (50 to 105)
generateBlocks('Sunil Gavaskar Stand', 'SG_I_', ['L','K','J','I','H','G'], 50, 105, 180, 340, WHITE, 2000);
generateBlocks('Sunil Gavaskar Stand', 'SG_O_', ['A','B','C','D','E','F'], 50, 105, 340, 480, CYAN, 2500);

// 🟡 VITHAL DIVECHA STAND (110 to 135)
generateBlocks('Vithal Divecha Stand', 'VD_I_', ['F','E','D'], 110, 135, 180, 340, WHITE, 2000);
generateBlocks('Vithal Divecha Stand', 'VD_O_', ['A','B','C'], 110, 135, 340, 480, WHITE, 2000);

// ⬜ MCA STAND (140 to 160)
generateBlocks('MCA Stand', 'MCA_', ['M','L','K','J'], 140, 160, 180, 380, WHITE, 2000);

// 🔴 GRAND STAND (165 to 195)
generateBlocks('Grand Stand', 'GS_', ['L1'], 165, 195, 180, 255, WHITE, 3000);
generateBlocks('Grand Stand', 'GS_', ['L2'], 165, 195, 255, 330, WHITE, 3000);
generateBlocks('Grand Stand', 'GS_', ['L3'], 165, 195, 330, 405, WHITE, 3000);
generateBlocks('Grand Stand', 'GS_', ['L4'], 165, 195, 405, 480, PEACH, 5000);

// 🟣 GARWARE STAND (200 to 240)
generateBlocks('Garware Stand', 'GW_I_', ['K','J','I'], 200, 240, 180, 280, PURPLE, 4000);
generateBlocks('Garware Stand', 'GW_M_', ['E','F','G','H'], 200, 240, 280, 380, WHITE, 2500);
generateBlocks('Garware Stand', 'GW_O_', ['D','C','B','A'], 200, 240, 380, 480, CYAN, 3000);

// 🟢 VIJAY MERCHANT STAND (245 to 280)
generateBlocks('Vijay Merchant Stand', 'VM_I_', ['L','K','J','I','H','G','F'], 245, 280, 180, 280, WHITE, 2500);
generateBlocks('Vijay Merchant Stand', 'VM_M_', ['K','J','I','H'], 245, 280, 280, 380, TEAL, 3500);
generateBlocks('Vijay Merchant Stand', 'VM_O_', ['E','D','C','B','A'], 245, 280, 380, 480, CYAN, 3000);

// 🟠 SACHIN TENDULKAR STAND (285 to 355)
generateBlocks('Sachin Tendulkar Stand', 'ST_T1_', ['Q','R','S','T','U','V'], 285, 355, 180, 240, CYAN, 4000);
generateBlocks('Sachin Tendulkar Stand', 'ST_T2_', ['W1','W2','W3'], 285, 355, 240, 300, WHITE, 2500);
generateBlocks('Sachin Tendulkar Stand', 'ST_T3_', ['P','O','N'], 285, 355, 300, 380, PEACH, 5000);
generateBlocks('Sachin Tendulkar Stand', 'ST_T4_', ['A','B','C','D','E','F'], 285, 355, 380, 480, PINK, 6000);


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

export default function WankhedeStadium({ onBlockSelect }: Props) {
  const [hoveredBlock, setHoveredBlock] = useState<BlockData | null>(null);

  const stands = [
    { name: "GRAND STAND", angle: 180 },
    { name: "GARWARE STAND", angle: 220 },
    { name: "VIJAY MERCHANT STAND", angle: 262 },
    { name: "SACHIN TENDULKAR STAND", angle: 320 },
    { name: "NORTH STAND", angle: 20 },
    { name: "SUNIL GAVASKAR STAND", angle: 77 },
    { name: "VITHAL DIVECHA STAND", angle: 122 },
    { name: "MCA STAND", angle: 150 },
  ];

  return (
    <div className="relative w-full max-w-[800px] aspect-square flex items-center justify-center">
      {hoveredBlock && (
        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur border border-blue-500 p-4 rounded-xl z-50 pointer-events-none shadow-2xl">
          <p className="text-2xl font-heading text-blue-400">{hoveredBlock.name.replace('Block ', '') !== '' ? hoveredBlock.name : hoveredBlock.stand}</p>
          <p className="text-sm font-medium text-gray-300">{hoveredBlock.stand}</p>
          <p className="text-xl font-bold text-white mt-2">₹{hoveredBlock.price}</p>
        </div>
      )}

      <svg viewBox="-50 -50 1100 1100" className="w-full h-full drop-shadow-2xl">
        {/* Soft white background to match image */}
        <rect x="-50" y="-50" width="1100" height="1100" fill="#f8fafc" rx="40" />

        {/* Pitch */}
        <circle cx="500" cy="500" r="160" fill="#d9f99d" />
        <rect x="492" y="460" width="16" height="80" fill="#fef08a" opacity="0.9" rx="2" stroke="#d97706" strokeWidth="1" />
        <text x="500" y="500" fill="#a3e635" fontSize="16" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform="rotate(90 500 500)" className="tracking-[0.5em]">
          PITCH
        </text>

        {/* Blocks */}
        {WANKHEDE_BLOCKS.map(block => {
          let effEnd = block.endAngle;
          if (block.startAngle > block.endAngle) effEnd += 360;
          const pathD = describeArc(500, 500, block.rIn, block.rOut, block.startAngle, effEnd);
          
          const midAngle = (block.startAngle + effEnd) / 2;
          const midRadius = (block.rIn + block.rOut) / 2;
          const labelPos = polarToCartesian(500, 500, midRadius, midAngle);
          
          const isHovered = hoveredBlock?.id === block.id;
          let label = block.id.split('_').pop() || '';
          if (label.startsWith('W')) label = ''; // Hide W labels visually

          return (
            <g 
              key={block.id}
              onMouseEnter={() => setHoveredBlock(block)}
              onMouseLeave={() => setHoveredBlock(null)}
              onClick={() => onBlockSelect(block.name.replace('Block ', '') !== '' ? `${block.stand} - ${block.name}` : block.stand, block.price, midAngle)}
              className="cursor-pointer transition-all duration-300 origin-center"
              style={{
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: '50% 50%'
              }}
            >
              <path 
                d={pathD} 
                fill={block.color} 
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
                fill="#000000" 
                fontSize={block.rOut - block.rIn > 80 ? "16" : "13"} 
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

        {/* Stand Name Labels (Placed Outside the Stadium) */}
        {stands.map(stand => {
          const pos = polarToCartesian(500, 500, 510, stand.angle);
          return (
            <text
              key={stand.name}
              x={pos.x}
              y={pos.y}
              fill="#334155"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${stand.angle > 180 ? stand.angle + 90 : stand.angle - 90} ${pos.x} ${pos.y})`}
              className="opacity-90 font-serif tracking-widest"
            >
              {stand.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
