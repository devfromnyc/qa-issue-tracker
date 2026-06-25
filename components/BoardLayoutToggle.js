"use client";

const LAYOUTS = [
  { id: "kanban", label: "Kanban columns" },
  { id: "accordion", label: "Accordion tabs" },
];

export default function BoardLayoutToggle({ layout, onLayoutChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2">
      <span className="px-2 text-xs font-medium text-slate-400">Board layout</span>
      {LAYOUTS.map((option) => {
        const active = layout === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onLayoutChange(option.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { LAYOUTS };
