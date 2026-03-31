import { Badge, DropdownMenu, Text } from "@radix-ui/themes";
import type { Todo, TodoPriority, TodoStatus } from "../model/todo.types";
import {
  getTodoPriorityMeta,
  normalizeTodoPriority,
  todoPriorityOptions,
} from "../model/todo-priority";
import {
  getTodoStatusMeta,
  normalizeTodoStatus,
  todoStatusOptions,
} from "../model/todo-status";

type EmptyState = {
  title: string;
  description: string;
};

type TodoListProps = {
  todos: Todo[];
  editingId: number | null;
  editText: string;
  editTagText: string;
  isLoading: boolean;
  deletingTodoId: number | null;
  updatingStatusId: number | null;
  updatingPriorityId: number | null;
  emptyState: EmptyState;
  onEditTextChange: (value: string) => void;
  onEditTagChange: (value: string) => void;
  onStartEdit: (todo: Todo) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number) => void;
  onRequestDelete: (todo: Todo) => void;
  onChangeStatus: (todo: Todo, status: TodoStatus) => void;
  onChangePriority: (todo: Todo, priority: TodoPriority) => void;
};

// 统一格式化后端返回的日期时间。
function formatDateTime(value?: string | null) {
  if (!value) return "";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsedDate);
}

// 在首屏加载时渲染骨架，减少空白等待感。
function TodoListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-4 border border-slate-200 bg-white px-4 py-3"
        >
          <span className="mt-2 h-2.5 w-2.5 animate-pulse rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-18 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-18 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-14 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-14 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 渲染事项列表、编辑态和状态/优先级切换菜单。
