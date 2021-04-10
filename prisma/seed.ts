import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.statusCheck.upsert({
    where: { label: 'example.com' },
    update: {},
    create: {
      label: 'example.com',
      config: {
        create: {
          type: 'HTTP',
          details: { domain: 'example.com', path: '/' },
        },
      },
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
