import { request } from "../../../lib/request";
import type {
  Todo,
  TodoFilter,
  TodoListResponse,
  TodoStatus,
  TodoWritePayload,
} from "../model/todo.types";

const TODO_API_URL = "/todos";

type TodoQuery = {
  status?: TodoFilter | TodoStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export const todoApi = {
  // 获取事项列表，并支持筛选、搜索和分页参数。
  fetchTodos: async (query?: TodoQuery) => {
    const params: Record<string, string> = {};

    if (query?.status && query.status !== "all") {
      params.status = query.status;
    }

    if (query?.keyword?.trim()) {
      params.keyword = query.keyword.trim();
    }

    if (query?.page) {
      params.page = String(query.page);
    }

    if (query?.pageSize) {
      params.pageSize = String(query.pageSize);
    }

    const response = await request.get<TodoListResponse>(TODO_API_URL, { params });
    return response.data;
  },

  // 新增一条事项，同时允许保存标签。
  createTodo: async (payload: Pick<Todo, "text" | "tags">) => {
    const response = await request.post<Todo>(TODO_API_URL, payload);
    return response.data;
  },

  // 更新事项文本、状态、优先级或标签。
  updateTodo: async (id: number, payload: TodoWritePayload) => {
    const response = await request.put<{ success: true }>(
      `${TODO_API_URL}/${id}`,
      payload
    );
    return response.data;
  },

  // 删除单条事项。
  deleteTodo: async (id: number) => {
    await request.delete(`${TODO_API_URL}/${id}`);
  },

  // 批量清理当前搜索范围内的已完成事项。
  clearCompletedTodos: async (keyword?: string) => {
    const params: Record<string, string> = {};

    if (keyword?.trim()) {
      params.keyword = keyword.trim();
    }

    const response = await request.delete<{ success: true; deletedCount: number }>(
      `${TODO_API_URL}/completed`,
      { params }
    );

    return response.data;
  },
};
