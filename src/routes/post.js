import { Router } from 'express';
import { query }   from '../models/db.js';

export const postRouter = Router();

// ── POST /api/post ─────────────────────────────────────────────────
postRouter.post('/', async (req, res) => {
  const { caption, platforms = [], mediaUrls = [], scheduleDate } = req.body;
  const userId = req.user.id;

  if (!caption && mediaUrls.length === 0) {
    return res.status(400).json({ error: 'caption ou mediaUrls são obrigatórios.' });
  }

  // Buscar tokens do usuário para as plataformas selecionadas
  const { rows: connections } = await query(
    `SELECT platform, access_token, refresh_token, account_id, extra_data
     FROM social_connections WHERE user_id = $1 AND platform = ANY($2)`,
    [userId, platforms]
  );

  const connMap = {};
  connections.forEach(c => { connMap[c.platform] = c; });

  // Verificar quais plataformas estão conectadas
  const notConnected = platforms.filter(p => !connMap[p]);
  if (notConnected.length > 0) {
    return res.status(400).json({
      error:    `Redes não conectadas: ${notConnected.join(', ')}`,
      action:   'connect_social',
      platforms: notConnected,
    });
  }

  // Publicar em paralelo usando o token de CADA cliente
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const conn = connMap[platform];
      try {
        const result = await publishWithUserToken(platform, conn, { caption, mediaUrls, scheduleDate });
        return { platform, ok: true, ...result };
      } catch (err) {
        return { platform, ok: false, error: err.message };
      }
    })
  );

  const postIds = [];
  const errors  = [];

  results.forEach(r => {
    const d = r.status === 'fulfilled' ? r.value : { ok: false, error: r.reason?.message };
    d.ok ? postIds.push(d) : errors.push({ platform: d.platform, message: d.error });
  });

  // Salvar no histórico
  await query(
    `INSERT INTO posts (user_id, caption, media_urls, platforms, results, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, caption, mediaUrls, platforms, JSON.stringify({ postIds, errors }),
      errors.length === platforms.length ? 'failed' : 'published']
  );

  res.json({ id: `pat_${Date.now()}`, postIds, errors, publishedAt: new Date().toISOString() });
});

// ── GET /api/post/history ─────────────────────────────────────────
postRouter.get('/history', async (req, res) => {
  const { rows } = await query(
    `SELECT id, caption, media_urls, platforms, results, status, published_at
     FROM posts WHERE user_id = $1 ORDER BY published_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json({ history: rows });
});

// ── Publicar usando o token do usuário ────────────────────────────
async function publishWithUserToken(platform, conn, { caption, mediaUrls }) {
  const token = conn.access_token;

  switch (platform) {
    case 'instagram': {
      const igId = conn.account_id;
      if (!igId) throw new Error('Instagram: account_id não encontrado. Reconecte a conta.');
      if (mediaUrls.length === 0) throw new Error('Instagram requer imagem ou vídeo.');
      const c = await fetch(`https://graph.facebook.com/v19.0/${igId}/media?image_url=${encodeURIComponent(mediaUrls[0])}&caption=${encodeURIComponent(caption)}&access_token=${token}`,{ method:'POST' });
      const cd = await c.json();
      if (cd.error) throw new Error(cd.error.message);
      const p = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish?creation_id=${cd.id}&access_token=${token}`,{ method:'POST' });
      const pd = await p.json();
      if (pd.error) throw new Error(pd.error.message);
      return { postId: pd.id, postUrl: `https://www.instagram.com/p/${pd.id}/` };
    }

    case 'facebook': {
      const pageId = conn.account_id;
      const endpoint = mediaUrls.length > 0 ? 'photos' : 'feed';
      const body = mediaUrls.length > 0
        ? { url: mediaUrls[0], caption, access_token: token }
        : { message: caption, access_token: token };
      const r = await fetch(`https://graph.facebook.com/v19.0/${pageId}/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return { postId: d.id, postUrl: `https://www.facebook.com/${d.id}` };
    }

    case 'twitter': {
      const body = { text: caption };
      if (mediaUrls.length > 0) {
        // Upload de mídia usando token do usuário
        const mediaId = await uploadTwitterMedia(token, mediaUrls[0]);
        body.media = { media_ids: [mediaId] };
      }
      const r = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.errors) throw new Error(d.errors[0].message);
      return { postId: d.data?.id, postUrl: `https://x.com/i/web/status/${d.data?.id}` };
    }

    case 'linkedin': {
      const personUrn = conn.account_id ? `urn:li:person:${conn.account_id}` : null;
      if (!personUrn) throw new Error('LinkedIn: reconecte sua conta para obter o ID de perfil.');
      const r = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author:          personUrn,
          lifecycleState:  'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary:    { text: caption },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }),
      });
      const d = await r.json();
      if (d.message) throw new Error(d.message);
      return { postId: d.id, postUrl: `https://www.linkedin.com/feed/update/${d.id}` };
    }

    case 'telegram': {
      const channelId = conn.account_id;
      if (!channelId) throw new Error('Telegram: reconecte o canal.');
      const endpoint = mediaUrls.length > 0 ? 'sendPhoto' : 'sendMessage';
      const body = mediaUrls.length > 0
        ? { chat_id: channelId, photo: mediaUrls[0], caption, parse_mode: 'HTML' }
        : { chat_id: channelId, text: caption, parse_mode: 'HTML' };
      const r = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.description);
      return { postId: d.result.message_id.toString(), postUrl: `https://t.me/${channelId.replace('@','')}/${d.result.message_id}` };
    }

    case 'bluesky': {
      const identifier = conn.account_id;
      const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: token }),
      });
      const session = await sessionRes.json();
      if (!session.accessJwt) throw new Error(`Bluesky: ${session.message}`);
      const record = { $type: 'app.bsky.feed.post', text: caption.slice(0, 300), createdAt: new Date().toISOString() };
      const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.accessJwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: session.did, collection: 'app.bsky.feed.post', record }),
      });
      const postData = await postRes.json();
      if (postData.error) throw new Error(postData.message);
      const rkey = postData.uri?.split('/').pop();
      return { postId: postData.uri, postUrl: `https://bsky.app/profile/${identifier}/post/${rkey}` };
    }

    case 'reddit': {
      const subr = conn.account_id || 'self';
      const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PostAllTon/2.0',
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: conn.refresh_token }).toString(),
      });
      const tokens = await tokenRes.json();
      const r = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokens.access_token}`, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'PostAllTon/2.0' },
        body: new URLSearchParams({ sr: subr, kind: 'self', title: caption.slice(0, 300), text: caption }).toString(),
      });
      const d = await r.json();
      if (d.json?.errors?.length > 0) throw new Error(d.json.errors[0][1]);
      return { postId: d.json?.data?.id || 'ok', postUrl: `https://reddit.com/r/${subr}` };
    }

    default:
      throw new Error(`Plataforma ${platform} não implementada ainda.`);
  }
}

async function uploadTwitterMedia(token, imageUrl) {
  const imgRes = await fetch(imageUrl);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer()).toString('base64');
  const r = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ media_data: imgBuf }).toString(),
  });
  const d = await r.json();
  if (!d.media_id_string) throw new Error('Twitter: falha no upload de mídia.');
  return d.media_id_string;
}
