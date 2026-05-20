import { Router } from 'express';
import { query }   from '../models/db.js';

export const postRouter = Router();

// POST /api/post
postRouter.post('/', async (req, res) => {
  const { caption, platforms = [], mediaUrls = [], scheduleDate } = req.body;
  const userId = req.user.id;

  if (!caption && !mediaUrls.length) return res.status(400).json({ error: 'caption obrigatório.' });
  if (!platforms.length) return res.status(400).json({ error: 'Selecione ao menos uma plataforma.' });

  // Buscar credenciais do usuário para as plataformas selecionadas
  const { rows: conns } = await query(
    `SELECT platform, access_token, refresh_token, account_id, account_name, extra_data
     FROM social_connections WHERE user_id = $1 AND platform = ANY($2)`,
    [userId, platforms]
  );

  const connMap = {};
  conns.forEach(c => { connMap[c.platform] = c; });

  const notConnected = platforms.filter(p => !connMap[p]);
  if (notConnected.length > 0) {
    return res.status(400).json({
      error: `Redes não conectadas: ${notConnected.join(', ')}`,
      action: 'connect_social',
      platforms: notConnected,
    });
  }

  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const conn = connMap[platform];
      try {
        const result = await publish(platform, conn, { caption, mediaUrls, scheduleDate });
        return { platform, ok: true, ...result };
      } catch(e) {
        return { platform, ok: false, error: e.message };
      }
    })
  );

  const postIds = [], errors = [];
  results.forEach(r => {
    const d = r.status === 'fulfilled' ? r.value : { ok:false, error: r.reason?.message };
    d.ok ? postIds.push(d) : errors.push({ platform: d.platform, message: d.error });
  });

  await query(
    `INSERT INTO posts (user_id, caption, media_urls, platforms, results, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, caption, mediaUrls, platforms, JSON.stringify({postIds,errors}),
     errors.length === platforms.length ? 'failed' : 'published']
  );

  res.json({ id:`pat_${Date.now()}`, postIds, errors, publishedAt: new Date().toISOString() });
});

// GET /api/post/history
postRouter.get('/history', async (req, res) => {
  const { rows } = await query(
    `SELECT id, caption, media_urls, platforms, results, status, published_at
     FROM posts WHERE user_id = $1 ORDER BY published_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json({ history: rows });
});

