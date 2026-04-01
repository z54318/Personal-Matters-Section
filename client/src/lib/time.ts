function normalizeDateValue(value: string) {
  return value.includes("T") ? value : value.replace(" ", "T");
}

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function toDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(normalizeDateValue(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatClock(date: Date) {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatFriendlyDateTime(value?: string | null) {
  const date = toDate(value);

  if (!date) {
    return value || "-";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs >= 0) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return "刚刚";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} 分钟前`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 6 && isSameDay(now, date)) {
      return `${diffHours} 小时前`;
    }
  }

  if (isSameDay(now, date)) {
    return `今天 ${formatClock(date)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(yesterday, date)) {
    return `昨天 ${formatClock(date)}`;
  }

  if (now.getFullYear() === date.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${formatClock(date)}`;
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${formatClock(date)}`;
}

export function formatAbsoluteDateTime(value?: string | null) {
  const date = toDate(value);

  if (!date) {
    return value || "-";
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${formatClock(date)}`;
}
