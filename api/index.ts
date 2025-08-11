// api/index.ts - 独立動作版（依存関係なし）
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono();

// 基本のルート
app.get('/', (c) => {
  return c.json({ 
    message: 'Twitter Auto-Reply Bot RSSHub',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: {
      CACHE_TYPE: process.env.CACHE_TYPE || 'not set',
      ALLOW_USER_HOTLINK: process.env.ALLOW_USER_HOTLINK || 'not set'
    }
  });
});

// Twitter特定アカウントのRSSフィード生成
app.get('/twitter/:username/rss', async (c) => {
  try {
    const username = c.req.param('username');
    
    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }
    
    const now = new Date();
    
    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>@${username} のツイート</title>
    <description>${username}のツイートフィード（テスト版）</description>
    <link>https://twitter.com/${username}</link>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <generator>Twitter Bot RSSHub v1.0.0</generator>
    <item>
      <title>サンプルツイート #1</title>
      <description><![CDATA[これはサンプルのツイート内容です。実際のAPIでは、ここに${username}の最新ツイートが表示されます。]]></description>
      <pubDate>${now.toUTCString()}</pubDate>
      <link>https://twitter.com/${username}/status/1234567890</link>
      <guid>https://twitter.com/${username}/status/1234567890</guid>
    </item>
    <item>
      <title>サンプルツイート #2</title>
      <description><![CDATA[これは2番目のサンプルツイートです。時刻テスト用。]]></description>
      <pubDate>${new Date(now.getTime() - 3600000).toUTCString()}</pubDate>
      <link>https://twitter.com/${username}/status/1234567891</link>
      <guid>https://twitter.com/${username}/status/1234567891</guid>
    </item>
  </channel>
</rss>`;

    return c.text(rssContent, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    });
  } catch (error) {
    console.error('RSS生成エラー:', error);
    return c.json({ 
      error: 'RSS生成に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ヘルスチェック用エンドポイント
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0,
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      CACHE_TYPE: process.env.CACHE_TYPE || 'not set',
      ALLOW_USER_HOTLINK: process.env.ALLOW_USER_HOTLINK || 'not set'
    }
  });
});

// API情報
app.get('/api/info', (c) => {
  return c.json({
    name: 'Twitter Bot RSS API',
    version: '1.0.0',
    description: '特定のTwitterユーザーのツイートをRSSフィード形式で配信',
    endpoints: {
      'GET /': 'ホーム - API基本情報とステータス',
      'GET /twitter/:username/rss': 'ユーザーのツイートRSSフィード生成',
      'GET /health': 'ヘルスチェック - システム状態とEnvironment変数確認',
      'GET /api/info': 'API情報 - 利用可能なエンドポイント一覧'
    },
    usage: {
      example: '/twitter/example_user/rss',
      description: 'usernameを実際のTwitterユーザー名に置き換えてください',
      contentType: 'application/rss+xml'
    },
    notes: [
      '現在はサンプルデータを返します',
      '本格運用時には実際のTwitter APIまたはRSSHubを使用予定',
      'GASからのアクセスも想定した設計です'
    ]
  });
});

// エラーハンドリング
app.onError((err, c) => {
  console.error('アプリケーションエラー:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  }, 500);
});

// 404エラーハンドリング
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `エンドポイント '${c.req.path}' が見つかりません`,
    availableEndpoints: [
      '/',
      '/health', 
      '/api/info', 
      '/twitter/:username/rss'
    ],
    suggestion: 'GET /api/info でAPI仕様を確認してください',
    timestamp: new Date().toISOString()
  }, 404);
});

console.log('🚀 Twitter Bot RSSHub API が起動しました');

export default handle(app);
