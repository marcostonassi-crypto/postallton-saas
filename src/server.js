import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { migrate } from './models/migrate.js';
import { authRouter }    from './routes/auth.js';
import { credRouter }    from './routes/creds.js';
import { paymentRouter } from './routes/payment.js';
import { userRouter }    from './routes/user.js';
import { webhookRouter } from './routes/webhook.js';
import { authMiddleware } from './middleware/auth.js';
import { planMiddleware } from './middleware/plan.js';
import { postRouter }    from './routes/post.js';
import { checkExpiredSubscriptions } from './services/subscription.js';
import { query } from './models/db.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// Webhook Stripe precisa raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRouter);

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Rotas públicas ─────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  name: 'PostAllTon SaaS API', version: '3.0.0', status: 'online',
  slogan: 'Um clique. Todas as redes.'
}));

app.use('/api/auth',    authRouter);
app.use('/api/payment', paymentRouter);

// ── Ativação admin (protegida por chave secreta) ───────────────────
app.post('/api/activate', async (req, res) => {
  const { secret, email, plan = 'business' } = req.body;
  if (secret !== (process.env.ADMIN_SECRET || 'postallton_admin_2026')) {
    return res.status(403).json({ error: 'Chave inválida.' });
  }
  const targetEmail = email || process.env.ADMIN_EMAILS?.split(',')[0]?.trim();
  if (!targetEmail) return res.status(400).json({ error: 'Email não informado.' });
  try {
    const { rows } = await query(
      `UPDATE users SET plan=$1, plan_type='lifetime', status='active', updated_at=NOW()
       WHERE email=$2 RETURNING id, name, email, plan, status`,
      [plan, targetEmail]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ message: `✅ Plano ${plan} ativado!`, user: rows[0] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Rotas protegidas ───────────────────────────────────────────────
app.use('/api/user',   authMiddleware, userRouter);
app.use('/api/creds',  authMiddleware, credRouter);
app.use('/api/post',   authMiddleware, planMiddleware, postRouter);

// ── Error handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// ── Cron: verificar assinaturas expiradas ─────────────────────────
cron.schedule('0 * * * *', async () => {
  await checkExpiredSubscriptions();
});

// ── Start ──────────────────────────────────────────────────────────
async function start() {
  await new Promise(resolve => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n📡 PostAllTon API v3 — http://0.0.0.0:${PORT}\n`);
      resolve();
    });
  });
  try {
    await migrate();
    console.log('✅ Banco conectado.');
  } catch(e) {
    console.error('⚠️  Banco offline:', e.message);
  }
}

start().catch(console.error);
