import { DropdownMenu } from "@radix-ui/themes";
import { formatAbsoluteDateTime } from "../../../lib/time";
import {
  getTodoPriorityClasses,
  getTodoPriorityLabel,
  todoPriorityOptions,
} from "../model/todo-priority";
import {
  getTodoStatusClasses,
  getTodoStatusLabel,
  todoFilterOptions,
} from "../model/todo-status";
import type { Todo, TodoPriority, TodoStatus } from "../model/todo.types";

type TodoListProps = {
  todos: Todo[];
  editingId: number | null;
  editText: string;
  editTagInput: string;
  isLoading: boolean;
  deletingTodoId: number | null;
  updatingStatusId: number | null;
  updatingPriorityId: number | null;
  updatingArchiveId: number | null;
  emptyState: string;
  onEditTextChange: (value: string) => void;
  onEditTagChange: (value: string) => void;
  onStartEdit: (todo: Todo) => void;
  onCancelEdit: () => void;
  onSaveEdit: (todoId: number) => void;
  onRequestDelete: (todo: Todo) => void;
  onChangeStatus: (todoId: number, status: TodoStatus) => void;
  onChangePriority: (todoId: number, priority: TodoPriority) => void;
  onChangeArchived: (todo: Todo, archived: boolean) => void;
};

function TodoListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-5 bg-slate-50/90 px-5 py-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]"
        >
          <div className="h-5 w-1/3 rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-100" />
          <div className="mt-5 flex gap-3">
            <div className="h-9 w-24 rounded-full bg-slate-100" />
            <div className="h-9 w-24 rounded-full bg-slate-100" />
            <div className="h-9 w-20 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getActionBadgeClasses(baseClasses: string, disabled = false) {
  return `inline-flex items-center rounded-full border-0 px-4 py-2 text-sm font-medium outline-none shadow-[inset_0_0_0_1px_rgba(148,163,184,0.32)] transition-all duration-200 ${
    disabled
      ? `${baseClasses} cursor-not-allowed opacity-55`
      : `${baseClasses} cursor-pointer hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.32),0_10px_24px_rgba(15,23,42,0.08)]`
  }`;
}

type SelectionMenuProps = {
  currentLabel: string;
  currentClasses: string;
  disabled?: boolean;
  widthClass?: string;
  loadingLabel?: string;
  options: Array<{
    value: string;
    label: string;
    selected: boolean;
    hoverClasses: string;
    onSelect: () => void;
  }>;
};

