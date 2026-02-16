import prisma from './db';

/**
 * Resolves the effective subscription status for a user.
 * Checks direct user subscription first, then falls back to organization-inherited status.
 */
export async function getEffectiveSubscriptionStatus(userId: string): Promise<string> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionStatus: true }
        });

        if (!user) return 'free';

        // If already Pro/Enterprise directly, return that
        if (user.subscriptionStatus !== 'free') {
            return user.subscriptionStatus;
        }

        // Check Organization Inheritance
        const memberships = await prisma.orgMember.findMany({
            where: { userId: userId },
            include: { org: true }
        });

        let inheritedStatus = 'free';

        for (const m of memberships) {
            const org = m.org;
            const tier = (org as any).planTier;
            const status = (org as any).planStatus;

            // Tiers: FREE, STARTER, PRO, ENTERPRISE
            // status: ACTIVE, CANCELLED, etc.
            if (status === 'ACTIVE') {
                if (tier === 'ENTERPRISE') return 'enterprise';
                if (tier === 'PRO') inheritedStatus = 'pro';
                if (tier === 'STARTER' && inheritedStatus === 'free') inheritedStatus = 'starter';
            }
        }

        return inheritedStatus;
    } catch (error) {
        console.error(`[Subscription] Failed to resolve effective status for ${userId}:`, error);
        // Fallback to 'free' instead of crashing the whole login process
        return 'free';
    }
}
