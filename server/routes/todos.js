const express = require("express");
const db = require("../db");

const router = express.Router();

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  return [];
}

function parseStoredTags(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function normalizeStatus(value) {
  return value === "done" ? "done" : "pending";
}

function normalizePriority(value) {
  if (value === "high" || value === "low") {
    return value;
  }

  return "medium";
}

function toIsoString(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function mapTodoRow(row) {
  return {
    id: row.id,
    text: row.text,
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    tags: parseStoredTags(row.tags),
    archived: Boolean(row.archived),
    create_time: toIsoString(row.create_time) || "",
    update_time: toIsoString(row.update_time) || "",
    complete_time: toIsoString(row.complete_time),
    archive_time: toIsoString(row.archive_time),
  };
}

function getSortClause(sort) {
  switch (sort) {
    case "created_desc":
      return "ORDER BY create_time DESC, id DESC";
    case "created_asc":
      return "ORDER BY create_time ASC, id ASC";
    case "priority_desc":
      return `
        ORDER BY
          CASE priority
            WHEN 'high' THEN 0
            WHEN 'medium' THEN 1
            ELSE 2
          END ASC,
          update_time DESC,
          id DESC
      `;
    default:
      return "ORDER BY update_time DESC, id DESC";
  }
}

async function getTodoById(todoId, userId) {
  const [rows] = await db.query(
    `
      SELECT
        id,
        text,
        status,
        priority,
        tags,
        archived,
        create_time,
        update_time,
        complete_time,
        archive_time
      FROM todos
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [todoId, userId]
  );

  return rows[0] ? mapTodoRow(rows[0]) : null;
}

// 获取事项列表，支持筛选、搜索、排序和分页。
router.get("/", async (req, res) => {
  const userId = req.user.userId;
  const status = String(req.query.status || "all");
  const keyword = String(req.query.keyword || "").trim();
  const sort = String(req.query.sort || "updated_desc");
  const page = Math.max(Number.parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(String(req.query.pageSize || "8"), 10) || 8, 1),
    50
  );
  const offset = (page - 1) * pageSize;

  const conditions = ["user_id = ?"];
  const values = [userId];

  if (status === "archived") {
    conditions.push("archived = 1");
  } else {
    conditions.push("archived = 0");

    if (status === "pending" || status === "done") {
      conditions.push("status = ?");
      values.push(status);
    }
  }

  if (keyword) {
    conditions.push("(text LIKE ? OR tags LIKE ?)");
    values.push(`%${keyword}%`, `%${keyword}%`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const sortClause = getSortClause(sort);

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM todos ${whereClause}`,
      values
    );
    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(page, totalPages);
    const currentOffset = (currentPage - 1) * pageSize;

    const [rows] = await db.query(
      `
        SELECT
          id,
          text,
          status,
          priority,
          tags,
          archived,
          create_time,
          update_time,
          complete_time,
          archive_time
        FROM todos
        ${whereClause}
        ${sortClause}
        LIMIT ? OFFSET ?
      `,
      [...values, pageSize, currentOffset]
    );

    const [statsRows] = await db.query(
      `
        SELECT
          SUM(CASE WHEN archived = 0 THEN 1 ELSE 0 END) AS total,
          SUM(CASE WHEN archived = 0 AND status = 'pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN archived = 0 AND status = 'done' THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN archived = 1 THEN 1 ELSE 0 END) AS archived
        FROM todos
        WHERE user_id = ?
      `,
      [userId]
    );

    const statsSource = statsRows[0] || {};

    res.json({
      items: rows.map(mapTodoRow),
      total,
      page: currentPage,
      pageSize,
      totalPages,
      stats: {
        total: Number(statsSource.total || 0),
        pending: Number(statsSource.pending || 0),
        completed: Number(statsSource.completed || 0),
        archived: Number(statsSource.archived || 0),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "获取事项列表失败，请稍后重试" });
  }
});

// 新增事项，默认放入待处理列表。
router.post("/", async (req, res) => {
  const userId = req.user.userId;
  const text = String(req.body?.text || "").trim();
  const tags = normalizeTags(req.body?.tags);

  if (!text) {
    return res.status(400).json({ message: "事项内容不能为空" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO todos (user_id, text, tags) VALUES (?, ?, ?)",
      [userId, text, JSON.stringify(tags)]
    );

    const todo = await getTodoById(result.insertId, userId);

    res.status(201).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "新增事项失败，请稍后重试" });
  }
});

// 更新事项内容、状态、优先级、标签或归档状态。
router.put("/:id", async (req, res) => {
  const userId = req.user.userId;
  const todoId = Number.parseInt(req.params.id, 10);
  const updates = [];
  const values = [];

  if (typeof req.body?.text === "string") {
    const text = req.body.text.trim();

    if (!text) {
      return res.status(400).json({ message: "事项内容不能为空" });
    }

    updates.push("text = ?");
    values.push(text);
  }

  if (typeof req.body?.status === "string") {
    const status = normalizeStatus(req.body.status);

    updates.push("status = ?");
    values.push(status);

    if (status === "done") {
      updates.push("complete_time = CURRENT_TIMESTAMP");
    } else {
      updates.push("complete_time = NULL");
    }
  }

  if (typeof req.body?.priority === "string") {
    updates.push("priority = ?");
    values.push(normalizePriority(req.body.priority));
  }

  if (req.body?.tags !== undefined) {
    updates.push("tags = ?");
    values.push(JSON.stringify(normalizeTags(req.body.tags)));
  }

  if (typeof req.body?.archived === "boolean") {
    updates.push("archived = ?");
    values.push(req.body.archived ? 1 : 0);
    updates.push(req.body.archived ? "archive_time = CURRENT_TIMESTAMP" : "archive_time = NULL");
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "没有可更新的字段" });
  }

  values.push(todoId, userId);

  try {
    const [result] = await db.query(
      `
        UPDATE todos
        SET ${updates.join(", ")}, update_time = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "事项不存在或无权操作" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "更新事项失败，请稍后重试" });
  }
});

// 清除当前查询范围内已完成且未归档的事项。
router.delete("/completed", async (req, res) => {
  const userId = req.user.userId;
  const keyword = String(req.query.keyword || "").trim();
  const conditions = ["user_id = ?", "status = 'done'", "archived = 0"];
  const values = [userId];

  if (keyword) {
    conditions.push("(text LIKE ? OR tags LIKE ?)");
    values.push(`%${keyword}%`, `%${keyword}%`);
  }

  try {
    const [result] = await db.query(
      `DELETE FROM todos WHERE ${conditions.join(" AND ")}`,
      values
    );

    res.json({
      success: true,
      deletedCount: Number(result.affectedRows || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "清除已完成事项失败，请稍后重试" });
  }
});

// 删除单条事项。
router.delete("/:id", async (req, res) => {
  const userId = req.user.userId;
  const todoId = Number.parseInt(req.params.id, 10);

  try {
    const [result] = await db.query(
      "DELETE FROM todos WHERE id = ? AND user_id = ?",
      [todoId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "事项不存在或无权删除" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "删除事项失败，请稍后重试" });
  }
});

module.exports = router;
