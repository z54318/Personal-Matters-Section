export type TodoStatus = "pending" | "done";

export type TodoPriority = "low" | "medium" | "high";

export type TodoFilter = "all" | TodoStatus;

export type Todo = {
  id: number;
  text: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags: string[];
  create_time?: string;
  update_time?: string;
  complete_time?: string | null;
};

export type TodoWritePayload = {
  text?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
};

export type TodoListResponse = {
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
