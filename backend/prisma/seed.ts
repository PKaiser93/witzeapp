import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://witzeuser:devpass123@localhost:5433/witzeapp',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const configs = [
    { key: 'maintenance', value: 'false', description: 'Wartungsmodus' },
    {
      key: 'feature_comments',
      value: 'true',
      description: 'Kommentare aktiviert',
    },
    { key: 'feature_likes', value: 'true', description: 'Likes aktiviert' },
    {
      key: 'feature_register',
      value: 'true',
      description: 'Registrierung aktiviert',
    },
    {
      key: 'feature_report',
      value: 'true',
      description: 'Meldungen aktiviert',
    },
    {
      key: 'feature_delete_account',
      value: 'false',
      description: 'Account löschen aktiviert',
    },
    {
      key: 'announcement',
      value: '',
      description: 'Systembenachrichtigung Text',
    },
    {
      key: 'announcement_active',
      value: 'false',
      description: 'Systembenachrichtigung aktiv',
    },
  ];

  for (const config of configs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('✅ AppConfig Seed abgeschlossen');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
