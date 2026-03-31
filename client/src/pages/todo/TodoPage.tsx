import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ToastMessage } from "../../components/feedback/ToastMessage";
import type { Todo } from "./model/todo.types";
import { TodoComposer } from "./components/TodoComposer";
import { TodoList } from "./components/TodoList";
import { TodoToolbar } from "./components/TodoToolbar";
import { useTodos } from "./hooks/useTodos";

export function TodoPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    todos,
    newTodo,
    newTagInput,
    setNewTodo,
    setNewTagInput,
    editingId,
    editText,
    editTagInput,
    setEditText,
    setEditTagInput,
    isLoading,
    page,
    total,
    totalPages,
    deletingTodoId,
    isClearingCompleted,
    updatingStatusId,
    updatingPriorityId,
    activeFilter,
    appliedKeyword,
    handleAddTodo,
    deleteTodo,
    clearCompletedTodos,
    startEditTodo,
    cancelEditTodo,
    saveEditTodo,
    changeTodoStatus,
    changeTodoPriority,
    changePage,
    applyFilter,
    applySearch,
    toast,
    closeToast,
  } = useTodos();

  const [searchTerm, setSearchTerm] = useState(appliedKeyword);
  const [pendingDeleteTodo, setPendingDeleteTodo] = useState<Todo | null>(null);
  const [confirmClearCompleted, setConfirmClearCompleted] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    setSearchTerm(appliedKeyword);
  }, [appliedKeyword]);

  const hasCompletedTodo = todos.some((todo) => todo.status === "done");

  // 根据当前筛选条件生成更贴近场景的空状态文案。
  const emptyState = useMemo(() => {
    const keyword = appliedKeyword.trim();
    const filterLabelMap = {
      pending: "待处理",
      done: "已完成",
    } as const;

    if (keyword && activeFilter !== "all") {
      return {
        title: `没有找到匹配内容的${filterLabelMap[activeFilter]}事项`,
        description: "试试更换关键字，或者切换到其他状态看看。",
      };
    }

    if (keyword) {
      return {
        title: `没有找到包含“${keyword}”的事项`,
        description: "可以试试更短的关键字，或者清空搜索重新查看全部事项。",
      };
    }

    if (activeFilter !== "all") {
      return {
        title: `当前没有${filterLabelMap[activeFilter]}事项`,
        description: "换个筛选看看，或者先新增一条事项。",
      };
    }

    return {
      title: "还没有任何事项",
      description: "先添加一条试试，列表会在这里慢慢充实起来。",
    };
  }, [activeFilter, appliedKeyword]);

  // 确认删除当前选中的事项。
  const confirmDeleteTodo = async () => {
    if (!pendingDeleteTodo) return;

    try {
      await deleteTodo(pendingDeleteTodo.id);
      setPendingDeleteTodo(null);
    } catch (error) {
      console.error(error);
    }
  };

  // 确认清理当前范围内的已完成事项。
  const confirmClearCompletedTodos = async () => {
    try {
      await clearCompletedTodos(searchTerm);
      setConfirmClearCompleted(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 确认退出当前账号，并跳回登录页。
  const confirmLogoutAction = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login", { replace: true });
  };

  const deleteDescription = pendingDeleteTodo
    ? `删除后将无法恢复。“${pendingDeleteTodo.text}”会从当前列表中移除。`
    : "删除后将无法恢复，该事项会从当前列表中移除。";

  return (
    <main className="min-h-screen px-4 py-10 text-slate-800 sm:px-6">
      <ToastMessage
        open={toast.open}
        title={toast.title}
        description={toast.description}
        tone={toast.tone}
        onClose={closeToast}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteTodo)}
        title="确认删除该事项？"
        description={deleteDescription}
        confirmText="确认删除"
        loading={deletingTodoId === pendingDeleteTodo?.id}
        onConfirm={confirmDeleteTodo}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteTodo(null);
          }
        }}
      />

      <ConfirmDialog
        open={confirmClearCompleted}
        title="确认清除已完成事项？"
        description="这会移除当前筛选范围内的所有已完成事项，删除后将无法恢复。"
        confirmText="确认清除"
        loading={isClearingCompleted}
        onConfirm={confirmClearCompletedTodos}
        onOpenChange={setConfirmClearCompleted}
      />

      <ConfirmDialog
        open={confirmLogout}
        title="确认退出登录？"
        description="退出后会返回登录页，当前浏览器中的登录状态也会被清除。"
        confirmText="确认退出"
        onConfirm={confirmLogoutAction}
        onOpenChange={setConfirmLogout}
      />

      <section className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
              个人事项空间
            </p>
            <h1 className="m-0 text-4xl font-800 tracking-tight text-slate-900 sm:text-5xl">
              Todo List
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start rounded-full bg-white/85 px-4 py-2 shadow-[0_10px_25px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
            <span className="text-sm text-slate-500">
              当前用户：
              <span className="ml-1 font-semibold text-slate-700">
                {user?.username || "未登录"}
              </span>
            </span>

            <button
              type="button"
              onClick={() => navigate("/change-password")}
              className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-600 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-800"
            >
              修改密码
            </button>

            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="appearance-none rounded-full border-0 bg-slate-900 px-4 py-2 text-sm font-medium text-white outline-none shadow-none transition-colors duration-200 hover:bg-cyan-600"
            >
              退出登录
            </button>
          </div>
        </div>

        <div className="card-surface">
          <TodoComposer
            value={newTodo}
            tagValue={newTagInput}
            onChange={setNewTodo}
            onTagChange={setNewTagInput}
            onSubmit={handleAddTodo}
          />

          <TodoToolbar
            searchTerm={searchTerm}
            activeFilter={activeFilter}
            onSearchChange={setSearchTerm}
            onSearchSubmit={() => {
              void applySearch(searchTerm);
            }}
            onSearchClear={() => {
              setSearchTerm("");
              void applySearch("");
            }}
            onFilterChange={(value) => {
              void applyFilter(value, searchTerm);
            }}
          />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="m-0 text-lg font-700 text-slate-900">事项总览</h2>
              {isLoading ? (
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                  加载中...
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              {hasCompletedTodo ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearCompleted(true)}
                  disabled={isClearingCompleted}
                  className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-600 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isClearingCompleted ? "清理中..." : "清除当前已完成"}
                </button>
              ) : null}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                共 {total} 项
              </span>
            </div>
          </div>

          <TodoList
            todos={todos}
            editingId={editingId}
            editText={editText}
            editTagText={editTagInput}
            isLoading={isLoading}
            deletingTodoId={deletingTodoId}
            updatingStatusId={updatingStatusId}
            updatingPriorityId={updatingPriorityId}
            emptyState={emptyState}
            onEditTextChange={setEditText}
            onEditTagChange={setEditTagInput}
            onStartEdit={startEditTodo}
            onCancelEdit={cancelEditTodo}
            onSaveEdit={saveEditTodo}
            onRequestDelete={setPendingDeleteTodo}
            onChangeStatus={changeTodoStatus}
            onChangePriority={changeTodoPriority}
          />

          {totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-end gap-3">
              <span className="text-sm text-slate-500">
                第 {page} / {totalPages} 页
              </span>
              <button
                type="button"
                onClick={() => {
                  void changePage(page - 1);
                }}
                disabled={page <= 1 || isLoading}
                className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-600 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                上一页
              </button>
              <button
                type="button"
                onClick={() => {
                  void changePage(page + 1);
                }}
                disabled={page >= totalPages || isLoading}
                className="appearance-none rounded-full border-0 bg-slate-900 px-4 py-2 text-sm font-medium text-white outline-none shadow-none transition-colors duration-200 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                下一页
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
