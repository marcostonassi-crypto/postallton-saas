import { Router }  from 'express';
import Stripe      from 'stripe';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { query }   from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

export const paymentRouter = Router();

// ── Clientes de pagamento ──────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mp     = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PLANS = {
  basic:    { name: 'Básico',   networks: 3,  postsPerMonth: 30  },
  pro:      { name: 'Pro',      networks: 12, postsPerMonth: -1  },
  business: { name: 'Business', networks: 12, postsPerMonth: -1  },
};

const PRICES = {
  stripe: {
    basic_monthly:    () => process.env.STRIPE_PRICE_BASIC_MONTHLY,
    pro_monthly:      () => process.env.STRIPE_PRICE_PRO_MONTHLY,
    business_monthly: () => process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    basic_lifetime:   () => process.env.STRIPE_PRICE_BASIC_LIFETIME,
    pro_lifetime:     () => process.env.STRIPE_PRICE_PRO_LIFETIME,
    business_lifetime:() => process.env.STRIPE_PRICE_BUSINESS_LIFETIME,
  },
  mp: {
    basic_monthly:     { amount: 1900, title: 'PostAllTon Básico — Mensal' },
    pro_monthly:       { amount: 4900, title: 'PostAllTon Pro — Mensal' },
    business_monthly:  { amount: 9900, title: 'PostAllTon Business — Mensal' },
    basic_lifetime:    { amount: 14900, title: 'PostAllTon Básico — Vitalício' },
    pro_lifetime:      { amount: 34900, title: 'PostAllTon Pro — Vitalício' },
    business_lifetime: { amount: 59900, title: 'PostAllTon Business — Vitalício' },
  },
};

// ══════════════════════════════════════════════════════════════════
// STRIPE
// ══════════════════════════════════════════════════════════════════

// POST /api/payment/stripe/checkout
paymentRouter.post('/stripe/checkout', authMiddleware, async (req, res) => {
  const { plan, billingType } = req.body; // plan: basic|pro|business, billingType: monthly|lifetime
  const key = `${plan}_${billingType}`;
  const priceId = PRICES.stripe[key]?.();

  if (!priceId) return res.status(400).json({ error: 'Plano inválido.' });

  try {
    // Criar ou recuperar customer no Stripe
    let customerId = await getStripeCustomer(req.user);

    const sessionParams = {
      customer:             customerId,
      payment_method_types: ['card'],
      success_url:          `${process.env.FRONTEND_URL}?payment=success&plan=${plan}`,
      cancel_url:           `${process.env.FRONTEND_URL}?payment=cancelled`,
      metadata:             { userId: req.user.id, plan, billingType },
    };

    if (billingType === 'monthly') {
      sessionParams.mode            = 'subscription';
      sessionParams.line_items      = [{ price: priceId, quantity: 1 }];
      sessionParams.subscription_data = { metadata: { userId: req.user.id, plan } };
    } else {
      sessionParams.mode       = 'payment';
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/stripe/portal — portal de gerenciamento de assinatura
paymentRouter.post('/stripe/portal', authMiddleware, async (req, res) => {
  try {
    const customerId = await getStripeCustomer(req.user);
    const session    = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: process.env.FRONTEND_URL,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function getStripeCustomer(user) {
  const { rows } = await query(
    `SELECT provider_customer_id FROM subscriptions
     WHERE user_id = $1 AND provider = 'stripe' LIMIT 1`,
    [user.id]
  );
  if (rows[0]?.provider_customer_id) return rows[0].provider_customer_id;

  const customer = await stripe.customers.create({
    email: user.email,
    name:  user.name,
    metadata: { userId: user.id },
  });
  return customer.id;
}

// ══════════════════════════════════════════════════════════════════
// MERCADO PAGO
// ══════════════════════════════════════════════════════════════════

// POST /api/payment/mp/checkout
paymentRouter.post('/mp/checkout', authMiddleware, async (req, res) => {
  const { plan, billingType } = req.body;
  const key   = `${plan}_${billingType}`;
  const price = PRICES.mp[key];

  if (!price) return res.status(400).json({ error: 'Plano inválido.' });

  try {
    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        items: [{
          title:      price.title,
          quantity:   1,
          unit_price: price.amount / 100,
          currency_id: 'BRL',
        }],
        payer:        { email: req.user.email, name: req.user.name },
        back_urls: {
          success: `${process.env.FRONTEND_URL}?payment=success&plan=${plan}&provider=mp`,
          failure: `${process.env.FRONTEND_URL}?payment=failed`,
          pending: `${process.env.FRONTEND_URL}?payment=pending`,
        },
        auto_return:         'approved',
        external_reference:  JSON.stringify({ userId: req.user.id, plan, billingType }),
        notification_url:    `${process.env.APP_URL}/api/webhook/mp`,
        statement_descriptor: 'PostAllTon',
      },
    });

    res.json({
      checkoutUrl: result.init_point,
      preferenceId: result.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payment/plans — lista planos e preços
paymentRouter.get('/plans', (_req, res) => {
  res.json({
    plans: [
      {
        id: 'basic', name: 'Básico', desc: 'Para criadores solo',
        monthly: { brl: 19, usd: 9 },
        lifetime: { brl: 149, usd: 69 },
        features: ['3 redes sociais', '30 posts/mês', 'Agendamento básico', 'Suporte por e-mail'],
      },
      {
        id: 'pro', name: 'Pro', desc: 'Para profissionais', highlight: true,
        monthly: { brl: 49, usd: 29 },
        lifetime: { brl: 349, usd: 169 },
        features: ['12 redes sociais', 'Posts ilimitados', 'Agendamento avançado', 'Mídias e links', 'Histórico completo', 'Suporte prioritário'],
      },
      {
        id: 'business', name: 'Business', desc: 'Para agências',
        monthly: { brl: 99, usd: 59 },
        lifetime: { brl: 599, usd: 299 },
        features: ['Todas as redes', 'Posts ilimitados', 'Multi-clientes', 'API personalizada', 'Relatórios de alcance', 'Suporte dedicado'],
      },
    ],
  });
});
