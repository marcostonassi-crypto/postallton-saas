import { query } from '../models/db.js';

/**
 * Executado pelo cron a cada hora.
 * Bloqueia usuários com assinaturas mensais expiradas.
 */
export async function checkExpiredSubscriptions() {
  try {
    // Buscar assinaturas mensais expiradas
    const { rows } = await query(
      `SELECT s.user_id, s.id as sub_id, u.email
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       WHERE s.billing_type = 'monthly'
         AND s.status = 'active'
         AND s.current_period_end < NOW()
         AND u.status = 'active'`
    );

    if (rows.length === 0) return;

    console.log(`[CRON] ${rows.length} assinatura(s) expirada(s) encontrada(s).`);

    for (const row of rows) {
      // Bloquear imediatamente
      await query(
        `UPDATE users SET status = 'blocked', plan = 'free', plan_type = 'none', updated_at = NOW()
         WHERE id = $1`,
        [row.user_id]
      );
      await query(
        `UPDATE subscriptions SET status = 'expired', updated_at = NOW() WHERE id = $1`,
        [row.sub_id]
      );
      console.log(`[CRON] Usuário ${row.email} bloqueado por assinatura expirada.`);
    }
  } catch (err) {
    console.error('[CRON] Erro ao verificar assinaturas:', err.message);
  }
}

/**
 * Busca o resumo financeiro do proprietário do SaaS.
 */
export async function getFinancialSummary() {
  const { rows } = await query(`
    SELECT
      COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'active' AND u.plan != 'free') as active_subscribers,
      COUNT(DISTINCT u.id) FILTER (WHERE u.plan = 'basic')    as basic_count,
      COUNT(DISTINCT u.id) FILTER (WHERE u.plan = 'pro')      as pro_count,
      COUNT(DISTINCT u.id) FILTER (WHERE u.plan = 'business') as business_count,
      COALESCE(SUM(p.amount_cents) FILTER (WHERE p.status IN ('succeeded','approved')), 0) as total_revenue_cents,
      COUNT(p.id) FILTER (WHERE p.created_at >= date_trunc('month', NOW())) as payments_this_month
    FROM users u
    LEFT JOIN payments p ON p.user_id = u.id
  `);

  return rows[0];
}
