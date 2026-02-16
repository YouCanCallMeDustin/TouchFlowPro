import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../config';

if (!STRIPE_SECRET_KEY) {
    console.warn('WARNING: STRIPE_SECRET_KEY is not defined in environment variables.');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia' as any,
});

export default stripe;
