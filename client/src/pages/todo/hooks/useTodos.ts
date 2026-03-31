import { useEffect, useState } from "react";
import type {
  Todo,
  TodoFilter,
  TodoPriority,
  TodoStatus,
  TodoWritePayload,
} from "../model/todo.types";
import { todoApi } from "../services/todo-api";

type ToastState = {
  open: boolean;
  tone: "success" | "error";
  title: string;
  description?: string;
};

// 把输入框中的标签文本整理成去重后的标签数组。
function normalizeTagInput(value: string) {
  const tags = value
    .split(/[，,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);

  return Array.from(new Set(tags));
}

// 把标签数组还原成编辑态输入框里展示的逗号文本。
function stringifyTags(tags: string[] = []) {
  return tags.join(", ");
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editTagInput, setEditTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [updatingPriorityId, setUpdatingPriorityId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<TodoFilter>("all");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [toast, setToast] = useState<ToastState>({
    open: false,
    tone: "success",
    title: "",
  });

  // 打开轻量提示消息。
  const showToast = (nextToast: Omit<ToastState, "open">) => {
    setToast({
      open: true,
      ...nextToast,
    });
  };

  // 关闭轻量提示消息。
  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // 统一收口当前列表查询条件，方便重复请求时复用。
  const getCurrentQuery = (
    overrides?: Partial<{ status: TodoFilter; keyword: string; page: number }>
  ) => {
    const nextStatus = overrides?.status ?? activeFilter;
    const nextKeyword = overrides?.keyword ?? appliedKeyword;
    const nextPage = overrides?.page ?? page;

    return {
      status: nextStatus,
      keyword: nextKeyword,
      page: nextPage,
      pageSize,
    };
  };

  // 根据当前筛选条件拉取事项列表。
  const fetchTodos = async (
    overrides?: Partial<{ status: TodoFilter; keyword: string; page: number }>
  ) => {
    setIsLoading(true);

    try {
      const data = await todoApi.fetchTodos(getCurrentQuery(overrides));
      setTodos(
        data.items.map((item) => ({
          ...item,
          tags: item.tags ?? [],
        }))
      );
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 新增一条事项，并在成功后回到第一页查看最新结果。
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      await todoApi.createTodo({
        text: newTodo.trim(),
        tags: normalizeTagInput(newTagInput),
      });
      setNewTodo("");
      setNewTagInput("");
      await fetchTodos({ page: 1 });
      showToast({
        tone: "success",
        title: "新增成功",
        description: "事项已经添加到列表中。",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 统一更新事项文本、状态、优先级或标签。
  const updateTodo = async (id: number, payload: TodoWritePayload) => {
    try {
      await todoApi.updateTodo(id, payload);
      await fetchTodos();
    } catch (error) {
      console.error(error);
      showToast({
        tone: "error",
        title: "更新失败",
        description: "请稍后重试或检查后端接口状态。",
      });
      throw error;
    }
  };

  // 删除单条事项，并在成功后刷新当前列表。
  const deleteTodo = async (id: number) => {
    setDeletingTodoId(id);

    try {
      await todoApi.deleteTodo(id);
      await fetchTodos();
      showToast({
        tone: "success",
        title: "删除成功",
        description: "该事项已从列表中移除。",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingTodoId(null);
    }
  };

  // 批量清理当前搜索范围内的已完成事项。
  const clearCompletedTodos = async (keyword = appliedKeyword) => {
    setIsClearingCompleted(true);

    try {
      const result = await todoApi.clearCompletedTodos(keyword);
      await fetchTodos({ keyword: keyword.trim() });
      showToast({
        tone: "success",
        title: "清理完成",
        description:
          result.deletedCount > 0
            ? `已移除 ${result.deletedCount} 条已完成事项。`
            : "当前条件下没有可清理的已完成事项。",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsClearingCompleted(false);
    }
  };

  // 进入编辑状态时，同步当前文本和标签内容。
  const startEditTodo = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditTagInput(stringifyTags(todo.tags ?? []));
  };

  // 取消编辑并重置编辑框内容。
  const cancelEditTodo = () => {
    setEditingId(null);
    setEditText("");
    setEditTagInput("");
  };

  // 保存当前编辑内容。
  const saveEditTodo = async (id: number) => {
    if (!editText.trim()) return;

    await updateTodo(id, {
      text: editText.trim(),
      tags: normalizeTagInput(editTagInput),
    });
    cancelEditTodo();
  };

  // 切换事项状态，例如待处理、进行中、已完成。
  const changeTodoStatus = async (todo: Todo, status: TodoStatus) => {
    setUpdatingStatusId(todo.id);

    try {
      await updateTodo(todo.id, { status });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // 切换事项优先级，例如高、中、低。
  const changeTodoPriority = async (todo: Todo, priority: TodoPriority) => {
    setUpdatingPriorityId(todo.id);

    try {
      await updateTodo(todo.id, { priority });
    } finally {
      setUpdatingPriorityId(null);
    }
  };

  // 应用状态筛选，并把分页重置到第一页。
  const applyFilter = async (filter: TodoFilter, keyword = appliedKeyword) => {
    const normalizedKeyword = keyword.trim();

    setActiveFilter(filter);
    setAppliedKeyword(normalizedKeyword);
    await fetchTodos({
      status: filter,
      keyword: normalizedKeyword,
      page: 1,
    });
  };

  // 应用关键字搜索，并把分页重置到第一页。
  const applySearch = async (keyword: string) => {
    const normalizedKeyword = keyword.trim();
    setAppliedKeyword(normalizedKeyword);
    await fetchTodos({ keyword: normalizedKeyword, page: 1 });
  };

  // 切换分页页码。
  const changePage = async (nextPage: number) => {
    await fetchTodos({ page: nextPage });
  };

  // 页面首次进入时自动拉取列表。
  useEffect(() => {
    fetchTodos();
  }, []);

  return {
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
    pageSize,
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
  };
}
