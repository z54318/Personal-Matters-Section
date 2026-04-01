import { useCallback, useEffect, useMemo, useState } from "react";
import { todoApi } from "../services/todo-api";
import type {
  Todo,
  TodoFilter,
  TodoPriority,
  TodoSort,
  TodoStats,
  TodoStatus,
} from "../model/todo.types";

type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  tone: "success" | "error";
};

const DEFAULT_PAGE_SIZE = 8;

const EMPTY_STATS: TodoStats = {
  total: 0,
  pending: 0,
  completed: 0,
  archived: 0,
};

function normalizeTagInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function stringifyTags(tags: string[]) {
  return tags.join(", ");
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>(EMPTY_STATS);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [newTodo, setNewTodo] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editTagInput, setEditTagInput] = useState("");

  const [activeFilter, setActiveFilter] = useState<TodoFilter>("all");
  const [sortBy, setSortBy] = useState<TodoSort>("updated_desc");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [updatingPriorityId, setUpdatingPriorityId] = useState<number | null>(null);
  const [updatingArchiveId, setUpdatingArchiveId] = useState<number | null>(null);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: "",
    description: "",
    tone: "success",
  });

  const showToast = useCallback(
    (nextToast: Omit<ToastState, "open">) => {
      setToast({
        open: true,
        ...nextToast,
      });
    },
    []
  );

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const buildQuery = useCallback(
    (overrides?: Partial<{ page: number; status: TodoFilter; keyword: string; sort: TodoSort }>) => ({
      page: overrides?.page ?? page,
      pageSize,
      status: overrides?.status ?? activeFilter,
      keyword: overrides?.keyword ?? appliedKeyword,
      sort: overrides?.sort ?? sortBy,
    }),
    [activeFilter, appliedKeyword, page, pageSize, sortBy]
  );

  const fetchTodos = useCallback(
    async (overrides?: Partial<{ page: number; status: TodoFilter; keyword: string; sort: TodoSort }>) => {
      setIsLoading(true);

      try {
        const query = buildQuery(overrides);
        const response = await todoApi.fetchTodos(query);

        setTodos(response.items);
        setStats(response.stats);
        setTotal(response.total);
        setPage(response.page);
        setTotalPages(response.totalPages);

        if (overrides?.status !== undefined) {
          setActiveFilter(overrides.status);
        }

        if (overrides?.keyword !== undefined) {
          setAppliedKeyword(overrides.keyword);
        }

        if (overrides?.sort !== undefined) {
          setSortBy(overrides.sort);
        }
      } catch (error) {
        showToast({
          title: "获取事项失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [buildQuery, showToast]
  );

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const createTodo = useCallback(async () => {
    const text = newTodo.trim();
    const tags = normalizeTagInput(newTagInput);

    if (!text) {
      showToast({
        title: "请先输入事项内容",
        description: "内容不能为空。",
        tone: "error",
      });
      return;
    }

    try {
      await todoApi.createTodo({ text, tags });
      setNewTodo("");
      setNewTagInput("");
      await fetchTodos({ page: 1 });
      showToast({
        title: "新增成功",
        description: "事项已经加入当前列表。",
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: "新增失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        tone: "error",
      });
    }
  }, [fetchTodos, newTagInput, newTodo, showToast]);

  const startEditTodo = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditTagInput(stringifyTags(todo.tags));
  }, []);

  const cancelEditTodo = useCallback(() => {
    setEditingId(null);
    setEditText("");
    setEditTagInput("");
  }, []);

  const saveEditTodo = useCallback(
    async (todoId: number) => {
      const text = editText.trim();
      const tags = normalizeTagInput(editTagInput);

      if (!text) {
        showToast({
          title: "请先输入事项内容",
          description: "编辑时内容不能为空。",
          tone: "error",
        });
        return;
      }

      try {
        await todoApi.updateTodo(todoId, { text, tags });
        cancelEditTodo();
        await fetchTodos();
        showToast({
          title: "保存成功",
          description: "事项内容已经更新。",
          tone: "success",
        });
      } catch (error) {
        showToast({
          title: "更新失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      }
    },
    [cancelEditTodo, editTagInput, editText, fetchTodos, showToast]
  );

  const deleteTodo = useCallback(
    async (todoId: number) => {
      setDeletingTodoId(todoId);

      try {
        await todoApi.deleteTodo(todoId);
        await fetchTodos();
        showToast({
          title: "删除成功",
          description: "事项已经移出当前空间。",
          tone: "success",
        });
      } catch (error) {
        showToast({
          title: "删除失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      } finally {
        setDeletingTodoId(null);
      }
    },
    [fetchTodos, showToast]
  );

  const clearCompletedTodos = useCallback(
    async (keyword?: string) => {
      setIsClearingCompleted(true);

      try {
        const response = await todoApi.clearCompletedTodos(keyword || appliedKeyword);
        await fetchTodos({ page: 1 });
        showToast({
          title: "清理完成",
          description:
            response.deletedCount > 0
              ? `已清除 ${response.deletedCount} 条已完成事项。`
              : "当前没有可清理的已完成事项。",
          tone: "success",
        });
      } catch (error) {
        showToast({
          title: "清理失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      } finally {
        setIsClearingCompleted(false);
      }
    },
    [appliedKeyword, fetchTodos, showToast]
  );

  const changeTodoStatus = useCallback(
    async (todoId: number, status: TodoStatus) => {
      setUpdatingStatusId(todoId);

      try {
        await todoApi.updateTodo(todoId, { status });
        await fetchTodos();
      } catch (error) {
        showToast({
          title: "状态更新失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [fetchTodos, showToast]
  );

  const changeTodoPriority = useCallback(
    async (todoId: number, priority: TodoPriority) => {
      setUpdatingPriorityId(todoId);

      try {
        await todoApi.updateTodo(todoId, { priority });
        await fetchTodos();
      } catch (error) {
        showToast({
          title: "优先级更新失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      } finally {
        setUpdatingPriorityId(null);
      }
    },
    [fetchTodos, showToast]
  );

  const changeTodoArchive = useCallback(
    async (todo: Todo, archived: boolean) => {
      setUpdatingArchiveId(todo.id);

      try {
        await todoApi.updateTodo(todo.id, { archived });
        await fetchTodos({ page: 1 });
        showToast({
          title: archived ? "已归档事项" : "已恢复事项",
          description: archived
            ? "这条事项已移入归档列表。"
            : "事项已恢复到当前列表。",
          tone: "success",
        });
      } catch (error) {
        showToast({
          title: archived ? "归档失败" : "恢复失败",
          description: error instanceof Error ? error.message : "请稍后重试",
          tone: "error",
        });
      } finally {
        setUpdatingArchiveId(null);
      }
    },
    [fetchTodos, showToast]
  );

  const applyFilter = useCallback(
    async (status: TodoFilter, keyword?: string) => {
      await fetchTodos({
        status,
        keyword: keyword ?? appliedKeyword,
        page: 1,
      });
    },
    [appliedKeyword, fetchTodos]
  );

  const applySearch = useCallback(
    async (keyword: string) => {
      await fetchTodos({
        keyword: keyword.trim(),
        page: 1,
      });
    },
    [fetchTodos]
  );

  const applySort = useCallback(
    async (sort: TodoSort) => {
      await fetchTodos({
        sort,
        page: 1,
      });
    },
    [fetchTodos]
  );

  const changePage = useCallback(
    async (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
        return;
      }

      await fetchTodos({ page: nextPage });
    },
    [fetchTodos, page, totalPages]
  );

  const hasArchivedItems = useMemo(() => stats.archived > 0, [stats.archived]);
  const hasCompletedItems = useMemo(() => stats.completed > 0, [stats.completed]);

  return {
    todos,
    stats,
    total,
    page,
    pageSize,
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
  };
}
