import type { TodoFilter } from "../model/todo.types";

type TodoToolbarProps = {
  searchTerm: string;
  activeFilter: TodoFilter;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onFilterChange: (value: TodoFilter) => void;
};

const filterOptions: Array<{ label: string; value: TodoFilter }> = [
  { label: "全部", value: "all" },
  { label: "待处理", value: "pending" },
  { label: "已完成", value: "done" },
];

// 渲染搜索框和状态筛选按钮。
export function TodoToolbar({
  searchTerm,
  activeFilter,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onFilterChange,
}: TodoToolbarProps) {
  const hasKeyword = searchTerm.trim().length > 0;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-4 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="按事项内容或标签搜索..."
          className="field-base h-10 max-w-full sm:w-80"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearchSubmit}
            className="appearance-none rounded-full border-0 bg-slate-900 px-4 py-2 text-sm font-medium text-white outline-none shadow-none transition-colors duration-200 hover:bg-cyan-600"
          >
            搜索
          </button>
          {hasKeyword ? (
            <button
              type="button"
              onClick={onSearchClear}
              className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700"
            >
              清空
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`appearance-none rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors duration-200 ${
                isActive
                  ? "border-0 bg-slate-900 text-white shadow-none"
                  : "border-0 bg-white text-slate-600 shadow-[inset_0_0_0_1px_rgb(148,163,184)] hover:text-slate-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
