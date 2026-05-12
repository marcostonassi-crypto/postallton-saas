# PostAllTon SaaS API v2.0 📡
> Backend multiusuário completo — autenticação, OAuth por cliente, Stripe, Mercado Pago, PostgreSQL.

---

## 🗂️ Estrutura

```
src/
├── server.js              ← Entry point
├── models/
│   ├── db.js              ← Conexão PostgreSQL
│   └── migrate.js         ← Cria todas as tabelas
├── middleware/
│   ├── auth.js            ← Verificação JWT
│   └── plan.js            ← Controle de planos/limites
├── routes/
│   ├── auth.js            ← Login email/senha + Google OAuth
│   ├── social.js          ← OAuth de cada rede por usuário
│   ├── post.js            ← Publicação multiusuário
│   ├── payment.js         ← Stripe + Mercado Pago
│   ├── webhook.js         ← Ativa/bloqueia planos automaticamente
│   └── user.js            ← Perfil + painel admin
└── services/
    └── subscription.js    ← Cron de expiração de assinaturas
```

---

## 🚀 Deploy no Railway

### 1. Subir no GitHub
```bash
git init && git add . && git commit -m "PostAllTon SaaS v2.0"
git remote add origin https://github.com/SEU_USUARIO/postallton-saas.git
git push -u origin main
```

### 2. Criar projeto no Railway
1. railway.app → New Project → Deploy from GitHub → postallton-saas
2. Clique em **Add Plugin** → **PostgreSQL** (Railway cria o banco automaticamente e adiciona `DATABASE_URL`)

### 3. Configurar variáveis
No Railway → Variables → adicione todas as variáveis do `.env.example`

### 4. Gerar domínio
Settings → Networking → Generate Domain

---

## 🔑 Fluxo completo do cliente

```
1. Cliente acessa o frontend
2. Faz registro/login (email+senha ou Google)
3. Escolhe um plano → paga via Stripe ou Mercado Pago
4. Webhook ativa o plano automaticamente no banco
5. Cliente conecta suas redes (Instagram, etc.) via OAuth
6. Publica em todas as redes com 1 clique
7. Se não pagar → cron bloqueia acesso automaticamente
```

---

## 💳 Configurar Stripe

1. Acesse dashboard.stripe.com → Products → Add Product
2. Crie os 6 produtos (3 planos × 2 tipos):
   - Básico Mensal: R$19/mês → copie o Price ID → `STRIPE_PRICE_BASIC_MONTHLY`
   - Pro Mensal: R$49/mês → `STRIPE_PRICE_PRO_MONTHLY`
   - Business Mensal: R$99/mês → `STRIPE_PRICE_BUSINESS_MONTHLY`
   - Básico Vitalício: R$149 único → `STRIPE_PRICE_BASIC_LIFETIME`
   - Pro Vitalício: R$349 único → `STRIPE_PRICE_PRO_LIFETIME`
   - Business Vitalício: R$599 único → `STRIPE_PRICE_BUSINESS_LIFETIME`
3. Developers → Webhooks → Add endpoint:
   - URL: `https://SUA-API.railway.app/api/webhook/stripe`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copie o Webhook Secret → `STRIPE_WEBHOOK_SECRET`

---

## 💚 Configurar Mercado Pago

1. Acesse mercadopago.com.br → Desenvolvedores → Credenciais
2. Copie o Access Token de Produção → `MP_ACCESS_TOKEN`
3. Configure webhook em: Desenvolvedores → Notificações IPN
   - URL: `https://SUA-API.railway.app/api/webhook/mp`
   - Tipo: Pagamentos

---

## 🌐 Configurar Google OAuth (login com Google)

1. console.cloud.google.com → New Project
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized redirect URIs: `https://SUA-API.railway.app/api/auth/google/callback`
4. Copie Client ID e Client Secret

---

## 📊 Painel Admin

Adicione seu email em `ADMIN_EMAILS` nas variáveis do Railway:
```
ADMIN_EMAILS=seu@email.com
```

Depois acesse:
```
GET /api/user/dashboard
Authorization: Bearer SEU_TOKEN
```

Retorna: receita total, assinantes ativos por plano, pagamentos recentes.

---

## 🔗 Integrar com o frontend

Adicione no `index.html`:
```javascript
const API = 'https://SUA-API.railway.app';

// Login
const res = await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();
localStorage.setItem('pat_token', token);

// Publicar
const post = await fetch(`${API}/api/post`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ caption, platforms, mediaUrls })
});
```

---

© 2026 PostAllTon. Todos os direitos reservados.
