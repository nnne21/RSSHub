// api/vercel.js
import { handle } from 'hono/vercel';

// dist はデプロイ時に同梱される（vercel.json の includeFiles で指定）
import { setConfig } from '../dist/config.js';
import app from '../dist/app.js';
import logger from '../dist/utils/logger.js';

setConfig({ NO_LOGFILES: true });
logger.info('🎉 RSSHub is running! Cheers!');

export default handle(app);
