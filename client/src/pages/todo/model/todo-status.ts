import type { Todo, TodoStatus } from "./todo.types";

type StatusMeta = {
  label: string;
  color: "amber" | "cyan" | "green";
};

export const todoStatusOptions: Array<{
  value: TodoStatus;
  label: string;
}> = [
  { value: "pending", label: "待处理" },
  { value: "done", label: "已完成" },
];

// 把后端返回的状态值收敛成前端可识别的合法状态。
export function normalizeTodoStatus(status?: string): TodoStatus {
  if (status === "done") {
    return status;
  }

  return "pending";
}

// 根据事项当前状态，返回页面展示时使用的文案和颜色。
export function getTodoStatusMeta(
  todo: Todo,
  editingId: number | null
): StatusMeta {
  if (editingId === todo.id) {
    return {
      label: "编辑中",
      color: "amber",
    };
  }

  const status = normalizeTodoStatus(todo.status);

  if (status === "done") {
    return {
      label: "已完成",
      color: "green",
    };
  }

  return {
    label: "待处理",
    color: "cyan",
  };
}
