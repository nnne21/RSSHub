const path = require('node:path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../dist'));

const { setConfig } = require('../dist/config');
setConfig({
    NO_LOGFILES: true,
});

const { handle } = require('hono/vercel');
const app = require('../dist/app');
const logger = require('../dist/utils/logger');

logger.info(`🎉 RSSHub is running! Cheers!`);

module.exports = handle(app);
