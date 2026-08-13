import { useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PRIORITY_COLOR = {
  "Not Urgent": "#2FBF71",
  Middle: "#F5A623",
  Urgent: "#EB5757",
};

const GRANULARITIES = [
  { key: "day", label: "Day" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const ROW_HEIGHT = 44;

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1);
}

// The visible window depends on the granularity: "Day" zooms tightly to the
// task dates, "Month" expands to full calendar months, "Year" expands to full
// calendar years — so each mode shows a complete, meaningful span instead of
// an arbitrary sliver.
function computeRange(granularity, rawStart, rawEnd) {
  if (granularity === "month") {
    return {
      rangeStart: new Date(rawStart.getFullYear(), 0, 1),
      rangeEnd: new Date(rawEnd.getFullYear() + 1, 0, 1),
    };
  }
  if (granularity === "year") {
    return {
      rangeStart: startOfYear(rawStart),
      rangeEnd: new Date(rawEnd.getFullYear() + 10, 0, 1),
    };
  }
  return {
    rangeStart: new Date(rawStart.getTime() - 2 * DAY_MS),
    rangeEnd: new Date(rawEnd.getTime() + 2 * DAY_MS),
  };
}

function buildColumns(granularity, rangeStart, rangeEnd) {
  const columns = [];

  function pushClipped(start, next, label) {
    const clippedStart = start < rangeStart ? rangeStart : start;
    const clippedEnd = next > rangeEnd ? rangeEnd : next;
    if (clippedEnd > clippedStart) {
      columns.push({ start: clippedStart, end: clippedEnd, label });
    }
  }

  if (granularity === "day") {
    let cursor = startOfDay(rangeStart);
    while (cursor < rangeEnd) {
      const next = new Date(cursor.getTime() + DAY_MS);
      pushClipped(cursor, next, `${cursor.getDate()}`);
      cursor = next;
    }
  } else if (granularity === "month") {
    let cursor = startOfMonth(rangeStart);
    while (cursor < rangeEnd) {
      const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      pushClipped(cursor, next, `${MONTH_SHORT[cursor.getMonth()]} ${cursor.getFullYear()}`);
      cursor = next;
    }
  } else {
    let cursor = startOfYear(rangeStart);
    while (cursor < rangeEnd) {
      const next = new Date(cursor.getFullYear() + 1, 0, 1);
      pushClipped(cursor, next, `${cursor.getFullYear()}`);
      cursor = next;
    }
  }
  return columns;
}

export default function GanttChart({ tasks }) {
  const [granularity, setGranularity] = useState("month");

  const starts = tasks.map((t) => new Date(t.startDate));
  const ends = tasks.map((t) => new Date(t.endDate));
  const rawStart = new Date(Math.min(...starts));
  const rawEnd = new Date(Math.max(...ends));

  const { rangeStart, rangeEnd } = computeRange(granularity, rawStart, rawEnd);
  const totalMs = rangeEnd - rangeStart;

  const columns = buildColumns(granularity, rangeStart, rangeEnd);
  const minColumnWidth = granularity === "day" ? 36 : granularity === "month" ? 110 : 140;
  const trackWidth = Math.max(columns.length * minColumnWidth, 500);

  function pct(date) {
    return ((date - rangeStart) / totalMs) * 100;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-navy">Timeline</h3>
        <div className="flex rounded-lg border border-gray-200 p-1">
          {GRANULARITIES.map((g) => (
            <button
              key={g.key}
              onClick={() => setGranularity(g.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                granularity === g.key ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="w-40 shrink-0 pr-3">
          <div style={{ height: 28 }} />
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center truncate text-xs font-semibold text-gray-600"
              style={{ height: ROW_HEIGHT }}
              title={t.title}
            >
              {t.title}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div style={{ width: trackWidth }}>
            <div className="flex border-b border-gray-200" style={{ height: 28 }}>
              {columns.map((col, i) => (
                <div
                  key={i}
                  className="flex shrink-0 items-center justify-center border-l border-gray-100 text-[11px] font-semibold text-gray-400 first:border-l-0"
                  style={{ width: `${((col.end - col.start) / totalMs) * trackWidth}px` }}
                >
                  {col.label}
                </div>
              ))}
            </div>

            {tasks.map((t) => {
              const left = pct(new Date(t.startDate));
              const width = Math.max(pct(new Date(t.endDate)) - left, 1.5);
              return (
                <div key={t.id} className="relative flex items-center" style={{ height: ROW_HEIGHT }}>
                  <div className="relative h-2.5 w-full rounded-full bg-gray-50">
                    <div
                      title={`${t.title}: ${t.startDate} — ${t.endDate}`}
                      className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: PRIORITY_COLOR[t.priority] || "#D9D9D9",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-3">
        {Object.entries(PRIORITY_COLOR).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}