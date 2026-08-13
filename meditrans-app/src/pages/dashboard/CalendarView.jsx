import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarTasks } from "../../data/mockData";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MAX_VISIBLE_TASKS = 2;

function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const nextDay = cells.length - (startOffset + daysInMonth) + 1;
    cells.push({ day: nextDay, currentMonth: false });
  }
  return cells;
}

export default function CalendarView() {
  const [cursor, setCursor] = useState(new Date(2026, 9, 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = buildCalendarGrid(year, month);
  const tasksByDay = calendarTasks.reduce((acc, t) => {
    (acc[t.day] ||= []).push(t);
    return acc;
  }, {});

  function shiftMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">Calendar</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => shiftMonth(-1)} className="rounded-full border border-gray-200 p-1 text-gray-500 hover:bg-gray-100" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-semibold text-navy">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => shiftMonth(1)} className="rounded-full border border-gray-200 p-1 text-gray-500 hover:bg-gray-100" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="pb-1 text-center text-xs font-semibold text-gray-400">{w}</div>
        ))}

        {cells.map((cell, i) => {
          const dayTasks = cell.currentMonth ? tasksByDay[cell.day] || [] : [];
          const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS);
          const extraCount = dayTasks.length - visibleTasks.length;

          return (
            <div
              key={i}
              className={`flex min-h-[6.5rem] flex-col items-center rounded-lg p-2 text-sm ${
                cell.currentMonth ? "bg-gray-50 text-gray-700" : "bg-transparent text-gray-300"
              }`}
            >
              <span className="font-medium">{cell.day}</span>

              {visibleTasks.length > 0 && (
                <div className="mt-1.5 flex w-full flex-col gap-1">
                  {visibleTasks.map((t, ti) => (
                    <span
                      key={ti}
                      title={t.title}
                      className="truncate rounded px-1.5 py-0.5 text-left text-[10px] font-semibold text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.title}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="text-left text-[10px] font-semibold text-gray-400">
                      +{extraCount} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}