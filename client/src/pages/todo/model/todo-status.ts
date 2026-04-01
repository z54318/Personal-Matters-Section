import type { TodoFilter, TodoStatus } from "./todo.types";

export const todoFilterOptions: Array<{ value: TodoFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待处理" },
  { value: "done", label: "已完成" },
  { value: "archived", label: "已归档" },
];

export function getTodoStatusLabel(status: TodoStatus) {
  return status === "done" ? "已完成" : "待处理";
}

export function getTodoStatusClasses(status: TodoStatus) {
  if (status === "done") {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-cyan-50 text-cyan-700";
}
