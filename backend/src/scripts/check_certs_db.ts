import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCertificates() {
    try {
        console.log('Connecting to database...');
        const certificates = await prisma.certificate.findMany({
            orderBy: { testDate: 'desc' },
            take: 5
        });

        console.log(`Found ${certificates.length} certificates.`);
        certificates.forEach(cert => {
            console.log(`- [${cert.testDate.toISOString()}] WPM: ${cert.wpm}, Acc: ${cert.accuracy}%, Type: ${cert.type}`);
        });

    } catch (error) {
        console.error('Error fetching certificates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCertificates();
