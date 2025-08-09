import { Hono } from 'hono';
import { compress } from 'hono/compress';
import mLogger from './middleware/logger.js';         // @を./に変更
import cache from './middleware/cache.js';            // @を./に変更
import template from './middleware/template.js';      // @を./に変更
import sentry from './middleware/sentry.js';          // @を./に変更
import accessControl from './middleware/access-control.js'; // @を./に変更
import debug from './middleware/debug.js';            // @を./に変更
import header from './middleware/header.js';          // @を./に変更
import antiHotlink from './middleware/anti-hotlink.js'; // @を./に変更
import parameter from './middleware/parameter.js';    // @を./に変更
import trace from './middleware/trace.js';            // @を./に変更
import { jsxRenderer } from 'hono/jsx-renderer';
import { trimTrailingSlash } from 'hono/trailing-slash';
import logger from './utils/logger.js';               // @を./に変更
import { notFoundHandler, errorHandler } from './errors.js'; // @を./に変更
import registry from './registry.js';                 // @を./に変更
import api from './api.js';                          // @を./に変更

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Hono();
app.use(trimTrailingSlash());
app.use(compress());
app.use(
    jsxRenderer(({ children }) => <>{children}</>, {
        docType: '<?xml version="1.0" encoding="UTF-8"?>',
        stream: {},
    })
);
app.use(mLogger);
app.use(trace);
app.use(sentry);
app.use(accessControl);
app.use(debug);
app.use(template);
app.use(header);
app.use(antiHotlink);
app.use(parameter);
app.use(cache);
app.route('/', registry);
app.route('/api', api);
app.notFound(notFoundHandler);
app.onError(errorHandler);
export default app;
