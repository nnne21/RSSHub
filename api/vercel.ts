// api/vercel.ts (ESM)
import { handle } from 'hono/vercel';

// dist を同梱している前提（vercel.json の includeFiles で dist/** を入れている）
import { setConfig } from './dist/config.js';
import app from './dist/app.js';
import logger from './dist/utils/logger.js';

// ログファイル出力抑制
setConfig({ NO_LOGFILES: true });

// 起動ログ
logger.info('🎉 RSSHub is running! Cheers!');

// ESM では default export でハンドラを返す
export default handle(app);
