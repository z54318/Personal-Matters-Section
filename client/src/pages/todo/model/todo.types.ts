export type TodoStatus = "pending" | "done";

export type TodoPriority = "low" | "medium" | "high";

export type TodoFilter = "all" | TodoStatus | "archived";

export type TodoSort =
  | "updated_desc"
  | "created_desc"
  | "created_asc"
  | "priority_desc";

export type Todo = {
  id: number;
  text: string;
  status: TodoStatus;
  priority: TodoPriority;
  tags: string[];
  archived: boolean;
  create_time: string;
  update_time: string;
  complete_time: string | null;
  archive_time: string | null;
};

export type TodoStats = {
  total: number;
  pending: number;
  completed: number;
  archived: number;
};

export type TodoListQuery = {
  status?: TodoFilter;
  keyword?: string;
  sort?: TodoSort;
  page?: number;
  pageSize?: number;
};

export type TodoListResponse = {
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: TodoStats;
};

export type TodoWritePayload = {
  text?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  archived?: boolean;
};
