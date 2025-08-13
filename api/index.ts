// api/index.ts - RSSHubプロキシ対応版
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url || '/';

  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // RSSプロキシ: /twitter/:username/rss
  if (path.startsWith('/twitter/') && path.endsWith('/rss')) {
    const pathParts = path.split('/');
    const username = pathParts[2];

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    try {
      // 自分のRSSHubサーバーに変更（例: https://rss-quficeari-tsunes-projects-xxxx.vercel.app）
      const rssHubBaseUrl = 'https://rsshub.app'; // ← 自前デプロイしている場合はそのURLに置き換え可
      const targetUrl = `${rssHubBaseUrl}/twitter/user/${username}`;

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).send(await response.text());
      }

      const rss = await response.text();
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      return res.status(200).send(rss);

    } catch (error) {
      return res.status(500).json({ error: 'RSS fetch failed', detail: String(error) });
    }
  }

  // その他エンドポイント（省略可）
  if (path === '/' || path === '/api') {
    return res.status(200).json({
      message: 'RSSHub Proxy API for Twitter Auto-Reply Bot',
      endpoints: ['/twitter/:username/rss']
    });
  }

  return res.status(404).json({
    error: 'Not Found',
    message: `エンドポイント '${path}' は存在しません`
  });
}
