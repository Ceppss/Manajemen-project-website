import { NavLink } from "react-router-dom";

export default function Tabs({ tabs }) {
  return (
    <div className="mb-6 flex gap-8 border-b border-gray-200">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            `relative pb-3 text-sm font-semibold transition-colors ${
              isActive ? "text-navy" : "text-gray-800/70 hover:text-navy"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-blue-500" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}