export function TodoList({
  todos,
  editingId,
  editText,
  editTagText,
  isLoading,
  deletingTodoId,
  updatingStatusId,
  updatingPriorityId,
  emptyState,
  onEditTextChange,
  onEditTagChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRequestDelete,
  onChangeStatus,
  onChangePriority,
}: TodoListProps) {
  if (isLoading && todos.length === 0) {
    return <TodoListSkeleton />;
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-4 border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="m-0 text-base font-semibold text-slate-700">
          {emptyState.title}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {emptyState.description}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`transition-opacity duration-200 ${isLoading ? "opacity-70" : "opacity-100"}`}
    >
      <ul className="m-0 list-none space-y-3 p-0">
        {todos.map((todo) => {
          const tags = todo.tags ?? [];
          const status = getTodoStatusMeta(todo, editingId);
          const priority = getTodoPriorityMeta(todo.priority);
          const normalizedStatus = normalizeTodoStatus(todo.status);
          const normalizedPriority = normalizeTodoPriority(todo.priority);
          const createTimeText = formatDateTime(todo.create_time);
          const updateTimeText = formatDateTime(todo.update_time);
          const completeTimeText = formatDateTime(todo.complete_time);
          const shouldShowUpdateTime =
            updateTimeText &&
            updateTimeText !== createTimeText &&
            updateTimeText !== completeTimeText;

          return (
            <li
              key={todo.id}
              className="group flex items-start gap-3 rounded-4 border border-slate-200 bg-white px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50/35"
            >
              <span
                className={`mt-2 h-2.5 w-2.5 rounded-full ${
                  normalizedStatus === "done" ? "bg-emerald-500" : "bg-cyan-500"
                }`}
              />

              {editingId === todo.id ? (
                <>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(event) => onEditTextChange(event.target.value)}
                      className="field-base h-10 w-full px-3 py-2 text-sm"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onSaveEdit(todo.id);
                        }

                        if (event.key === "Escape") {
                          onCancelEdit();
                        }
                      }}
                    />

                    <input
                      type="text"
                      value={editTagText}
                      onChange={(event) => onEditTagChange(event.target.value)}
                      placeholder="标签用逗号分隔，例如：学习, 生活"
                      className="field-base h-10 w-full px-3 py-2 text-sm"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onSaveEdit(todo.id);
                        }

                        if (event.key === "Escape") {
                          onCancelEdit();
                        }
                      }}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Badge color={status.color} variant="soft" radius="full">
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {createTimeText ? <span>创建于 {createTimeText}</span> : null}
                      {shouldShowUpdateTime ? (
                        <span>更新于 {updateTimeText}</span>
                      ) : null}
                      {completeTimeText ? (
                        <span>完成于 {completeTimeText}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex self-center items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSaveEdit(todo.id)}
                      className="appearance-none rounded-full border-0 bg-slate-900 px-3 py-1 text-xs font-medium text-white outline-none shadow-none transition-colors duration-200 hover:bg-cyan-600"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="appearance-none rounded-full border-0 bg-white px-3 py-1 text-xs font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(100,116,139)] transition-colors duration-200 hover:bg-white hover:text-slate-700"
                    >
                      取消
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div
                      className={`truncate text-[15px] ${
                        normalizedStatus === "done"
                          ? "text-slate-400"
                          : "text-slate-700"
                      }`}
                    >
                      {todo.text}
                    </div>

                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={`${todo.id}-${tag}`}
                            color="gray"
                            variant="surface"
                            radius="full"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {createTimeText ? <span>创建于 {createTimeText}</span> : null}
                      {shouldShowUpdateTime ? (
                        <span>更新于 {updateTimeText}</span>
                      ) : null}
                      {completeTimeText ? (
                        <span>完成于 {completeTimeText}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex self-center items-center gap-2">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <button
                          type="button"
                          disabled={updatingPriorityId === todo.id}
                          className="appearance-none inline-flex items-center gap-1 rounded-full border-0 bg-transparent p-0 outline-none shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Badge
                            color={priority.color}
                            variant="soft"
                            radius="full"
                            className="shrink-0 cursor-pointer"
                          >
                            {updatingPriorityId === todo.id ? "更新中..." : priority.label}
                          </Badge>
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content
                        align="center"
                        sideOffset={10}
                        className="min-w-36 rounded-4 border-0 bg-white/98 p-1 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
                      >
                        {todoPriorityOptions.map((option) => {
                          const isCurrent = normalizedPriority === option.value;

                          return (
                            <DropdownMenu.Item
                              key={option.value}
                              disabled={isCurrent || updatingPriorityId === todo.id}
                              onSelect={() => onChangePriority(todo, option.value)}
                              className="rounded-3 px-3 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-cyan-50 data-[highlighted]:text-slate-900 data-[disabled]:opacity-50"
                            >
                              <div className="flex w-full items-center justify-between gap-3">
                                <Text as="span" size="2">
                                  {option.label}
                                </Text>
                                {isCurrent ? (
                                  <span className="text-xs text-slate-400">当前</span>
                                ) : null}
                              </div>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <button
                          type="button"
                          disabled={updatingStatusId === todo.id}
                          className="appearance-none inline-flex items-center gap-1 rounded-full border-0 bg-transparent p-0 outline-none shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Badge
                            color={status.color}
                            variant="soft"
                            radius="full"
                            className="shrink-0 cursor-pointer"
                          >
                            {updatingStatusId === todo.id ? "更新中..." : status.label}
                          </Badge>
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content
                        align="center"
                        sideOffset={10}
                        className="min-w-36 rounded-4 border-0 bg-white/98 p-1 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
                      >
                        {todoStatusOptions.map((option) => {
                          const isCurrent = normalizedStatus === option.value;

                          return (
                            <DropdownMenu.Item
                              key={option.value}
                              disabled={isCurrent || updatingStatusId === todo.id}
                              onSelect={() => onChangeStatus(todo, option.value)}
                              className="rounded-3 px-3 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-cyan-50 data-[highlighted]:text-slate-900 data-[disabled]:opacity-50"
                            >
                              <div className="flex w-full items-center justify-between gap-3">
                                <Text as="span" size="2">
                                  {option.label}
                                </Text>
                                {isCurrent ? (
                                  <span className="text-xs text-slate-400">当前</span>
                                ) : null}
                              </div>
                            </DropdownMenu.Item>
                          );
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>

                  <div className="flex self-center items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartEdit(todo)}
                      className="appearance-none rounded-full border-0 bg-white px-3 py-1 text-xs font-medium tracking-wide text-slate-600 outline-none shadow-[inset_0_0_0_1px_rgb(100,116,139)] transition-colors duration-200 hover:bg-white hover:text-slate-800"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(todo)}
                      disabled={deletingTodoId === todo.id}
                      className="appearance-none rounded-full border-0 bg-white px-3 py-1 text-xs font-medium tracking-wide text-rose-500 outline-none shadow-[inset_0_0_0_1px_rgb(100,116,139)] transition-colors duration-200 hover:bg-white hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingTodoId === todo.id ? "删除中..." : "删除"}
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
