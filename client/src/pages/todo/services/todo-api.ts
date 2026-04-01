import { request } from "../../../lib/request";
import type {
  Todo,
  TodoListQuery,
  TodoListResponse,
  TodoWritePayload,
} from "../model/todo.types";

const TODO_API_URL = "/todos";

export const todoApi = {
  async fetchTodos(query: TodoListQuery = {}) {
    const response = await request.get<TodoListResponse>(TODO_API_URL, {
      params: {
        status: query.status === "all" ? undefined : query.status,
        keyword: query.keyword || undefined,
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
      },
    });

    return response.data;
  },

  async createTodo(payload: { text: string; tags: string[] }) {
    const response = await request.post<Todo>(TODO_API_URL, payload);
    return response.data;
  },

  async updateTodo(todoId: number, payload: TodoWritePayload) {
    const response = await request.put<{ success: true }>(
      `${TODO_API_URL}/${todoId}`,
      payload
    );
    return response.data;
  },

  async deleteTodo(todoId: number) {
    const response = await request.delete<{ success: true }>(
      `${TODO_API_URL}/${todoId}`
    );
    return response.data;
  },

  async clearCompletedTodos(keyword?: string) {
    const response = await request.delete<{ success: true; deletedCount: number }>(
      `${TODO_API_URL}/completed`,
      {
        params: {
          keyword: keyword || undefined,
        },
      }
    );

    return response.data;
  },
};
