import { todoFilterOptions } from "../model/todo-status";
import type { TodoFilter, TodoSort } from "../model/todo.types";

type TodoToolbarProps = {
  searchTerm: string;
  activeFilter: TodoFilter;
  sortBy: TodoSort;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onFilterChange: (filter: TodoFilter) => void;
  onSortChange: (sort: TodoSort) => void;
};

const sortOptions: Array<{ value: TodoSort; label: string }> = [
  { value: "updated_desc", label: "最近更新" },
  { value: "created_desc", label: "最新创建" },
  { value: "created_asc", label: "最早创建" },
  { value: "priority_desc", label: "优先级优先" },
];

export function TodoToolbar({
  searchTerm,
  activeFilter,
  sortBy,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onFilterChange,
  onSortChange,
}: TodoToolbarProps) {
  return (
    <div className="mb-6 rounded-5 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="按事项内容或标签搜索..."
              className="field-base min-w-0 flex-1"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearchSubmit();
                }
              }}
            />
            <div className="flex gap-3">
              <button type="button" onClick={onSearchSubmit} className="btn-primary">
                搜索
              </button>
              {searchTerm ? (
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

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-500" htmlFor="todo-sort">
              排序
            </label>
            <select
              id="todo-sort"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as TodoSort)}
              className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm text-slate-600 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {todoFilterOptions.map((option) => {
            const active = option.value === activeFilter;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                className={
                  active
                    ? "btn-primary"
                    : "appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
