import type { TodoFilter, TodoStats } from "../model/todo.types";

type TodoStatsPanelProps = {
  stats: TodoStats;
  activeFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
};

const cards: Array<{
  key: keyof TodoStats;
  filter: TodoFilter;
  label: string;
  tone: string;
  activeTone: string;
}> = [
  {
    key: "total",
    filter: "all",
    label: "当前事项",
    tone: "bg-white text-slate-900",
    activeTone: "bg-slate-900 text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)]",
  },
  {
    key: "pending",
    filter: "pending",
    label: "待处理",
    tone: "bg-cyan-50 text-cyan-700",
    activeTone: "bg-cyan-100 text-cyan-800 shadow-[0_16px_36px_rgba(8,145,178,0.16)]",
  },
  {
    key: "completed",
    filter: "done",
    label: "已完成",
    tone: "bg-emerald-50 text-emerald-700",
    activeTone: "bg-emerald-100 text-emerald-800 shadow-[0_16px_36px_rgba(5,150,105,0.16)]",
  },
  {
    key: "archived",
    filter: "archived",
    label: "已归档",
    tone: "bg-slate-100 text-slate-600",
    activeTone: "bg-slate-200 text-slate-800 shadow-[0_16px_36px_rgba(100,116,139,0.18)]",
  },
];

export function TodoStatsPanel({
  stats,
  activeFilter,
  onFilterChange,
}: TodoStatsPanelProps) {
  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isActive = activeFilter === card.filter;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterChange(card.filter)}
            className={`rounded-5 px-4 py-4 text-left shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] transition-all duration-200 hover:-translate-y-0.5 ${
              isActive ? card.activeTone : card.tone
            }`}
          >
            <p className="m-0 text-sm font-medium opacity-75">{card.label}</p>
            <p className="mt-2 text-3xl font-800">{stats[card.key]}</p>
          </button>
        );
      })}
    </section>
  );
}
