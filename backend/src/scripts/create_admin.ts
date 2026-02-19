import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@admin.com';
    const password = 'admin123';

    console.log(`Checking for existing user with email: ${email}...`);
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log('Admin user already exists. Updating password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });
        console.log('Admin password updated successfully.');
    } else {
        console.log('Creating new admin user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                id: uuidv4(),
                email,
                passwordHash: hashedPassword,
                assignedLevel: 'Beginner',
                unlockedLevels: 'Beginner',
                currentLessonId: 'b1',
                subscriptionStatus: 'pro',
                createdAt: new Date(),
                name: 'System Admin'
            }
        });
        console.log('Admin user created successfully.');
    }
}

main()
    .catch(e => {
        console.error('CRITICAL ERROR creating admin user:');
        console.error(e);
        if (e.code) console.error('Error Code:', e.code);
        if (e.meta) console.error('Error Meta:', e.meta);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
