import { pool } from './db.js';

export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         VARCHAR(255) UNIQUE NOT NULL,
        name          VARCHAR(255),
        avatar        TEXT,
        password_hash TEXT,
        google_id     VARCHAR(255) UNIQUE,
        plan          VARCHAR(50) DEFAULT 'free',
        plan_type     VARCHAR(20) DEFAULT 'none',
        status        VARCHAR(20) DEFAULT 'active',
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Assinaturas
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
        provider             VARCHAR(20) NOT NULL,
        provider_sub_id      VARCHAR(255),
        provider_customer_id VARCHAR(255),
        plan                 VARCHAR(50) NOT NULL,
        billing_type         VARCHAR(20) NOT NULL,
        status               VARCHAR(30) NOT NULL DEFAULT 'active',
        amount_cents         INTEGER,
        currency             VARCHAR(10) DEFAULT 'BRL',
        current_period_start TIMESTAMPTZ,
        current_period_end   TIMESTAMPTZ,
        cancelled_at         TIMESTAMPTZ,
        created_at           TIMESTAMPTZ DEFAULT NOW(),
        updated_at           TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Conexões de redes sociais por usuário
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_connections (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        platform      VARCHAR(50) NOT NULL,
        access_token  TEXT,
        refresh_token TEXT,
        token_expires TIMESTAMPTZ,
        account_id    VARCHAR(255),
        account_name  VARCHAR(255),
        account_url   TEXT,
        extra_data    JSONB DEFAULT '{}',
        connected_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, platform)
      )
    `);

    // Preferências do usuário
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        preferred_networks  TEXT[] DEFAULT '{}',
        default_caption     TEXT,
        timezone            VARCHAR(50) DEFAULT 'America/Sao_Paulo',
        language            VARCHAR(10) DEFAULT 'pt',
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Posts publicados
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
        caption      TEXT,
        media_urls   TEXT[],
        platforms    TEXT[],
        results      JSONB DEFAULT '{}',
        status       VARCHAR(20) DEFAULT 'published',
        scheduled_at TIMESTAMPTZ,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Pagamentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id),
        provider        VARCHAR(20) NOT NULL,
        provider_pmt_id VARCHAR(255),
        amount_cents    INTEGER NOT NULL,
        currency        VARCHAR(10) DEFAULT 'BRL',
        status          VARCHAR(30) NOT NULL,
        paid_at         TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Índices
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_social_user ON social_connections(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_prefs_user ON user_preferences(user_id)`);

    await client.query('COMMIT');
    console.log('✅ Migrations OK');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1].endsWith('migrate.js')) {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}
