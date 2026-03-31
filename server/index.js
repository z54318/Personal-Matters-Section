require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { ensureAppSchema } = require("./utils/schema");

const app = express();
const PORT = process.env.PORT || 3001;

// 注册全局中间件，解析 JSON 并允许前端跨域访问。
app.use(express.json());
app.use(cors());

// 统一挂载所有业务路由。
app.use("/api", routes);

// 启动前先兜底数据库表结构，再开始监听端口。
async function startServer() {
  await ensureAppSchema();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("服务器启动失败：", error);
  process.exit(1);
});
