import { Router } from 'express';
import { query }   from '../models/db.js';
import { getFinancialSummary } from '../services/subscription.js';

export const userRouter = Router();

// GET /api/user/me
userRouter.get('/me', async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.avatar, u.plan, u.plan_type, u.status,
            s.current_period_end, s.provider, s.billing_type
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
     WHERE u.id = $1`,
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: rows[0] });
});

// GET /api/user/dashboard — painel financeiro (só para admins)
userRouter.get('/dashboard', async (req, res) => {
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: 'Acesso restrito.' });
  }

  const summary = await getFinancialSummary();
  const { rows: recentPayments } = await query(
    `SELECT p.amount_cents, p.currency, p.provider, p.status, p.paid_at,
            u.name, u.email, u.plan
     FROM payments p JOIN users u ON u.id = p.user_id
     ORDER BY p.paid_at DESC LIMIT 20`
  );
  const { rows: subscribers } = await query(
    `SELECT u.name, u.email, u.plan, u.plan_type, u.status, u.created_at,
            s.current_period_end, s.provider
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
     WHERE u.plan != 'free'
     ORDER BY u.created_at DESC`
  );

  res.json({
    summary: {
      activeSubscribers:  parseInt(summary.active_subscribers || 0),
      basicCount:         parseInt(summary.basic_count || 0),
      proCount:           parseInt(summary.pro_count || 0),
      businessCount:      parseInt(summary.business_count || 0),
      totalRevenueBRL:    (parseInt(summary.total_revenue_cents || 0) / 100).toFixed(2),
      paymentsThisMonth:  parseInt(summary.payments_this_month || 0),
    },
    recentPayments,
    subscribers,
  });
});

// POST /api/user/activate — ativa plano Business para o admin
// Protegido por chave secreta definida no .env
userRouter.post('/activate', async (req, res) => {
  const { secret, email, plan = 'business' } = req.body;
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'postallton_admin_2026';

  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Chave secreta inválida.' });
  }

  const targetEmail = email || process.env.ADMIN_EMAILS?.split(',')[0]?.trim();
  if (!targetEmail) return res.status(400).json({ error: 'Email não informado.' });

  const { rows } = await query(
    `UPDATE users SET plan = $1, plan_type = 'lifetime', status = 'active', updated_at = NOW()
     WHERE email = $2 RETURNING id, name, email, plan, plan_type, status`,
    [plan, targetEmail]
  );

  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });

  res.json({ message: `Plano ${plan} ativado com sucesso!`, user: rows[0] });
});

// PUT /api/user/me — atualizar perfil
userRouter.put('/me', async (req, res) => {
  const { name } = req.body;
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($1, name), updated_at = NOW()
     WHERE id = $2 RETURNING id, name, email, plan, status`,
    [name, req.user.id]
  );
  res.json({ user: rows[0] });
});


// GET /api/user/dashboard — painel financeiro (só para admins)
// Para uso pessoal: crie um usuário admin no banco e use este endpoint
userRouter.get('/dashboard', async (req, res) => {
  // Verificar se é admin (adicione seu email aqui)
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: 'Acesso restrito.' });
  }

  const summary = await getFinancialSummary();
  const { rows: recentPayments } = await query(
    `SELECT p.amount_cents, p.currency, p.provider, p.status, p.paid_at,
            u.name, u.email, u.plan
     FROM payments p JOIN users u ON u.id = p.user_id
     ORDER BY p.paid_at DESC LIMIT 20`
  );
  const { rows: subscribers } = await query(
    `SELECT u.name, u.email, u.plan, u.plan_type, u.status, u.created_at,
            s.current_period_end, s.provider
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
     WHERE u.plan != 'free'
     ORDER BY u.created_at DESC`
  );

  res.json({
    summary: {
      activeSubscribers:  parseInt(summary.active_subscribers || 0),
      basicCount:         parseInt(summary.basic_count || 0),
      proCount:           parseInt(summary.pro_count || 0),
      businessCount:      parseInt(summary.business_count || 0),
      totalRevenueBRL:    (parseInt(summary.total_revenue_cents || 0) / 100).toFixed(2),
      paymentsThisMonth:  parseInt(summary.payments_this_month || 0),
    },
    recentPayments,
    subscribers,
  });
});

// PUT /api/user/me — atualizar perfil
userRouter.put('/me', async (req, res) => {
  const { name } = req.body;
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($1, name), updated_at = NOW()
     WHERE id = $2 RETURNING id, name, email, plan, status`,
    [name, req.user.id]
  );
  res.json({ user: rows[0] });
});

// GET /api/user/preferences
userRouter.get('/preferences', async (req, res) => {
  const { rows } = await query(
    `SELECT preferred_networks, audience_profile, language, timezone
     FROM user_preferences WHERE user_id = $1`,
    [req.user.id]
  );
  res.json({ preferences: rows[0] || {} });
});

// POST /api/user/preferences
userRouter.post('/preferences', async (req, res) => {
  const { preferredNetworks, audienceProfile, language, timezone } = req.body;
  await query(
    `INSERT INTO user_preferences (user_id, preferred_networks, audience_profile, language, timezone)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
       preferred_networks = COALESCE($2, user_preferences.preferred_networks),
       audience_profile   = COALESCE($3, user_preferences.audience_profile),
       language           = COALESCE($4, user_preferences.language),
       timezone           = COALESCE($5, user_preferences.timezone),
       updated_at         = NOW()`,
    [req.user.id, preferredNetworks||null, audienceProfile||null, language||null, timezone||null]
  );
  res.json({ message: 'Preferências salvas!' });
});
