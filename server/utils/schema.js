const db = require("../db");

async function ensureUsersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(20) NOT NULL DEFAULT '',
      bio VARCHAR(120) NOT NULL DEFAULT '',
      create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

async function ensureTodosTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      text VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      archived TINYINT(1) NOT NULL DEFAULT 0,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      tags VARCHAR(1000) NOT NULL DEFAULT '[]',
      create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      complete_time DATETIME NULL,
      archive_time DATETIME NULL,
      INDEX idx_todos_user_id (user_id)
    )
  `);
}

async function hasColumn(tableName, columnName) {
  const [rows] = await db.query(
    `SHOW COLUMNS FROM ${tableName} LIKE ?`,
    [columnName]
  );

  return rows.length > 0;
}

async function ensureUserNicknameColumn() {
  if (await hasColumn("users", "nickname")) {
    return;
  }

  await db.query(
    "ALTER TABLE users ADD COLUMN nickname VARCHAR(20) NOT NULL DEFAULT '' AFTER password_hash"
  );
}

async function ensureUserBioColumn() {
  if (await hasColumn("users", "bio")) {
    return;
  }

  await db.query(
    "ALTER TABLE users ADD COLUMN bio VARCHAR(120) NOT NULL DEFAULT '' AFTER nickname"
  );
}

async function ensureUserCreateTimeColumn() {
  if (await hasColumn("users", "create_time")) {
    return;
  }

  await db.query(
    "ALTER TABLE users ADD COLUMN create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER bio"
  );
}

async function ensureUserUpdateTimeColumn() {
  if (await hasColumn("users", "update_time")) {
    return;
  }

  await db.query(
    "ALTER TABLE users ADD COLUMN update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER create_time"
  );
}

async function ensureTodoUserColumn() {
  if (await hasColumn("todos", "user_id")) {
    return;
  }

  await db.query("ALTER TABLE todos ADD COLUMN user_id INT NULL AFTER id");
}

async function ensureTodoStatusColumn() {
  if (await hasColumn("todos", "status")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' AFTER text"
  );
}

async function ensureTodoArchivedColumn() {
  if (await hasColumn("todos", "archived")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0 AFTER status"
  );
}

async function ensureTodoPriorityColumn() {
  if (await hasColumn("todos", "priority")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium' AFTER archived"
  );
}

async function ensureTodoTagsColumn() {
  if (await hasColumn("todos", "tags")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN tags VARCHAR(1000) NOT NULL DEFAULT '[]' AFTER priority"
  );
}

async function ensureTodoCreateTimeColumn() {
  if (await hasColumn("todos", "create_time")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER tags"
  );
}

async function ensureTodoUpdateTimeColumn() {
  if (await hasColumn("todos", "update_time")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER create_time"
  );
}

async function ensureTodoCompleteTimeColumn() {
  if (await hasColumn("todos", "complete_time")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN complete_time DATETIME NULL AFTER update_time"
  );
}

async function ensureTodoArchiveTimeColumn() {
  if (await hasColumn("todos", "archive_time")) {
    return;
  }

  await db.query(
    "ALTER TABLE todos ADD COLUMN archive_time DATETIME NULL AFTER complete_time"
  );
}

async function ensureTodoUserIndex() {
  const [rows] = await db.query("SHOW INDEX FROM todos WHERE Key_name = 'idx_todos_user_id'");

  if (rows.length > 0) {
    return;
  }

  await db.query("ALTER TABLE todos ADD INDEX idx_todos_user_id (user_id)");
}

async function normalizeUserProfileData() {
  await db.query(
    "UPDATE users SET nickname = '' WHERE nickname IS NULL"
  );
  await db.query(
    "UPDATE users SET bio = '' WHERE bio IS NULL"
  );
}

async function normalizeTodoStatusData() {
  await db.query(`
    UPDATE todos
    SET status = 'pending'
    WHERE status IS NULL
      OR status = ''
      OR status = 'in_progress'
      OR status NOT IN ('pending', 'done')
  `);
}

async function normalizeTodoArchivedData() {
  await db.query(`
    UPDATE todos
    SET archived = 0
    WHERE archived IS NULL
  `);
}

async function normalizeTodoPriorityData() {
  await db.query(`
    UPDATE todos
    SET priority = 'medium'
    WHERE priority IS NULL
      OR priority = ''
      OR priority NOT IN ('low', 'medium', 'high')
  `);
}

async function normalizeTodoTagsData() {
  await db.query(`
    UPDATE todos
    SET tags = '[]'
    WHERE tags IS NULL
      OR tags = ''
  `);
}

async function normalizeTodoCompleteTimeData() {
  await db.query(`
    UPDATE todos
    SET complete_time = COALESCE(complete_time, update_time, create_time, CURRENT_TIMESTAMP)
    WHERE status = 'done'
      AND complete_time IS NULL
  `);

  await db.query(`
    UPDATE todos
    SET complete_time = NULL
    WHERE status = 'pending'
      AND complete_time IS NOT NULL
  `);
}

async function normalizeTodoArchiveTimeData() {
  await db.query(`
    UPDATE todos
    SET archive_time = COALESCE(archive_time, update_time, create_time, CURRENT_TIMESTAMP)
    WHERE archived = 1
      AND archive_time IS NULL
  `);

  await db.query(`
    UPDATE todos
    SET archive_time = NULL
    WHERE archived = 0
      AND archive_time IS NOT NULL
  `);
}

// 启动服务前统一补齐表结构和历史数据，避免新功能上线后旧数据无法兼容。
async function ensureAppSchema() {
  await ensureUsersTable();
  await ensureUserNicknameColumn();
  await ensureUserBioColumn();
  await ensureUserCreateTimeColumn();
  await ensureUserUpdateTimeColumn();
  await normalizeUserProfileData();

  await ensureTodosTable();
  await ensureTodoUserColumn();
  await ensureTodoStatusColumn();
  await ensureTodoArchivedColumn();
  await ensureTodoPriorityColumn();
  await ensureTodoTagsColumn();
  await ensureTodoCreateTimeColumn();
  await ensureTodoUpdateTimeColumn();
  await ensureTodoCompleteTimeColumn();
  await ensureTodoArchiveTimeColumn();
  await ensureTodoUserIndex();
  await normalizeTodoStatusData();
  await normalizeTodoArchivedData();
  await normalizeTodoPriorityData();
  await normalizeTodoTagsData();
  await normalizeTodoCompleteTimeData();
  await normalizeTodoArchiveTimeData();
}

module.exports = {
  ensureAppSchema,
};
