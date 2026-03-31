const db = require("../db");

// 确保用户表存在，供登录、注册和修改密码功能使用。
async function ensureUsersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

// 确保事项主表存在，首次部署到空数据库时先把基础结构建出来。
async function ensureTodosTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      text VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      tags VARCHAR(1000) NOT NULL DEFAULT '[]',
      create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      complete_time DATETIME NULL,
      INDEX idx_todos_user_id (user_id)
    )
  `);
}

// 确保事项表中存在 user_id 字段，用于按用户隔离数据。
async function ensureTodoUserColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM todos LIKE 'user_id'");

  if (rows.length === 0) {
    await db.query("ALTER TABLE todos ADD COLUMN user_id INT NULL AFTER id");
  }
}

// 确保事项表中存在 create_time 字段，自动记录创建时间。
async function ensureTodoCreateTimeColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM todos LIKE 'create_time'");

  if (rows.length === 0) {
    await db.query(
      "ALTER TABLE todos ADD COLUMN create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER tags"
    );
    return;
  }

  await db.query(
    "ALTER TABLE todos MODIFY COLUMN create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
  );
}

// 确保事项表中存在 update_time 字段，自动记录最后更新时间。
async function ensureTodoUpdateTimeColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM todos LIKE 'update_time'");

  if (rows.length === 0) {
    await db.query(
      "ALTER TABLE todos ADD COLUMN update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER create_time"
    );
    return;
  }

  await db.query(
    "ALTER TABLE todos MODIFY COLUMN update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
}

// 确保事项表中存在 priority 字段，并为新数据提供默认优先级。
async function ensureTodoPriorityColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM todos LIKE 'priority'");

  if (rows.length === 0) {
    await db.query(
      "ALTER TABLE todos ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium' AFTER status"
    );
    return;
  }

  await db.query(
    "ALTER TABLE todos MODIFY COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium'"
  );
}

// 确保事项表中存在 tags 字段，使用 JSON 字符串保存标签数组。
async function ensureTodoTagsColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM todos LIKE 'tags'");

  if (rows.length === 0) {
    await db.query(
      "ALTER TABLE todos ADD COLUMN tags VARCHAR(1000) NOT NULL DEFAULT '[]' AFTER priority"
    );
    return;
  }

  await db.query(
    "ALTER TABLE todos MODIFY COLUMN tags VARCHAR(1000) NOT NULL DEFAULT '[]'"
  );
}

// 确保事项表中存在 complete_time 字段，用于记录完成时间。
async function ensureTodoCompleteTimeColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM todos LIKE 'complete_time'");

  if (rows.length === 0) {
    await db.query(
      "ALTER TABLE todos ADD COLUMN complete_time DATETIME NULL AFTER update_time"
    );
  }
}

// 兼容旧数据，把空优先级补成默认值。
async function normalizeTodoPriorityData() {
  await db.query(
    "UPDATE todos SET priority = 'medium' WHERE priority IS NULL OR priority = ''"
  );
}

// 兼容旧数据，把空标签补成空数组。
async function normalizeTodoTagData() {
  await db.query("UPDATE todos SET tags = '[]' WHERE tags IS NULL OR tags = ''");
}

// 把历史里的“进行中”状态回收成“待处理”，让状态模型保持简单。
async function normalizeTodoStatusData() {
  await db.query("UPDATE todos SET status = 'pending' WHERE status = 'in_progress'");
}

// 兼容旧数据，为已完成事项回填完成时间，并清理未完成事项残留的完成时间。
async function normalizeTodoCompleteTimeData() {
  await db.query(`
    UPDATE todos
    SET complete_time = COALESCE(complete_time, update_time, create_time, CURRENT_TIMESTAMP)
    WHERE status = 'done' AND complete_time IS NULL
  `);

  await db.query(`
    UPDATE todos
    SET complete_time = NULL
    WHERE status <> 'done' AND complete_time IS NOT NULL
  `);
}

// 为 user_id 字段补索引，避免按用户查询时性能变差。
async function ensureTodoUserIndex() {
  const [rows] = await db.query(
    "SHOW INDEX FROM todos WHERE Key_name = 'idx_todos_user_id'"
  );

  if (rows.length === 0) {
    await db.query("CREATE INDEX idx_todos_user_id ON todos (user_id)");
  }
}

// 启动服务前统一补齐项目依赖的表结构和默认数据。
async function ensureAppSchema() {
  await ensureUsersTable();
  await ensureTodosTable();
  await ensureTodoUserColumn();
  await ensureTodoPriorityColumn();
  await ensureTodoTagsColumn();
  await ensureTodoCreateTimeColumn();
  await ensureTodoUpdateTimeColumn();
  await ensureTodoCompleteTimeColumn();
  await normalizeTodoPriorityData();
  await normalizeTodoTagData();
  await normalizeTodoStatusData();
  await normalizeTodoCompleteTimeData();
  await ensureTodoUserIndex();
}

module.exports = {
  ensureAppSchema,
};
