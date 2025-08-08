// api/vercel.ts（ESM, TypeScriptを直接import）
import { handle } from 'hono/vercel';

import { setConfig } from '../lib/config';
import app from '../lib/app';
import logger from '../lib/utils/logger';

setConfig({ NO_LOGFILES: true });
logger.info('🎉 RSSHub is running! Cheers!');

export default handle(app);
