const fs = require("fs");
const path = require("path");

const DEFAULT_FE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";
const DEFAULT_API_URL = "http://127.0.0.1:8000/api";
const DEFAULT_LOGIN = process.env.STAFF_SCHEDULE_SMOKE_LOGIN || "+79213463070";
const DEFAULT_USER_ID = Number(process.env.STAFF_SCHEDULE_SMOKE_USER_ID || 2207);

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    result[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });

  return result;
}

function normalizeUrl(value, fallback) {
  const url = value || fallback;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function assertLocalUrl(input, label) {
  const parsed = new URL(input);
  const isLocal = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";

  if (!isLocal) {
    throw new Error(`${label} must be local, got ${input}`);
  }

  return parsed;
}

async function loadLocalEnv() {
  const rootDir = path.resolve(__dirname, "../../..");
  const envFile = readEnvFile(path.join(rootDir, ".env.development"));
  const apiBaseUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_API_URL || envFile.NEXT_PUBLIC_API_URL,
    DEFAULT_API_URL,
  );
  const preferredFeBaseUrl = normalizeUrl(DEFAULT_FE_URL, "http://localhost:3000");

  assertLocalUrl(apiBaseUrl, "API URL");
  assertLocalUrl(preferredFeBaseUrl, "FE URL");

  return {
    apiBaseUrl,
    feBaseUrl: preferredFeBaseUrl,
    login: DEFAULT_LOGIN,
    userId: DEFAULT_USER_ID,
    token: Buffer.from(`${DEFAULT_LOGIN}-_-${DEFAULT_USER_ID}`).toString("base64"),
  };
}

module.exports = {
  loadLocalEnv,
};
