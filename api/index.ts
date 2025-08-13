// api/index.ts - Vercel標準形式（RSSHub中継対応版）
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // ← 必須: `node-fetch` を使って外部RSSを取得

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  // ルートアクセスや基本情報返却
  if (path === '/' || path === '/api' || path === '/api/') {
    return res.status(200).json({
      message: 'Twitter Auto-Reply Bot RSS API',
      status: 'running',
      version: '1.1.0',
      timestamp: new Date().toISOString()
    });
  }

  // ヘルスチェック
  if (path === '/health' || path === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }

  // Twitter RSS中継（/twitter/:username/rss）
  if (path.startsWith('/twitter/') && path.endsWith('/rss')) {
    const parts = path.split('/');
    const username = parts[2];

    if (!username) {
      return res.status(400).json({ error: 'Username is required in the URL' });
    }

    const rssHubURL = `https://rsshub.app/twitter/user/${username}`;

    try {
      const rssResponse = await fetch(rssHubURL);
      if (!rssResponse.ok) {
        return res.status(rssResponse.status).send(`RSSHub error: ${rssResponse.statusText}`);
      }

      const rssText = await rssResponse.text();

      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).send(rssText);

    } catch (error) {
      return res.status(500).json({
        error: 'RSS fetch failed',
        details: String(error)
      });
    }
  }

  // APIエンドポイント情報
  if (path === '/api/info') {
    return res.status(200).json({
      name: 'Twitter Bot RSS API',
      version: '1.1.0',
      description: 'Twitter RSSフィードをRSSHub経由で提供',
      endpoints: {
        'GET /': 'API基本情報',
        'GET /twitter/:username/rss': 'TwitterユーザーのRSS（RSSHub中継）',
        'GET /health': 'システムの状態確認',
        'GET /api/info': 'API仕様の詳細'
      },
      usage: {
        example: '/twitter/example_user/rss',
        notes: [
          'username には対象のTwitterユーザー名を指定してください',
          'RSSHubに依存しているため、一部のユーザーで取得に失敗する場合があります'
        ]
      }
    });
  }

  // 未定義ルート
  return res.status(404).json({
    error: 'Not Found',
    message: `エンドポイント '${path}' は存在しません`,
    suggestion: 'GET /api/info で利用可能なエンドポイントを確認してください',
    timestamp: new Date().toISOString()
  });
}
