import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString:
    "postgresql://postgres.rtotnmbpwxfbiufcsvsx:rKyz3vHSkmADsKze@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  await client.query(`
    ALTER TABLE "Job"
    ADD COLUMN IF NOT EXISTS "aiRankingEnabled" BOOLEAN NOT NULL DEFAULT TRUE
  `);
  console.log('✅ Colonne "aiRankingEnabled" ajoutée à la table Job (ou déjà existante).');
} catch (err) {
  console.error("❌ Erreur:", err.message);
} finally {
  await client.end();
}
