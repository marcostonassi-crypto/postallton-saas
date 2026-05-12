import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../models/db.js';

export const authRouter = Router();

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── Registro com email/senha ───────────────────────────────────────
authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios.' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter mínimo 6 caracteres.' });

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) return res.status(409).json({ error: 'Email já cadastrado.' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, plan, status)
       VALUES ($1, $2, $3, 'free', 'active') RETURNING id, name, email, plan, status`,
      [name || email.split('@')[0], email, hash]
    );

    const user  = rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Login com email/senha ──────────────────────────────────────────
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios.' });

  try {
    const { rows } = await query(
      'SELECT id, name, email, password_hash, plan, plan_type, status FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos.' });

    delete user.password_hash;
    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Login com Google ───────────────────────────────────────────────
// Passo 1: redirecionar para Google
authRouter.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  `${process.env.APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Passo 2: callback do Google
authRouter.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.redirect(`${process.env.FRONTEND_URL}?error=google_auth_failed`);

  try {
    // Trocar code por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type:    'authorization_code',
        code,
      }).toString(),
    });
    const tokens = await tokenRes.json();

    // Buscar dados do usuário
    const userRes  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    // Criar ou atualizar usuário no banco
    const { rows } = await query(
      `INSERT INTO users (email, name, avatar, google_id, plan, status)
       VALUES ($1, $2, $3, $4, 'free', 'active')
       ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name, avatar = EXCLUDED.avatar, google_id = EXCLUDED.google_id
       RETURNING id, name, email, plan, plan_type, status`,
      [googleUser.email, googleUser.name, googleUser.picture, googleUser.sub]
    );

    const user  = rows[0];
    const token = generateToken(user.id);

    // Redirecionar para o frontend com token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}?error=${encodeURIComponent(err.message)}`);
  }
});

// ── Verificar token ────────────────────────────────────────────────
authRouter.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autenticado.' });

  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const { rows } = await query(
      'SELECT id, name, email, avatar, plan, plan_type, status FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user: rows[0] });
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
});
