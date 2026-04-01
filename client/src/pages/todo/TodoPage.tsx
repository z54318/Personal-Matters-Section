import { DropdownMenu } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ToastMessage } from "../../components/feedback/ToastMessage";
import { TodoComposer } from "./components/TodoComposer";
import { TodoList } from "./components/TodoList";
import { TodoStatsPanel } from "./components/TodoStatsPanel";
import { TodoToolbar } from "./components/TodoToolbar";
import { useTodos } from "./hooks/useTodos";
import type { Todo } from "./model/todo.types";

export function TodoPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDeleteTodo, setPendingDeleteTodo] = useState<Todo | null>(null);
  const [confirmClearCompleted, setConfirmClearCompleted] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const {
    todos,
    stats,
    total,
    page,
    totalPages,
    isLoading,
    newTodo,
    newTagInput,
    editingId,
    editText,
    editTagInput,
    activeFilter,
    sortBy,
    appliedKeyword,
    deletingTodoId,
    updatingStatusId,
    updatingPriorityId,
    updatingArchiveId,
    isClearingCompleted,
    toast,
    hasArchivedItems,
    hasCompletedItems,
    setNewTodo,
    setNewTagInput,
    setEditText,
    setEditTagInput,
    closeToast,
    createTodo,
    startEditTodo,
    cancelEditTodo,
    saveEditTodo,
    deleteTodo,
    clearCompletedTodos,
    changeTodoStatus,
    changeTodoPriority,
    changeTodoArchive,
    applyFilter,
    applySearch,
    applySort,
    changePage,
  } = useTodos();

  useEffect(() => {
    setSearchTerm(appliedKeyword);
  }, [appliedKeyword]);

  const displayName = user?.nickname || user?.username || "当前用户";

  const emptyState = useMemo(() => {
    if (activeFilter === "archived") {
      return appliedKeyword
        ? "没有找到符合当前搜索条件的归档事项。"
        : "还没有已归档的事项。";
    }

    if (activeFilter === "done") {
      return appliedKeyword
        ? "没有找到符合当前搜索条件的已完成事项。"
        : "还没有已完成的事项。";
    }

    if (activeFilter === "pending") {
      return appliedKeyword
        ? "没有找到符合当前搜索条件的待处理事项。"
        : "还没有待处理的事项。";
    }

    return appliedKeyword
      ? "没有找到符合当前搜索条件的事项。"
      : "还没有事项，先添加一条试试。";
  }, [activeFilter, appliedKeyword]);

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-6 bg-white/90 px-5 py-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                个人事项空间
              </p>
              <h1 className="m-0 text-4xl font-900 text-slate-900">事项总览</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                记录生活和工作里的待办、灵感与完成轨迹，把常用事项、优先级和归档状态都整理在一个地方。
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-500 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                当前用户：<span className="font-semibold text-slate-700">{displayName}</span>
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <button
                    type="button"
                    className="btn-primary whitespace-nowrap px-5"
                  >
                    账户菜单
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={() => navigate("/profile")}>
                    个人中心
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => navigate("/change-password")}>
                    修改密码
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item color="red" onSelect={() => setConfirmLogout(true)}>
                    退出登录
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>

          <TodoComposer
            value={newTodo}
            tagValue={newTagInput}
            onChange={setNewTodo}
            onTagChange={setNewTagInput}
            onSubmit={() => void createTodo()}
          />
        </div>

        <TodoToolbar
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          sortBy={sortBy}
          onSearchChange={setSearchTerm}
          onSearchSubmit={() => void applySearch(searchTerm)}
          onSearchClear={() => {
            setSearchTerm("");
            void applySearch("");
          }}
          onFilterChange={(filter) => void applyFilter(filter, searchTerm.trim())}
          onSortChange={(sort) => void applySort(sort)}
        />

        <TodoStatsPanel
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={(filter) => void applyFilter(filter, searchTerm.trim())}
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="m-0 text-2xl font-800 text-slate-900">事项列表</h2>
            <p className="mt-2 text-sm text-slate-500">
              当前展示 {todos.length} 条，累计 {total} 条事项。
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isLoading ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                正在同步...
              </span>
            ) : null}

            {hasArchivedItems ? (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                已归档 {stats.archived} 条
              </span>
            ) : null}

            {activeFilter !== "archived" && hasCompletedItems ? (
              <button
                type="button"
                onClick={() => setConfirmClearCompleted(true)}
                className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700"
              >
                清除当前已完成
              </button>
            ) : null}
          </div>
        </div>

        <TodoList
          todos={todos}
          editingId={editingId}
          editText={editText}
          editTagInput={editTagInput}
          isLoading={isLoading}
          deletingTodoId={deletingTodoId}
          updatingStatusId={updatingStatusId}
          updatingPriorityId={updatingPriorityId}
          updatingArchiveId={updatingArchiveId}
          emptyState={emptyState}
          onEditTextChange={setEditText}
          onEditTagChange={setEditTagInput}
          onStartEdit={startEditTodo}
          onCancelEdit={cancelEditTodo}
          onSaveEdit={(todoId) => void saveEditTodo(todoId)}
          onRequestDelete={setPendingDeleteTodo}
          onChangeStatus={(todoId, status) => void changeTodoStatus(todoId, status)}
          onChangePriority={(todoId, priority) => void changeTodoPriority(todoId, priority)}
          onChangeArchived={(todo, archived) => void changeTodoArchive(todo, archived)}
        />

        {totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void changePage(page - 1)}
              disabled={page <= 1}
              className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              上一页
            </button>
            <span className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-500 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              第 {page} / {totalPages} 页
            </span>
            <button
              type="button"
              onClick={() => void changePage(page + 1)}
              disabled={page >= totalPages}
              className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDeleteTodo)}
        title="确认删除这条事项？"
        description={
          pendingDeleteTodo
            ? `删除后无法恢复，“${pendingDeleteTodo.text}”会从当前空间中移除。`
            : ""
        }
        confirmText="确认删除"
        loading={Boolean(pendingDeleteTodo && deletingTodoId === pendingDeleteTodo.id)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteTodo(null);
          }
        }}
        onConfirm={async () => {
          if (!pendingDeleteTodo) {
            return;
          }

          await deleteTodo(pendingDeleteTodo.id);
          setPendingDeleteTodo(null);
        }}
      />

      <ConfirmDialog
        open={confirmClearCompleted}
        title="确认清除当前已完成事项？"
        description="这会删除当前搜索范围内所有已完成且未归档的事项。"
        confirmText="确认清除"
        loading={isClearingCompleted}
        onOpenChange={setConfirmClearCompleted}
        onConfirm={async () => {
          await clearCompletedTodos(searchTerm.trim());
          setConfirmClearCompleted(false);
        }}
      />

      <ConfirmDialog
        open={confirmLogout}
        title="确认退出登录？"
        description="退出后会返回登录页，当前本地登录状态将被清除。"
        confirmText="退出登录"
        onOpenChange={setConfirmLogout}
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />

      <ToastMessage
        open={toast.open}
        title={toast.title}
        description={toast.description}
        tone={toast.tone}
        onClose={closeToast}
      />
    </main>
  );
}
