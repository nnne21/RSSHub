// api/index.ts - Vercel標準形式
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url || '/';

  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（CORS preflight）
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ルーティング
  if (path === '/' || path === '/api' || path === '/api/') {
    return res.status(200).json({
      message: 'Twitter Auto-Reply Bot RSSHub',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: {
        CACHE_TYPE: process.env.CACHE_TYPE || 'not set',
        ALLOW_USER_HOTLINK: process.env.ALLOW_USER_HOTLINK || 'not set'
      }
    });
  }

  // ヘルスチェック
  if (path === '/health' || path === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        CACHE_TYPE: process.env.CACHE_TYPE || 'not set',
        ALLOW_USER_HOTLINK: process.env.ALLOW_USER_HOTLINK || 'not set'
      }
    });
  }

  // Twitter RSS
  if (path.startsWith('/twitter/') && path.endsWith('/rss')) {
    const pathParts = path.split('/');
    const username = pathParts[2];

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
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

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(rssContent);
  }

  // API情報
  if (path === '/api/info') {
    return res.status(200).json({
      name: 'Twitter Bot RSS API',
      version: '1.0.0',
      description: '特定のTwitterユーザーのツイートをRSSフィード形式で配信',
      endpoints: {
        'GET /': 'ホーム - API基本情報とステータス',
        'GET /twitter/:username/rss': 'ユーザーのツイートRSSフィード生成',
        'GET /health': 'ヘルスチェック - システム状態確認',
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
  }

  // 404 Not Found
  return res.status(404).json({
    error: 'Not Found',
    message: `エンドポイント '${path}' が見つかりません`,
    availableEndpoints: [
      '/',
      '/health',
      '/api/info',
      '/twitter/:username/rss'
    ],
    suggestion: 'GET /api/info でAPI仕様を確認してください',
    timestamp: new Date().toISOString()
  });
}
