import jwt from 'jsonwebtoken';
import { query } from '../models/db.js';

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query(
      'SELECT id, email, name, plan, plan_type, status FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Usuário não encontrado.' });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
