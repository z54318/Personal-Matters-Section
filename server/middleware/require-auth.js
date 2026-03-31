const { verifyToken } = require("../utils/auth");

// 校验请求头中的 Bearer Token，并把用户信息挂到 req.user 上。
function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "请先登录后再访问" });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || "登录状态无效" });
  }
}

module.exports = {
  requireAuth,
};
