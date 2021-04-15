/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const minimist = require('minimist');

const prisma = new PrismaClient();

(async () => {
  const argv = minimist(process.argv.slice(2));

  const { label, id } = argv;
  if (!label && !id) throw new Error('need to specify either --id or --label');

  const condition = id ? { id } : { label };

  await prisma.statusCheck.delete({
    where: condition,
  });

  process.exit(0);
})();
