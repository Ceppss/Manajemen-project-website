import DonutChart from "../../components/DonutChart";
import { overviewDonuts } from "../../data/mockData";

const legendGroups = {
  status: [
    { label: "Not Started", color: "#D9D9D9" },
    { label: "On going", color: "#F5A623" },
    { label: "Finished", color: "#2FBF71" },
    { label: "Overdue", color: "#EB5757" },
  ],
  review: [
    { label: "Reviewed", color: "#F5A623" },
    { label: "Aproved", color: "#2FBF71" },
    { label: "Revision", color: "#EB5757" },
  ],
};

function OverviewCard({ title, segments, legend }) {
  return (
    <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-card">
      <h3 className="mb-6 text-center text-base font-bold text-navy">{title}</h3>
      <div className="flex items-center justify-center gap-8">
        <DonutChart segments={segments} size={180} strokeWidth={20} />
        <ul className="space-y-2">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SummaryView() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <OverviewCard title="Project Overview" segments={overviewDonuts.project} legend={legendGroups.status} />
      <OverviewCard title="Assignment Overview" segments={overviewDonuts.assignment} legend={legendGroups.status} />
      <OverviewCard title="Project Report" segments={overviewDonuts.report} legend={legendGroups.review} />
    </div>
  );
}