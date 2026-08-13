import { useState } from "react";

const COLORS = {
  gray: "#D9D9D9",
  amber: "#F5A623",
  emerald: "#2FBF71",
  red: "#EB5757",
};

/**
 * segments: [{ value, color, label }] where color is a key of COLORS, values sum to 100.
 * Hovering a segment highlights it and shows "label · value%" in the donut's hollow center.
 */
export default function DonutChart({ segments, size = 200, strokeWidth = 22 }) {
  const [hovered, setHovered] = useState(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  const active = hovered !== null ? segments[hovered] : null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((seg, i) => {
            const dash = (seg.value / 100) * circumference;
            const gap = circumference - dash;
            const isDimmed = hovered !== null && hovered !== i;
            const circle = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={COLORS[seg.color] || seg.color}
                strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsetAcc}
                strokeLinecap="butt"
                opacity={isDimmed ? 0.35 : 1}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
            offsetAcc += dash;
            return circle;
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {active ? (
          <>
            <span className="text-xl font-extrabold text-navy">{active.value}%</span>
            <span className="mt-0.5 max-w-[70%] text-[11px] font-semibold text-gray-500">
              {active.label}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}