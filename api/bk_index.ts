// api/vercel.ts - Twitter Bot専用版
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { setConfig } from '../lib/config.js';

const app = new Hono();

// 基本のルート
app.get('/', (c) => {
  return c.json({ 
    message: 'Twitter Auto-Reply Bot RSSHub',
    status: 'running',
    version: '1.0.0'
  });
});

// Twitter特定アカウントのRSSフィード生成
app.get('/twitter/:username/rss', async (c) => {
  const username = c.req.param('username');
  
  // ここでTwitterのツイートを取得してRSSに変換
  // 実際の実装では、Twitter APIやスクレイピングを使用
  
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>@${username} のツイート</title>
    <description>${username}のツイートフィード</description>
    <link>https://twitter.com/${username}</link>
    <item>
      <title>サンプルツイート</title>
      <description>これはサンプルのツイート内容です</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <link>https://twitter.com/${username}/status/1234567890</link>
    </item>
  </channel>
</rss>`;

  return c.text(rssContent, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8'
  });
});

// ヘルスチェック用エンドポイント
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API情報
app.get('/api/info', (c) => {
  return c.json({
    name: 'Twitter Bot RSS API',
    endpoints: {
      'GET /': 'ホーム',
      'GET /twitter/:username/rss': 'ユーザーのツイートRSSフィード',
      'GET /health': 'ヘルスチェック',
      'GET /api/info': 'API情報'
    },
    usage: {
      example: '/twitter/example_user/rss'
    }
  });
});

// 設定を初期化
setConfig({ 
  NO_LOGFILES: true,
  CACHE_TYPE: 'memory'
});

console.log('🎉 Twitter Bot RSSHub is running!');

export default handle(app);
