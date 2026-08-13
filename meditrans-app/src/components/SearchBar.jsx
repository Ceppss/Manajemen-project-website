import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { tasks, reports, requests } from "../data/mockData";

const SOURCES = [
  { list: tasks, type: "Assignment", to: "/assignment" },
  { list: reports, type: "Report", to: "/report" },
  { list: requests, type: "Request", to: "/request" },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const results =
    query.trim().length === 0
      ? []
      : SOURCES.flatMap(({ list, type, to }) =>
          list
            .filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()))
            .map((item) => ({ id: `${type}-${item.id}`, title: item.title, type, to }))
        ).slice(0, 8);

  function handleSelect(result) {
    setQuery("");
    setOpen(false);
    navigate(result.to);
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative max-w-sm flex-1">
      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Bar"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
        />
        {query && (
          <button onClick={handleClear} aria-label="Clear search" className="shrink-0 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full min-w-[280px] rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">Tidak ada hasil untuk "{query}"</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onMouseDown={() => handleSelect(r)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                  >
                    <span className="truncate text-gray-700">{r.title}</span>
                    <span className="ml-3 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {r.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}