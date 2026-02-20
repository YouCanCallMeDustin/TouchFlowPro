import { Router, Request, Response } from 'express';
import prisma from '../lib/db';
import { TypingMetrics } from '@shared/types';
import { calculateUserLevel } from '@shared/adaptiveEngine';
import { updateUserStats } from '../utils/userStats';
import { medicalDrillPacks } from '@shared/tracks/medical';

// Pre-compute medical vocabulary from all drills
const medicalVocabulary = new Set<string>();
Object.values(medicalDrillPacks).forEach(pack => {
    pack.forEach(drill => {
        const words = drill.content.split(/\s+/).map(w => w.replace(/[^\w]/g, '').toLowerCase());
        words.forEach(w => {
            if (w.length >= 6) medicalVocabulary.add(w); // Include >= 6 chars as potential medical terms
        });
    });
});


const router = Router();

interface SessionCompleteBody {
    userId: string;
    drillId: string;
    type: 'lesson' | 'practice' | 'adaptive' | 'bible' | 'custom';
    metrics: TypingMetrics;
    keystrokes?: any[];
    liveMetrics?: any[];
}

/**
 * POST /api/sessions/complete
 * Unified endpoint for recording any typing session completion
 */
router.post('/complete', async (req, res) => {
    try {
        const { userId, drillId, type, metrics, idempotencyKey } = req.body as SessionCompleteBody & { idempotencyKey?: string };

        if (!userId || !metrics) {
            return res.status(400).json({ error: 'Missing required session data' });
        }

        // 0. Idempotency Check
        if (idempotencyKey) {
            const existing = await prisma.drillResult.findUnique({
                where: { idempotencyKey }
            });
            if (existing) {
                return res.json({
                    success: true,
                    drillResult: existing,
                    xpEarned: 0,
                    leveledUp: false,
                    newLevel: 0,
                    streak: null,
                    newAchievements: [],
                    isDuplicate: true
                });
            }
        }

        // Transaction for Data Integrity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Save Drill Result
            const drillResult = await tx.drillResult.create({
                data: {
                    userId,
                    drillId,
                    mode: type,
                    grossWPM: metrics.grossWPM,
                    netWPM: metrics.netWPM,
                    accuracy: metrics.accuracy,
                    durationMs: metrics.durationMs || 0,
                    timestamp: new Date(),
                    idempotencyKey: idempotencyKey || undefined
                }
            });

            // 1b. Save Keystroke/Session Details
            if (req.body.keystrokes) {
                await tx.sessionDetails.create({
                    data: {
                        sessionId: drillResult.id,
                        keystrokes: JSON.stringify(req.body.keystrokes),
                        liveMetrics: JSON.stringify(req.body.liveMetrics || [])
                    }
                });

                // Term Detection Logic for Medical Feature
                let currentWordChars: string[] = [];
                let currentWordHasError = false;

                // Helper to process a word
                const processWord = async (word: string, hasError: boolean) => {
                    const cleanWord = word.replace(/[^\w]/g, '');
                    if (!cleanWord) return;

                    const lowerWord = cleanWord.toLowerCase();
                    const isAbbreviation = cleanWord === cleanWord.toUpperCase() && cleanWord.length > 1 && /[A-Z]/.test(cleanWord);
                    const isMedical = medicalVocabulary.has(lowerWord) || isAbbreviation;

                    if (isMedical) {
                        // Clamp mastery bounds (0 to 100)
                        const masteryDelta = hasError ? -10 : 5;

                        await tx.medicalWeakTerm.upsert({
                            where: { userId_term: { userId, term: lowerWord } },
                            create: {
                                userId,
                                term: lowerWord,
                                mistakeCount: hasError ? 1 : 0,
                                masteryScore: hasError ? 0 : 5,
                                lastMistypedAt: hasError ? new Date() : new Date(0) // Safe fallback
                            },
                            update: {
                                mistakeCount: hasError ? { increment: 1 } : undefined,
                                masteryScore: { increment: masteryDelta },
                                lastMistypedAt: hasError ? new Date() : undefined
                            }
                        });
                    }

                    // For Legal - capture terms >= 6 chars or explicit legal dict in future
                    const isLegal = lowerWord.length >= 6; // Simple heuristic for now until dictionary is robust
                    if (isLegal && drillId && drillId.startsWith('legal_')) {
                        const masteryDelta = hasError ? -10 : 5;
                        await tx.legalWeakTerm.upsert({
                            where: { userId_term: { userId, term: lowerWord } },
                            create: {
                                userId,
                                term: lowerWord,
                                mistakeCount: hasError ? 1 : 0,
                                masteryScore: hasError ? 0 : 5,
                                lastMistypedAt: hasError ? new Date() : new Date(0)
                            },
                            update: {
                                mistakeCount: hasError ? { increment: 1 } : undefined,
                                masteryScore: { increment: masteryDelta },
                                lastMistypedAt: hasError ? new Date() : undefined
                            }
                        });
                    }

                    // For Code - capture code keywords or syntax chars
                    if (drillId && drillId.startsWith('code_') && cleanWord.length > 2) {
                        const masteryDelta = hasError ? -10 : 5;
                        await tx.codeWeakTerm.upsert({
                            where: { userId_term: { userId, term: lowerWord } },
                            create: {
                                userId,
                                term: lowerWord,
                                mistakeCount: hasError ? 1 : 0,
                                masteryScore: hasError ? 0 : 5,
                                lastMistypedAt: hasError ? new Date() : new Date(0)
                            },
                            update: {
                                mistakeCount: hasError ? { increment: 1 } : undefined,
                                masteryScore: { increment: masteryDelta },
                                lastMistypedAt: hasError ? new Date() : undefined
                            }
                        });
                    }
                };

                for (const stroke of req.body.keystrokes) {
                    if (stroke.expectedKey === ' ' || stroke.expectedKey === 'Enter') {
                        if (currentWordChars.length > 0) {
                            await processWord(currentWordChars.join(''), currentWordHasError);
                        }
                        currentWordChars = [];
                        currentWordHasError = false;
                    } else if (stroke.expectedKey && stroke.expectedKey.length === 1) {
                        currentWordChars.push(stroke.expectedKey);
                        if (!stroke.correct && stroke.correct !== undefined) {
                            currentWordHasError = true;
                        } else if (stroke.isError) {
                            currentWordHasError = true;
                        }
                    }
                }

                // Process the last word if exists
                if (currentWordChars.length > 0) {
                    await processWord(currentWordChars.join(''), currentWordHasError);
                }
            }

            // 2. Update User Progress
            const currentProgress = await tx.userProgress.findUnique({ where: { userId } });

            const xpEarned = calculateXPEarned(metrics);
            let leveledUp = false;
            let newLevel = currentProgress?.level || 1;

            if (currentProgress) {
                let totalXP = currentProgress.xp + xpEarned;
                const xpToNext = Math.floor(100 * Math.pow(1.5, currentProgress.level - 1));

                if (totalXP >= xpToNext) {
                    totalXP -= xpToNext;
                    newLevel++;
                    leveledUp = true;
                }

                await tx.userProgress.update({
                    where: { userId },
                    data: { xp: totalXP, level: newLevel }
                });
            }

            return { drillResult, xpEarned, leveledUp, newLevel };
        });

        // 3. Post-Transaction Updates
        await updateUserStats(userId, metrics);
        const streakRes = await updateStreak(userId);

        const { runAchievementCheck } = require('./achievements');
        const newAchievements = await runAchievementCheck(userId);

        res.json({
            success: true,
            drillResult: result.drillResult,
            xpEarned: result.xpEarned,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            streak: streakRes,
            newAchievements
        });

    } catch (error) {
        console.error('Session complete error:', error);
        res.status(500).json({ error: 'Failed to record session completion' });
    }
});

