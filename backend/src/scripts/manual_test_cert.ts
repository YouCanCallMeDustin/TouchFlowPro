import http from 'http';
import jwt from 'jsonwebtoken';

const SECRET = 'super_secret_jwt_key_dev_only';
// Create a token for a dummy user setup in dev.db? 
// Or just use any ID, since auth middleware typically just trusts the token signature 
// and extracts the ID. The route usually uses that ID.
// If the user doesn't exist in DB, foreign key constraints might fail if relations exist.
// Let's assume we need a valid User ID. 
// I'll query one first or just hardcode one if I knew it.
// I'll try to find a user first.

// Wait, I can't easily query DB in this script without importing everything.
// But I saw `check_certs_db.ts` earlier which imported Prisma.
// So I will combine them.

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTest() {
    try {
        console.log("Finding a user...");
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("No users found in DB to test with.");
            return;
        }
        console.log(`Using user: ${user.email} (${user.id})`);

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
        console.log("Generated token.");

        const postData = JSON.stringify({
            wpm: 125,
            accuracy: 98,
            type: 'Manual Test Script'
        });

        const options = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/certificates',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        console.log("Sending POST request...");
        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                console.log('RESPONSE:', body);
                prisma.$disconnect();
            });
        });

        req.on('error', (error) => {
            console.error('REQUEST ERROR:', error);
            prisma.$disconnect();
        });

        req.write(postData);
        req.end();

    } catch (e) {
        console.error(e);
        await prisma.$disconnect();
    }
}

runTest();
