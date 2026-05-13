import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { migrate } from './models/migrate.js';
import { authRouter }    from './routes/auth.js';
import { socialRouter }  from './routes/social.js';
import { postRouter }    from './routes/post.js';
import { paymentRouter } from './routes/payment.js';
import { userRouter }    from './routes/user.js';
import { webhookRouter } from './routes/webhook.js';
import { authMiddleware } from './middleware/auth.js';
import { planMiddleware } from './middleware/plan.js';
import { checkExpiredSubscriptions } from './services/subscription.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Webhook do Stripe (precisa de raw body) ────────────────────────
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// ── Middleware global ──────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || '*',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Rotas públicas ─────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  name:    'PostAllTon SaaS API',
  version: '2.0.0',
  status:  'online',
  slogan:  'Um clique. Todas as redes.',
}));

app.use('/api/auth',    authRouter);
app.use('/api/payment', paymentRouter);

// ── Rotas protegidas (requer login) ────────────────────────────────
app.use('/api/user',   authMiddleware, userRouter);
app.use('/api/social', authMiddleware, socialRouter);
app.use('/api/post',   authMiddleware, planMiddleware, postRouter);

// ── Error handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// ── Cron: verificar assinaturas expiradas (a cada hora) ────────────
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Verificando assinaturas expiradas...');
  await checkExpiredSubscriptions();
});

// ── Iniciar servidor ───────────────────────────────────────────────
async function start() {
  // Inicia o servidor PRIMEIRO — Render precisa detectar a porta
  await new Promise((resolve) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n📡 PostAllTon SaaS API — http://0.0.0.0:${PORT}`);
      console.log('   Multiusuário | PostgreSQL | Stripe | Mercado Pago\n');
      resolve();
    });
  });

  // Depois tenta conectar ao banco (não trava o servidor se falhar)
  try {
    await migrate();
    console.log('✅ Banco de dados conectado e migrations executadas.');
  } catch (err) {
    console.error('⚠️  Banco não conectado — configure DATABASE_URL nas variáveis de ambiente.');
    console.error('   Erro:', err.message);
  }
}

start().catch(console.error);
