import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../models/db.js';

export const webhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ══════════════════════════════════════════════════════════════════
// STRIPE WEBHOOK
// ══════════════════════════════════════════════════════════════════
webhookRouter.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Assinatura inválida:', err.message);
    return res.status(400).json({ error: 'Webhook inválido.' });
  }

  console.log(`[STRIPE] Evento: ${event.type}`);

  try {
    switch (event.type) {
      // ── Pagamento único aprovado (vitalício) ──────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status === 'paid' && session.mode === 'payment') {
          const { userId, plan, billingType } = session.metadata;
          await activatePlan(userId, plan, 'lifetime', 'stripe', session.payment_intent, session.customer);
        }
        break;
      }

      // ── Assinatura mensal criada/renovada ─────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const sub     = await stripe.subscriptions.retrieve(invoice.subscription);
        const { userId, plan } = sub.metadata;
        if (userId && plan) {
          await activatePlan(userId, plan, 'monthly', 'stripe',
            invoice.subscription,
            invoice.customer,
            new Date(sub.current_period_end * 1000)
          );
          await savePayment(userId, 'stripe', invoice.payment_intent, invoice.amount_paid, 'succeeded');
        }
        break;
      }

      // ── Assinatura cancelada / inadimplente ───────────────────────
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const obj    = event.data.object;
        const subId  = obj.subscription || obj.id;
        const sub    = await stripe.subscriptions.retrieve(subId).catch(() => obj);
        const userId = sub.metadata?.userId;
        if (userId) {
          await blockUser(userId, 'stripe', subId);
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Erro ao processar:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// MERCADO PAGO WEBHOOK
// ══════════════════════════════════════════════════════════════════
webhookRouter.post('/mp', async (req, res) => {
  const { type, data } = req.body;
  if (type !== 'payment') return res.json({ received: true });

  try {
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    const payment = await paymentRes.json();

    if (payment.status === 'approved') {
      const ref = JSON.parse(payment.external_reference || '{}');
      const { userId, plan, billingType } = ref;

      if (userId && plan) {
        const expiresAt = billingType === 'monthly'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 dias
          : null; // vitalício = sem expiração

        await activatePlan(userId, plan, billingType, 'mp', payment.id.toString(), null, expiresAt);
        await savePayment(userId, 'mp', payment.id.toString(), Math.round(payment.transaction_amount * 100), 'approved');
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[MP WEBHOOK] Erro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════
async function activatePlan(userId, plan, billingType, provider, providerSubId, customerId, expiresAt = null) {
  // Atualizar usuário
  await query(
    `UPDATE users SET plan = $1, plan_type = $2, status = 'active', updated_at = NOW() WHERE id = $3`,
    [plan, billingType, userId]
  );

  // Salvar/atualizar assinatura
  await query(
    `INSERT INTO subscriptions
       (user_id, provider, provider_sub_id, provider_customer_id, plan, billing_type, status, current_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
     ON CONFLICT (user_id) DO UPDATE SET
       provider              = EXCLUDED.provider,
       provider_sub_id       = EXCLUDED.provider_sub_id,
       provider_customer_id  = EXCLUDED.provider_customer_id,
       plan                  = EXCLUDED.plan,
       billing_type          = EXCLUDED.billing_type,
       status                = 'active',
       current_period_end    = EXCLUDED.current_period_end,
       updated_at            = NOW()`,
    [userId, provider, providerSubId, customerId, plan, billingType, expiresAt]
  ).catch(async () => {
    // Se não há constraint de unicidade, fazer upsert por user_id
    await query(
      `INSERT INTO subscriptions
         (user_id, provider, provider_sub_id, provider_customer_id, plan, billing_type, status, current_period_end)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)`,
      [userId, provider, providerSubId, customerId, plan, billingType, expiresAt]
    );
  });

  console.log(`[PAYMENT] Plano ${plan} (${billingType}) ativado para usuário ${userId}`);
}

async function blockUser(userId, provider, providerSubId) {
  await query(
    `UPDATE users SET status = 'blocked', plan = 'free', plan_type = 'none', updated_at = NOW() WHERE id = $1`,
    [userId]
  );
  await query(
    `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
     WHERE user_id = $1 AND provider_sub_id = $2`,
    [userId, providerSubId]
  );
  console.log(`[PAYMENT] Usuário ${userId} bloqueado por inadimplência.`);
}

async function savePayment(userId, provider, providerId, amountCents, status) {
  await query(
    `INSERT INTO payments (user_id, provider, provider_pmt_id, amount_cents, status, paid_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [userId, provider, providerId, amountCents, status]
  );
}
