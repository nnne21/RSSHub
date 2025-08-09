// api/vercel.ts
import { handle } from 'hono/vercel';

import { setConfig } from '../lib/config.js';
import app from '../lib/app';
import logger from '../lib/utils/logger';

setConfig({ NO_LOGFILES: true });
logger.info('🎉 RSSHub is running! Cheers!');

export default handle(app);
