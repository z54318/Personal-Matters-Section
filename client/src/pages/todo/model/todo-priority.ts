import type { TodoPriority } from "./todo.types";

export const todoPriorityOptions: Array<{ value: TodoPriority; label: string }> = [
  { value: "high", label: "高优先级" },
  { value: "medium", label: "中优先级" },
  { value: "low", label: "低优先级" },
];

export function getTodoPriorityLabel(priority: TodoPriority) {
  switch (priority) {
    case "high":
      return "高优先级";
    case "low":
      return "低优先级";
    default:
      return "中优先级";
  }
}

export function getTodoPriorityClasses(priority: TodoPriority) {
  switch (priority) {
    case "high":
      return "bg-rose-50 text-rose-600";
    case "low":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-amber-50 text-amber-700";
  }
}
