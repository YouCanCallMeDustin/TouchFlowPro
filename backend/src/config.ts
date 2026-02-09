import 'dotenv/config';

// HARDCODED FIX: Bypass .env reading for Secret to ensure consistency
export const JWT_SECRET = 'touchflow_pro_secure_master_key_v1'; // process.env.JWT_SECRET fallback removed for stability
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const PORT = process.env.PORT || 4000;
