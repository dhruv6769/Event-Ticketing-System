import { useState } from 'react';

interface BlockData {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  rIn: number;
  rOut: number;
  color: string;
  price: number;
  slices: number;
  sliceLabels?: string[];
  customColors?: (string | null)[];
  isGallery?: boolean;
}

// Exactly matched quadrant-based geometry
const NMS_BLOCKS: BlockData[] = [
  // INNER RING (190 to 340)
  { id: 'E', name: 'BLOCK E', startAngle: 2, endAngle: 37, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 7, customColors: ['#f1f5f9', '#f1f5f9', '#ffb347', '#ffb347', '#ffb347', '#f1f5f9', '#f1f5f9'], sliceLabels: ['1', '2', '3', '4', '5', '6', '7'] },
  { id: 'F', name: 'BLOCK F', startAngle: 40, endAngle: 65, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  { id: 'G', name: 'BLOCK G', startAngle: 68, endAngle: 114.8, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 9, sliceLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'H', name: 'BLOCK H', startAngle: 117.8, endAngle: 147.8, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  
  { id: 'SPE', name: 'SOUTH PREMIUM EAST', startAngle: 152.8, endAngle: 177, rIn: 190, rOut: 340, color: '#ffb347', price: 8000, slices: 5, customColors: ['#f1f5f9', '#f1f5f9', '#f1f5f9', '#ffb347', '#ffb347'], sliceLabels: ['5', '1', '2', '3', '4'] },
  { id: 'SPC', name: 'SOUTH PREMIUM CENTRE', startAngle: 177, endAngle: 196.3, rIn: 190, rOut: 340, color: '#f1f5f9', price: 12000, slices: 4, sliceLabels: ['1', '2', '3', '4'] },
  { id: 'SPW', name: 'SOUTH PREMIUM WEST', startAngle: 196.3, endAngle: 215.8, rIn: 190, rOut: 340, color: '#ffb347', price: 8000, slices: 4, customColors: ['#ffb347', '#ffb347', '#ffb347', '#f1f5f9'], sliceLabels: ['1', '2', '3', '4'] },
  
  { id: 'A', name: 'BLOCK A', startAngle: 220.8, endAngle: 250.8, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  { id: 'B', name: 'BLOCK B', startAngle: 253.8, endAngle: 274.6, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 4, sliceLabels: ['1', '2', '3', '4'] },
  { id: 'C_right', name: 'BLOCK C', startAngle: 279.8, endAngle: 300.6, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 4, sliceLabels: ['6', '7', '8', '9'] },
  { id: 'C_left', name: 'BLOCK C', startAngle: 304, endAngle: 329, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  { id: 'D', name: 'BLOCK D', startAngle: 333, endAngle: 358, rIn: 190, rOut: 340, color: '#ffb347', price: 3500, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },

  // OUTER RING (345 to 470)
  { id: 'N', name: 'BLOCK N', startAngle: 2, endAngle: 37, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 7, sliceLabels: ['1', '2', '3', '4', '5', '6', '7'] },
  { id: 'P', name: 'BLOCK P', startAngle: 40, endAngle: 65, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  { id: 'Q', name: 'BLOCK Q', startAngle: 68, endAngle: 114.8, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 9, sliceLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'R', name: 'BLOCK R', startAngle: 117.8, endAngle: 147.8, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  
  { id: 'PG', name: 'PRESIDENT GALLERY', startAngle: 152.8, endAngle: 215.8, rIn: 345, rOut: 470, color: '#f1f5f9', price: 10000, slices: 9, isGallery: true, customColors: [null, null, null, null, '#fbcfe8', '#fbcfe8', '#fbcfe8', null, '#fbcfe8'], sliceLabels: ['BAY 1', 'BAY 2', 'BAY 3', 'BAY 4', 'BAY 5', 'BAY 6', 'BAY 7', 'BAY 8', 'BAY 9'] },
  
  { id: 'J', name: 'BLOCK J', startAngle: 220.8, endAngle: 250.8, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  { id: 'K', name: 'BLOCK K', startAngle: 253.8, endAngle: 300.6, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 9, sliceLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'L', name: 'BLOCK L', startAngle: 304, endAngle: 329, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] },
  { id: 'M', name: 'BLOCK M', startAngle: 333, endAngle: 358, rIn: 345, rOut: 470, color: '#bfe6f8', price: 1800, slices: 5, sliceLabels: ['1', '2', '3', '4', '5'] }
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  let effectiveEnd = endAngle;
  if (startAngle > effectiveEnd) effectiveEnd += 360;
  
  const startOuter = polarToCartesian(x, y, outerRadius, effectiveEnd);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, effectiveEnd);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = effectiveEnd - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

function describeTextArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  let effEnd = endAngle;
  if (startAngle > effEnd) effEnd += 360;
  const midAngle = (startAngle + effEnd) / 2 % 360;
  const isBottom = midAngle > 90 && midAngle < 270;
  
  if (isBottom) {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, effEnd);
    const largeArcFlag = effEnd - startAngle <= 180 ? "0" : "1";
    return `M ${end.x} ${end.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${start.x} ${start.y}`;
  } else {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, effEnd);
    const largeArcFlag = effEnd - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }
}

// Helper to stagger multi-line text blocks correctly (e.g. South Premium)
function renderStaggeredText(text: string, pos: {x: number, y: number}, angle: number) {
  let rot = angle - 90;
  if (angle > 90 && angle < 270) rot += 180;
  const parts = text.split(' ');
  return (
    <text x={pos.x} y={pos.y} fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform={`rotate(${rot}, ${pos.x}, ${pos.y})`} className="pointer-events-none">
      {parts.map((part, idx) => (
        <tspan x={pos.x} dy={idx === 0 ? `-${(parts.length - 1) * 6}px` : '12px'} key={idx}>{part}</tspan>
      ))}
    </text>
  );
}

interface Props {
  onBlockSelect: (blockName: string, price: number, angle: number) => void;
}

export default function NarendraModiStadium({ onBlockSelect }: Props) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  
  const suite4Slices = 38;
  const s4Width = 80 / suite4Slices;
  
  return (
    <div className="relative w-full max-w-[1000px] aspect-square flex items-center justify-center p-4 bg-[#f8f9fa] rounded-2xl overflow-hidden shadow-inner">
      
      {/* Tooltip */}
      {hoveredSlice && (
        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur border border-[var(--color-brand)] p-4 rounded-xl z-50 pointer-events-none shadow-2xl">
          <p className="text-xl font-heading text-[var(--color-gold)]">{hoveredSlice.split('|')[0]}</p>
          {hoveredSlice.split('|')[1] && <p className="text-sm font-bold text-gray-300">Section: {hoveredSlice.split('|')[1]}</p>}
          <p className="text-sm font-bold text-white mt-1">Price: ₹{hoveredSlice.split('|')[2]}</p>
        </div>
      )}

      <svg viewBox="0 0 1000 1100" className="w-full h-full drop-shadow-xl font-sans">
        
        {/* Stadium Clean White Canvas Base */}
        <circle cx="500" cy="500" r="540" fill="#f8f9fa" />

        {/* Pitch Outfield */}
        <circle cx="500" cy="500" r="185" fill="#aed581" />
        
        {/* Pitch Inner Striped Grass */}
        <clipPath id="pitch-clip">
          <circle cx="500" cy="500" r="140" />
        </clipPath>
        <g clipPath="url(#pitch-clip)">
          <rect x="360" y="360" width="280" height="40" fill="#c5e1a5" />
          <rect x="360" y="400" width="280" height="40" fill="#b1d88a" />
          <rect x="360" y="440" width="280" height="40" fill="#c5e1a5" />
          <rect x="360" y="480" width="280" height="40" fill="#b1d88a" />
          <rect x="360" y="520" width="280" height="40" fill="#c5e1a5" />
          <rect x="360" y="560" width="280" height="40" fill="#b1d88a" />
          <rect x="360" y="600" width="280" height="40" fill="#c5e1a5" />
        </g>
        
        {/* Pitch Rectangle Center */}
        <rect x="490" y="460" width="20" height="80" fill="#f5f5dc" rx="2" />
        
        {/* Huge Gujarat Titans Logo watermark matching original exactly */}
        <g opacity="0.25" transform="translate(500, 500) scale(2.5)">
          <path d="M 0 -35 L 50 35 L -50 35 Z" fill="#ffffff" />
          <text x="0" y="5" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle" className="tracking-tighter">GUJARAT</text>
          <text x="0" y="24" fill="#ffffff" fontSize="20" fontWeight="900" textAnchor="middle" className="tracking-widest">TITANS</text>
        </g>
        
        {/* Pitch Direction Markers */}
        <text x="500" y="335" fill="#1a1a2e" fontSize="14" fontWeight="bold" textAnchor="middle">N</text>
        <text x="500" y="665" fill="#1a1a2e" fontSize="14" fontWeight="bold" textAnchor="middle">S</text>
        <text x="665" y="500" fill="#1a1a2e" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">E</text>
        <text x="335" y="500" fill="#1a1a2e" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">W</text>
        <text x="615" y="385" fill="#1a1a2e" fontSize="12" fontWeight="bold" textAnchor="middle">NE</text>
        <text x="615" y="615" fill="#1a1a2e" fontSize="12" fontWeight="bold" textAnchor="middle">SE</text>
        <text x="385" y="385" fill="#1a1a2e" fontSize="12" fontWeight="bold" textAnchor="middle">NW</text>
        <text x="385" y="615" fill="#1a1a2e" fontSize="12" fontWeight="bold" textAnchor="middle">SW</text>

        {/* Dugouts (Black polygons placed perfectly inside pitch edge gaps) */}
        <g>
          <path d={describeArc(500, 500, 170, 185, 145, 156)} fill="#1f2937" />
          <path id="dugout-away" d={describeTextArc(500, 500, 177, 145, 156)} fill="none" />
          <text fontSize="5" fill="#ffffff" fontWeight="bold">
            <textPath href="#dugout-away" startOffset="50%" textAnchor="middle" alignmentBaseline="middle">AWAY TEAM</textPath>
          </text>
          
          <path d={describeArc(500, 500, 170, 185, 205, 216)} fill="#1f2937" />
          <path id="dugout-home" d={describeTextArc(500, 500, 177, 205, 216)} fill="none" />
          <text fontSize="5" fill="#ffffff" fontWeight="bold">
            <textPath href="#dugout-home" startOffset="50%" textAnchor="middle" alignmentBaseline="middle">HOME TEAM</textPath>
          </text>
        </g>

        {/* Pink Corporate Box Label */}
        <g>
          <path d={describeArc(500, 500, 342, 354, 10, 35)} fill="#ffb6c1" />
          <path id="corp-box" d={describeTextArc(500, 500, 348, 10, 35)} fill="none" />
          <text fontSize="8" fill="#000000" fontWeight="bold">
            <textPath href="#corp-box" startOffset="50%" textAnchor="middle" alignmentBaseline="middle">NORTH CORPORATE BOX</textPath>
          </text>
        </g>

        {/* Blocks & Slices */}
        {NMS_BLOCKS.map(block => {
          let effEnd = block.endAngle;
          if (block.startAngle > effEnd) effEnd += 360;
          const sliceWidth = (effEnd - block.startAngle) / block.slices;
          const isOuter = block.rIn > 200;
          
          // Outer names at outer edge, inner names at inner edge.
          const textRadius = isOuter ? block.rOut - 30 : block.rOut - 30; 
          const textPathD = describeTextArc(500, 500, textRadius, block.startAngle, block.endAngle);
          
          const isSouthPremium = block.id.startsWith('SP');

          return (
            <g key={block.id}>
              {/* Slices */}
              {Array.from({ length: block.slices }).map((_, i) => {
                const sAngle = block.startAngle + i * sliceWidth;
                const eAngle = sAngle + sliceWidth;
                const sliceColor = block.isGallery ? block.color : (block.customColors ? block.customColors[i] : block.color);
                const labelBgColor = block.isGallery && block.customColors ? block.customColors[i] : null;
                const sliceLabel = block.sliceLabels ? block.sliceLabels[i] : '';
                const sliceMidAngle = sAngle + sliceWidth / 2;
                
                const hoverId = `${block.name}|${sliceLabel}|${block.price}`;
                const isHovered = hoveredSlice === hoverId;

                // Numbers: outer blocks at inner edge, inner blocks at inner edge
                const numRadius = isOuter ? block.rIn + 15 : block.rIn + 20;
                const numPos = polarToCartesian(500, 500, numRadius, sliceMidAngle);
                
                let numRot = sliceMidAngle - 90;
                if (sliceMidAngle > 90 && sliceMidAngle < 270) numRot += 180;

                return (
                  <g 
                    key={`${block.id}-${i}`}
                    onMouseEnter={() => setHoveredSlice(hoverId)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    onClick={() => onBlockSelect(`${block.name} - Bay ${sliceLabel}`, block.price, sliceMidAngle)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <path 
                      d={describeArc(500, 500, block.rIn, block.rOut, sAngle, eAngle)} 
                      fill={sliceColor ?? undefined}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      style={{ filter: isHovered ? 'brightness(1.1) drop-shadow(0 0 5px rgba(0,0,0,0.3))' : 'none' }}
                    />
                    
                    {/* Pink backdrop for President Gallery text (BAY 9, BAY 7, etc) */}
                    {labelBgColor && (
                      <path 
                        d={describeArc(500, 500, numRadius - 10, numRadius + 10, sAngle + 0.5, eAngle - 0.5)} 
                        fill={labelBgColor} 
                        className="pointer-events-none"
                      />
                    )}
                    
                    {sliceLabel && (
                      <text 
                        x={numPos.x} 
                        y={numPos.y} 
                        fill="#000000" 
                        fontSize="12" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        alignmentBaseline="middle"
                        transform={`rotate(${numRot}, ${numPos.x}, ${numPos.y})`}
                        className="pointer-events-none"
                      >
                        {sliceLabel}
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Block Name Label */}
              {block.id !== 'C_right' && (
                <g>
                  {isSouthPremium ? (
                    renderStaggeredText(block.name, polarToCartesian(500, 500, 260, (block.startAngle + effEnd) / 2), (block.startAngle + effEnd) / 2)
                  ) : (
                    <g>
                      <path id={`text-arc-${block.id}`} d={textPathD} fill="none" />
                      <text fontSize="18" fill="#000000" fontWeight="bold" className="pointer-events-none font-heading tracking-widest">
                        <textPath href={`#text-arc-${block.id}`} startOffset="50%" textAnchor="middle" alignmentBaseline="middle">
                          {block.name}
                        </textPath>
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Presidential Suites 4th Floor */}
        <g>
          {Array.from({ length: suite4Slices }).map((_, i) => {
            const s = 145 + i * s4Width;
            const e = s + s4Width - 0.3; 
            const color = (i === 1 || i === 30) ? '#c1f0c1' : (i >= 35 ? '#ffb6c1' : '#ffffff'); 
            const mid = s + s4Width / 2;
            const pos = polarToCartesian(500, 500, 482.5, mid);
            let rot = mid - 90;
            if (mid > 90 && mid < 270) rot += 180;
            return (
              <g key={`suite4-${i}`}>
                <path d={describeArc(500, 500, 475, 490, s, e)} fill={color} stroke="#e5e7eb" strokeWidth="1" />
                <text x={pos.x} y={pos.y} fill="#000000" fontSize="5" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform={`rotate(${rot}, ${pos.x}, ${pos.y})`}>
                  {301 + i}
                </text>
              </g>
            );
          })}
          <path id="presidential-arc" d={describeTextArc(500, 500, 496, 140, 230)} fill="none" />
          <text fontSize="13" fill="#000000" fontWeight="bold" className="tracking-widest pointer-events-none">
            <textPath href="#presidential-arc" startOffset="50%" textAnchor="middle" alignmentBaseline="middle">
              PRESIDENTIAL SUITES 4TH FLOOR
            </textPath>
          </text>
        </g>

        {/* Premium Suites 5th Floor */}
        <g>
          {Array.from({ length: suite4Slices }).map((_, i) => {
            const s = 140 + i * s4Width;
            const e = s + s4Width - 0.3; 
            const color = '#ffffff'; 
            const mid = s + s4Width / 2;
            const pos = polarToCartesian(500, 500, 507.5, mid);
            let rot = mid - 90;
            if (mid > 90 && mid < 270) rot += 180;
            return (
              <g key={`suite5-${i}`}>
                <path d={describeArc(500, 500, 500, 515, s, e)} fill={color} stroke="#e5e7eb" strokeWidth="1" />
                <text x={pos.x} y={pos.y} fill="#000000" fontSize="5" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform={`rotate(${rot}, ${pos.x}, ${pos.y})`}>
                  {401 + i}
                </text>
              </g>
            );
          })}
          <path id="premium-arc" d={describeTextArc(500, 500, 521, 135, 235)} fill="none" />
          <text fontSize="13" fill="#000000" fontWeight="bold" className="tracking-widest pointer-events-none">
            <textPath href="#premium-arc" startOffset="50%" textAnchor="middle" alignmentBaseline="middle">
              PREMIUM SUITES 5TH FLOOR
            </textPath>
          </text>
        </g>

      </svg>
    </div>
  );
}