/**
 * Calculate XP based on performance
 */
function calculateXPEarned(metrics: TypingMetrics): number {
    const baseXP = Math.floor(metrics.netWPM * 2);
    const accuracyBonus = metrics.accuracy >= 98 ? 50 : metrics.accuracy >= 95 ? 25 : 0;
    return baseXP + accuracyBonus;
}

/**
 * Handle streak updates
 */
async function updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await prisma.userProgress.findUnique({ where: { userId } });
    if (!progress) return null;

    let newStreak = progress.dailyStreak;
    const lastPractice = progress.lastPracticeDate;

    if (!lastPractice) {
        newStreak = 1;
    } else {
        const lastDate = new Date(lastPractice);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak++;
        } else if (diffDays > 1) {
            newStreak = 1;
        }
    }

    await prisma.userProgress.update({
        where: { userId },
        data: {
            dailyStreak: newStreak,
            lastPracticeDate: new Date()
        }
    });

    return {
        currentStreak: newStreak,
        lastPracticeDate: new Date()
    };
}

/**
 * Check for new achievements (including tiered ones)
 */
async function checkAchievements(userId: string, metrics: TypingMetrics, drillId: string) {
    const newEarned: string[] = [];

    // Achievement definitions
    const milestones = [
        { type: 'speed_bronze', threshold: 40, check: (m: TypingMetrics) => m.netWPM >= 40 },
        { type: 'speed_silver', threshold: 70, check: (m: TypingMetrics) => m.netWPM >= 70 },
        { type: 'speed_gold', threshold: 100, check: (m: TypingMetrics) => m.netWPM >= 100 },
        { type: 'accuracy_bronze', threshold: 95, check: (m: TypingMetrics) => m.accuracy >= 95 },
        { type: 'accuracy_silver', threshold: 98, check: (m: TypingMetrics) => m.accuracy >= 98 },
        { type: 'accuracy_gold', threshold: 100, check: (m: TypingMetrics) => m.accuracy >= 100 },
    ];

    for (const milestone of milestones) {
        const exists = await prisma.achievement.findUnique({
            where: { userId_badgeType: { userId, badgeType: milestone.type } }
        });

        if (!exists && milestone.check(metrics)) {
            await prisma.achievement.create({
                data: {
                    userId,
                    badgeType: milestone.type,
                    earnedAt: new Date()
                }
            });
            newEarned.push(milestone.type);
        }
    }

    return newEarned;
}

export default router;
