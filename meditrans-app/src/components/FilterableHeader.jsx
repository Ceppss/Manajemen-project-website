import { useState, useRef, useEffect } from "react";
import { ListFilter } from "lucide-react";

export default function FilterableHeader({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = value !== "all";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 normal-case ${isActive ? "text-navy" : ""}`}
      >
        {label}
        <ListFilter className={`h-3.5 w-3.5 ${isActive ? "text-navy" : "text-gray-400"}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => { onChange("all"); setOpen(false); }}
            className={`block w-full px-3 py-2 text-left text-xs font-semibold normal-case hover:bg-gray-50 ${
              value === "all" ? "text-navy" : "text-gray-600"
            }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-xs font-semibold normal-case hover:bg-gray-50 ${
                value === opt ? "text-navy" : "text-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}