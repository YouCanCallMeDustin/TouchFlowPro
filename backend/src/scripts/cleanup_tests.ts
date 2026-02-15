import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    try {
        const { count } = await prisma.certificate.deleteMany({
            where: {
                type: 'Manual Test Script'
            }
        });
        console.log(`Deleted ${count} test certificates.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
