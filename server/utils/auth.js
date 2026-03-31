const crypto = require("crypto");

const TOKEN_SECRET = process.env.AUTH_SECRET || "dev-auth-secret-change-me";
const TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

// 把普通字符串转成 URL 安全的 Base64 字符串。
function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// 把 URL 安全的 Base64 字符串还原成普通字符串。
function fromBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

// 使用 HMAC-SHA256 对 token 的头部和载荷做签名。
function signTokenPayload(payload) {
  return crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// 对明文密码进行加盐哈希，数据库只保存加密后的结果。
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

  return `${salt}:${hash}`;
}

// 校验登录时输入的密码是否与数据库中的哈希值匹配。
function verifyPassword(password, storedPasswordHash) {
  const [salt, storedHash] = String(storedPasswordHash).split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

// 生成一个简化版 JWT，用于前后端维持登录态。
function createToken(user) {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      userId: user.id,
      username: user.username,
      exp: Date.now() + TOKEN_EXPIRES_IN_MS,
    })
  );
  const signature = signTokenPayload(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

// 校验 token 的格式、签名和过期时间。
function verifyToken(token) {
  const [header, payload, signature] = String(token).split(".");

  if (!header || !payload || !signature) {
    throw new Error("令牌格式不正确");
  }

  const expectedSignature = signTokenPayload(`${header}.${payload}`);

  if (signature !== expectedSignature) {
    throw new Error("令牌签名无效");
  }

  const parsedPayload = JSON.parse(fromBase64Url(payload));

  if (!parsedPayload.exp || Date.now() > parsedPayload.exp) {
    throw new Error("登录状态已过期");
  }

  return parsedPayload;
}

module.exports = {
  createToken,
  hashPassword,
  verifyPassword,
  verifyToken,
};
