import { query } from '../models/db.js';

const PLAN_LIMITS = {
  free:     { networks: 0,  posts_per_month: 0  },
  basic:    { networks: 3,  posts_per_month: 30 },
  pro:      { networks: 12, posts_per_month: -1 }, // -1 = ilimitado
  business: { networks: 12, posts_per_month: -1 },
};

export async function planMiddleware(req, res, next) {
  const user = req.user;

  // Bloquear imediatamente se sem plano ou bloqueado
  if (user.status === 'blocked' || user.plan === 'free') {
    return res.status(403).json({
      error: 'Acesso bloqueado.',
      message: 'Sua assinatura expirou ou você não possui um plano ativo. Assine agora para continuar.',
      action: 'subscribe',
    });
  }

  // Verificar limite de redes (plano basic: máx 3)
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  const platforms = req.body.platforms || [];

  if (limits.networks > 0 && platforms.length > limits.networks) {
    return res.status(403).json({
      error: `Seu plano ${user.plan} permite até ${limits.networks} redes simultaneamente.`,
      action: 'upgrade',
    });
  }

  // Verificar limite de posts mensais (plano basic: 30/mês)
  if (limits.posts_per_month > 0) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { rows } = await query(
      `SELECT COUNT(*) as count FROM posts
       WHERE user_id = $1 AND created_at >= $2`,
      [user.id, startOfMonth]
    );

    if (parseInt(rows[0].count) >= limits.posts_per_month) {
      return res.status(403).json({
        error: `Limite de ${limits.posts_per_month} posts/mês atingido no plano ${user.plan}.`,
        action: 'upgrade',
      });
    }
  }

  req.planLimits = limits;
  next();
}
