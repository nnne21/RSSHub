// api/vercel.js
import { handle } from 'hono/vercel';

// ここを index.js 付きに
import { setConfig } from '../dist/config/index.js';
import app from '../dist/app.js';
import logger from '../dist/utils/logger.js';

setConfig({ NO_LOGFILES: true });
logger.info('🎉 RSSHub is running! Cheers!');

export default handle(app);
