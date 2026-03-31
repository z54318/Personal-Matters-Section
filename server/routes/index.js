const express = require("express");
const auth = require("./auth");
const todos = require("./todos");
const { requireAuth } = require("../middleware/require-auth");

const router = express.Router();

// 注册认证相关路由。
router.use("/auth", auth);

// Todo 路由统一要求先登录。
router.use("/todos", requireAuth, todos);

module.exports = router;