function SelectionMenu({
  currentLabel,
  currentClasses,
  disabled = false,
  widthClass = "min-w-[176px]",
  loadingLabel,
  options,
}: SelectionMenuProps) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={getActionBadgeClasses(currentClasses, true)}
      >
        {loadingLabel ?? currentLabel}
      </button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button
          type="button"
          className={getActionBadgeClasses(currentClasses)}
        >
          {currentLabel}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        className={`${widthClass} rounded-4 border-0 bg-white/98 p-1 shadow-[0_18px_48px_rgba(15,23,42,0.16)]`}
      >
        {options.map((option) => (
          <DropdownMenu.Item
            key={option.value}
            onSelect={option.onSelect}
            disabled={option.selected}
            className={`rounded-3 px-3 py-2 text-sm ${
              option.selected
                ? "bg-slate-100 text-slate-400"
                : `text-slate-600 ${option.hoverClasses}`
            }`}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <span>{option.label}</span>
              {option.selected ? (
                <span className="text-xs text-slate-400">当前</span>
              ) : null}
            </span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export function TodoList({
  todos,
  editingId,
  editText,
  editTagInput,
  isLoading,
  deletingTodoId,
  updatingStatusId,
  updatingPriorityId,
  updatingArchiveId,
  emptyState,
  onEditTextChange,
  onEditTagChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRequestDelete,
  onChangeStatus,
  onChangePriority,
  onChangeArchived,
}: TodoListProps) {
  if (isLoading && todos.length === 0) {
    return <TodoListSkeleton />;
  }

  if (!todos.length) {
    return (
      <div className="rounded-5 bg-slate-50/90 px-5 py-10 text-center text-sm text-slate-500 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => {
        const isEditing = editingId === todo.id;
        const isArchived = todo.archived;

        return (
          <article
            key={todo.id}
            className={`rounded-5 px-5 py-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] transition-colors duration-200 ${
              isArchived ? "bg-slate-50/80" : "bg-white"
            }`}
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                {!isEditing ? (
                  <div className="flex items-start gap-4">
                    <span
                      className={`mt-2 h-4 w-4 shrink-0 rounded-full ${
                        todo.status === "done"
                          ? "bg-emerald-500"
                          : isArchived
                            ? "bg-slate-400"
                            : "bg-cyan-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <h3
                        className={`m-0 break-all text-2xl font-700 ${
                          isArchived ? "text-slate-400" : "text-slate-700"
                        }`}
                      >
                        {todo.text}
                      </h3>

                      {todo.tags.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {todo.tags.map((tag) => (
                            <span
                              key={`${todo.id}-${tag}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.65)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                        <span>创建于 {formatAbsoluteDateTime(todo.create_time)}</span>
                        <span>更新于 {formatAbsoluteDateTime(todo.update_time)}</span>
                        {todo.complete_time ? (
                          <span>完成于 {formatAbsoluteDateTime(todo.complete_time)}</span>
                        ) : null}
                        {todo.archive_time ? (
                          <span>归档于 {formatAbsoluteDateTime(todo.archive_time)}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editText}
                      onChange={(event) => onEditTextChange(event.target.value)}
                      className="field-base"
                    />
                    <input
                      type="text"
                      value={editTagInput}
                      onChange={(event) => onEditTagChange(event.target.value)}
                      placeholder="标签使用逗号分隔，例如：学习, 生活"
                      className="field-base"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onSaveEdit(todo.id)}
                        className="btn-primary"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 xl:max-w-[520px] xl:justify-end">
                <SelectionMenu
                  currentLabel={
                    updatingPriorityId === todo.id
                      ? "处理中..."
                      : getTodoPriorityLabel(todo.priority)
                  }
                  currentClasses={getTodoPriorityClasses(todo.priority)}
                  disabled={updatingPriorityId === todo.id}
                  options={todoPriorityOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                    selected: option.value === todo.priority,
                    hoverClasses: "hover:bg-amber-50 hover:text-amber-700",
                    onSelect: () => onChangePriority(todo.id, option.value),
                  }))}
                />

                <SelectionMenu
                  currentLabel={
                    updatingStatusId === todo.id
                      ? "处理中..."
                      : getTodoStatusLabel(todo.status)
                  }
                  currentClasses={getTodoStatusClasses(todo.status)}
                  disabled={updatingStatusId === todo.id || isArchived}
                  options={todoFilterOptions
                    .filter((option) => option.value === "pending" || option.value === "done")
                    .map((option) => ({
                      value: option.value,
                      label: option.label,
                      selected: option.value === todo.status,
                      hoverClasses: "hover:bg-cyan-50 hover:text-cyan-700",
                      onSelect: () => onChangeStatus(todo.id, option.value as TodoStatus),
                    }))}
                />

                <button
                  type="button"
                  onClick={() => onChangeArchived(todo, !isArchived)}
                  disabled={updatingArchiveId === todo.id}
                  className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingArchiveId === todo.id
                    ? "处理中..."
                    : isArchived
                      ? "恢复"
                      : "归档"}
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => onStartEdit(todo)}
                    disabled={isArchived}
                    className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    编辑
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => onRequestDelete(todo)}
                  disabled={deletingTodoId === todo.id}
                  className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-rose-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingTodoId === todo.id ? "删除中..." : "删除"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
