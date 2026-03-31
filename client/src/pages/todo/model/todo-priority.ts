import type { TodoPriority } from "./todo.types";

type PriorityMeta = {
  label: string;
  color: "crimson" | "amber" | "gray";
};

export const todoPriorityOptions: Array<{
  value: TodoPriority;
  label: string;
}> = [
  { value: "high", label: "高优先级" },
  { value: "medium", label: "中优先级" },
  { value: "low", label: "低优先级" },
];

// 把后端返回的优先级值收敛成前端可识别的合法值。
export function normalizeTodoPriority(priority?: string): TodoPriority {
  if (priority === "high" || priority === "low") {
    return priority;
  }

  return "medium";
}

// 根据优先级返回展示文案和对应色板。
export function getTodoPriorityMeta(priority?: string): PriorityMeta {
  const normalizedPriority = normalizeTodoPriority(priority);

  if (normalizedPriority === "high") {
    return {
      label: "高优先级",
      color: "crimson",
    };
  }

  if (normalizedPriority === "low") {
    return {
      label: "低优先级",
      color: "gray",
    };
  }

  return {
    label: "中优先级",
    color: "amber",
  };
}
