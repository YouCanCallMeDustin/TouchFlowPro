-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "assignedLevel" TEXT NOT NULL,
    "unlockedLevels" TEXT NOT NULL,
    "currentLessonId" TEXT,
    "totalPracticeTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "city" TEXT,
    "state" TEXT,
    "age" INTEGER,
    "photoUrl" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "subscriptionEndDate" DATETIME
);

-- CreateTable
CREATE TABLE "DrillResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "grossWPM" REAL NOT NULL,
    "netWPM" REAL NOT NULL,
    "accuracy" REAL NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fatigueScore" INTEGER,
    "fatigueFlags" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'drill',
    "idempotencyKey" TEXT,
    CONSTRAINT "DrillResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "planTier" TEXT NOT NULL DEFAULT 'FREE',
    "seatLimit" INTEGER NOT NULL DEFAULT 5,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "planStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" DATETIME
);

-- CreateTable
CREATE TABLE "OrgMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrgMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrgInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "OrgInvite_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpacedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "interval" INTEGER NOT NULL,
    "repetition" INTEGER NOT NULL,
    "efactor" REAL NOT NULL,
    "nextReview" DATETIME NOT NULL,
    CONSTRAINT "SpacedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyStreak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPracticeDate" DATETIME,
    "streakProtections" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomDrill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CustomDrill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "keyboardLayout" TEXT NOT NULL DEFAULT 'qwerty',
    "practiceReminders" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeyStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "avgSpeed" REAL NOT NULL DEFAULT 0,
    "lastPracticed" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SequenceStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sequence" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "avgSpeed" REAL NOT NULL DEFAULT 0,
    "lastPracticed" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SessionDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "keystrokes" TEXT NOT NULL,
    "liveMetrics" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "totalPracticeTime" INTEGER NOT NULL DEFAULT 0,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPracticeDate" DATETIME,
    "averageWPM" REAL NOT NULL DEFAULT 0,
    "averageAccuracy" REAL NOT NULL DEFAULT 100,
    "totalDrills" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "content" TEXT,
    "drillId" TEXT,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetWPM" INTEGER,
    "targetAccuracy" INTEGER,
    "targetTime" INTEGER,
    "xpReward" INTEGER NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "wpm" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "testDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "goalWpm" INTEGER NOT NULL,
    "goalAccuracy" INTEGER NOT NULL,
    "minutesPerDay" INTEGER NOT NULL DEFAULT 20,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "completedItemIds" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "fontScale" TEXT NOT NULL DEFAULT 'MD',
    "strictAccuracy" BOOLEAN NOT NULL DEFAULT true,
    "autoPauseIdle" BOOLEAN NOT NULL DEFAULT true,
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 30,
    "defaultFocus" TEXT NOT NULL DEFAULT 'BALANCED',
    "warmupSeconds" INTEGER NOT NULL DEFAULT 120,
    "reviewSeconds" INTEGER NOT NULL DEFAULT 300,
    "skillSeconds" INTEGER NOT NULL DEFAULT 600,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 120,
    "storeRawLogsPractice" BOOLEAN NOT NULL DEFAULT true,
    "storeRawLogsCurriculum" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "DrillResult_idempotencyKey_key" ON "DrillResult"("idempotencyKey");

-- CreateIndex
CREATE INDEX "DrillResult_userId_timestamp_idx" ON "DrillResult"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "DrillResult_mode_timestamp_idx" ON "DrillResult"("mode", "timestamp");

-- CreateIndex
CREATE INDEX "OrgMember_orgId_idx" ON "OrgMember"("orgId");

-- CreateIndex
CREATE INDEX "OrgMember_userId_idx" ON "OrgMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_orgId_userId_key" ON "OrgMember"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgInvite_token_key" ON "OrgInvite"("token");

-- CreateIndex
CREATE INDEX "OrgInvite_orgId_idx" ON "OrgInvite"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_badgeType_key" ON "Achievement"("userId", "badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStreak_userId_key" ON "DailyStreak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "KeyStats_userId_idx" ON "KeyStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KeyStats_userId_key_key" ON "KeyStats"("userId", "key");

-- CreateIndex
CREATE INDEX "SequenceStats_userId_type_idx" ON "SequenceStats"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SequenceStats_userId_sequence_key" ON "SequenceStats"("userId", "sequence");

-- CreateIndex
CREATE INDEX "SessionDetails_sessionId_idx" ON "SessionDetails"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE INDEX "UserProgress_userId_idx" ON "UserProgress"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_userId_dismissed_completed_idx" ON "Recommendation"("userId", "dismissed", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_date_key" ON "DailyChallenge"("date");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "TrainingPlan_userId_status_idx" ON "TrainingPlan"("userId", "status");

-- CreateIndex
CREATE INDEX "TrainingDay_planId_date_idx" ON "TrainingDay"("planId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
