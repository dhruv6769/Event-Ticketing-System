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

const KOCHI_BLOCKS: BlockData[] = [];

const addBlock = (
  id: string, name: string, stand: string,
  start: number, end: number,
  rxIn: number, ryIn: number, rxOut: number, ryOut: number,
  color: string, price: number
) => {
  KOCHI_BLOCKS.push({ id, name, stand, startAngle: start, endAngle: end, rxIn, ryIn, rxOut, ryOut, color, price });
};

// --- OUTER RING (GALLERIES) ---
// North Gallery (315 to 45)
addBlock('NORTH_GALLERY', 'NORTH GALLERY', 'Galleries', 315, 360 + 45, 325, 265, 470, 390, '#fdba74', 240); // Peach
// East Gallery (45 to 135)
addBlock('EAST_GALLERY', 'EAST GALLERY', 'Galleries', 45, 135, 325, 265, 470, 390, '#fdba74', 300);
// South Gallery (135 to 225)
addBlock('SOUTH_GALLERY', 'SOUTH GALLERY', 'Galleries', 135, 225, 325, 265, 470, 390, '#fdba74', 240);
// West Gallery (225 to 315)
addBlock('WEST_GALLERY', 'WEST GALLERY', 'Galleries', 225, 315, 325, 265, 470, 390, '#fdba74', 300);

// --- INNER RING (BLOCKS & VIP) ---
// Block B (Top, North, 315 to 45)
addBlock('BLOCK_B', 'BLOCK B', 'Inner Blocks', 315, 360 + 45, 200, 150, 320, 260, '#bae6fd', 390); // Light Blue
// Block C (Right, East, 45 to 135)
addBlock('BLOCK_C', 'BLOCK C', 'Inner Blocks', 45, 135, 200, 150, 320, 260, '#bae6fd', 490);
// Block D (Bottom, South, 135 to 225)
addBlock('BLOCK_D', 'BLOCK D', 'Inner Blocks', 135, 225, 200, 150, 320, 260, '#bae6fd', 390);

// West Side subdivisions (225 to 315)
// Block E (Bottom-Left, 225 to 255)
addBlock('BLOCK_E', 'BLOCK E', 'Inner Blocks', 225, 255, 200, 150, 320, 260, '#bae6fd', 490);
// VIP Section (Left, 255 to 275)
addBlock('VIP', 'VIP', 'VIP Zone', 255, 275, 200, 150, 320, 260, '#86efac', 2000); // Light Green
// Owner's Box (Left-Center, 275 to 285)
addBlock('OWNER_BOX', 'OWNERS BOX', 'VIP Zone', 275, 285, 200, 150, 320, 260, '#fbcfe8', 5000); // Pink
// Block 4 (Top-Left, 285 to 315)
addBlock('BLOCK_4', 'BLOCK 4', 'Inner Blocks', 285, 315, 200, 150, 320, 260, '#bae6fd', 490);


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

export default function JawaharlalNehruKochiStadium({ onBlockSelect }: Props) {
  const [hoveredBlock, setHoveredBlock] = useState<BlockData | null>(null);

  const directionLabels = [
    { name: "NORTH GALLERY", angle: 0, rx: 500, ry: 410 },
    { name: "EAST GALLERY", angle: 90, rx: 500, ry: 410 },
    { name: "SOUTH GALLERY", angle: 180, rx: 500, ry: 410 },
    { name: "WEST GALLERY", angle: 270, rx: 500, ry: 410 }
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
        <line x1="500" y1="420" x2="500" y2="580" stroke="#ffffff" strokeWidth="2" />
        <circle cx="500" cy="500" r="30" fill="none" stroke="#ffffff" strokeWidth="2" />
        <circle cx="500" cy="500" r="2" fill="#ffffff" />
        <rect x="380" y="460" width="40" height="80" fill="none" stroke="#ffffff" strokeWidth="2" />
        <rect x="380" y="485" width="15" height="30" fill="none" stroke="#ffffff" strokeWidth="2" />
        <rect x="580" y="460" width="40" height="80" fill="none" stroke="#ffffff" strokeWidth="2" />
        <rect x="605" y="485" width="15" height="30" fill="none" stroke="#ffffff" strokeWidth="2" />
        
        <text x="500" y="395" fill="#15803d" fontSize="12" fontWeight="extrabold" textAnchor="middle" className="tracking-widest">
          JLN STADIUM (KOCHI)
        </text>

        {/* Blocks */}
        {KOCHI_BLOCKS.map(block => {
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
                {block.name}
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
