// api/vercel.js  ← ESM
import { handle } from 'hono/vercel';
import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const distRoot = path.join(__dirname, '..', 'dist');

// --- 診断ログ（一時的）: dist の中身を出して構造を確認 ---
try {
  console.log('[diag] __dirname =', __dirname);
  console.log('[diag] ls /var/task :', fs.readdirSync(path.join(__dirname, '..', '..')));
  console.log('[diag] ls project root :', fs.readdirSync(path.join(__dirname, '..')));
  console.log('[diag] ls dist root :', fs.existsSync(distRoot) ? fs.readdirSync(distRoot) : 'dist not found');
  if (fs.existsSync(path.join(distRoot, 'config'))) {
    console.log('[diag] ls dist/config :', fs.readdirSync(path.join(distRoot, 'config')));
  }
  if (fs.existsSync(path.join(distRoot, 'utils'))) {
    console.log('[diag] ls dist/utils :', fs.readdirSync(path.join(distRoot, 'utils')));
  }
} catch (e) {
  console.error('[diag] listing error', e);
}

// --- ここから本体 import（まずは index.js 前提、無ければ fallback） ---
const importMaybe = async (p) => {
  try {
    return await import(p);
  } catch {
    return null;
  }
};

let configMod =
  (await importMaybe(url.pathToFileURL(path.join(distRoot, 'config.js')).href)) ||
  (await importMaybe(url.pathToFileURL(path.join(distRoot, 'config', 'index.js')).href));

if (!configMod) {
  throw new Error('config module not found in dist (tried config.js and config/index.js)');
}

const appMod = await import(url.pathToFileURL(path.join(distRoot, 'app.js')).href);
const loggerMod = await import(url.pathToFileURL(path.join(distRoot, 'utils', 'logger.js')).href);

const { setConfig } = configMod;
const app = appMod.default;
const logger = loggerMod.default || loggerMod;

setConfig({ NO_LOGFILES: true });
logger.info('🎉 RSSHub is running! Cheers!');

export default handle(app);
