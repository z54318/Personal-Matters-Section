require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { ensureAppSchema } = require("./utils/schema");

const app = express();
const PORT = process.env.PORT || 3001;

// 解析允许跨域的来源列表，多个域名可用英文逗号分隔。
function parseAllowedOrigins() {
  const rawOrigins = String(process.env.ALLOWED_ORIGIN || "").trim();

  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins();

// 统一处理跨域策略，未配置时放行，配置后只允许命中的来源访问。
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("当前来源未被允许访问该服务"));
  },
};

// 注册全局中间件，解析 JSON 并允许前端跨域访问。
app.use(express.json());
app.use(cors(corsOptions));

// 提供一个轻量健康检查接口，方便部署完成后验证服务是否在线。
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "服务运行正常",
    timestamp: new Date().toISOString(),
  });
});

// 统一挂载所有业务路由。
app.use("/api", routes);

// 启动前先兜底数据库表结构，再开始监听端口。
async function startServer() {
  await ensureAppSchema();

  app.listen(PORT, () => {
    console.log(`服务器正在端口 ${PORT} 上运行`);
  });
}

startServer().catch((error) => {
  console.error("服务器启动失败：", error);
  process.exit(1);
});