// ── Publicar por plataforma usando credenciais do usuário ─────────
async function publish(platform, conn, { caption, mediaUrls }) {
  const extra = conn.extra_data || {};
  const token = conn.access_token;

  switch(platform) {
    case 'telegram': {
      const channelId = conn.refresh_token; // channel_id salvo como refresh_token
      const endpoint = mediaUrls.length > 0 ? 'sendPhoto' : 'sendMessage';
      const body = mediaUrls.length > 0
        ? { chat_id: channelId, photo: mediaUrls[0], caption, parse_mode: 'HTML' }
        : { chat_id: channelId, text: caption, parse_mode: 'HTML' };
      const r = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.description);
      return { postId: d.result.message_id.toString(), postUrl: `https://t.me/${channelId.replace('@','')}/${d.result.message_id}` };
    }

    case 'bluesky': {
      // identifier salvo como access_token, password salvo como refresh_token
      const identifier = conn.account_id || conn.access_token;
      const password   = conn.refresh_token || token;
      const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ identifier, password })
      });
      const session = await sessionRes.json();
      if (!session.accessJwt) throw new Error(session.message || 'Auth failed');
      const record = { $type:'app.bsky.feed.post', text:caption.slice(0,300), createdAt:new Date().toISOString() };
      if (mediaUrls.length > 0) {
        const imgRes = await fetch(mediaUrls[0]);
        const imgBuf = await imgRes.arrayBuffer();
        const mime   = imgRes.headers.get('content-type') || 'image/jpeg';
        const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
          method:'POST', headers:{'Authorization':`Bearer ${session.accessJwt}`,'Content-Type':mime}, body:imgBuf
        });
        const blobData = await blobRes.json();
        record.embed = { $type:'app.bsky.embed.images', images:[{image:blobData.blob, alt:caption.slice(0,100)}] };
      }
      const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method:'POST',
        headers:{'Authorization':`Bearer ${session.accessJwt}`,'Content-Type':'application/json'},
        body: JSON.stringify({ repo:session.did, collection:'app.bsky.feed.post', record })
      });
      const pd = await postRes.json();
      if (pd.error) throw new Error(pd.message);
      const rkey = pd.uri?.split('/').pop();
      return { postId:pd.uri, postUrl:`https://bsky.app/profile/${identifier}/post/${rkey}` };
    }

    case 'instagram': {
      const igId = conn.refresh_token; // business_account_id
      if (!mediaUrls.length) throw new Error('Instagram requer imagem.');
      const c = await fetch(`https://graph.facebook.com/v19.0/${igId}/media?image_url=${encodeURIComponent(mediaUrls[0])}&caption=${encodeURIComponent(caption)}&access_token=${token}`,{method:'POST'});
      const cd = await c.json();
      if (cd.error) throw new Error(cd.error.message);
      const p = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish?creation_id=${cd.id}&access_token=${token}`,{method:'POST'});
      const pd = await p.json();
      if (pd.error) throw new Error(pd.error.message);
      return { postId:pd.id, postUrl:`https://www.instagram.com/p/${pd.id}/` };
    }

    case 'facebook': {
      const pageId = conn.refresh_token;
      const endpoint = mediaUrls.length > 0 ? 'photos' : 'feed';
      const body = mediaUrls.length > 0
        ? { url:mediaUrls[0], caption, access_token:token }
        : { message:caption, access_token:token };
      const r = await fetch(`https://graph.facebook.com/v19.0/${pageId}/${endpoint}`,{
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return { postId:d.id, postUrl:`https://www.facebook.com/${d.id}` };
    }

    case 'twitter': {
      const body = { text: caption };
      const r = await fetch('https://api.twitter.com/2/tweets', {
        method:'POST',
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });
      const d = await r.json();
      if (d.errors) throw new Error(d.errors[0]?.message || 'Twitter error');
      return { postId:d.data?.id, postUrl:`https://x.com/i/web/status/${d.data?.id}` };
    }

    case 'linkedin': {
      const personUrn = conn.refresh_token;
      const r = await fetch('https://api.linkedin.com/v2/ugcPosts',{
        method:'POST',
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json','X-Restli-Protocol-Version':'2.0.0'},
        body:JSON.stringify({
          author:personUrn, lifecycleState:'PUBLISHED',
          specificContent:{'com.linkedin.ugc.ShareContent':{shareCommentary:{text:caption},shareMediaCategory:'NONE'}},
          visibility:{'com.linkedin.ugc.MemberNetworkVisibility':'PUBLIC'}
        })
      });
      const d = await r.json();
      if (d.message) throw new Error(d.message);
      return { postId:d.id, postUrl:`https://www.linkedin.com/feed/update/${d.id}` };
    }

    case 'reddit': {
      // Reddit usa credenciais salvas no extra_data para obter token
      const creds = typeof extra === 'string' ? JSON.parse(extra) : extra;
      const tokRes = await fetch('https://www.reddit.com/api/v1/access_token',{
        method:'POST',
        headers:{
          'Authorization':`Basic ${Buffer.from(`${creds.client_id}:${creds.client_secret}`).toString('base64')}`,
          'Content-Type':'application/x-www-form-urlencoded','User-Agent':'PostAllTon/3.0'
        },
        body:new URLSearchParams({grant_type:'password',username:creds.username,password:creds.password}).toString()
      });
      const tok = await tokRes.json();
      if (!tok.access_token) throw new Error('Reddit auth failed');
      const r = await fetch('https://oauth.reddit.com/api/submit',{
        method:'POST',
        headers:{'Authorization':`Bearer ${tok.access_token}`,'Content-Type':'application/x-www-form-urlencoded','User-Agent':'PostAllTon/3.0'},
        body:new URLSearchParams({sr:creds.subreddit||'u_'+creds.username,kind:'self',title:caption.slice(0,300),text:caption}).toString()
      });
      const d = await r.json();
      if (d.json?.errors?.length) throw new Error(d.json.errors[0][1]);
      return { postId:d.json?.data?.id||'ok', postUrl:`https://reddit.com/r/${creds.subreddit||creds.username}` };
    }

    case 'whatsapp': {
      const creds = typeof extra === 'string' ? JSON.parse(extra) : extra;
      const body = { messaging_product:'whatsapp', to:creds.phone_number, type:'text', text:{body:caption} };
      const r = await fetch(`https://graph.facebook.com/v19.0/${creds.phone_number_id}/messages`,{
        method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify(body)
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return { postId:d.messages?.[0]?.id||'ok', postUrl:'https://wa.me/' };
    }

    case 'pinterest': {
      const boardId = conn.refresh_token;
      const body = { board_id:boardId, title:caption.slice(0,100), description:caption };
      if (mediaUrls.length) body.media_source = { source_type:'image_url', url:mediaUrls[0] };
      const r = await fetch('https://api.pinterest.com/v5/pins',{
        method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify(body)
      });
      const d = await r.json();
      if (d.code) throw new Error(d.message);
      return { postId:d.id, postUrl:`https://www.pinterest.com/pin/${d.id}/` };
    }

    case 'threads': {
      const userId = conn.refresh_token;
      const params = new URLSearchParams({
        media_type: mediaUrls.length ? 'IMAGE' : 'TEXT',
        text: caption, access_token: token,
        ...(mediaUrls.length ? {image_url:mediaUrls[0]} : {})
      });
      const c = await fetch(`https://graph.threads.net/v1.0/${userId}/threads?${params}`,{method:'POST'});
      const cd = await c.json();
      if (cd.error) throw new Error(cd.error.message);
      await new Promise(r=>setTimeout(r,3000));
      const p = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish?creation_id=${cd.id}&access_token=${token}`,{method:'POST'});
      const pd = await p.json();
      if (pd.error) throw new Error(pd.error.message);
      return { postId:pd.id, postUrl:`https://www.threads.net/t/${pd.id}` };
    }

    default:
      throw new Error(`${platform} não implementado ainda.`);
  }
}
