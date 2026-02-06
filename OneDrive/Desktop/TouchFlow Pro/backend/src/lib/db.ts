import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

// Types are now inferred from Prisma Client, or can be imported from @prisma/client
// export type { User, DrillResult, SpacedItem } from '@prisma/client';
