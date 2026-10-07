/**
 * Динамический конфиг Expo поверх app.json.
 *
 * Единственная задача — секреты. Они НЕ лежат в git (репозиторий публичный):
 *   • локально   — secrets.local.json в корне (в .gitignore, шаблон: secrets.local.example.json)
 *   • в CI       — GitHub Secret IOS_SECRETS_JSON, workflow пишет его в secrets.local.json
 *   • либо env   — WM_SERVER_KEY, WM_SITE_ENCRYPT_KEY, WM_STRAPI_API_TOKEN, …
 *
 * Как в Android (build.gradle → encryptSecret): каждое значение шифруется
 * AES-256-GCM на этапе сборки, в бандл попадает только шифртекст, расшифровка —
 * src/security/secretsProvider.ts. Это повышает цену извлечения, но не делает
 * клиентский секрет недоступным — серверные секреты должны жить на сервере.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SECRET_KEYS = {
  serverKey: 'WM_SERVER_KEY',
  siteEncryptKey: 'WM_SITE_ENCRYPT_KEY',
  strapiApiToken: 'WM_STRAPI_API_TOKEN',
  giphyApiKey: 'WM_GIPHY_API_KEY',
  mapsApiKey: 'WM_MAPS_API_KEY',
  crashSecret: 'WM_CRASH_SECRET',
};

function loadSecrets() {
  let fromFile = {};
  const file = path.join(__dirname, 'secrets.local.json');
  if (fs.existsSync(file)) {
    fromFile = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const out = {};
  for (const [name, env] of Object.entries(SECRET_KEYS)) {
    out[name] = process.env[env] ?? fromFile[name] ?? '';
  }
  if (!out.crashSecret) out.crashSecret = 'wm_crash_rpt_2025'; // как дефолт в Android
  return out;
}

// ДОЛЖНО совпадать байт-в-байт с passphrase() в src/security/secretsProvider.ts
function passphrase(bundleId) {
  return 'wm7' + '_Obf$' + 'K3y_' + '2026#' + bundleId;
}

function encryptSecret(plain, pass) {
  if (!plain) return '';
  const key = crypto.createHash('sha256').update(pass, 'utf8').digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return Buffer.concat([iv, ct]).toString('base64');
}

module.exports = ({ config }) => {
  const bundleId = config.ios?.bundleIdentifier ?? 'com.worldmates.messenger';
  const pass = passphrase(bundleId);
  const secrets = loadSecrets();

  const missing = Object.entries(secrets).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.warn(`[app.config] не заданы секреты: ${missing.join(', ')} — соответствующие функции работать не будут`);
  }

  const encrypted = {};
  for (const [k, v] of Object.entries(secrets)) encrypted[k] = encryptSecret(v, pass);

  return {
    ...config,
    extra: {
      ...(config.extra ?? {}),
      s: encrypted,
    },
  };
};
