const express = require("express");
const db = require("../db");
const { createToken, hashPassword, verifyPassword } = require("../utils/auth");
const { requireAuth } = require("../middleware/require-auth");

const router = express.Router();

// 统一整理登录、注册时提交的账号密码字段。
function normalizeCredentials(body = {}) {
  return {
    username: String(body.username || "").trim(),
    password: String(body.password || ""),
  };
}

// 统一整理修改密码时提交的旧密码和新密码字段。
function normalizePasswordPayload(body = {}) {
  return {
    currentPassword: String(body.currentPassword || ""),
    newPassword: String(body.newPassword || ""),
  };
}

// 校验用户名格式，避免存入无效账号。
function validateUsername(username) {
  if (username.length < 3 || username.length > 20) {
    return "用户名长度需要在 3 到 20 个字符之间";
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "用户名只能包含字母、数字和下划线";
  }

  return "";
}

// 校验密码长度，供注册和修改密码共用。
function validatePassword(password) {
  if (password.length < 6 || password.length > 32) {
    return "密码长度需要在 6 到 32 个字符之间";
  }

  return "";
}

// 注册新用户，成功后直接返回登录态。
router.post("/register", async (req, res) => {
  const { username, password } = normalizeCredentials(req.body);
  const usernameMessage = validateUsername(username);
  const passwordMessage = validatePassword(password);

  if (usernameMessage) {
    return res.status(400).json({ message: usernameMessage });
  }

  if (passwordMessage) {
    return res.status(400).json({ message: passwordMessage });
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "该用户名已被注册" });
    }

    const passwordHash = hashPassword(password);
    const [result] = await db.query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );

    const user = {
      id: result.insertId,
      username,
    };

    res.status(201).json({
      token: createToken(user),
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "注册失败，请稍后重试" });
  }
});

// 校验用户名和密码，成功后返回登录态。
router.post("/login", async (req, res) => {
  const { username, password } = normalizeCredentials(req.body);

  if (!username || !password) {
    return res.status(400).json({ message: "请输入用户名和密码" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    const user = rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    res.json({
      token: createToken(user),
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "登录失败，请稍后重试" });
  }
});

// 返回当前登录用户信息，供前端刷新页面时恢复登录态。
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username FROM users WHERE id = ? LIMIT 1",
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "获取当前用户信息失败" });
  }
});

// 登录后允许用户修改自己的密码。
router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = normalizePasswordPayload(req.body);
  const passwordMessage = validatePassword(newPassword);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "请输入旧密码和新密码" });
  }

  if (passwordMessage) {
    return res.status(400).json({ message: passwordMessage });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "新密码不能与旧密码相同" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
      [req.user.userId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    if (!verifyPassword(currentPassword, user.password_hash)) {
      return res.status(400).json({ message: "旧密码输入错误" });
    }

    const nextPasswordHash = hashPassword(newPassword);

    await db.query(
      "UPDATE users SET password_hash = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?",
      [nextPasswordHash, req.user.userId]
    );

    res.json({
      success: true,
      message: "密码修改成功",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "修改密码失败，请稍后重试" });
  }
});

module.exports = router;
