/**
 * CREDENCIAIS DE REDES SOCIAIS POR USUÁRIO
 * Cada cliente configura suas próprias chaves dentro do app
 */
import { Router } from 'express';
import { query }   from '../models/db.js';

export const credRouter = Router();

// ── Redes que usam chaves simples (não OAuth) ─────────────────────
const SIMPLE_NETS = {
  telegram:  ['bot_token','channel_id'],
  bluesky:   ['identifier','password'],
  whatsapp:  ['phone_number_id','access_token','phone_number'],
  reddit:    ['client_id','client_secret','username','password','subreddit'],
  youtube:   ['refresh_token'],
  tiktok:    ['access_token'],
  instagram: ['access_token','business_account_id'],
  facebook:  ['access_token','page_id'],
  linkedin:  ['access_token','person_urn'],
  twitter:   ['api_key','api_secret','access_token','access_token_secret'],
  pinterest: ['access_token','board_id'],
  threads:   ['access_token','user_id'],
};

// GET /api/creds — lista todas as credenciais do usuário (sem valores sensíveis)
credRouter.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT platform, account_name, account_url, connected_at,
            CASE WHEN access_token IS NOT NULL THEN true ELSE false END as connected
     FROM social_connections WHERE user_id = $1`,
    [req.user.id]
  );
  res.json({ connections: rows });
});

// POST /api/creds/:platform — salvar credenciais de uma rede
credRouter.post('/:platform', async (req, res) => {
  const { platform } = req.params;
  const fields = SIMPLE_NETS[platform];

  if (!fields) return res.status(400).json({ error: 'Plataforma não suportada.' });

  const creds = req.body;

  // Validar campos obrigatórios
  const missing = fields.filter(f => !creds[f]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  // Testar conexão antes de salvar
  const testResult = await testConnection(platform, creds);
  if (!testResult.ok) {
    return res.status(400).json({ error: `Credenciais inválidas: ${testResult.error}` });
  }

  // Salvar no banco (upsert)
  await query(
    `INSERT INTO social_connections
       (user_id, platform, access_token, refresh_token, account_id, account_name, account_url, extra_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, platform) DO UPDATE SET
       access_token  = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       account_id    = EXCLUDED.account_id,
       account_name  = EXCLUDED.account_name,
       account_url   = EXCLUDED.account_url,
       extra_data    = EXCLUDED.extra_data,
       connected_at  = NOW()`,
    [
      req.user.id,
      platform,
      creds[fields[0]],                    // token principal
      creds[fields[1]] || null,            // token secundário
      testResult.accountId   || null,
      testResult.accountName || platform,
      testResult.accountUrl  || null,
      JSON.stringify(creds),               // todas as credenciais
    ]
  );

  // Salvar preferência de rede ativa
  await query(
    `INSERT INTO user_preferences (user_id, preferred_networks)
     VALUES ($1, ARRAY[$2])
     ON CONFLICT (user_id) DO UPDATE SET
       preferred_networks = array_append(
         array_remove(user_preferences.preferred_networks, $2::text),
         $2::text
       )`,
    [req.user.id, platform]
  );

  res.json({
    message: `${platform} conectado com sucesso!`,
    platform,
    accountName: testResult.accountName,
  });
});

// DELETE /api/creds/:platform — remover credenciais
credRouter.delete('/:platform', async (req, res) => {
  await query(
    'DELETE FROM social_connections WHERE user_id = $1 AND platform = $2',
    [req.user.id, req.params.platform]
  );
  // Remover das preferências
  await query(
    `UPDATE user_preferences SET
       preferred_networks = array_remove(preferred_networks, $2)
     WHERE user_id = $1`,
    [req.user.id, req.params.platform]
  );
  res.json({ message: `${req.params.platform} desconectado.` });
});

// GET /api/creds/preferences — preferências salvas do usuário
credRouter.get('/preferences', async (req, res) => {
  const { rows } = await query(
    'SELECT preferred_networks FROM user_preferences WHERE user_id = $1',
    [req.user.id]
  );
  res.json({ preferredNetworks: rows[0]?.preferred_networks || [] });
});

// ── Testar conexão antes de salvar ────────────────────────────────
async function testConnection(platform, creds) {
  try {
    switch(platform) {
      case 'telegram': {
        const r = await fetch(`https://api.telegram.org/bot${creds.bot_token}/getMe`);
        const d = await r.json();
        if (!d.ok) throw new Error(d.description);
        return { ok:true, accountName:`@${d.result.username}`, accountId: d.result.id?.toString() };
      }
      case 'bluesky': {
        const r = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({identifier:creds.identifier, password:creds.password})
        });
        const d = await r.json();
        if (!d.accessJwt) throw new Error(d.message || 'Credenciais inválidas');
        return { ok:true, accountName:creds.identifier, accountId:d.did, accountUrl:`https://bsky.app/profile/${creds.identifier}` };
      }
      case 'instagram':
      case 'facebook':
      case 'threads': {
        const r = await fetch(`https://graph.facebook.com/me?access_token=${creds.access_token}&fields=id,name`);
        const d = await r.json();
        if (d.error) throw new Error(d.error.message);
        return { ok:true, accountName:d.name, accountId:d.id };
      }
      case 'twitter': {
        return { ok:true, accountName:'Twitter/X' };
      }
      case 'linkedin': {
        const r = await fetch('https://api.linkedin.com/v2/me', {
          headers:{'Authorization':`Bearer ${creds.access_token}`}
        });
        const d = await r.json();
        if (d.status === 401) throw new Error('Token inválido');
        return { ok:true, accountName:`${d.localizedFirstName||''} ${d.localizedLastName||''}`.trim()||'LinkedIn', accountId:d.id };
      }
      case 'reddit': {
        const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
          method:'POST',
          headers:{
            'Authorization':`Basic ${Buffer.from(`${creds.client_id}:${creds.client_secret}`).toString('base64')}`,
            'Content-Type':'application/x-www-form-urlencoded','User-Agent':'PostAllTon/2.0'
          },
          body: new URLSearchParams({grant_type:'password',username:creds.username,password:creds.password}).toString()
        });
        const d = await tokenRes.json();
        if (!d.access_token) throw new Error('Credenciais inválidas');
        return { ok:true, accountName:`u/${creds.username}`, accountUrl:`https://reddit.com/u/${creds.username}` };
      }
      case 'whatsapp': {
        const r = await fetch(`https://graph.facebook.com/v19.0/${creds.phone_number_id}?access_token=${creds.access_token}`);
        const d = await r.json();
        if (d.error) throw new Error(d.error.message);
        return { ok:true, accountName:creds.phone_number||d.display_phone_number||'WhatsApp', accountId:creds.phone_number_id };
      }
      default:
        return { ok:true, accountName:platform };
    }
  } catch(e) {
    return { ok:false, error:e.message };
  }
}
