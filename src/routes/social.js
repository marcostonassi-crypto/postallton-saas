import { Router } from 'express';
import { query }   from '../models/db.js';

export const socialRouter = Router();

const OAUTH_CONFIGS = {
  instagram: {
    authUrl:   'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl:  'https://graph.facebook.com/v19.0/oauth/access_token',
    scope:     'instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_posts',
    clientId:  () => process.env.META_APP_ID,
    clientSec: () => process.env.META_APP_SECRET,
  },
  facebook: {
    authUrl:   'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl:  'https://graph.facebook.com/v19.0/oauth/access_token',
    scope:     'pages_manage_posts,pages_read_engagement',
    clientId:  () => process.env.META_APP_ID,
    clientSec: () => process.env.META_APP_SECRET,
  },
  linkedin: {
    authUrl:   'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl:  'https://www.linkedin.com/oauth/v2/accessToken',
    scope:     'w_member_social r_liteprofile',
    clientId:  () => process.env.LINKEDIN_CLIENT_ID,
    clientSec: () => process.env.LINKEDIN_CLIENT_SECRET,
  },
  twitter: {
    authUrl:   'https://twitter.com/i/oauth2/authorize',
    tokenUrl:  'https://api.twitter.com/2/oauth2/token',
    scope:     'tweet.read tweet.write users.read offline.access',
    clientId:  () => process.env.TWITTER_API_KEY,
    clientSec: () => process.env.TWITTER_API_SECRET,
  },
  youtube: {
    authUrl:   'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl:  'https://oauth2.googleapis.com/token',
    scope:     'https://www.googleapis.com/auth/youtube.upload',
    clientId:  () => process.env.YOUTUBE_CLIENT_ID,
    clientSec: () => process.env.YOUTUBE_CLIENT_SECRET,
    extra:     { access_type: 'offline', prompt: 'consent' },
  },
  tiktok: {
    authUrl:   'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl:  'https://open.tiktokapis.com/v2/oauth/token/',
    scope:     'user.info.basic,video.publish',
    clientId:  () => process.env.TIKTOK_CLIENT_KEY,
    clientSec: () => process.env.TIKTOK_CLIENT_SECRET,
  },
  pinterest: {
    authUrl:   'https://www.pinterest.com/oauth',
    tokenUrl:  'https://api.pinterest.com/v5/oauth/token',
    scope:     'boards:read,pins:write',
    clientId:  () => process.env.PINTEREST_APP_ID,
    clientSec: () => process.env.PINTEREST_APP_SECRET,
  },
  reddit: {
    authUrl:   'https://www.reddit.com/api/v1/authorize',
    tokenUrl:  'https://www.reddit.com/api/v1/access_token',
    scope:     'submit identity',
    clientId:  () => process.env.REDDIT_CLIENT_ID,
    clientSec: () => process.env.REDDIT_CLIENT_SECRET,
    extra:     { duration: 'permanent' },
  },
};

// ── GET /api/social/connections ────────────────────────────────────
// Lista todas as redes conectadas do usuário
socialRouter.get('/connections', async (req, res) => {
  const { rows } = await query(
    `SELECT platform, account_name, account_url, connected_at
     FROM social_connections WHERE user_id = $1`,
    [req.user.id]
  );
  res.json({ connections: rows });
});

// ── GET /api/social/connect/:platform ─────────────────────────────
// Inicia OAuth para uma rede específica
socialRouter.get('/connect/:platform', (req, res) => {
  const { platform } = req.params;
  const config = OAUTH_CONFIGS[platform];
  if (!config) return res.status(404).json({ error: 'Plataforma não suportada.' });

  // Codificar userId no state para recuperar no callback
  const state  = Buffer.from(JSON.stringify({ userId: req.user.id, platform })).toString('base64');
  const params = new URLSearchParams({
    client_id:     config.clientId(),
    redirect_uri:  `${process.env.APP_URL}/api/social/callback/${platform}`,
    response_type: 'code',
    scope:         config.scope,
    state,
    ...(config.extra || {}),
  });

  res.json({ authUrl: `${config.authUrl}?${params}` });
});

// ── GET /api/social/callback/:platform ────────────────────────────
// Callback OAuth — troca code por token e salva no banco
socialRouter.get('/callback/:platform', async (req, res) => {
  const { platform } = req.params;
  const { code, state, error } = req.query;

  if (error) return res.redirect(`${process.env.FRONTEND_URL}?social_error=${error}`);

  const config = OAUTH_CONFIGS[platform];
  if (!config) return res.status(404).json({ error: 'Plataforma não suportada.' });

  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId } = stateData;

    // Trocar code por access_token
    const tokenRes = await fetch(config.tokenUrl, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        ...(platform === 'reddit' ? {
          Authorization: `Basic ${Buffer.from(`${config.clientId()}:${config.clientSec()}`).toString('base64')}`,
        } : {}),
      },
      body: new URLSearchParams({
        client_id:     config.clientId(),
        client_secret: config.clientSec(),
        redirect_uri:  `${process.env.APP_URL}/api/social/callback/${platform}`,
        grant_type:    'authorization_code',
        code,
      }).toString(),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    // Buscar nome da conta na plataforma
    const accountInfo = await getAccountInfo(platform, tokens.access_token);

    // Salvar no banco (upsert)
    await query(
      `INSERT INTO social_connections
         (user_id, platform, access_token, refresh_token, token_expires, account_id, account_name, account_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, platform) DO UPDATE SET
         access_token  = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expires = EXCLUDED.token_expires,
         account_id    = EXCLUDED.account_id,
         account_name  = EXCLUDED.account_name,
         account_url   = EXCLUDED.account_url,
         connected_at  = NOW()`,
      [
        userId, platform,
        tokens.access_token,
        tokens.refresh_token || null,
        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        accountInfo.id   || null,
        accountInfo.name || platform,
        accountInfo.url  || null,
      ]
    );

    res.redirect(`${process.env.FRONTEND_URL}?social_connected=${platform}`);
  } catch (err) {
    console.error(`[SOCIAL OAUTH ${platform}]`, err.message);
    res.redirect(`${process.env.FRONTEND_URL}?social_error=${encodeURIComponent(err.message)}`);
  }
});

// ── DELETE /api/social/disconnect/:platform ────────────────────────
socialRouter.delete('/disconnect/:platform', async (req, res) => {
  await query(
    'DELETE FROM social_connections WHERE user_id = $1 AND platform = $2',
    [req.user.id, req.params.platform]
  );
  res.json({ message: `${req.params.platform} desconectado com sucesso.` });
});

// ── Helper: buscar nome da conta na plataforma ─────────────────────
async function getAccountInfo(platform, token) {
  try {
    if (platform === 'instagram' || platform === 'facebook') {
      const r = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name`);
      const d = await r.json();
      return { id: d.id, name: d.name };
    }
    if (platform === 'linkedin') {
      const r = await fetch('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      return { id: d.id, name: `${d.localizedFirstName} ${d.localizedLastName}` };
    }
    if (platform === 'twitter') {
      const r = await fetch('https://api.twitter.com/2/users/me', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      return { id: d.data?.id, name: d.data?.name, url: `https://x.com/${d.data?.username}` };
    }
    if (platform === 'youtube') {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      return { id: d.sub, name: d.name };
    }
    if (platform === 'reddit') {
      const r = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'PostAllTon/2.0' },
      });
      const d = await r.json();
      return { id: d.id, name: d.name, url: `https://reddit.com/u/${d.name}` };
    }
    if (platform === 'bluesky') {
      return { name: 'Bluesky' };
    }
    return { name: platform };
  } catch {
    return { name: platform };
  }
}
