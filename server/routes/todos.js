const express = require("express");
const db = require("../db");

const router = express.Router();

// 把标签输入统一整理成去重后的字符串数组。
function normalizeTags(rawTags) {
  const source = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === "string"
      ? rawTags.split(/[，,]/)
      : [];

  const normalized = source
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .slice(0, 10);

  return Array.from(new Set(normalized));
}

// 把数据库里存储的标签 JSON 字符串还原成前端可直接使用的数组。
function parseStoredTags(rawTags) {
  if (!rawTags) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawTags);

    if (Array.isArray(parsed)) {
      return normalizeTags(parsed);
    }
  } catch (error) {
    return normalizeTags(String(rawTags));
  }

  return [];
}

// 把数据库行数据整理成前端需要的统一结构。
function mapTodoRow(row) {
  return {
    ...row,
    tags: parseStoredTags(row.tags),
  };
}

// 获取当前登录用户的事项列表，并支持状态筛选、关键字搜索和分页。
router.get("/", async (req, res) => {
  const { status, keyword, page, pageSize } = req.query;
  const conditions = ["user_id = ?"];
  const values = [req.user.userId];

  if (typeof status === "string" && status !== "all") {
    const allowedStatus = ["pending", "done"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "状态值不合法" });
    }

    conditions.push("status = ?");
    values.push(status);
  }

  if (typeof keyword === "string" && keyword.trim()) {
    const searchValue = `%${keyword.trim()}%`;
    conditions.push("(text LIKE ? OR tags LIKE ?)");
    values.push(searchValue, searchValue);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const parsedPage = Number(page);
  const parsedPageSize = Number(pageSize);
  const safePageSize =
    Number.isInteger(parsedPageSize) && parsedPageSize > 0
      ? Math.min(parsedPageSize, 50)
      : 10;

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM todos ${whereClause}`,
      values
    );

    const total = countRows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const safePage =
      Number.isInteger(parsedPage) && parsedPage > 0
        ? Math.min(parsedPage, totalPages)
        : 1;
    const offset = (safePage - 1) * safePageSize;

    const [rows] = await db.query(
      `SELECT id, text, status, priority, tags, create_time, update_time, complete_time
       FROM todos
       ${whereClause}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...values, safePageSize, offset]
    );

    res.json({
      items: rows.map(mapTodoRow),
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "获取列表失败" });
  }
});

// 为当前登录用户新增一条事项，同时支持保存标签。
router.post("/", async (req, res) => {
  const { text, tags } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "文本不能为空" });
  }

  try {
    const content = text.trim();
    const normalizedTags = normalizeTags(tags);
    const [result] = await db.query(
      "INSERT INTO todos (user_id, text, tags) VALUES (?, ?, ?)",
      [req.user.userId, content, JSON.stringify(normalizedTags)]
    );

    res.status(201).json({
      id: result.insertId,
      text: content,
      status: "pending",
      priority: "medium",
      tags: normalizedTags,
      complete_time: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "新增失败" });
  }
});

// 批量清理当前登录用户在当前关键字范围内的已完成事项。
router.delete("/completed", async (req, res) => {
  const { keyword } = req.query;
  const conditions = ["user_id = ?", "status = ?"];
  const values = [req.user.userId, "done"];

  if (typeof keyword === "string" && keyword.trim()) {
    const searchValue = `%${keyword.trim()}%`;
    conditions.push("(text LIKE ? OR tags LIKE ?)");
    values.push(searchValue, searchValue);
  }

  try {
    const [result] = await db.query(
      `DELETE FROM todos WHERE ${conditions.join(" AND ")}`,
      values
    );

    res.json({
      success: true,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "清除已完成事项失败" });
  }
});

// 删除当前登录用户的一条事项。
router.delete("/:id", async (req, res) => {
  const todoId = Number(req.params.id);

  try {
    const [result] = await db.query(
      "DELETE FROM todos WHERE id = ? AND user_id = ?",
      [todoId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "事项不存在" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "删除失败" });
  }
});

// 统一更新事项文本、状态、优先级和标签。
router.put("/:id", async (req, res) => {
  const todoId = Number(req.params.id);
  const { text, status, priority, tags } = req.body;
  const updates = [];
  const values = [];

  if (typeof text === "string") {
    const content = text.trim();

    if (!content) {
      return res.status(400).json({ message: "文本不能为空" });
    }

    updates.push("text = ?");
    values.push(content);
  }

  if (typeof status === "string") {
    const allowedStatus = ["pending", "done"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "状态值不合法" });
    }

    updates.push("status = ?");
    values.push(status);
    updates.push(
      status === "done"
        ? "complete_time = CURRENT_TIMESTAMP"
        : "complete_time = NULL"
    );
  }

  if (typeof priority === "string") {
    const allowedPriorities = ["low", "medium", "high"];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({ message: "优先级值不合法" });
    }

    updates.push("priority = ?");
    values.push(priority);
  }

  if (tags !== undefined) {
    const normalizedTags = normalizeTags(tags);
    updates.push("tags = ?");
    values.push(JSON.stringify(normalizedTags));
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "没有可更新的字段" });
  }

  try {
    values.push(todoId, req.user.userId);

    const [result] = await db.query(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "事项不存在" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "更新失败" });
  }
});

module.exports = router;
