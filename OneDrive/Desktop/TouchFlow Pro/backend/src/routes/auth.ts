import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_dev_only';

// POST /signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await getDb();
        const existingUser = db.data.users.find((u: any) => u.email === email);

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            email,
            passwordHash: hashedPassword,
            assignedLevel: 'Beginner',
            unlockedLevels: 'Beginner',
            currentLessonId: 'b1',
            createdAt: new Date().toISOString()
        };

        db.data.users.push(newUser);
        await db.write();

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                assignedLevel: newUser.assignedLevel,
                currentLessonId: newUser.currentLessonId
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await getDb();
        const user = db.data.users.find((u: any) => u.email === email);

        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                assignedLevel: user.assignedLevel,
                currentLessonId: user.currentLessonId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /me
router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const db = await getDb();
        const user = db.data.users.find((u: any) => u.id === decoded.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user.id,
            email: user.email,
            assignedLevel: user.assignedLevel,
            currentLessonId: user.currentLessonId
        });
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
});

export default router;
