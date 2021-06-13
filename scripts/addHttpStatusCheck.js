/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const minimist = require('minimist');

const prisma = new PrismaClient();

(async () => {
  const argv = minimist(process.argv.slice(2));

  const { label, domain, path, interval } = argv;
  if (!domain || !path) throw new Error('need to specify --domain and --path');

  await prisma.statusCheck.create({
    data: {
      label: label || domain,
      config: {
        create: {
          type: 'HTTP',
          interval,
          details: { domain, path },
        },
      },
    }
  });

  process.exit(0);
})();
